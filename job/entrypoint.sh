#!/bin/sh -ex

echo "$BQIAM_TOML" > ~/.bqiam.toml
cat ~/.bqiam.toml

bqiam cache

gcloud storage cp ~/.bqiam-cache-file.json "$GCS_PATH"
