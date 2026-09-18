# Website Build State

QUALITY_GATE: OPEN
AUTOMATION: DISABLED
BRANCH: polish/committee-90
PR: #2

## Current strengths
- distinctive hero and clear Enterprise-AI promise
- visual pseudonymization demonstration
- PIF technology story and dedicated technology page
- protection-boundary architecture presented statically in the homepage
- concrete Legal, HR and IT/Security use cases
- transparent pricing with a deliberately prominent paid 30-day Cloud test
- pricing language avoids a fake checkout promise
- cross-page desktop and mobile navigation is consistent
- keyboard focus states and reduced-motion handling are present
- canonical, OpenGraph and Twitter metadata are present on core public pages
- core homepage content is static HTML rather than JavaScript-injected
- automated Website QA is green on the current branch

## Completed manual pass
- redesigned `/de/preise.html` away from a generic SaaS pricing grid
- aligned homepage pricing with the dedicated pricing page
- removed “SOFORT BESTELLBAR” until a real checkout exists
- added explicit test-license guardrails: 30 days, no automatic renewal, one per organization and full credit when directly converting
- improved mobile hierarchy while preserving product evidence
- aligned navigation, footer and CTA paths across homepage, technology and pricing
- added keyboard focus and reduced-motion support
- added canonical and social metadata
- moved PIF, architecture, pricing, final messaging, use cases and security controls into static homepage HTML
- reduced `app.js` to behavior only and bounded Typeform initialization
- strengthened QA to require static core sections, canonical metadata, price guardrails and absence of unapproved claims

## Current risk areas
- a real-browser visual QA across desktop/tablet/mobile is still outstanding
- product UI is still an illustrative marketing mockup rather than a real screenshot
- exact deployment/security claims remain intentionally conservative pending product documentation
- registration is not yet a real order/checkout workflow
- Google Fonts and the embedded Typeform should be reviewed together with the privacy implementation before production release
- current wescaleIT trust-strip claims should be source-verified before final production publication

## Blocked until documentation arrives
- exact technical deployment topology and which modes are launch-ready
- authentication/SSO and roles/permissions
- exact logging/audit implementation
- APIs/connectors and supported model integrations
- throughput, limits and document/page volumes
- exact Cloud test infrastructure and data-processing details
- real product screenshots
- checkout/payment-provider implementation

## Next manual priorities
1. Real-browser visual QA at desktop, tablet and mobile widths.
2. Replace illustrative product UI with real product surfaces when screenshots arrive.
3. Reconcile every architecture/deployment/security statement with the new software documentation.
4. Review Typeform, fonts and consent behavior as one privacy/performance decision.
5. Final committee scorecard after visual QA and documentation reconciliation.

## Quality gate
The gate stays OPEN. Automated structural QA is green, but product evidence and real-browser visual validation are still missing, so an honest >=85% score in every category cannot yet be asserted.
