#!/bin/bash
TOOL_NAME=$1
if [[ "$TOOL_NAME" != "create" && "$TOOL_NAME" != "edit" ]]; then
  exit 0
fi
cd linkshortener
npx prettier --write .
cd ..
