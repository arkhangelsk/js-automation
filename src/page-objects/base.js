import { logging, By, WebElementPromise } from 'selenium-webdriver';
import { ThenableWebDriver, Locator, WebElement } from 'selenium-webdriver';
import config from '../support/config';
class BasePage {
  /**
   * @param {ThenableWebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;
  }

  go(url) {
    return this.driver.get(url);
  }

  back() {
    return this.driver.navigate().back();
  }

  // addCookie(name, value, opt_path, opt_domain, opt_isSecure, opt_expiry) {
  //   return this.driver.manage().addCookie(name, value, opt_path, opt_domain, opt_isSecure, opt_expiry);
  // }

  async addSimpleCookie(name, value, path = '/') {
    const script = `document.cookie='${name}=${value};path=${path}'`;
    return this.driver.executeScript(script);
  }

  deleteCookie(name) {
    return this.driver.manage().deleteCookie(name);
  }

  // async addOptionToDropdown(selector, text, value) {
  //   return await this.driver.executeScript(
  //     `var dropdown = document.querySelector('${selector.value}');
  //     var option = document.createElement("option");
  //     option.text = ${text};
  //     option.value = ${value};
  //     dropdown.add(option);`
  //     );
  // }

  getCookie(name) {
    return this.driver.manage().getCookie(name);
  }

  async getCookieValue(name) {
    const cookie = await this.getCookie(name);
    return cookie.value;
  }

  async removeAllCookies() {
    return await this.driver.manage().deleteAllCookies();
  }

  async getDomain() {
    return this.driver.executeScript('return document.domain');
  }

  /**
   * @param {Locator} locators
   */
  getElement(locator) {
    return this.driver.findElement(locator);
  }

  /**
   * @param {Locator} locator
   */
  getElements(locator) {
    return this.driver.findElements(locator);
  }

  /**
   * @param {Locator} locator
   * @param {string} text
   */
  async getElementWithText(locator, text) {
    const elements = await this.getElements(locator);
    for (let element of elements) {
      if ((await element.getText()) === text) {
        return element;
      }
    }
    return null;
  }

  getAttribute(locator, name) {
    return this.getElement(locator).getAttribute(name)
  }

  clear(locator) {
    return this.getElement(locator).clear()
  }

  getCssProperty(locator, name) {
    return this.getElement(locator).getCssValue(name)
  }

  // getDataElement(name) {
  //   return this.driver.executeScript(function(varName) {
  //     return window._satellite.getVar(varName);
  //   }, name);
  // }

  /**
   * @param {Locator} locator
   */
  getText(locator) {
    return this.getElement(locator).getText();
  }

  /**
  * @param {Locator} locator
  */
  async getTexts(locator) {
    const elements = await this.getElements(locator);
    const texts = [];
    for (let element of elements) {
      texts.push(await element.getText())
    }
    return texts;
  }

  getTitle() {
    return this.driver.getTitle();
  }

  async getValue(locator) {
    return this.getAttribute(locator, 'value');
  }

  // setValue(locator, text) {
  //   return this.getElement(locator).clear().sendKeys(text);
  // }

  /**
   * @param {Locator} locator
   * @param {string} locatorDescription
   */
  click(locator, locatorDescription = '') {
    const affix = !locatorDescription ? `\n(${locator})` : '';
    const message = `Failed to click ${locatorDescription || locator}${affix}`
    return this.clickOnElement(this.getElement(locator), message);
  }

  /**
   * @param {WebElement} element
   * @param {string} message
   */
  clickOnElement(element, message) {
    return element
      .click()
      .catch((err) => {
        err.message = message ? message : err.message;
        throw err;
      });
  }

  // submit(locator) {
  //   return this.getElement(locator).submit();
  // }

  /**
   * @param {Locator} locator
   * @param {string} text
   */
  keys(locator, text) {
    // Don't pass a message as catching and throwing the error breaks the driver
    return this
      .getElement(locator)
      .sendKeys(text);
  }

  isEnabled(locator) {
    return this.getElement(locator).isEnabled()
  }

  /**
   * @param {Locator} locator
   */
  async isExisting(locator) {
    return this.getElements(locator).then(found => found.length > 0);
  }

  /**
   * @param {Locator} locator
   */
  isMissing(locator) {
    return this.getElements(locator).then(found => found.length === 0);
  }

  async isSelected(locator){
    return this.getElement(locator)
    .then(element => element.isSelected());
  }

  // isSelected(locator) {
  //   return this.driver.isSelected(locator);
  // }

  /**
   * @param {Locator} locator
   */
  async isVisible(locator) {
    try {
      const el = await this.getElement(locator);
      const displayed = await el.isDisplayed();
      const opacity = parseFloat(await el.getCssValue('opacity'));
      return displayed && opacity > 0;
    } catch (e) {
      // No such element
      return false;
    }
  }

  /**
   * @param {Locator} locator
   */
  async isNotVisible(locator) {
    return !(await this.isVisible(locator));
  }

  /**
   * @param {number} delayInMilliseconds
   */
  pause(delayInMilliseconds) {
    return this.driver.sleep(delayInMilliseconds);
  }

  // Pause is 0 as animations should be disabled
  // Method still used in old tests
  async waitForTransitionComplete(pause = 0) {
    return await this.pause(pause);
  }

  refresh() {
    return this.driver.navigate().refresh();
  }

  // takeScreenshot(locator, scrollIntoView) {
  //   return this.driver.findElement(locator).takeScreenshot(scrollIntoView);
  // }

  // saveScreenshot(locator, filename, scrollIntoView) {
  //   return this.takeScreenshot(locator, scrollIntoView).then((res) => {
  //     const screenshot = new Buffer(res, 'base64')
  //     fs.writeFileSync(filename, screenshot);
  //     return screenshot;
  //   });
  // }

  waitUntil(condition, message = 'Wait until failed', timeout = config.defaultTimeout) {
    return this.driver.wait(condition, timeout, message);
  }

  getCurrentUrl() {
    return this.driver.getCurrentUrl();
  }

  waitForEnabled(locator, timeout) {
    return this.waitUntil(() => {
      return this.isEnabled(locator);
    }, timeout || config.defaultTimeout);
  }

  waitForExists(locator, timeout) {
    return this.waitUntil(() => {
      return this.isExisting(locator);
    }, timeout || config.defaultTimeout);
  }

  /**
   * @param {Locator} locator
   * @param {string} locatorDescription
   * @param {number} timeout
   */
  waitForMissing(locator, locatorDescription = '', timeout = config.defaultTimeout) {
    const affix = locatorSelectorAffix(locator, locatorDescription);
    const message = `Wait for ${locatorDescription || locator} being missing failed${affix}`;
    return this.waitUntil(() => this.isMissing(locator), message, timeout);
  }

  /**
   * @param {Locator} locator
   * @param {string} locatorDescription
   * @param {number} timeout
   */
  waitForElementWithText(locator, text, locatorDescription = '', timeout = config.defaultTimeout) {
    const affix = locatorSelectorAffix(locator, locatorDescription);
    const message = `Wait for ${locatorDescription || locator} with "${text}" text failed${affix}`;
    return this.waitUntil(async () => (await this.getTexts(locator)).indexOf(text) !== -1, message, timeout);
  }

  // waitForSelected(locator, timeout) {
  //   return this.waitUntil(() => {
  //     return this.isSelected(locator);
  //   }, timeout || config.defaultTimeout);
  // }

  /**
   * @param {Locator} locator
   * @param {string} locatorDescription
   * @param {number} timeout
   */
  waitForVisible(locator, locatorDescription = '', timeout = config.defaultTimeout) {
    const affix = locatorSelectorAffix(locator, locatorDescription);
    const message = `Wait for ${locatorDescription || locator} being visible failed${affix} `;
    return this.waitUntil(async () => await this.isVisible(locator), message, timeout);
  }

  /**
   * @param {Locator} locator
   * @param {string} locatorDescription
   * @param {number} timeout
   */
  waitForHidden(locator, locatorDescription = '', timeout = config.defaultTimeout) {
    const affix = locatorSelectorAffix(locator, locatorDescription);
    const message = `Wait for ${locatorDescription || locator} being hidden failed${affix}`;
    return this.waitUntil(async () => {
      return await this.isMissing(locator) || await this.isNotVisible(locator);
    }, message, timeout);
  }

  async scrollToElement(locator) {
    try {
      const script = `document.querySelector('${locator.value}').scrollIntoView()`;
      return await this.driver.executeScript(script);
    } catch(e) {};
  }

  // setBodyWidth(width) {
  //   try {
  //     const script = `document.querySelector('body').style.width = '${width}'`;
  //     return this.driver.executeScript(script);
  //   } catch(e) {};
  // }

  // async log() {
  //   const entries = await this.driver.manage().logs().get(logging.Type.BROWSER);

  //   entries.forEach(function(entry) {
  //     console.log('[%s] %s', entry.level.name, entry.message);
  //   });
  // }

  waitForWindow(criteria, timeout) {
    return this.driver.wait(() =>
      this.driver.getAllWindowHandles().then(criteria),
      timeout || config.defaultTimeout
    );
  }

  async switchToWindowOpened(timeout) {
    const newWindow = await this.waitForWindow(windows =>
      windows[1],
      timeout
    );
    await this.driver.switchTo().window(newWindow);
  }

  async switchBackFromWindowClosed(timeout) {
    const mainWindow = await this.waitForWindow(windows =>
      windows.length === 1 ? windows[0] : false,
      timeout
    );
    await this.driver.switchTo().window(mainWindow);
  }

  async setSessionStorage(item, value) {
    const script = `window.sessionStorage.setItem('${item}','${value}');`;
    return this.executeScript(script);
  }

  async removeSessionStorage(item, value) {
    const script = `window.sessionStorage.removeItem('${item}');`;
    return this.executeScript(script);
  }

  async removeAllSessionStorage() {
    const script = `window.sessionStorage.clear();`;
    return this.executeScript(script);
  }

  async removeAllLocalStorage() {
    const script = `window.localStorage.clear();`;
    return this.executeScript(script);
  }

  async getTagData(data){
    const script = `return window.tagData.${data}`;
    return await this.driver.executeScript(script);
  }

  async executeScript(script) {
    return await this.driver.executeScript(script);
  }
}

const locatorSelectorAffix = (locator, locatorDescription) => locatorDescription ? `\n${locator}` : '';

export default BasePage;
