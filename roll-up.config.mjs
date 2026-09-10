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

    const anchor = document.createElement("a");
    if (location) {
        anchor.href = location;
    }
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

    babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
        presets: [
            [
                "@babel/preset-env",
                {
                    targets: {
                        android: "5",
                        safari: "12",
                        chrome: "70",
                    },
                    exclude: ["transform-block-scoping"],
                },
            ],
        ],
    }),
];

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

        plugins: sharedPlugins,
    },
];
