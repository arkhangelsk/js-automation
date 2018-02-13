#!/bin/bash
set -ex

if [ -z "$GITHUB_TOKEN" ]
then
  echo "Warning: GITHUB_TOKEN is not set. Status will not be reported" 1>&2
  exit 0
fi

#STATUS = pending, success, error, or failure

case $CONTEXT in
  *-preview) DESCRIPTION="Shortlived preview" ;;
  *-test) DESCRIPTION="Acceptance tests" ;;
esac

if [ -z "$GITHUB_ORG_REPO" ]
then
  GITHUB_ORG_REPO="${VCSROOT##git@github.somerepo.com:}"
fi

(: "GITHUB_TOKEN=${GITHUB_TOKEN?}") || exit 1
(: "GITHUB_ORG_REPO=${GITHUB_ORG_REPO?}") || exit 1
(: "BUILD_VCS_NUMBER=${BUILD_VCS_NUMBER?}") || exit 1
(: "STATUS=${STATUS?}") || exit 1
(: "CONTEXT=${CONTEXT?}") || exit 1
(: "DESCRIPTION=${DESCRIPTION?}") || exit 1
(: "TARGET_URL=${TARGET_URL?}") || exit 1

echo "Reporting $STATUS for $CONTEXT and $TARGET_URL"

curl -si \
  "https://github.somerepo.com/api/v3/repos/$GITHUB_ORG_REPO/statuses/$BUILD_VCS_NUMBER?access_token=$GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -X POST \
  -d "{\"state\": \"$STATUS\",\"context\": \"$CONTEXT\",\"description\": \"$DESCRIPTION\", \"target_url\": \"$TARGET_URL\"}" \
  && echo "Reported." \
  || echo "Failed to report status" 1>&2
