import { runEachSpecWithADifferentDriver } from '../../support/hooks';
import SomePage from '../../page-objects/some-page'
import moment from 'moment';
import * as softFails from '../../utils/soft-fails';
import config from '../../support/config';

!config.isSmokeTest &&
describe('E2E Test', runEachSpecWithADifferentDriver(() => {
  /** @type {SomePage} */
  let somePage;

  beforeEach(async function () {
    somePage = new SomePage(this.currentTest.ctx.driver);
  });

  describe('Desribe block', async function() {
    it('It block', async function() {
      await somePage.go(somePage.buildUrl({ something: 'test' }));
    });
  });
}));
