/**
 * Copyright (c) Starisian Technologies. All rights reserved.
 *
 * This file is part of the SPARXSTAR platform and is proprietary and confidential.
 * Unauthorized copying, modification, distribution, or use of this file, via any medium,
 * is strictly prohibited except as expressly permitted in writing by Starisian Technologies.
 *
 * License: Business Source License 1.1
 * Change Date: January 1, 2036
 * Change License: Starisian Community License
 *
 * See the LICENSE file in the repository root for full license terms.
 */

/**
 * @file starmus-metadata-auto.js
 * @version 6.1.0
 * @description Syncs store state to hidden form fields automatically.
 * Protects PHP-injected values from being overwritten by empty JS state.
 * Also provides buildMetadataMap for schema validation tests.
 */

"use strict";

/**
 * Updates or creates a hidden form field, protecting existing non-empty values
 * from being overwritten by empty JS state.
 *
 * @param {HTMLFormElement} form - Target form element
 * @param {string} name - Input name attribute
 * @param {*} value - Value to set (objects are JSON-encoded)
 * @returns {void}
 */
function updateField(form, name, value) {
    let input = form.querySelector(`input[name="${name}"]`);

    if (!input) {
        input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        form.appendChild(input);
    }

    const stringValue =
        typeof value === "object" ? JSON.stringify(value) : String(value || "");

    // Safety guard: do not overwrite a non-empty server-injected value with an empty one.
    if (
        input.value &&
        input.value.trim() !== "" &&
        (stringValue === "" || stringValue === "{}" || stringValue === "[]")
    ) {
        return;
    }

    if (input.value !== stringValue) {
        input.value = stringValue;
    }
}

/**
 * Builds a flat metadata map from application state.
 * Used by initAutoMetadata and by tests to validate schema consistency.
 *
 * @param {Object} state - Application state from store
 * @returns {Object} Flat key→value map of form field names to state values
 */
export function buildMetadataMap(state) {
    const env = state.env || {};
    const cal = state.calibration || {};
    const source = state.source || {};
    const recorder = state.recorder || {};

    return {
        starmus_title: source.title || "",
        starmus_language: source.language || "",
        starmus_recording_type: source.recording_type || "",
        audio_file_type: (source.metadata && source.metadata.mimeType) || "",
        agreement_to_terms: "",
        _starmus_calibration: cal.complete
            ? { gain: cal.gain, speechLevel: cal.speechLevel, message: cal.message }
            : {},
        _starmus_env: env,
        recording_metadata: source.metadata || {},
        waveform_json: source.waveform || [],
        session_date: "",
        session_start_time: "",
        session_end_time: "",
        location: (env.device && env.device.location) || "",
        gps_coordinates: (env.device && env.device.gps) || "",
        interviewers_recorders: "",
        recording_equipment: (env.device && env.device.model) || "",
        audio_files_originals: source.fileName || "",
        media_condition_notes: "",
        related_consent_agreement: "",
        usage_restrictions_rights: "",
        audio_quality_score:
            cal.complete && cal.speechLevel
                ? cal.speechLevel > 60
                    ? "good"
                    : cal.speechLevel > 30
                      ? "warning"
                      : "poor"
                : "",
        access_level: "",
        device: (env.device && env.device.model) || "",
        transcript: source.transcript || "",
        duration: (recorder && recorder.duration) || 0,
    };
}

/**
 * Initialises automatic metadata synchronisation from store to form fields.
 *
 * @param {Object} store - Redux-style store with getState and subscribe
 * @param {HTMLFormElement} formEl - Form element to sync fields on
 * @param {Object} [_options] - Reserved for future use
 * @returns {function} Cleanup function — call on unmount
 */
export function initAutoMetadata(store, formEl, _options) {
    if (!store || !formEl) {
        console.warn("[StarmusMetadata] Store or Form missing.");
        return function () {};
    }

    function sync() {
        const state = store.getState();
        const map = buildMetadataMap(state);

        // Sync core fields
        updateField(formEl, "_starmus_calibration", map._starmus_calibration);
        updateField(formEl, "_starmus_env", map._starmus_env);

        if (map.recording_metadata) {
            updateField(formEl, "recording_metadata", map.recording_metadata);
        }

        if (map.transcript) {
            updateField(formEl, "transcription", map.transcript);
        }

        const source = state.source || {};
        if (source.transcriptJson) {
            updateField(formEl, "transcription_json", source.transcriptJson);
        }

        if (map.waveform_json && map.waveform_json.length > 0) {
            updateField(formEl, "waveform_json", map.waveform_json);
        }
    }

    sync();
    return store.subscribe(sync);
}
