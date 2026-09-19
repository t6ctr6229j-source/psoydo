#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_HTML = [
    ROOT / "de" / "index.html",
    ROOT / "de" / "produkt.html",
    ROOT / "de" / "technologie.html",
    ROOT / "de" / "architektur.html",
    ROOT / "de" / "anwendungsfaelle.html",
    ROOT / "de" / "sicherheit.html",
    ROOT / "de" / "preise.html",
    ROOT / "de" / "impressum.html",
    ROOT / "de" / "datenschutz.html",
]
FORBIDDEN_PUBLIC = [
    "BUILT BY",
    "wird von wescaleIT gebaut",
    "Produkt der wescaleIT AG",
    "entwickelt von wescaleIT",
    "developed by wescaleIT",
    "Frühzugang",
    "Early Access",
    "100% DSGVO",
    "100 % DSGVO",
    "revisionssicher",
    "Emma",
    "Liane",
    "BTC-TOM",
    "SOFORT BESTELLBAR",
    "DSGVO-konform",
    "gerichtsfest",
    "vollständig lokal",
    "kein Byte",
    "anonymisierte Praxisfälle",
    "60.000 €",
    "5.300 Verträge",
    "3,8 Mio.",
]
EXPECTED_PRICES = ["990 €", "9.900 €", "24.900 €", "ab 49.900 €"]


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids: set[str] = set()
        self.refs: list[tuple[str, str]] = []
        self.title_parts: list[str] = []
        self.in_title = False
        self.description = None
        self.lang = None
        self.h1_count = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.lang = attrs.get("lang")
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "a" and attrs.get("href"):
            self.refs.append(("href", attrs["href"]))
        if tag in {"script", "img", "link"}:
            key = "src" if tag in {"script", "img"} else "href"
            if attrs.get(key):
                self.refs.append((key, attrs[key]))
        if tag == "meta" and attrs.get("name") == "description":
            self.description = attrs.get("content")
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.h1_count += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data)

    @property
    def title(self):
        return "".join(self.title_parts).strip()


def local_target(page: Path, ref: str) -> Path | None:
    if not ref or ref.startswith(("#", "mailto:", "tel:", "javascript:")):
        return None
    parsed = urlparse(ref)
    if parsed.scheme or parsed.netloc:
        return None
    path = parsed.path
    if not path:
        return None
    if path.startswith("/"):
        candidate = ROOT / path.lstrip("/")
    else:
        candidate = page.parent / path
    if str(path).endswith("/"):
        candidate = candidate / "index.html"
    return candidate.resolve()


def fail(errors, message):
    errors.append(message)


def check_page(page: Path, errors: list[str]):
    if not page.exists():
        fail(errors, f"missing page: {page.relative_to(ROOT)}")
        return
    text = page.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(text)

    rel = page.relative_to(ROOT)
    if parser.lang != "de":
        fail(errors, f"{rel}: html lang must be de")
    if not parser.title or len(parser.title) < 15:
        fail(errors, f"{rel}: missing/weak title")
    if len(parser.title) > 70:
        fail(errors, f"{rel}: title too long ({len(parser.title)} chars)")
    if not parser.description or len(parser.description.strip()) < 80:
        fail(errors, f"{rel}: missing/weak meta description")
    if parser.description and len(parser.description.strip()) > 170:
        fail(errors, f"{rel}: meta description too long ({len(parser.description.strip())} chars)")
    if parser.h1_count != 1:
        fail(errors, f"{rel}: expected exactly one h1, got {parser.h1_count}")
    if "Pilot starten" not in text:
        fail(errors, f"{rel}: primary CTA must use the shared label: Pilot starten")
    for outdated_cta in ["Psoydo testen", "30 Tage testen", "Cloud-Test registrieren"]:
        if outdated_cta in text:
            fail(errors, f"{rel}: outdated primary CTA label found: {outdated_cta}")
    if '../assets/psoydo-logo.svg' not in text or 'brand-wordmark' not in text:
        fail(errors, f"{rel}: original Psoydo wordmark missing from page chrome")
    if "fonts.googleapis.com" in text or "fonts.gstatic.com" in text:
        fail(errors, f"{rel}: third-party Google Fonts request must not be present")
    if 'property="og:image"' not in text or 'name="twitter:image"' not in text:
        fail(errors, f"{rel}: social preview metadata missing")
    if 'application/ld+json' not in text:
        fail(errors, f"{rel}: structured data missing")

    ids = re.findall(r'\sid="([^"]+)"', text)
    duplicates = sorted({value for value in ids if ids.count(value) > 1})
    if duplicates:
        fail(errors, f"{rel}: duplicate ids: {', '.join(duplicates)}")

    for img in re.findall(r'<img\b[^>]*>', text, flags=re.I):
        if not re.search(r'\balt="[^"]*"', img, flags=re.I):
            fail(errors, f"{rel}: image without alt text: {img[:100]}")

    lowered = text.lower()
    for phrase in FORBIDDEN_PUBLIC:
        if phrase.lower() in lowered:
            fail(errors, f"{rel}: forbidden/unapproved public phrase: {phrase}")

    for kind, ref in parser.refs:
        if ref.startswith("#"):
            target = ref[1:]
            if target and target not in parser.ids:
                fail(errors, f"{rel}: missing anchor target {ref}")
            continue
        target = local_target(page, ref)
        if target and not target.exists():
            # Existing legal pages currently live on production psoydo.com and are absolute links.
            fail(errors, f"{rel}: missing local {kind} target {ref} -> {target.relative_to(ROOT) if ROOT in target.parents else target}")


def main() -> int:
    errors: list[str] = []
    for page in PUBLIC_HTML:
        check_page(page, errors)

    homepage_path = ROOT / "de" / "index.html"
    homepage = homepage_path.read_text(encoding="utf-8") if homepage_path.exists() else ""
    for section_id in ["product", "transformation", "usecases", "security", "pricing", "register"]:
        if f'id="{section_id}"' not in homepage:
            fail(errors, f"de/index.html: core customer-facing section must be static: #{section_id}")
    for phrase in [
        "Die beste KI.",
        "Die KI kann es.",
        "ANBIETER & TRUSTED ADVISOR",
        "wescaleIT AG",
        "30-TAGE-PILOT",
        "Use Case registrieren",
    ]:
        if phrase.lower() not in homepage.lower():
            fail(errors, f"de/index.html: customer-first homepage proof/offer element missing: {phrase}")

    for page in PUBLIC_HTML:
        if page.exists():
            page_text = page.read_text(encoding="utf-8")
            if 'rel="canonical"' not in page_text:
                fail(errors, f"{page.relative_to(ROOT)}: canonical link missing")

    logo_asset = ROOT / "assets" / "psoydo-logo.svg"
    og_asset = ROOT / "og-image.svg"
    page_404 = ROOT / "404.html"
    if not og_asset.exists():
        fail(errors, "missing social preview asset: og-image.svg")
    if not page_404.exists():
        fail(errors, "missing branded 404.html")
    else:
        page_404_text = page_404.read_text(encoding="utf-8")
        if 'ERROR / 404' not in page_404_text or 'name="robots" content="noindex,nofollow"' not in page_404_text:
            fail(errors, "404.html: branded error marker or noindex directive missing")
    if not logo_asset.exists():
        fail(errors, "missing Psoydo wordmark asset: assets/psoydo-logo.svg")
    else:
        logo_text = logo_asset.read_text(encoding="utf-8")
        if "Psoydo AI" not in logo_text or "data:image" in logo_text:
            fail(errors, "assets/psoydo-logo.svg: logo must be a native SVG wordmark without embedded bitmap data")

    pricing = (ROOT / "de" / "preise.html").read_text(encoding="utf-8") if (ROOT / "de" / "preise.html").exists() else ""
    for price in EXPECTED_PRICES:
        if price not in pricing:
            fail(errors, f"de/preise.html: expected price missing: {price}")
    for phrase in ["keine automatische Verlängerung", "30 Tage", "Cloud"]:
        if phrase.lower() not in pricing.lower():
            fail(errors, f"de/preise.html: test-license guardrail missing: {phrase}")

    app = ROOT / "app.js"
    if app.exists():
        app_text = app.read_text(encoding="utf-8")
        for phrase in FORBIDDEN_PUBLIC:
            if phrase.lower() in app_text.lower():
                fail(errors, f"app.js: forbidden/unapproved public phrase: {phrase}")
        for dynamic_builder in ["addArchitecture", "addPIFTeaser", "addPricing", "polishCopy"]:
            if dynamic_builder in app_text:
                fail(errors, f"app.js: core content must remain static, found {dynamic_builder}")

    sitemap = ROOT / "sitemap.xml"
    if sitemap.exists():
        sitemap_text = sitemap.read_text(encoding="utf-8")
        for url in [
            "https://psoydo.com/de/",
            "https://psoydo.com/de/produkt.html",
            "https://psoydo.com/de/technologie.html",
            "https://psoydo.com/de/architektur.html",
            "https://psoydo.com/de/anwendungsfaelle.html",
            "https://psoydo.com/de/sicherheit.html",
            "https://psoydo.com/de/preise.html",
        ]:
            if url not in sitemap_text:
                fail(errors, f"sitemap.xml: missing {url}")
    else:
        fail(errors, "missing sitemap.xml")

    if errors:
        print("SITE QA FAILED")
        for item in errors:
            print(f"- {item}")
        return 1

    print("SITE QA PASSED")
    print(f"Checked {len(PUBLIC_HTML)} public HTML pages, CTA consistency, brand/social assets, structured data, font privacy, pricing guardrails, public claims, assets and sitemap.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
