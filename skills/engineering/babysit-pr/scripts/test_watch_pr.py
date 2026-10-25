import copy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import watch_pr as watcher


PR = {"state": "OPEN", "headRefOid": "h1", "baseRefOid": "b1",
      "headRefName": "feature", "baseRefName": "main"}
MR = {"iid": 7, "state": "opened", "sha": "h1", "diff_refs": {"base_sha": "b1"},
      "source_branch": "feature", "target_branch": "master", "updated_at": "volatile",
      "head_pipeline": {"id": 50, "project_id": 9, "sha": "h1", "status": "running",
                        "duration": 12}}


class WatchTests(unittest.TestCase):
    def test_all_feedback_pages_and_unrecognized_author_survive(self):
        connection = lambda nodes, more: {"data": {"repository": {"pullRequest": {
            "reviewThreads": {"nodes": nodes, "pageInfo": {"hasNextPage": more}}
        }}}}
        replies = [PR, [[{"id": 1}], [{"id": 2}]], [[]],
                   [[{"id": 3, "user": {"login": "copilot-pull-request-reviewer"}}]],
                   [connection([{"id": "t1"}], True), connection([{"id": "t2"}], False)], PR]
        with patch.object(watcher, "gh", side_effect=replies):
            result = watcher.snapshot("github.com", "owner/repo", 1)
        self.assertEqual(len(result["feedback"]["comments"]), 2)
        self.assertEqual(result["feedback"]["reviews"][0]["id"], 3)
        self.assertEqual(len(result["threads"]), 2)

    def test_pending_review_and_its_comments_are_left_out(self):
        pages = [{"data": {"repository": {"pullRequest": {"reviewThreads": {
            "nodes": [], "pageInfo": {"hasNextPage": False}}}}}}]
        inline = [[{"id": 10, "pull_request_review_id": 7}, {"id": 11, "pull_request_review_id": 8}]]
        reviews = [[{"id": 7, "state": "PENDING"}, {"id": 8, "state": "COMMENTED"}]]
        with patch.object(watcher, "gh", side_effect=[PR, [[]], inline, reviews, pages, PR]):
            result = watcher.snapshot("github.com", "owner/repo", 1)
        self.assertEqual([r["id"] for r in result["feedback"]["reviews"]], [8])
        self.assertEqual([c["id"] for c in result["feedback"]["inline_comments"]], [11])

    def test_head_race_rejected(self):
        later = dict(PR, headRefOid="h2")
        pages = [{"data": {"repository": {"pullRequest": {"reviewThreads": {
            "nodes": [], "pageInfo": {"hasNextPage": False}}}}}}]
        with patch.object(watcher, "gh", side_effect=[PR, [[]], [[]], [[]], pages, later]):
            with self.assertRaisesRegex(RuntimeError, "moved"):
                watcher.snapshot("github.com", "owner/repo", 1)

    def test_edit_same_id_wakes_and_closure_is_not_merge(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "state.json"
            value = {"pr": PR, "feedback": [{"id": 1, "body": "first"}]}
            with patch.object(watcher, "snapshot", return_value=value):
                watcher.watch("github.com", "o/r", 1, path, 1, 1, True)
                unchanged = watcher.watch("github.com", "o/r", 1, path, 1, 1, True)
            self.assertEqual(unchanged["reason"], "unchanged")
            changed = copy.deepcopy(value)
            changed["feedback"][0]["body"] = "edited"
            with patch.object(watcher, "snapshot", return_value=changed):
                self.assertEqual(watcher.watch("github.com", "o/r", 1, path, 1, 1)["reason"], "changed")
            changed["pr"]["state"] = "CLOSED"
            with patch.object(watcher, "snapshot", return_value=changed):
                result = watcher.watch("github.com", "o/r", 1, path, 1, 1)
            self.assertEqual(result["reason"], "terminal")
            self.assertEqual(result["snapshot"]["pr"]["state"], "CLOSED")

    def test_failed_fetch_preserves_observation_and_target_is_guarded(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "state.json"
            original = {"target": "github.com/o/r/1", "digest": "old"}
            watcher.save(path, original)
            with patch.object(watcher, "snapshot", side_effect=RuntimeError("rate limit")):
                with self.assertRaises(RuntimeError):
                    watcher.watch("github.com", "o/r", 1, path, 1, 1)
            self.assertEqual(json.loads(path.read_text()), original)
            with self.assertRaisesRegex(RuntimeError, "another PR"):
                watcher.watch("github.com", "o/r", 2, path, 1, 1)

    def test_quiet_watch_waits_then_returns_periodic_snapshot(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "state.json"
            value = {"pr": PR}
            watcher.save(path, {"target": "github.com/o/r/1", "digest": watcher.digest(value)})
            with patch.object(watcher, "snapshot", return_value=value), \
                    patch.object(watcher.time, "monotonic", side_effect=[0, 0, 0, 2]), \
                    patch.object(watcher.time, "sleep") as sleep:
                result = watcher.watch("github.com", "o/r", 1, path, 1, 1)
            sleep.assert_called_once_with(1)
            self.assertEqual(result["reason"], "unchanged")


class GitLabWatchTests(unittest.TestCase):
    def reply(self, discussions, mr_after=MR):
        responses = {
            "projects/group%2Fsub%2Frepo/merge_requests/7": iter([MR, mr_after]),
            "projects/group%2Fsub%2Frepo/merge_requests/7/discussions?per_page=100":
                iter([discussions]),
            "projects/group%2Fsub%2Frepo/merge_requests/7/approvals":
                iter([{"approved": False, "approvals_left": 1, "user_can_approve": True}]),
            "projects/9/pipelines/50/jobs?per_page=100":
                iter([[{"id": 1, "name": "test", "status": "running", "duration": 3.2}]]),
        }
        return lambda host, endpoint, paginate=False: next(responses[endpoint])

    def test_feedback_threads_jobs_and_approvals_are_collected_without_system_notes(self):
        discussions = [
            {"id": "d1", "notes": [{"id": 1, "system": True, "body": "added 1 commit"}]},
            {"id": "d2", "notes": [{"id": 2, "system": False, "resolvable": True,
                                    "resolved": False, "body": "null check"}]},
        ]
        with patch.object(watcher, "glab", side_effect=self.reply(discussions)):
            result = watcher.snapshot("gitlab.com", "group/sub/repo", 7, "gitlab")
        self.assertEqual([thread["id"] for thread in result["discussions"]], ["d2"])
        self.assertEqual(result["jobs"], [{"id": 1, "name": "test", "stage": None,
                                           "status": "running", "allow_failure": None,
                                           "failure_reason": None, "web_url": None}])
        self.assertNotIn("user_can_approve", result["approvals"])
        self.assertNotIn("updated_at", result["pr"])
        self.assertEqual(result["pr"]["head_pipeline"],
                         {"id": 50, "project_id": 9, "sha": "h1", "status": "running"})

    def test_head_or_pipeline_race_rejected(self):
        for later in (dict(MR, sha="h2"), dict(MR, head_pipeline=dict(MR["head_pipeline"], id=51))):
            with patch.object(watcher, "glab", side_effect=self.reply([], later)):
                with self.assertRaisesRegex(RuntimeError, "moved"):
                    watcher.snapshot("gitlab.com", "group/sub/repo", 7, "gitlab")

    def test_forge_is_github_only_for_github_hosts(self):
        for host, forge in (("github.com", "github"), ("acme.ghe.com", "github"),
                            ("github.acme.io", "github"), ("gitlab.com", "gitlab"),
                            ("git.ringkas.homes", "gitlab")):
            self.assertEqual(watcher.detect_forge(host), forge, host)

    def test_merged_mr_is_terminal(self):
        merged = dict(MR, state="merged")
        with tempfile.TemporaryDirectory() as directory, \
                patch.object(watcher, "glab", return_value=merged) as request:
            result = watcher.watch("gitlab.com", "group/sub/repo", 7,
                                   Path(directory) / "state.json", 1, 1, forge="gitlab")
        self.assertEqual(result["reason"], "terminal")
        request.assert_called_once()


if __name__ == "__main__":
    unittest.main()
