# Research: Writing Formats for `writing-for-humans`

**Research date:** 2026-10-27

**Skill:** [`writing-for-humans`](../../skills/writing-for-humans/SKILL.md)

**Question:** How should the skill lay out prose by genre? The owner asked for
two changes: more whitespace in written output, and no signature or sign-off
on Teams and other chat messages.

## Findings

1. **Short, single-idea paragraphs with visible space between them are well
   supported.** Exact numbers are not. The best concrete figures come from the
   Microsoft Writing Style Guide: three to seven rendered lines per paragraph,
   with space between paragraphs of at least half the font size. Several
   popular whitespace claims could not be traced to a primary study.
2. **No authoritative source says chat should have no sign-off.** No source
   contradicts it either. The rule rests on rendering facts and on peer skills
   that remove chatbot closers. Record it as a house rule with a rationale,
   not as a cited standard.
3. **Fragmentation is the counter-risk.** Breaking reasoning into one-line
   paragraphs or bold lead-in bullets is a known AI-writing pattern. The
   whitespace rule needs a limit: space separates ideas, it does not split them.
4. **Formats differ by genre.** Chat, email, status updates, documentation and
   reports have different conventions. The preferred repositories that handle
   this route by genre or profile rather than applying one universal layout.

## Whitespace and paragraphs

- **Scanning.** NN/g found that 79% of users scanned new web pages and 16% read
  word by word. Its guidance is one idea per paragraph, conclusion first.
  In NN/g's test, a scannable layout raised measured usability by 47%.
  [NN/g, How users read on the web](https://www.nngroup.com/articles/how-users-read-on-the-web/).
  This is web-page evidence, not chat.
- **Paragraph length and spacing.** "Three to seven lines is about the right
  length for a paragraph," a single-line paragraph is fine now and then, and
  paragraphs get extra space between them.
  [Microsoft Writing Style Guide, Scannable content](https://learn.microsoft.com/en-us/style-guide/scannable-content/).
  These are rendered lines, so in a narrow chat pane that means roughly one to
  three sentences. That conversion is an inference.
- **Accessibility.** WCAG 2.1 SC 1.4.12 requires content to survive paragraph
  spacing of 2× the font size. SC 1.4.8 (AAA) asks for paragraph spacing of at
  least 1.5× the line spacing so readers can find where paragraphs end.
  [1.4.12](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html),
  [1.4.8](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html).
- **Phones.** Comprehension is about equal on phones and desktops, but hard
  text slows phone readers more.
  [NN/g, Mobile content](https://www.nngroup.com/articles/mobile-content/).
- **Academic.** Chaparro et al. (2004) compared four whitespace layouts. Margins
  affected reading speed and comprehension. Line spacing changed preference but
  not measured performance.
  [Reading Online Text](https://portfolio.erau.edu/en/publications/reading-online-text-a-comparison-of-four-white-space-layouts/).
- **Not citable.** The "whitespace raises comprehension 20%" figure, "Lin 2004",
  and the Wichita State line-spacing studies could not be traced to primary
  sources during this pass.

## Chat

- **Greeting.** [nohello.net](https://nohello.net/en/) says a greeting is fine
  when the ask comes in the same message, and a bare greeting sent on its own
  wastes the reader's time. Queen's University IT advises skipping greetings in
  Teams altogether (seen only as a search snippet). The sources disagree, so the
  skill keeps a short greeting, always in the same message as the ask.
- **Sign-off.** The Teams client shows sender name and avatar on every message.
  Through Microsoft Graph, the sender identity comes from authentication, not
  the body ([chatMessage](https://learn.microsoft.com/en-us/graph/api/resources/chatmessage?view=graph-rest-1.0)).
  A signature repeats the sender line, and a closing pleasantry adds a line to
  scroll past. I did not retrieve a Microsoft page documenting the sender
  display itself.
- **Formatting.** Slack recommends bold and bullets to make longer messages
  scannable, and threads for deeper discussion
  ([Slack blog](https://slack.com/blog/collaboration/slack-essentials-getting-the-most-out-of-messaging)).
  Slack uses its own `mrkdwn` dialect, not full Markdown.
- **Teams rendering.** Graph accepts `html` or `text` bodies, and the body is
  always HTML when it contains a mention. How `<p>` and `<br>` spacing renders
  is unverified. Send one test message before relying on it repeatedly.

## Email

- **BLUF.** Put the main point first. This comes from the US Army writing
  standard AR 25-50, read through secondary sources only
  ([summary](https://en.wikipedia.org/wiki/BLUF_(communication))).
- **Greeting and sign-off.** Email is a letter form. Microsoft 365 guidance and
  IT-help sources treat a greeting and a sign-off as expected, scaled to
  formality. These are conventions, not research.
- **Subject lines.** Only marketing sources were found. The working rule is
  that the subject names the topic and the action.

## Other genres

- **Status and incident updates.** State the current status, impact, actions
  and the next update time, and do not invent an ETA
  ([Atlassian incident communication](https://support.atlassian.com/statuspage/docs/incident-communication-tips)).
- **Documentation and reports.** Use a list for a sequence or a collection of
  parallel items, never for a single item, and introduce it with a full
  sentence ([Google developer style, lists](https://developers.google.com/style/lists)).
- **PR descriptions and commits.** These belong to this repository's
  `pr-description` and `git-workflow` skills. Not researched here.

## Counter-evidence

- NN/g says bulleted lists help only when used correctly
  ([video](https://www.nngroup.com/videos/tips-bulleted-lists-digital-content/)).
- The [Wikipedia "Signs of AI writing"](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
  essay, which is not policy, lists overused bold, inline-header bullets, and
  tidy wrap-ups as tells.
- No study compared many one-line paragraphs with paragraphs of two to four
  sentences in chat. Do not claim that more whitespace is always better.

## Preferred source repositories

Read in the order of [`docs/source-repos.md`](../source-repos.md) on
2026-10-27, default branches, unpinned. Large repository trees were truncated
in listings, so a missing file is not proof of absence.

| # | Repository | Relevant files | Influence |
| --- | --- | --- | --- |
| 1 | `mattpocock/skills` | `writing-shape`, `writing-beats`, `.agents/writing-docs.md` | Adopted the list test: lists for parallel items, prose for argument. Same-shape items repeated three or more times belong in a table. |
| 2 | `obra/superpowers` | platform-neutral prose spec | Not applicable; it covers word choice only. |
| 3 | `addyosmani/agent-skills` | `documentation-and-adrs` | Supports deferring to a project's established documentation convention, which is already in the order of authority. |
| 4 | `cursor/plugins` (`pstack`) | `unslop`, `poteto-mode` | The `unslop` skill removes chatbot closers and offers to help, and limits bold. It is the closest support for no sign-off in chat, though it does not mention signatures. |
| 5 | `DietrichGebert/ponytail` | `ponytail` | Not applicable; it covers code minimalism. |
| 6 | `mvanhorn/last30days-skill` | `references/synthesis.md` | Not applicable. Its closing invitation runs against the no-closer direction. |
| 7 | `anthropics/skills` | `internal-comms`, `doc-coauthoring` | Precedent for routing by genre. Its 3P update template is strict and has no blank lines. Hence the whitespace rule yields to a mandated template. |
| 8 | `trailofbits/skills` | report-format resources | Not applicable to messages. Reports carry a fixed skeleton with prioritized actions. |
| 9 | `EveryInc/compound-engineering-plugin` | `ce-noslop` guide | Its rule against acknowledgements and offers of more help supports dropping chat closers. It adapts register to the reader. |
| 10 | `garrytan/gstack` | `ETHOS.md`, `SKILL.md.tmpl` | Not applicable; no voice or format rules found. |
| 11 | `affaan-m/ECC` | `article-writing`, `investor-outreach` | Says formatting matches the medium. Its investor email ends with a sign-off giving name and role, which supports keeping email sign-offs. |
| 12 | `wshobson/agents` | `avoid-ai-writing` profiles | Its `casual` profile treats chat lightly and its `docs` profile puts clarity first. This supports genre-specific layout. |
| 13 | `nahid-sparktales/agent-dispatcher` | copywriter and docs commands | Not applicable; the guidance lives in an unread roles file. |
| 14 | `humanlayer/skills` | `show-me`, PR description template | Not applicable; PR format belongs to `pr-description`. |
| 15 | `testdouble/han` | `docs/readability.md` | Adopted one idea per paragraph with the point in the first sentence. Supports leading with the point. |

None of the 15 repositories sets a rule for blank lines or for chat
signatures. Both changes are new relative to the preferred sources.

## Decisions for the skill

1. **Chat.** No sign-off, signature, name or closing pleasantry. The message
   ends on the ask, the deadline or the last fact. A short greeting stays, on
   its own line in the same message as the ask.
2. **Email.** Keep the greeting and the sign-off.
3. **Whitespace.** Separate every paragraph, list and label with a blank line
   (or an HTML block element). Give each idea its own paragraph of one to
   three sentences. Keep a cause with its effect and a claim with its
   qualification in the same paragraph, and merge one-line paragraphs that
   form a single thought.
4. **Genre table.** Add a compact table to the skill for chat, email, status
   updates, documentation and reports, and announcements. Defer PR and commit
   text to their own skills.
5. **Templates win.** A mandated template or house style overrides the spacing
   defaults, following the existing order of authority.

## Open checks

- Send one Teams test message through each body type to confirm how `<p>` and
  blank lines render.
- Check Slack's `mrkdwn` documentation before adding Slack-specific syntax.
