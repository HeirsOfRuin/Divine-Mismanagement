// Pixel art drawn in code from the master palette (docs/style-tile.html, the
// look the author approved: "Looks better!"). Small deadpan people, dusk
// colours, no blush. Every sprite is drawn from data, so twelve generated
// followers get twelve generated sprites, and a trait shows as a prop once it
// is known. The UI reads the state; it computes nothing about the game.

import { RIVALS } from '../data/match.data.js';

export const PAL = {
  paper: '#efe6d0', ink: '#2b2433', ochre: '#c98f1f', oxblood: '#9c3d34', verdigris: '#4f8f83', woad: '#3f5a8a',
  plum: '#6b4a73', stone: '#cfc8b8', skin: '#e6c3a0', skin2: '#b98a66', skin3: '#8a5f45', wood: '#8a6242', cream: '#e9dcba',
  white: '#f7f0dd', lamp: '#f3c969', hill: '#3d6a5f', hill2: '#2f544d', grass: '#55806a', water: '#56789c', thatch: '#a8843f',
};
const HAIR = ['#5a3d28', '#b9892f', '#2b2433', '#93512e', '#b7aebb', '#6b4a73'];
const TUNIC = [PAL.verdigris, PAL.oxblood, PAL.woad, PAL.ochre];
const SKIN = [PAL.skin, PAL.skin2, PAL.skin3];
const P = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
function blob(g, ox, oy, rects, fill) {
  for (const [x, y, w, h] of rects) P(g, ox + x - 1, oy + y - 1, w + 2, h + 2, PAL.ink);
  for (const [x, y, w, h, c] of rects) P(g, ox + x, oy + y, w, h, c || fill);
}
const hash = (s) => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };

export const PROP = { literalist: 'stick', drunk: 'mug', ambitious: 'hat', poet: 'quill', lazy: 'pillow', zealot: 'torch' };

/** A devotee, 16 x 20. Looks are fixed by id; the prop appears once the trait is known. */
export function follower(g, ox, oy, f, { bob = 0 } = {}) {
  const k = hash(f.id + f.name);
  const t = TUNIC[f.household % 4], h = HAIR[k % HAIR.length], sk = SKIN[(k >> 3) % SKIN.length];
  const y = oy + bob;
  P(g, ox + 5, oy + 17, 2, 3, PAL.ink); P(g, ox + 9, oy + 17, 2, 3, PAL.ink);
  blob(g, ox, y, [[5, 9, 6, 8]], t);
  P(g, ox + 5, y + 13, 6, 1, PAL.ink);
  P(g, ox + 3, y + 9, 1, 5, PAL.ink); P(g, ox + 12, y + 9, 1, 5, PAL.ink);
  P(g, ox + 3, y + 14, 1, 1, sk); P(g, ox + 12, y + 14, 1, 1, sk);
  blob(g, ox, y, [[5, 3, 6, 5]], sk);
  P(g, ox + 5, y + 3, 6, 2, h); P(g, ox + 5, y + 5, 1, 1, h); P(g, ox + 10, y + 5, 1, 1, h);
  if ((k >> 5) % 3 === 0) P(g, ox + 4, y + 4, 1, 3, h);
  P(g, ox + 6, y + 6, 1, 1, PAL.ink); P(g, ox + 9, y + 6, 1, 1, PAL.ink);
  const p = f.known ? PROP[f.traits[0]] : null;
  if (p === 'mug') { blob(g, ox, y, [[13, 12, 2, 3]], PAL.wood); P(g, ox + 13, y + 12, 2, 1, PAL.white); P(g, ox + 6, y + 6, 1, 1, sk); P(g, ox + 6, y + 7, 1, 1, PAL.ink); }
  if (p === 'torch') { P(g, ox + 13, y + 7, 1, 8, PAL.wood); blob(g, ox, y, [[12, 4, 3, 3]], PAL.ochre); P(g, ox + 13, y + 5, 1, 2, PAL.oxblood); P(g, ox + 6, y + 5, 2, 1, PAL.ink); P(g, ox + 9, y + 5, 2, 1, PAL.ink); }
  if (p === 'quill') { blob(g, ox, y, [[14, 6, 1, 3], [13, 8, 1, 3]], PAL.white); P(g, ox + 13, y + 12, 1, 3, PAL.ink); }
  if (p === 'pillow') { blob(g, ox, y, [[12, 12, 3, 3]], PAL.white); P(g, ox + 6, y + 6, 1, 1, sk); P(g, ox + 9, y + 6, 1, 1, sk); P(g, ox + 6, y + 6, 2, 1, PAL.ink); P(g, ox + 9, y + 6, 2, 1, PAL.ink); }
  if (p === 'stick') { blob(g, ox, y, [[14, 5, 1, 11]], PAL.ochre); for (let i = 0; i < 5; i++) P(g, ox + 14, y + 6 + i * 2, 1, 1, PAL.ink); }
  if (p === 'hat') { blob(g, ox, y, [[6, 0, 4, 3], [4, 3, 8, 1]], PAL.plum); P(g, ox + 6, y + 2, 4, 1, PAL.ochre); }
  // A Saint has a halo; a High Prophet a small gold band.
  if (f.saint) { P(g, ox + 5, y, 6, 1, PAL.lamp); P(g, ox + 4, y + 1, 1, 1, PAL.lamp); P(g, ox + 11, y + 1, 1, 1, PAL.lamp); }
  if (f.high) P(g, ox + 5, y + 3, 6, 1, PAL.ochre);
}

/** You: a small cloud, halo slightly askew, unimpressed. 16 x 14. */
export function cloudGod(g, ox, oy) {
  P(g, ox + 5, oy, 7, 1, PAL.ochre); P(g, ox + 4, oy + 1, 1, 1, PAL.ochre); P(g, ox + 12, oy + 1, 1, 1, PAL.ochre); P(g, ox + 6, oy + 2, 7, 1, PAL.ochre);
  blob(g, ox, oy, [[3, 7, 10, 6], [1, 9, 14, 4], [5, 5, 6, 4]], PAL.white);
  P(g, ox + 2, oy + 12, 12, 1, '#d9cfc0');
  P(g, ox + 5, oy + 9, 2, 1, PAL.ink); P(g, ox + 9, oy + 9, 2, 1, PAL.ink);
  P(g, ox + 7, oy + 11, 2, 1, PAL.ink);
}

/** You, with your head in your hands. 16 x 14. */
export function facepalm(g, ox, oy) {
  P(g, ox + 5, oy, 7, 1, PAL.ochre); P(g, ox + 3, oy + 1, 1, 1, PAL.ochre); P(g, ox + 4, oy + 2, 7, 1, PAL.ochre);
  blob(g, ox, oy, [[3, 7, 10, 6], [1, 9, 14, 4], [5, 5, 6, 4]], PAL.white);
  P(g, ox + 2, oy + 12, 12, 1, '#d9cfc0');
  blob(g, ox, oy, [[4, 7, 8, 2]], PAL.cream);   // the hand
  P(g, ox + 5, oy + 8, 1, 1, PAL.ink); P(g, ox + 7, oy + 8, 1, 1, PAL.ink); P(g, ox + 9, oy + 8, 1, 1, PAL.ink);
  P(g, ox + 7, oy + 11, 3, 1, PAL.ink);
}

/** Pim: a seraph, third class, in spectacles. 16 x 14. */
export function pim(g, ox, oy) {
  blob(g, ox, oy, [[1, 7, 2, 3], [13, 7, 2, 3]], PAL.white);
  blob(g, ox, oy, [[4, 5, 8, 7], [5, 4, 6, 9]], PAL.cream);
  P(g, ox + 6, oy + 1, 4, 1, PAL.ochre);
  P(g, ox + 5, oy + 7, 3, 2, PAL.ink); P(g, ox + 9, oy + 7, 3, 2, PAL.ink); P(g, ox + 6, oy + 7, 1, 1, PAL.white); P(g, ox + 10, oy + 7, 1, 1, PAL.white); P(g, ox + 8, oy + 7, 1, 1, PAL.ink);
  P(g, ox + 7, oy + 11, 2, 1, PAL.ink);
}

/** A rival god: a low sun with half-closed eyes, in her own colours. 16 x 16. */
export function vellamine(g, ox, oy, tired = false, persona = null) {
  const rays = persona ? persona.rays : PAL.lamp, face = persona && persona.id !== 'vellamine' ? persona.colour : (tired ? '#c98a66' : '#e39a6b');
  const pts = persona && persona.id === 'hurm' ? [[7, 0], [7, 14], [0, 7], [14, 7]] : [[7, 0], [7, 14], [0, 7], [14, 7], [2, 2], [12, 2], [2, 12], [12, 12]];
  for (const [x, y] of pts) P(g, ox + x, oy + y, 2, 2, rays);
  blob(g, ox, oy, [[4, 4, 8, 8], [5, 3, 6, 10], [3, 5, 10, 6]], tired ? '#8a7f86' : face);
  P(g, ox + 5, oy + 7, 2, 1, PAL.ink); P(g, ox + 9, oy + 7, 2, 1, PAL.ink);
  P(g, ox + 7, oy + 10, 3, 1, PAL.ink); if (!tired) P(g, ox + 10, oy + 9, 1, 1, PAL.ink);
}

function house(g, x, y, roof, lit) {
  blob(g, x, y, [[1, 6, 12, 8]], PAL.cream);
  blob(g, x, y, [[0, 4, 14, 2], [2, 2, 10, 2], [4, 0, 6, 2]], roof);
  blob(g, x, y, [[5, 9, 3, 5]], PAL.wood);
  P(g, x + 10, y + 8, 2, 2, lit ? PAL.lamp : PAL.woad); P(g, x + 9, y + 7, 4, 1, PAL.ink); P(g, x + 9, y + 10, 4, 1, PAL.ink); P(g, x + 9, y + 8, 1, 2, PAL.ink); P(g, x + 12, y + 8, 1, 2, PAL.ink);
}

// The Works, small. A crooked one leans; a useless one is very pretty.
function work(g, id, x, y, w) {
  const lean = w.crooked ? 1 : 0;
  const trim = w.useless ? PAL.plum : PAL.ochre;
  if (id === 'shrine') { blob(g, x, y, [[1, 4, 8, 7]], PAL.stone); blob(g, x + lean, y, [[0, 2, 10, 2], [3, 0, 4, 2]], trim); P(g, x + 4, y + 6, 2, 5, PAL.ink); }
  if (id === 'bell') { blob(g, x + lean, y, [[3, 0, 4, 11]], PAL.wood); blob(g, x + lean, y, [[2, 2, 6, 4]], trim); P(g, x + 4 + lean, y + 6, 2, 1, PAL.ink); }
  if (id === 'box') { blob(g, x, y + 6, [[0, 0, 7, 5]], PAL.wood); P(g, x + 2, y + 7, 3, 1, PAL.ink); }
  if (id === 'feast_hall') { blob(g, x, y, [[0, 5, 16, 7]], PAL.cream); blob(g, x + lean, y, [[0, 2, 16, 3]], PAL.oxblood); P(g, x + 3, y + 7, 2, 2, PAL.lamp); P(g, x + 11, y + 7, 2, 2, PAL.lamp); P(g, x + 7, y + 8, 2, 4, PAL.wood); }
  if (id === 'reliquary') { blob(g, x, y, [[1, 3, 7, 8]], PAL.stone); P(g, x + 3, y + 5, 3, 3, trim); P(g, x + 4, y + 2, 1, 1, PAL.lamp); }
  if (id === 'guest_house') house(g, x, y - 2, PAL.verdigris, true);
}
const WORK_SPOTS = { shrine: [98, 40], bell: [62, 34], box: [86, 47], feast_hall: [112, 41], reliquary: [50, 41], guest_house: [116, 33] };

/** The village at dusk: you, her, the houses, your Works, and your officers. 130 x 66. */
export function village(g, s) {
  const me = s.gods[0];
  const bands = ['#3f5a8a', '#4c6594', '#5f739f', '#7a83a8', '#9a90aa', '#bf9fa3', '#dcae96', '#eec08c'];
  bands.forEach((c, i) => P(g, 0, i * 6, 130, 6, c));
  for (const [x, y] of [[8, 3], [27, 8], [49, 2], [71, 6], [93, 3], [118, 9], [60, 12]]) P(g, x, y, 1, 1, PAL.white);
  for (let x = 0; x < 130; x++) { const h = Math.round(6 * Math.sin(x / 19 + 2) + 3 * Math.sin(x / 8)); P(g, x, 40 - h, 1, 26 + h, PAL.hill2); }
  for (let x = 0; x < 130; x++) { const h = Math.round(3 * Math.sin(x / 13) + 2 * Math.sin(x / 5 + 1)); P(g, x, 46 - h, 1, 20 + h, PAL.hill); }
  P(g, 0, 52, 130, 14, PAL.grass); P(g, 0, 52, 130, 1, '#3f6b57');
  house(g, 3, 38, PAL.thatch, true); house(g, 22, 39, PAL.oxblood, s.season % 2 === 0);
  blob(g, 0, 0, [[45, 42, 4, 10], [46, 40, 2, 2]], PAL.stone);
  for (const [id, w] of Object.entries(me.works)) if (WORK_SPOTS[id]) work(g, id, WORK_SPOTS[id][0], WORK_SPOTS[id][1], w);
  blob(g, 0, 0, [[104, 58, 18, 4], [107, 57, 12, 6]], PAL.water); P(g, 110, 60, 5, 1, PAL.ink);
  cloudGod(g, 36, 6);
  s.gods.slice(1).forEach((r, i) => { if (!r.fallen) vellamine(g, 92 - i * 14, 14 + i * 5 + Math.max(0, 10 - Math.min(10, r.souls / 2)), r.souls < 6, personaFor(r)); });
  const officers = me.flock.filter((f) => f.office);
  const crowd = officers.length ? officers : me.flock.slice(0, 4);
  crowd.slice(0, 6).forEach((f, i) => follower(g, 6 + i * 16 + (i > 2 ? 30 : 0), 44, f, { bob: (s.season + i) % 2 }));
}

/** One region: a mark per soul, yours first, then the Unbothered, then each rival in her colour. */
export function split(g, s, ri = 0) {
  const r = s.villages[ri];
  const cols = [...Array(r.held[0]).fill(PAL.ochre), ...Array(r.unbothered).fill(PAL.stone)];
  s.gods.forEach((x, i) => { if (i > 0) cols.push(...Array(r.held[i]).fill(personaFor(x).colour)); });
  cols.forEach((c, i) => { P(g, i * 3 + 1, 1, 2, 4, PAL.ink); P(g, i * 3 + 1, 1, 2, 3, c); });
}
const personaFor = (g) => RIVALS.find((p) => p.id === g.persona) || RIVALS[0];

/** Draw into every canvas[data-sprite] on the page. */
export function paint(root, s) {
  for (const c of root.querySelectorAll('canvas[data-sprite]')) {
    const g = c.getContext('2d');
    g.clearRect(0, 0, c.width, c.height);
    const kind = c.dataset.sprite;
    if (kind === 'village') village(g, s);
    else if (kind === 'split') split(g, s, Number(c.dataset.region || 0));
    else if (kind === 'facepalm') facepalm(g, 0, 1);
    else if (kind === 'map') map(g, s);
    else if (kind === 'icon') icon(g, c.dataset.icon);
    else if (kind === 'you') cloudGod(g, 0, 1);
    else if (kind === 'pim') pim(g, 0, 1);
    else if (kind === 'her') { const r = s.gods[Number(c.dataset.god || 1)]; if (r) vellamine(g, 0, 0, r.souls < 6 || r.fallen, personaFor(r)); }
    else if (kind === 'f') {
      const f = s.gods.flatMap((x) => x.flock).find((x) => x.id === c.dataset.id);
      if (f) follower(g, 0, 0, f);
    }
  }
}

// ---- icons: 12 x 12, one per act and office --------------------------------------
// Drawn from rectangles in the master palette, ink outline, no lettering.
const ICONS = {
  reveal:   (g) => { blob(g, 0, 0, [[2, 1, 8, 10]], PAL.cream); for (let y = 3; y < 10; y += 2) P(g, 4, y, 4, 1, PAL.ink); P(g, 1, 1, 10, 1, PAL.wood); P(g, 1, 10, 10, 1, PAL.wood); },
  miracle:  (g) => { P(g, 5, 0, 2, 12, PAL.lamp); P(g, 0, 5, 12, 2, PAL.lamp); P(g, 2, 2, 2, 2, PAL.ochre); P(g, 8, 8, 2, 2, PAL.ochre); P(g, 8, 2, 2, 2, PAL.ochre); P(g, 2, 8, 2, 2, PAL.ochre); P(g, 5, 5, 2, 2, PAL.white); },
  answer:   (g) => { blob(g, 0, 0, [[3, 2, 3, 8], [6, 2, 3, 8]], PAL.skin); P(g, 5, 2, 1, 8, PAL.ink); },
  dream:    (g) => { blob(g, 0, 0, [[3, 1, 6, 10]], PAL.lamp); P(g, 6, 1, 4, 8, PAL.woad); P(g, 9, 2, 1, 1, PAL.white); },
  festival: (g) => { P(g, 2, 0, 1, 12, PAL.wood); blob(g, 0, 0, [[3, 1, 7, 5]], PAL.oxblood); P(g, 4, 3, 5, 1, PAL.lamp); },
  dispute:  (g) => { blob(g, 0, 0, [[1, 1, 6, 5]], PAL.white); blob(g, 0, 0, [[5, 5, 6, 5]], PAL.cream); P(g, 2, 3, 4, 1, PAL.ink); P(g, 6, 7, 4, 1, PAL.ink); },
  poach:    (g) => { blob(g, 0, 0, [[2, 4, 8, 6]], PAL.skin); P(g, 2, 2, 1, 3, PAL.skin); P(g, 4, 1, 1, 4, PAL.skin); P(g, 6, 1, 1, 4, PAL.skin); P(g, 8, 2, 1, 3, PAL.skin); },
  silent:   (g) => { P(g, 2, 2, 5, 1, PAL.woad); P(g, 5, 3, 1, 1, PAL.woad); P(g, 4, 4, 1, 1, PAL.woad); P(g, 2, 5, 5, 1, PAL.woad); P(g, 7, 7, 3, 1, PAL.plum); P(g, 8, 8, 1, 1, PAL.plum); P(g, 7, 9, 3, 1, PAL.plum); },
  anoint:   (g) => { blob(g, 0, 0, [[1, 5, 10, 5]], PAL.ochre); P(g, 1, 2, 2, 3, PAL.ochre); P(g, 5, 1, 2, 4, PAL.ochre); P(g, 9, 2, 2, 3, PAL.ochre); P(g, 5, 7, 2, 2, PAL.oxblood); },
  artifact: (g) => { blob(g, 0, 0, [[3, 3, 6, 8], [4, 1, 4, 2]], PAL.stone); P(g, 4, 5, 4, 1, PAL.plum); P(g, 5, 0, 2, 1, PAL.lamp); },
  wonder:   (g) => { for (const [x, y] of [[5, 0], [5, 10], [0, 5], [10, 5], [2, 2], [8, 2], [2, 8], [8, 8]]) P(g, x, y, 2, 2, PAL.lamp); blob(g, 0, 0, [[4, 4, 4, 4]], PAL.white); },
  canonize: (g) => { P(g, 3, 0, 6, 1, PAL.lamp); P(g, 2, 1, 1, 1, PAL.lamp); P(g, 9, 1, 1, 1, PAL.lamp); blob(g, 0, 0, [[4, 3, 4, 4], [3, 7, 6, 5]], PAL.cream); },
  prophet:  (g) => { blob(g, 0, 0, [[2, 2, 8, 7]], PAL.white); P(g, 4, 9, 2, 2, PAL.white); P(g, 4, 5, 4, 1, PAL.ink); },
  preacher: (g) => { blob(g, 0, 0, [[3, 4, 6, 7]], PAL.wood); blob(g, 0, 0, [[1, 2, 10, 2]], PAL.oxblood); },
  missionary: (g) => { blob(g, 0, 0, [[1, 6, 4, 4], [7, 2, 4, 4]], PAL.wood); P(g, 1, 9, 4, 1, PAL.ink); P(g, 7, 5, 4, 1, PAL.ink); },
  collector: (g) => { blob(g, 0, 0, [[2, 4, 8, 7], [4, 2, 4, 2]], PAL.thatch); P(g, 5, 7, 2, 2, PAL.lamp); },
  builder:  (g) => { P(g, 5, 4, 2, 8, PAL.wood); blob(g, 0, 0, [[2, 1, 8, 3]], PAL.stone); },
  witness:  (g) => { blob(g, 0, 0, [[1, 4, 10, 4], [3, 3, 6, 6]], PAL.white); P(g, 5, 5, 2, 2, PAL.woad); P(g, 5, 5, 1, 1, PAL.ink); },
};
export function icon(g, name) { g.clearRect(0, 0, 12, 12); (ICONS[name] || ICONS.reveal)(g); }

// ---- the map ---------------------------------------------------------------------------
// Regions as land, villages as houses whose roofs take the colour of whoever
// holds most souls there (stone for the Unbothered), your mission field
// flagged. Names are HTML laid over the canvas: no pixel lettering.
const holderColour = (s, v) => {
  let best = -1, bi = -1;
  v.held.forEach((h, i) => { if (h > best) { best = h; bi = i; } });
  if (v.unbothered > best) return PAL.stone;
  return bi === 0 ? PAL.ochre : personaFor(s.gods[bi]).colour;
};
export function map(g, s) {
  P(g, 0, 0, 130, 90, PAL.water);
  for (let i = 0; i < 40; i++) P(g, (i * 37) % 130, (i * 23) % 90, 2, 1, '#6787a8');
  const shades = [PAL.grass, PAL.hill, '#6b8f5e', '#5c8a74'];
  s.regions.forEach((R, ri) => {
    const c = shades[ri % shades.length];
    P(g, R.x + 2, R.y, R.w - 4, R.h, PAL.ink); P(g, R.x, R.y + 2, R.w, R.h - 4, PAL.ink);
    P(g, R.x + 3, R.y + 1, R.w - 6, R.h - 2, c); P(g, R.x + 1, R.y + 3, R.w - 2, R.h - 6, c);
    for (let k = 0; k < 6; k++) P(g, R.x + 4 + ((k * 17 + ri * 7) % Math.max(1, R.w - 10)), R.y + 4 + ((k * 11 + ri * 5) % Math.max(1, R.h - 10)), 3, 2, PAL.hill2);
  });
  // Roads between neighbouring villages in a region.
  for (let i = 0; i < s.villages.length - 1; i++) {
    const a = s.villages[i], b = s.villages[i + 1];
    if (a.region !== b.region) continue;
    const steps = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    for (let t = 0; t <= steps; t += 2) P(g, Math.round(a.x + ((b.x - a.x) * t) / steps), Math.round(a.y + ((b.y - a.y) * t) / steps), 1, 1, PAL.cream);
  }
  s.villages.forEach((v, vi) => {
    const roof = holderColour(s, v);
    blob(g, v.x - 5, v.y - 4, [[0, 3, 4, 3], [5, 2, 5, 4]], PAL.cream);
    P(g, v.x - 5, v.y - 2, 4, 1, roof); P(g, v.x, v.y - 3, 5, 2, roof);
    if (s.gods[0].field === vi) { P(g, v.x + 6, v.y - 8, 1, 8, PAL.ink); blob(g, v.x + 7, v.y - 8, [[0, 0, 4, 3]], PAL.ochre); }
  });
}
