module.exports = {
  plugins: [
    require("cssnano")({
      preset: ["default", {
        // Preserve readable output — consuming build minifies
        normalizeWhitespace: false,
        discardComments: { removeAll: false },
      }],
    }),
  ],
};
