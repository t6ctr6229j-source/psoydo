# Psoydo — Go-live readiness

Reviewed 2026-09-22 against main `6d8f162` (PR #18). This is an evidence checklist, not a claim of production readiness.

## Confirmed
- Nine public pages, navigation, prices, product images, SEO metadata and sitemap exist.
- PR #18 Website QA and GitHub Pages deployment passed.
- Pages currently publishes from `redesign/register-landingpage`; publishing main alone is insufficient.
- Approved palette: petrol, mint, warm off-white. No coral.
- Canonical and social URLs already target `https://psoydo.com/de/`.

## This release preparation
- Registration script/network/widget errors and a 15-second readiness timeout offer retry and a direct email alternative.
- Retry ignores stale callbacks, returns keyboard focus and uses a fresh script when needed.
- Typeform provider/privacy notice appears before opening. No-JavaScript users get a working email link.
- Automated local browser tests cover no embed before user action, failed load, retry, successful ready callback, stalled iframe and late callbacks at 390px and 1440px.
- Tests mock the third-party widget. They do not verify the real form's questions, recipients or notifications and submit no external data.
- Typeform readiness callback reference: https://www.typeform.com/developers/embed/callbacks/

## Release blockers / decisions
| Item | Evidence / missing information | Acceptance |
| --- | --- | --- |
| Final hosting | Privacy section 3 names united-domains, but the current published preview runs on GitHub Pages. Registrar and hosting can be different providers. | Flo confirms the actual production host. Match hosting copy, processing-contract statement and log-retention claims to verified facts. |
| Domain / HTTPS | psoydo.com is the intended canonical domain. A public retrieval did not succeed in this environment; this does not prove a DNS or website outage. | Verify apex/www routing, certificate, HTTPS and all nine pages at the target host; follow SEO_RELEASE_CHECKLIST.md. |
| Registration delivery | Code references Typeform ID 01KVRJN19YZ8J86JFQYX9N09QG. Live form configuration is not verified. | Verify live publication, required fields, success screen and recipient. With approval, submit one marked test and confirm receipt and response process. |
| Commercial next step | Website presents a EUR 990 net / 30-day evaluation. No checkout or automatic provisioning was established by this review. | Confirm whether registration is an inquiry followed by offer/invoice or an order; align form and follow-up to that decision. |
| Ads / consent | Ads ID AW-18355213487 exists; custom submit event is not evidence of a configured Google Ads conversion. | Confirm whether Ads is needed at launch. Test deny/accept/revoke/reaccept and actual network behavior; verify conversion configuration before campaigns. |
| Final product facts | Claims about cloud trial, available deployment models and operating responsibilities need a product-owner check. | Confirm current offer and operational terms against real service delivery. |

## Deployment sequence once decisions are settled
1. Merge only explicitly approved, green PRs.
2. If keeping Pages, fast-forward the publishing branch to the approved main commit and verify the matching Pages run. For another host, use its agreed deployment process.
3. Configure the chosen domain and HTTPS; check root -> /de/, all pages, nested 404, logos, screenshots and mobile navigation.
4. Run the approved live registration test and verify receipt; test Safari/iPhone with the real embed.
5. Complete Search Console verification and sitemap submission. Check social preview from the final domain.
6. Record the deployed commit and test date here. Roll back by reverting the release commit through the same publishing process if necessary.

Do not change DNS, claim contracts exist, submit external test leads or enable ad campaigns based on assumptions.
