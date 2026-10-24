// Renumber a blueprint's markers and lists in board order (use_figma, FigJam).
//
// Board order: left to right by column; markers that share a column go top to
// bottom. Numbered markers ("1", "2", ...: open questions or open design
// decisions) and P markers ("P1", "P2", ...: pain points) are two separate
// sequences. A number that appears on two markers takes its new number from the
// first one reached. List items with no marker on the board keep their old
// order and go after the marked ones.
//
// Run it twice: first with DRY_RUN = true and read the plan it returns (old to
// new numbers, the reordered lists, every reference it will rewrite), then with
// DRY_RUN = false. Paste the whole file into use_figma and set CONFIG first.

const CONFIG = {
  SECTION_ID: '',            // the blueprint section, e.g. '12:345'
  NUM_LIST: null,            // name of the text node listing the numbered items, e.g. 'FS2:dlist' (or null)
  P_LIST: null,              // name of the text node listing the P items, e.g. 'FS2:plist' (or null)
  NUM_WORDS: ['decision'],   // words that cite numbered items in other text: ['decision'] or ['question']
  NUM_SHORT: null,           // short citation form for numbered items, e.g. 'Q' for "Q4" (null if not used)
  RENUMBER_NUMBERS: true,
  RENUMBER_P: true,          // false keeps P numbers, e.g. to stay in step with the current-state board
  COLUMN_TOLERANCE: 60,      // markers whose x differs by less than this count as the same column
  DRY_RUN: true,
};

// --- pure helpers start (no Figma API below this line until "pure helpers end")
function boardOrder(a, b, tol) {
  return Math.abs(a.x - b.x) > tol ? a.x - b.x : a.y - b.y;
}

// markers: [{ x, y, label }] where label is '7' or 'P7'. Returns { map: { old: new }, count }.
function buildMap(markers, listCount, tol) {
  const sorted = [...markers].sort((a, b) => boardOrder(a, b, tol));
  const map = {};
  let k = 0;
  for (const m of sorted) {
    const old = +m.label.replace(/^P/, '');
    if (!(old in map)) map[old] = ++k;
  }
  const total = Math.max(listCount || 0, ...Object.keys(map).map(Number), 0);
  for (let o = 1; o <= total; o++) if (!(o in map)) map[o] = ++k;
  return { map, count: total };
}
const invert = map => { const inv = {}; for (const o in map) inv[map[o]] = +o; return inv; };
const joinNums = a => {
  a = [...new Set(a)].sort((x, y) => x - y);
  return a.length === 1 ? '' + a[0] : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
};
const expand = s => s.split(/\s*,\s*|\s+and\s+/).flatMap(tok => {
  const r = tok.match(/^(\d+)\s+to\s+(\d+)$/);
  if (!r) return [+tok];
  const out = [];
  for (let i = +r[1]; i <= +r[2]; i++) out.push(i);
  return out;
});

// Edits that rewrite citations in `text`: "decision 7", "decisions 5 and 16", "Decisions 1, 2 and 3",
// "decisions 15 to 19", "Q4", "P3". A range that covers the whole set ("P1 to P11") is left alone.
// Returns [{ start, end, text }] against the original string, non-overlapping.
function refEdits(text, numMap, numCount, pMap, pCount, cfg) {
  const edits = [];
  if (numMap && cfg.NUM_WORDS && cfg.NUM_WORDS.length) {
    const re = new RegExp('\\b(' + cfg.NUM_WORDS.join('|') + ')(s?)\\s+(\\d+(?:(?:\\s*,\\s*|\\s+and\\s+|\\s+to\\s+)\\d+)*)', 'gi');
    let m;
    while ((m = re.exec(text))) {
      const olds = expand(m[3]);
      const whole = olds.length === numCount && olds[0] === 1 && /\sto\s/.test(m[3]);
      if (whole) continue;
      const news = olds.map(o => numMap[o]);
      if (news.some(n => n == null)) continue;
      const rendered = m[1] + m[2] + ' ' + joinNums(news);
      if (rendered !== m[0]) edits.push({ start: m.index, end: m.index + m[0].length, text: rendered });
    }
  }
  const single = (re, map, count, prefix) => {
    let m;
    while ((m = re.exec(text))) {
      if (m[2] != null) {                                     // a range like "P1 to P11"
        if (+m[1] === 1 && +m[2] === count) continue;
        const a = map[+m[1]], b = map[+m[2]];
        if (a == null || b == null) continue;
        const rendered = prefix + a + ' to ' + prefix + b;
        if (rendered !== m[0]) edits.push({ start: m.index, end: m.index + m[0].length, text: rendered, flag: 'range: check it still makes sense' });
        continue;
      }
      const n = map[+m[1]];
      if (n != null && n !== +m[1]) edits.push({ start: m.index, end: m.index + m[0].length, text: prefix + n });
    }
  };
  if (pMap) single(/\bP(\d+)(?:\s+to\s+P(\d+))?\b/g, pMap, pCount, 'P');
  if (numMap && cfg.NUM_SHORT) single(new RegExp('\\b' + cfg.NUM_SHORT + '(\\d+)(?:\\s+to\\s+' + cfg.NUM_SHORT + '(\\d+))?\\b', 'g'), numMap, numCount, cfg.NUM_SHORT);
  edits.sort((a, b) => a.start - b.start);
  for (let i = 1; i < edits.length; i++) if (edits[i].start < edits[i - 1].end) throw new Error('Overlapping citation edits in: ' + text.slice(0, 80));
  return edits;
}
const applyEdits = (text, edits) =>
  [...edits].sort((a, b) => b.start - a.start).reduce((t, e) => t.slice(0, e.start) + e.text + t.slice(e.end), text);

// New list text. ordered: the list uses Figma's numbered-list formatting (no number typed in the text).
function reorderLines(lines, map, inv, count, kind, ordered, edit) {
  if (lines.length !== count) throw new Error(`${kind} list has ${lines.length} lines but ${count} items are numbered`);
  const out = [];
  for (let i = 1; i <= count; i++) {
    const old = inv[i];
    let line = lines[old - 1];
    if (kind === 'P') {
      const pre = 'P' + old + '. ';
      if (!line.startsWith(pre)) throw new Error('P list line ' + old + ' does not start with "' + pre + '"');
      line = 'P' + i + '. ' + edit(line.slice(pre.length));
    } else if (ordered) {
      line = edit(line);
    } else {
      const m = line.match(/^(\d+)\.\s+/);
      if (!m || +m[1] !== old) throw new Error('Numbered list line ' + old + ' does not start with "' + old + '. "');
      line = i + '. ' + edit(line.slice(m[0].length));
    }
    out.push(line);
  }
  return out;
}
// --- pure helpers end

const sec = await figma.getNodeByIdAsync(CONFIG.SECTION_ID);
if (!sec) throw new Error('Section ' + CONFIG.SECTION_ID + ' not found');
const tol = CONFIG.COLUMN_TOLERANCE;

const isMarker = n => n.type === 'SHAPE_WITH_TEXT' && n.shapeType === 'ELLIPSE' && n.width <= 50 && !/:legt?:/.test(n.name);
const all = sec.findAll(isMarker);
const numMarkers = all.filter(n => /^\d+$/.test(n.text.characters));
const pMarkers = all.filter(n => /^P\d+$/.test(n.text.characters));
const skipped = all.filter(n => !numMarkers.includes(n) && !pMarkers.includes(n)).map(n => n.name + ' "' + n.text.characters + '"');

const findText = name => {
  if (!name) return null;
  const n = sec.findOne(c => c.type === 'TEXT' && c.name === name);
  if (!n) throw new Error('No text node named ' + name);
  return n;
};
const numList = findText(CONFIG.NUM_LIST);
const pList = findText(CONFIG.P_LIST);
const numLines = numList ? numList.characters.split('\n') : [];
const pLines = pList ? pList.characters.split('\n') : [];
const absPos = n => ({ x: n.absoluteTransform[0][2], y: n.absoluteTransform[1][2] });
const asPoints = ms => ms.map(n => ({ ...absPos(n), label: n.text.characters }));

const numInfo = CONFIG.RENUMBER_NUMBERS ? buildMap(asPoints(numMarkers), numLines.length, tol) : null;
const pInfo = CONFIG.RENUMBER_P ? buildMap(asPoints(pMarkers), pLines.length, tol) : null;
const numMap = numInfo && numInfo.map, pMap = pInfo && pInfo.map;
const edit = s => applyEdits(s, refEdits(s, numMap, numInfo && numInfo.count, pMap, pInfo && pInfo.count, CONFIG));

const numOrdered = numList ? numList.getStyledTextSegments(['listOptions'])[0].listOptions.type === 'ORDERED' : false;
const newNum = numList && numMap ? reorderLines(numLines, numMap, invert(numMap), numInfo.count, 'number', numOrdered, edit) : null;
const newP = pList && pMap ? reorderLines(pLines, pMap, invert(pMap), pInfo.count, 'P', false, edit) : null;

// Citations in every other text on the section (titles, captions, other lists, step text).
const listIds = [numList, pList].filter(Boolean).map(n => n.id);
const refs = [];
for (const n of sec.findAll(c => c.type === 'TEXT' || (c.type === 'SHAPE_WITH_TEXT' && !isMarker(c)))) {
  if (listIds.includes(n.id) || /:legt?:/.test(n.name)) continue;
  const t = n.type === 'TEXT' ? n.characters : n.text.characters;
  const e = refEdits(t, numMap, numInfo && numInfo.count, pMap, pInfo && pInfo.count, CONFIG);
  if (e.length) refs.push({ node: n, edits: e, preview: e.map(x => `"${t.slice(x.start, x.end)}" -> "${x.text}"${x.flag ? ' (' + x.flag + ')' : ''}`) });
}

const plan = {
  numbers: numMap, pains: pMap, skippedMarkers: skipped,
  numberList: newNum && newNum.map((l, i) => (numOrdered ? i + 1 + '. ' : '') + l.slice(0, 70)),
  painList: newP && newP.map(l => l.slice(0, 70)),
  citations: refs.map(r => ({ node: r.node.name, changes: r.preview })),
};
if (CONFIG.DRY_RUN) return { dryRun: true, ...plan };

// ---- apply --------------------------------------------------------------------
const loadFonts = async n => { for (const s of n.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(s.fontName); };
async function rewriteUniform(node, text) {
  const segs = node.getStyledTextSegments(['fontName', 'fontSize', 'fills', 'lineHeight', 'letterSpacing', 'listOptions', 'indentation', 'listSpacing']);
  if (segs.length !== 1) throw new Error(node.name + ' mixes text styles; reorder it by hand or make it one style first');
  const s = segs[0];
  await figma.loadFontAsync(s.fontName);
  node.characters = text;
  const L = text.length;
  node.setRangeFontName(0, L, s.fontName);
  node.setRangeFontSize(0, L, s.fontSize);
  node.setRangeFills(0, L, s.fills);
  node.setRangeLineHeight(0, L, s.lineHeight);
  node.setRangeLetterSpacing(0, L, s.letterSpacing);
  node.setRangeListOptions(0, L, s.listOptions);
  node.setRangeIndentation(0, L, s.indentation);
  node.setRangeListSpacing(0, L, s.listSpacing);
}

const mutated = [];
const seen = {};
const relabel = async (n, map, isP) => {
  const old = +n.text.characters.replace(/^P/, '');
  const nu = map[old];
  await figma.loadFontAsync(n.text.fontName);
  n.text.characters = (isP ? 'P' : '') + nu;
  const key = (isP ? 'P' : '#') + nu;
  const suffix = seen[key] ? String.fromCharCode(97 + seen[key]) : '';   // second copy gets "b", third "c"
  seen[key] = (seen[key] || 0) + 1;
  n.name = n.name.replace(/\d+[a-z]?$/, nu + suffix);   // FS2:dec:8 -> FS2:dec:1, FS2:fix:P6b -> FS2:fix:P5b
  mutated.push(n.id);
};
const inOrder = ms => [...ms].sort((a, b) => boardOrder(absPos(a), absPos(b), tol));
if (numMap) for (const n of inOrder(numMarkers)) await relabel(n, numMap, false);
if (pMap) for (const n of inOrder(pMarkers)) await relabel(n, pMap, true);
if (newNum) { await rewriteUniform(numList, newNum.join('\n')); mutated.push(numList.id); }
if (newP) { await rewriteUniform(pList, newP.join('\n')); mutated.push(pList.id); }
for (const r of refs) {
  const t = r.node.type === 'TEXT' ? r.node : r.node.text;
  if (r.node.type === 'TEXT') await loadFonts(r.node); else await figma.loadFontAsync(r.node.text.fontName);
  for (const e of [...r.edits].sort((a, b) => b.start - a.start)) {
    t.insertCharacters(e.end, e.text, 'BEFORE');
    t.deleteCharacters(e.start, e.end);
  }
  mutated.push(r.node.id);
}
return { dryRun: false, ...plan, mutatedNodeIds: mutated };
