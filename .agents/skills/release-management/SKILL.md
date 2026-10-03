---
name: release-management
description: Manage releases with release-please, version bumps, and changelog generation. Use when preparing releases, debugging release failures, or understanding version history.
---

# Release Management Skill

Releases are managed by release-please with unified "v" prefix versioning.

## How It Works

1. Commits pushed to `main` trigger `.github/workflows/release.yml`
2. release-please analyses conventional commits since the last release
3. It opens or updates a single Release PR titled `chore: release v{version}`, which bumps every
   `package.json` and prepends the new entry to `CHANGELOG.md`
4. Nothing is released until the Release PR is merged; Claude decides when (see below)
5. Merging it creates the `v{version}` tag and the GitHub Release

`feat` bumps the minor version, `fix` and `perf` bump the patch, and `feat!` or a `BREAKING CHANGE`
footer bumps the major.

## When to Merge the Release PR

Claude owns this decision, not Ru. Check the open Release PR whenever a feature PR merges and during
triage, then merge it when the criteria below are met.

**Merge when:**
- It contains at least one `feat`, or
- It is fix- or perf-only and has been open for 7 days or more

**Hold when:**
- The latest production deployment of `main` failed, or a revert of something in it is pending
- The Release PR changes anything besides `CHANGELOG.md`, `.release-please-manifest.json` and the
  `version` fields; investigate instead

**Ask Ru first when:**
- It is a major bump (`feat!` or a `BREAKING CHANGE` footer)

Merge with `gh pr merge <number> --squash` so `main` gets one `chore: release v{version}` commit. Report the version and the PR link afterwards.

## Version Scheme

- Format: `v{major}.{minor}.{patch}` (e.g., `v5.31.0`)
- Unified version across the entire monorepo
- Tags have no component prefix (`include-component-in-tag: false`)

## Configuration

- **`release-please-config.json`**: `release-type: node` for the root package, with every workspace
  `package.json` listed under `extra-files` so they share the root version
- **`.release-please-manifest.json`**: the current version; release-please updates it in each Release PR

A new workspace package needs an `extra-files` entry, or its version will drift.

## Checking Release Status

```bash
# View the open Release PR
gh pr list --label "autorelease: pending"

# View recent releases
gh release list --limit 5

# Check release workflow status
gh run list --workflow=release.yml --limit 5
```

## Debugging

### No Release PR
- Only `feat`, `fix`, `perf` and breaking commits trigger a release; `chore`, `docs` and similar do not
- Check the workflow ran: `gh run list --workflow=release.yml`

### Release PR has no checks
- PRs opened with `GITHUB_TOKEN` do not trigger other workflows, so PR checks do not run on the Release PR.
  It only changes versions and the changelog

### Force a specific version
- Add a commit with a `Release-As: x.y.z` footer, or set `release-as` in `release-please-config.json`

## Related

- See `changelog` skill for changelog details
- See `deployment-rollback` skill for rolling back releases
- Workflow: `.github/workflows/release.yml`
