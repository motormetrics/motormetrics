---
name: release-management
description: Manage releases with semantic-release, version bumps, and changelog generation. Use when preparing releases, debugging release failures, or understanding version history.
---

# Release Management Skill

Automated releases via semantic-release with unified "v" prefix versioning.

## How It Works

1. Commits pushed to `main` trigger `.github/workflows/release.yml`
2. Checks run first (test + lint matrix)
3. semantic-release analyses commits since last tag
4. Version bumped based on commit types (see `conventional-commits` skill)
5. `CHANGELOG.md` updated automatically
6. All `package.json` files updated across the monorepo (`pnpm -r exec -- npm version`)
7. Git tag created with `v` prefix (e.g., `v4.46.0`)
8. GitHub Release created with auto-generated notes
9. Release commit created: `chore(release): v{version} [skip ci]`
10. Vercel auto-deploys the new version

## Version Scheme

- Format: `v{major}.{minor}.{patch}` (e.g., `v4.46.0`)
- Unified version across the entire monorepo
- Tag format configured in `.releaserc.json`: `"tagFormat": "v${version}"`

## Configuration

**`.releaserc.json`** plugins:
1. `@semantic-release/commit-analyzer` — conventionalcommits preset
2. `@semantic-release/release-notes-generator` — conventionalcommits preset
3. `@semantic-release/changelog` — writes `CHANGELOG.md`
4. `@semantic-release/exec` — bumps all package.json versions
5. `@semantic-release/git` — commits changelog + package.json changes
6. `@semantic-release/github` — creates GitHub Release, adds "released" label

## Checking Release Status

```bash
# View recent releases
gh release list --limit 5

# View specific release
gh release view v4.46.0

# Check release workflow status
gh run list --workflow=release.yml --limit 5

# View release workflow logs
gh run view <run-id> --log
```

## Debugging Release Failures

### Release Not Triggered
- Verify commit type is `feat` or `fix` (not `chore`, `docs`, etc.)
- Check workflow ran: `gh run list --workflow=release.yml`
- Verify branch is `main`

### Version Not Bumped
- Check commit message format matches conventional commits
- Look for `[skip ci]` in commit message (release commits include this)

### Workflow Failed
- Check GitHub Actions logs: `gh run view <run-id> --log`
- Common causes: test failures, lint errors, npm publish issues

## Manual Release (Emergency Only)

```bash
# Create tag manually
git tag -a v4.47.0 -m "v4.47.0"
git push origin v4.47.0

# Create GitHub release from tag
gh release create v4.47.0 --generate-notes
```

## Related

- See `conventional-commits` skill for commit message format
- See `changelog` skill for changelog details
- See `deployment-rollback` skill for rolling back releases
- Workflow: `.github/workflows/release.yml`
- Config: `.releaserc.json`
