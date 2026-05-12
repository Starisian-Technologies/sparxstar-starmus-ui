import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";

const sharedPlugins = [
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
                    useBuiltIns: "usage",
                    corejs: 3,
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
