# Visual spec

Measured from a production future-state board (21 columns, 6 lanes), the reference for this style. All coordinates are relative to the blueprint section. `scripts/blueprint-helpers.js` implements everything here. Use this file when building without the helpers, or when checking an older board.

## Section

- White fill, named in caps with the version: `CURRENT STATE v2 (Equipment loans, reviewed 28 Sep 2026)`, `FUTURE STATE (Equipment loans, draft v2)`.
- Width = x of the last column + 280 + 120. A 21-column board (columns 0 to 20) is 7680 wide.
- Height is fitted to the content plus 140 at the end.
- New sections go below the lowest existing section, about 250px clear, left-aligned with it.

## Header

| Element | Position | Style |
|---|---|---|
| Title | 60, 46 | Inter Bold 36, #1E1E1E |
| Subtitle | 60, 112 | Inter Medium 18, #555555. One or two sentences: the source session and date, plus what the marker colours mean |

## Grid

| Thing | Rule |
|---|---|
| Columns | x = 480 + c × 340 (c = 0, 1, 2, ...) |
| Step node | 280 × 170, rounded rectangle |
| Phase bar | y 230, h 70, x = column x, w = span × 340 − 60 (60px gap between bars) |
| Lanes | lane i starts at y = 320 + i × 240, height 232 (8px gap) |
| Step node y | lane y + 35 |
| Diamond | 300 × 200 at x = column x − 10, y = lane y + 20 |
| Divider | x 60, y = lanes bottom + 38, h 16, w = section width − 120 |
| Rows below divider | Outputs, Systems, External systems at y = divider + 50 + r × 200, label height 182 |
| Row node | 280 × 140 at row y + 25 |
| Context note | 280 × 170, free position (often in the corridor above the top lane) |

## Lane labels

- Group labels: x 60, w 175, fill #E6E6E6, square, Inter Bold 14, spanning the lanes of that group (h = lanes × 240 − 8). Examples: "Field teams", "Management", "Workflow platform".
- Role labels: x 245, w 225, fill #EDEDED, square, Inter Bold 14, one per lane. Examples: "Supervisor (approver)", "Workflow automation (n8n)".
- Below the divider: one group label "Data systems and status" (h 582) and role labels Outputs, Systems, External systems.

## Colours

Phase bars, with the matching tint for that phase's step nodes, in phase order:

| # | Bar | Step tint | Used for (example) |
|---|---|---|---|
| 0 | #E4CCF9 | #F1E5FC | request, intake |
| 1 | #BFE0FA | #DCEEFC | approval, routing |
| 2 | #B8EDDF | #D8F5EC | details, review |
| 3 | #FFF1C2 | #FFF1C2 | record, notify |
| 4 | #C5EEF5 | #DFF6FA | doing the work, changes |
| 5 | #FFC9C2 | #FFE0DC | exceptions, emergencies |
| 6 | #FFCFE1 | #FFE2EE | close-out, records, claims |

A step's tint follows the phase column it sits in, not its lane.

| Element | Fill | Stroke | Text |
|---|---|---|---|
| Diamond | #FFE0A3 | #E8A33D 2px | Inter Medium 14 |
| Context note | #F5F5F5 | #B5B5B5 2px dashed 6,5 | Inter Medium 13 |
| Assumed step | phase tint | #E0529C 2px dashed 8,6 | Inter Medium 14 |
| Output | #CDEFC8 | none | Inter Medium 13 |
| System | #E0E0E0 | none | Inter Medium 13 |
| External system | #D9D4F7 | none | Inter Medium 13 |
| Divider | #CFCFCF | none | none |
| Node text | | | #1E1E1E |
| List and legend text | | | #333333 |

## Connectors

| Kind | Name | Line | Colour | Dash | Ends |
|---|---|---|---|---|---|
| Main flow | `PFX:edge:a>b` | elbowed | #7A7A7A 2px | none | arrow at end |
| Exception or loop back | `PFX:exc:a>b` | elbowed | #7A7A7A 2px | 8,6 | arrow at end, label Inter Medium 16 |
| Step to row node | `PFX:link:a>b` | straight, CENTER magnets | #ABABAB 2px | 4,5 | no arrows |

Decision branches carry short labels ("yes", "no", "over the limit", "under the limit, different approver").

## Markers

44 × 44 ellipse, 3px white stroke, Inter Bold 12 white text.

| Marker | Colour | Text | Corner | Board |
|---|---|---|---|---|
| Open question | #F24822 red | 1, 2, 3 | top-right | current state |
| Pain point | #FF9F2E orange | P1, P2 | top-left | current state |
| Answered in review | #14AE5C green | the question number | top-right | current state v2 |
| Open design decision | #F24822 red | 1, 2, 3 | top-right | future state |
| Pain point addressed | #14AE5C green | P1, P2 | top-left | future state |

The marker is centred on the corner: offset (w − 22, −22) for top-right and (−22, −22) for top-left. On a diamond, use (228, 10) for top-right and (28, 10) for top-left. If a corner is taken, use the bottom edge.

## Legend

At y about 140 below the External row. One item every 240px from x 90: a 140 × 40 chip, with a centred label 55px below in Inter Medium 13, #333333. If the section is too narrow for every item, the legend wraps onto another row 110px lower (a 7-column board fits 11 items per row). Include each phase colour, decision point, context note, output, system, external system, each marker type used, the exception path (a dashed arrow), and assumed step if used. Name items `PFX:leg:*` and labels `PFX:legt:*`.

## Caption and lists

- Caption: Inter Medium 16, #333333, 10 below the legend's last row (the value `legend()` returns), full width (section width − 120). One or two sentences, for example the proposed platform in a future state, or volumes and "everything here is manual" in a current state.
- List heading: Inter Bold 26, #333333, in caps followed by a lower-case clause ("OPEN DESIGN DECISIONS, for the future-state working session").
- List body: Inter Medium 24, #333333, 54 below its heading, with 70 between blocks.
- Two columns: left at x 60, w 3900; right at x 4300, w 3260 (on a 7680 board). The numbered list goes left, P items right.
- Numbered lists use Figma's ordered-list formatting (`setRangeListOptions(..., { type: 'ORDERED' })`), with no number typed into the text. Pain point lists type the number: "P1. Stale copied plans: ...". Other lists are bullets (`UNORDERED`).

## Naming

Every node gets the diagram prefix (`CS`, `FS`, `CS2`, `FS2`, or a project code like `IQ`, `HC`):

| Node | Name |
|---|---|
| Title, subtitle, caption, divider | `PFX:title`, `PFX:subtitle`, `PFX:caption`, `PFX:divider` |
| Phase bar, lane labels | `PFX:phase:NAME`, `PFX:group:Label`, `PFX:role:Label` |
| Steps | `PFX:n1`, `PFX:n2` (or lane letter + number: `PFX:a3` for the automation lane) |
| Diamonds, notes | `PFX:d1`, `PFX:note_short_name` |
| Row nodes | `PFX:o_pdf` (output), `PFX:s_list` (system), `PFX:x_lan` (external) |
| Connectors | `PFX:edge:n1>n2`, `PFX:exc:n5>n4`, `PFX:link:n2>o_pdf` |
| Markers | `PFX:q:3`, `PFX:pain:P2`, `PFX:ans:3`, `PFX:dec:4`, `PFX:fix:P2` (a second marker for the same P gets a `b`) |
| Lists | `PFX:qhead` + `PFX:qlist`, `PFX:phead` + `PFX:plist`, `PFX:dhead` + `PFX:dlist`, `PFX:shead` + `PFX:slist`, `PFX:scopehead` + `PFX:scopelist`, `PFX:chead` + `PFX:clist` |

Older boards use variants like `PFX:q1` or `PFX:mark:P7`. The renumber script finds markers by shape and text, so it works on those too.
