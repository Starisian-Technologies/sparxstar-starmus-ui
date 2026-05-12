<?php

/**
 * User Detail Template (starmus-recording-detail-user.php)
 *
 * REFERENCE ONLY — do not execute in sparxstar-starmus-ui.
 * Documents the data contract for the Recording Detail (User) React screen.
 *
 * Data provided to the React component:
 * - recording: { id, title, date, languages[], recTypes[], playbackUrl,
 *                transcript, durationFormatted, processingStatus,
 *                userAgentDisplay, micProfileDisplay, location, accessionNumber }
 * - actions: { editUrl, recorderUrl }
 *
 * @package Starisian\Starmus\templates
 */
if ( ! defined('ABSPATH')) {
    exit;
}

use Starisian\Sparxstar\Starmus\core\StarmusSettings;
use Starisian\Sparxstar\Starmus\services\StarmusFileService;

try {
    $post_id = get_the_ID();
    if ( ! $post_id && isset($args['post_id'])) {
        $post_id = intval($args['post_id']);
    }
    if ( ! $post_id) { return; }

    $settings     = new StarmusSettings();
    $file_service = class_exists(\Starisian\Sparxstar\Starmus\services\StarmusFileService::class)
        ? new StarmusFileService()
        : null;

    $get_url = function (int $att_id) use ($file_service): string {
        if ($att_id <= 0) return '';
        try {
            if ($file_service instanceof \Starisian\Sparxstar\Starmus\services\StarmusFileService) {
                return $file_service->star_get_public_url($att_id);
            }
        } catch (\Throwable) {}
        return wp_get_attachment_url($att_id) ?: '';
    };

    // Audio attachments (new schema first, legacy fallback)
    $mastered_mp3_id = (int) get_field('mastered_mp3', $post_id) ?: (int) get_post_meta($post_id, '_audio_mp3_attachment_id', true);
    $original_id     = (int) get_field('original_source', $post_id) ?: (int) get_post_meta($post_id, '_audio_attachment_id', true);

    $mp3_url      = $get_url($mastered_mp3_id);
    $original_url = $get_url($original_id);
    $playback_url = $mp3_url ?: $original_url;

    // Transcript
    $transcript_raw  = get_post_meta($post_id, 'sparx_sparxstar_transcription_text', true);
    $transcript_text = '';
    if ( ! empty($transcript_raw)) {
        $decoded = is_string($transcript_raw) ? json_decode($transcript_raw, true) : $transcript_raw;
        $transcript_text = is_array($decoded) && isset($decoded['transcript'])
            ? $decoded['transcript']
            : $transcript_raw;
    }

    // Taxonomies
    $languages = get_the_terms($post_id, 'starmus_tax_language');
    $rec_types  = get_the_terms($post_id, 'recording-type');
} catch (\Throwable $throwable) {
    echo '<div class="starmus-alert starmus-alert--error"><p>' . esc_html__('Unable to load recording details.', 'starmus-audio-recorder') . '</p></div>';
    return;
}
?>

<main class="starmus-user-detail" id="starmus-record-<?php echo esc_attr((string) $post_id); ?>">

    <header class="starmus-header-clean">
        <h2 class="starmus-title"><?php echo esc_html(get_the_title($post_id)); ?></h2>
        <div class="starmus-meta-row">
            <?php if ( ! empty($languages) && ! is_wp_error($languages)) { ?>
                <span class="starmus-tag starmus-tag--lang"><?php echo esc_html($languages[0]->name); ?></span>
            <?php } ?>
            <?php if ( ! empty($rec_types) && ! is_wp_error($rec_types)) { ?>
                <span class="starmus-tag starmus-tag--type"><?php echo esc_html($rec_types[0]->name); ?></span>
            <?php } ?>
        </div>
    </header>

    <div class="starmus-layout-split">
        <div class="starmus-content-main">
            <section class="starmus-player-card sparxstar-glass-card">
                <?php if ($playback_url) { ?>
                    <audio controls preload="metadata" class="starmus-audio-full">
                        <source src="<?php echo esc_url($playback_url); ?>" type="<?php echo str_contains($playback_url, '.mp3') ? 'audio/mpeg' : 'audio/webm'; ?>">
                        <?php esc_html_e('Your browser does not support the audio player.', 'starmus-audio-recorder'); ?>
                    </audio>
                <?php } else { ?>
                    <p class="starmus-empty-msg"><?php esc_html_e('Audio is currently processing or unavailable.', 'starmus-audio-recorder'); ?></p>
                <?php } ?>
            </section>

            <?php if ($transcript_text) { ?>
                <section class="starmus-info-card sparxstar-glass-card">
                    <h4><?php esc_html_e('Transcription', 'starmus-audio-recorder'); ?></h4>
                    <div class="starmus-transcript-box">
                        <?php echo wp_kses_post(nl2br($transcript_text)); ?>
                    </div>
                </section>
            <?php } ?>
        </div>
    </div>

</main>
