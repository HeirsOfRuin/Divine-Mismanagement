// The screens. They read the engine (turn.js, derive.js, world.js) and compute
// nothing about the game themselves.
//
// Patterns every screen keeps (game-building rules):
//  - Empty and locked states say why and what would change them (rule 6).
//  - Saves autosave after every change; a save code moves a game anywhere.
//  - A throw never leaves a dead button: busy is released in finally, and the
//    error sheet offers the save code.

import { newGame, advance, preview, post, commission, sendMissionary, ruleOn, rulingOptions } from '../engine/turn.js';
import { SAVE_KEY, serialize, deserialize, toCode, fromCode } from '../engine/state.js';
import { render as renderVerse } from '../engine/render.js';
import { makeRevelation } from '../engine/telephone.js';
import { holder, posted } from '../engine/offices.js';
import { scriptureSum } from '../engine/scripture.js';
import { grandOpen } from '../engine/acts.js';
import { bookEffects } from '../engine/book.js';
import { seasonName, registryMinimum, nextCheck, reviewStanding, effectsText, tabletCounts, officeText, worstVerse, wantText } from '../engine/derive.js';
import { thresholds, population, leaderAgainst, living } from '../engine/world.js';
import { CONFIG, OUTCOMES } from '../data/config.data.js';
import { OFFICES, OFFICE_IDS, MIRACLES, WORKS, WORK_IDS } from '../data/offices.data.js';
import { STORY, CUSTOM, RIVALS, RANKS, GRAND, SAINT_VIRTUE } from '../data/match.data.js';
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
let pickTarget = null;     // a hostile act waiting for its target

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const r1 = (v) => (Math.round(v * 10) / 10).toString();
const whole = (v) => Math.floor(v + 1e-9).toString();
const signed = (v) => (v > 0.05 ? `+${r1(v)}` : v < -0.05 ? `−${r1(-v)}` : '');
const me = () => state.gods[0];
const rivals = () => state.gods.map((g, i) => i).slice(1);
const lead = () => leaderAgainst(state, 0);
const who = (id) => state.gods.flatMap((g) => g.flock).find((f) => f.id === id);
const persona = (g) => RIVALS.find((p) => p.id === g.persona) || RIVALS[0];
const traitLabel = (f) => (f.known ? f.traits.map((t) => TRAITS[t].label).join(', ') : 'not yet known');
const sprite = (f, size = 32) => `<canvas data-sprite="f" data-id="${f.id}" width="16" height="20" style="width:${size}px;height:${size * 1.25}px"></canvas>`;
const sun = (gi, size = 20) => `<canvas data-sprite="her" data-god="${gi}" width="16" height="16" style="width:${size}px;height:${size}px"></canvas>`;
const costText = (c) => Object.entries(c).map(([m, n]) => `${n} ${m === 'faith' ? 'Faith' : m === 'power' ? 'Power' : 'Offerings'}`).join(' + ');
const fullName = (f) => `${f.saint ? 'Saint ' : ''}${f.name}`;

function save() { if (state) lsSet(SAVE_KEY, serialize(state)); }
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
      <canvas class="diorama" data-sprite="title" width="130" height="66"></canvas>
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
  for (const c of app.querySelectorAll('canvas[data-sprite="title"]')) { c.dataset.sprite = 'village'; }
  if (app.querySelector('canvas[data-sprite="village"]')) paint(app, newGame({ seed: 7 }));
}

function setupScreen() {
  const s = setup;
  const ch = STORY.find((c) => c.id === s.chapter);
  const opt = (key, list, label) => `<label class="field">${label}<select data-setup="${key}">${list.map((v) => `<option value="${v}" ${String(s[key]) === String(v) ? 'selected' : ''}>${v}</option>`).join('')}</select></label>`;
  app.innerHTML = `
    <main class="title">
      <header class="masthead"><h1>A new god</h1><div class="caps">Form 1: Application for Divinity</div></header>
      <label class="field">Your name, as the Registry will file it
        <input id="godname" maxlength="40" value="${esc(s.name)}"></label>
      <div class="chips">
        <button class="chip ${s.mode === 'story' ? 'on' : ''}" data-setmode="story">Story</button>
        <button class="chip ${s.mode === 'custom' ? 'on' : ''}" data-setmode="custom">Custom match</button>
      </div>
      ${s.mode === 'story' ? `
        <div class="stack">${STORY.map((c) => `<button class="${c.id === s.chapter ? 'on chip' : 'chip'} wide-chip" data-chapter="${c.id}"><span><b>${esc(c.label)}</b><small>${c.rivals} rival${c.rivals > 1 ? 's' : ''} · ${c.regions} region${c.regions > 1 ? 's' : ''} · ${c.seasons} seasons${c.measured ? '' : ' · not yet balanced'}</small></span></button>`).join('')}</div>
        <p class="serif intro">${esc(ch.intro)}</p>` : `
        ${opt('rivals', CUSTOM.rivals, 'Rival gods')}
        ${opt('regions', CUSTOM.regions, 'Regions')}
        ${opt('seasons', CUSTOM.seasons, 'Seasons')}
        <label class="field">Your starting resources<select data-setup="wealth">${Object.entries(CUSTOM.wealth).map(([k, w]) => `<option value="${k}" ${s.wealth === k ? 'selected' : ''}>${w.label}</option>`).join('')}</select></label>
        <p class="hint">Rivals, in order: ${RIVALS.slice(0, s.rivals).map((r) => `${esc(r.name)}, ${esc(r.title)}`).join('; ')}.</p>
        <p class="hint">Only one rival, one region, standard resources and 30 seasons is balanced; every other shape scales its thresholds to the size of the world and has not been measured.</p>`}
      <div class="row"><button data-act="back">Back</button><button class="primary" data-act="start">Begin</button></div>
    </main>`;
}

// ---- the frame -------------------------------------------------------------------

function render() {
  if (setup && !state) return setupScreen();
  if (!state) return title();
  const g = me();
  const last = state.chronicle[state.chronicle.length - 1];
  const tabs = [['village', 'Village'], ['flock', 'Flock'], ['scripture', 'Scripture'], ['heavens', 'Heavens'], ['menu', 'Menu']];
  app.innerHTML = `
    <header class="hud">
      <span class="god">${esc(g.name)}</span>
      <span class="turn">${state.over ? 'The Review' : `${seasonName(state.season)} · season ${state.season} of ${state.match.seasons}`} · ${esc(RANKS[g.rank].title)}</span>
    </header>
    ${ledgerRow(g, last)}
    ${banner ? `<p class="banner">${esc(banner)} <button data-act="dismiss">OK</button></p>` : ''}
    <main class="panel">${({ village: villageTab, flock: flockTab, scripture: scriptureTab, heavens: heavensTab, menu: menuTab })[tab]()}</main>
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
  return `<div class="ledger">${cell('faith', 'Faith', whole(g.faith))}${cell('power', 'Power', whole(g.power))}${cell('mystery', 'Mystery', whole(g.mystery))}${cell('offerings', 'Offerings', whole(g.offerings))}${cell('souls', 'Souls', `${g.souls}<small>/${population(state)}</small>`)}</div>`;
}

const regionStrip = (ri) => {
  const r = state.regions[ri];
  const size = r.unbothered + r.held.reduce((a, b) => a + b, 0);
  return `<canvas class="split" data-sprite="split" data-region="${ri}" width="${size * 3 + 1}" height="6" style="aspect-ratio:${size * 3 + 1}/6"></canvas>`;
};

// ---- village ---------------------------------------------------------------------

function villageTab() {
  const g = me();
  const last = state.chronicle[state.chronicle.length - 1];
  if (state.over) return endingHtml();
  const at = nextCheck(state), T = thresholds(state);
  const field = state.regions[g.field];
  return `
    <canvas class="diorama" data-sprite="village" width="130" height="66"></canvas>
    ${regionStrip(g.field)}
    <p class="splitkey"><b>${esc(field.name)}</b>: <span class="k-you">${field.held[0]} yours</span> · <span class="k-u">${field.unbothered} unbothered</span>${rivals().filter((i) => field.held[i] > 0).map((i) => ` · <span style="color:${persona(state.gods[i]).colour}">${field.held[i]} ${esc(state.gods[i].name)}'s</span>`).join('')}${state.regions.length > 1 ? ' <small>(your mission field; change it in Heavens)</small>' : ''}</p>
    <p class="registry">The Registry checks your Faith after season ${at}: it wants ${at >= state.match.seasons ? T.review.faith : registryMinimum(state)}. You have ${whole(g.faith)}.${g.strikes ? ' <b class="down">You were under the line last year. Twice running and you are archived.</b>' : ''}</p>
    ${memoCard(last ? last.memo : null, last)}
    ${last && last.line ? `<p class="rival-line">${sun(last.line.by)} ${esc(last.line.text)}</p>` : ''}
    ${state.event ? `<section class="problem">${rulingHtml()}</section>` : ''}
    <h2>This season: one act</h2>
    ${state.event ? '<p class="hint">Rule on the problem above first. Ruling costs no act.</p>' : ''}
    <div class="acts">${actButtons()}</div>
    <h2>Rare acts · ${esc(RANKS[g.rank].title)}</h2>
    <p class="hint">Each costs a great deal and opens with your rank. ${g.rank < RANKS.length - 1 ? `Next: ${esc(RANKS[g.rank + 1].title)} at ${Math.ceil(RANKS[g.rank + 1].souls * T.unit)} souls and ${Math.ceil(RANKS[g.rank + 1].faith * T.scale)} Faith${RANKS[g.rank + 1].leads ? ', and more souls than any rival' : ''}.` : 'You have reached the top of the ladder.'}</p>
    <div class="acts">${grandButtons()}</div>`;
}

function memoCard(memo, last) {
  const text = memo || (!last ? 'Welcome to the Lower Annex. Post your people to the offices on the Flock page, then choose what to do this season. I will report at the end of it.' : null);
  if (!text) return '';
  return `<div class="memo"><div class="head"><canvas data-sprite="pim" width="16" height="15" style="width:28px;height:26px"></canvas>
    <div><div class="caps">Memo · Office of Minor Deity Affairs</div><div class="mono">${last ? `${esc(seasonName(last.season))} · ` : ''}from Pim, Seraph (3rd class)</div></div></div>
    <p class="mono">${esc(text)}</p></div>`;
}

function actButtons() {
  const g = me();
  const lock = state.event ? { ok: false, why: 'Rule on the problem first.' } : null;
  const b = (attrs, label, sub, p) => `<button ${attrs} ${p && !p.ok ? 'disabled' : ''}><b>${label}</b><small>${esc(p && !p.ok ? p.why : sub)}</small></button>`;
  const wit = holder(g, 'witness');
  const prophet = holder(g, 'prophet');
  const many = living(state).length > 2;
  const hostile = (kind, label, sub) => {
    const p = lock || preview(state, 0, { kind });
    return b(many ? `data-act="target" data-kind="${kind}"` : `data-action="${kind}"`, label, sub(p), p.ok || many ? (lock || { ok: p.ok || many }) : p);
  };
  const anyDream = g.flock.some((f) => !f.known);
  return [
    `<button class="primary wide" data-act="compose-reveal" ${state.event ? 'disabled' : ''}><b>Send a Revelation</b><small>${prophet ? `${esc(fullName(prophet))}${prophet.high ? ', High Prophet,' : ''} hears it first` : 'You have no Prophet; anyone can hear it first'} · 1 Power a link after the first</small></button>`,
    b('data-act="compose-miracle"', 'Work a miracle', wit ? `${wit.name} will report it` : 'Nobody is posted to witness it', lock || { ok: g.power >= 3, why: 'Needs at least 3 Power.' }),
    b('data-act="compose-answer"', 'Answer a prayer', `${g.prayers.length} waiting`, lock || { ok: g.prayers.length > 0 && g.power >= CONFIG.costs.answer, why: g.prayers.length ? 'Needs 1 Power.' : 'Nobody is praying to you just now.' }),
    b('data-act="compose-dream"', 'Send a dream', '1 Power · learn what someone is like', lock || { ok: anyDream && g.power >= 1, why: anyDream ? 'Needs 1 Power.' : 'You know all of them already.' }),
    b('data-action="festival"', 'Hold a festival', `${CONFIG.costs.festival} Offerings · devotion up, maybe a convert`, lock || preview(state, 0, { kind: 'festival' })),
    hostile('dispute', 'Disputation', (p) => (p.ok && !many ? `Your Scripture ${p.mine} against ${state.gods[p.target].name}'s ${p.hers} · one soul to the winner` : 'Your Prophet argues with a rival’s · one soul to the winner')),
    hostile('poach', 'Answer a rival’s prayer', () => 'One she has ignored · 3 Power · one soul'),
    b('data-action="silent"', 'Stay silent', 'Mystery rises; they stop expecting things', lock || { ok: true }),
  ].join('');
}

function grandButtons() {
  const g = me();
  return Object.entries(GRAND).map(([kind, spec]) => {
    const why = state.event ? 'Rule on the problem first.' : grandOpen(state, 0, kind);
    const pick = kind === 'anoint' || kind === 'canonize';
    const extra = kind === 'canonize' ? ` · ${g.saints.length} of ${spec.max}` : '';
    return `<button class="grand" ${pick ? `data-act="compose-${kind}"` : `data-action="${kind}"`} ${why ? 'disabled' : ''}><b>${spec.label}</b><small>${esc(why || `${costText(spec.cost)}${extra}. ${spec.does}`)}</small></button>`;
  }).join('');
}

// ---- flock: the staffing board ------------------------------------------------------

function flockTab() {
  const g = me();
  const rows = OFFICE_IDS.map((office) => {
    const f = posted(g, office);
    const settled = f && f.settling === 0;
    const does = f ? (f.known ? officeText(office, f.traits[0]) : 'not known yet: a season in office will show it') : '';
    return `<div class="post">
      <div class="slot">${f ? sprite(f) : '<span class="empty-slot"></span>'}</div>
      <div class="what"><div class="caps">${OFFICES[office].label}${f && f.high ? ' · High Prophet' : ''}</div><small>${OFFICES[office].does}</small>
        ${f ? `<div class="does">${settled ? '' : '<b>Settling in this season.</b> '}${esc(does)}</div>` : '<div class="does down">Vacant. Nothing happens here until someone is posted.</div>'}</div>
      <select data-post="${office}" aria-label="${OFFICES[office].label}">
        <option value="">Nobody</option>
        ${g.flock.map((x) => `<option value="${x.id}" ${f && f.id === x.id ? 'selected' : ''}>${esc(fullName(x))}${x.known ? ` (${TRAITS[x.traits[0]].label})` : ''}${x.office && x.office !== office ? ` · ${OFFICES[x.office].label}` : ''}</option>`).join('')}
      </select></div>`;
  }).join('');
  const b = g.building;
  const free = WORK_IDS.filter((id) => !g.works[id]);
  const building = `<div class="post"><div class="what"><div class="caps">The Builder is working on</div>
      ${b ? `<div class="does">${WORKS[b.id].label}: ${b.paid ? `${r1(b.progress)} of ${WORKS[b.id].need} seasons of work done` : `waiting for ${WORKS[b.id].cost} Offerings (more or less, by builder)`}. ${WORKS[b.id].does}</div>` : '<div class="does">Nothing. Choose a Work; the Builder pays for it from Offerings.</div>'}
      ${Object.keys(g.works).length ? `<small>Built: ${Object.entries(g.works).map(([id, w]) => `${WORKS[id].label}${w.crooked ? ' (crooked)' : ''}${w.useless ? ' (beautiful, useless)' : ''}`).join(', ')}</small>` : ''}</div>
      <select data-commission aria-label="Commission" ${b && b.paid ? 'disabled' : ''}>
        <option value="">Nothing</option>
        ${free.map((id) => `<option value="${id}" ${b && b.id === id ? 'selected' : ''}>${WORKS[id].label} · ${WORKS[id].cost}</option>`).join('')}
      </select></div>`;
  const people = [0, 1, 2, 3].map((h) => `<div class="household"><div class="caps">Household ${h + 1}</div>${g.flock.filter((f) => f.household === h).map((f) => {
    const w = wantText(f);
    return `<div class="person">${sprite(f, 28)}<div><b>${esc(fullName(f))}</b> ${esc(f.trade.label)}<small>${esc(traitLabel(f))}${f.office ? ` · ${OFFICES[f.office].label}` : ''}${f.saint ? ` · patron of ${esc(f.saint.patron)}` : ''}</small>${w ? `<small class="want">${esc(w)}</small>` : ''}</div></div>`;
  }).join('')}</div>`).join('');
  return `<h2>Postings</h2>
    <p class="hint">Changing a posting costs no act, but the new holder spends a season settling in. A devotee's trait shows once they have held an office, carried a message, or been sent a dream.</p>
    <div class="board">${rows}${building}</div>
    <h2>The flock</h2>${people}`;
}

// ---- scripture ---------------------------------------------------------------------

function tabletHtml(g, t, contra) {
  const c = tabletCounts(g, t);
  const clash = contra.filter((p) => p.includes(t.id)).map((p) => p.find((x) => x !== t.id)).map((id) => g.tablets.find((x) => x.id === id)).filter(Boolean);
  return `<article class="tablet">
    <div class="caps">${esc(t.title)}</div>
    <div class="verse">${esc(renderVerse(t.verse))}</div>
    <div class="counts">Counts for: ${esc(c.text)} · heard by ${c.households} of 4 households</div>
    ${clash.length ? `<div class="clash">Contradicts ${clash.map((x) => esc(x.title)).join(', ')}. Heresy rises every season while both stand.</div>` : ''}
    ${t.after ? `<div class="by">${esc(t.after)}</div>` : ''}
    <details><summary>How it was carved (${esc(seasonName(t.season))})</summary>
      <p class="by">You said: ${esc(t.said)}</p>
      ${t.steps.map((st) => `<p class="by">${esc(who(st.by)?.name)} (${TRAITS[st.trait].label}) ${esc(st.note || 'passed it on unchanged')}.</p>`).join('')}
      ${t.history.map((h) => `<p class="by">Later, ${esc(who(h.by)?.name)} ${esc(h.note)} from the pulpit, and it stuck.</p>`).join('')}
    </details></article>`;
}

function scriptureTab() {
  const g = me();
  const sum = scriptureSum(g);
  const tabs = [...g.tablets].reverse();
  const legends = g.legends.filter((L) => L.left > 0);
  const be = bookEffects(state);
  const all = g.tablets.length + g.apocrypha.length;
  return `${state.book ? `<button class="book-cover" data-act="read-book"><span class="caps">${esc(state.book.title)}</span><small>${state.book.chapters.length} chapters · compiled ${esc(seasonName(state.book.season))} · ${be.good} still do good: Faith +${r1(be.faith)} a season. Read it.</small></button>`
      : `<p class="hint">After season ${18} with six verses carved, the faithful will gather them all into a Book and copy them out once more. You have ${all}.</p>`}
    <h2>The Tablets</h2>
    <p class="hint">Seven Tablets are in force; an eighth retires the oldest to the Apocrypha. ${sum.doctrine} of yours do some good. The Review wants ${thresholds(state).review.doctrine}.</p>
    ${tabs.length ? tabs.map((t) => tabletHtml(g, t, sum.contradictions)).join('') : '<p class="empty">Nothing is carved yet. Send a Revelation from the Village page: what reaches the last person in the chain is carved here for good.</p>'}
    ${g.apocrypha.length ? `<details><summary>The Apocrypha (${g.apocrypha.length})</summary>${g.apocrypha.map((t) => `<p class="serif">${esc(t.title)}: ${esc(renderVerse(t.verse))}</p>`).join('')}</details>` : ''}
    <h2>Saints</h2>
    ${g.saints.length ? g.saints.map((st) => { const f = who(st.id); return `<p>${sprite(f, 24)} <b>Saint ${esc(f.name)}</b>, patron of ${esc(f.saint.patron)}. ${esc(SAINT_VIRTUE[f.traits[0]].label)}; Faith +2 and pilgrims every season.${f.saint.intended !== f.id ? ` <small>You meant ${esc(who(f.saint.intended).name)}.</small>` : ''}</p>`; }).join('') : `<p class="empty">No Saints. Making one opens at the rank of ${RANKS[3].title}.</p>`}
    <h2>Holy objects</h2>
    ${g.artifacts.length ? g.artifacts.map((a) => `<p><b>${esc(a.name.charAt(0).toUpperCase() + a.name.slice(1))}</b>: ${esc(a.does)}. <small>${esc(a.how)}</small></p>`).join('') : `<p class="empty">None. Blessing one opens at the rank of ${RANKS[1].title}.</p>`}
    <h2>Legends being told</h2>
    ${legends.length ? legends.map((L) => `<p>${L.text ? esc(L.text) : L.kind === 'wonder' ? 'A Wonder, as people tell it.' : `A ${MIRACLES[L.kind].label.toLowerCase()}, as ${L.by ? esc(who(L.by)?.name) : 'nobody'} tells it.`} <small>Still told for ${L.left} more season${L.left > 1 ? 's' : ''}.</small></p>`).join('') : '<p class="empty">No legends. A miracle with someone posted as Witness is retold for seasons afterwards; without one it is forgotten at once.</p>'}`;
}

function bookHtml() {
  const b = state.book, g = me();
  const roman = (n) => ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'][n] || String(n);
  return `<div class="book">
    <h2 class="book-title">${esc(b.title)}</h2>
    <p class="serif center">${esc(b.preface)}</p>
    <p class="hint center">${esc(b.compiled)}</p>
    ${b.chapters.map((c, i) => {
      const now = renderVerse(c.verse), carved = renderVerse(c.carved);
      return `<section class="chapter"><div class="caps">${roman(i + 1)}. ${esc(c.title.replace(/^the /, 'The '))}</div>
        <p class="serif verse-text"><span class="vnum">1</span> ${esc(now)}</p>
        <p class="footnote">You said: ${esc(c.said)}${carved !== c.said ? `<br>It was carved: ${esc(carved)}` : ''}${c.notes.length ? `<br>${c.notes.map((n) => `${esc(who(n.by).name)} (${TRAITS[n.trait].label}) ${esc(n.note)}`).join('; ')}.` : '<br>The scribes copied this one faithfully.'}</p></section>`;
    }).join('')}
    <button class="primary" data-act="close">Close the Book</button></div>`;
}

// ---- heavens -----------------------------------------------------------------------

function heavensTab() {
  const g = me();
  const stand = reviewStanding(state, 0);
  const T = thresholds(state);
  return `<h2>Your standing</h2>
    <p><canvas data-sprite="you" width="16" height="15" style="width:32px;height:30px"></canvas> <b>${esc(RANKS[g.rank].title)}</b>. ${g.exasperation ? `You have put your head in your hands ${g.exasperation} time${g.exasperation > 1 ? 's' : ''}.` : ''}</p>
    <ol class="ladder">${RANKS.map((r, i) => `<li class="${i <= g.rank ? 'up' : ''}">${esc(r.title)}${r.souls ? ` · ${Math.ceil(r.souls * T.unit)} souls, ${Math.ceil(r.faith * T.scale)} Faith${r.leads ? ', more souls than any rival' : ''}` : ''}${r.unlocks ? ` · opens: ${r.unlocks.map((k) => GRAND[k].label).join(", ")}` : ''}</li>`).join('')}</ol>
    <h2>The Review</h2>
    <p class="hint">After season ${state.match.seasons} the Registry reviews your file. Pass every line and you are promoted to the High Pantheon. Or outlast every rival: a god under ${T.fallBelow} souls for ${CONFIG.fallSeasons} seasons falls.</p>
    <table class="review">${stand.map((x) => `<tr><td>${x.label}</td><td>${x.need}</td><td class="${x.ok ? 'up' : 'down'}">${whole(x.have)}</td></tr>`).join('')}</table>
    <h2>The regions</h2>
    ${state.regions.map((r, ri) => `<div class="region">${regionStrip(ri)}<p><b>${esc(r.name)}</b>: ${r.held[0]} yours, ${r.unbothered} unbothered${rivals().filter((i) => r.held[i] > 0).map((i) => `, ${r.held[i]} ${esc(state.gods[i].name)}'s`).join('')}.
      ${g.field === ri ? '<b>Your mission field.</b>' : `<button class="small-btn" data-field="${ri}">Send your missionary here</button>`}</p></div>`).join('')}
    <p class="hint">Your missionary, festivals, Saints' pilgrims and miracles bring souls in from your mission field: the Unbothered first, then whichever god holds most there.</p>
    <h2>The other gods</h2>
    ${rivals().map((i) => { const o = state.gods[i], p = persona(o); return `<div class="rival">${sun(i, 40)}<div><b>${esc(o.name)}</b>, ${esc(p.title)}${o.fallen ? ' · <b class="down">fallen</b>' : ''}<br><small>${o.fallen ? 'Absorbed. Her people have gone back to being Unbothered.' : `${o.souls} souls · Faith ${whole(o.faith)} · ${esc(RANKS[o.rank].title)} · ${Object.keys(o.works).length} Works · ${o.saints.length} Saints · ${o.prayers.length} of her people waiting on her${o.missionaryOut ? ` · her missionary is recovering` : ''}`}</small>
      ${o.tablets.length ? `<details><summary>Her Scripture (${o.tablets.length})</summary>${[...o.tablets].reverse().map((t) => `<p class="serif small">${esc(t.title)}: ${esc(renderVerse(t.verse))}</p>`).join('')}</details>` : ''}</div></div>`; }).join('')}
    <h2>Pim's file</h2>
    ${state.chronicle.length ? [...state.chronicle].reverse().slice(0, 12).filter((r) => r.memo).map((r) => `<p class="mono small">${esc(seasonName(r.season))}: ${esc(r.memo)}</p>`).join('') : '<p class="empty">Nothing filed yet.</p>'}`;
}

// ---- menu --------------------------------------------------------------------------

function menuTab() {
  return `<h2>Menu</h2><p class="hint">${esc(state.match.label)}${state.match.measured ? '' : ' · not yet balanced'}</p><div class="stack">
    <button data-act="export">Copy a save code</button>
    <button data-act="load-code">Load a save code</button>
    <button data-act="how">How it works</button>
    <button data-act="quit">Back to the title</button>
  </div>
  <p class="hint">Saves live in this browser on this device. A save code moves a game anywhere. Nothing you read in a playthrough is shown to you twice.</p>`;
}

const HOW = `<h2>How it works</h2>
  <p>You cannot speak to anyone directly. Each season you do one thing, and your followers carry it out in their own way.</p>
  <p><b>Revelations</b> pass from your Prophet down a chain, one person from each household. Each person's trait changes the words. What reaches the end is carved as a Tablet and does what it now says, every season. Only the households it passed through hear it.</p>
  <p><b>Postings</b> are the staffing board. Who preaches, converts, collects, builds and witnesses decides how each is done. The laziest preacher is often the best one.</p>
  <p><b>Miracles</b> are as good as the account of them. Your Witness tells the story, and a good story is retold for seasons. A Poet's telling never goes stale.</p>
  <p><b>Rank</b> rises with your souls and Faith, and opens the rare acts: a High Prophet, holy objects, Wonders, Saints. Each costs a great deal, and Faith you spend is Faith the Registry does not see.</p>
  <p><b>The Book</b>: late in the game the faithful gather every verse you gave them and copy it all out once more. You will want to read it.</p>
  <p><b>Faith</b> is checked by the Registry every year, against a line that rises. Two years under it and you are archived.</p>
  <p><b>Winning</b>: pass the Review after the last season, or outlast every rival.</p>
  <button class="primary" data-act="close">Close</button>`;

// ---- sheets ------------------------------------------------------------------------

function sheetHtml() {
  if (!sheet) return '';
  const body = ({ reveal: revealHtml, miracle: miracleHtml, answer: answerHtml, dream: dreamHtml, target: targetHtml, pick: pickHtml, book: bookHtml, report: () => reportHtml(sheet.record), text: () => sheet.html })[sheet.kind]();
  return `<div class="scrim"><div class="sheet">${body}</div></div>`;
}

function rulingHtml() {
  const f = who(state.event.by);
  return `<div class="caps">${esc(seasonName(state.season))} · a problem</div>
    <div class="petition">${f ? sprite(f, 40) : ''}<p class="serif">${esc(state.event.text)}</p></div>
    <div class="stack">${rulingOptions(state).map((o) => `<button data-ruling="${o.i}" ${o.ok ? '' : 'disabled'}><b>${esc(o.label)}</b><small>${esc(o.ok ? effectsText(o.effects) || 'No great matter either way' : o.why)}</small></button>`).join('')}</div>`;
}

function targetHtml() {
  const kind = sheet.act.kind === 'miracle' ? 'smite' : sheet.act.kind;
  const label = { smite: 'Smite whose missionary?', poach: 'Answer whose neglected follower?', dispute: 'Argue with whom?' }[kind];
  return `<div class="caps">${label}</div><div class="stack">${living(state).filter((i) => i > 0).map((i) => {
    const act = { ...sheet.act, target: i };
    const p = preview(state, 0, act);
    const o = state.gods[i];
    return `<button class="prayer" data-action="${sheet.act.kind}" ${sheet.act.miracle ? `data-miracle="${sheet.act.miracle}"` : ''} data-target="${i}" ${p.ok ? '' : 'disabled'}>${sun(i, 28)}<span><b>${esc(o.name)}</b>, ${o.souls} souls<small>${esc(p.ok ? (kind === 'dispute' ? `Your Scripture ${p.mine} against hers ${p.hers}` : persona(o).title) : p.why)}</small></span></button>`;
  }).join('')}</div><div class="row"><button data-act="close">Not now</button></div>`;
}

function pickHtml() {
  const g = me(), kind = sheet.grand;
  const list = g.flock.filter((f) => (kind === 'canonize' ? !f.saint : true));
  const intro = kind === 'anoint' ? 'Choose your High Prophet. They hear every Revelation first, reach one more household, and their trait works on it twice.' : 'Choose who to make a Saint. The name goes through your Prophet first.';
  return `<div class="caps">${GRAND[kind].label} · ${costText(GRAND[kind].cost)}</div><p class="hint">${intro}</p>
    <div class="stack">${list.map((f) => `<button class="prayer" data-action="${kind}" data-id="${f.id}">${sprite(f, 28)}<span><b>${esc(fullName(f))}</b> ${esc(f.trade.label)}<small>${esc(traitLabel(f))}${kind === 'canonize' && f.known ? ` · as a Saint: ${SAINT_VIRTUE[f.traits[0]].label}` : ''}</small></span></button>`).join('')}</div>
    <div class="row"><button data-act="close">Not now</button></div>`;
}

function revealHtml() {
  const g = me();
  const t = TEMPLATES.find((x) => x.id === draft.template);
  const prophet = holder(g, 'prophet');
  const act = { kind: 'reveal', template: draft.template, object: draft.object, tail: draft.tail, chain: draft.chain };
  const p = preview(state, 0, act);
  const said = renderVerse(makeRevelation(t.id, draft.object, draft.tail));
  const pick = (h) => {
    const people = g.flock.filter((f) => f.household === h);
    const locked = prophet && prophet.household === h;
    return `<div class="house"><div class="caps">Household ${h + 1}${locked ? ` · your ${prophet.high ? 'High ' : ''}Prophet` : ''}</div><div class="people">
      ${(locked ? [prophet] : [null, ...people]).map((f) => {
        const on = f ? draft.chain.includes(f.id) : !draft.chain.some((id) => g.flock.find((x) => x.id === id).household === h);
        return `<button class="chip ${on ? 'on' : ''}" data-chain="${h}:${f ? f.id : ''}" ${locked ? 'disabled' : ''}>${f ? `${sprite(f, 20)}<span>${esc(fullName(f))}<small>${f.known ? esc(TRAITS[f.traits[0]].tends) : 'Trait not known'}</small></span>` : '<span>Leave this household out</span>'}</button>`;
      }).join('')}</div></div>`;
  };
  return `<div class="caps">A Revelation</div>
    <div class="chips">${TEMPLATES.map((x) => `<button class="chip ${x.id === draft.template ? 'on' : ''}" data-template="${x.id}">${x.problem}</button>`).join('')}</div>
    ${t.objects.length ? `<label class="field">About<select data-draft="object">${t.objects.map((id) => `<option value="${id}" ${id === draft.object ? 'selected' : ''}>${esc(PHRASES[id].text)}</option>`).join('')}</select></label>` : ''}
    <label class="field">When, or how<select data-draft="tail">${t.tails.map((id) => `<option value="${id}" ${id === draft.tail ? 'selected' : ''}>${esc(PHRASES[id].text)}</option>`).join('')}</select></label>
    <p class="said serif">“${esc(said)}”</p>
    <p class="hint">Who carries it, in order. Each household it passes through will hear it; the others will not.</p>
    ${[0, 1, 2, 3].sort((a, b) => (prophet && a === prophet.household ? -1 : prophet && b === prophet.household ? 1 : a - b)).map(pick).join('')}
    <p class="hint">${p.ok ? `Costs ${p.cost} Power. Heard by ${p.households} of 4 households.` : esc(p.why)}</p>
    <div class="row"><button data-act="close">Not now</button><button class="primary" data-action="reveal" ${p.ok ? '' : 'disabled'}>Send it</button></div>`;
}

function miracleHtml() {
  const g = me();
  const wit = holder(g, 'witness');
  const many = living(state).length > 2;
  return `<div class="caps">A miracle</div>
    <p class="hint">${wit ? `${esc(wit.name)} is your Witness${wit.known ? ` (${TRAITS[wit.traits[0]].label})` : ''} and will tell people what happened.` : 'Nobody is posted as Witness. People will put it down to the weather.'} A miracle the village has seen before is worth less each time.</p>
    <div class="stack">${Object.entries(MIRACLES).map(([id, m]) => {
      const pick = id === 'smite' && many;
      const p = preview(state, 0, { kind: 'miracle', miracle: id });
      const seen = g.seen[id] || 0;
      return `<button ${pick ? `data-act="target" data-kind="miracle" data-miracle="smite"` : `data-action="miracle" data-miracle="${id}"`} ${p.ok || pick ? '' : 'disabled'}><b>${m.label}</b><small>${esc(p.ok || pick ? `${m.does} ${CONFIG.costs[id]} Power.${seen ? ` Seen ${seen} time${seen > 1 ? 's' : ''} before.` : ''}` : p.why)}</small></button>`;
    }).join('')}</div>
    <div class="row"><button data-act="close">Not now</button></div>`;
}

function answerHtml() {
  const g = me();
  return `<div class="caps">Prayers</div>
    <div class="stack">${g.prayers.map((p) => {
      const f = who(p.by);
      return `<button class="prayer" data-action="answer" data-prayer="${p.id}">${f ? sprite(f, 28) : ''}<span><b>${esc(f?.name)}</b>, ${state.season - p.season} season${state.season - p.season === 1 ? '' : 's'} waiting<small>${esc((f && wantText(f)) || `${f?.name} is praying.`)}</small></span></button>`;
    }).join('') || '<p class="empty">Nobody is praying to you just now.</p>'}</div>
    <p class="hint">Answering costs 1 Power: Faith and devotion up, and they expect a little more next time. A prayer a god ignores for ${CONFIG.neglectedAfter} seasons can be answered by another god instead, and that includes yours.</p>
    <div class="row"><button data-act="close">Not now</button></div>`;
}

function dreamHtml() {
  const g = me();
  return `<div class="caps">A dream</div><p class="hint">Visit one person in their sleep. Afterwards you will know what they are like.</p>
    <div class="stack">${g.flock.filter((f) => !f.known).map((f) => `<button class="prayer" data-action="dream" data-id="${f.id}">${sprite(f, 28)}<span><b>${esc(f.name)}</b> ${esc(f.trade.label)}</span></button>`).join('')}</div>
    <div class="row"><button data-act="close">Not now</button></div>`;
}

function reportHtml(r) {
  const g = me();
  const out = [`<div class="caps">${esc(seasonName(r.season))} · the season's report</div>`];
  if (r.ruling && r.ruling.after) out.push(`<p>${esc(r.ruling.after)}</p>`);
  const a = r.me.act;
  const tgt = a.target !== null && a.target !== undefined ? state.gods[a.target] : null;
  if (a.kind === 'reveal') {
    const t = [...g.tablets, ...g.apocrypha].find((x) => x.id === a.tablet);
    out.push(`<div class="chain"><div class="step"><canvas data-sprite="you" width="16" height="15" style="width:28px;height:26px"></canvas><div><div class="who">You said</div><div class="said serif">${esc(t.said)}</div></div></div>
      ${t.steps.map((st) => { const f = who(st.by); return `<div class="step">${sprite(f, 28)}<div><div class="who">${esc(f.name)} ${esc(f.trade.label)} · ${TRAITS[st.trait].label} · ${esc(st.note || 'passed it on unchanged')}</div><div class="said serif">${esc(st.text)}</div></div></div>`; }).join('')}</div>
      <article class="tablet"><div class="caps">Carved: ${esc(t.title)}</div><div class="verse">${esc(renderVerse(t.verse))}</div>${t.after ? `<div class="by">${esc(t.after)}</div>` : ''}<div class="counts">Counts for: ${esc(tabletCounts(g, t).text)}</div></article>`);
  } else if (a.kind === 'miracle') {
    const L = g.legends.find((x) => x.id === a.legend);
    out.push(`<p><b>${MIRACLES[a.miracle].label}${a.miracle === 'smite' && tgt ? ` on ${esc(tgt.name)}'s missionary` : ''}.</b> ${L && L.text ? esc(L.text) : a.reported !== a.miracle ? `It was reported as a ${MIRACLES[a.reported].label.toLowerCase()}.` : L ? '' : 'Nobody was posted to witness it.'}${a.stale ? ' The village had seen this before.' : ''}</p>`);
  } else if (a.kind === 'answer') out.push(`<p>${esc(a.text || 'You answered a prayer.')}</p>`);
  else if (a.kind === 'dream') { const f = who(a.id); out.push(`<p>You visited ${esc(f.name)} in a dream. ${esc(f.name)} is ${esc(traitLabel(f))}.</p>`); }
  else if (a.kind === 'dispute') out.push(`<p>Disputation with ${esc(tgt?.name)}: your Scripture ${a.mine}, hers ${a.hers}. ${a.won ? 'The crowd followed you.' : a.lost ? 'The crowd followed her.' : 'Nobody moved.'}</p>`);
  else if (a.kind === 'festival') out.push('<p>You held a festival.</p>');
  else if (a.kind === 'poach') out.push(`<p>You answered a prayer ${esc(tgt?.name)} had ignored. They are yours now.</p>`);
  else if (a.kind === 'anoint') { const f = who(a.id); out.push(`<p class="grand-news">${esc(f.name)} is your High Prophet. They have taken it very well, and quite loudly.</p>`); }
  else if (a.kind === 'artifact') { const art = g.artifacts[g.artifacts.length - 1]; out.push(a.none ? '<p>You blessed the village. Nothing in particular has been decided about it.</p>' : `<p class="grand-news"><b>${esc(art.name.charAt(0).toUpperCase() + art.name.slice(1))}.</b> ${esc(art.how)} <small>${esc(art.does)}.</small></p>`); }
  else if (a.kind === 'wonder') { const L = g.legends.find((x) => x.id === a.legend); out.push(`<p class="grand-news"><b>A Wonder.</b> ${esc(L && L.text ? L.text : 'Something happened that nobody will stop talking about.')} ${a.won ? `${a.won} came over.` : ''}</p>`); }
  else if (a.kind === 'canonize') out.push(`<p class="grand-news">${esc(a.text || `Saint ${who(a.id).name}.`)}</p>`);
  if (r.facepalm) out.push(`<p class="facepalm"><canvas data-sprite="facepalm" width="16" height="15" style="width:40px;height:37px"></canvas> ${esc(r.headdesk || 'You put your head in your hands again.')}</p>`);
  for (const o of r.me.offices || []) {
    if (o.text) out.push(`<p class="incident">${esc(o.text)}</p>`);
    if (o.done) out.push(`<p><b>${WORKS[o.done].label} finished.</b> ${WORKS[o.done].does}</p>`);
    if (o.misquoted) out.push(`<p>${esc(who(o.by).name)} misquoted a Tablet from the pulpit. It now reads: “${esc(o.now)}”</p>`);
    if (o.defected) out.push(`<p>${esc(who(o.by).name)}, your missionary, has gone over to the other side.</p>`);
  }
  if (r.me.schism) out.push(`<p class="down">A schism: ${r.me.schism} left over a point of doctrine.</p>`);
  for (const i of r.fell || []) out.push(`<p class="grand-news"><b>${esc(state.gods[i].name)} has fallen.</b> Her people have gone back to being Unbothered, for now.</p>`);
  const theirs = Object.entries(r.souls.rivals).filter(([i]) => !state.gods[i].fallen || (r.fell || []).includes(Number(i))).map(([i, d]) => `${esc(state.gods[i].name)} ${d >= 0 ? '+' : '−'}${Math.abs(d)}`).join(' · ');
  out.push(`<p class="tally">Souls ${r.souls.me >= 0 ? '+' : '−'}${Math.abs(r.souls.me)} · Faith ${signed(r.faith) || '±0'}${theirs ? ` · ${theirs}` : ''}</p>`);
  if (r.registry) out.push(`<p class="${r.registry.strikes ? 'down' : ''}">Year ${r.registry.year} end: the Registry wanted ${r.registry.min} Faith and found ${whole(r.registry.faith)}.</p>`);
  if (r.rankUp) out.push(`<p class="grand-news"><b>You are now a ${esc(RANKS[r.rankUp].title)}.</b> ${esc(r.rankText || '')}${RANKS[r.rankUp].unlocks ? ` Opens: ${RANKS[r.rankUp].unlocks.map((k) => GRAND[k].label.toLowerCase()).join(', ')}.` : ''}</p>`);
  if (r.book) out.push(`<p class="grand-news"><b>${esc(state.book.title)}</b> has been compiled. ${esc(state.book.compiled)} <button class="small-btn" data-act="read-book">Read it</button></p>`);
  if (r.memo) out.push(memoCard(r.memo, r));
  if (r.line) out.push(`<p class="rival-line">${sun(r.line.by)} ${esc(r.line.text)}</p>`);
  out.push(`<button class="primary" data-act="close">${state.over ? 'To the Review' : 'Continue'}</button>`);
  return out.join('');
}

function endingHtml() {
  const g = me();
  const o = OUTCOMES[state.outcome];
  const last = state.chronicle[state.chronicle.length - 1];
  const worst = worstVerse(g);
  const all = [...g.apocrypha, ...g.tablets];
  const label = state.outcome === 'rival_fell' && state.gods.length > 2 ? 'Every rival fell' : o.label;
  return `<div class="ending">
    <div class="caps">${esc(seasonName(last.season))} · ${o.win ? 'a win' : 'a loss'} · ${esc(RANKS[g.rank].title)}</div>
    <h2>${esc(label)}</h2>
    <p class="serif">${esc(last.ending || '')}</p>
    ${worst ? `<p>The verse that did the most harm was ${esc(worst.tablet.title)}: “${esc(renderVerse(worst.tablet.verse))}”${worst.by ? ` Mostly the doing of ${esc(worst.by.name)} ${esc(worst.by.trade.label)}.` : ''}</p>` : ''}
    <p>You put your head in your hands ${g.exasperation} time${g.exasperation === 1 ? '' : 's'}.</p>
    ${state.book ? `<button class="book-cover" data-act="read-book"><span class="caps">${esc(state.book.title)}</span><small>Read the Book your people made of you.</small></button>` : `<h3 class="caps">Your Scripture, as it stood</h3>${all.length ? all.map((t) => `<p class="serif">${esc(t.title)}: ${esc(renderVerse(t.verse))}</p>`).join('') : '<p class="empty">You carved nothing.</p>'}`}
    <div class="stack"><button data-act="copy-scripture">Copy your Scripture as text</button><button class="primary" data-act="new">Play again</button></div></div>`;
}

function scriptureText() {
  const g = me();
  if (state.book) return [state.book.title, '', state.book.preface, '', ...state.book.chapters.map((c, i) => `${i + 1}. ${c.title.replace(/^the/, 'The')}\n${renderVerse(c.verse)}\n(You said: ${c.said})\n`)].join('\n');
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
  const t = e.target.closest('[data-act],[data-tab],[data-action],[data-ruling],[data-template],[data-chain],[data-setmode],[data-chapter],[data-field]');
  if (!t || busy || t.disabled) return;
  busy = true;
  try {
    const d = t.dataset;
    if (d.tab) { tab = d.tab; sheet = null; }
    else if (d.setmode) { setup.name = document.getElementById('godname')?.value || setup.name; setup.mode = d.setmode; }
    else if (d.chapter) { setup.name = document.getElementById('godname')?.value || setup.name; setup.chapter = d.chapter; }
    else if (d.field !== undefined) { state = sendMissionary(state, Number(d.field)); save(); }
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
      if (a === 'new') { setup = { name: state ? me().name : 'the God of Doors That Stick', mode: 'story', chapter: 'ch1', rivals: 2, regions: 2, seasons: 30, wealth: 'standard' }; state = null; sheet = null; }
      else if (a === 'back') { setup = null; }
      else if (a === 'start') {
        const name = (document.getElementById('godname')?.value || '').trim() || 'the God of Doors That Stick';
        state = newGame({ seed: (Math.random() * 2 ** 31) >>> 0, name, ...setup });
        setup = null; tab = 'village'; sheet = null; banner = null; save();
      }
      else if (a === 'continue') { state = load(); tab = 'village'; }
      else if (a === 'close') { sheet = null; }
      else if (a === 'dismiss') { banner = null; }
      else if (a === 'quit') { state = null; sheet = null; }
      else if (a === 'install') { install?.(); }
      else if (a === 'how') { sheet = { kind: 'text', html: HOW }; }
      else if (a === 'read-book') { sheet = { kind: 'book' }; }
      else if (a === 'compose-reveal') { startDraft(); sheet = { kind: 'reveal' }; }
      else if (a === 'compose-miracle') { sheet = { kind: 'miracle' }; }
      else if (a === 'compose-answer') { sheet = { kind: 'answer' }; }
      else if (a === 'compose-dream') { sheet = { kind: 'dream' }; }
      else if (a === 'compose-anoint') { sheet = { kind: 'pick', grand: 'anoint' }; }
      else if (a === 'compose-canonize') { sheet = { kind: 'pick', grand: 'canonize' }; }
      else if (a === 'target') { sheet = { kind: 'target', act: { kind: d.kind, miracle: d.miracle } }; }
      else if (a === 'export') { sheet = { kind: 'text', html: `<h2>Save code</h2><textarea readonly rows="6">${esc(toCode(state))}</textarea><button class="primary" data-act="close">Done</button>` }; }
      else if (a === 'copy-scripture') { sheet = { kind: 'text', html: `<h2>Your Scripture</h2><textarea readonly rows="12">${esc(scriptureText())}</textarea><button class="primary" data-act="close">Done</button>` }; }
      // An in-page box, not prompt(): some hosts (the artifact viewer, some app
      // views) never show browser dialogs, and the button would silently do nothing.
      else if (a === 'load-code') { sheet = { kind: 'text', html: '<h2>Load a save code</h2><textarea id="savecode" rows="6" placeholder="DVMM1..."></textarea><div class="row"><button data-act="close">Cancel</button><button class="primary" data-act="load-now">Load</button></div>' }; }
      else if (a === 'load-now') {
        const code = (document.getElementById('savecode')?.value || '').trim();
        if (code) { try { state = fromCode(code); setup = null; save(); tab = 'village'; sheet = null; } catch (err) { sheet = null; banner = err.message; } }
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
    if (t.dataset.post) { state = post(state, t.dataset.post, t.value || null); save(); }
    else if (t.dataset.commission !== undefined) { state = commission(state, t.value || null); save(); }
    else if (t.dataset.draft) { draft = { ...draft, [t.dataset.draft]: t.value }; }
    else if (t.dataset.setup) { setup.name = document.getElementById('godname')?.value || setup.name; setup[t.dataset.setup] = t.dataset.setup === 'wealth' ? t.value : Number(t.value); }
    else { busy = false; return; }
    render();
  } catch (err) { fail(err); } finally { busy = false; }
}

function fail(err) {
  console.error(err);
  sheet = { kind: 'text', html: `<h2>Something went wrong</h2>
    <p>${esc(err?.message || err)}</p>
    <p>Your game was saved before this. Copy this code somewhere safe, then reload:</p>
    <textarea readonly rows="4">${state ? esc(toCode(state)) : ''}</textarea>
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
