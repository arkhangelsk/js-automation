import moment from 'moment';
import config from '../support/config';
import AppPage from './app-page';
import { By } from 'selenium-webdriver';
import url from 'url';
import { ThenableWebDriver } from 'selenium-webdriver';

const locator = {
  locator: By.css(''),
  anotherLocator: (type) => By.css(`-${type}`),
};

const pagePath = `${config.baseUrl}${config.basePath}path`;

const defaultOptions = {
  something: 'value',
};
class SomePage extends AppPage {
  /**
  * @param {ThenableWebDriver} driver
  */
  constructor(driver) {
    super(driver);
    this.url = this.buildUrl();
  }

  buildUrl(givenOptions) {
    const options = Object.assign({}, defaultOptions, givenOptions);
    return `${pagePath}/path + ${options.something}`
}

  async someFunction() {
    const name = await this.getText(locator.locator);
    return name;
  }
}

export default SomePage;
