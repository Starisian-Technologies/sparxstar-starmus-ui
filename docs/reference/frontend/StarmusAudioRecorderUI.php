<?php

declare(strict_types=1);
/**
 * Front-end presentation layer for the Starmus recorder experience.
 *
 * REFERENCE ONLY — do not execute in sparxstar-starmus-ui.
 * Documents the shortcode registration and template hydration contract that
 * must be honoured by the React implementation.
 *
 * Key contracts exposed here:
 * - STARMUS_BOOTSTRAP.pageType: 'recorder' | 'rerecorder'
 * - Hidden fields injected by JS: _starmus_env, _starmus_calibration,
 *   starmus_recording_metadata, starmus_waveform_json
 * - Taxonomy slugs: 'starmus_tax_language', 'recording-type'
 *
 * @package   Starisian\Sparxstar\Starmus\frontend
 */
namespace Starisian\Sparxstar\Starmus\frontend;

use function absint;
use Exception;
use Starisian\Sparxstar\Starmus\core\StarmusSettings;
use Starisian\Sparxstar\Starmus\helpers\StarmusLogger;
use Starisian\Sparxstar\Starmus\helpers\StarmusTemplateLoaderHelper;
use Throwable;
use function wp_get_object_terms;
use WP_Query;

if ( ! \defined('ABSPATH')) {
    exit;
}

class StarmusAudioRecorderUI
{
    public function __construct(private readonly ?StarmusSettings $settings)
    {
        $this->register_hooks();
    }

    private function register_hooks(): void
    {
        add_action('starmus_after_audio_upload', [$this, 'save_all_metadata'], 10, 3);
        add_filter('starmus_audio_upload_success_response', $this->add_conditional_redirect(...), 10, 3);
        add_action('create_starmus_tax_language', $this->clear_taxonomy_transients(...));
        add_action('edited_starmus_tax_language', $this->clear_taxonomy_transients(...));
        add_action('delete_starmus_tax_language', $this->clear_taxonomy_transients(...));
        add_action('create_recording-type', $this->clear_taxonomy_transients(...));
        add_action('edited_recording-type', $this->clear_taxonomy_transients(...));
        add_action('delete_recording-type', $this->clear_taxonomy_transients(...));
    }

    public function render_recorder_shortcode(): string
    {
        try {
            $template_args = [
                'form_id'         => 'starmus_recorder_form',
                'consent_message' => $this->settings instanceof StarmusSettings
                    ? $this->settings->get('consent_message', 'I consent to the terms and conditions.')
                    : 'I consent to the terms and conditions.',
                'data_policy_url' => $this->settings instanceof StarmusSettings
                    ? $this->settings->get('data_policy_url', '')
                    : '',
                'recording_types' => $this->get_cached_terms('recording-type', 'starmus_recording_types_list'),
                'languages'       => $this->get_cached_terms('starmus_tax_language', 'starmus_languages_list'),
            ];
            return StarmusTemplateLoaderHelper::secure_render_template('starmus-audio-recorder-ui.php', $template_args);
        } catch (Throwable $throwable) {
            StarmusLogger::log($throwable);
            return '<p>' . esc_html__('The audio recorder is temporarily unavailable.', 'starmus-audio-recorder') . '</p>';
        }
    }

    public function render_re_recorder_shortcode(array $atts = []): string
    {
        try {
            $atts = shortcode_atts(['post_id' => 0, 'script_id' => 0], $atts, 'starmus_audio_re_recorder');
            $post_id   = absint($atts['post_id']);
            $script_id = absint($atts['script_id']);

            if ($post_id <= 0 && isset($_GET['recording_id'])) {
                $post_id = absint($_GET['recording_id']); // phpcs:ignore
            }

            if ($post_id <= 0 && $script_id <= 0) {
                return '<p>' . esc_html__('No recording specified.', 'starmus-audio-recorder') . '</p>';
            }

            $template_args = [
                'post_id'        => $post_id,
                'script_id'      => $script_id,
                'existing_title' => $post_id > 0 ? (get_post($post_id)?->post_title ?? '') : '',
                'consent_message' => $this->settings instanceof StarmusSettings
                    ? $this->settings->get('consent_message', 'I consent to the terms and conditions.')
                    : 'I consent to the terms and conditions.',
                'data_policy_url' => $this->settings instanceof StarmusSettings
                    ? $this->settings->get('data_policy_url', '')
                    : '',
            ];

            return StarmusTemplateLoaderHelper::secure_render_template('starmus-audio-re-recorder-ui.php', $template_args);
        } catch (Throwable $throwable) {
            StarmusLogger::log($throwable);
            return '<p>' . esc_html__('The re-recorder is temporarily unavailable.', 'starmus-audio-recorder') . '</p>';
        }
    }

    private function get_cached_terms(string $taxonomy, string $cache_key): array
    {
        $terms = get_transient($cache_key);
        if (false === $terms) {
            $terms = get_terms(['taxonomy' => $taxonomy, 'hide_empty' => false]);
            if ( ! is_wp_error($terms)) {
                set_transient($cache_key, $terms, 12 * HOUR_IN_SECONDS);
            } else {
                $terms = [];
            }
        }
        return \is_array($terms) ? $terms : [];
    }

    public function clear_taxonomy_transients(): void
    {
        delete_transient('starmus_languages_list');
        delete_transient('starmus_recording_types_list');
    }

    public function add_conditional_redirect(array $response, int $post_id, array $form_data): array
    {
        if ( ! $this->settings instanceof StarmusSettings) { return $response; }
        $page_setting = $this->settings->get('my_recordings_page_id');
        $page_id = is_array($page_setting) && $page_setting !== []
            ? (int) reset($page_setting)
            : (int) $page_setting;
        if ($page_id > 0) {
            $response['redirect_url'] = get_permalink($page_id);
        }
        return $response;
    }
}
