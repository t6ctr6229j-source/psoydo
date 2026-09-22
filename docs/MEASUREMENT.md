# Website measurement

## Configuration
- GA4 measurement ID supplied by Flo: G-EYFT82SFN7.
- Existing Ads destination: AW-18355213487. A custom event is not proof of a configured Ads conversion.
- Google is loaded only on psoydo.com and www.psoydo.com, after a positive choice. GitHub Pages, local development and other hosts never load the tag through this integration.
- Both options are off initially and independently selectable. Every public content page exposes the same dialog and a footer reopening control.
- Consent storage is psoydo-consent-v3; old Ads-only permission is not reused for Analytics.
- Choices are applied before product configuration. One tag script is used; only selected destinations are configured. Personalization and Google Signals are disabled in code.
- Changing a loaded configuration disables measurement, updates consent, removes reachable first-party measurement cookies and reloads the document. Re-granting works with a new document and the saved selection.

## Events
| Event | Trigger | Destination |
| --- | --- | --- |
| page_view | One GA config per document, after analytics consent | GA4 |
| psoydo_registration_start | First successful Typeform ready callback in a document; no retrospective event if consent was absent | GA4 |
| psoydo_registration_submit | Successful Typeform onSubmit, once per widget instance | GA4 if statistics allowed; existing Ads custom event if Ads allowed |

Custom events include only a fixed category and label. No Typeform answer, response ID, name, email or document content is included. Configured page_location and page_referrer omit query strings and fragments. GA cookie expiration is capped at 395 days without rolling refresh in this configuration; browser restrictions may shorten it.

## Verified locally
Google and Typeform are mocked; no leads or measurements are sent. Browser regression tests cover initial denial, persisted choices, analytics only, Ads only, both, revoke, re-grant, old-consent migration, preview exclusion, event deduplication and URL sanitization at 390/1440px.

## Account-side checks before measuring production
- Confirm the GA4 data stream belongs to psoydo.com and review any additional tag destinations configured in Google's account UI.
- Review enhanced measurement settings, especially automatic form interactions and history-based pageviews, to avoid unintended or duplicate collection alongside the explicit integration.
- Set the required event-data retention in GA4; this account setting is distinct from cookie expiration and cannot be inferred from the ID.
- Review Google's processing terms and international-transfer arrangements for the actual account. Final privacy notice review remains a launch task; no contract or account setting is claimed as verified.
- Verify page_view and registration events in Realtime/DebugView on the real production domain after consent. Mark psoydo_registration_submit as a key event if that is the desired lead metric. Obtain approval before submitting a real test inquiry.
- Confirm rejection produces no Google requests; validate withdrawal with the real tag. Mock tests establish our integration behavior, not Google's account configuration or actual report receipt.

References:
- https://developers.google.com/tag-platform/gtagjs/configure
- https://developers.google.com/tag-platform/security/guides/consent
- https://developers.google.com/analytics/devguides/collection/ga4/reference/config
- https://www.gesetze-im-internet.de/ttdsg/__25.html
