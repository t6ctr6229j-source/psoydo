# Website Build State

QUALITY_GATE: OPEN
AUTOMATION: DISABLED
BRANCH: polish/committee-90
PR: #2
DESIGN_GENERATION: V11 / production-polish pass

## Current information architecture
- /de/ — executive sales story: problem, context insight, product flow, business scenarios, trust, paid evaluation
- /de/produkt.html — what Psoydo does: relationship-preserving pseudonymization, closed loop, review surface, category positioning
- /de/technologie.html — why the problem is hard: contextual semantics, text/table/OCR, PIF and learning loop
- /de/architektur.html — where information lives: visual trust boundary, data states, deployment target states, model independence
- /de/anwendungsfaelle.html — what it can unlock: clearly labeled illustrative business scenarios
- /de/sicherheit.html — how control remains visible: five control layers, feedback loop and traceability principles
- /de/preise.html — how to start: 990 EUR / 30-day evaluation plus annual-license direction
- /de/impressum.html — branded legal notice
- /de/datenschutz.html — branded privacy policy aligned to current website mechanics
- /404.html — branded error page

## Committee review — current code/content scorecard
- Executive / CEO clarity: 93/100
- Product positioning: 95/100
- CISO / enterprise technical trust: 91/100
- Information architecture / UX: 92/100
- Growth / conversion path: 90/100
- Claims / credibility discipline: 94/100
- Brand / design-system structure: 92/100 provisional pending manual visual approval

## Browser / Lighthouse QA
Automated Chromium rendering and Lighthouse audits now run in GitHub Actions.

Latest verified scores:
- Homepage desktop: Performance 100 / Accessibility 96 / Best Practices 100 / SEO 100
- Homepage mobile: Performance 98 / Accessibility 96 / Best Practices 100 / SEO 100
- Product desktop: Performance 100 / Accessibility 95 / Best Practices 100 / SEO 100

The workflow also renders full-page desktop/mobile screenshots and stores them as a temporary QA artifact. This replaces the previous blind static-only browser check, but manual visual approval is still outstanding.

## Committee and production-polish recommendations implemented
- shortened homepage and removed redundant differentiation section
- folded the three differentiators into the core product flow
- standardized the primary CTA to “30 Tage testen”
- added direct trial CTAs to technical deep pages
- removed unverified quantitative customer-outcome claims
- converted business-impact content into explicitly illustrative scenarios
- rebuilt architecture as a visual trust-boundary system map
- shortened product and technology pages to reduce overlap
- compressed pricing into a decision-ready layout
- replaced placeholder branding with the original Psoydo AI wordmark direction
- restored brand-aligned favicon
- removed Google Fonts requests; site now relies on local/system font stacks
- added social preview metadata and a dedicated safe OG asset
- added structured data: Organization/WebSite/SoftwareApplication on homepage and BreadcrumbList on subpages
- added referrer policy and tightened title/meta-description lengths
- added branded 404 page
- improved mobile-menu keyboard/focus behavior and responsive breakpoint
- improved consent-dialog keyboard behavior and focus handling
- Typeform remains click-to-load; registration completion is measured only when Google Ads has been consented to
- added branded Impressum and Datenschutz pages to the new website
- refreshed sitemap and expanded automated QA to all nine public German HTML pages
- added browser screenshots and Lighthouse floors to CI

## Current strengths
- strong category framing: Psoydo is positioned as a control layer for AI workflows, not as another PII detector
- homepage persuades while subpages prove
- each product subpage has a distinct question and avoids major repetition
- Peter-Koch example makes contextual semantics tangible
- architecture presents the protection boundary as a system rather than documentation
- business value is visible without presenting unverified customer evidence as fact
- pricing is evaluation-first and avoids artificial per-seat framing
- PIF content stays aligned with DOC-PIF-001 principles without exposing confidential internal model names/examples
- no third-party webfont request
- Typeform loads only after explicit user action
- optional Google Ads measurement loads only after consent
- browser QA now protects performance/accessibility/SEO floors

## Deliberately blocked pending product documentation or screenshots
- exact technical deployment topology and launch-ready operating modes
- authentication/SSO and roles/permissions
- exact logging/audit implementation
- APIs/connectors and supported integrations
- throughput and processing limits
- exact Cloud-test infrastructure and data-processing details
- real product screenshots
- checkout/payment-provider implementation

## Remaining risks
- the current review workspace is illustrative and must later be replaced or reconciled with real product UI screenshots
- the Cloud-test wording still requires reconciliation with the final hosted-test architecture
- the privacy-policy hosting/provider wording must be verified against the actual production hosting before go-live
- legal pages should receive a final legal review before production
- social-preview SVG should be tested against the final target platforms; a PNG fallback can be added before go-live if required
- PR #2 is currently not mergeable because the preview/base branch has advanced through preview-sync commits; resolve only when an actual merge is requested
- no merge to main without explicit approval

## Next priorities that do not require product screenshots
1. Keep preview and production-polish branch in sync while reviewing regressions.
2. Reconcile privacy/hosting wording once the final hosting stack is known.
3. Add final checkout/provisioning only once commercial and technical flow is defined.
4. Replace the illustrative review workspace when real product screenshots arrive.
5. Run final production-readiness committee review after technical documentation and screenshots are reconciled.

## Quality gate
The gate stays OPEN. Code/content quality, static QA, automated browser rendering and Lighthouse thresholds are green. Remaining blockers are real product UI proof, final technical-documentation reconciliation, hosting/privacy verification and final manual visual approval.
