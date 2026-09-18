# Website Build State

QUALITY_GATE: OPEN
AUTOMATION: DISABLED
BRANCH: polish/committee-90
PR: #2
DESIGN_GENERATION: V10 / committee pass

## Current information architecture
- /de/ — executive sales story: problem, context insight, product flow, business scenarios, trust, paid evaluation
- /de/produkt.html — what Psoydo does: relationship-preserving pseudonymization, closed loop, review surface, category positioning
- /de/technologie.html — why the problem is hard: contextual semantics, text/table/OCR, PIF and learning loop
- /de/architektur.html — where information lives: visual trust boundary, data states, deployment target states, model independence
- /de/anwendungsfaelle.html — what it can unlock: clearly labeled illustrative business scenarios
- /de/sicherheit.html — how control remains visible: five control layers, feedback loop and traceability principles
- /de/preise.html — how to start: 990 EUR / 30-day evaluation plus annual-license direction

## Committee review — current code/content scorecard
- Executive / CEO clarity: 93/100
- Product positioning: 95/100
- CISO / enterprise technical trust: 91/100
- Information architecture / UX: 92/100
- Growth / conversion path: 90/100
- Claims / credibility discipline: 94/100
- Brand / design-system structure: 89/100 (provisional until real-browser visual QA)

Committee threshold is met in the current code/content review. The design score remains provisional because no full-page browser render has been inspected.

## Committee recommendations implemented
- shortened the homepage from eight to seven sections and removed the redundant full “Warum anders” section
- folded the three differentiators into the product-flow section: case instead of file, context instead of hit, closed loop instead of export
- reduced homepage vertical spacing to improve pacing without collapsing the premium hierarchy
- standardized the global primary CTA to “30 Tage testen”
- added direct trial CTAs to technology, architecture and security deep pages while retaining secondary deep-dive links
- removed unverified quantitative customer-outcome claims from homepage and use-case pages
- converted business-impact content into clearly labeled illustrative scenarios
- removed implied proof through named external models in use-case stories; model choice is described generically
- softened hero architecture wording so it communicates separation of original reference and model context without overclaiming a final deployment topology
- hardened automated QA against the reintroduction of unverified outcome claims, absolute compliance claims and CTA drift
- rebuilt architecture as a visual trust-boundary system map
- shortened product and technology pages to reduce overlap

## Current strengths
- strong category framing: Psoydo is positioned as a control layer for AI workflows, not as another PII detector
- homepage now persuades while subpages prove
- each subpage has a distinct question and avoids major repetition
- Peter-Koch context example makes the technical differentiation tangible
- architecture presents the boundary as a system rather than documentation
- business value is visible without presenting unverified customer evidence as fact
- pricing is evaluation-first and avoids artificial per-seat framing
- PIF content remains aligned with DOC-PIF-001 principles without exposing confidential internal model names/examples
- Typeform loads only after explicit user action
- core content is static HTML and automated QA covers all seven public product pages

## Deliberately blocked pending product documentation
- exact technical deployment topology and launch-ready operating modes
- authentication/SSO and roles/permissions
- exact logging/audit implementation
- APIs/connectors and supported integrations
- throughput and processing limits
- exact Cloud-test infrastructure and data-processing details
- real product screenshots
- checkout/payment-provider implementation

## Remaining risks
- full-page desktop and mobile browser rendering has not yet been visually inspected
- current review workspace is illustrative and must later be reconciled with the real product UI
- Google Fonts and final consent/privacy implementation should be reviewed before production release
- Cloud-test wording still requires reconciliation with the final hosted-test architecture
- PR mergeability should be rechecked before any merge; no merge to main without explicit approval

## Next manual priorities
1. Real-browser desktop full-page visual QA.
2. Real-browser mobile visual QA.
3. Replace or reconcile illustrative product UI with real product screenshots.
4. Reconcile architecture/security/Cloud-test copy against the final technical documentation.
5. Final production-readiness committee review after the visual and documentation gates.

## Quality gate
The gate stays OPEN. The code/content committee review now clears the 85-point threshold in every assessed category, but final visual-browser QA and technical-documentation reconciliation are still required before calling the website production-ready.
