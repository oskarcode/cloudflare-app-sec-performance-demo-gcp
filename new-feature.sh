#!/bin/bash
# Wrapper script for new-feature.sh in scripts/git/
exec "$(dirname "$0")/scripts/git/new-feature.sh" "$@"