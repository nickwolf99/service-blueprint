# BLUEPRINT BRIEF: <Process name> <CURRENT STATE | FUTURE STATE draft vN>

## Where

- Board: <FigJam URL>
- Section: <new section below "<lowest section name>" at x=<x>, y=<y> | inside "<working section>" at rel (x, y)>
- Prefix: <CS | FS | CS2 | FS2 | project code>
- Size: width <sectionWidth(lastCol)>, height fitted at the end
- Sources: <transcripts, docs, earlier sections, with dates>

## Header

- Title: `<CURRENT STATE, Process name, Branch or team>`
- Subtitle: `<Based on ... (date). Red circles are open questions and orange circles are pain points, both listed at the bottom of this diagram>`

## Phases

| # | Phase | Columns | Colour index |
|---|---|---|---|
| 0 | <PHASE NAME> | 0-2 | 0 |

## Lanes

| Lane | Role label | Group label |
|---|---|---|
| 0 | <Field staff / Technician> | <Field teams> |

Rows below the divider: Outputs, Systems, External systems.

## Nodes

| Name | Lane | Col | Kind | Text | Markers |
|---|---|---|---|---|---|
| n1 | 0 | 0 | step | <Verb-first text under 175 characters> | |
| d1 | 1 | 8 | diamond | <Approve?> | q:3 |
| note1 | free x, y | | note | <variation or fact> | |
| o_pdf | Outputs | 10 | output | <Approved PDF: the safety record> | |
| s_sheet | Systems | 10 | system | <Equipment spreadsheet (SharePoint)> | pain:P5 |
| x_vendor | External | 11 | external | <Repair vendor (third party)> | |

## Connectors

- Flow: n1>n2, n2>n3, d1>n10 "yes", d1>n9 "no" (from TOP to BOTTOM) ...
- Exception (dashed arrow): n13>n4 "major change" (through the corridor above lane 0) ...
- Links (dashed, no arrows): n11-o_pdf, n11-s_sheet ...

## Markers (numbered in board order: left to right by column, top to bottom within a column)

| Marker | Host | Corner |
|---|---|---|
| 1 | n2 | top-right |
| P1 | n4 | top-left |

## Lists

Numbered list heading: `<OPEN QUESTIONS, to confirm before deeper discovery>`

1. <Topic: question, why it matters, who will find out>

P list heading: `<PAIN POINTS>`

P1. <Short name: effect on people>

Other blocks: <HEARD IN DISCOVERY | WHAT STAYS THE SAME | IN SCOPE ... | WHAT CHANGED FROM DRAFT V1>

## Legend and caption

- Legend: <phase colours, decision, note, output, system, external, markers used, exception path, assumed step if used>
- Caption: `<one or two sentences>`

## Open checks before building

- [ ] Columns read left to right in time; no two nodes share a cell
- [ ] Every branch ends somewhere
- [ ] No connector path runs through another node or note
- [ ] All step text under 175 characters; no em dashes; no full stops on headings
- [ ] Markers and lists in board order
- [ ] Uncertain names listed for the user
