import moment from 'moment';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import createDriver from './create-driver';
import { logging } from 'selenium-webdriver';

const getCurrentTestOutputPath = (currentTest) => {
  const pathArr = [];

  do {
    pathArr.unshift(currentTest.title);
  } while (currentTest = currentTest.parent);

  // Append date-time to file name
  pathArr[pathArr.length - 1] = moment().format("YYYYMMDD-HHmmss") + ' - ' + pathArr[pathArr.length - 1];

  pathArr.unshift(__dirname, '../../output');
  return path.resolve.apply(null, pathArr);
};

const driverBefore = async function () {
  const driver = await createDriver();
  this.driver = driver;
};

const saveArtifacts = function () {
  if (!this.currentTest.ctx.driver) {
    throw new Error('Tests doesn\'t have a driver instance');
  }
  const { driver } = this.currentTest.ctx;

  if (this.currentTest.state === 'passed') {
    // Empty driver logs
    return driver
      .getCurrentUrl()
      .then(() => driver.manage().logs().get(logging.Type.DRIVER));
  }

  const outputPath = getCurrentTestOutputPath(this.currentTest);
  mkdirp.sync(path.dirname(outputPath));

  return driver
    // URL
    .getCurrentUrl()
    .then((url) => {
      fs.writeFileSync(`${outputPath}.url.txt`, url);
    })
    // Page source
    .then(() => driver.getPageSource())
    .then((pageSource) => {
      fs.writeFileSync(`${outputPath}.html`, pageSource);
    })
    // Screenshot
    .then(() => driver.takeScreenshot())
    .then((screenshot) => {
      fs.writeFileSync(`${outputPath}.png`, new Buffer(screenshot, 'base64'));
    })
    // A11Y logs
    .then(() => {
      if (driver._a11yResults) {
        fs.writeFileSync(`${outputPath}.a11y.json`, JSON.stringify(driver._a11yResults, null, 2));
        delete driver._a11yResults;
      }
    })
    // Browser logs
    .then(() => driver.manage().logs().get(logging.Type.BROWSER))
    .then((entries) => {
      fs.writeFileSync(`${outputPath}.browser-logs.txt`, JSON.stringify(entries, null, 2));
    })
    // Driver logs
    .then(() => driver.manage().logs().get(logging.Type.DRIVER))
    .then((entries) => {
      fs.writeFileSync(`${outputPath}.driver-raw-logs.txt`, JSON.stringify(entries, null, 2));
    });
};

const quitDriver = function() {
  if (!this.driver) {
    throw new Error('Tests doesn\'t have a driver instance');
  }
  return this.driver.quit();
};

export const runEachSpecWithADifferentDriver = (fn) => {
  return () => {
    beforeEach(driverBefore);
    fn();
    afterEach(saveArtifacts);
    afterEach(quitDriver);
  };
}

export const runAllSpecsWithSameDriver = (fn) => {
  return () => {
    before(driverBefore);
    fn();
    afterEach(saveArtifacts);
    after(quitDriver);
  };
};
