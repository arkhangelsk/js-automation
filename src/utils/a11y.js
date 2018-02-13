import AxeBuilder from 'axe-webdriverjs';
import axeConfig from '../../../axe-config.json';

export const a11yCheck = (driver) => {
  // Wrap it in a promise as analyze only accepts a callback
  return new Promise((resolve) => {
    AxeBuilder(driver)
      // Ignore iframes as they're used by analytics and braintree
      .exclude('iframe')
      .configure(axeConfig)
      .analyze(function (results) {
        if (results.violations && results.violations.length > 0) {
          driver._a11yResults = results;
          let message = 'A11Y Failures:';
          results.violations.forEach((violation) => {
            message += `\n * [${violation.nodes.length}] ${violation.description}`
          })
          message += '\n Check output folder/artifacts for more details'
          expect.fail(0, 0, message);
        }

        resolve(results);
      });
  })
}
