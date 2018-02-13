#!/bin/bash

set -o pipefail
set -e

if [ -n "$TEAMCITY_BUILDURL" ]; then
  set -x
fi

# Check if docker is present on machine
function check-docker() {
  if [ -z $(command -v docker) ]; then
     echo "Coulnd't find docker. Please install docker and then re-run."
     if [ $(uname) == "Darwin" ]; then
       echo "Install docker for Mac here: https://www.docker.com/docker-mac"
     fi
     exit 1
  fi
}

# Start-up Docker selenium hub if no selenium host provided
if [ -z "$SELENIUM_HOST" ]; then
  check-docker

  # When concurency is one then run a sandalone selenium
  if [[ "$CONCURRENCY"  -eq "1" ]]; then
    docker-compose up -d hub
    docker-compose scale chrome-single=1
  else
    docker-compose up -d hub
    docker-compose scale chrome=${CONCURRENCY:-8}
  fi

  export SELENIUM_HOST=${SELENIUM_HOST:-localhost}
  export SELENIUM_PORT=$(docker inspect --format='{{(index (index .NetworkSettings.Ports "4444/tcp") 0).HostPort}}' $(docker ps -f 'ancestor=selenium/hub' -q) 2> /dev/null || echo 4444)

  trap "docker-compose down" SIGINT SIGTERM EXIT
fi

# If no base URL, use current machine IP. Allows Docker instances browsers accessing localy running server
if [ -z "$BASE_URL" ] && [ -z "$HOST" ]; then
  # Get host IP
  export HOST=$(ifconfig | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v 127.0.0.1 | awk '{ print $2 }' | cut -f2 -d: | head -n1)
fi

TESTS=${@:-$TESTS}
export TESTS=${TESTS:-src/tests/*}
export REPORTER=${REPORTER:-spec}
export RETRIES=${RETRIES:-2}
export MOCHA_TIMEOUT=${MOCHA_TIMEOUT:-120000}
MAX_WORKERS=${CONCURRENCY:-$(node -p "require('os').cpus().length - 2")}

# mocha-parallel-tests has `retry` option that works a bit differently than mocha's `retries`
# `retry` will rerun only the test and will not rerun `before` hooks
#
# Debug with Node < 8
# ./node_modules/.bin/mocha \
#   --inspect=9234 \
#   --debug-brk \
#
# Debug with Node >=8
# ./node_modules/.bin/mocha \
#   --inspect-brk=9234 \
./node_modules/.bin/mocha-parallel-tests \
  --timeout $MOCHA_TIMEOUT \
  --retry $RETRIES \
  --max-parallel $MAX_WORKERS \
  --opts ./test/mocha.opts \
  $TESTS
