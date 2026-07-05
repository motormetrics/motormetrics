---
name: domain-management
description: Configure domain routing and DNS for sgcarstrends.com. Use when adding new services, updating domain patterns, or debugging DNS issues.
allowed-tools: Read, Edit, Grep, Glob
---

# Domain Management Skill

This skill helps you manage domains and DNS configuration for the SG Cars Trends platform.

## When to Use This Skill

- Configuring custom domains in Vercel
- Debugging domain resolution issues
- Setting up redirects
- Troubleshooting SSL/TLS errors

## Domain Architecture

### Domain Structure

```
sgcarstrends.com                    # Production web app
*.vercel.app                        # Preview deployments
```

### DNS Provider: Vercel

Vercel handles DNS management with automatic SSL certificates.

**Features:**
- Automatic SSL/TLS certificates
- Global edge network
- Fast DNS propagation
- Built-in DDoS protection

## Vercel Domain Configuration

### Adding Custom Domain

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add `sgcarstrends.com`
3. Follow DNS configuration instructions
4. Vercel automatically provisions SSL certificate

### DNS Records

Point your domain to Vercel:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

Or use Vercel nameservers for full DNS management.

## Debugging DNS Issues

### Check DNS Propagation

```bash
# Check DNS resolution
dig sgcarstrends.com
dig @8.8.8.8 sgcarstrends.com

# Or use online tools
# https://www.whatsmydns.net/#A/sgcarstrends.com
```

### Check SSL Certificate

```bash
# Check certificate details
openssl s_client -connect sgcarstrends.com:443 -servername sgcarstrends.com

# Check certificate expiry
echo | openssl s_client -connect sgcarstrends.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Test Domain Resolution

```bash
# Test HTTPS
curl -I https://sgcarstrends.com

# Test redirect (www → apex)
curl -I https://www.sgcarstrends.com
```

### Common Issues

**Issue**: DNS not resolving
**Solutions**:
1. Check DNS records in Vercel dashboard
2. Verify nameserver configuration
3. Wait for propagation (usually < 5 minutes)

**Issue**: SSL certificate error
**Solutions**:
1. Check domain is verified in Vercel
2. Wait for certificate provisioning (up to 24 hours)
3. Check domain DNS points to Vercel

**Issue**: 404 on custom domain
**Solutions**:
1. Verify domain is added to correct project
2. Check deployment is successful
3. Verify build output

## Security Headers

Configure in `next.config.ts`:

```typescript
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
```

## References

- Vercel Domains: https://vercel.com/docs/projects/domains
- Vercel DNS: https://vercel.com/docs/projects/domains/dns

## Best Practices

1. **Use Apex Domain**: `sgcarstrends.com` for cleaner URLs
2. **HTTPS Only**: Vercel enforces HTTPS automatically
3. **www Redirect**: Configure www → apex redirect
4. **Monitor**: Check Vercel dashboard for domain status
