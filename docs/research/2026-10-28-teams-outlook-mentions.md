# How Teams and Outlook encode @mentions

Research for the `writing-for-humans` message layout, which asks the greeting
to @mention the person who acts (upstream PR #71). The question: what
markup or metadata makes a real mention, one that notifies the person, in
Microsoft Teams and Outlook email?

## Freshness fingerprint

Retrieved 2026-10-28.

| Source | Revision |
| --- | --- |
| [Graph: Send chatMessage](https://learn.microsoft.com/en-us/graph/api/chatmessage-post) | page `updated_at` 2026-05-19 |
| [Graph: chatMessageMention](https://learn.microsoft.com/en-us/graph/api/resources/chatmessagemention) | microsoft-graph-docs `a2757dd` |
| [Teams: Format text in cards](https://learn.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/cards/cards-format) | msteams-docs `3fbcae7` |
| [Graph beta: mention](https://learn.microsoft.com/en-us/graph/api/resources/mention?view=graph-rest-beta) | microsoft-graph-docs `d797243` |
| [Graph beta: user sendMail](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-beta) | microsoft-graph-docs `41a8240` |
| [Outlook support: Use @mentions](https://support.microsoft.com/en-US/Outlook/mail/use-mentions-to-get-someone-s-attention-in-outlook) | retrieved 2026-10-28 |
| [UiPath forum: mention in HTML content](https://forum.uipath.com/t/how-to-mention-someone-in-html-content/469660) | posts 2022-09-01 and 2022-09-02 |

Local dependency: `skills/writing-for-humans/SKILL.md`, section "Message
layout".

## Conclusion

Teams and Outlook work differently.

- **Teams:** a mention is inline markup plus a matching metadata entry. The
  text alone notifies no one.
- **Outlook:** a mention is message metadata, not body markup. Typing `@Name`
  in Outlook makes the client set it. No HTML a writer can paste is documented
  to produce a real mention.

This research checked the first draft of the mention rule, written earlier in
the same pull request and never released. That draft's email rule,
`<a href="mailto:ADDRESS">@Display Name</a>`, produces a link, not a mention.
Its Teams rule was correct for Graph `chatMessage`, but it did not state the
ID type and did not cover Adaptive Cards sent by bots or incoming webhooks.
The rule that shipped follows the implications below.

## Teams

### Graph chatMessage (send as a user)

First-party documentation. The `chatMessage` body must be HTML. Each mention is
an `at` element whose `id` matches an entry in the message's `mentions` array:

```json
{
  "body": {
    "contentType": "html",
    "content": "Hello World <at id=\"0\">Jane Smith</at>"
  },
  "mentions": [
    {
      "id": 0,
      "mentionText": "Jane Smith",
      "mentioned": {
        "user": {
          "displayName": "Jane Smith",
          "id": "ef1c916a-3135-4417-ba27-8eb7bd084193",
          "userIdentityType": "aadUser"
        }
      }
    }
  ]
}
```

The `chatMessageMention` reference states that `id` "matches the {index}
value in the corresponding `<at id="{index}">` tag", and that the body
"encloses the **mentionText** of each mention in an HTML `at` element". The
documented `mentioned.user.id` is the Microsoft Entra object ID with
`userIdentityType` `aadUser`. The Graph pages show no example using a UPN
or email address for this ID.

### Adaptive Cards (bots and incoming webhooks)

First-party documentation. The card text uses `<at>Name</at>` with no `id`
attribute, and `msteams.entities` carries a `mention` whose `text` repeats the
same `<at>` string:

```json
"msteams": {
  "entities": [
    {
      "type": "mention",
      "text": "<at>Adele Vance</at>",
      "mentioned": { "id": "AdeleV@contoso.onmicrosoft.com", "name": "Adele Vance" }
    }
  ]
}
```

- Bots accept the Teams user ID (`29:…`), the Entra object ID, or the UPN.
- Incoming webhooks accept the Entra object ID or the UPN, support only user
  mentions, and cap the card at 28 KB.
- Mentions work in `TextBlock` and `FactSet` elements.
- Channel and team mentions aren't supported in bot messages.

## Outlook email

### What a real mention is

The Outlook support article says that typing @ and a name will "highlight
their name and prompt Outlook to add them to the To line". The recipient sees
an @ marker in the Inbox and can filter for mail that mentions them. The
"Mentioned" filter needs Exchange Server 2016 or later, Exchange Online, or
Outlook.com. The @ indicator needs Exchange Online or Outlook.com.

The Graph beta `mention` resource explains the mechanism: Outlook "sets the
**mentions** property before it creates and sends the message". A mention is
therefore metadata on the message. Its `mentionText` is "not used and
defaulted as null for **message**".

### Sending one through Graph

Beta only. `sendMail` and draft creation accept a `mentions` array alongside
the required `toRecipients`. The documented example has no special body
markup:

```json
{
  "message": {
    "subject": "Project kickoff",
    "toRecipients": [{ "emailAddress": { "name": "Samantha Booth", "address": "samanthab@contoso.com" } }],
    "mentions": [{ "mentioned": { "name": "Dana Swope", "address": "danas@contoso.com" } }]
  }
}
```

The beta pages warn that `/beta` APIs "are subject to change" and that
production use "is not supported". I found no v1.0 equivalent.

### Hand-written HTML

Community report, unverified. A 2022 forum thread, building on a 2019 Stack
Overflow answer, adds `<a id="OWAAM<guid>" href="mailto:…">@Name</a>` to the
HTML body. The original poster reports that this produces only a named link:
there is no @ indicator, and the mail does not appear under the "Mentioned"
filter. No Microsoft source documents an `OWAAM` anchor.

## Implications for writing-for-humans

These are inferences from the evidence above, stated as changes to the first
draft of the rule.

1. **Teams via Graph:** keep `<at id="N">Display Name</at>` with a matching
   `mentions[N]`. Require `mentionText` to equal the text inside the `at`
   element, `mentioned.user.id` to be the Entra object ID, and
   `userIdentityType` to be `aadUser`.
2. **Teams via an Adaptive Card** (bot or incoming webhook): use
   `<at>Display Name</at>` with an `msteams.entities` mention whose `text`
   repeats that string. The ID is the UPN or Entra object ID, or the Teams
   user ID for a bot.
3. **Outlook email:** drop the draft's `mailto` anchor. Write `@Display
   Name` as plain text and tell the author to retype it as a mention in
   Outlook, by typing @ and picking the person, which also adds them to To.
   When the message is sent through Graph beta, set `mentions` and
   `toRecipients`. In both cases the body text is just `@Name`.
4. **No ID available:** keep the draft's fallback. Write the plain name and
   say that a real mention needs the ID.

## Limits

- Not tested: no message was sent to a live Teams or Exchange tenant.
- Whether Graph `chatMessage` accepts a UPN for `mentioned.user.id` is
  undocumented in the pages read.
- The behavior of the `OWAAM` anchor in current Outlook clients is known only
  from one 2022 forum thread.
- Slack's `<@USER_ID>` form was outside this question and was not re-checked.

## Preferred source repositories

These are agent-skill repositories, not Microsoft API documentation, so none
was expected to own a claim here. On 2026-10-28 I code-searched each for
mention-related files, but GitHub's search rate limit cut the check short for
seven of them. On 2026-11-17 I finished those seven by cloning each at the
revision shown and searching the whole tree for Teams, Outlook, and Slack
mention forms (`<at`, `msteams`, `mentions`, `mentionText`, `<@U…>`,
`@mention`, Outlook, and Teams or Slack messages), then reading every match.

| Repository | Revision | Result |
| --- | --- | --- |
| mattpocock/skills | `59db609` | No Teams, Outlook, Slack, mail, or message files matched "mentions"; not applicable |
| obra/superpowers | `2ce8aa1` | No match; not applicable |
| addyosmani/agent-skills | `aeac41d` | No match; not applicable |
| cursor/plugins | `c742dd6` | No match; not applicable |
| DietrichGebert/ponytail | `09c434a` | No match; not applicable |
| mvanhorn/last30days-skill | `e06af25` | No match; not applicable |
| anthropics/skills | `dbd4588` | No match; not applicable |
| trailofbits/skills | `149d7b2` | No match; not applicable |
| EveryInc/compound-engineering-plugin | `a3d6a8e` | Its Slack researcher agents search with `from:<@U123456>`, which agrees with the `<@USER_ID>` form the skill uses for Slack; no Teams or Outlook guidance. Secondary corroboration only |
| garrytan/gstack | `9e3308f` | No match; not applicable |
| affaan-m/ECC | `3f14a10` | Only generic advice to "use @mentions" in Jira and an Outlook address regex; not applicable |
| wshobson/agents | `9c61ab2` | Lists Teams as an integration and says to "tag relevant stakeholders with @mentions", with no markup or metadata; not applicable |
| nahid-sparktales/agent-dispatcher | `564c3f0` | "mentions" matches only issue-reference scoring code; not applicable |
| humanlayer/skills | `4d69d20` | No match; not applicable |
| testdouble/han | `abba73a` | Writes GitHub `@mentions` in changelogs as profile links, a different platform; not applicable |

None of the repositories influenced the Teams or Outlook conclusion, which
rests on Microsoft's own documentation. compound-engineering-plugin is the only
one that touches the Slack form, and it agrees with it.
