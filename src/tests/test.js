import { runAllSpecsWithSameDriver } from '../support/hooks';
import SomePage from '../page-objects/some-page';
import forEach from 'mocha-each';

describe('describe block', runAllSpecsWithSameDriver(() => {
  /** @type {SomePage} */
  let somePage;

  before(async function () {    
    somePage = new SomePage(this.driver);
  });

  afterEach(async function () {
     // code
  });

  describe('describe block', async () => {
    before(async function () {    
      // code
    }); 

    forEach([
      //data
    ])
      .it('it block %2$s', async (type) => {
        // code
    });
  });
}));
