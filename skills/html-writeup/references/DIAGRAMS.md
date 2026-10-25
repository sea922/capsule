# Diagrams

A diagram earns its place when the point is graph-shaped — a flow, a hierarchy, a sequence, a set of relationships. When the point is "these things differ along these axes," that's a table; when it's "this happened because of that," it's a sentence. Draw only what prose reads badly.

Put every diagram in a `.wide` figure so it escapes the prose measure (see SHELL.md).

## Mermaid, or hand-built

**Mermaid** for anything genuinely graph-shaped. It lays the graph out for you, and the layout stays right when the content changes.

When Mermaid is the chosen renderer, read [MERMAID.md](MERMAID.md) for runtime loading, integrity, offline freezing, and network disclosure.

**Hand-built inline SVG or CSS** when the picture isn't a graph and Mermaid would fight you: a before/after mass comparison, a layered cross-section, a timeline band, a proportion bar. A few positioned `<div>`s with borders, or one `<svg>` with `<rect>`/`<line>`, beat forcing the idea into a flowchart. Give hand-built figures a `role="img"` and an `aria-label` describing what they show, since there's no `accDescr` to do it for you.

Mixing both across a write-up is the norm — every diagram looking identical is its own kind of tell.

## Choose by shape

| Content shape | Diagram | Header keyword |
| --- | --- | --- |
| Steps, decisions, branching process | flowchart | `flowchart TD` / `flowchart LR` |
| Messages between actors over time | sequence | `sequenceDiagram` |
| Objects, fields, methods, inheritance | class | `classDiagram` |
| Entities and their relationships (data model) | entity-relationship | `erDiagram` |
| Modes and transitions between them | state | `stateDiagram-v2` |
| Tasks on a timeline, dependencies, durations | gantt | `gantt` |
| A single idea branching into sub-ideas | mindmap | `mindmap` |
| Proportions of a whole | pie | `pie` |
| Commits, branches, merges | git graph | `gitGraph` |
| System context / containers (architecture) | C4 | `C4Context` |

Rules of thumb:

- **Flowchart is the workhorse, not the default.** If the content is really an interaction, a sequence reads better; if it's really a data model, an ER diagram does. Reach for the shape that matches.
- **`LR` (left-right) for wide, shallow flows; `TD` (top-down) for deep, branching ones.** Wide flows in `TD` scroll off the bottom; deep flows in `LR` scroll off the side.
- **Split, don't cram.** More than ~15 nodes in one flowchart stops communicating. Use `subgraph` to group, or split into two diagrams on the page.

## Preserve ownership in the edges

Arrow geometry is a claim. The visible source, destination, and label must name who initiates each action; prose cannot repair a misleading shortcut.

- Route an orchestration response back to the coordinator before drawing the coordinator's next command. A failed `Payment` response should return to `Order Service`, then a separate `Order Service -> Inventory: release reservation` edge should show compensation.
- Draw emitted events from the owning service, not from the dependency whose success made emission possible. Payment success returns to `Order Service`; `Order Service -> Event stream: OrderConfirmed` is a separate edge.
- When time order or request/response ownership matters more than topology, use a sequence diagram or a numbered companion list.
- Before delivery, read every arrow aloud as “source does label to destination.” If that sentence is false or ambiguous, redraw it.

## Syntax rules that prevent parse errors

These are the failures that produce a red error card. Follow them and diagrams render.

- **Quote any label with a special character.** Parentheses, colons, commas, slashes, `#`, `&`, or quotes inside a label break the parser unless the whole label is quoted: `A["Fetch order (v2)"]`, not `A[Fetch order (v2)]`.
- **Line breaks are `<br/>`, inside a quoted label.** `A["Line one<br/>Line two"]`. Raw newlines do not work.
- **`end` is reserved — never a bare node id.** Lowercase `end` breaks flowcharts and subgraphs. Quote it (`["end"]`) or capitalize (`End`).
- **One diagram per `<pre class="mermaid">` block.** Never wrap the diagram in Markdown ``` fences inside the HTML — Mermaid reads the raw text and the fences become a syntax error.
- **First non-blank line is the diagram type.** Leading blank lines are fine; a stray word before `flowchart`/`sequenceDiagram` is not.
- **Node ids are alphanumeric; put the pretty text in the label.** `orderSvc["Order Service"]`, not `Order Service["..."]`.
- **In sequence diagrams, declare participants for ordering** and use `autonumber` when step order matters.
- **Comments are `%%` at line start**, not `//` or `#`.

## Accessibility and titles

Mermaid wires `accTitle`/`accDescr` into the SVG's `aria-labelledby` and `aria-describedby`, and adds `aria-roledescription` itself. Put them on the first two lines of every diagram:

```
flowchart LR
  accTitle: Order fulfilment flow
  accDescr: Cart checkout moves an order through payment, then packing, then shipping.
  cart["Cart"] --> pay["Payment"] --> pack["Packing"] --> ship["Shipping"]
```

**`accDescr` carries the relationships, not just the subject.** Mermaid exposes node text to screen readers but not the edges between nodes — a reader who can't see the diagram gets the boxes and none of the arrows. So write the connections into the description ("payment failure returns to the cart"), rather than restating the title.

The accessible description and the visible arrows must agree on initiator, receiver, and order. Treat a disagreement as a correctness defect.

## Styling within a diagram

Prefer the page's theme (set once in `initialize`, see SHELL.md) over per-diagram colors. When one node must stand out, use `classDef` + `class` rather than inline styles so it stays theme-consistent:

```
flowchart LR
  a["Normal"] --> b["Hot path"]
  classDef hot stroke-width:2px,stroke:#dc2626;
  class b hot
```

Keep color meaningful — one accent for the thing that matters, not a rainbow. Let the theme carry the rest.

## Worked examples

Flowchart with a decision:

```
flowchart TD
  accTitle: Login decision
  accDescr: An incoming request goes to the app when authenticated, and to the login page otherwise.
  start(["Request"]) --> auth{"Authenticated?"}
  auth -->|"yes"| app["App"]
  auth -->|"no"| login["Login page"]
```

Sequence with numbered steps:

```
sequenceDiagram
  accTitle: Checkout call sequence
  autonumber
  participant U as User
  participant API
  participant DB
  U->>API: POST /checkout
  API->>DB: reserve stock
  DB-->>API: ok
  API-->>U: 200 confirmed
```

Entity-relationship:

```
erDiagram
  accTitle: Order data model
  accDescr: A customer places many orders, and each order contains many line items.
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  ORDER {
    string id
    datetime placed_at
  }
```
