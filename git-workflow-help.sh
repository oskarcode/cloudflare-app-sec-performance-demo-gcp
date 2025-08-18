#!/bin/bash
# Wrapper script for git-workflow-help.sh in scripts/git/
exec "$(dirname "$0")/scripts/git/git-workflow-help.sh" "$@"