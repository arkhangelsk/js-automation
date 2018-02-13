#!/bin/bash

set -eo pipefail

export REPORTER=mocha-teamcity-reporter
export CONCURRENCY=${CONCURRENCY:-8}

tar_artifacts() {
  if [ -n "$ARTIFACTS_DEST" ]; then
    tar cf $ARTIFACTS_DEST output
  fi
}

if [ -z "$SELENIUM_HOST" ] || [ -z "$SELENIUM_PORT" ] || [ -z "$BASE_URL" ]; then
  echo "Warning: no SELENIUM_HOST, SELENIUM_PORT or BASE_URL, exiting"
  exit 1
fi

trap tar_artifacts EXIT

echo Running acceptance tests against $BASE_URL
./scripts/test-parallel.sh $@

