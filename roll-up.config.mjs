import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";

const sharedPlugins = [
    {
        name: "starmus-native-url-parse",
        resolveId(source) {
            if (source === "url-parse") {
                return "\0starmus-native-url-parse";
            }
            return null;
        },
        load(id) {
            if (id === "\0starmus-native-url-parse") {
                return `function createUrlResult(address, location) {
    if (typeof URL === "function") {
        return new URL(address, location);
    }

    const resolver = document.createElement("a");
    resolver.href = location || window.location.href;

    const doc = document.implementation.createHTMLDocument("");
    const base = doc.createElement("base");
    const anchor = doc.createElement("a");

    doc.head.appendChild(base);
    doc.body.appendChild(anchor);
    base.href = resolver.href;
    anchor.href = address;

    return {
        toString() {
            return anchor.href;
        },
    };
}

export default function URLParse(address, location) {
    return createUrlResult(address, location);
}`;
            }
            return null;
        },
    },

    resolve({
        browser: true,
        preferBuiltins: false,
    }),

    commonjs({
        include: /node_modules/,
    }),

];

/**
 * The recorder's target: the oldest devices the platform supports.
 *
 * File upload works on all of them, so the recorder bundle has to as well.
 */
const RECORDER_TARGETS = {
    android: "5",
    safari: "12",
    chrome: "70",
};

/**
 * The transcript slot's target: browsers that have `SpeechRecognition`.
 *
 * The slot is Tier A/B only and does nothing without the Web Speech API, which
 * no Android 5 or Safari 12 browser has. Polyfilling it down to those was
 * paying — in bytes, on metered connections — for compatibility the capability
 * cannot have. Narrowing the target here is why the bundle fits its budget;
 * raising the budget would have hidden the same waste.
 */
const TRANSCRIPT_TARGETS = {
    android: "67",
    safari: "14.1",
    chrome: "67",
};

/**
 * @param {Object} targets A @babel/preset-env `targets` object.
 * @returns {Array} Plugins for one bundle.
 */
function pluginsFor(targets) {
    return [
        ...sharedPlugins,
        babel({
            babelHelpers: "bundled",
            exclude: "node_modules/**",
            presets: [
                [
                    "@babel/preset-env",
                    {
                        targets,
                        useBuiltIns: "usage",
                        corejs: 3,
                    },
                ],
            ],
        }),
    ];
}

export default [
    // Main Bundle (unminified — consuming build minifies)
    {
        input: "src/js/starmus-main.js",

        output: {
            file: "dist/starmus-audio.js",
            format: "iife",
            name: "StarmusAudio",
            sourcemap: false,
        },

        external: [],

        plugins: pluginsFor(RECORDER_TARGETS),
    },

    // Live-transcript slot (ADR-038) — a separate bundle on purpose. It is a
    // Tier A/B capability, and often supplied by the host's own engine, so a
    // Tier C device must not download it with the recorder.
    {
        input: "src/js/starmus-transcript-provider.js",

        output: {
            file: "dist/starmus-transcript.js",
            format: "iife",
            name: "StarmusTranscript",
            sourcemap: false,
        },

        external: [],

        plugins: pluginsFor(TRANSCRIPT_TARGETS),
    },

    // The same slot as an ES module.
    //
    // The IIFE above defines a browser global and has no `export`, so the
    // `./transcript` package subpath pointed its `import` condition at a file
    // that cannot be imported. A host bundling the package needs the module
    // build; a host dropping a <script> tag needs the global. Both ship.
    {
        input: "src/js/starmus-transcript-provider.js",

        output: {
            file: "dist/starmus-transcript.esm.js",
            format: "es",
            sourcemap: false,
        },

        external: [],

        plugins: pluginsFor(TRANSCRIPT_TARGETS),
    },
];
