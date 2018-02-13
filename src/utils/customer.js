import moment from 'moment';

export const defaultRegisteredCustomer = {
  type: 'REGISTERED',
  title: 'Miss',
  firstName: 'Default Registered',
  surname: 'Customer',
  fullName: 'Default Registered Customer',
  email: 'some@email.com',
  password: 'password'
};

export const defaultUKAddress = {
  line1: 'address line 1',
  line2: 'address line 2',
  postCode: 'post code',
  countryCode: 'GB'
};

export const createUniqueEmailAddress = (name = 'name', domain = 'someurl.com') => {
  return `${name}-${moment().format('YYYYMMDDHH-mmssSSS-')}` +
    (Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)) + '@' + domain;
};