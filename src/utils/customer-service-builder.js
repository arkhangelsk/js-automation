import moment from 'moment';
import request from 'request';
import requestPromise from 'request-promise';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import { createUniqueEmailAddress, defaultRegisteredCustomer, defaultUKAddress } from '../utils/customer';
import config from '../support/config';

let environment;

const registerCustomerUrl = (env = environment) => `https://${env}-customer.service.somedomain.local/CustomerService/CustomerService.svc/json/Register`;

let payload;
let customerId;
let dirPath
let visa = cards.credit.visa

export async function generateNewRegisteredUser(
  email = createUniqueEmailAddress(),
  password = 'password',
  customer = defaultRegisteredCustomer,
  address = defaultUKAddress,
  dpi84Consent = false,
  dpi03Consent = false
) {

  if (!environment) {
    environment = (await getEnv()).environment;
  }

  dirPath = './output/API-requests/generateNewRegisteredUser/';
  mkdirp.sync(dirPath);

  payload = {
    "Credentials": {
      "EmailAddress": email,
      "Password": password,
      "EntryParameter": {
        "entryPointId": 111,
        "managedGroupId": 20
      }
    },
    "CustomerType": {
      "Address": {
        "PostCode": address.postCode,
        "CountryCode": address.isoCountryCode,
        "Line1": address.line1,
        "Line2": address.line2
      },
      "ForeName": customer.firstName,
      "SurName": customer.surname
    },
    "DataProtectionInformationIndicator":{
      "DataProtectionAct1984ConsentIndicator": dpi84Consent,
      "DataProtectionAct2003ConsentIndicator": dpi03Consent
    }
  };

  dirPath = './output/API-requests/generateNewRegisteredUser/';
  mkdirp.sync(dirPath);
  return request
    .post(setRequestPayload(payload, registerCustomerUrl()), (err, response, body) => {
      customerId = body.CustomerId;
    })
    .on('error', err => {
      console.error(`[ ERROR ]: ${err}`);
    })
    .pipe(fs.createWriteStream(`${dirPath}${moment().format('YYYYMMDD-HHmmss')}.json`));
}

export function getCustomerId() {
  return customerId;
}

function setRequestPayload(payload, requestUrl) {
  return {
    url: requestUrl,
    json: payload,
    cert: fs.readFileSync(certFile),
    key: fs.readFileSync(keyFile),
    ca: fs.readFileSync(caFile)
  };
}

