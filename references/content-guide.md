# Content guide

What goes on a current state and a future state, how to phrase each piece, and the list formats. The examples use a made-up equipment loan process: staff borrow laptops and field kits, a supervisor approves, and an admin lends and checks items back in.

## Contents

- Current state
- Future state
- Phrasing: steps, diamonds, notes, row nodes
- Phrasing: questions, pain points, decisions
- Lists
- Revisions
- Writing rules

## Current state

The goal is an honest picture of today, workarounds included, that the client recognises at a glance and can correct in the session.

- **Lanes.** One for each role that acts, grouped by organisation or team. Put people first, then any team that only appears at the edges (admin, records, finance). Don't add an automation lane if nothing is automated today. Its absence makes the point.
- **Steps.** What people actually do, not what the policy says. Include the tool ("by email", "in the shared spreadsheet") and the workaround ("by copying last month's request and changing the dates").
- **Variation.** When teams do it differently and the difference isn't worth a branch, put it in a context note ("Big items (vehicles, drones) also need the director's sign-off").
- **Steps you didn't hear described.** These come from a form schema, a policy or the client's own diagram. Draw them with the assumed-step style and say so in the subtitle or caption. Steps copied from a client diagram can carry "(from client map)".
- **Markers.** Red numbered open questions sit top-right on the step they concern. Orange P# pain points sit top-left.
- **Lists.**
  - OPEN QUESTIONS, to confirm before deeper discovery (ordered list)
  - PAIN POINTS (P1. prefixed)
  - optionally HEARD IN DISCOVERY (facts that don't fit on the diagram: volumes, who owns the process, who signs off a pilot) and FOLLOW-UPS (who promised to send what)
- **Caption.** One or two sentences: what's manual, what's out of scope and why, and the key volume ("about 40 loans a month, mostly laptops and field kits").

## Future state

The goal is a concrete proposal that the client can argue with. Every open choice is visible as a numbered decision.

- **Lanes.** The same people lanes as the current state where the roles survive, plus a platform lane (for example "Workflow automation (n8n)") between the people who submit and the people who act on it. Systems the proposal relies on (form tool, list or database, document folder, email) go in the Systems row. Unchanged third parties go in External.
- **Steps.** Each step says what the person or the workflow does, and where ("Create the request in the SharePoint List (status: Submitted) and email the supervisor an approval link").
- **Fix markers.** Every current pain point gets a green P# marker where the future state fixes it. A pain point fixed in two places gets two markers with the same number. A pain point the proposal doesn't fix stays in the list as "not addressed; depends on decision N" and gets no marker.
- **Decision markers.** Red numbered decision markers sit where a design choice is still open. A decision is open when the answer changes what gets built: who approves, where data lives, which path a request takes, what counts as proof.
- **Lists.**
  - OPEN DESIGN DECISIONS, for the future-state working session (ordered list). Mark decisions added in a revision with "New:".
  - CURRENT PAIN POINTS, and how this future state addresses them ("P3. Paper log: check-out is a recorded action by a signed-in staff account, kept on the List record.")
  - WHAT STAYS THE SAME (bullets): the parts of today's process the proposal keeps on purpose.
  - IN SCOPE FOR AN INITIAL IMPLEMENTATION, and where this future state covers it (bullets, when a scope list exists). Each scope item states where it's covered, citing decisions where coverage depends on one.
  - WHAT CHANGED FROM DRAFT V1 (bullets, from v2 on).
- **Caption.** The proposed platform in one or two sentences ("a web form as the front end, an n8n workflow for routing, reminders and List updates, and a SharePoint List as the record and status tracker").

## Phrasing: steps, diamonds, notes, row nodes

- **Steps.** Start with a verb, from the lane's point of view, one action per step, under 175 characters. "Supervisor checks the request against the team budget" reads better than "Review".
- **Diamonds.** A short question ending in "?": "Approve?", "Which route?", "Item damaged?". Label each branch on its connector.
- **Notes.** A fact or a variation, not an action: "Small items (cables, chargers) are handed out without a request".
- **Row nodes.** Name the artifact or system and what it holds or shows: "Paper sign-out log: the only record of who has what", "SharePoint List (requests, status, overdue view)".

## Phrasing: questions, pain points, decisions

- **Open question.** The question, then why it matters or what's known so far. Say who will find out. "Spreadsheet owner: the admin believes only they can edit the equipment spreadsheet; confirm who else needs access and who keeps it current."
- **Pain point.** Short name, colon, the effect on people. "P1. Lost emails: requests sit in the supervisor's personal inbox; staff chase by phone and nobody else can see what is pending."
- **Design decision.** Topic, colon, what's settled (with attribution), then "Still open:" and the question. "Approval rule: every loan goes to the supervisor (Sam, 28 Sep, as drawn). Still open: should items under a value limit skip approval, and who sets the limit?"
- **Cross-references.** Write "decision 7", "decisions 5 and 16", "P3" or "Q4" exactly like that, so the renumber script can find and update them.

## Lists

- Number open questions and design decisions with Figma's ordered-list formatting, so the number isn't part of the text. Type pain point numbers into the text ("P1. ").
- Keep each list item to one paragraph. The renumber script reorders whole lines, so an item split over two lines breaks it.
- List order matches board order (left to right by column, top to bottom within a column). Unmarked items go after the marked ones.

## Revisions

- **v2 sections.** Clone the reviewed section and place it below, with a new prefix and title. Keep v1 for diffing.
- **Answered questions** (current state v2). Turn the marker green and annotate the list item: "Answered 28 Sep: ...", "Partly answered 28 Sep: ...", "Still open after 28 Sep".
- **Future state v2.** Fold answers into the decisions, add the new ones, renumber, and record the changes under WHAT CHANGED FROM DRAFT V1 ("Decisions 5, 8 and 10 updated with the 28 Sep answers; decisions 2, 4 and 13 added").
- **Pain point numbers** are shared between a current state and its future state. If either board's P numbers change, flag it and offer to bring the other in line.

## Writing rules

- No em dashes anywhere, on the board or in messages about it. Use commas, colons or brackets.
- Headings, phase bars and titles never end with a full stop.
- Plain language, in the client's spelling (Canadian, British or US).
- Dates as "28 Sep 2026", or "28 Sep" inside a list.
- Attribute settled answers to the person and date: "(Sam, 28 Sep)".
- Use people's names as the client uses them. If a transcript garbles a name, ask; don't guess.
