from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from check_html import inspect


GOOD = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Finding</title>
<style>:root { color-scheme: light dark; } @media print { body { color: black; } }</style></head>
<body><main><h1>The finding</h1><h2 id="evidence">Evidence</h2><p><a href="#evidence">Read it</a></p></main></body></html>"""

BAD = """<html><head><title></title></head><body><main><h2>Report</h2><h4>Detail</h4>
<img src="x.png"><a href="#missing">missing</a><p>{{ placeholder }}</p></main></body></html>"""


class CheckHtmlTests(unittest.TestCase):
    def inspect_text(self, value: str):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "page.html"
            path.write_text(value, encoding="utf-8")
            return inspect(path)

    def test_good_document_has_no_errors(self):
        self.assertFalse([item for item in self.inspect_text(GOOD) if item.severity == "error"])

    def test_external_link_is_not_a_network_dependency(self):
        html = GOOD.replace("</main>", '<a href="https://example.com">Source</a></main>')
        codes = {item.code for item in self.inspect_text(html)}
        self.assertNotIn("network", codes)

    def test_external_script_is_a_network_dependency(self):
        html = GOOD.replace("</body>", '<script src="https://cdn.example.com/app.js"></script></body>')
        codes = {item.code for item in self.inspect_text(html)}
        self.assertIn("network", codes)

    def test_bad_document_reports_core_failures(self):
        codes = {item.code for item in self.inspect_text(BAD) if item.severity == "error"}
        expected = {
            "doctype",
            "html-lang",
            "charset",
            "viewport",
            "title",
            "h1",
            "heading-order",
            "broken-fragment",
            "image-alt",
            "placeholder",
        }
        self.assertTrue(expected <= codes)


if __name__ == "__main__":
    unittest.main()
