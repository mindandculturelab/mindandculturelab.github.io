#!/usr/bin/env python3
"""Rewrite shared header/footer chrome across live HTML pages from one source."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FONT_HREF = (
    "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;700"
    "&family=Source+Sans+3:wght@400;500;600;700&display=swap"
)
OLD_FONT_RE = re.compile(
    r"https://fonts\.googleapis\.com/css2\?family=Fira\+Sans:[^\"']+"
)

HEADER_RE = re.compile(
    r"<header class=\"site-header\">.*?</header>",
    re.DOTALL,
)
FOOTER_RE = re.compile(
    r"<footer class=\"site-footer\">.*?</footer>",
    re.DOTALL,
)


def depth_of(path: Path) -> int:
    rel = path.relative_to(ROOT)
    if rel.name == "404.html":
        return -1  # absolute-root paths
    return len(rel.parts) - 1


def prefix_for(depth: int) -> str:
    if depth <= 0:
        return ""
    return "../" * depth


def active_section(path: Path) -> str | None:
    rel = path.relative_to(ROOT).as_posix()
    if rel.startswith("data/") or "/data/" in rel:
        return "data"
    if rel.startswith("experience/"):
        return "experience"
    if rel.startswith("sites/"):
        return "sites"
    return None


def build_header(path: Path) -> str:
    depth = depth_of(path)
    active = active_section(path)

    if depth < 0:
        home = "/"
        data = "/data/"
        tasks = "/experience/"
        sites = "/sites/"
        about = "/#about"
        contact = "/#contact"
        mark = "/assets/images/maclab-mark.png"
    else:
        p = prefix_for(depth)
        home = "#top" if path.name == "index.html" and depth == 0 else f"{p}index.html"
        data = f"{p}data/"
        tasks = f"{p}experience/"
        sites = f"{p}sites/"
        about = f"{p}index.html#about" if depth else "#about"
        contact = f"{p}index.html#contact" if depth else "#contact"
        mark = f"{p}assets/images/maclab-mark.png"

    def nav_link(section: str, href: str, label: str) -> str:
        current = ' aria-current="page"' if active == section else ""
        # Prefer ./ when linking to the section root from inside that section.
        if active == section and depth >= 0:
            rel = path.relative_to(ROOT).as_posix()
            if section == "data" and (rel == "data/index.html" or rel.startswith("data/")):
                href = "./" if rel == "data/index.html" else "../" if rel.count("/") == 2 else href
            if section == "experience" and rel == "experience/index.html":
                href = "./"
            if section == "sites" and rel == "sites/index.html":
                href = "./"
            if section == "data" and rel.endswith("/data/index.html"):
                href = "../../../data/"
            if section == "data" and rel in (
                "data/researchers/index.html",
                "data/topics/index.html",
            ):
                href = "../"
        return f'          <a href="{href}"{current}>{label}</a>'

    links = "\n".join(
        [
            nav_link("data", data, "Data"),
            nav_link("experience", tasks, "Tasks"),
            nav_link("sites", sites, "Sites"),
            f'          <a href="{about}">About</a>',
            f'          <a href="{contact}">Contact</a>',
            '          <a class="nav-external" href="https://www.mindandculturelab.com/" target="_blank" rel="noopener">Lab Site <span aria-hidden="true">↗</span></a>',
        ]
    )

    return f"""<header class="site-header">
      <div class="wrap bar">
        <a class="logo" href="{home}">
          <img src="{mark}" alt="" width="280" height="254" />
          <span class="logo-lockup">
            <span class="logo-name">Mind &amp; Culture Lab</span>
            <span class="logo-sub">Duke University</span>
          </span>
        </a>
        <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav">Menu</button>
        <nav id="site-nav" class="site-nav" data-nav aria-label="Primary">
{links}
        </nav>
      </div>
      <div class="stripe" aria-hidden="true"></div>
    </header>"""


def build_footer(path: Path) -> str:
    depth = depth_of(path)
    if depth < 0:
        data = "/data/"
        tasks = "/experience/"
        sites = "/sites/"
        researchers = "/data/researchers/"
        contact = "/#contact"
    else:
        p = prefix_for(depth)
        data = f"{p}data/" if depth else "data/"
        tasks = f"{p}experience/" if depth else "experience/"
        sites = f"{p}sites/" if depth else "sites/"
        researchers = f"{p}data/researchers/" if depth else "data/researchers/"
        contact = f"{p}index.html#contact" if depth else "#contact"
        rel = path.relative_to(ROOT).as_posix()
        if rel == "data/index.html":
            data = "./"
        elif rel in ("data/researchers/index.html", "data/topics/index.html"):
            data = "../"
            researchers = (
                "./" if rel.endswith("researchers/index.html") else "../researchers/"
            )
        elif rel.startswith("data/"):
            data = "../"

    return f"""<footer class="site-footer">
      <div class="wrap footer-inner">
        <div class="footer-brand">
          <p class="footer-title">© <span data-year>2026</span> Mind &amp; Culture Lab · Duke University</p>
          <p class="footer-sub">Department of Psychology &amp; Neuroscience · Durham, North Carolina</p>
          <p class="footer-contact">
            <a href="mailto:dukemaclab@gmail.com">dukemaclab@gmail.com</a>
            <span aria-hidden="true"> · </span>
            <a href="{contact}">Contact</a>
          </p>
        </div>
        <nav class="footer-nav" aria-label="Footer">
          <a href="{data}">Data</a>
          <a href="{tasks}">Tasks</a>
          <a href="{sites}">Sites</a>
          <a href="{researchers}">Researchers</a>
          <a href="https://www.mindandculturelab.com/" target="_blank" rel="noopener">Lab Website ↗</a>
        </nav>
      </div>
    </footer>"""


def live_html_files() -> list[Path]:
    skip = {"templates", "gallery", "scripts"}
    files = []
    for path in ROOT.rglob("*.html"):
        if any(part in skip for part in path.parts):
            continue
        files.append(path)
    return sorted(files)


def main() -> None:
    updated = 0
    for path in live_html_files():
        text = path.read_text(encoding="utf-8")
        original = text
        text = re.sub(
            r'href="https://fonts\.googleapis\.com/css2\?family=[^"]+"',
            f'href="{FONT_HREF}"',
            text,
            count=1,
        )
        if HEADER_RE.search(text):
            text = HEADER_RE.sub(build_header(path), text, count=1)
        if FOOTER_RE.search(text):
            text = FOOTER_RE.sub(build_footer(path), text, count=1)
        if text != original:
            path.write_text(text, encoding="utf-8")
            updated += 1
            print(f"updated {path.relative_to(ROOT)}")
    print(f"done — {updated} files changed")


if __name__ == "__main__":
    main()
