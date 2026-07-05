---
name: code-review
description: Perform automated code reviews checking for security vulnerabilities, performance issues, and code quality. Use before creating PRs, when reviewing complex changes, checking for security issues, or identifying performance problems.
allowed-tools: Read, Grep, Glob, Bash
---

# Code Review Skill

## Quick Checks

```bash
# Run all automated checks
pnpm biome check .
pnpm tsc --noEmit
pnpm test

# Search for common issues
grep -r "any" apps/ packages/ --include="*.ts"       # any usage
grep -r "console.log" apps/ packages/ --include="*.ts"  # debug logs
grep -r "TODO" apps/ packages/ --include="*.ts"      # TODOs
```

## Review Checklist

**Functionality:** Code works, edge cases handled, no obvious bugs
**Code Quality:** Readable, small focused functions, descriptive names, no duplication
**Type Safety:** No `any`, proper TypeScript types, well-defined interfaces
**Testing:** New code has tests, tests cover edge cases
**Performance:** No unnecessary re-renders, optimized queries, no N+1
**Security:** No SQL injection, XSS, or exposed secrets; input validation present

## Common Anti-Patterns

```typescript
// ❌ Magic numbers → ✅ Use constants
if (user.age > 18) {}          // Bad
if (user.age >= LEGAL_AGE) {}  // Good

// ❌ Deep nesting → ✅ Early returns
if (!user || !user.isActive) return;

// ❌ Using any → ✅ Proper typing
function process(data: any) {}           // Bad
function process(data: UserData) {}      // Good

// ❌ SQL injection → ✅ Parameterized queries
const query = `SELECT * FROM users WHERE id = ${userId}`;  // Bad
db.query.users.findFirst({ where: eq(users.id, userId) }); // Good

// ❌ N+1 queries → ✅ Single query with join
for (const post of posts) { post.author = await db.query.users... }  // Bad
db.query.posts.findMany({ with: { author: true } });                  // Good

// ❌ Missing memoization → ✅ useMemo for expensive ops
const data = expensiveOperation(data);          // Bad
const data = useMemo(() => expensiveOperation(data), [data]); // Good
```

## Review Comments

Use these markers for clarity:

- **🔴 Must Fix**: Critical issues blocking merge (security, bugs)
- **🟡 Should Fix**: Important but not blocking
- **🟢 Suggestion**: Nice to have
- **💡 Learning**: Educational context
- **❓ Question**: Requesting clarification

## Self-Review Before PR

```bash
git diff main...HEAD                    # View changes
pnpm biome check --write .              # Format/lint
pnpm tsc --noEmit                       # Type check
pnpm test                               # Run tests
git diff --stat main...HEAD             # Check PR size
```

## Framework-Specific Checks

**React:** Check hooks usage, memoization, key props, useEffect deps
**Next.js:** Server vs client components, 'use client' directive, metadata
**Drizzle:** Proper indexing, N+1 queries, transactions

## Best Practices

1. **Be Constructive**: Focus on improvement, not criticism
2. **Explain Why**: Provide context for suggestions
3. **Prioritize**: Mark critical vs nice-to-have
4. **Be Timely**: Review PRs promptly

## References

- See `security` skill for security auditing
- See `performance` skill for performance optimization
