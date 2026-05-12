<?php

/**
 * Starmus Re-Recorder UI Template
 *
 * NOTE: DESIGN INTENT
 * This template operates in "update mode" but intentionally mimics the standard
 * recorder UI to reduce user friction. Users do not need to know they are
 * "replacing" a file; they just need to provide a new one.
 * The explicit "Re-Record" context is hidden by design.
 *
 * REFERENCE ONLY — do not execute in sparxstar-starmus-ui.
 * This file documents the data contract for the Re-Recorder React screen.
 *
 * @see docs/reference/frontend/StarmusAudioRecorderUI.php for the PHP controller
 * @version 1.0.2-DATA-SAFE
 */
if ( ! defined('ABSPATH')) {
    exit;
}

/** @var int $post_id */
/** @var string $existing_title */

$instance_id = 'starmus_form_' . sanitize_key('rerecord_' . wp_generate_uuid4());

$allowed_file_types ??= 'webm';
$allowed_types_arr = array_values(array_filter(array_map(trim(...), explode(',', (string) $allowed_file_types)), fn ($v): bool => $v !== ''));
$is_admin = current_user_can('manage_options');
$consent_message ??= __('By submitting this recording, you agree to our', 'starmus-audio-recorder');
$data_policy_url ??= '';
?>
<div class="starmus-audio-re-recorder-wrapper" data-starmus="recorder" data-starmus-mode="update" data-starmus-instance="<?php echo esc_attr($instance_id); ?>">
    <div class="starmus-recorder-form sparxstar-glass-card">
        <form
            id="<?php echo esc_attr($instance_id); ?>"
            class="starmus-audio-form"
            method="post"
            enctype="multipart/form-data"
            novalidate
            data-starmus="recorder"
            data-starmus-mode="update"
            data-starmus-instance="<?php echo esc_attr($instance_id); ?>">

            <!-- HIDDEN FIELDS: Props propagated from Shortcode/UI -->
            <input type="hidden" name="dc_creator" value="<?php echo esc_attr($existing_title ?? ''); ?>">
            <input type="hidden" name="artifact_id" value="<?php echo esc_attr((string) ($script_id ?? 0)); ?>">
            <input type="hidden" name="post_id" value="<?php echo esc_attr((string) ($post_id ?? 0)); ?>">

            <div id="starmus_step1_<?php echo esc_attr($instance_id); ?>" class="starmus-step" data-starmus-step="1">
                <h2><?php esc_html_e('Initial Setup', 'starmus-audio-recorder'); ?></h2>

                <input type="hidden" name="action" value="starmus_update_audio">
                <input type="hidden" name="audio_file_type" value="audio/webm">
                <input type="hidden" name="_starmus_env" value="">
                <input type="hidden" name="_starmus_calibration" value="">
                <input type="hidden" name="starmus_recording_metadata" value="">

                <fieldset class="starmus-consent-fieldset">
                    <legend class="starmus-fieldset-legend">
                        <?php esc_html_e('Consent Agreement', 'starmus-audio-recorder'); ?>
                    </legend>
                    <div class="starmus-consent-field">
                        <input type="checkbox" id="starmus_consent_<?php echo esc_attr($instance_id); ?>" name="agreement_to_terms_toggle" value="1" required>
                        <label for="starmus_consent_<?php echo esc_attr($instance_id); ?>">
                            <?php echo wp_kses_post($consent_message); ?>
                        </label>
                    </div>
                </fieldset>

                <button type="button" class="starmus-btn starmus-btn--primary" data-starmus-action="next">
                    <?php esc_html_e('Proceed to Recorder', 'starmus-audio-recorder'); ?>
                </button>
            </div>

            <div id="starmus_step2_<?php echo esc_attr($instance_id); ?>" class="starmus-step starmus-step-2" style="display:none;" data-starmus-step="2">
                <div class="starmus-mic-stage">
                    <div class="starmus-recorder-controls">
                        <button type="button" class="starmus-btn starmus-btn--record starmus-btn--large" data-starmus-action="record">
                            <?php esc_html_e('⬤ REC', 'starmus-audio-recorder'); ?>
                        </button>
                        <button type="button" class="starmus-btn starmus-btn--stop starmus-btn--large" data-starmus-action="stop" style="display:none;">
                            <?php esc_html_e('■ STOP', 'starmus-audio-recorder'); ?>
                        </button>
                        <button type="button" class="starmus-btn starmus-btn--pause starmus-btn--large" data-starmus-action="pause" style="display:none;">
                            <?php esc_html_e('PAUSE', 'starmus-audio-recorder'); ?>
                        </button>
                        <button type="button" class="starmus-btn starmus-btn--resume starmus-btn--large" data-starmus-action="resume" style="display:none;">
                            <?php esc_html_e('RESUME', 'starmus-audio-recorder'); ?>
                        </button>
                        <div data-starmus-transcript style="display:none;" role="log" aria-live="polite"></div>
                    </div>

                    <button type="submit" class="starmus-btn starmus-btn--primary starmus-btn--full" data-starmus-action="submit" disabled>
                        <?php esc_html_e('Save Replacement', 'starmus-audio-recorder'); ?>
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>
