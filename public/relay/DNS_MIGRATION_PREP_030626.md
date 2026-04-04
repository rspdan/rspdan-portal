# DNS MIGRATION PREP — 030626
# Prepared by: STAN
# Status: RESEARCH ONLY — Do not execute until Trip gives go-ahead
# Estimated execution time: ~5 minutes once ready

---

## GOAL
Point ouchmccouch.com from Squarespace DNS → Vercel
Keep art.ouchmccouch.com pointing at Squarespace (old art site)

---

## STEP-BY-STEP EXECUTION PLAN (5-min run when ready)

### STEP 1 — Add domain to Vercel project
1. Go to: https://vercel.com/dashboard
2. Open the ouchmccouch-portal project
3. Project Settings → Domains
4. Click "Add" → type: ouchmccouch.com → confirm
5. Add again → type: www.ouchmccouch.com → confirm
6. Vercel will show you exact DNS values. Note them — they may be project-specific.

### STEP 2 — Log into Squarespace DNS
1. Go to: https://account.squarespace.com
2. Domains → ouchmccouch.com → DNS Settings

### STEP 3 — Add/edit DNS records in Squarespace

**For the root domain (ouchmccouch.com):**
| Type | Host/Name | Value              | TTL  |
|------|-----------|--------------------|------|
| A    | @         | 76.76.21.21        | Auto |

**For www:**
| Type  | Host/Name | Value               | TTL  |
|-------|-----------|---------------------|------|
| CNAME | www       | cname.vercel-dns.com | Auto |

> NOTE: Vercel may show a project-specific CNAME in their UI (like xyz.vercel-dns-016.com).
> Use whatever value Vercel shows you in Step 1 — those are preferred over the generic ones above.

### STEP 4 — Add art subdomain CNAME (keep Squarespace art site)
Squarespace's CNAME target is typically: ext-cust.squarespace.com
| Type  | Host/Name | Value                      | TTL  |
|-------|-----------|----------------------------|------|
| CNAME | art       | ext-cust.squarespace.com    | Auto |

> ALSO: Log into the Squarespace art site and add art.ouchmccouch.com as a domain there.
> Squarespace → Pages → Website Tools → External Domain → Add art.ouchmccouch.com

### STEP 5 — Verify in Vercel
1. Return to Vercel project settings → Domains
2. Click "Verify" next to ouchmccouch.com
3. SSL certificate auto-provisioned by Vercel (Let's Encrypt) — no action needed

### STEP 6 — Wait for propagation
- Typical: 5–30 minutes
- Worst case: 24–48 hours
- Check propagation at: https://dnschecker.org

---

## WHAT YOU'LL LOSE / WHAT YOU NEED TO CHECK FIRST
- Squarespace's existing DNS records (MX records for email if any, other CNAMEs)
- Log all existing DNS records BEFORE making changes (screenshot the DNS settings page)
- If ouchmccouch.com has an email address pointed to it, coordinate MX record migration separately

---

## SUMMARY
- ouchmccouch.com → Vercel (A record: 76.76.21.21)
- www.ouchmccouch.com → Vercel (CNAME: cname.vercel-dns.com)
- art.ouchmccouch.com → Squarespace (CNAME: ext-cust.squarespace.com)
- SSL: Auto (Vercel + Let's Encrypt, no action)
- Time: ~5 minutes to execute. Up to 24h to propagate.

**Do not execute until Trip confirms.**
