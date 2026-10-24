// Service blueprint helpers for use_figma in FigJam.
//
// use_figma keeps no state between calls, so paste this whole block at the top
// of EVERY build script, set the three constants, then write the build code
// underneath and finish with:  return { sectionId: sec.id, created, warnings };
//
// Coordinates are relative to the blueprint section (children of a section use
// section-relative x/y). See references/visual-spec.md for the full spec.

const PREFIX = 'CS';      // node-name prefix for this diagram: CS, FS, CS2, FS2, or a project code like IQ
const SECTION_ID = '';    // the blueprint section's node ID ('' only in the call that creates it)
const LANE_COUNT = 5;     // lanes above the divider (people, platform and team lanes)

// ---- geometry -------------------------------------------------------------
const G = {
  col0: 480, colW: 340,               // column c starts at x = col0 + c * colW
  nodeW: 280, nodeH: 170,             // step nodes
  laneY0: 320, lanePitch: 240, laneH: 232,
  phaseY: 230, phaseH: 70,
  rowPitch: 200, rowH: 182, rowNodeH: 140,
};
const colX = c => G.col0 + c * G.colW;
const laneY = i => G.laneY0 + i * G.lanePitch;
const nodeY = i => laneY(i) + 35;
const lanesBottom = () => laneY(LANE_COUNT) - 8;
const dividerY = () => lanesBottom() + 38;
const ROWS = { o: 0, s: 1, x: 2 };                       // Outputs, Systems, External systems
const rowY = r => dividerY() + 50 + r * G.rowPitch;
const sectionWidth = lastCol => colX(lastCol) + G.nodeW + 120;

// ---- colours ----------------------------------------------------------------
const COLORS = {
  ink: '#1E1E1E', body: '#333333', sub: '#555555', white: '#FFFFFF',
  laneGroup: '#E6E6E6', laneRole: '#EDEDED', divider: '#CFCFCF',
  // phase bar and matching step-node tint, by phase index
  phase: ['#E4CCF9', '#BFE0FA', '#B8EDDF', '#FFF1C2', '#C5EEF5', '#FFC9C2', '#FFCFE1'],
  tint:  ['#F1E5FC', '#DCEEFC', '#D8F5EC', '#FFF1C2', '#DFF6FA', '#FFE0DC', '#FFE2EE'],
  diamond: '#FFE0A3', diamondStroke: '#E8A33D',
  note: '#F5F5F5', noteStroke: '#B5B5B5', assumedStroke: '#E0529C',
  output: '#CDEFC8', system: '#E0E0E0', external: '#D9D4F7',
  flow: '#7A7A7A', link: '#ABABAB',
  red: '#F24822', orange: '#FF9F2E', green: '#14AE5C',
};
const hex = s => {
  s = s.replace('#', '');
  return { r: parseInt(s.slice(0, 2), 16) / 255, g: parseInt(s.slice(2, 4), 16) / 255, b: parseInt(s.slice(4, 6), 16) / 255 };
};
const solid = s => [{ type: 'SOLID', color: hex(s) }];

// ---- setup ------------------------------------------------------------------
const MEDIUM = { family: 'Inter', style: 'Medium' };
const BOLD = { family: 'Inter', style: 'Bold' };
await figma.loadFontAsync(MEDIUM);
await figma.loadFontAsync(BOLD);

let sec = SECTION_ID ? await figma.getNodeByIdAsync(SECTION_ID) : null;
const created = [];
const warnings = [];
const id = s => PREFIX + ':' + s;
const short = n => n.name.startsWith(PREFIX + ':') ? n.name.slice(PREFIX.length + 1) : n.name;
const byName = name => {
  const full = name.includes(':') && name.startsWith(PREFIX + ':') ? name : id(name);
  const n = sec.findOne(c => c.name === full);
  if (!n) throw new Error('No node named ' + full + ' in the section');
  return n;
};
const resolve = x => (typeof x === 'string' ? byName(x) : x);

// Lowest free y on the page (or inside a parent section), for placing a new section.
function freeYBelow(parent = figma.currentPage, gap = 250) {
  let bottom = 0;
  for (const n of parent.children) bottom = Math.max(bottom, n.y + n.height);
  return bottom + gap;
}

function createSection(title, x, y, width, height, parent) {
  const s = figma.createSection();
  if (parent) parent.appendChild(s);
  s.name = title;
  s.x = x; s.y = y;
  s.resizeWithoutConstraints(width, height);
  s.fills = solid(COLORS.white);
  created.push(s.id);
  sec = s;
  return s;
}

// Grow or shrink the section to fit its content.
function fitSection(pad = 140) {
  let maxY = 0;
  for (const n of sec.children) maxY = Math.max(maxY, n.y + n.height);
  sec.resizeWithoutConstraints(sec.width, maxY + pad);
}

// ---- shapes -----------------------------------------------------------------
function box(name, x, y, w, h, fill, text, o = {}) {
  const s = figma.createShapeWithText();
  s.shapeType = o.shape || 'ROUNDED_RECTANGLE';
  sec.appendChild(s);
  s.resize(w, h);
  s.x = x; s.y = y;
  s.fills = fill ? solid(fill) : [];
  s.strokes = o.stroke ? solid(o.stroke) : [];
  s.strokeWeight = o.strokeWeight || 2;
  s.dashPattern = o.dash || [];
  s.text.fontName = o.bold ? BOLD : MEDIUM;
  s.text.fontSize = o.size || 14;
  s.text.fills = solid(o.color || COLORS.ink);
  s.text.characters = text || '';
  s.name = id(name);
  created.push(s.id);
  return s;
}

// A step in a lane. phase = phase index (0-6) for the tint. Keep text under ~175 characters.
function step(name, lane, col, text, phase, o = {}) {
  if (text.length > 175) warnings.push(`${name}: ${text.length} characters, will truncate (keep under 175)`);
  return box(name, colX(col), nodeY(lane), G.nodeW, G.nodeH, COLORS.tint[phase], text, o);
}
// A step nobody described directly (inferred from a form, a document or a client diagram).
const assumedStep = (name, lane, col, text, phase) =>
  step(name, lane, col, text, phase, { stroke: COLORS.assumedStroke, dash: [8, 6] });

function diamond(name, lane, col, text) {
  return box(name, colX(col) - 10, laneY(lane) + 20, 300, 200, COLORS.diamond, text,
    { shape: 'DIAMOND', stroke: COLORS.diamondStroke });
}

// Context note: a variation or fact that isn't a step. x/y are free (often in a corridor above a lane).
function note(name, x, y, text) {
  return box(name, x, y, G.nodeW, G.nodeH, COLORS.note, text, { stroke: COLORS.noteStroke, dash: [6, 5], size: 13 });
}

// Row node below the divider. row: 'o' output, 's' system, 'x' external system. Name like 'o_pdf', 's_list'.
function rowNode(name, row, col, text) {
  const fill = { o: COLORS.output, s: COLORS.system, x: COLORS.external }[row];
  return box(name, colX(col), rowY(ROWS[row]) + 25, G.nodeW, G.rowNodeH, fill, text, { size: 13 });
}

// Phase header bar spanning `span` columns from column c0.
function phase(i, label, c0, span) {
  return box('phase:' + label, colX(c0), G.phaseY, span * G.colW - 60, G.phaseH, COLORS.phase[i], label.toUpperCase(),
    { bold: true, size: 20 });
}

// roles: one label per lane, top to bottom. groups: [{ label, first, count }] spanning lanes.
function laneLabels(roles, groups) {
  roles.forEach((r, i) => box('role:' + r, 245, laneY(i), 225, G.laneH, COLORS.laneRole, r, { shape: 'SQUARE', bold: true }));
  groups.forEach(g => box('group:' + g.label, 60, laneY(g.first), 175, g.count * G.lanePitch - 8, COLORS.laneGroup, g.label,
    { shape: 'SQUARE', bold: true }));
}

// Divider plus the Outputs / Systems / External systems row labels.
function dividerAndRows(groupLabel = 'Data systems and status') {
  box('divider', 60, dividerY(), sec.width - 120, 16, COLORS.divider, '', { shape: 'SQUARE' });
  ['Outputs', 'Systems', 'External systems'].forEach((r, i) =>
    box('role:' + r, 245, rowY(i), 225, G.rowH, COLORS.laneRole, r, { shape: 'SQUARE', bold: true }));
  box('group:' + groupLabel, 60, rowY(0), 175, 3 * G.rowPitch - 18, COLORS.laneGroup, groupLabel, { shape: 'SQUARE', bold: true });
}

// ---- text -------------------------------------------------------------------
// o.list: 'ORDERED' for numbered lists, 'UNORDERED' for bullets; o.width wraps the text.
function label(name, x, y, chars, o = {}) {
  const t = figma.createText();
  sec.appendChild(t);
  t.fontName = o.bold ? BOLD : MEDIUM;
  t.fontSize = o.size || 24;
  t.fills = solid(o.color || COLORS.body);
  t.characters = chars;
  t.x = x; t.y = y;
  if (o.width) { t.resize(o.width, t.height); t.textAutoResize = 'HEIGHT'; }
  if (o.list) t.setRangeListOptions(0, chars.length, { type: o.list });
  t.name = id(name);
  created.push(t.id);
  return t;
}
const title = text => label('title', 60, 46, text, { bold: true, size: 36, color: COLORS.ink });
const subtitle = text => label('subtitle', 60, 112, text, { size: 18, color: COLORS.sub });

// A list block: heading plus body. Returns the y just below the body, for stacking blocks.
function listBlock(key, x, y, width, heading, lines, list) {
  label(key + 'head', x, y, heading, { bold: true, size: 26 });
  const body = label(key + 'list', x, y + 54, lines.join('\n'), { size: 24, width, list });
  return body.y + body.height + 70;
}

// ---- connectors -------------------------------------------------------------
function connect(name, a, b, o = {}) {
  a = resolve(a); b = resolve(b);
  const c = figma.createConnector();
  sec.appendChild(c);
  // Set the line type BEFORE the magnets: elbowed connectors reject the CENTER magnet.
  c.connectorLineType = o.straight ? 'STRAIGHT' : 'ELBOWED';
  c.connectorStart = { endpointNodeId: a.id, magnet: o.from || 'RIGHT' };
  c.connectorEnd = { endpointNodeId: b.id, magnet: o.to || 'LEFT' };
  c.strokes = solid(o.color || COLORS.flow);
  c.strokeWeight = 2;
  c.dashPattern = o.dash || [];
  c.connectorStartStrokeCap = 'NONE';
  c.connectorEndStrokeCap = o.arrow === false ? 'NONE' : 'ARROW_LINES';
  if (o.label) { c.text.fontName = MEDIUM; c.text.fontSize = 16; c.text.characters = o.label; }
  c.name = id(name);
  created.push(c.id);
  return c;
}
// Main flow: solid grey arrow. o.from / o.to: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT'; o.label e.g. 'yes'.
const flow = (a, b, o = {}) => connect('edge:' + short(resolve(a)) + '>' + short(resolve(b)), a, b, o);
// Exception or loop-back path: dashed arrow, usually labelled.
const exception = (a, b, o = {}) => connect('exc:' + short(resolve(a)) + '>' + short(resolve(b)), a, b, { ...o, dash: [8, 6] });
// Step to its output / system / external node: light dashed line, no arrowheads.
const link = (a, b) => connect('link:' + short(resolve(a)) + '>' + short(resolve(b)), a, b,
  { straight: true, from: 'CENTER', to: 'CENTER', color: COLORS.link, dash: [4, 5], arrow: false });

// ---- markers ----------------------------------------------------------------
// kind: 'q'    open question (red, number, top-right)        current state
//       'pain' pain point (orange, P#, top-left)              current state
//       'ans'  question answered in review (green, top-right) current state v2
//       'dec'  open design decision (red, number, top-right)  future state
//       'fix'  pain point addressed here (green, P#, top-left) future state
// o.corner: 'bottom' puts it on the bottom edge when the top corner is taken.
function marker(kind, text, host, o = {}) {
  host = resolve(host);
  const right = kind === 'q' || kind === 'dec' || kind === 'ans';
  const fill = { q: COLORS.red, dec: COLORS.red, ans: COLORS.green, pain: COLORS.orange, fix: COLORS.green }[kind];
  let dx = right ? host.width - 22 : -22;
  let dy = o.corner === 'bottom' ? host.height - 22 : -22;
  if (host.shapeType === 'DIAMOND') { dx = right ? host.width - 72 : 28; dy = o.corner === 'bottom' ? host.height - 54 : 10; }
  return box(kind + ':' + text, host.x + dx, host.y + dy, 44, 44, fill, String(text),
    { shape: 'ELLIPSE', stroke: COLORS.white, strokeWeight: 3, bold: true, size: 12, color: COLORS.white });
}

// ---- legend -----------------------------------------------------------------
// items: [{ chip: '#hex', label }, { diamond: true, label }, { note: true, label }, { assumed: true, label },
//         { marker: '#hex', text: '1', label }, { exception: true, label }]
// Wraps onto more rows when the section is too narrow. Returns the y just below the legend,
// so the caption goes at legend(...) + 10.
function legend(y0, items) {
  const ax = sec.absoluteTransform[0][2], ay = sec.absoluteTransform[1][2];
  const perRow = Math.max(1, Math.floor((sec.width - 90) / 240));
  items.forEach((it, i) => {
    const x = 90 + (i % perRow) * 240;
    const y = y0 + Math.floor(i / perRow) * 110;
    const key = 'leg:' + it.label;
    if (it.diamond) box(key, x + 40, y - 7, 60, 54, COLORS.diamond, '', { shape: 'DIAMOND', stroke: COLORS.diamondStroke });
    else if (it.note) box(key, x, y, 140, 40, COLORS.note, '', { stroke: COLORS.noteStroke, dash: [6, 5] });
    else if (it.assumed) box(key, x, y, 140, 40, COLORS.white, '', { stroke: COLORS.assumedStroke, dash: [8, 6] });
    else if (it.marker) box(key, x + 50, y, 40, 40, it.marker, it.text || '', { shape: 'ELLIPSE', bold: true, size: 12, color: COLORS.white });
    else if (it.exception) {
      const c = figma.createConnector();
      sec.appendChild(c);
      c.connectorLineType = 'STRAIGHT';
      // Free endpoints take ABSOLUTE page coordinates, even inside a section.
      c.connectorStart = { position: { x: ax + x + 10, y: ay + y + 20 } };
      c.connectorEnd = { position: { x: ax + x + 130, y: ay + y + 20 } };
      c.strokes = solid(COLORS.flow); c.strokeWeight = 2; c.dashPattern = [8, 6];
      c.connectorStartStrokeCap = 'NONE'; c.connectorEndStrokeCap = 'ARROW_LINES';
      c.name = id(key); created.push(c.id);
    } else box(key, x, y, 140, 40, it.chip, '');
    const t = label('legt:' + it.label, x, y + 55, it.label, { size: 13 });
    t.x = x + 70 - t.width / 2;
  });
  return y0 + Math.ceil(items.length / perRow) * 110;
}
// ---- end of helpers ---------------------------------------------------------
