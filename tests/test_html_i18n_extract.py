import json
import os
import subprocess
import tempfile
import unittest
from collections import OrderedDict


PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTRACTOR = os.path.join(PROJECT_DIR, "tools", "html-i10n-extract")


def read_catalog(path):
    with open(path, "r", encoding="utf-8") as catalog_file:
        contents = catalog_file.read()
    return json.loads(contents[len("window.translations = "):].rstrip()[:-1],
                      object_pairs_hook=OrderedDict)


class ExtractorTest(unittest.TestCase):
    def test_synchronizes_runtime_keys_and_preserves_existing_values(self):
        with tempfile.TemporaryDirectory() as temporary_dir:
            html_path = os.path.join(temporary_dir, "index.html")
            catalog_path = os.path.join(temporary_dir, "en.js")

            with open(html_path, "w", encoding="utf-8") as html_file:
                html_file.write(
                    "<html><head><title>Welcome</title></head><body>"
                    "<svg><title>Brand</title></svg>"
                    "<a> Website</a><p>New text</p>"
                    "</body></html>"
                )
            with open(catalog_path, "w", encoding="utf-8") as catalog_file:
                catalog_file.write(
                    'window.translations = {\n'
                    '    "Welcome": "Custom welcome",\n'
                    '    "Obsolete": "old"\n'
                    '};\n'
                )

            subprocess.check_call([
                EXTRACTOR, "--input", html_path, "--output", catalog_path,
            ])

            self.assertEqual(
                read_catalog(catalog_path),
                OrderedDict([
                    ("Welcome", "Custom welcome"),
                    ("Website", " Website"),
                    ("New text", "New text"),
                ]),
            )
            self.assertEqual(
                subprocess.call([
                    EXTRACTOR, "--input", html_path, "--output", catalog_path,
                    "--check",
                ]),
                0,
            )


if __name__ == "__main__":
    unittest.main()
