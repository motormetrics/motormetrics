---
name: deployment-rollback
description: Rollback failed deployments, restore previous versions, and handle deployment emergencies. Use when deployments fail, critical bugs are discovered in production, performance degrades after deployment, or emergency recovery is needed.
allowed-tools: Read, Edit, Write, Bash, Grep
---

# Deployment Rollback Skill

## Quick Rollback via Vercel

### Using Vercel Dashboard

1. Go to Vercel Dashboard → Project → Deployments
2. Find the previous working deployment
3. Click the three dots menu → "Promote to Production"

### Using Vercel CLI

```bash
# List recent deployments
vercel list

# Promote a specific deployment to production
vercel promote <deployment-url>

# Or rollback to previous production deployment
vercel rollback
```

## Database Rollback

```bash
# Rollback last migration
pnpm -F @sgcarstrends/database db:rollback

# Rollback to specific migration
pnpm -F @sgcarstrends/database db:rollback --to 20240115_initial

# Restore from backup
pg_dump $DATABASE_URL > backup-pre-deploy.sql  # Before deploy
psql $DATABASE_URL < backup-pre-deploy.sql     # Restore if needed
```

## Git-Based Rollback

```bash
# Revert specific commit
git revert <commit-hash>
git push origin main  # Triggers Vercel redeploy

# Create rollback branch
git checkout -b rollback/v1.1.0
git reset --hard v1.1.0
git push origin rollback/v1.1.0
gh pr create --title "Rollback to v1.1.0" --body "Emergency rollback"
```

## Cache Invalidation

```bash
# Revalidate Next.js cache
curl -X POST "https://sgcarstrends.com/api/revalidate?tag=all&secret=$REVALIDATE_TOKEN"

# Clear Redis cache
redis-cli -h $REDIS_HOST FLUSHALL
```

## Health Checks During Rollback

```bash
curl -f https://sgcarstrends.com || echo "Web unhealthy"
psql $DATABASE_URL -c "SELECT 1" || echo "Database unreachable"
```

## Rollback Checklist

**Pre-Rollback:**
- [ ] Identify issue and severity
- [ ] Determine scope (full/partial)
- [ ] Check backup availability
- [ ] Notify team

**During:**
- [ ] Rollback via Vercel dashboard or CLI
- [ ] Rollback database if needed
- [ ] Clear caches
- [ ] Verify health checks
- [ ] Run smoke tests

**Post:**
- [ ] Monitor error rates in Vercel dashboard
- [ ] Verify functionality restored
- [ ] Document what happened
- [ ] Create postmortem

## Common Scenarios

**Critical Bug:**
```bash
vercel rollback
curl https://sgcarstrends.com/api/health
```

**Database Migration Failure:**
```bash
pnpm -F @sgcarstrends/database db:rollback
git revert HEAD
git push origin main
```

## Troubleshooting

**Rollback deployment not working:**
```bash
# Force redeploy from known good commit
git checkout v1.1.0
vercel --prod
```

**Database schema mismatch:**
```bash
pnpm -F @sgcarstrends/database db:rollback
# Or restore backup: psql $DATABASE_URL < backup-pre-deploy.sql
```

## Best Practices

1. **Always Backup**: Create database backups before major deployments
2. **Test Rollback**: Practice rollback procedures in preview deployments
3. **Feature Flags**: Use for quick feature disabling without rollback
4. **Monitor Closely**: Watch Vercel analytics during and after rollback
5. **Document Everything**: Record what happened and why

## References

- Vercel Rollbacks: https://vercel.com/docs/deployments/rollbacks
- See `monitoring` skill for debugging issues
