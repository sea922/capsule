from __future__ import annotations

import unittest

from check_preservation import compare


BEFORE = """---
title: Incident update
---
# Checkout incident

At 14:30 UTC, error rates reached 17%. See [the dashboard](https://status.example.com/a).
Run `queue inspect --failed` before changing `/srv/checkout/config.yml`.

```json
{"retryLimit": 3}
```

> Customer data was not lost.

| Region | Errors |
| --- | ---: |
| EU | 42 |
"""


class PreservationTests(unittest.TestCase):
    def test_prose_can_change_around_preserved_content(self):
        after = BEFORE.replace("error rates reached", "the error rate rose to")
        self.assertEqual(compare(BEFORE, after), [])

    def test_removed_and_added_facts_are_reported(self):
        after = BEFORE.replace("17%", "12%").replace(
            "https://status.example.com/a", "https://status.example.com/b"
        )
        findings = compare(BEFORE, after)
        categories = {item.category for item in findings}
        self.assertIn("number", categories)
        self.assertIn("link-target", categories)

    def test_sentence_punctuation_after_bare_url_is_not_part_of_url(self):
        before = "Status: https://status.example.com/current."
        after = "Status: https://status.example.com/current!"
        self.assertEqual(compare(before, after), [])

    def test_protected_markdown_is_reported(self):
        after = BEFORE.replace("# Checkout incident", "# Service incident").replace(
            '"retryLimit": 3', '"retryLimit": 4'
        )
        categories = {item.category for item in compare(BEFORE, after)}
        self.assertIn("heading", categories)
        self.assertIn("fenced-code", categories)

    def test_frontmatter_quotes_and_inline_code_are_reported(self):
        after = (
            BEFORE.replace("title: Incident update", "title: Service update")
            .replace("> Customer data was not lost.", "> No data was lost.")
            .replace("`queue inspect --failed`", "`queue inspect`")
        )
        categories = {item.category for item in compare(BEFORE, after)}
        self.assertTrue({"frontmatter", "blockquote", "inline-code"} <= categories)

    def test_intentional_category_can_be_allowed(self):
        after = BEFORE.replace("# Checkout incident", "# Service incident")
        self.assertEqual(compare(BEFORE, after, {"heading"}), [])

    def test_message_facts_moved_into_a_list_are_not_reported(self):
        before = (
            "Hi Priya, could you approve run 5974587? It has the fix from PR #196. "
            "On eu4 it had about 2,000 errors per hour before the flip and none since. Thanks!"
        )
        after = (
            "Hi Priya,\n\nCould you approve **run 5974587**?\n\n"
            "**Why:** it has the fix from PR #196.\n\n"
            "- On eu4 it had about 2,000 errors per hour before the flip, and none since.\n\n"
            "Thanks!\n"
        )
        self.assertEqual(compare(before, after), [])

    def test_table_shape_change_is_reported(self):
        after = BEFORE.replace("| EU | 42 |", "| EU | Checkout | 42 |")
        self.assertIn("table-shape", {item.category for item in compare(BEFORE, after)})

    def test_hex_looking_word_is_not_treated_as_an_identifier(self):
        before = "The mural was defaced last winter."
        after = "Vandals damaged the mural last winter."
        self.assertEqual(compare(before, after), [])

    def test_commit_hash_change_is_still_reported(self):
        before = "Cited commit b504e2086bd3 in the report."
        after = "Cited commit f666087aa19c in the report."
        self.assertIn("hash-or-id", {item.category for item in compare(before, after)})

    def test_swapping_equal_values_is_a_known_blind_spot(self):
        before = "EU errors hit 42%. US errors hit 17%."
        after = "EU errors hit 17%. US errors hit 42%."
        self.assertEqual(compare(before, after), [])


if __name__ == "__main__":
    unittest.main()
