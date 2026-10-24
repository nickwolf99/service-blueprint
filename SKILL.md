---
name: service-blueprint
description: Build service design blueprints in FigJam, as swimlane current-state and future-state workflow maps of a business process. Draws them from discovery or working-session transcripts, requirements docs, BPMN or client diagrams, form schemas and screenshots. Every blueprint carries numbered open questions, pain points and open design decisions keyed to lists below the diagram. Use this skill whenever someone asks for a current state, future state, service blueprint, swimlane, process map or workflow diagram of a business or government process in FigJam; wants a discovery transcript turned into a diagram; is revising a blueprint after a client review (v2); is checking a future state against the agreed scope; or wants the markers and lists on one renumbered or synced. Use it even if they never say "blueprint". Not for app screen task flows or wireflows.
---

# Service blueprints in FigJam

These blueprints map how a business process works today (current state) and how it could work with a workflow platform (future state). They are built for discovery work with program areas. The client walks through the board in a working session, and the numbered markers become the agenda. Everyone who opens one of these boards should be able to read it the same way. That is why the layout, colours and numbering stay consistent from board to board, and why most of this skill is about doing the same thing every time.

A blueprint has three parts, top to bottom:

1. **The diagram.** Phase bars across the top and lanes for each role down the left. Steps sit in a column grid that reads left to right in time, with diamonds for decisions. A divider then leads into three rows: Outputs, Systems and External systems.
2. **Markers.** Small numbered circles pinned to steps: open questions and pain points (current state), or open design decisions and fixed pain points (future state).
3. **Lists below the diagram,** keyed to the markers, plus a legend and a one-line caption.

## Before you start

- **Tools.** You need the Figma MCP server with `use_figma` (write access). Load the `figma:figma-use` and `figma:figma-use-figjam` skills before the first `use_figma` call, and call `create_session` with the board's file key. To read a board, use `get_figjam`, `get_screenshot` or a read-only `use_figma` script. `get_metadata` does not work on FigJam files.
- **The board.** Ask for the FigJam URL and where the new section goes: below the last section, or inside a working section the user names. The Figma account behind the MCP needs edit access. If a write fails on permissions, ask the user to share the board with that account or to duplicate it into a file they own.
- **The sources.** Read every source in full before planning: transcripts, requirements docs, earlier boards, scope lists and screenshots of the client's own diagrams. Transcripts mangle names. Keep a short list of names you're unsure of, and ask about them rather than guessing.

## Workflow

### 1. Pull the process out of the sources

Work through the sources and note:

- **Actors** (they become lanes). Put people and teams first, then the platform lane in a future state, then team-specific lanes.
- **Phases.** Four to seven stages, named for the work, such as REQUEST & PRE-FILL or MISSED CHECK-IN RESPONSE.
- **Steps.** Who does what, with which tool, in what order. Also note decisions, hand-offs, waits, loops back and exceptions.
- **Outputs, systems and external parties** that each step touches.
- **Volumes and timings** ("about 40 loans a month", "entry closes on the 24th").
- **Pain points.** What people complained about, worked around or apologised for.
- **Open questions.** Gaps, places where two people described it differently, things only one person knew, and the usual unknowns: data classification, records retention, access, who maintains reference data.
- **Who said what, and when.** Answers in the lists carry attribution ("Sam, 28 Sep").

Anything you inferred rather than heard is an assumption. Mark it as one on the board (see `assumedStep` in the helpers).

### 2. Plan the layout as a brief

Before touching Figma, write the plan as a brief using `assets/brief-template.md`. It covers the section title and subtitle, phases with column spans, lanes, every node with its lane, column and text, diamonds, notes, row nodes, connectors, markers and the list text. A brief is cheap to fix and a built board isn't. It is also the record you'll diff against when v2 comes along. Save it next to the user's project files, or in the scratchpad if there's no obvious place.

Check the brief before building:

- Columns run left to right in time. No two nodes share a cell.
- Every step is reachable, and every branch ends somewhere.
- No connector's path runs through another node, notes included. An elbowed connector between two lanes turns halfway between them, so keep that cell empty or pick other magnets.
- Step text is under about 175 characters. Longer text truncates in a 280x170 box.
- Markers are numbered in board order (step 4).

If the sources were thin or contradictory, show the user a short summary first: lanes, phases, step count and the top questions. Otherwise, build.

### 3. Build in FigJam

Paste `scripts/blueprint-helpers.js` at the top of every build script and set `PREFIX`, `SECTION_ID` and `LANE_COUNT`. The helpers encode the visual spec (`references/visual-spec.md`), so you place things by lane and column instead of by pixel. Build in about five calls, each returning the IDs it created:

1. Section, title, subtitle, phase bars, lane labels, divider and row labels. Size the section with `sectionWidth(lastCol)` and a generous height.
2. Step nodes, diamonds, context notes and row nodes.
3. Connectors: `flow` for the main path, `exception` for loops and exception paths, and `link` from each step down to its output, system or external node.
4. Markers.
5. Legend, caption and lists, then `fitSection()`. `legend()` wraps onto extra rows on narrow boards and returns the y just below itself. Put the caption at that y + 10 and the lists below the caption.

A `use_figma` script that throws is rolled back, so after fixing the error you can rerun the same call. Read `references/figjam-gotchas.md` before writing connectors. Connector endpoints, coordinates inside sections and cloned connectors each have a trap that has cost real time.

To place a new section, read the bounds of what's already there and go below the lowest section with about 250px of space. Use `freeYBelow()` for this. Inside a working section, use section-relative coordinates.

### 4. Number markers and lists in board order

Number the markers by where they sit on the finished board. Start at the upper left, go left to right by column, and top to bottom where markers share a column. Order the list keyed to them the same way, so marker 7 and list item 7 are always the same thing. Numbered markers and P markers are separate sequences.

Number at layout time, not in the order things were written down. When a revision adds, removes or moves markers, renumber the whole set rather than adding new ones at the end. A "New:" label on the list item is enough to show what was added. Use `scripts/renumber-markers.js` for this. Run it once with `DRY_RUN = true`, read the plan (old to new numbers, reordered lists and every citation it will rewrite), then run it for real. It also rewrites citations in other text ("decision 7", "decisions 5 and 16", "P3") and renames the marker nodes.

Pain point numbers are shared between a current state and its future state. If you renumber them on one board, say so, and offer to bring the other board in line. Set `RENUMBER_P: false` when the user wants the two boards to stay matched.

### 5. Check it

Screenshot the whole section with `get_screenshot` at `maxDimension` 4000, then look at crops of the left and right halves. Check for:

- truncated step text
- connectors that look unattached or cut through a node
- markers that overlap each other or a connector label
- lists that don't match the markers
- a legend that's missing a symbol the diagram uses
- em dashes, and headings that end with a full stop

Fix each problem with a targeted script, then take one more screenshot.

### 6. Hand over

Give the link to the section (`?node-id=` with the colon as a dash) and a short summary: lanes, phases, step count, and the open questions or decisions, which are the agenda for the next session. Call out assumptions and names you weren't sure of. If you keep notes or memory between sessions, record the board, section ID and prefix so the next revision can find them.

## Current state vs future state

`references/content-guide.md` has the details. In short:

- **Current state.** Describes what happens today, including the workarounds. It has red numbered **open questions** (top-right of a node) and orange **P# pain points** (top-left). The lists below are OPEN QUESTIONS and PAIN POINTS, and optionally HEARD IN DISCOVERY and a caption with volumes. There is no automation lane if none exists today.
- **Future state.** Adds the platform lane (for example "Workflow automation (n8n)") and the systems the proposal relies on. It has red numbered **open design decisions** and green **P# markers** where a current pain point gets fixed. The lists below are OPEN DESIGN DECISIONS; CURRENT PAIN POINTS, and how this future state addresses them; WHAT STAYS THE SAME; and IN SCOPE FOR AN INITIAL IMPLEMENTATION, and where this future state covers it. Every pain point is either addressed or explicitly "not addressed; depends on decision N".

## Revising after a review (v2)

- Keep the reviewed version untouched for diffing. Clone the section, place it below, give it a new prefix (CS2, FS2), and retitle it "(draft v2)" or "v2".
- **Current state v2.** Turn answered markers green (`'ans'`) and annotate list items: "Answered 28 Sep: ...", "Partly answered 28 Sep: ...", "Still open after 28 Sep".
- **Future state v2.** Fold in the answers and add or retire decisions, then renumber in board order. Add a WHAT CHANGED FROM DRAFT V1 list and update the in-scope coverage.
- **Hand edits.** The user may have edited the board by hand since you last saw it, renumbering or retitling things. Re-read the section before changing anything. Treat label text as the truth, because node names may be stale.

## Checking a future state against scope

When asked to validate a future state, check it against the agreed scope list and the latest review answers before redrawing anything. Report the gaps as a list first. Look at:

- every in-scope item
- every current pain point
- every answered question
- each branch: simple or complex, approve or return
- changes before and after approval
- someone being away (delegation or reassignment)
- attachments and notifications
- where the record lives, and retention
- access and privacy classification
- mobile use
- who maintains reference data such as staff or site lists

## Writing rules

These are the house style. The fuller version is in `references/content-guide.md`.

- **No em dashes anywhere.** Use commas, colons or brackets instead.
- **No full stop at the end of a heading.** That includes phase bars, list headings and titles.
- **Steps start with a verb** and are written from the lane's point of view: "Email the supervisor with the item, dates and project code". Name the tool used, and keep it under 175 characters.
- **Diamonds are short questions:** "Approve?", "Which route?".
- **Plain language, in the client's spelling** (Canadian, British or US). Write dates as "28 Sep 2026", and attribute answers to the person who gave them.

## Files

- `scripts/blueprint-helpers.js`: paste at the top of every build script. Contains the geometry, colours and the step, diamond, row node, connector, marker, legend and list helpers.
- `scripts/renumber-markers.js`: board-order renumbering of markers, lists and citations, with a dry run.
- `references/visual-spec.md`: exact sizes, colours, fonts and naming. Read it when building without the helpers or matching an older board.
- `references/content-guide.md`: what goes on current and future states, how to phrase steps, questions, pain points and decisions, and list formats.
- `references/figjam-gotchas.md`: API traps for connectors, sections, cloning, text and lists. Read it before step 3.
- `assets/brief-template.md`: the layout brief to fill in at step 2.
