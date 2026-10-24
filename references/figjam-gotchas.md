# FigJam gotchas

Traps found while building blueprints with `use_figma`. Each one cost real time at least once.

## Running scripts

- `use_figma` returns data only through a top-level `return`. `console.log` output is lost.
- A script that throws is rolled back. The nodes it created are removed, so you can fix the error and rerun the same call.
- `get_metadata` doesn't work on FigJam. Read boards with `get_figjam`, `get_screenshot`, or a read-only `use_figma` script that returns names, positions and text.
- `get_screenshot` returns a URL. Download it with curl and view crops of a large section; one 7680px-wide image at 1024px hides small text.
- The Plugin API can't read FigJam comments. If the user mentions comments, ask them to paste the text.

## Coordinates

- Children of a section use coordinates relative to that section. A section inside another section is also relative to its parent.
- A connector endpoint with no node (`{ position: { x, y } }`, as on the legend arrow) takes **absolute page coordinates**, even when the connector lives in a section. Use the section's `absoluteTransform[0][2]` and `[1][2]` plus the relative position.
- A connector endpoint `position` on a node is a **pixel offset** from that node's top-left, not a 0 to 1 fraction. Prefer magnets (`TOP`, `BOTTOM`, `LEFT`, `RIGHT`, `CENTER`).
- To resize a section, use `section.resizeWithoutConstraints(w, h)`.

## Connectors

- Set `connectorLineType = 'STRAIGHT'` **before** assigning `CENTER` magnets. Elbowed connectors reject CENTER and throw "Elbowed connector endpoints may not use the CENTER magnet".
- Set the label's `text.fontName` before `text.characters`. A new connector's text has no valid font until then.
- Don't run a straight dashed link through another node in the same column. Route it elbowed (RIGHT to TOP), or chain it through the row node (step to system, system to output).
- Loop-backs and long exception paths read best routed through the empty corridor above the top lane, or through an empty lane.

## Cloning (v2 sections)

- `section.clone()` copies everything and remaps connectors to the cloned nodes. Rename the clones to the new prefix straight away.
- A cloned elbow connector that you then re-point to a different node routes badly. Delete it and create a fresh one.
- A cloned connector with free `position` endpoints (the legend arrow) lands in the wrong place. Reset both endpoints to absolute coordinates.

## Text

- About 175 characters is the limit for Inter Medium 14 in a 280 × 170 step. Longer text truncates without warning.
- Every text edit follows the same recipe: load the node's current fonts, await, then mutate. Shape text defaults to Inter Medium, but load it anyway.
- To change part of a text without losing its formatting, use `insertCharacters(end, newText, 'BEFORE')` followed by `deleteCharacters(start, end)`. With several edits in one node, work from the end of the text backwards so earlier positions stay valid.
- Setting `characters` on a whole list resets its formatting. Read the style first (`getStyledTextSegments` with fontName, fontSize, fills, lineHeight, letterSpacing, listOptions, indentation, listSpacing), set the text, then reapply each with its `setRange*` call. `scripts/renumber-markers.js` does this.
- Numbered lists: `setRangeListOptions(0, length, { type: 'ORDERED' })`. Bullets: `'UNORDERED'`.

## Access

- The MCP's Figma account must have edit access to the board. Copies shared from other teams are sometimes view-only for that account. Ask for edit access or a duplicate in a file the user owns.
- If the user has edited the board by hand since your last build, node names may no longer match their labels (for example a node named `CS:p1` showing "P3"). Go by the label text.
