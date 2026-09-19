# Psoydo

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
- `/de/impressum.html` / `/de/datenschutz.html` — legal pages

GitHub Pages deploys from `redesign/register-landingpage`. The same production tree is intended to be mirrored to `main`.

## Quality controls

- `scripts/qa_site.py` — dependency-free static checks
- `.github/workflows/website-qa.yml` — syntax, smoke, Lighthouse and browser QA
- `docs/WEBSITE_AGENT_BRIEF.md` — product, claims and design guardrails
- `docs/OVERNIGHT_BUILD_STATE.md` — bounded iterative build state

Motion respects `prefers-reduced-motion`; `?motion=1` can be used for explicit visual QA.
