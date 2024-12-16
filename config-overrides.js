const { override, fixBabelImports, addLessLoader } = require("customize-cra");

module.exports = override(
  // Suppress source map warnings for missing files
  (config) => {
    config.module.rules = config.module.rules.map((rule) => {
      if (rule.loader && rule.loader.includes("source-map-loader")) {
        rule.exclude = [/hyperformula/, /chevrotain/]; // Exclude these modules
      }
      return rule;
    });

    return config;
  }
);
