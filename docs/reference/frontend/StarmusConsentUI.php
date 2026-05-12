<?php

declare(strict_types=1);
namespace Starisian\Sparxstar\Starmus\frontend;

/**
 * StarmusConsentUI — PHP controller for the consent form.
 *
 * REFERENCE ONLY — do not execute in sparxstar-starmus-ui.
 * Documents the consent form submission contract that must be honoured by the
 * React implementation:
 *
 * POST fields expected:
 * - starmus_consent_nonce      (wp_nonce_field 'starmus_consent_action')
 * - sparxstar_legal_name       (sanitise: sanitize_text_field + trim)
 * - sparxstar_email            (sanitise: sanitize_email)
 * - sparxstar_terms_type       ('signwrap' | 'clickwrap')
 * - sparxstar_terms_purpose    ('contribute' | 'interview')
 * - sparxstar_signatory_fingerprint_id  (max 128 chars)
 * - sparxstar_lat / sparxstar_lng       (float, finite only)
 * - starmus_contributor_signature       (file: image/png | image/jpeg | image/webp, max 5 MB)
 *
 * On success: redirect to recorder page with ?starmus_recording_id=&starmus_status=signed
 * On failure: redirect back with ?starmus_error=<code>&starmus_detail=<msg>
 *
 * @package Starisian\Sparxstar\Starmus\frontend
 */
if ( ! \defined('ABSPATH')) {
    exit;
}

use RuntimeException;
use Starisian\Sparxstar\Starmus\core\StarmusConsentHandler;
use Starisian\Sparxstar\Starmus\core\StarmusSettings;
use Starisian\Sparxstar\Starmus\helpers\StarmusTemplateLoaderHelper;
use Throwable;

class StarmusConsentUI
{
    private const MAX_UPLOAD_SIZE      = 5 * 1024 * 1024; // 5 MB
    private const CONSENT_STYLE_HANDLE = 'starmus-consent-style';
    private const CONSENT_SCRIPT_HANDLE = 'starmus-consent-script';
    private const ALLOWED_MIMES        = ['image/png', 'image/jpeg', 'image/webp'];

    private ?StarmusConsentHandler $handler = null;
    private ?StarmusSettings $settings = null;

    public function __construct(StarmusConsentHandler $handler, StarmusSettings $settings)
    {
        $this->handler  = $handler;
        $this->settings = $settings;
    }

    public function register_hooks(): void
    {
        add_action('template_redirect', $this->handle_submission(...), 20);
    }

    public function render_shortcode(): string
    {
        $this->enqueue_assets();
        return StarmusTemplateLoaderHelper::secure_render_template('starmus-consent-form.php');
    }

    public function handle_submission(): void
    {
        global $wpdb;

        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || ! isset($_POST['starmus_consent_action'])) {
            return;
        }

        if ( ! wp_verify_nonce($_POST['starmus_consent_nonce'] ?? '', 'starmus_consent_action')) {
            wp_die('Security check failed (Nonce).', 'Starmus Security', ['response' => 403]);
        }

        if ( ! is_user_logged_in()) {
            wp_die('You must be logged in to sign this agreement.', 'Starmus Security', ['response' => 403]);
        }

        // Load WordPress media helpers (front-end context may not auto-load them)
        if ( ! \function_exists('media_handle_upload')) {
            require_once ABSPATH . 'wp-admin/includes/image.php';
            require_once ABSPATH . 'wp-admin/includes/file.php';
            require_once ABSPATH . 'wp-admin/includes/media.php';
        }

        $legal_name  = trim(sanitize_text_field(wp_unslash($_POST['sparxstar_legal_name'] ?? '')));
        $email       = sanitize_email(wp_unslash($_POST['sparxstar_email'] ?? ''));
        $terms_type  = sanitize_text_field(wp_unslash($_POST['sparxstar_terms_type'] ?? 'clickwrap'));
        $purpose     = sanitize_text_field(wp_unslash($_POST['sparxstar_terms_purpose'] ?? 'contribute'));
        $fingerprint = substr(trim(sanitize_text_field(wp_unslash($_POST['sparxstar_signatory_fingerprint_id'] ?? ''))), 0, 128);

        $lat = null;
        $lng = null;
        if ($_POST['sparxstar_lat'] ?? '' !== '') { $lat = (float) wp_unslash($_POST['sparxstar_lat']); }
        if ($_POST['sparxstar_lng'] ?? '' !== '') { $lng = (float) wp_unslash($_POST['sparxstar_lng']); }

        if ($legal_name === '' || empty($email) || ! is_email($email)) {
            $this->redirect_with_error('missing_required_fields');
            return;
        }

        $attachment_id = 0;
        if ( ! empty($_FILES['starmus_contributor_signature']['name'])) {
            $file = $_FILES['starmus_contributor_signature'];
            if ($file['size'] > self::MAX_UPLOAD_SIZE) { $this->redirect_with_error('file_too_large'); return; }
            $check = wp_check_filetype_and_ext($file['tmp_name'], $file['name']);
            if (empty($check['type']) || ! \in_array($check['type'], self::ALLOWED_MIMES, true)) { $this->redirect_with_error('invalid_file_type'); return; }
            $upload_id = media_handle_upload('starmus_contributor_signature', 0);
            if (is_wp_error($upload_id)) { $this->redirect_with_error('upload_failed'); return; }
            $attachment_id = $upload_id;
        }

        if ($terms_type === 'signwrap' && empty($attachment_id)) {
            $this->redirect_with_error('signature_required');
            return;
        }

        // Raw transaction queries: no dynamic input, cannot use $wpdb->prepare()
        $wpdb->query('START TRANSACTION');
        $recording_id = 0;
        try {
            $contributor_id = $this->handler->get_or_create_contributor($legal_name, $email);
            if (is_wp_error($contributor_id)) { throw new RuntimeException('contributor_error'); }

            $consent_data = [
                'sparxstar_terms_type'                => $terms_type,
                'sparxstar_terms_purpose'             => $purpose,
                'signatory_name'                      => $legal_name,
                'sparxstar_authorized_signatory'      => $contributor_id,
                'user'                                => get_current_user_id(),
                'sparxstar_signatory_fingerprint_id'  => $fingerprint,
                'sparxstar_agreement_signature'       => $attachment_id ?: '',
            ];

            if ($lat !== null && $lng !== null && is_finite($lat) && is_finite($lng)) {
                $consent_data['sparxstar_signatory_geolocation'] = ['lat' => $lat, 'lng' => $lng];
            }

            $recording_id = $this->handler->create_legal_record('audio-recording', $consent_data, null);
            if (is_wp_error($recording_id)) { throw new RuntimeException('recording_failed'); }

            $wpdb->query('COMMIT');
        } catch (Throwable $throwable) {
            $wpdb->query('ROLLBACK');
            if ($attachment_id) { wp_delete_attachment($attachment_id, true); }
            $this->redirect_with_error('transaction_failed', $throwable->getMessage());
            return;
        }

        nocache_headers();
        $recorder_page_id = (int) $this->settings->get('recorder_page_id');
        $redirect_url     = $recorder_page_id ? get_permalink($recorder_page_id) : home_url();
        $redirect_url     = add_query_arg(['starmus_recording_id' => $recording_id, 'starmus_status' => 'signed'], $redirect_url);
        wp_safe_redirect($redirect_url);
        exit;
    }

    private function redirect_with_error(string $error_code, string $detail = ''): void
    {
        nocache_headers();
        $referer     = wp_get_referer();
        $target_url  = $referer && wp_validate_redirect($referer, home_url()) ? $referer : home_url();
        $url         = add_query_arg(['starmus_error' => $error_code, 'starmus_detail' => sanitize_text_field($detail)], $target_url);
        wp_safe_redirect($url);
        exit;
    }

    private function enqueue_assets(): void
    {
        $url  = \defined('STARMUS_URL')  ? STARMUS_URL  : '';
        $path = \defined('STARMUS_PATH') ? STARMUS_PATH : '';
        if ($url !== '' && $path !== '' && file_exists($path . 'dist/starmus-audio.css')) {
            wp_enqueue_style(self::CONSENT_STYLE_HANDLE, $url . 'dist/starmus-consent.css', [], (string) filemtime($path . 'dist/starmus-consent.css'));
        }
    }
}
