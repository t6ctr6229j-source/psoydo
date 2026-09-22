# Psoydo — Go-live readiness

Updated 2026-09-22 after approved PR #20 merged as `d5219dd590a75219e5f63a89c12adf866b93c050`. This is an evidence checklist, not a claim of production readiness.

## Confirmed
- Eighteen public pages, navigation, prices, product images, SEO metadata and sitemap exist.
- PR #20 full Website QA passed (run 35753354275). The merged release passed Pages deployment (run 35759274316) and main/publishing-branch QA.
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
| Final hosting | Flo confirmed United Domains hosting and psoydo.com. GitHub Pages remains the preview. | Deploy to the confirmed host; verify processing-contract and log-retention statements against the actual service. |
| Domain / HTTPS | psoydo.com is the intended canonical domain. A public retrieval did not succeed in this environment; this does not prove a DNS or website outage. | Verify apex/www routing, certificate, HTTPS and all eighteen pages at the target host; follow SEO_RELEASE_CHECKLIST.md. |
| Registration delivery | Code references Typeform ID 01KVRJN19YZ8J86JFQYX9N09QG. Live form configuration is not verified. | Verify live publication, required fields, success screen and recipient. With approval, submit one marked test and confirm receipt and response process. |
| Commercial next step | Flo confirmed registration as an inquiry; offer, invoice and activation are arranged personally. Stripe is deferred. | Verify that the live form and response process match this inquiry flow. |
| Measurement / consent | GA4 G-EYFT82SFN7 supplied by Flo. Separate statistics/Ads choices implemented on all pages; automated mock tests cover reject, grant, revoke and re-grant. Preview excluded. | Verify GA4 account settings, production network behavior and actual event receipt. See MEASUREMENT.md; custom Ads submit event is not proof of a configured conversion. |
| Final product facts | Claims about cloud trial, available deployment models and operating responsibilities need a product-owner check. | Confirm current offer and operational terms against real service delivery. |

## Deployment sequence once decisions are settled
1. Merge only explicitly approved, green PRs.
2. If keeping Pages, fast-forward the publishing branch to the approved main commit and verify the matching Pages run. For another host, use its agreed deployment process.
3. Configure the chosen domain and HTTPS; check root -> /de/, all pages, nested 404, logos, screenshots and mobile navigation.
4. Run the approved live registration test and verify receipt; test Safari/iPhone with the real embed.
5. Complete Search Console verification and sitemap submission. Check social preview from the final domain.
6. Record the deployed commit and test date here. Roll back by reverting the release commit through the same publishing process if necessary.

Do not change DNS, claim contracts exist, submit external test leads or enable ad campaigns based on assumptions.

## United Domains upload preparation
- scripts/build_release.py produces a ZIP of public runtime files and a separate checksum manifest. It checks local HTML/CSS dependencies and archive integrity.
- See UNITED_DOMAINS_DEPLOYMENT.md. The actual hosting product, target directory and SFTP setup still need account-side confirmation. No production upload or DNS changes have occurred.
