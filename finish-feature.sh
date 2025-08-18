#!/bin/bash
# Wrapper script for finish-feature.sh in scripts/git/
exec "$(dirname "$0")/scripts/git/finish-feature.sh" "$@"