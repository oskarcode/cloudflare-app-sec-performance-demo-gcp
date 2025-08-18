# 📁 Scripts Organization

This directory contains all automation scripts organized by category for easy management.

## 📂 Directory Structure

```
scripts/
├── git/                     # Git workflow automation
├── deployment/              # Server deployment scripts  
├── cloudflare/             # Cloudflare Workers scripts
├── setup/                  # Initial setup scripts
└── README.md               # This file
```

## 🔧 Git Workflow Scripts (`scripts/git/`)

| Script | Purpose | Usage |
|--------|---------|-------|
| `new-feature.sh` | Start new feature branch | `./new-feature.sh "feature-name"` |
| `finish-feature.sh` | Complete and merge feature | `./finish-feature.sh "commit message"` |
| `git-workflow-help.sh` | Show workflow help | `./git-workflow-help.sh` |

## 🚀 Deployment Scripts (`scripts/deployment/`)

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy-to-server.sh` | Deploy to production server | `./deploy-to-server.sh` |
| `setup-production-env.sh` | Setup production environment | Run on server: `./setup-production-env.sh` |

## ☁️ Cloudflare Scripts (`scripts/cloudflare/`)

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy-worker.sh` | Deploy Cloudflare Workers | `./deploy-worker.sh` |

## ⚙️ Setup Scripts (`scripts/setup/`)

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup-github.sh` | Connect local repo to GitHub | `./setup-github.sh` |

## 🔗 Root Directory Shortcuts

For convenience, the most commonly used scripts have wrapper shortcuts in the root directory:

- `./new-feature.sh` → `scripts/git/new-feature.sh`
- `./finish-feature.sh` → `scripts/git/finish-feature.sh` 
- `./deploy-to-server.sh` → `scripts/deployment/deploy-to-server.sh`
- `./git-workflow-help.sh` → `scripts/git/git-workflow-help.sh`

## 🎯 Quick Commands

```bash
# Most common workflow (shortcuts work from root)
./new-feature.sh "my-feature"
# ... make changes ...
./finish-feature.sh "Add new functionality"
./deploy-to-server.sh

# Or use direct paths
scripts/git/new-feature.sh "my-feature"
scripts/deployment/deploy-to-server.sh

# Get help
./git-workflow-help.sh
scripts/git/git-workflow-help.sh
```

## 📝 Adding New Scripts

When adding new scripts, place them in the appropriate category:

- **Git-related**: `scripts/git/`
- **Deployment-related**: `scripts/deployment/`
- **Cloudflare-related**: `scripts/cloudflare/`
- **Setup/configuration**: `scripts/setup/`
- **Other utilities**: Create new category folder

Don't forget to:
1. Make scripts executable: `chmod +x script-name.sh`
2. Add to this README if it's commonly used
3. Consider adding a root-level wrapper for frequently used scripts