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
 * @file starmus-enhanced-calibration.js
 * @version 1.0.1
 * @description Enhanced microphone calibration with phase correction and Tier mapping.
 * Performs tier-appropriate audio analysis to set optimal recording gain.
 */

"use strict";

import { sparxstarIntegration } from "./starmus-sparxstar-integration.js";

/**
 * Tier-based calibration settings.
 * @type {Object}
 */
const TIER_SETTINGS = {
    A: {
        duration: 15000,
        phases: 3,
        noiseThreshold: 5,
        speechThreshold: 20,
        sampleRate: 16000,
        fftSize: 2048,
        smoothing: 0.8,
        gainRange: [0.5, 2.0],
        autoGainControl: true,
    },
    B: {
        duration: 10000,
        phases: 2,
        noiseThreshold: 8,
        speechThreshold: 15,
        sampleRate: 16000,
        fftSize: 1024,
        smoothing: 0.6,
        gainRange: [0.7, 1.5],
        autoGainControl: true,
    },
    C: {
        duration: 5000,
        phases: 1,
        noiseThreshold: 12,
        speechThreshold: 10,
        sampleRate: 16000,
        fftSize: 512,
        smoothing: 0.4,
        gainRange: [0.8, 1.2],
        autoGainControl: false,
    },
};

class EnhancedCalibration {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.calibrationData = null;
        this.tier = "C";
        this.environmentData = null;
    }

    /**
     * Initialises calibration with environment data from SPARXSTAR.
     *
     * @returns {Promise<EnhancedCalibration>} this
     */
    async init() {
        this.environmentData = sparxstarIntegration.getEnvironmentData();
        this.tier = this.environmentData?.tier || "C";
        return this;
    }

    /**
     * Returns tier-specific calibration settings.
     *
     * @returns {Object} Settings object
     */
    getTierSettings() {
        return TIER_SETTINGS[this.tier] || TIER_SETTINGS.C;
    }

    /**
     * Performs calibration on the provided media stream.
     *
     * @param {MediaStream} stream - Live microphone stream
     * @param {function} onUpdate - Callback(message, volume, complete, data)
     * @returns {Promise<Object>} Calibration result
     */
    async performCalibration(stream, onUpdate) {
        const settings = this.getTierSettings();

        try {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                    sampleRate: settings.sampleRate,
                    latencyHint: "interactive",
                });
            } catch (_sampleRateError) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                    latencyHint: "interactive",
                });
                sparxstarIntegration.reportError("calibration_samplerate_fallback", {
                    tier: this.tier,
                    requestedSampleRate: settings.sampleRate,
                    error: _sampleRateError.message,
                });
            }

            if (this.audioContext.state === "suspended") {
                await this.audioContext.resume();
            }

            this.source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = settings.fftSize;
            this.analyser.smoothingTimeConstant = settings.smoothing;
            this.source.connect(this.analyser);

            const result = await this.runTierBasedCalibration(settings, onUpdate);

            sparxstarIntegration.reportError("calibration_completed", {
                tier: this.tier,
                actualSampleRate: this.audioContext.sampleRate,
                duration: settings.duration,
                result,
            });

            return result;
        } catch (error) {
            console.error("[EnhancedCalibration] Fatal:", error);
            sparxstarIntegration.reportError("calibration_failed", {
                error: error.message,
                tier: this.tier,
            });
            throw error;
        } finally {
            this.cleanup();
        }
    }

    /**
     * Runs the calibration measurement loop.
     *
     * @param {Object} settings - Tier settings
     * @param {function} onUpdate - Progress callback
     * @returns {Promise<Object>} Calibration result
     */
    async runTierBasedCalibration(settings, onUpdate) {
        const data = new Uint8Array(this.analyser.fftSize);
        const startTime = Date.now();

        let maxVolume = 0;
        let minVolume = 100;
        let avgVolume = 0;
        let sampleCount = 0;
        let noiseFloor = 0;
        const speechPeaks = [];

        const phaseDuration = settings.duration / settings.phases;
        let currentPhase = 0;

        return new Promise((resolve) => {
            const loop = () => {
                const elapsed = Date.now() - startTime;
                const phaseElapsed = elapsed % phaseDuration;
                const newPhase = Math.floor(elapsed / phaseDuration);

                if (newPhase !== currentPhase) {
                    currentPhase = newPhase;
                }

                this.analyser.getByteTimeDomainData(data);

                let sumSquares = 0;
                for (let i = 0; i < data.length; i++) {
                    const centered = data[i] - 128;
                    sumSquares += centered * centered;
                }

                const rms = Math.sqrt(sumSquares / data.length) / 128;
                const db = 20 * Math.log10(Math.max(rms, 1e-6));
                const volume = Math.min(100, Math.max(0, ((db + 60) / 60) * 100));

                sampleCount++;
                avgVolume = (avgVolume * (sampleCount - 1) + volume) / sampleCount;
                if (volume > maxVolume) {
                    maxVolume = volume;
                }
                if (volume < minVolume) {
                    minVolume = volume;
                }

                const progress = (elapsed / settings.duration) * 100;
                let message;

                switch (currentPhase) {
                    case 0:
                        if (volume < settings.noiseThreshold) {
                            noiseFloor = Math.max(noiseFloor, volume);
                        }
                        message =
                            this.tier === "C"
                                ? "Quick setup..."
                                : `Phase 1: Measuring background noise (${Math.ceil((phaseDuration - phaseElapsed) / 1000)}s)`;
                        break;
                    case 1:
                        if (volume > settings.speechThreshold) {
                            speechPeaks.push(volume);
                        }
                        message = "Phase 2: Speak your name clearly...";
                        break;
                    case 2:
                        message = "Phase 3: Optimising settings...";
                        break;
                    default:
                        message = "Calibration complete";
                }

                if (onUpdate) {
                    onUpdate(message, Math.min(volume, 100), false, {
                        phase: currentPhase + 1,
                        totalPhases: settings.phases,
                        progress: Math.min(progress, 100),
                        tier: this.tier,
                    });
                }

                if (elapsed >= settings.duration) {
                    const avgSpeechLevel =
                        speechPeaks.length > 0
                            ? speechPeaks.reduce((a, b) => a + b, 0) / speechPeaks.length
                            : maxVolume;
                    const dynamicRange = maxVolume - noiseFloor;
                    const signalToNoise = avgSpeechLevel / Math.max(noiseFloor, 1);
                    const optimalGain = this._calculateOptimalGain(
                        avgSpeechLevel,
                        noiseFloor,
                        dynamicRange,
                        settings,
                    );

                    const result = {
                        complete: true,
                        tier: this.tier,
                        gain: optimalGain,
                        speechLevel: avgSpeechLevel,
                        noiseFloor,
                        dynamicRange,
                        signalToNoise,
                        sampleCount,
                        duration: elapsed,
                        phases: settings.phases,
                        quality: this._assessQuality(dynamicRange, signalToNoise, settings),
                        recommendations: this._generateRecommendations(
                            dynamicRange,
                            signalToNoise,
                            settings,
                        ),
                    };

                    if (onUpdate) {
                        onUpdate("Calibration complete!", 0, true, result);
                    }
                    resolve(result);
                    return;
                }

                requestAnimationFrame(loop);
            };

            loop();
        });
    }

    /**
     * Calculates optimal recording gain.
     * @private
     */
    _calculateOptimalGain(speechLevel, noiseFloor, _dynamicRange, settings) {
        const targetLevel = 60;
        const baseGain = targetLevel / Math.max(speechLevel, 1);
        const [minGain, maxGain] = settings.gainRange;
        let gain = Math.max(minGain, Math.min(maxGain, baseGain));

        if (noiseFloor > 15) {
            gain *= 0.9;
        } else if (noiseFloor < 5) {
            gain *= 1.1;
        }

        if (this.environmentData?.network?.type === "very_low") {
            gain *= 0.8;
        }

        return Math.round(gain * 100) / 100;
    }

    /**
     * Assesses calibration quality.
     * @private
     */
    _assessQuality(dynamicRange, signalToNoise, _settings) {
        let score = 0;
        if (dynamicRange > 40) {
            score += 3;
        } else if (dynamicRange > 20) {
            score += 2;
        } else if (dynamicRange > 10) {
            score += 1;
        }
        if (signalToNoise > 5) {
            score += 3;
        } else if (signalToNoise > 3) {
            score += 2;
        } else if (signalToNoise > 2) {
            score += 1;
        }
        const maxScore = this.tier === "A" ? 6 : this.tier === "B" ? 5 : 4;
        const pct = (score / maxScore) * 100;
        if (pct >= 80) {
            return "excellent";
        }
        if (pct >= 60) {
            return "good";
        }
        if (pct >= 40) {
            return "fair";
        }
        return "poor";
    }

    /**
     * Generates user-facing recommendations.
     * @private
     */
    _generateRecommendations(dynamicRange, signalToNoise, settings) {
        const recs = [];
        if (dynamicRange < 15) {
            recs.push("Consider moving to a quieter location");
        }
        if (signalToNoise < 2) {
            recs.push("Speak closer to the microphone");
        }
        if (this.tier === "C" && this.environmentData?.network?.type === "very_low") {
            recs.push("Recording optimised for your network conditions");
        }
        if (settings.autoGainControl && dynamicRange > 50) {
            recs.push("Automatic gain control will help maintain consistent levels");
        }
        return recs;
    }

    /**
     * Releases audio resources.
     */
    cleanup() {
        try {
            if (this.source) {
                this.source.disconnect();
                this.source = null;
            }
            if (this.analyser) {
                this.analyser.disconnect();
                this.analyser = null;
            }
            if (this.audioContext && this.audioContext.state !== "closed") {
                this.audioContext.close();
                this.audioContext = null;
            }
        } catch (err) {
            console.warn("[EnhancedCalibration] Cleanup error:", err);
        }
    }
}

export { EnhancedCalibration };
