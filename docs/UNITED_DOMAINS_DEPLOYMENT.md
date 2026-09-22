# Publish psoydo.com on United Domains

## Confirmed scope
United Domains is the intended website host; psoydo.com is the canonical domain. GitHub Pages remains the preview. The website is static and needs no Node, Python or database on the hosting server. Pilot registrations are inquiries; offer, invoice and activation are arranged personally. No Stripe checkout.

## Upload package
Run `python scripts/build_release.py` from a reviewed checkout. The `Upload package` GitHub Actions workflow also builds the archive on main pushes or manual dispatch after that workflow is merged.

In a successful run, download the `psoydo-upload-<commit>` artifact and extract it. This yields:
- `psoydo-upload.zip`: extract this archive and upload its **contents** into the domain's web directory. The root must contain index.html; de/ and assets/ must remain subdirectories.
- `psoydo-manifest.json`: keep this locally with the deployment record; it identifies the source commit, any uncommitted changes and SHA-256 file hashes. Do not upload the manifest.

A pull-request artifact is for review until its release is approved. Prefer the approved main build for production.

The upload archive includes all 18 content pages, the root entry, the error page, styles/scripts, optimized web assets, favicon, social image, robots.txt and sitemap. Source screenshots, repository history, internal docs and build tooling are excluded. The build verifies local HTML/CSS references and checks every archived file against its hash.

## Hosting details still needed
Confirm the actual United Domains hosting product, assigned web directory, available SFTP access and current TLS configuration in the account. A domain registration alone is not webspace. Do not guess the server name or document root. Put deployment credentials in an appropriate secret store if automating later; this workflow does not transfer files or read credentials.

United Domains documents SFTP upload and the portfolio's Webspace area here:
https://www.united-domains.de/help/faq-article/wie-lade-ich-meine-website-mit-filezilla-auf-meinen-webspace/

## Deployment procedure
1. Record the approved commit and save the current live web directory for rollback. Check existing URLs before replacing an existing site; plan redirects for any that change.
2. Extract the upload archive into a new, dedicated directory if the hosting product supports switching a domain to it. Upload assets before HTML when replacing files in place. Keep unrelated files and hosting verification files intact.
3. Associate psoydo.com with that directory and confirm a valid certificate. Configure HTTPS and one canonical hostname. Both apex and www need appropriate TLS before an HTTPS redirect can work. Do not change MX or other mail-related records.
4. Prefer permanent server redirects from / to /de/ and from www to the canonical apex hostname. The archive already contains a relative HTML redirect as a fallback. Configure a real 404 response using /404.html; do not rewrite missing paths to the homepage with status 200.
5. Verify response codes and all 18 pages, CSS, images, robots.txt, sitemap.xml and a nonexistent nested path on the actual domain. Verify the custom error page loads its assets.
6. Confirm a real pilot inquiry reaches the responsible team using an explicitly approved marked test. Check the Typeform completion message reflects an inquiry, not an immediate order or activation.
7. Complete hosting/privacy, cookie-consent and product-fact review using GO_LIVE_READINESS.md; verify Search Console and submit sitemap.
8. Record release commit, date, target directory, checks and rollback location. For rollback, restore the saved directory or switch the domain back to it; verify again.

No .htaccess or hosting-specific configuration is bundled until the actual hosting product is verified. This package is prepared for upload, not evidence of a production launch.

## Manueller GitHub-SFTP-Upload (2026-09-22)

Workflow: **Deploy United Domains**, ausschließlich manuell auf `main`.
Webspace S benötigt hierfür nur SFTP, keinen SSH-Shell-Zugang.

Repository-Secrets: `UD_SFTP_HOST`, `UD_SFTP_USER`, `UD_SFTP_PASSWORD`
und zusätzlich **`UD_SFTP_FINGERPRINT`**. Letzteres ist der SHA256-Fingerprint
(`SHA256:…`) des vom Server angebotenen SSH-Hostschlüssels. Den Wert über
United Domains bestätigen lassen; ein unbestätigtes `ssh-keyscan` allein
belegt nicht die Echtheit. Bei fehlendem/falschem Fingerprint wird vor der
Passwortübertragung abgebrochen.

Unter Actions → Deploy United Domains → Run workflow → main starten.
Der Workflow prüft und lädt das gesamte Paket in einen neuen Nachbarordner,
liest die Dateien zum Prüfsummenvergleich zurück und benennt ihn danach in
`psoydo` um. Ein vorhandenes leeres `psoydo` ist erlaubt; ein befülltes muss
von diesem Workflow stammen. Andere Websiteverzeichnisse werden nicht geändert.
Vorherige Versionen bleiben als `psoydo-backup-RUN-ATTEMPT` erhalten.
Bei gescheitertem Aktivierungs-Rename wird die vorherige Version zurückbenannt.
Zwischen den beiden Renames kann eine kurze Unterbrechung entstehen.
Abgebrochene Uploads und Backups werden nicht automatisch gelöscht.

Im United-Domains-Portfolio muss **psoydo.com mit dem Verzeichnis psoydo**
verknüpft und HTTPS aktiviert sein. Erfolgreicher SFTP-Upload beweist diese
Domain-/TLS-Konfiguration nicht. Anschließend öffentliche Seiten, Formular,
HTTPS, Weiterleitungen und echte 404-Antwort prüfen. Der Workflow ändert
weder DNS noch Zertifikate oder E-Mail-Einstellungen.
