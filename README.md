# Acceptance Tests

## Tooling

Tests are written in programmer-friendly ES6 JavaScript, which is transpiled to browser-executable "plain" JS. Consult ES6 documentation on the web or a developer if stuck or you spot potential improvements you'd like to make.
* [Mocha](https://mochajs.org/) test runner parallelised by [mocha-parallel-tests](https://github.com/yandex/mocha-parallel-tests)
* [Selenium WebdriverJS](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html)
* Chai assertions library, using [`expect`](http://chaijs.com/api/bdd/) this project

## Conventions/commandments

* Keep the suite lean - adding tests increases execution time. Consider the value a test adds versus the weight it adds to the suite
* Keep test files short, simple and readable. If you feel that a file is getting long and/or complex, split it up
* Group tests by functionality or by page - (e.g. E2E in one folder)
* Review unit test coverage - if an acceptance test can be captured in a unit test, write a unit test for it and delete the acceptance test afterward. Or raise a card for a developer to pair with you on this exercise
* Multiple assertions per `it` block for tests against application in same state are considered acceptable for this project
* Prefer use of functions to capture setup steps repeated across tests - `before` and `beforeEach` steps are used only to instantiate page objects, to preserve accurate test timings. Make a call to the function needed to execute test setup at the beginning of each `it` block that requires it
* Do not mutate application state across `it` blocks - when making multiple assertions, use a function to run common setup again and execute commands from the point at which behaviour diverges
* Use `describe` to group tests and `it` to define a single test. Don't use `context` or `test`
* You can have multiple `it` and `describe` inside of another `describe` block, but you can't have other `it` or `describe` inside of an `it` block
* Test descriptions should follow on from the "it" keyword, e.g. `it('should see a booking fee of 0.75GBP')`
* Avoid including characters in test descriptions that will interfere with TeamCity artifact uploads - whatever is illegal in a filepath
* Avoid direct comparisons for strings when asserting against error messages, etc. Convert string comparisons in existing assertions to checks for the presence of a string/message instead. This is to accommodate for future localisation
* Field validations may be potential candidates for unit tests and should be decided on a case-by-case basis
* Use explicit assertions to quickly fail tests. Relying on implicit assertions (such as timeouts with error messaging) will increase execution time of your tests
* Where possible (and desirable), drop into the flow using a parameterised URL to reduce execution time. Restrict full traversal of the flow to E2E checks and tests that proceed to Checkout, requiring a product ID in the URL
* Restrict logic and behaviour modelling to page objects - tests should not contain function calls to `scrollToElement` or `waitForVisible`, etc. Page objects should be sensibly-constructed black boxes of functionality that your tests can use
* Consider modelling page objects after reusable components, where appropriate
* Replace existing journey searches with functions expecting JSON fixtures, to allow per-test configurability. Results page can use parameterised URLs, E2E tests must use `enterJourneyDetails` function from Homepage page object
* Test runner uses a special userAgent value that should disable animations on the website. Tests should be written as animations do not exist
* Each wait should provide a message (e.g. `this.waitForVisible(locator.page, 'Home page not visible')`)
* If it is known that a certain page/scenario may trigger the overlay loader, tests should account for that and wait until the loader is gone (`loadingOverlayHidden` or `pageVisible`) instead of using a naive pause
* Currently each test is run with a new driver instance (pristine browser, clean cookies, history and localstorage)

* Use `data-test=xxx-yyy` attribute to tag elements for tests _(tags should be lowercase-dash-separated)_
    ```html
    <div data-test="home-page-wrapper">...content</div>
    ```

* Do not create dependent tests
    ```js
    it('Step 1', async() => {
      await this.go(url);
      expect(await this.isSignInVisible()).to.be.true;
    })
    // Second test most probably will fail if first failed
    it('Step 2', async() => {
      await this.clickOnSignIn();
      expect(await this.isSignInModalVisible()).to.be.true;
    })
    ```

* Tests should not depend on other tests cleaning up after themselves:

    > It's not necessary to do a logout after a test because if the test fails, the `after` hook may not run correctly as some requirements will not be met. Instead each test should setup it's own environment.
    > E.g. if a test is supposed to run as a guest then add a check if user is signed-in and if it is - sign-out.

* If it is know that an action will rerender/populate a part of DOM, wait for that action to complete before proceeding forward
    ```js
    it('Flaky test. Will fail often', async() => {
      await this.typeIntoSeachInput('MAN');
      await this.clickOnFirstSearchResult();
    })
    it('Stable test, selects anything', async() => {
      await this.typeIntoSeachInput('MAN');
      await this.firstSearchResultAvailable();
      await this.clickOnFirstSearchResult();
    })
    it('Stable test, precise selection', async() => {
      await this.typeIntoSeachInput('MAN');
      await this.resultWithValueAvailable('MAN');
      await this.clickOnResultWithValue('MAN');
    })
    ```

* Don't put actions into `beforeEach` as this will make test timing wrong, and if the setup phase fails, it will show as the error happened in `beforeEach` hook. Instead create a function and call it inside of each test:
    ```js
    // BAD
    beforeEach(async() => {
      await this.populateHomePage();
      await this.clickCTA();
      await this.searchResultsVisible();
      await this.loadingOverlayHidden();
    })
    it('Test 1', async() => {
      await this.firstResultOfTypeVisible('AtocKiosk');
      await this.selectFirstResultOfType('AtocKiosk');
      expect(await this.checkoutPageVisible()).to.be.true;
    })
    // Will report:
    // Test 1 (1000ms)
    // In case of failure may report:
    // "before each" hook for "Test 1"


    // GOOD
    const setupSearchResults = async(that) => {
      await that.populateHomePage();
      await that.clickCTA();
      await that.searchResultsVisible();
      await that.loadingOverlayHidden();
    }
    it('Test 1', async() => {
      setupSearchResults(this)
      await this.firstResultOfTypeVisible('AtocKiosk');
      await this.selectFirstResultOfType('AtocKiosk');
      expect(await this.checkoutPageVisible()).to.be.true;
    })
    // Will report:
    // Test 1 (7000ms)
    // In case of failure may report:
    // "Test 1"
    ```

* Driver instance is available in tests context:
    ```js
    // With anonymous function
    beforeEach(function() {
      this.currentTest.ctx.driver; // Driver instance
    })
    it('Some test', function() {
      this.driver; // Driver instance
    })

    // With arrow function
    beforeEach(() => {
      this.currentTest.ctx.driver; // TypeError: Cannot read property 'currentTest' of undefined
    })
    it('Some test', () => {
      this.driver; // undefined
    })
    ```

## async/await

Because webdriver is asynchronous, all the code should be able to handle asynchronicity.

Tests are marked as `async`:
```js
class HomePage {
  // This method has multiple async actions, we make it an async method
  async goToPage() {
    await this.do1();
    await this.do2();
  }
  // This method returns a promise, we don't have to make it async
  appBannerIsVisible() {
    return this.isVisible(locator.appBanner, 'App banner is not visible');
  }
}

it('Some test', async() => {
  const homePage = new HomePage();
  await homePage.goToPage();
  await homePage.appBannerIsVisible();
});
```

If a method/function is synchronous, using it as an asynchronous one will work just fine:
```js
function sum(a, b) {
  return a + b;
}
it('Some test', async() => {
  await homePage.goToPage();
  await sum(1, 2); // same as: sum(1, 2);
  await homePage.appBannerIsVisible();
});
```

## Page Objects

[github.com/SeleniumHQ/selenium/wiki/PageObjects](https://github.com/SeleniumHQ/selenium/wiki/PageObjects) and [martinfowler.com/bliki/PageObject](https://martinfowler.com/bliki/PageObject.html)

>Within your web app's UI there are areas that your tests interact with. A Page Object simply models these as objects within the test code. This reduces the amount of duplicated code and means that if the UI changes, the fix need only be applied in one place.

>PageObjects can be thought of as facing in two directions simultaneously. Facing towards the developer of a test, they represent the services offered by a particular page. Facing away from the developer, they should be the only thing that has a deep knowledge of the structure of the HTML of a page (or part of a page) It's simplest to think of the methods on a Page Object as offering the "services" that a page offers rather than exposing the details and mechanics of the page.

Every page object in the project inherits functions from `base.js`, which serves as a wrapper for common WebDriverJS functionality and provides small helper functions of its own.

Page objects are modelled upon both of the following:

* Pages in the booking flow, encapsulating behaviours unique to that page
* Atomic organisms that are reused across the site (e.g. datepickers, continuous journey summary, etc) and will appear on multiple pages

When writing new functions for page objects, consider where they will logically lie - functionality may be tied to a component that is reused elsewhere in the site, so placing the function in the page object modelling the organism will allow it to be re-used by other page objects consuming it.

## Debugging tests

### Post-factum debugging

Check `js-automation/output` folder and runner logs.

### Local debugging simple

When debugging locally you most probably want to run tests with `npm run test:local src/tests/filename.js`. This will allow seeing what happens.

Use `console.log` in code to output contents during run-time.

Use `this.pause(5000)` in places that happen too fast and you need to observe carefully.

## Running serially

Serial runner was deprecated. See `CONCURRENCY` options for an alternative.

Another option is to use `_mocha` instead of `mocha-parallel-tests` in `scripts/test-parallel.sh` for debugging.

## Running in docker

### Prerequisites on macOS

In order to run parallel acceptance tests on macOS you'll need:
* Install Docker for Mac
* Start Docker
* Go to `Docker Preferences -> Advanced` and adjust the number of CPUs (8) and Memory (8Gb)
* Go to `Docker Preferences -> Daemon -> Insecure registers` and add `docker.artifacts.ttldev`
* Go to `Docker Preferences -> Daemon -> Registry mirrors` and add `https://docker.artifacts.ttldev/v2/`
* Apply and Restart Docker
* Open console and type `docker login docker.artifacts.ttldev`. Use your ttl username (first name + first letter of second name) and password

Also you'll need to:
* Open js-automation folder in terminal `cd js-automation`
* Run `npm install` (that's different from project's root folder)
* Go to the project root folder `cd ..`
* Start the server `npm start`

For accessing Docker instance desktop you can use [Real VNC](https://www.realvnc.com/download/viewer/)

### Running the tests in parallel

`npm test` runs the tests in parallel using docker

This will run the test against local development version of the app.
**You have to ensure that you have your app running**.

The first time will take longer because of the need to download and build images.

### Running against a different instance

You can run the tests against a preview/staging version. For that set `BASE_URL` before running the tests.

For example, run all tests in docker against a preview:

```BASE_URL=https://someurl.com npm test```

or run a specific test locally against staging:

```BASE_URL=https://someurl.com npm run test:local src/tests/folder/file.name.js```

### Running a single test file

Run with `CONCURRENCY=1 npm test -- tests/file.name.js`.

### Debugging a test locally

Run with `CONCURRENCY=1 npm test -- tests/file.name.js`.

Connect through VNC to see what happens on the machine:
* Port: 5901
* Password: secret

When concurrency is 1, you can `console.log` from your tests.

Tests that fail will save the output into `js-automation/output` folder.

Stack-trace may look like gibberish, but read carefully - some where in the middle you'll see which call failed.
If you see a timeout - most probably that's because an element was not found on page.

See *CONCURRENCY* section below for more details.

### Local debugging advanced

You can run Nodejs in debug mode and control the execution flow from V8 inspector integration:

* Go into `test-parallel.sh` and replace `mocha-parallel-tests` with `mocha` (un-comment correct version)
* Go into docker-compose.yml and set a `GRID_TIMEOUT` variable for Selenium Hub
* Set `debugger;` everywhere where you want the execution script to stop
* Run tests.
* Open the URL provided in terminal, or go to [chrome://inspect/#devices](inspector in Chrome) and open the inspector

### Debugging a test on CI

Check the stack-trace and the output. Output is kept in test artifacts.

Then try to reproduce the behavior locally. CI has its own [Selenium Grid](http://host01.someurl.com:34444/grid/console) and currently I don't know if it's possible to connect to its nodes remotely.

### Keep selenium instances running

If you want to keep selenium no Docker instance running you can do the following:
* run `docker-compose up hub`
* open a new terminal tab/instance
* run `docker-compose scale chrome=8` (set as many chrome instances as you need)
* check that the hub is running and nodes are registered http://localhost:4444/grid/console
* provide SELENIUM_HOST when running tests so that the script will not restart the selenium `SELENIUM_HOST=localhost npm test tests/file.js`

Alternatively you can startup a `chrome-single` instance to be able to view it in VNC:
* run `docker-compose up hub`
* open a new terminal tab/instance
* run `docker-compose scale chrome-single=1`
* provide SELENIUM_HOST when running tests so that the script will not restart the selenium `CONCURRENCY=1 SELENIUM_HOST=localhost npm test tests/file.js`

### Environment Settings

#### BASE_URL

To run against a different base url: `BASE_URL=xxx.com npm test`

#### CONCURRENCY

Use: `CONCURRENCY=8 npm test`. That will run 8 docker browser instances.
If concurrency is not specified then the script will spawn X (number of CPU cores - 2) concurrent tests and docker browser instances.

One docker browser instance runs one test file.

Setting `CONCURRENCY=1` will:

* Expose port 5091 from docker instance that runs chrome browser. Use a VNC app to live view what's happening in the box

#### RETRIES

Use: `RETRIES=0 npm test`. Sets the number of retries to 0. Useful in development.

Default value 2. Currently works only for parallel runner.

#### SELENIUM_HOST

Run against an existing Selenium grid/hub. `SELENIUM_PORT` also available.

Setting this step will bypass selenium startup by Docker.

#### SMOKE_TESTING

Use: `npm run test:smoke` or `SMOKE_TESTING=true npm test -- tests/e2e*`.

Smoke tests are a subset of acceptance test that are considered to be business critical. Most E2E tests are considered business critical.

Setting `SMOKE_TESTING=true` will do 2 things:
* Will ignore business critical repetitive tests (e.g. if one test goes through entire flow and does a payment with a VISA card, we can skip doing the same with a Master card).

We don't use `SMOKE_TESTING=true` on staging or production as those environments are considered stable and should be tested thoroughly.

#### ACCESSIBILITY TESTING

Use: `npm run test:a11y`.

Accessibility tests are a subset of tests that are considered to be useful for checking if the application is accessible.

Accessibility testing is using the [Axe-Webdriver](https://github.com/dequelabs/axe-webdriverjs) module

#### TESTS

It is possible to use `TESTS=tests/e2e-* npm test` instead of `npm test --- tests/e2e-*`.
That is useful only on CI.

Passed arguments take priority over `TESTS` variable.

#### DEFAULT_TIMEOUT

Tests will wait for a certain amount of time for elements to be present.
By default it is 10 seconds (check in `config.js`).

Change that time by passing a custom time in milliseconds: `DEFAULT_TIMEOUT=5000 npm test`.

#### MOCHA_TIMEOUT

By default it is 120 seconds (check in `test-parallel.sh`).

Change that time by passing a custom time in milliseconds: `MOCHA_TIMEOUT=30000 npm test`.

## Gotchas
- Run `docker-compose down` to stop docker instances (in case that they failed to turn down)
- We run website with disabled animations by passing `WebDriver` in userAgent
- Times for tests do not take into account the `before` and `beforeEach` time (same for after). So while a test may report an <1s time, it's total time can be much higher
- Be aware of releases of chrome driver, webdriver and updates to the selenium docker version to make sure you are up to date with the browsers
- The automation is running with a user agent so try and replicate as close as possible to a device. This can be found in the [config](src/support/config.js) file.
