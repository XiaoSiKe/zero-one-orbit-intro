#!/bin/sh
# 零一·环轨启序 — macOS / Linux HTTP 预览
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
exec node "$HERE/scripts/open-preview.mjs"
