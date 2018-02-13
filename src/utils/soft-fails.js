import config from '../support/config';
import SomePage from '../page-objects/some-page';

/**
 *
 * @param {SomePage} somePage
 * @param {*} testContext
 * @returns boolean
 */
export const name = async (somePage, testContext) => {
  if (!(testContext && 'skip' in testContext)) {
    throw new Error(`
    Test context doesn't have skip method.
    That's most probably because test is defined using arrow function expressions.
    Use function expression to fix that: function(){}`);
  }

  try {
    // Something;
  } catch (e) {
    if (hasPaymentErrors || config.isProd) {
      testContext.skip('Soft failure of payment');
      return false;
    } else {
      throw new Error('Error');
    }
  }

  return true;
}
