#!/usr/bin/env python3
"""Inventory public documentation evidence, never infer visual/functional review.

Usage: python3 scripts/audit-reference-pages.py [--refresh]
This intentionally excludes 21st: its terms require separate written permission
for automated collection. It also never retries a 401/403 through another identity.
"""
import concurrent.futures
import datetime
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs/plans/reference-page-source-index.json"
ALLOWED = {"magicui.design", "ui.aceternity.com"}

class EvidenceParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.hidden = 0
        self.title = False
        self.heading = None
        self.headings = []
        self.title_parts = []
        self.text = []
        self.links = []
        self.description = ""
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("script", "style", "noscript"):
            self.hidden += 1
        if self.hidden:
            return
        if tag == "title": self.title = True
        if tag in ("h1", "h2", "h3"):
            self.heading = {"level": int(tag[1]), "parts": []}
        if tag == "a" and attrs.get("href"): self.links.append(attrs["href"])
        if tag == "meta" and attrs.get("name") == "description": self.description = attrs.get("content", "")
    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript"):
            self.hidden = max(0, self.hidden - 1)
            return
        if self.hidden: return
        if tag == "title": self.title = False
        if tag in ("h1", "h2", "h3") and self.heading:
            self.headings.append({"level": self.heading["level"], "text": "".join(self.heading["parts"]).strip()})
            self.heading = None
    def handle_data(self, data):
        if self.hidden: return
        if self.title: self.title_parts.append(data)
        if self.heading: self.heading["parts"].append(data)
        self.text.append(data)

def canonical(url, base):
    parsed = urllib.parse.urlsplit(urllib.parse.urljoin(base, url))
    if parsed.scheme not in ("http", "https") or parsed.hostname not in ALLOWED or parsed.username:
        return None
    # Only public HTML routes, never API calls, assets or query-driven action URLs.
    if parsed.path.startswith(("/api/", "/_next/", "/cdn-cgi/")) or re.search(r"\.(?:png|jpg|jpeg|webp|svg|gif|ico|css|js|json|zip|mp4|woff2?)$", parsed.path):
        return None
    return urllib.parse.urlunsplit(("https", parsed.hostname, parsed.path.rstrip("/") or "/", "", ""))

def fetch(url):
    checked = datetime.datetime.now(datetime.timezone.utc).isoformat()
    try:
        # Two workers and a per-request pause avoid making an exhaustive review
        # a burst crawler. Transient failures remain explicit for a later pass.
        time.sleep(0.3)
        with urllib.request.urlopen(url, timeout=25) as response:
            final_url = response.geturl()
            if urllib.parse.urlsplit(final_url).hostname not in ALLOWED:
                return {"url": url, "checkedAt": checked, "status": "external-redirect", "finalUrl": final_url}
            body = response.read()
            content_type = response.headers.get("Content-Type", "")
            if "text/html" not in content_type:
                return {"url": url, "checkedAt": checked, "status": "non-html", "contentType": content_type}
        parser = EvidenceParser()
        parser.feed(body.decode("utf-8", errors="replace"))
        text = "".join(parser.text)
        imports = sorted(set(re.findall(r"(?:from\s*|import\s*)[\"']([^\"'\n]+)[\"']", text)))
        internal = sorted({candidate for link in parser.links if (candidate := canonical(link, final_url))})
        source_links = sorted({urllib.parse.urljoin(final_url, link) for link in parser.links if "github.com/" in link or "npmjs.com/" in link})
        return {"url": url, "finalUrl": final_url, "checkedAt": checked, "status": "html",
                "bodySha256": hashlib.sha256(body).hexdigest(), "bytes": len(body),
                "title": "".join(parser.title_parts).strip(), "description": parser.description[:240],
                "headings": parser.headings, "exampleImports": imports, "sourceLinks": source_links,
                "internalLinks": internal, "visualReview": "pending", "behaviorReview": "pending"}
    except Exception as error:
        return {"url": url, "checkedAt": checked, "status": "unavailable", "error": str(error)}

def main():
    inventory = json.loads((ROOT / "docs/plans/reference-site-inventory.json").read_text())
    seeds = {candidate for site in inventory["sites"] for url in site["urls"] if (candidate := canonical(url, url))}
    old = json.loads(OUTPUT.read_text()) if OUTPUT.exists() and "--refresh" not in sys.argv else {"pages": []}
    records = {page["url"]: page for page in old["pages"]}
    if old.get("schemaVersion") == 2:
        for page in records.values():
            if "internalLinkIds" in page:
                page["internalLinks"] = [old["linkTargets"][index] for index in page.pop("internalLinkIds")]

    pending = seeds - records.keys()
    for page in records.values(): pending.update(set(page.get("internalLinks", [])) - records.keys())
    def save():
        # Persist after each bounded batch. These are URL/contract facts, not raw
        # downloaded HTML; subsequent turns can resume without re-fetching pages.
        targets = sorted({link for page in records.values() for link in page.get("internalLinks", [])})
        target_ids = {url: index for index, url in enumerate(targets)}
        pages = []
        for url in sorted(records):
            page = dict(records[url])
            if "internalLinks" in page:
                page["internalLinkIds"] = [target_ids[link] for link in page.pop("internalLinks")]
            # HTML title elements include SVG accessible titles, so retain this
            # literal source signal without claiming it is the document title.
            if "title" in page: page["titleElementsText"] = page.pop("title")
            pages.append(page)
        result = {"schemaVersion": 2, "scope": sorted(ALLOWED),
                  "purpose": "Public page source inventory; HTML collection is not visual or functional verification. Example imports include only rendered source text, not hidden/client-loaded code.",
                  "seedCount": len(seeds), "pendingUrls": sorted(pending), "linkTargets": targets,
                  "pages": pages}
        temporary = OUTPUT.with_suffix(".tmp")
        # Shared link IDs avoid repeating the same documentation sidebar URLs
        # thousands of times. One JSON record per line remains diffable.
        prefix = json.dumps({key: value for key, value in result.items() if key != "pages"}, ensure_ascii=False)[:-1]
        temporary.write_text(prefix + ', "pages": [\n' + ',\n'.join(json.dumps(page, ensure_ascii=False) for page in pages) + '\n]}\n')
        temporary.replace(OUTPUT)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        while pending:
            batch = sorted(pending)[:12]
            pending.difference_update(batch)
            for page in pool.map(fetch, batch):
                records[page["url"]] = page
                pending.update(set(page.get("internalLinks", [])) - records.keys() - set(batch))
            save()
            print(f"pages={len(records)} pending={len(pending)} unavailable={sum(p['status'] != 'html' for p in records.values())}", flush=True)
    save()

if __name__ == "__main__": main()
