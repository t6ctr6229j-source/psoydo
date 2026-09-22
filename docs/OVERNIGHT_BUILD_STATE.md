# Website Build State — 2026-09-22

QUALITY_GATE: OPEN (production readiness)
AUTOMATION: DISABLED
REPOSITORY: t6ctr6229j-source/psoydo_website
BASELINE: main @ 425c3934c8e634f6e8669060e97bd9dbc5fd67e8
PAGES_SOURCE: redesign/register-landingpage @ same commit
CURRENT_WORK: fix/renamed-repo-paths

## Current verified status

This section supersedes the historical snapshot below. PR #2 is closed and unmerged; its old branch and conflict notes are no longer the current work plan. Current changes are based on main and proposed in a fresh PR, without overwriting that historical branch.

- PR #10 merged: three real product screenshots, cropped top bars, homepage gallery and lightboxes.
- PR #11 merged: public-AI decision quiz with five scenarios and qualified trade-secret wording.
- PR #12 merged: navigation is Produkt / Use Cases / Sicherheit / Preise; shared CTA is “Pilot starten”, pointing to registration.
- PR #13 merged: section rhythm, spacing and desktop/mobile layout regression checks across all nine pages.
- PR #14 merged: on-page SEO, visible FAQ, JSON-LD, PNG social image, intrinsic image sizes, seven indexable sitemap URLs, legal-page noindex, SEO content plan and release checklist.
- GitHub Actions confirms successful Pages deployment of 425c393 after the rename (run 35709304078, 2026-09-22 09:15 UTC).
- The SEO PR's Website QA run 35704309312 succeeded. Historical Lighthouse numbers below are not a fresh measurement.

## Current bounded repair

The custom 404 previously resolved styles/images relative to the missing URL and linked to /de/, outside a GitHub project site. It now resolves assets and home links from the GitHub project prefix or custom-domain root and uses the official optimized logo. A browser regression exercises nested missing URLs under both hosting layouts at desktop/mobile widths, including keyboard recovery and the home link.

## Remaining release work

- Verify the actual psoydo.com deployment, HTTPS, canonical URLs, robots.txt, sitemap and social image before switching the domain.
- Reconcile production hosting and data-processing details with the privacy page and final product documentation.
- Verify the domain in Search Console and submit the sitemap after publication.
- Prioritize additional landing pages using docs/SEO_CONTENT_PLAN.md and actual search data; do not create speculative product claims.
- Merge and deployment still require explicit approval under the repository brief. No DNS, credentials or Search Console settings changed in this iteration.

## Historical snapshot (superseded where noted above)


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


## 2026-09-22 — Petrol / mint / coral brand refinement
- User-approved palette: petrol #071D22, mint #5DF5B8, coral #FF806C, warm off-white #F5F2EB.
- Updated shared surfaces, panels, transparent header backgrounds and browser theme colors across all nine pages and the 404.
- Coral accents the home headline, home outcomes, product context statement and use-case closing section. Mint retains action and pseudonymization roles; quiz/entity semantics and original product screenshots are preserved.
- Warmer neutral reading sections and mint CTA buttons keep technical/security/pricing pages restrained.
- Added stylesheet cache versions, including query-safe stylesheet detection on the 404.
- Static QA and JavaScript syntax pass. Local intercepted-file Chromium review covers 1440px and 390px; targeted grid/heading wrapping addresses long German text overflow. GitHub CI provides the full Lighthouse and browser gate.
- This color iteration awaits explicit merge approval under the repository rule; no production publication yet.


## 2026-09-22 — Coral reduced to accents
- User correction: coral must not be used for large backgrounds.
- Restored petrol home outcomes and warm off-white product/context and use-case closing sections.
- Retained coral home headline and small labels/rules; primary actions remain mint.
- Refreshed CSS cache versions. This supersedes the large coral surfaces in the previous color iteration.


## 2026-09-22 — Remove coral completely
- User supersedes earlier coral palette decisions: remove every coral brand accent.
- Hero highlights and dark-section labels now use mint. Product label and divider return to the existing neutral styles. Removed coral tokens/classes and refreshed stylesheet cache versions.
- Petrol, mint and warm off-white remain the approved palette.


## 2026-09-22 — Registration release readiness
- Hardened registration loading with a readiness deadline, retry, stale-callback guard and email fallback. Added a Typeform/privacy notice and no-JavaScript email link.
- Added CI regression scenarios for deferred loading, failure/retry, readiness and stalled widgets at desktop/mobile sizes. Local tests pass; third-party widget is mocked, no external lead submitted.
- See GO_LIVE_READINESS.md for current domain/hosting, registration delivery, commercial flow and measurement decisions. In particular, united-domains in privacy copy is not reconciled with current GitHub Pages publication.
- No DNS, legal facts, hosting configuration or external form settings changed. Merge awaits explicit approval.


## 2026-09-22 — Insights hub and eight editorial articles
- Added a static Insights collection with foundations, protection/responsibility, architecture and practical use cases.
- Added eight distinct articles with short answers, in-page contents, concrete fictional examples, practical checks, related reading and appropriate primary-source links.
- Navigation and footer now expose Insights on all eighteen pages; homepage includes an editorial entry. Article/CollectionPage/Breadcrumb metadata and sitemap cover the new content.
- Inquiry CTAs explicitly describe personal qualification, offer, invoice and activation; Stripe is deferred by user decision. Production host confirmed as United Domains, psoydo.com.
- Static QA and browser captures extended to the new pages. Deployment/indexing and real form receipt still require live checks.
- Built on the open registration-readiness PR; merge/publication awaits explicit approval under the repository brief.
- Validation: static QA passes on all eighteen pages; Chromium checks pass at 390/1024/1440px (54 page/viewport combinations), including no horizontal overflow or navigation collisions, working article anchors and mobile menu. Desktop hub and mobile article screenshots visually reviewed. External calls were blocked; no leads submitted. CI additionally audits hub/article Lighthouse scores.


## 2026-09-22 — Approved preview publication and hosting package
- User approved continuing toward go-live after the explicit PR #20 merge/publication proposal. Squash-merged PR #20 as d5219dd590a75219e5f63a89c12adf866b93c050 and fast-forwarded the publishing branch. Pages run 35759274316 succeeded. PR #19 is superseded by the combined release.
- Prepared a public-file upload ZIP builder, dependency/integrity checks, SHA-256 manifest and artifact-only GitHub workflow. No external deployment connection or credentials.
- Actual United Domains product, document root, SFTP configuration, TLS and live form receipt remain account-side checks. Hosting guide documents rollback and URL/404 requirements.


## 2026-09-22 — GA4 and shared consent
- Added user-supplied GA4 ID G-EYFT82SFN7. Statistics and existing Ads tracking are separate opt-ins on all 18 pages. Old Ads-only consent does not grant Analytics.
- Production-host allowlist excludes Pages/local previews; sanitized page/referrer URLs, fixed registration event payloads, and duplicate-callback guards.
- Withdrawal disables the runtime and reloads with saved choices. Mock Chromium tests cover consent lifecycle and registration events on mobile/desktop; no real measurements or inquiries sent.
- Account-side retention, tag destinations, enhanced measurement and live receipt remain open in MEASUREMENT.md.
- SFTP deployment workflow remains the next hosting task; user reports the three UD_SFTP secrets have been saved per repository. No password read or production upload performed.

## Deployment preparation — 2026-09-22
- User authorized go-live. PR22 CI revealed delayed consent stealing focus from the product lightbox; consent now opens immediately and the lightbox test dismisses it explicitly.
- Added manual main-only United Domains SFTP workflow: pinned host fingerprint, checksum read-back, isolated staging, retained previous release and activation rollback.
- Remaining external requirements: verified UD_SFTP_FINGERPRINT secret, domain psoydo.com mapped to psoydo directory, HTTPS and public smoke test. No production upload claimed.
