import json
import os
import subprocess
import tempfile
import unittest


PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILDER = os.path.join(PROJECT_DIR, "tools", "build-localized-pages")


class LocalizedPagesTest(unittest.TestCase):
    def test_mio_generated_page_has_double_buffer_and_banter(self):
        page_path = os.path.join(PROJECT_DIR, "html", "locales", "en.html")
        with open(page_path, encoding="utf-8") as page_file:
            page = page_file.read()
        self.assertEqual(page.count('class="mio-video"'), 2)
        self.assertEqual(page.count('data-mio-kind="idle-serious"'), 8)
        self.assertEqual(page.count('data-mio-kind="tip"'), 18)
        self.assertIn("Telegram-only", page)
        self.assertIn("Community link", page)

    def test_mio_runtime_assets_are_present(self):
        asset_dir = os.path.join(PROJECT_DIR, "html", "assets", "mio")
        expected = [
            "base.png", "intro.webm", "begging.webm", "reminder.webm",
            "idle.webm", "idle-fingers.webm", "idle-nose.webm",
            "idle-polish.webm", "idle-reboot.webm", "idle-serious.webm",
            "success.webm",
        ]
        for name in expected:
            path = os.path.join(asset_dir, name)
            self.assertTrue(os.path.isfile(path), path)
            self.assertGreater(os.path.getsize(path), 0, path)

    def test_builds_static_pages_and_escapes_translations(self):
        with tempfile.TemporaryDirectory() as temporary_dir:
            template = os.path.join(temporary_dir, "welcome.html.in")
            catalogs = os.path.join(temporary_dir, "i18n")
            output = os.path.join(temporary_dir, "locales")
            os.mkdir(catalogs)

            with open(template, "w", encoding="utf-8") as template_file:
                template_file.write(
                    '<html lang="{{language}}"><title>{{page.title}}</title>'
                    '<p>{{hero.description}}</p>'
                    '<span data-message="{{mio.intro}}"></span></html>'
                )
            with open(os.path.join(catalogs, "ru.json"), "w", encoding="utf-8") as catalog_file:
                json.dump({
                    "translations": {
                        "page.title": "MiniOS & тест",
                        "hero.description": "<готово>",
                        "mio.intro": "Псс… \"привет\"",
                    }
                }, catalog_file, ensure_ascii=False)

            subprocess.check_call([
                BUILDER,
                "--template", template,
                "--catalog-dir", catalogs,
                "--output-dir", output,
            ])
            with open(os.path.join(output, "ru.html"), encoding="utf-8") as page_file:
                page = page_file.read()
            self.assertIn('lang="ru"', page)
            self.assertIn("MiniOS &amp; тест", page)
            self.assertIn("&lt;готово&gt;", page)
            self.assertIn('data-message="Псс… &quot;привет&quot;"', page)

            self.assertEqual(subprocess.call([
                BUILDER,
                "--template", template,
                "--catalog-dir", catalogs,
                "--output-dir", output,
                "--check",
            ]), 0)


if __name__ == "__main__":
    unittest.main()
