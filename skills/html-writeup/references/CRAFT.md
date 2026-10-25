# Craft

The structure in SHELL.md gets a page that works. This is the pass that makes it good: hierarchy, rhythm, restraint, and words. Apply it while building, then check it against the rendered page.

## Hierarchy comes from a few dimensions used hard

Weak hierarchy is many dimensions used timidly — everything slightly bigger, slightly bolder, slightly darker. Strong hierarchy stacks two or three and commits:

| Tool | Strong | Weak |
| --- | --- | --- |
| Size | 1.25× or more between steps | Sizes a hair apart |
| Weight | 650 against 400 | 500 against 400 |
| Space | Surrounded by whitespace | Evenly crowded |
| Colour | Ink against muted | Two similar greys |

Space and weight alone are usually enough. Reach for colour or a rule only when they aren't — a border is the easiest thing to add and the first thing that makes a page look busy.

## Rhythm is tight-then-generous

Uniform spacing reads as unconsidered even when every value is on the scale. The signal is contrast:

- **Tight** (`--space-xs` … `--space-md`) between things that belong together — an eyebrow and its title, a stat and its label, a figure and its caption.
- **Generous** (`--space-2xl`) between sections, so the reader feels a new idea start.

Proximity is grouping. If two elements sit equally far from everything, they read as unrelated no matter what the markup says.

## Spend boldness in one place

Pick the single element the write-up is remembered by — the one diagram that explains the whole finding, the stat row that lands the headline, a striking comparison table — and let it be the loud thing. Everything around it stays quiet.

A page with three bold moments has none. Before shipping, find the weakest decorative element and remove it: the extra rule, the second accent, the badge that repeats what the sentence already said.

## Structure has to be true

Structural devices encode information or they're decoration. Numbered sections mean the order matters. An eyebrow means there's context worth naming. A badge means the strength genuinely varies between items. A divider means a real break. If a device would say the same thing in any write-up, cut it.

## Words are the deliverable

In a UI, copy labels the thing. In a write-up, copy *is* the thing — so it earns the same attention as spacing.

- **Headings state the conclusion, not the topic.** "Payments leak across the seam" tells the reader something; "Payments" makes them read the section to find out. A reader skimming only the headings should get the argument.
- **The lede answers the question in the title.** Findings up front, evidence below. A write-up that builds to its conclusion buries it.
- **Specific beats clever.** "p95 fell from 2.4s to 900ms" over "performance improved dramatically."
- **Active voice, plain verbs.** "The parser drops trailing commas," not "trailing commas are not preserved by the parser."
- **Name things the way the reader does** — the domain's vocabulary, not the codebase's internal one.
- **Say the uncertainty plainly.** "Measured on one run; treat the ordering as indicative" is worth more than a confident sentence you can't support. Put it in a callout so it doesn't derail the paragraph.
- **Cut throat-clearing.** "It's worth noting that", "In this section we will", "Overall, it seems". If a sentence could be a bullet, make it a bullet; if a bullet could be cut, cut it.

## Check it on the rendered page

Structure is checkable in the DOM (SKILL.md step 3). Craft is checkable only by looking:

- **Squint test.** Blur your eyes at the screenshot. The most important thing on the page should still be obvious, and the sections should read as distinct blocks. If everything is one even grey texture, the hierarchy is decorative rather than real.
- **Scan test.** Read only the headings top to bottom. Do they carry the argument on their own?
- **Alignment.** Do edges line up along a small number of vertical lines? Stray left edges are what "assembled" looks like.
- **One-accessory-off.** Name the least necessary element on the page and delete it.
