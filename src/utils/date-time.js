import { Moment } from 'moment';
/**
 * Transforms a Moment object into a URL encoded string
 * @param {Moment} momentTime
 * @returns {string}
 */
export const momentToUrl = (momentTime) => {
  return encodeURIComponent(momentTime.toISOString());
}
