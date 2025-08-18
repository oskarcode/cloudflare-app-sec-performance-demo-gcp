#!/bin/bash
# Wrapper script for deploy-to-server.sh in scripts/deployment/
exec "$(dirname "$0")/scripts/deployment/deploy-to-server.sh" "$@"