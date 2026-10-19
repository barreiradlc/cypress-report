const { defineConfig } = require('cypress');

const BASEURL = process.env.BASE_URL || 'http://localhost:3000';

module.exports = defineConfig({
  e2e: {
    baseUrl: BASEURL,
    specPattern: 'cypress/e2e/**/*.cy.js',
    video: true,
    screenshotOnRunFailure: true,
    retries: { runMode: 2, openMode: 0 },
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: false,
    json: true,
  },
});