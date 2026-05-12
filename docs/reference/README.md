# Reference Files

These files are **read-only reference material** carried over from
`sparxstar-starmus-audio`. They are **not executed** in this package.

## Purpose

| Directory    | Contents                                    | Use                                      |
|--------------|---------------------------------------------|------------------------------------------|
| `templates/` | PHP Blade-style templates (6 files)         | Data-contract spec for React screens     |
| `frontend/`  | PHP controller classes (3 files)            | Shortcode + submission contract reference|

## Templates → React Screens

| PHP template                          | React screen                     |
|---------------------------------------|----------------------------------|
| `starmus-audio-recorder-ui.php`       | Recorder (create mode)           |
| `starmus-audio-re-recorder-ui.php`    | Re-recorder (update mode)        |
| `starmus-consent-form.php`            | Consent / legal sign-wrap        |
| `starmus-my-recordings-list.php`      | My Recordings list               |
| `starmus-recording-detail-user.php`   | Recording detail (contributor)   |
| `starmus-recording-detail-admin.php`  | Recording detail (admin/staff)   |

## Frontend PHP → Data Contracts

| PHP class                   | Contract documented                    |
|-----------------------------|----------------------------------------|
| `StarmusAudioRecorderUI.php`| Shortcode args, taxonomy slugs, hidden fields |
| `StarmusConsentUI.php`      | POST field names, MIME allowlist, redirect flow |
| `StarmusProsodyPlayer.php`  | `StarmusProsodyData` bootstrap object, AJAX endpoints |

## Key Data Contracts (Summary)

### Bootstrap object (injected by PHP before JS loads)
```js
window.STARMUS_BOOTSTRAP = {
  pageType:   'recorder' | 'rerecorder' | 'editor',
  postId:     number | null,
  restUrl:    string,
  canCommit:  boolean,
  transcript: array | null,
  audioUrl:   string | null,
};
```

### Hidden form fields injected by JS
```
_starmus_env               — JSON: normalised UEC environment object
_starmus_calibration       — JSON: gain, sampleRate, snr, tier
starmus_recording_metadata — JSON: full metadata map
starmus_waveform_json      — JSON: waveform data (Tier A only)
```

### Prosody bootstrap object
```js
window.StarmusProsodyData = {
  source:    string,   // raw script text with | silence markers
  density:   number,   // max chars per prosodic unit (default 28)
  startPace: number,   // saved pace in ms (0 = uncalibrated)
  postID:    number,   // WordPress post ID for pace persistence
  nonce:     string,   // wp_create_nonce('starmus_save_pace')
};
```
