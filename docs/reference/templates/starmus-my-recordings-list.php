<?php

/**
 * Starmus Recordings List Template
 *
 * REFERENCE ONLY — do not execute in sparxstar-starmus-ui.
 * Documents the data contract for the My Recordings List React screen.
 *
 * Data provided to the React component:
 * - recordings[]: { id, title, date, recordingType, language, audioUrl, mimeType,
 *                   durationFormatted, editUrl, detailUrl }
 * - pagination: { currentPage, totalPages, links[] }
 *
 * @var WP_Query $query         The custom query object containing recordings.
 * @var string   $edit_page_url (Optional) URL to the edit page.
 */
if ( ! defined('ABSPATH')) {
    exit;
}

use Starisian\Sparxstar\Starmus\services\StarmusFileService;

$file_service = class_exists(\Starisian\Sparxstar\Starmus\services\StarmusFileService::class)
    ? new StarmusFileService()
    : null;

if ($query->have_posts()) { ?>

    <section aria-labelledby="starmus-recordings-heading">
        <h2 id="starmus-recordings-heading" class="starmus-visually-hidden">
            <?php esc_html_e('Your audio recordings', 'starmus-audio-recorder'); ?>
        </h2>

        <div class="starmus-recordings-grid">
            <?php while ($query->have_posts()) {
                $query->the_post();
                $current_post_id = get_the_ID();
                $post_title      = get_the_title();

                $master_id   = (int) get_post_meta($current_post_id, 'mastered_mp3', true);
                $original_id = (int) get_post_meta($current_post_id, 'audio_files_originals', true);
                $legacy_id   = (int) get_post_meta($current_post_id, '_audio_attachment_id', true);
                $audio_att_id = $master_id ?: ($original_id ?: $legacy_id);

                $audio_url = '';
                if ($audio_att_id > 0) {
                    try {
                        $audio_url = $file_service instanceof \Starisian\Sparxstar\Starmus\services\StarmusFileService
                            ? $file_service->star_get_public_url($audio_att_id)
                            : wp_get_attachment_url($audio_att_id);
                    } catch (\Throwable) {
                        $audio_url = wp_get_attachment_url($audio_att_id);
                    }
                }

                $mime_type = 'audio/mpeg';
                if ($audio_url) {
                    $ext = strtolower(pathinfo(parse_url($audio_url, PHP_URL_PATH), PATHINFO_EXTENSION));
                    if ('wav' === $ext)  { $mime_type = 'audio/wav'; }
                    if ('webm' === $ext) { $mime_type = 'audio/webm'; }
                    if ('m4a' === $ext)  { $mime_type = 'audio/mp4'; }
                }

                $recording_type = get_the_terms($current_post_id, 'recording-type');
                $language       = get_the_terms($current_post_id, 'language');
                $duration_sec   = get_post_meta($current_post_id, 'audio_duration', true);
                $duration_formatted = '';
                if ($duration_sec) {
                    $duration_formatted = gmdate('i:s', intval($duration_sec));
                } elseif ($audio_att_id !== 0) {
                    $att_meta = wp_get_attachment_metadata($audio_att_id);
                    if (isset($att_meta['length_formatted'])) {
                        $duration_formatted = $att_meta['length_formatted'];
                    } elseif (isset($att_meta['length'])) {
                        $duration_formatted = gmdate('i:s', intval($att_meta['length']));
                    }
                }
            ?>

            <article class="starmus-card sparxstar-glass-card" aria-labelledby="card-title-<?php echo intval($current_post_id); ?>">
                <div class="starmus-card__header">
                    <h3 id="card-title-<?php echo intval($current_post_id); ?>" class="starmus-card__title">
                        <a href="<?php echo esc_url(add_query_arg(['view' => 'detail', 'recording_id' => $current_post_id])); ?>" class="starmus-card__link">
                            <?php echo esc_html($post_title); ?>
                        </a>
                    </h3>
                    <div class="starmus-card__meta">
                        <span class="starmus-card__date">
                            <time datetime="<?php echo esc_attr(get_the_date('c')); ?>">
                                <?php echo esc_html(get_the_date('M j, Y')); ?>
                            </time>
                        </span>
                        <?php if ( ! empty($recording_type) && ! is_wp_error($recording_type)) { ?>
                            <span class="starmus-card__type"><?php echo esc_html($recording_type[0]->name); ?></span>
                        <?php } ?>
                        <?php if ( ! empty($language) && ! is_wp_error($language)) { ?>
                            <span class="starmus-card__language"><?php echo esc_html($language[0]->name); ?></span>
                        <?php } ?>
                    </div>
                </div>

                <?php if ($audio_url) { ?>
                    <div class="starmus-card__audio">
                        <audio controls preload="none" class="starmus-audio-player" style="width: 100%;">
                            <source src="<?php echo esc_url($audio_url); ?>" type="<?php echo esc_attr($mime_type); ?>">
                            <?php esc_html_e('Your browser does not support the audio element.', 'starmus-audio-recorder'); ?>
                        </audio>
                        <?php if ($duration_formatted) { ?>
                            <div class="starmus-card__duration" aria-hidden="true"><?php echo esc_html($duration_formatted); ?></div>
                        <?php } ?>
                    </div>
                <?php } ?>

                <div class="starmus-card__actions">
                    <a href="<?php echo esc_url(add_query_arg(['view' => 'detail', 'recording_id' => $current_post_id])); ?>" class="starmus-btn starmus-btn--primary">
                        <?php esc_html_e('View Details', 'starmus-audio-recorder'); ?>
                    </a>
                </div>
            </article>

            <?php } ?>
        </div>
    </section>

<?php } else { ?>
    <div class="starmus-no-recordings">
        <p><?php esc_html_e('You have not submitted any recordings yet.', 'starmus-audio-recorder'); ?></p>
    </div>
<?php } ?>
<?php wp_reset_postdata(); ?>
