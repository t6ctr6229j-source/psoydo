# Website Build State

QUALITY_GATE: OPEN
AUTOMATION: DISABLED
BRANCH: polish/committee-90
PR: #2
DESIGN_GENERATION: V3

## V3 transformation completed
- rebuilt the homepage as a premium Enterprise-AI product story rather than a long stack of SaaS cards
- introduced a signature protection-membrane hero visual showing original data, Psoydo boundary and pseudonymized model payload
- introduced a four-state product narrative: understand, pseudonymize, external analysis, controlled return
- introduced a large illustrative control-room product surface with explicit non-binding UI labeling
- turned PIF into a full-width signature green section with learning-loop storytelling
- replaced generic use-case cards with editorial horizontal case rows
- rebuilt architecture as a large two-zone trust-boundary visual
- rebuilt security as a five-layer control stack
- rebuilt pricing around the paid 30-day evaluation as the visual focal point
- retained first-party registration UI and loads Typeform only after explicit user action

## New public pages
- /de/produkt.html
- /de/technologie.html — rebuilt in V3
- /de/architektur.html
- /de/anwendungsfaelle.html
- /de/sicherheit.html
- /de/preise.html — rebuilt in V3

## Current strengths
- much stronger premium product hierarchy and clear category framing
- distinct visual signatures instead of repeated card sections
- deep navigation for product, PIF, architecture, use cases, security and pricing
- claims remain deliberately conservative where product documentation is incomplete
- PIF content stays aligned with DOC-PIF-001 principles without exposing confidential internal examples or model names
- transparent evaluation-first pricing
- Typeform no longer visually owns the page before the visitor explicitly opens it
- mobile and reduced-motion behavior are supported
- core content is static HTML
- sitemap and automated QA cover all seven public product pages
- latest Website QA is green

## Deliberately blocked pending product documentation
- exact technical deployment topology and launch-ready operating modes
- authentication/SSO and roles/permissions
- exact logging/audit implementation
- APIs/connectors and supported model integrations
- throughput and processing limits
- exact Cloud test infrastructure and data-processing details
- real product screenshots
- checkout/payment-provider implementation

## Remaining risks
- V3 still needs real-browser full-page visual QA on desktop and mobile
- current product control-room is illustrative and should be replaced or reconciled with real product screenshots when available
- trust-strip claims from earlier versions should not be reintroduced without source verification
- font and consent implementation should be reviewed before final production release
- PR mergeability should be rechecked after the preview branch changes settle

## Next manual priorities
1. Full-page desktop capture of the V3 preview and one high-impact visual correction pass.
2. Mobile capture and correction pass.
3. Reconcile architecture/security/deployment copy against the next product documentation.
4. Replace illustrative product surfaces with real screenshots when available.
5. Final committee scorecard.

## Quality gate
The gate stays OPEN. Structural QA is green and the site now has a full premium multi-page information architecture, but visual browser QA and final technical documentation reconciliation are still required before claiming >=85% in every category.
