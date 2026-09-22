#!/usr/bin/env python3
from __future__ import annotations

import json
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
INDEXABLE_HTML = PUBLIC_HTML[:7]
NOINDEX_HTML = PUBLIC_HTML[7:]

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
    if '../assets/web/psoydo-negative.webp' not in text or 'brand-wordmark' not in text:
        fail(errors, f"{rel}: optimized official negative Psoydo wordmark missing from page chrome")
    if "fonts.googleapis.com" in text or "fonts.gstatic.com" in text:
        fail(errors, f"{rel}: third-party Google Fonts request must not be present")
    if 'property="og:image"' not in text or 'name="twitter:image"' not in text:
        fail(errors, f"{rel}: social preview metadata missing")
    if 'https://psoydo.com/og-image.png' not in text:
        fail(errors, f"{rel}: social preview must use the PNG asset")
    if 'property="og:locale" content="de_DE"' not in text:
        fail(errors, f"{rel}: og:locale de_DE missing")

    expected_robots = "noindex,follow" if page in NOINDEX_HTML else "index,follow,max-image-preview:large"
    if f'name="robots" content="{expected_robots}"' not in text:
        fail(errors, f"{rel}: expected robots directive {expected_robots}")

    jsonld_blocks = re.findall(r'<script type="application/ld\\+json">(.*?)</script>', text, flags=re.S)
    if not jsonld_blocks:
        fail(errors, f"{rel}: structured data missing")
    else:
        for block in jsonld_blocks:
            try:
                json.loads(block)
            except json.JSONDecodeError as exc:
                fail(errors, f"{rel}: invalid JSON-LD: {exc}")

    ids = re.findall(r'\sid="([^"]+)"', text)
    duplicates = sorted({value for value in ids if ids.count(value) > 1})
    if duplicates:
        fail(errors, f"{rel}: duplicate ids: {', '.join(duplicates)}")

    for img in re.findall(r'<img\\b[^>]*>', text, flags=re.I):
        if not re.search(r'\\balt="[^"]*"', img, flags=re.I):
            fail(errors, f"{rel}: image without alt text: {img[:100]}")
        if "../assets/web/" in img:
            if not re.search(r'\\bwidth="\\d+"', img) or not re.search(r'\\bheight="\\d+"', img):
                fail(errors, f"{rel}: optimized web image missing intrinsic dimensions: {img[:120]}")

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

    titles = {}
    descriptions = {}
    for page in INDEXABLE_HTML:
        if not page.exists():
            continue
        page_text = page.read_text(encoding="utf-8")
        title_match = re.search(r"<title>(.*?)</title>", page_text, re.S)
        desc_match = re.search(r'<meta name="description" content="([^"]*)">', page_text)
        if title_match:
            title = re.sub(r"\s+", " ", title_match.group(1)).strip()
            if title in titles:
                fail(errors, f"{page.relative_to(ROOT)}: duplicate title with {titles[title]}")
            titles[title] = page.relative_to(ROOT)
        if desc_match:
            desc = desc_match.group(1).strip()
            if desc in descriptions:
                fail(errors, f"{page.relative_to(ROOT)}: duplicate meta description with {descriptions[desc]}")
            descriptions[desc] = page.relative_to(ROOT)

    homepage_path = ROOT / "de" / "index.html"
    homepage = homepage_path.read_text(encoding="utf-8") if homepage_path.exists() else ""
    for section_id in ["product", "ki-check", "transformation", "usecases", "security", "faq", "pricing", "register"]:
        if f'id="{section_id}"' not in homepage:
            fail(errors, f"de/index.html: core customer-facing section must be static: #{section_id}")
    for phrase in [
        "Die beste KI.",
        "Die KI ist längst gut genug.",
        "Personenbezug",
        "Vertraulichkeit",
        "Geschäftskontext",
        "30-SEKUNDEN-CHECK",
        "Würdest du das einer",
        "GeschGehG",
        "technische Vorprüfung",
        "ANBIETER &amp; TRUSTED ADVISOR",
        "wescaleIT AG",
        "30-TAGE-PILOT",
        "Use Case registrieren",
    ]:
        if phrase.lower() not in homepage.lower():
            fail(errors, f"de/index.html: customer-first homepage proof/offer element missing: {phrase}")

    if "home2-situations" in homepage:
        fail(errors, "de/index.html: problem section must not duplicate the business use-case list")

    if homepage.count("data-ai-answer=") != 3 or "data-ai-quiz" not in homepage:
        fail(errors, "de/index.html: public AI decision quiz controls are missing or incomplete")

    if homepage.count("<details>") < 6 or '"@type":"FAQPage"' not in homepage:
        fail(errors, "de/index.html: visible SEO FAQ or FAQPage structured data is incomplete")
    for phrase in ["Pseudonymisierung ist keine Anonymisierung", "GeschGehG", "technische Vorprüfung"]:
        if phrase not in homepage:
            fail(errors, f"de/index.html: SEO FAQ guardrail missing: {phrase}")

    lightbox_pages = {
        "de/index.html": 3,
        "de/produkt.html": 2,
        "de/sicherheit.html": 1,
    }
    for rel, minimum in lightbox_pages.items():
        page = (ROOT / rel).read_text(encoding="utf-8")
        if page.count("data-lightbox") < minimum:
            fail(errors, f"{rel}: expected at least {minimum} screenshot lightbox trigger(s)")

    expected_primary_nav = [
        ("produkt.html", "Produkt"),
        ("anwendungsfaelle.html", "Use Cases"),
        ("sicherheit.html", "Sicherheit"),
        ("preise.html", "Preise"),
    ]
    for page in PUBLIC_HTML:
        if not page.exists():
            continue
        rel = str(page.relative_to(ROOT))
        page_text = page.read_text(encoding="utf-8")

        desktop_match = re.search(r'<nav class="desktop-nav" aria-label="Hauptnavigation">(.*?)</nav>', page_text, re.S)
        if not desktop_match:
            fail(errors, f"{rel}: desktop primary navigation missing")
        else:
            desktop_links = [
                (href, re.sub(r"<[^>]+>", "", label).strip())
                for href, label in re.findall(r'<a href="([^"]+)"[^>]*>(.*?)</a>', desktop_match.group(1), re.S)
            ]
            if desktop_links != expected_primary_nav:
                fail(errors, f"{rel}: desktop navigation differs from canonical primary navigation: {desktop_links}")

        mobile_match = re.search(r'<div class="mobile-menu" id="mobile-menu" aria-hidden="true">(.*?)</div>', page_text, re.S)
        if not mobile_match:
            fail(errors, f"{rel}: mobile primary navigation missing")
        else:
            mobile_links = [
                (href, re.sub(r"<[^>]+>", "", label).strip())
                for href, label in re.findall(r'<a href="([^"]+)"[^>]*>(.*?)</a>', mobile_match.group(1), re.S)
            ]
            expected_pilot = "#register" if rel == "de/index.html" else "./#register"
            expected_mobile = expected_primary_nav + [(expected_pilot, "Pilot starten")]
            if mobile_links != expected_mobile:
                fail(errors, f"{rel}: mobile navigation differs from canonical primary navigation: {mobile_links}")

    for page in PUBLIC_HTML:
        if page.exists():
            page_text = page.read_text(encoding="utf-8")
            if 'rel="canonical"' not in page_text:
                fail(errors, f"{page.relative_to(ROOT)}: canonical link missing")

    logo_asset = ROOT / "assets" / "Psoydo_logo_negativ.png"
    logo_light_asset = ROOT / "assets" / "psoydo_logo.png"
    provider_logo = ROOT / "assets" / "wescaleIT_Logo_RGB_RZ.png"
    provider_logo_negative = ROOT / "assets" / "wescaleIT_Logo_RGB_negativ_RZ.png"
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
    for asset, label in [
        (logo_asset, "Psoydo negative logo"),
        (logo_light_asset, "Psoydo normal logo"),
        (provider_logo, "wescaleIT normal logo"),
        (provider_logo_negative, "wescaleIT negative logo"),
    ]:
        if not asset.exists():
            fail(errors, f"missing official brand asset: {label}")
        elif asset.stat().st_size < 1000:
            fail(errors, f"official brand asset is unexpectedly small: {label}")

    screenshot_assets = [
        ROOT / "assets" / "Psoydo Screenshots" / "Bildschirmfoto 2026-09-21 um 07.02.18.png",
        ROOT / "assets" / "Psoydo Screenshots" / "Bildschirmfoto 2026-09-21 um 07.01.37.png",
        ROOT / "assets" / "Psoydo Screenshots" / "Bildschirmfoto 2026-09-21 um 07.07.22.png",
    ]
    for asset in screenshot_assets:
        if not asset.exists() or asset.stat().st_size < 10000:
            fail(errors, f"missing or invalid curated product screenshot: {asset.name}")

    optimized_assets = [
        ROOT / "assets" / "web" / "psoydo-negative.webp",
        ROOT / "assets" / "web" / "psoydo.webp",
        ROOT / "assets" / "web" / "wescaleit.webp",
        ROOT / "assets" / "web" / "wescaleit-negative.webp",
        ROOT / "assets" / "web" / "sichtabgleich.webp",
        ROOT / "assets" / "web" / "revision.webp",
        ROOT / "assets" / "web" / "download.webp",
    ]
    for asset in optimized_assets:
        if not asset.exists() or asset.stat().st_size < 5000:
            fail(errors, f"missing or invalid optimized web asset: {asset.name}")

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
