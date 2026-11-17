// The screens. They read the engine and compute nothing about the game.
//
// After the first playtest ("not very easy to use... just enough visible so as
// not to overwhelm", docs/FRAME-playtest-1.md) the screens follow one rule:
// show what can be done now, explain it the first time, and give a reason to
// do it this season. Acts are tiles that open a sheet saying what they do;
// what has not opened is not shown; staffing shows what each candidate would
// do before you choose; the telephone is played back one person at a time.
//
// Patterns kept from before: empty and locked states say why (rule 6); saves
// autosave; a throw never leaves a dead button (busy released in finally).

import { newGame, advance, preview, post, commission, sendMissionary, ruleOn, rulingOptions, chooseScene, chooseEnding } from '../engine/turn.js';
import { SAVE_KEY, serialize, deserialize, toCode, fromCode } from '../engine/state.js';
import { render as renderVerse } from '../engine/render.js';
import { makeRevelation } from '../engine/telephone.js';
import { holder, posted } from '../engine/offices.js';
import { scriptureSum } from '../engine/scripture.js';
import { grandOpen } from '../engine/acts.js';
import { bookEffects } from '../engine/book.js';
import { isOpen, opensIn, noteFor } from '../engine/guide.js';
import { currentScene, epilogue, finalChoice, finalText, isStory, reviewLabel, legacyOf, legacyKey, nextChapter } from '../engine/story.js';
import { seasonName, registryMinimum, nextCheck, reviewStanding, effectsText, tabletCounts, officeText, worstVerse, wantText } from '../engine/derive.js';
import { thresholds, living } from '../engine/world.js';
import { CONFIG, OUTCOMES } from '../data/config.data.js';
import { OFFICES, OFFICE_IDS, MIRACLES, WORKS, WORK_IDS } from '../data/offices.data.js';
import { STORY, CUSTOM, RIVALS, RANKS, GRAND, SAINT_VIRTUE, TRAVEL_SEASONS } from '../data/match.data.js';
import { TEMPLATES, PHRASES } from '../data/lexicon.data.js';
import { TRAITS } from '../data/traits.data.js';
import { paint } from './sprites.js';
import { STORAGE_OK, lsGet, lsSet } from './storage.js';
import { registerSW, installPrompt } from './sw-register.js';

const app = document.getElementById('app');
let state = null;
let tab = 'village';
let sheet = null;          // { kind, ... } a sheet over the screen
let busy = false;
let banner = null;
let install = null;
let draft = null;          // the Revelation being composed
let setup = null;          // the match being set up
let seenNote = 0;          // the season whose opening note has been dismissed

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const r1 = (v) => (Math.round(v * 10) / 10).toString();
const whole = (v) => Math.floor(v + 1e-9).toString();
const signed = (v) => (v > 0.05 ? `+${r1(v)}` : v < -0.05 ? `−${r1(-v)}` : '');
const me = () => state.gods[0];
const rivals = () => state.gods.map((g, i) => i).slice(1);
const who = (id) => state.gods.flatMap((g) => g.flock).find((f) => f.id === id);
const persona = (g) => RIVALS.find((p) => p.id === g.persona) || RIVALS[0];
const traitLabel = (f) => (f.known ? f.traits.map((t) => TRAITS[t].label).join(', ') : 'not yet known');
const sprite = (f, size = 32) => `<canvas data-sprite="f" data-id="${f.id}" width="16" height="20" style="width:${size}px;height:${size * 1.25}px"></canvas>`;
const sun = (gi, size = 20) => `<canvas data-sprite="her" data-god="${gi}" width="16" height="16" style="width:${size}px;height:${size}px"></canvas>`;
const ico = (name, size = 24) => `<canvas data-sprite="icon" data-icon="${name}" width="12" height="12" style="width:${size}px;height:${size}px"></canvas>`;
const costText = (c) => Object.entries(c).map(([m, n]) => `${n} ${m === 'faith' ? 'Faith' : m === 'power' ? 'Power' : 'Offerings'}`).join(' + ');
const fullName = (f) => `${f.saint ? 'Saint ' : ''}${f.name}`;
const village = (vi) => state.villages[vi];
const multi = () => state.villages.length > 1;

function save() {
  if (!state) return;
  lsSet(SAVE_KEY, serialize(state));
  // A finished Story chapter (its last choice made) is what the next one opens from.
  const L = legacyOf(state);
  if (L && !finalChoice(state)) lsSet(LEGACY_KEY, JSON.stringify(L));
}
const LEGACY_KEY = 'divine-mismanagement.legacy.v1';
function storedLegacy() { try { return JSON.parse(lsGet(LEGACY_KEY) || 'null'); } catch { return null; } }
const OUTCOME_WORDS = { thresholds: 'won, and went back to Thresholds', move: 'won, and moved the stone', stay: 'won, and stayed', rival_fell: 'every rival fell', passed_over: 'passed over', lapsed: 'lost' };
function legacyLine(chapter) {
  const i = STORY.findIndex((c) => c.id === chapter);
  if (i < 1) return '';
  const prev = STORY[i - 1], L = storedLegacy();
  if (L && L.chapter === prev.id) return `Carries on from your ${prev.label.split(':')[0]}: ${OUTCOME_WORDS[legacyKey(L)] || L.outcome}.`;
  return `Opens as if you won ${prev.label.split(':')[0]} and stayed. Finish it to carry your own ending in.`;
}
function load() {
  const raw = lsGet(SAVE_KEY);
  if (!raw) return null;
  try { return deserialize(raw); } catch (e) { banner = `The saved game could not be read (${e.message}).`; return null; }
}

// ---- title and match setup ----------------------------------------------------------

function title() {
  const saved = load();
  app.innerHTML = `
    <main class="title">
      <header class="masthead"><h1>Divine Mismanagement</h1><div class="caps">Registry of Minor Deities · Lower Annex</div></header>
      <canvas class="diorama" data-sprite="village" width="130" height="66"></canvas>
      <p class="lede serif">You are a minor god with twelve worshippers, and every one of them is an idiot. Grow your faith into a major religion, despite them.</p>
      ${STORAGE_OK ? '' : '<p class="warn">This browser is refusing to store anything for this page, so progress will not be kept. Copy a save code from the menu before you leave.</p>'}
      ${banner ? `<p class="warn">${esc(banner)}</p>` : ''}
      <div class="stack">
        ${saved && !saved.over ? `<button class="primary" data-act="continue">Continue: ${esc(saved.match.label)}, ${esc(seasonName(saved.season))}</button>` : ''}
        <button ${saved && !saved.over ? '' : 'class="primary"'} data-act="new">New game</button>
        <button data-act="load-code">Load a save code</button>
        ${install ? '<button data-act="install">Install on this device</button>' : ''}
      </div>
    </main>${sheetHtml()}`;
  paint(app, newGame({ seed: 7 }));
}

function setupScreen() {
  const s = setup;
  const ch = STORY.find((c) => c.id === s.chapter);
  const opt = (key, list, label) => `<label class="field">${label}<select data-setup="${key}">${list.map((v) => `<option value="${v}" ${String(s[key]) === String(v) ? 'selected' : ''}>${v}</option>`).join('')}</select></label>`;
  const villages = (c) => c.regions * c.villages;
  app.innerHTML = `
    <main class="title">
      <header class="masthead"><h1>A new god</h1><div class="caps">Form 1: Application for Divinity</div></header>
      <label class="field">Your name, as the Registry will file it
        <input id="godname" maxlength="40" value="${esc(s.name)}"></label>
      <div class="seg" role="tablist">
        <button class="${s.mode === 'story' ? 'on' : ''}" data-setmode="story">Story</button>
        <button class="${s.mode === 'custom' ? 'on' : ''}" data-setmode="custom">Custom match</button>
      </div>
      ${s.mode === 'story' ? `
        <div class="stack">${STORY.map((c) => `<button class="choice ${c.id === s.chapter ? 'on' : ''}" data-chapter="${c.id}"><span><b>${esc(c.label)}</b><small>${c.rivals} rival${c.rivals > 1 ? 's' : ''} · ${villages(c)} village${villages(c) > 1 ? 's' : ''}${c.regions > 1 ? ` in ${c.regions} regions` : ''} · ${c.seasons} seasons${c.measured ? '' : ' · lightly measured'}${c.written === false ? ' · story: opening only' : ''}</small></span></button>`).join('')}</div>
        <p class="serif intro">${esc(ch.intro)}</p>
        ${legacyLine(ch.id) ? `<p class="hint">${esc(legacyLine(ch.id))}</p>` : ''}` : `
        <div class="grid2">
          ${opt('rivals', CUSTOM.rivals, 'Rival gods')}
          ${opt('regions', CUSTOM.regions, 'Regions')}
          ${opt('villages', CUSTOM.villages, 'Villages per region')}
          ${opt('seasons', CUSTOM.seasons, 'Seasons')}
        </div>
        <label class="field">Your starting resources<select data-setup="wealth">${Object.entries(CUSTOM.wealth).map(([k, w]) => `<option value="${k}" ${s.wealth === k ? 'selected' : ''}>${w.label}</option>`).join('')}</select></label>
        <label class="check"><input type="checkbox" data-setup="guided" ${s.guided ? 'checked' : ''}> Open things one at a time, with notes from Pim</label>
        <p class="hint">Against: ${RIVALS.slice(0, s.rivals).map((r) => `${esc(r.name)}, ${esc(r.title)}`).join('; ')}.</p>
        <p class="hint">Only one rival, one village, standard resources and 30 seasons is balanced; other shapes are playable but lightly measured.</p>`}
      <div class="row"><button data-act="back">Back</button><button class="primary" data-act="start">Begin</button></div>
    </main>${sheetHtml()}`;
}

// ---- the frame -------------------------------------------------------------------

function render() {
  if (setup && !state) return setupScreen();
  if (!state) return title();
  const g = me();
  const last = state.chronicle[state.chronicle.length - 1];
  const tabs = [['village', 'Village'], ['flock', 'Flock'], ['scripture', 'Scripture'], ['world', multi() ? 'Map' : 'World'], ['menu', 'Menu']];
  app.innerHTML = `
    <header class="hud">
      <span class="god">${esc(g.name)}</span>
      <span class="turn">${state.over ? 'The Review' : `${seasonName(state.season)} · ${state.season} of ${state.match.seasons}`} · ${esc(RANKS[g.rank].title)}</span>
    </header>
    ${ledgerRow(g, last)}
    ${banner ? `<p class="banner">${esc(banner)} <button data-act="dismiss">OK</button></p>` : ''}
    <main class="panel">${({ village: villageTab, flock: flockTab, scripture: scriptureTab, world: worldTab, menu: menuTab })[tab]()}</main>
    <nav class="tabs">${tabs.map(([id, label]) => `<button data-tab="${id}" class="${tab === id ? 'on' : ''}">${label}</button>`).join('')}</nav>
    ${sheetHtml()}`;
  paint(app, state);
}

function ledgerRow(g, last) {
  const acc = last ? last.account : {};
  const delta = (m) => Object.values(acc[m] || {}).reduce((a, b) => a + b, 0);
  const cell = (m, label, value) => {
    const d = delta(m);
    return `<div><span class="caps">${label}</span><b>${value}</b><small class="${d > 0.05 ? 'up' : d < -0.05 ? 'down' : ''}">${signed(d)}</small></div>`;
  };
  return `<div class="ledger">${cell('faith', 'Faith', whole(g.faith))}${cell('power', 'Power', whole(g.power))}${cell('mystery', 'Mystery', whole(g.mystery))}${isOpen(state, 'office:collector') ? cell('offerings', 'Offerings', whole(g.offerings)) : ''}${cell('souls', 'Souls', `${g.souls}`)}</div>`;
}

// ---- village ---------------------------------------------------------------------

function villageTab() {
  const g = me();
  const last = state.chronicle[state.chronicle.length - 1];
  if (state.over) return endingHtml();
  const at = nextCheck(state), T = thresholds(state);
  const line = at >= state.match.seasons ? T.review.faith : registryMinimum(state);
  const note = noteFor(state);
  const showNote = note && seenNote !== state.season;
  return `
    <canvas class="diorama" data-sprite="village" width="130" height="66"></canvas>
    ${showNote ? `<section class="note"><div class="head"><canvas data-sprite="pim" width="16" height="15" style="width:24px;height:22px"></canvas><b>${esc(note.title)}</b></div><p>${esc(note.text)}</p><button class="small-btn" data-act="note-ok">Understood</button></section>` : ''}
    ${state.event ? `<section class="problem">${rulingHtml()}</section>` : ''}
    <section class="card goals">
      <div class="caps">${isStory(state) ? reviewLabel(state).caps : 'The Registry'}</div>
      <div class="goal"><span class="box ${g.faith >= line ? 'ok' : ''}"></span><span>Faith ${line} by season ${at}</span><small>you have ${whole(g.faith)}${g.strikes ? ' · <b class="down">one more miss and you are archived</b>' : ''}</small></div>
      <p class="hint">${isStory(state) ? reviewLabel(state).hint : `The Review is after season ${state.match.seasons}.`}</p>
    </section>
    <h2>This season, one act</h2>
    <div class="tiles">${actTiles()}</div>
    ${g.rank > 0 ? `<h2>Rare acts · ${esc(RANKS[g.rank].title)}</h2><div class="tiles">${grandTiles()}</div>` : ''}
    ${memoCard(last ? last.memo : null, last)}
    ${last && last.line ? `<p class="rival-line">${sun(last.line.by)} ${esc(last.line.text)}</p>` : ''}`;
}

function memoCard(memo, last) {
  if (!memo) return '';
  return `<div class="memo"><div class="head"><canvas data-sprite="pim" width="16" height="15" style="width:24px;height:22px"></canvas>
    <div class="caps">Pim · ${last ? esc(seasonName(last.season)) : ''}</div></div>
    <p class="mono">${esc(memo)}</p></div>`;
}

// One tile per act that has opened. A tile always opens a sheet that says what
// the act does; the sheet holds the choice. Short reason when it cannot be done.
const ACTS = [
  { id: 'reveal', label: 'Revelation', key: 'act:reveal', sub: () => '1 Power a link' },
  { id: 'miracle', label: 'Miracle', key: 'act:miracle', sub: () => '3-4 Power' },
  { id: 'answer', label: 'Answer prayer', key: 'act:answer', sub: (g) => `${g.prayers.length} waiting` },
  { id: 'dream', label: 'Dream', key: 'act:dream', sub: () => '1 Power' },
  { id: 'festival', label: 'Festival', key: 'act:festival', sub: () => '4 Offerings' },
  { id: 'dispute', label: 'Disputation', key: 'act:dispute', sub: () => '2 Power' },
  { id: 'poach', label: 'Their neglected', key: 'act:poach', sub: () => '3 Power' },
  { id: 'silent', label: 'Silence', key: 'act:silent', sub: () => 'free' },
];
function actBlocker(id) {
  const g = me();
  if (state.event) return 'Rule first';
  if (id === 'answer' && !g.prayers.length) return 'Nobody praying';
  if (id === 'dream' && !g.flock.some((f) => !f.known)) return 'All known';
  if (['reveal', 'miracle', 'silent', 'answer', 'dream'].includes(id)) return null;
  if (living(state).length > 2 && (id === 'dispute' || id === 'poach')) return null;
  const p = preview(state, 0, { kind: id });
  return p.ok ? null : p.why.length > 26 ? 'Not now' : p.why;
}
function actTiles() {
  const g = me();
  return ACTS.filter((a) => isOpen(state, a.key)).map((a) => {
    const block = actBlocker(a.id);
    return `<button class="tile" data-act="open-${a.id}" ${block === 'Rule first' ? 'disabled' : ''}>${ico(a.id)}<b>${a.label}</b><small class="${block ? 'down' : ''}">${esc(block || a.sub(g))}</small></button>`;
  }).join('') + (state.match.guided && state.season < 8 ? '<div class="tile ghost"><small>More opens as the seasons go on.</small></div>' : '');
}
function grandTiles() {
  return Object.entries(GRAND).filter(([kind]) => me().rank >= RANKS.findIndex((r) => (r.unlocks || []).includes(kind))).map(([kind, spec]) => {
    const why = state.event ? 'Rule first' : grandOpen(state, 0, kind);
    return `<button class="tile grand" data-act="open-${kind}">${ico(kind)}<b>${spec.label.replace(/^(Anoint|Bless|Work|Make) (a |an )?/, '')}</b><small class="${why ? 'down' : ''}">${esc(why ? (why.length > 26 ? 'Not yet' : why) : costText(spec.cost))}</small></button>`;
  }).join('');
}

// ---- flock: the staffing board ------------------------------------------------------

function flockTab() {
  const g = me();
  const cards = OFFICE_IDS.map((office) => {
    if (!isOpen(state, `office:${office}`)) return `<div class="office locked">${ico(office)}<div><b>${OFFICES[office].label}</b><small>Opens in season ${opensIn(`office:${office}`)}</small></div></div>`;
    const f = posted(g, office);
    const does = f ? (f.known ? officeText(office, f.traits[0]) : 'shows what they are after a season') : OFFICES[office].does;
    return `<button class="office ${f ? '' : 'vacant'}" data-act="assign" data-office="${office}">${f ? sprite(f, 28) : ico(office, 28)}<div><b>${OFFICES[office].label}${f && f.high ? ' · High' : ''}</b><span>${f ? esc(fullName(f)) : '<i>Vacant: tap to post someone</i>'}${f && f.settling ? ' · settling in' : ''}</span><small>${esc(does)}</small></div></button>`;
  }).join('');
  const b = g.building;
  const free = WORK_IDS.filter((id) => !g.works[id]);
  const works = isOpen(state, 'office:builder') ? `<h2>Works</h2>
    <div class="card"><p>${b ? `<b>${WORKS[b.id].label}</b>: ${b.paid ? `${r1(b.progress)} of ${WORKS[b.id].need} seasons of work done` : `waiting for ${WORKS[b.id].cost} Offerings`}. ${WORKS[b.id].does}` : 'Nothing being built. Choose one; the Builder pays from Offerings.'}</p>
      <label class="field">Build next<select data-commission ${b && b.paid ? 'disabled' : ''}><option value="">Nothing</option>${free.map((id) => `<option value="${id}" ${b && b.id === id ? 'selected' : ''}>${WORKS[id].label} (${WORKS[id].cost}): ${WORKS[id].does}</option>`).join('')}</select></label>
      ${Object.keys(g.works).length ? `<small>Built: ${Object.entries(g.works).map(([id, w]) => `${WORKS[id].label}${w.crooked ? ' (crooked)' : ''}${w.useless ? ' (beautiful, useless)' : ''}`).join(', ')}</small>` : ''}</div>` : '';
  const people = [0, 1, 2, 3].map((h) => `<div class="household"><div class="caps">Household ${h + 1}</div>${g.flock.filter((f) => f.household === h).map((f) => {
    const w = wantText(f);
    return `<div class="person">${sprite(f, 28)}<div><b>${esc(fullName(f))}</b> ${esc(f.trade.label)}<small>${esc(traitLabel(f))}${f.office ? ` · ${OFFICES[f.office].label}` : ''}${f.saint ? ` · patron of ${esc(f.saint.patron)}` : ''}</small>${w ? `<small class="want">${esc(w)}</small>` : ''}</div></div>`;
  }).join('')}</div>`).join('');
  return `<h2>Offices</h2>
    <p class="hint">Tap an office to choose who holds it. Changing costs no act, but the new holder spends a season settling in.</p>
    <div class="offices">${cards}</div>
    ${works}
    <details class="flock-list"><summary>Your twelve, by household</summary>${people}</details>`;
}

// ---- scripture ---------------------------------------------------------------------

function tabletHtml(g, t, contra) {
  const c = tabletCounts(g, t);
  const clash = contra.filter((p) => p.includes(t.id)).map((p) => p.find((x) => x !== t.id)).map((id) => g.tablets.find((x) => x.id === id)).filter(Boolean);
  return `<article class="tablet">
    <div class="caps">${esc(t.title)}</div>
    <div class="verse">${esc(renderVerse(t.verse))}</div>
    <div class="counts">${c.good ? '' : '<b class="down">Does no good.</b> '}${esc(c.text)} · heard by ${c.households} of 4 households</div>
    ${clash.length ? `<div class="clash">Contradicts ${clash.map((x) => esc(x.title)).join(', ')}: Heresy rises while both stand.</div>` : ''}
    <details><summary>You said: ${esc(t.said)}</summary>
      ${t.steps.map((st) => `<p class="by">${esc(who(st.by)?.name)} (${TRAITS[st.trait].label}) ${esc(st.note || 'passed it on unchanged')}.</p>`).join('')}
      ${t.history.map((h) => `<p class="by">Later, ${esc(who(h.by)?.name)} ${esc(h.note)} from the pulpit, and it stuck.</p>`).join('')}
      ${t.after ? `<p class="by">${esc(t.after)}</p>` : ''}
    </details></article>`;
}

function scriptureTab() {
  const g = me();
  const sum = scriptureSum(g);
  const tabs = [...g.tablets].reverse();
  const legends = g.legends.filter((L) => L.left > 0);
  const be = bookEffects(state);
  const all = g.tablets.length + g.apocrypha.length;
  return `${state.book ? `<button class="book-cover" data-act="read-book"><span class="caps">${esc(state.book.title)}</span><small>${state.book.chapters.length} chapters · ${be.good} still do good · tap to read</small></button>`
      : `<p class="hint">${all} verse${all === 1 ? '' : 's'} carved. Late in the game the faithful will gather them all into a Book and copy them out once more.</p>`}
    <h2>Tablets in force · ${sum.doctrine} doing good</h2>
    ${tabs.length ? tabs.map((t) => tabletHtml(g, t, sum.contradictions)).join('') : '<p class="empty">Nothing is carved yet. Send a Revelation: whatever reaches the last person in the chain is carved here and does what it says, every season.</p>'}
    ${g.apocrypha.length ? `<details><summary>The Apocrypha (${g.apocrypha.length}, no longer in force)</summary>${g.apocrypha.map((t) => `<p class="serif">${esc(t.title)}: ${esc(renderVerse(t.verse))}</p>`).join('')}</details>` : ''}
    ${g.saints.length ? `<h2>Saints</h2>${g.saints.map((st) => { const f = who(st.id); return `<p>${sprite(f, 24)} <b>Saint ${esc(f.name)}</b>, patron of ${esc(f.saint.patron)}. ${esc(SAINT_VIRTUE[f.traits[0]].label)}.${f.saint.intended !== f.id ? ` <small>You meant ${esc(who(f.saint.intended).name)}.</small>` : ''}</p>`; }).join('')}` : ''}
    ${g.artifacts.length ? `<h2>Holy objects</h2>${g.artifacts.map((a) => `<p><b>${esc(a.name.charAt(0).toUpperCase() + a.name.slice(1))}</b>: ${esc(a.does)}. <small>${esc(a.how)}</small></p>`).join('')}` : ''}
    ${legends.length ? `<h2>Legends being told</h2>${legends.map((L) => `<p>${L.text ? esc(L.text) : L.kind === 'wonder' ? 'A Wonder, as people tell it.' : `A ${MIRACLES[L.kind].label.toLowerCase()}, as ${L.by ? esc(who(L.by)?.name) : 'nobody'} tells it.`} <small>${L.left} more season${L.left > 1 ? 's' : ''}.</small></p>`).join('')}` : ''}`;
}

function bookHtml() {
  const b = state.book;
  const roman = (n) => ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'][n] || String(n);
  const words = () => b.chapters.map((c, i) => {
    const was = c.formerly && c.formerly.replace(/^the /, 'The ') !== c.title ? ` <small class="formerly">formerly ${esc(c.formerly)}</small>` : '';
    return `<section class="chapter"><div class="caps">${roman(i + 1)}. ${esc(c.title)}${was}</div>
      <p class="serif verse-text">${esc(renderVerse(c.verse))}</p>
      <details class="footnote"><summary>What you actually said</summary><p>${esc(c.said)}</p>${c.notes.length ? `<p>${c.notes.map((n) => `${esc(who(n.by).name)} (${TRAITS[n.trait].label}) ${esc(n.note)} while copying it out`).join('; ')}.</p>` : ''}</details></section>`;
  }).join('');
  return `<div class="book">
    <h2 class="book-title">${esc(b.title)}</h2>
    <p class="serif center">${esc(b.preface)}</p>
    <p class="hint center">${esc(b.compiled)}</p>
    ${(b.sections || [{ heading: 'The words', passages: [], chapters: true }]).map((sec, k) => `<h3 class="book-head">${roman(k + 1)}. ${esc(sec.heading)}</h3>${sec.passages.map((p) => `<p class="serif verse-text">${esc(p)}</p>`).join('')}${sec.chapters ? words() : ''}`).join('')}
    <button class="primary" data-act="close">Close the Book</button></div>`;
}

// ---- world: the map, the other gods, your standing ------------------------------------

function worldTab() {
  const g = me();
  const T = thresholds(state);
  const stand = reviewStanding(state, 0);
  const pins = state.villages.map((v, vi) => `<button class="pin ${g.field === vi ? 'field' : ''}" data-act="open-village" data-village="${vi}" style="left:${(v.x / 130) * 100}%;top:${((v.y + 4) / 90) * 100}%">${esc(v.name)}</button>`).join('');
  const labels = state.regions.length > 1 ? state.regions.map((R) => `<span class="rlabel" style="left:${((R.x + 2) / 130) * 100}%;top:${((R.y + 1) / 90) * 100}%">${esc(R.name)}</span>`).join('') : '';
  return `<h2>${multi() ? 'The map' : esc(village(0).name)}</h2>
    <div class="mapwrap"><canvas class="map" data-sprite="map" width="130" height="90"></canvas>${labels}${pins}</div>
    <p class="hint">Roofs take the colour of whoever holds most souls there; grey is the Unbothered. Your flag marks where your missionary works.${multi() ? ` Tap a village to look closer or send your missionary. Another region is ${TRAVEL_SEASONS} season on the road.` : ''}</p>
    ${state.villages.length <= 4 ? state.villages.map((v, vi) => villageRow(vi)).join('') : ''}
    <h2>The other gods</h2>
    ${rivals().map((i) => { const o = state.gods[i], p = persona(o); return `<details class="rival"><summary>${sun(i, 28)}<span><b>${esc(o.name)}</b>, ${esc(p.title)}<small>${o.fallen ? 'fallen' : `${o.souls} souls · Faith ${whole(o.faith)} · ${esc(RANKS[o.rank].title)}`}</small></span></summary>
      <p class="small">${o.fallen ? 'Absorbed. Her people have gone back to being Unbothered.' : `${Object.keys(o.works).length} Works · ${o.saints.length} Saints · ${o.artifacts.length} holy objects · ${o.prayers.length} of her people waiting on her${o.missionaryOut ? ' · her missionary is recovering' : ''}.`}</p>
      ${o.tablets.length ? [...o.tablets].reverse().map((t) => `<p class="serif small">${esc(t.title)}: ${esc(renderVerse(t.verse))}</p>`).join('') : '<p class="empty small">She has carved nothing yet.</p>'}</details>`; }).join('')}
    <h2>Your standing</h2>
    <ol class="ladder">${RANKS.map((r, i) => `<li class="${i <= g.rank ? 'up' : ''}">${esc(r.title)}${r.souls && i > g.rank ? ` · ${Math.ceil(r.souls * T.unit)} souls, ${Math.ceil(r.faith * T.scale)} Faith${r.leads ? ', the most souls of any god' : ''}` : ''}${r.unlocks && i > g.rank ? ` · opens ${r.unlocks.map((k) => GRAND[k].label).join(', ')}` : ''}</li>`).join('')}</ol>
    <details class="card"><summary>The Review after season ${state.match.seasons}</summary>
      <table class="review">${stand.map((x) => `<tr><td>${x.label}</td><td>${x.need}</td><td class="${x.ok ? 'up' : 'down'}">${whole(x.have)}</td></tr>`).join('')}</table>
      <p class="hint">Pass every line and you are promoted to the High Pantheon. Or outlast every rival: a god under ${T.fallBelow} souls for ${CONFIG.fallSeasons} seasons falls.</p></details>
    ${g.exasperation ? `<p class="hint">You have put your head in your hands ${g.exasperation} time${g.exasperation > 1 ? 's' : ''}.</p>` : ''}`;
}

function villageRow(vi) {
  const v = village(vi), g = me();
  const size = v.unbothered + v.held.reduce((a, b) => a + b, 0);
  return `<div class="vrow"><canvas class="split" data-sprite="split" data-region="${vi}" width="${size * 3 + 1}" height="6" style="aspect-ratio:${size * 3 + 1}/6"></canvas>
    <small><b>${esc(v.name)}</b>: ${v.held[0]} yours · ${v.unbothered} unbothered${rivals().filter((i) => v.held[i] > 0).map((i) => ` · ${v.held[i]} ${esc(state.gods[i].name)}'s`).join('')}${g.field === vi ? ' · <b>your missionary works here</b>' : ''}</small></div>`;
}

// ---- menu --------------------------------------------------------------------------

function menuTab() {
  return `<h2>Menu</h2><p class="hint">${esc(state.match.label)}${state.match.measured ? '' : ' · lightly measured'}${state.match.guided ? ' · guided' : ''}</p><div class="stack">
    <button data-act="how">How it works</button>
    <button data-act="export">Copy a save code</button>
    <button data-act="load-code">Load a save code</button>
    <button data-act="quit">Back to the title</button>
  </div>
  <p class="hint">Saves live in this browser on this device. A save code moves a game anywhere. Nothing you read in a playthrough is shown to you twice.</p>`;
}

const HOW = `<h2>How it works</h2>
  <p>You cannot speak to anyone directly. Each season you do one thing, and your followers carry it out in their own way.</p>
  <p><b>Revelations</b> pass from your Prophet down a chain, one person from each household. Each person's trait changes the words. What reaches the end is carved and does what it now says, every season, in the households it passed through.</p>
  <p><b>Offices</b>: who preaches, converts, collects, builds and witnesses decides how each is done. The laziest preacher is often the best one.</p>
  <p><b>Miracles</b> are as good as the account of them. Post a Witness first.</p>
  <p><b>Rank</b> rises with souls and Faith, and opens the rare acts.</p>
  <p><b>The Registry</b> checks your Faith every year against a line that rises. Two years under it and you are archived. It also asks small things of you, and pays for them.</p>
  <p><b>Winning</b>: pass the Review after the last season, or outlast every rival.</p>
  <button class="primary" data-act="close">Close</button>`;

// ---- sheets ------------------------------------------------------------------------

function sheetHtml() {
  // A waiting scene comes before everything else, and cannot be dismissed.
  if (!sheet && state && !state.over && state.scenes && state.scenes.length) return `<div class="scrim"><div class="sheet">${sceneHtml()}</div></div>`;
  if (!sheet) return '';
  const kinds = { reveal: revealHtml, miracle: miracleHtml, answer: answerHtml, dream: dreamHtml, simple: simpleHtml, target: targetHtml, pick: pickHtml, assign: assignHtml, book: bookHtml, villageSheet: villageSheetHtml, report: () => reportHtml(sheet.record), text: () => sheet.html };
  return `<div class="scrim"><div class="sheet">${kinds[sheet.kind]()}</div></div>`;
}
const footer = (go) => `<div class="row"><button data-act="close">Not now</button>${go}</div>`;

function rulingHtml() {
  const f = who(state.event.by);
  return `<div class="caps">A problem, brought to you</div>
    <div class="petition">${f ? sprite(f, 36) : ''}<p class="serif">${esc(state.event.text)}</p></div>
    <div class="stack">${rulingOptions(state).map((o) => `<button data-ruling="${o.i}" ${o.ok ? '' : 'disabled'}><b>${esc(o.label)}</b><small>${esc(o.ok ? effectsText(o.effects) || 'No great matter either way' : o.why)}</small></button>`).join('')}</div>
    <p class="hint">Settling it costs no act.</p>`;
}

const SIMPLE = {
  silent:   { title: 'Silence', text: 'Say nothing this season. People wonder: Mystery rises, and they stop expecting favours. They also wonder whether anyone is there.' },
  festival: { title: 'A festival', text: 'A day in your honour in the Feast Hall. Devotion rises and the curious may come over.' },
  dispute:  { title: 'A disputation', text: 'Your Prophet argues with a rival’s in the market. Whoever’s Scripture holds together wins a soul from the other. Once a year.' },
  poach:    { title: 'Answer their neglected', text: 'Somebody has been praying to another god for three seasons with no reply. You could answer instead, and they would be yours.' },
  artifact: { title: GRAND.artifact.label, text: GRAND.artifact.does },
  wonder:   { title: GRAND.wonder.label, text: GRAND.wonder.does },
};
function simpleHtml() {
  const id = sheet.id;
  const many = living(state).length > 2 && (id === 'dispute' || id === 'poach');
  const spec = SIMPLE[id];
  if (many) return `<div class="sheet-head">${ico(id, 28)}<b>${spec.title}</b></div><p>${spec.text}</p>${targetList(id)}${footer('')}`;
  const why = GRAND[id] ? grandOpen(state, 0, id) : null;
  const p = GRAND[id] ? { ok: !why, why } : preview(state, 0, { kind: id });
  const cost = GRAND[id] ? costText(GRAND[id].cost) : id === 'silent' ? 'Free' : id === 'festival' ? '4 Offerings' : id === 'dispute' ? '2 Power' : '3 Power';
  return `<div class="sheet-head">${ico(id, 28)}<b>${spec.title}</b></div><p>${spec.text}</p>
    <p class="hint">${cost}.${id === 'dispute' && p.ok ? ` Your Scripture ${p.mine} against ${esc(state.gods[p.target].name)}’s ${p.hers}.` : ''}</p>
    ${p.ok ? '' : `<p class="down">${esc(p.why)}</p>`}
    ${footer(`<button class="primary" data-action="${id}" ${p.ok ? '' : 'disabled'}>${id === 'silent' ? 'Say nothing' : 'Do it'}</button>`)}`;
}

function targetList(kind, miracle) {
  return `<div class="stack">${living(state).filter((i) => i > 0).map((i) => {
    const act = { kind, miracle, target: i };
    const p = preview(state, 0, act);
    const o = state.gods[i];
    return `<button class="choice" data-action="${kind}" ${miracle ? `data-miracle="${miracle}"` : ''} data-target="${i}" ${p.ok ? '' : 'disabled'}>${sun(i, 24)}<span><b>${esc(o.name)}</b> · ${o.souls} souls<small>${esc(p.ok ? (kind === 'dispute' ? `Your Scripture ${p.mine} against hers ${p.hers}` : persona(o).title) : p.why)}</small></span></button>`;
  }).join('')}</div>`;
}
function targetHtml() { return `<div class="sheet-head">${ico('miracle', 28)}<b>Smite whose missionary?</b></div>${targetList('miracle', 'smite')}${footer('')}`; }

function pickHtml() {
  const g = me(), kind = sheet.grand;
  const why = grandOpen(state, 0, kind);
  const list = g.flock.filter((f) => (kind === 'canonize' ? !f.saint : true));
  return `<div class="sheet-head">${ico(kind, 28)}<b>${GRAND[kind].label}</b></div><p>${GRAND[kind].does}</p><p class="hint">${costText(GRAND[kind].cost)}.</p>
    ${why ? `<p class="down">${esc(why)}</p>` : `<div class="stack">${list.map((f) => `<button class="choice" data-action="${kind}" data-id="${f.id}">${sprite(f, 26)}<span><b>${esc(fullName(f))}</b> ${esc(f.trade.label)}<small>${esc(traitLabel(f))}${kind === 'canonize' && f.known ? ` · as a Saint: ${SAINT_VIRTUE[f.traits[0]].label}` : ''}</small></span></button>`).join('')}</div>`}
    ${footer('')}`;
}

function assignHtml() {
  const g = me(), office = sheet.office;
  const cur = posted(g, office);
  return `<div class="sheet-head">${ico(office, 28)}<b>${OFFICES[office].label}</b></div><p class="hint">${OFFICES[office].does} Choose who holds it. A newcomer spends a season settling in.</p>
    <div class="stack">${g.flock.map((f) => {
      const here = f.known ? officeText(office, f.traits[0]) : 'Not known yet. A season here will show what they are like.';
      return `<button class="choice ${cur === f ? 'on' : ''}" data-assign="${f.id}">${sprite(f, 26)}<span><b>${esc(fullName(f))}</b> ${esc(f.trade.label)}${f.known ? ` · ${TRAITS[f.traits[0]].label}` : ''}${f.office && f.office !== office ? ` <small class="tag">now ${OFFICES[f.office].label}</small>` : ''}<small>${esc(here)}</small></span></button>`;
    }).join('')}
    ${cur ? '<button data-assign="">Leave it vacant</button>' : ''}</div>${footer('')}`;
}

function villageSheetHtml() {
  const vi = sheet.village, v = village(vi), g = me();
  const away = v.region !== village(g.field).region;
  return `<div class="sheet-head">${ico('missionary', 28)}<b>${esc(v.name)}</b></div>
    <p class="hint">${esc(state.regions[v.region].name)}</p>${villageRow(vi)}
    ${g.field === vi ? '<p>Your missionary works here.</p>' : `<p>${v.unbothered ? `${v.unbothered} here belong to nobody yet.` : 'Nobody here is unclaimed: your missionary would have to win people from the other gods, which is half as easy.'}${away ? ` It is in another region: your missionary will spend ${TRAVEL_SEASONS} season on the road.` : ''}</p>`}
    ${footer(g.field === vi ? '' : `<button class="primary" data-field="${vi}">Send your missionary here</button>`)}`;
}

function revealHtml() {
  const g = me();
  const t = TEMPLATES.find((x) => x.id === draft.template);
  const prophet = holder(g, 'prophet');
  const act = { kind: 'reveal', template: draft.template, object: draft.object, tail: draft.tail, chain: draft.chain };
  const p = preview(state, 0, act);
  const said = renderVerse(makeRevelation(t.id, draft.object, draft.tail));
  const house = (h) => {
    const locked = prophet && prophet.household === h;
    const people = locked ? [prophet] : g.flock.filter((f) => f.household === h);
    const left = !draft.chain.some((id) => g.flock.find((x) => x.id === id).household === h);
    return `<div class="house"><span class="caps">${locked ? 'Prophet' : `Household ${h + 1}`}</span><div class="faces">
      ${people.map((f) => { const on = draft.chain.includes(f.id); return `<button class="face ${on ? 'on' : ''}" data-chain="${h}:${f.id}" ${locked ? 'disabled' : ''}>${sprite(f, 22)}<small>${esc(f.name)}<i>${f.known ? TRAITS[f.traits[0]].label : '?'}</i></small></button>`; }).join('')}
      ${locked ? '' : `<button class="face skip ${left ? 'on' : ''}" data-chain="${h}:"><small>Leave out</small></button>`}</div></div>`;
  };
  const chips = (key, ids) => `<div class="chips">${ids.map((id) => `<button class="chip ${draft[key] === id ? 'on' : ''}" data-draft="${key}:${id}">${esc(PHRASES[id].text)}</button>`).join('')}</div>`;
  const known = draft.chain.map((id) => g.flock.find((f) => f.id === id)).filter((f) => f.known);
  return `<div class="sheet-head">${ico('reveal', 28)}<b>A Revelation</b></div>
    <div class="caps step-label">1 · What about</div>
    <div class="chips">${TEMPLATES.map((x) => `<button class="chip ${x.id === draft.template ? 'on' : ''}" data-template="${x.id}">${x.problem}</button>`).join('')}</div>
    <div class="caps step-label">2 · Your words</div>
    ${t.objects.length ? chips('object', t.objects) : ''}${chips('tail', t.tails)}
    <p class="said serif">“${esc(said)}”</p>
    <div class="caps step-label">3 · Who carries it, in order</div>
    <p class="hint">Only the households it passes through will hear it. Each person changes it their own way.${!prophet && posted(g, 'prophet') ? ` ${esc(posted(g, 'prophet').name)} is settling in as Prophet and starts next season.` : ''}</p>
    ${[0, 1, 2, 3].sort((a, b) => (prophet && a === prophet.household ? -1 : prophet && b === prophet.household ? 1 : a - b)).map(house).join('')}
    ${known.length ? `<p class="hint">${known.map((f) => `${esc(f.name)}: ${esc(TRAITS[f.traits[0]].tends)}`).join(' ')}</p>` : ''}
    <p class="hint">${p.ok ? `${p.cost} Power · heard by ${p.households} of 4 households.` : esc(p.why)}</p>
    ${footer(`<button class="primary" data-action="reveal" ${p.ok ? '' : 'disabled'}>Send it</button>`)}`;
}

function miracleHtml() {
  const g = me();
  const wit = holder(g, 'witness');
  return `<div class="sheet-head">${ico('miracle', 28)}<b>A miracle</b></div>
    <p class="hint">${wit ? `${esc(wit.name)}${wit.known ? `, a ${TRAITS[wit.traits[0]].label},` : ''} will tell people what happened.` : '<b class="down">Nobody is posted as Witness.</b> People will put it down to the weather.'} A miracle the village has seen before is worth less.</p>
    <div class="stack">${Object.entries(MIRACLES).filter(([id]) => isOpen(state, id === 'smite' ? 'act:smite' : 'act:miracle')).map(([id, m]) => {
      const many = id === 'smite' && living(state).length > 2;
      const p = preview(state, 0, { kind: 'miracle', miracle: id });
      const seen = g.seen[id] || 0;
      return `<button class="choice" ${many ? 'data-act="target-smite"' : `data-action="miracle" data-miracle="${id}"`} ${p.ok || many ? '' : 'disabled'}>${ico('miracle', 22)}<span><b>${m.label}</b> · ${CONFIG.costs[id]} Power<small>${esc(p.ok || many ? `${m.does}${seen ? ` Seen ${seen} time${seen > 1 ? 's' : ''} before.` : ''}` : p.why)}</small></span></button>`;
    }).join('')}</div>${footer('')}`;
}

function answerHtml() {
  const g = me();
  return `<div class="sheet-head">${ico('answer', 28)}<b>Prayers</b></div><p class="hint">1 Power. Faith and devotion rise; they expect a little more next time.</p>
    <div class="stack">${g.prayers.map((p) => {
      const f = who(p.by);
      return `<button class="choice" data-action="answer" data-prayer="${p.id}">${f ? sprite(f, 26) : ''}<span><b>${esc(f?.name)}</b> · waiting ${state.season - p.season} season${state.season - p.season === 1 ? '' : 's'}<small>${esc((f && wantText(f)) || `${f?.name} is praying.`)}</small></span></button>`;
    }).join('') || '<p class="empty">Nobody is praying to you just now.</p>'}</div>
    <p class="hint">A prayer ignored for ${CONFIG.neglectedAfter} seasons can be answered by another god.</p>${footer('')}`;
}

function dreamHtml() {
  const g = me();
  return `<div class="sheet-head">${ico('dream', 28)}<b>A dream</b></div><p class="hint">1 Power. Visit one person in their sleep; afterwards you know what they are like.</p>
    <div class="stack">${g.flock.filter((f) => !f.known).map((f) => `<button class="choice" data-action="dream" data-id="${f.id}">${sprite(f, 26)}<span><b>${esc(f.name)}</b> ${esc(f.trade.label)}${f.office ? `<small>${OFFICES[f.office].label}</small>` : ''}</span></button>`).join('')}</div>${footer('')}`;
}

// ---- scenes -----------------------------------------------------------------------

const portrait = (who_) => {
  if (who_ === 'you') return '<canvas data-sprite="you" width="16" height="15" style="width:44px;height:41px"></canvas>';
  if (who_ === 'pim') return '<canvas data-sprite="pim" width="16" height="15" style="width:44px;height:41px"></canvas>';
  if (who_ === 'vellamine') return sun(1, 44);
  const f = me().flock.find((x) => x.cast === who_);
  return f ? sprite(f, 40) : '';
};
function sceneHtml() {
  const sc = currentScene(state);
  return `<div class="scene"><div class="portraits">${sc.who.map(portrait).join('')}</div>
    <h2 class="scene-title">${esc(sc.title)}</h2>
    ${sc.pages.map((p) => `<p class="serif">${esc(p)}</p>`).join('')}
    <div class="stack">${sc.choices.map((c) => `<button class="choice" data-scene="${c.id}"><span><b>${esc(c.label)}</b>${c.note ? `<small>${esc(c.note)}</small>` : ''}</span></button>`).join('')}</div></div>`;
}

// ---- the season's report ------------------------------------------------------------

// A Revelation's result in three lines: what you said, what was carved, what
// came of it. How it got that way is one tap away, in plain sentences.
function revealBlock(r) {
  const g = me();
  const t = [...g.tablets, ...g.apocrypha].find((x) => x.id === r.me.act.tablet);
  const changed = t.steps.filter((st) => st.note);
  return `<div class="reveal">
    <p class="said-line"><span class="caps">You said</span> <span class="serif">${esc(t.said)}</span></p>
    <article class="tablet carved"><div class="caps">Carved: ${esc(t.title)}</div><div class="verse">${esc(renderVerse(t.verse))}</div>${t.after ? `<div class="by">${esc(t.after)}</div>` : ''}<div class="counts">${esc(tabletCounts(g, t).text)}</div></article>
    ${r.facepalm ? `<p class="facepalm"><canvas data-sprite="facepalm" width="16" height="15" style="width:40px;height:37px"></canvas> ${esc(r.headdesk || 'You put your head in your hands again.')}</p>` : ''}
    <details><summary>How it got that way</summary>${changed.length ? changed.map((st) => `<p class="by">${esc(who(st.by).name)} (${TRAITS[st.trait].label}) ${esc(st.note)}.</p>`).join('') : '<p class="by">Nobody changed a word, which worries Pim.</p>'}</details></div>`;
}

function reportHtml(r) {
  const g = me();
  const a = r.me.act;
  const tgt = a.target !== null && a.target !== undefined ? state.gods[a.target] : null;
  const news = [];
  if (r.ruling && r.ruling.after) news.push(esc(r.ruling.after));
  if (a.kind === 'miracle') { const L = g.legends.find((x) => x.id === a.legend); news.push(`<b>${MIRACLES[a.miracle].label}${a.miracle === 'smite' && tgt ? ` on ${esc(tgt.name)}'s missionary` : ''}.</b> ${L && L.text ? esc(L.text) : a.reported !== a.miracle ? `It was reported as a ${MIRACLES[a.reported].label.toLowerCase()}.` : L ? '' : 'Nobody was posted to witness it.'}${a.stale ? ' The village had seen this before.' : ''}`); }
  else if (a.kind === 'answer') news.push(esc(a.text || 'You answered a prayer.'));
  else if (a.kind === 'dream') { const f = who(a.id); news.push(`You visited ${esc(f.name)} in a dream. ${esc(f.name)} is ${esc(traitLabel(f))}.`); }
  else if (a.kind === 'dispute') news.push(`Disputation with ${esc(tgt?.name)}: your Scripture ${a.mine}, hers ${a.hers}. ${a.won ? 'The crowd followed you.' : a.lost ? 'The crowd followed her.' : 'Nobody moved.'}`);
  else if (a.kind === 'festival') news.push('You held a festival.');
  else if (a.kind === 'poach') news.push(`You answered a prayer ${esc(tgt?.name)} had ignored. They are yours now.`);
  else if (a.kind === 'silent') news.push('You said nothing.');
  else if (a.kind === 'anoint') news.push(`<b>${esc(who(a.id).name)} is your High Prophet.</b> They have taken it well, and loudly.`);
  else if (a.kind === 'artifact') { const art = g.artifacts[g.artifacts.length - 1]; news.push(a.none ? 'You blessed the village. Nothing in particular has been decided about it.' : `<b>${esc(art.name.charAt(0).toUpperCase() + art.name.slice(1))}.</b> ${esc(art.how)} <small>${esc(art.does)}.</small>`); }
  else if (a.kind === 'wonder') { const L = g.legends.find((x) => x.id === a.legend); news.push(`<b>A Wonder.</b> ${esc(L && L.text ? L.text : 'Something happened that nobody will stop talking about.')}`); }
  else if (a.kind === 'canonize') news.push(esc(a.text || `Saint ${who(a.id).name}.`));
  if (r.facepalm && a.kind !== 'reveal') news.push(`<span class="facepalm"><canvas data-sprite="facepalm" width="16" height="15" style="width:32px;height:30px"></canvas> ${esc(r.headdesk || 'You put your head in your hands again.')}</span>`);
  for (const o of r.me.offices || []) {
    if (o.text) news.push(`<span class="incident">${esc(o.text)}</span>`);
    if (o.done) news.push(`<b>${WORKS[o.done].label} finished.</b> ${WORKS[o.done].does}`);
    if (o.misquoted) news.push(`${esc(who(o.by).name)} misquoted a Tablet from the pulpit. It now reads: “${esc(o.now)}”`);
    if (o.defected) news.push(`${esc(who(o.by).name)}, your missionary, has gone over to the other side.`);
    if (o.road !== undefined) news.push(`Your missionary is on the road to ${esc(village(o.road).name)}.`);
  }
  if (r.me.schism) news.push(`<b class="down">A schism: ${r.me.schism} left over a point of doctrine.</b>`);
  for (const i of r.fell || []) news.push(`<b>${esc(state.gods[i].name)} has fallen.</b> Her people are Unbothered again.`);
  if (r.registry) news.push(`<span class="${r.registry.strikes ? 'down' : ''}">Year ${r.registry.year} end: the Registry wanted ${r.registry.min} Faith and found ${whole(r.registry.faith)}.${r.registry.strikes ? ' A notice of concern.' : ''}</span>`);
  if (r.rankUp) news.push(`<b>You are now a ${esc(RANKS[r.rankUp].title)}.</b> ${RANKS[r.rankUp].unlocks ? ` Opens: ${RANKS[r.rankUp].unlocks.map((k) => GRAND[k].label).join(', ')}.` : ''}`);
  if (r.book) news.push(`<b>${esc(state.book.title)}</b> has been compiled. ${esc(state.book.compiled)} <button class="small-btn" data-act="read-book">Read it</button>`);
  const d = (m) => Object.values(r.account[m] || {}).reduce((x, y) => x + y, 0);
  const fig = (label, v, int) => `<span class="${v > 0.05 ? 'up' : v < -0.05 ? 'down' : ''}">${label} ${int ? `${v >= 0 ? '+' : '−'}${Math.abs(v)}` : signed(v) || '±0'}</span>`;
  return `<div class="caps">${esc(seasonName(r.season))}</div>
    ${a.kind === 'reveal' ? revealBlock(r) : ''}
    <div class="figures">${fig('Souls', r.souls.me, true)}${fig('Faith', r.faith)}${fig('Power', d('power'))}${fig('Mystery', d('mystery'))}</div>
    <ul class="news">${news.map((n) => `<li>${n}</li>`).join('')}</ul>
    ${r.memo ? memoCard(r.memo, r) : ''}
    ${r.line ? `<p class="rival-line">${sun(r.line.by)} ${esc(r.line.text)}</p>` : ''}
    <button class="primary wide-btn" data-act="close">${state.over ? 'To the Review' : 'Next season'}</button>`;
}

function endingHtml() {
  const g = me();
  const o = OUTCOMES[state.outcome];
  const last = state.chronicle[state.chronicle.length - 1];
  const label = state.outcome === 'rival_fell' && state.gods.length > 2 ? 'Every rival fell' : o.label;
  const fc = finalChoice(state);
  const ft = finalText(state);
  const worst = worstVerse(g);
  const nx = nextChapter(state);
  return `<div class="ending">
    <div class="caps">${esc(seasonName(last.season))} · ${o.win ? 'a win' : 'a loss'} · ${esc(RANKS[g.rank].title)}</div>
    <h2>${esc(label)}</h2>
    ${epilogue(state).map((p, i) => `<p class="${i ? '' : 'serif lead'}">${esc(p)}</p>`).join('')}
    ${fc ? `<div class="card"><p class="serif">${esc(fc.prompt)}</p><div class="stack">${fc.options.map((x) => `<button class="choice" data-ending="${x.id}"><b>${esc(x.label)}</b></button>`).join('')}</div></div>` : ''}
    ${ft ? `<p class="serif lead">${esc(ft)}</p>` : ''}
    ${worst ? `<p class="hint">The verse that did the most harm: ${esc(worst.tablet.title)}${worst.by ? `, mostly the doing of ${esc(worst.by.name)}` : ''}. You put your head in your hands ${g.exasperation} time${g.exasperation === 1 ? '' : 's'}.</p>` : ''}
    ${state.book ? `<button class="book-cover" data-act="read-book"><span class="caps">${esc(state.book.title)}</span><small>What they believe happened.</small></button>` : ''}
    <div class="stack"><button data-act="copy-scripture">Copy your Scripture as text</button>${nx && !fc ? `<button class="primary" data-act="next-chapter">Begin ${esc(nx.label)}</button><button data-act="new">Play again</button>` : '<button class="primary" data-act="new">Play again</button>'}</div></div>`;
}

function scriptureText() {
  const g = me();
  if (state.book) {
    const b = state.book;
    return [b.title, '', b.preface, '', ...(b.sections || []).flatMap((sec, k) => [`${k + 1}. ${sec.heading}`, '', ...sec.passages, '', ...(sec.chapters ? b.chapters.map((c) => `${c.title}\n${renderVerse(c.verse)}\n(You said: ${c.said})\n`) : [])])].join('\n');
  }
  return [`The Scripture of ${g.name}`, '', ...[...g.apocrypha, ...g.tablets].map((t) => `${t.title.replace(/^the/, 'The')}\n${renderVerse(t.verse)}\n`)].join('\n');
}

// ---- input ---------------------------------------------------------------------------

function startDraft() {
  const g = me();
  const t = TEMPLATES[0];
  const prophet = holder(g, 'prophet');
  draft = { template: t.id, object: t.objects[0] ?? null, tail: t.tails[0], chain: prophet ? [prophet.id] : [g.flock[0].id] };
}

function act(input) {
  const { state: next, record } = advance(state, { act: input });
  state = next; draft = null; save();
  sheet = { kind: 'report', record };
}

function onClick(e) {
  const t = e.target.closest('[data-act],[data-tab],[data-action],[data-ruling],[data-template],[data-chain],[data-setmode],[data-chapter],[data-field],[data-assign],[data-draft],[data-scene],[data-ending]');
  if (!t || busy || t.disabled) return;
  busy = true;
  try {
    const d = t.dataset;
    if (d.scene) { state = chooseScene(state, d.scene); save(); sheet = state.sceneAfter ? { kind: 'text', html: `<p class="serif">${esc(state.sceneAfter)}</p><button class="primary" data-act="close">Continue</button>` } : null; }
    else if (d.ending) { state = chooseEnding(state, d.ending); save(); }
    else if (d.tab) { tab = d.tab; sheet = null; }
    else if (d.setmode) { setup.name = document.getElementById('godname')?.value || setup.name; setup.mode = d.setmode; }
    else if (d.chapter) { setup.name = document.getElementById('godname')?.value || setup.name; setup.chapter = d.chapter; }
    else if (d.field !== undefined) { state = sendMissionary(state, Number(d.field)); save(); sheet = null; }
    else if (d.assign !== undefined) { state = post(state, sheet.office, d.assign || null); save(); sheet = null; }
    else if (d.draft) { const [k, v] = d.draft.split(':'); draft = { ...draft, [k]: v }; }
    else if (d.ruling !== undefined) { state = ruleOn(state, Number(d.ruling)); save(); sheet = state.ruled && state.ruled.after ? { kind: 'text', html: `<p>${esc(state.ruled.after)}</p><button class="primary" data-act="close">Continue</button>` } : null; }
    else if (d.template) { const x = TEMPLATES.find((y) => y.id === d.template); draft = { ...draft, template: x.id, object: x.objects[0] ?? null, tail: x.tails[0] }; }
    else if (d.chain !== undefined) {
      const [h, id] = d.chain.split(':');
      const g = me();
      const keep = draft.chain.filter((x) => g.flock.find((f) => f.id === x).household !== Number(h));
      if (id) keep.push(id);
      const prophet = holder(g, 'prophet');
      draft.chain = prophet ? [prophet.id, ...keep.filter((x) => x !== prophet.id)] : keep;
    }
    else if (d.action) {
      const a = d.action;
      const target = d.target !== undefined ? Number(d.target) : undefined;
      if (a === 'reveal') act({ kind: 'reveal', template: draft.template, object: draft.object, tail: draft.tail, chain: draft.chain });
      else if (a === 'miracle') act({ kind: 'miracle', miracle: d.miracle, target });
      else if (a === 'answer') act({ kind: 'answer', prayer: d.prayer });
      else if (a === 'dream' || a === 'anoint' || a === 'canonize') act({ kind: a, id: d.id });
      else act({ kind: a, target });
    } else {
      const a = d.act;
      if (a === 'new') { setup = { name: state ? me().name : 'the God of Doors That Stick', mode: 'story', chapter: 'ch1', rivals: 2, regions: 2, villages: 2, seasons: 40, wealth: 'standard', guided: true }; state = null; sheet = null; }
      else if (a === 'back') { setup = null; }
      else if (a === 'next-chapter') {
        const L = legacyOf(state), nx = nextChapter(state);
        state = newGame({ seed: (Math.random() * 2 ** 31) >>> 0, name: L.god, mode: 'story', chapter: nx.id, guided: true, legacy: L });
        tab = 'village'; sheet = null; banner = null; seenNote = 0; save();
      }
      else if (a === 'start') {
        const name = (document.getElementById('godname')?.value || '').trim() || 'the God of Doors That Stick';
        state = newGame({ seed: (Math.random() * 2 ** 31) >>> 0, name, ...setup, guided: setup.mode === 'story' ? true : setup.guided, legacy: setup.mode === 'story' ? storedLegacy() : null });
        setup = null; tab = 'village'; sheet = null; banner = null; seenNote = 0; save();
      }
      else if (a === 'continue') { state = load(); tab = 'village'; }
      else if (a === 'close') { sheet = null; }
      else if (a === 'dismiss') { banner = null; }
      else if (a === 'note-ok') { seenNote = state.season; }
      else if (a === 'copy-code') { const t = document.getElementById('codeout'); t?.select(); navigator.clipboard?.writeText(t.value).catch(() => {}); }
      else if (a === 'quit') { state = null; sheet = null; }
      else if (a === 'install') { install?.(); }
      else if (a === 'how') { sheet = { kind: 'text', html: HOW }; }
      else if (a === 'read-book') { sheet = { kind: 'book' }; }
      else if (a === 'open-reveal') { startDraft(); sheet = { kind: 'reveal' }; }
      else if (a === 'open-miracle') { sheet = { kind: 'miracle' }; }
      else if (a === 'open-answer') { sheet = { kind: 'answer' }; }
      else if (a === 'open-dream') { sheet = { kind: 'dream' }; }
      else if (a === 'open-anoint' || a === 'open-canonize') { sheet = { kind: 'pick', grand: a.slice(5) }; }
      else if (a === 'open-village') { sheet = { kind: 'villageSheet', village: Number(d.village) }; }
      else if (a.startsWith('open-')) { sheet = { kind: 'simple', id: a.slice(5) }; }
      else if (a === 'assign') { sheet = { kind: 'assign', office: d.office }; }
      else if (a === 'target-smite') { sheet = { kind: 'target' }; }
      else if (a === 'export') { showCode(); }
      else if (a === 'copy-scripture') { sheet = { kind: 'text', html: `<h2>Your Scripture</h2><textarea readonly rows="12">${esc(scriptureText())}</textarea><button class="primary" data-act="close">Done</button>` }; }
      // An in-page box, not prompt(): some hosts (the artifact viewer, some app
      // views) never show browser dialogs, and the button would silently do nothing.
      else if (a === 'load-code') { sheet = { kind: 'text', html: '<h2>Load a save code</h2><textarea id="savecode" rows="6" placeholder="DVMM1..."></textarea><div class="row"><button data-act="close">Cancel</button><button class="primary" data-act="load-now">Load</button></div>' }; }
      else if (a === 'load-now') {
        const code = (document.getElementById('savecode')?.value || '').trim();
        if (code) loadCode(code);
      }
    }
    render();
  } catch (err) { fail(err); } finally { busy = false; }
}

function onChange(e) {
  const t = e.target;
  if (busy) return;
  busy = true;
  try {
    if (t.dataset.commission !== undefined) { state = commission(state, t.value || null); save(); }
    else if (t.dataset.setup) {
      setup.name = document.getElementById('godname')?.value || setup.name;
      const k = t.dataset.setup;
      setup[k] = k === 'wealth' ? t.value : k === 'guided' ? t.checked : Number(t.value);
    }
    else { busy = false; return; }
    render();
  } catch (err) { fail(err); } finally { busy = false; }
}

// Save codes are made and read asynchronously (compression is a stream).
function showCode() {
  sheet = { kind: 'text', html: '<h2>Save code</h2><p class="hint">Preparing…</p>' };
  toCode(state).then((code) => {
    sheet = { kind: 'text', html: `<h2>Save code</h2><p class="hint">${code.length.toLocaleString()} characters. Copy all of it, from DVMM to the end.</p><textarea id="codeout" readonly rows="6">${esc(code)}</textarea><div class="row"><button data-act="copy-code">Copy</button><button class="primary" data-act="close">Done</button></div>` };
    render();
  }).catch(fail);
}
function loadCode(code) {
  sheet = { kind: 'text', html: '<p class="hint">Reading the code…</p>' };
  fromCode(code).then((s) => { state = s; setup = null; save(); tab = 'village'; sheet = null; render(); })
    .catch((err) => { sheet = null; banner = err.message; render(); });
}

function fail(err) {
  console.error(err);
  sheet = { kind: 'text', html: `<h2>Something went wrong</h2>
    <p>${esc(err?.message || err)}</p>
    <p>Your game was saved before this. If it keeps happening, copy a save code from the Menu and send it: it lets the game be replayed exactly.</p>
    <button class="primary" data-act="close">Close</button>` };
  render();
}

app.addEventListener('click', onClick);
app.addEventListener('change', onChange);
addEventListener('error', (e) => fail(e.error || e.message));
addEventListener('unhandledrejection', (e) => fail(e.reason));

installPrompt((go) => { install = go; if (!state && !setup) title(); });
render();
registerSW({ onUpdate: (reload) => { banner = 'A new version is ready.'; render(); app.querySelector('.banner')?.insertAdjacentHTML('beforeend', ' <button data-act="reload-now">Reload</button>'); app.querySelector('[data-act="reload-now"]')?.addEventListener('click', reload); } });

// For tools/smoke.mjs and tools/check-bundle.mjs: read-only access to the game.
globalThis.__game = { get state() { return state; } };
