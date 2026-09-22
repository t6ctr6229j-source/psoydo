# Psoydo Website

Website repository for psoydo.com.

## Canonical website

The production website lives at the repository root. There is no separate `preview/` copy.

- `/de/` — landing page
- `/de/produkt.html` — product workflow
- `/de/technologie.html` — PIF / technology
- `/de/architektur.html` — deployment and trust boundaries
- `/de/anwendungsfaelle.html` — illustrative use cases
- `/de/sicherheit.html` — controls and security
- `/de/preise.html` — pricing and 30-day evaluation
- `/de/insights.html` — editorial hub and eight topic articles
- `/de/impressum.html` / `/de/datenschutz.html` — legal pages

Repository: `t6ctr6229j-source/psoydo_website` (renamed from `psoydo`).

GitHub Pages deploys from `redesign/register-landingpage`. As verified on 2026-09-22, that branch and `main` both point to `d5219dd` (PR #20, Insights and registration recovery).

- GitHub Pages: https://t6ctr6229j-source.github.io/psoydo_website/de/
- Planned canonical production URL: https://psoydo.com/de/

Canonical, sitemap and social URLs intentionally use `psoydo.com`, not the repository name. Domain publication and Search Console verification remain separate release tasks; see `docs/SEO_RELEASE_CHECKLIST.md`.

See `docs/GO_LIVE_READINESS.md` for launch blockers and acceptance steps.

For United Domains upload preparation, run `python scripts/build_release.py`. The ZIP and checksum manifest are written to `dist/`. See `docs/UNITED_DOMAINS_DEPLOYMENT.md` for the upload procedure and `.github/workflows/release-package.yml` for artifact generation; this does not deploy automatically.

## Quality controls

- `scripts/qa_site.py` — dependency-free static checks
- `.github/workflows/website-qa.yml` — syntax, smoke, Lighthouse and browser QA
- `docs/WEBSITE_AGENT_BRIEF.md` — product, claims and design guardrails
- `docs/OVERNIGHT_BUILD_STATE.md` — bounded iterative build state

Motion respects `prefers-reduced-motion`; `?motion=1` can be used for explicit visual QA.
