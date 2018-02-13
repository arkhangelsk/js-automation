import 'chromedriver'
import url from 'url';

const capabilities = {
  chrome: {
    browserName: 'chrome',
    args: 'ignore-ssl-errors=true',
    'goog:chromeOptions': {
      args: [
        '--window-size=430,870', '--disable-infobars',
      ],
      mobileEmulation: {
        // This equates to a Google Nexus 6, but with the additional 'WebDriver' label on the user agent string
        userAgent: 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.20 Mobile Safari/537.36 WebDriver',
        deviceMetrics: { width: 412, height: 732, pixelRatio: 3.5 }
      },
    },
    loggingPrefs: { browser: 'INFO', client: 'INFO' }
  },
  headless_chrome: {
    browserName: 'chrome',
    args: 'ignore-ssl-errors=true',
    'goog:chromeOptions': {
      args: [
        '--window-size=430,870', '--disable-infobars','headless',
      ],
      mobileEmulation: {
        // This equates to a Google Nexus 6, but with the additional 'WebDriver' label on the user agent string
        userAgent: 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.20 Mobile Safari/537.36 WebDriver',
        deviceMetrics: { width: 412, height: 732, pixelRatio: 3.5 }
      },
    },
    loggingPrefs: { browser: 'INFO', client: 'INFO' }
  }
};
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || '3000';
const baseUrl = url.parse(process.env.BASE_URL || 'https://' + host + ':' + port);
const isSmokeTest = !!process.env.SMOKE_TESTING || false;
const defaultTimeout = parseInt(process.env.DEFAULT_TIMEOUT, 10) || 10000;
const isProd = !!process.env.IS_PROD || false;
const headless = !!process.env.HEADLESS || false;

export default {
  host: baseUrl.hostname,
  baseUrl: baseUrl.href.replace(/\/$/, ''),
  basePath: '/m/',
  capability: capabilities,
  headless: headless,
  isSmokeTest: isSmokeTest,
  defaultTimeout,
  defaultNetworkTimeout: defaultTimeout * 6, // Normally a minute
  isProd: isProd,
};
