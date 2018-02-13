import config from './config';
import WebDriver from 'selenium-webdriver';
import fs from 'fs';

export default async function createDriver() {
  let driver;

  if (process.env.SELENIUM_HOST) {
  driver = new WebDriver
    .Builder()
    .usingServer(`http://${process.env.SELENIUM_HOST}:${process.env.SELENIUM_PORT || '4444'}/wd/hub`)
    .withCapabilities(config.capability.chrome)
    .build();
  await driver.manage().timeouts().setScriptTimeout(5000);
  } else if (process.env.HEADLESS){
    driver = new WebDriver
      .Builder()
      .withCapabilities(config.capability.headless_chrome)
      .build();
    await driver.manage().timeouts().setScriptTimeout(10000);
  } else {
    driver = new WebDriver
    .Builder()
    .withCapabilities(config.capability.chrome)
    .build();
  await driver.manage().timeouts().setScriptTimeout(10000);
  }
  driver.saveScreenshot = async (filename) => {
    fs.writeFileSync(filename, await driver.takeScreenshot(), 'base64');
  }

  return driver;
}
