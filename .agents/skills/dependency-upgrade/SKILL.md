---
name: dependency-upgrade
description: Upgrade dependencies safely using pnpm catalog, checking for breaking changes, and testing upgrades. Use when updating packages, applying security patches, upgrading major versions, resolving dependency conflicts, or modernizing tech stack.
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Dependency Upgrade Skill

Uses **pnpm with catalog** for centralized dependency management.

## Check for Updates

```bash
pnpm outdated                      # Check all outdated
pnpm -r outdated                   # Across workspace
pnpm -F @sgcarstrends/api outdated # Specific package
pnpm dlx taze --interactive        # Interactive upgrade
```

## Upgrade Process

### 1. Update Catalog

```yaml
# pnpm-workspace.yaml
catalog:
  next: ^16.0.0  # Upgraded from ^15.0.0
  react: ^19.0.0
```

Packages reference with `"package": "catalog:"` in package.json.

### 2. Install and Test

```bash
pnpm install
pnpm tsc --noEmit  # Type check
pnpm test          # Unit tests
pnpm biome check . # Lint
pnpm build         # Build
pnpm dev           # Manual testing
```

### 3. Fix Breaking Changes

```typescript
// Example: Next.js 16 async params
// Before
export default function Page({ params }: { params: { id: string } }) {
  return <div>{params.id}</div>;
}

// After
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>{id}</div>;
}
```

### 4. Commit

```bash
git commit -m "chore(deps): upgrade Next.js to v16

- Upgrade Next.js 15 → 16
- Upgrade React 18 → 19
- Fix async params migration

BREAKING CHANGE: Requires Node.js 20+"
```

## Major Version Upgrades

### Next.js

```bash
pnpm dlx @next/codemod@latest upgrade latest  # Run codemod
# Update catalog: next: ^16.0.0, react: ^19.0.0
pnpm install
# Fix: async params, async cookies/headers
```

### TypeScript

```bash
# Update catalog: typescript: ^5.3.3
pnpm install
pnpm tsc --noEmit  # Fix type errors
```

### Drizzle ORM

```bash
# Update catalog: drizzle-orm: ^0.30.0, drizzle-kit: ^0.20.0
pnpm install
pnpm -F @sgcarstrends/database db:generate  # If schema changed
```

## Security Updates

```bash
pnpm audit                 # Check vulnerabilities
pnpm audit --fix           # Auto-fix
# Or manually update vulnerable package in catalog
```

## Dependency Conflicts

```bash
pnpm why package-name      # Check dependency chain
pnpm dedupe                # Deduplicate
```

Use overrides as last resort:

```json
{ "pnpm": { "overrides": { "react": "^19.0.0" } } }
```

## Rollback

```bash
git reset --hard HEAD
# Or revert lockfile:
git checkout main -- pnpm-lock.yaml
pnpm install
```

## Troubleshooting

```bash
# Lockfile conflicts
rm pnpm-lock.yaml && pnpm install

# Build failures after upgrade
rm -rf node_modules .turbo dist .next && pnpm install && pnpm build
```

## Best Practices

1. **Use Catalog**: Centralize versions in pnpm-workspace.yaml
2. **Test Thoroughly**: Run all tests after upgrades
3. **Read Changelogs**: Review breaking changes before upgrading
4. **Upgrade Incrementally**: Don't update everything at once
5. **Commit Separately**: Separate dependency upgrades from features
6. **Automate Security**: Use Dependabot for security patches

## References

- pnpm Catalog: https://pnpm.io/catalogs
- Next.js Codemods: https://nextjs.org/docs/app/building-your-application/upgrading/codemods
- See `security` skill for vulnerability scanning
