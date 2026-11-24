import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import upload_gitlab as uploader


def completed(returncode=0, stdout="", stderr=""):
    return type("Completed", (), {"returncode": returncode, "stdout": stdout, "stderr": stderr})()


def uploaded(name):
    url = f"/uploads/abc123/{name}"
    return completed(stdout=json.dumps({"alt": name, "url": url, "markdown": f"![{name}]({url})"}))


class UploadTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.root = Path(self.directory.name)
        for name in ("before.png", "after.png", "demo.mp4"):
            (self.root / name).write_bytes(b"data")

    def tearDown(self):
        self.directory.cleanup()

    def body(self, text):
        path = self.root / "body.md"
        path.write_text(text, encoding="utf-8")
        return path

    def test_upload_body_markdown_html_and_definition_references_are_rewritten_once_per_file(self):
        body = self.body(
            "| ![Before](./before.png) | ![After](./after.png) |\n"
            "<img src=\"./after.png\" width=\"300\">\n"
            "[clip]: ./demo.mp4\n"
        )
        with patch.object(uploader.subprocess, "run", side_effect=[uploaded("before.png"), uploaded("after.png"),
                                                                   uploaded("demo.mp4")]) as run:
            result = uploader.upload_body("gitlab.com", "grp/sub/web", body)
        text = Path(result["body"]).read_text(encoding="utf-8")
        self.assertIn("![Before](/uploads/abc123/before.png)", text)
        self.assertIn('<img src="/uploads/abc123/after.png" width="300">', text)
        self.assertIn("[clip]: /uploads/abc123/demo.mp4", text)
        self.assertNotIn("./", text)
        self.assertEqual(run.call_count, 3)
        command = run.call_args_list[0].args[0]
        self.assertEqual(command[:7], ["glab", "api", "--hostname", "gitlab.com", "--method", "POST",
                                       "projects/grp%2Fsub%2Fweb/uploads"])
        self.assertEqual(command[7:], ["--form", f"file=@{self.root / 'before.png'}"])
        self.assertEqual(result["uploaded"], ["before.png", "after.png", "demo.mp4"])
        self.assertEqual(result["failed"], [])

    def test_upload_body_paths_in_code_are_left_alone(self):
        body = self.body("```\n![x](./before.png)\n```\nRun `open ./after.png` then ![After](./after.png)\n")
        with patch.object(uploader.subprocess, "run", side_effect=[uploaded("after.png")]):
            result = uploader.upload_body("gitlab.com", "g/p", body)
        text = Path(result["body"]).read_text(encoding="utf-8")
        self.assertIn("```\n![x](./before.png)\n```", text)
        self.assertIn("`open ./after.png`", text)
        self.assertIn("![After](/uploads/abc123/after.png)", text)

    def test_upload_body_first_failure_stops_and_keeps_the_rest_local(self):
        body = self.body("![Before](./before.png)\n![After](./after.png)\n![Demo](./demo.mp4)\n")
        failure = completed(1, stderr="403 Forbidden")
        with patch.object(uploader.subprocess, "run", side_effect=[uploaded("before.png"), failure]) as run:
            result = uploader.upload_body("gitlab.com", "g/p", body)
        text = Path(result["body"]).read_text(encoding="utf-8")
        self.assertEqual(run.call_count, 2)
        self.assertIn("![Before](/uploads/abc123/before.png)", text)
        self.assertIn("![After](./after.png)", text)
        self.assertEqual(result["uploaded"], ["before.png"])
        self.assertEqual(result["failed"], [{"file": "after.png", "error": "403 Forbidden"}])
        self.assertEqual(result["not_attempted"], ["demo.mp4"])

    def test_upload_body_invalid_references_stop_before_any_upload(self):
        cases = ("![x](./missing.png)\n", "![x](./notes.txt)\n", "![x](./../escape.png)\n", "![x](./sub/../after.png)\n")
        (self.root / "notes.txt").write_text("text")
        for text in cases:
            body = self.body(text)
            with patch.object(uploader.subprocess, "run") as run:
                with self.assertRaises(ValueError, msg=text):
                    uploader.upload_body("gitlab.com", "g/p", body)
            run.assert_not_called()

    def test_upload_body_oversize_file_stops_before_any_upload(self):
        (self.root / "big.png").write_bytes(b"0" * 11)
        body = self.body("![Big](./big.png)\n")
        with patch.object(uploader, "MAX_BYTES", 10), patch.object(uploader.subprocess, "run") as run:
            with self.assertRaisesRegex(ValueError, "big.png"):
                uploader.upload_body("gitlab.com", "g/p", body)
        run.assert_not_called()

    def test_upload_body_without_local_references_uploads_nothing(self):
        body = self.body("No images here, only ![remote](https://example.com/a.png).\n")
        with patch.object(uploader.subprocess, "run") as run:
            result = uploader.upload_body("gitlab.com", "g/p", body)
        run.assert_not_called()
        self.assertEqual(result["uploaded"], [])

    def test_upload_body_writes_a_new_file_and_keeps_the_original(self):
        original = "![After](./after.png)\n"
        body = self.body(original)
        with patch.object(uploader.subprocess, "run", side_effect=[uploaded("after.png")]):
            result = uploader.upload_body("gitlab.com", "g/p", body)
        self.assertEqual(body.read_text(encoding="utf-8"), original)
        self.assertEqual(Path(result["body"]), self.root / "body.uploaded.md")


class TargetTests(unittest.TestCase):
    def test_check_target_rejects_bad_hosts_and_project_paths(self):
        for host, repo in (("-x", "g/p"), ("gitlab.com", "solo"), ("gitlab.com", "g/../p"), ("gitlab.com", "-g/p")):
            with self.assertRaises(ValueError, msg=(host, repo)):
                uploader.check_target(host, repo)
        uploader.check_target("gitlab.corp:8443", "grp/sub/proj")


if __name__ == "__main__":
    unittest.main()
