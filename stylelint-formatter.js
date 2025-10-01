const stylelintReporter = require("stylelint-html-reporter");

module.exports = stylelintReporter({
  filename: "dist/stylelint/report.html",
});
