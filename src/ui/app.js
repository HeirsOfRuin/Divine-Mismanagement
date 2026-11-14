// The screens. They read the engine (turn.js, derive.js) and compute nothing
// about the game themselves.
//
// Patterns every screen keeps (game-building rules):
//  - Empty and locked states say why and what would change them (rule 6).
//  - Saves autosave after every change; a save code moves a game anywhere.
//  - A throw never leaves a dead button: busy is released in finally, and the
//    error sheet offers the save code.

import { newGame, advance, preview, post, commission, ruleOn, rulingOptions } from '../engine/turn.js';
import { SAVE_KEY, serialize, deserialize, toCode, fromCode } from '../engine/state.js';
import { render as renderVerse } from '../engine/render.js';
import { makeRevelation } from '../engine/telephone.js';
import { holder, posted } from '../engine/offices.js';
import { scriptureSum } from '../engine/scripture.js';
import { seasonName, registryMinimum, nextCheck, reviewStanding, effectsText, tabletCounts, officeText, worstVerse, doctrineOf, wantText } from '../engine/derive.js';
import { CONFIG, OUTCOMES } from '../data/config.data.js';
import { OFFICES, OFFICE_IDS, MIRACLES, WORKS, WORK_IDS } from '../data/offices.data.js';
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

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const r1 = (v) => (Math.round(v * 10) / 10).toString();
const whole = (v) => Math.floor(v + 1e-9).toString();
const signed = (v) => (v > 0.05 ? `+${r1(v)}` : v < -0.05 ? `−${r1(-v)}` : '');
const me = () => state.gods[0];
const her = () => state.gods[1];
const who = (id) => [...state.gods[0].flock, ...state.gods[1].flock].find((f) => f.id === id);
const traitLabel = (f) => (f.known ? f.traits.map((t) => TRAITS[t].label).join(', ') : 'not yet known');
const sprite = (f, size = 32) => `<canvas data-sprite="f" data-id="${f.id}" width="16" height="20" style="width:${size}px;height:${size * 1.25}px"></canvas>`;

function save() { if (state) lsSet(SAVE_KEY, serialize(state)); }
function load() {
  const raw = lsGet(SAVE_KEY);
  if (!raw) return null;
  try { return deserialize(raw); } catch (e) { banner = `The saved game could not be read (${e.message}).`; return null; }
}

// ---- title -------------------------------------------------------------------------

function title() {
  const saved = load();
  app.innerHTML = `
    <main class="title">
      <header class="masthead"><h1>Divine Mismanagement</h1><div class="caps">Registry of Minor Deities · Lower Annex</div></header>
      <p class="lede serif">You are a minor god with twelve worshippers, and every one of them is an idiot. Grow your faith into a major religion, despite them.</p>
      ${STORAGE_OK ? '' : '<p class="warn">This browser is refusing to store anything for this page, so progress will not be kept. Copy a save code from the menu before you leave.</p>'}
      ${banner ? `<p class="warn">${esc(banner)}</p>` : ''}
      <label class="field">Your name, as the Registry will file it
        <input id="godname" maxlength="40" value="the God of Doors That Stick"></label>
      <div class="stack">
        ${saved && !saved.over ? `<button class="primary" data-act="continue">Continue: ${esc(seasonName(saved.season))}</button>` : ''}
        <button ${saved && !saved.over ? '' : 'class="primary"'} data-act="new">New game</button>
        <button data-act="load-code">Load a save code</button>
        ${install ? '<button data-act="install">Install on this device</button>' : ''}
      </div>
      <p class="hint">One village, thirty-six souls, thirty seasons, and one rival with better hair. Everything you say passes through your followers on the way.</p>
    </main>`;
}

// ---- the frame -------------------------------------------------------------------

function render() {
  if (!state) return title();
  const g = me();
  const last = state.chronicle[state.chronicle.length - 1];
  const tabs = [['village', 'Village'], ['flock', 'Flock'], ['scripture', 'Scripture'], ['heavens', 'Heavens'], ['menu', 'Menu']];
  app.innerHTML = `
    <header class="hud">
      <span class="god">${esc(g.name)}</span>
      <span class="turn">${state.over ? 'The Review' : `${seasonName(state.season)} · season ${state.season} of ${CONFIG.seasons}`}</span>
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
  return `<div class="ledger">${cell('faith', 'Faith', whole(g.faith))}${cell('power', 'Power', whole(g.power))}${cell('mystery', 'Mystery', whole(g.mystery))}${cell('offerings', 'Offerings', whole(g.offerings))}${cell('souls', 'Souls', `${g.souls}<small>/36</small>`)}</div>`;
}

// ---- village ---------------------------------------------------------------------

function villageTab() {
  const g = me();
  const last = state.chronicle[state.chronicle.length - 1];
  if (state.over) return endingHtml();
  const min = registryMinimum(state.season), at = nextCheck(state.season);
  const memo = last ? last.memo : state.chronicle.length === 0 ? null : null;
  const acts = actButtons();
  return `
    <canvas class="diorama" data-sprite="village" width="130" height="66"></canvas>
    <canvas class="split" data-sprite="split" width="109" height="6" aria-label="${g.souls} yours, ${state.unbothered} unbothered, ${her().souls} hers"></canvas>
    <p class="splitkey"><span class="k-you">${g.souls} yours</span> · <span class="k-u">${state.unbothered} unbothered</span> · <span class="k-her">${her().souls} ${esc(her().name)}'s</span></p>
    <p class="registry">The Registry checks your Faith after season ${at}: it wants ${at >= CONFIG.seasons ? CONFIG.review.faith : min}. You have ${whole(g.faith)}.${g.strikes ? ' <b class="down">You were under the line last year. Twice running and you are archived.</b>' : ''}</p>
    ${memoCard(memo, last)}
    ${last && last.her.line ? `<p class="rival-line"><canvas data-sprite="her" width="16" height="16" style="width:20px;height:20px"></canvas> ${esc(last.her.line)}</p>` : ''}
    ${state.event ? `<section class="problem">${rulingHtml()}</section>` : ''}
    <h2>This season: one act</h2>
    ${state.event ? '<p class="hint">Rule on the problem above first. Ruling costs no act.</p>' : ''}
    <div class="acts">${acts}</div>`;
}

function memoCard(memo, last) {
  const text = memo || (!last ? 'Welcome to the Lower Annex. Post your people to the offices on the Flock page, then choose what to do this season. I will report at the end of it.' : null);
  if (!text) return '';
  return `<div class="memo"><div class="head"><canvas data-sprite="pim" width="16" height="15" style="width:28px;height:26px"></canvas>
    <div><div class="caps">Memo · Office of Minor Deity Affairs</div><div class="mono">${last ? `${esc(seasonName(last.season))} · ` : ''}from Pim, Seraph (3rd class)</div></div></div>
    <p class="mono">${esc(text)}</p></div>`;
}

function actButtons() {
  const g = me(), o = her();
  const b = (attrs, label, sub, p) => `<button ${attrs} ${p && !p.ok ? 'disabled' : ''}><b>${label}</b><small>${esc(p && !p.ok ? p.why : sub)}</small></button>`;
  const wit = holder(g, 'witness');
  const prophet = holder(g, 'prophet');
  const poach = preview(state, 0, { kind: 'poach' });
  const dispute = preview(state, 0, { kind: 'dispute' });
  const festival = preview(state, 0, { kind: 'festival' });
  const anyDream = g.flock.some((f) => !f.known);
  return [
    `<button class="primary wide" data-act="compose-reveal" ${state.event ? 'disabled' : ''}><b>Send a Revelation</b><small>${prophet ? `${esc(prophet.name)} hears it first` : 'You have no Prophet; anyone can hear it first'} · 1 Power a link after the first</small></button>`,
    b('data-act="compose-miracle"', 'Work a miracle', wit ? `${wit.name} will report it` : 'Nobody is posted to witness it', { ok: !state.event && g.power >= 3, why: state.event ? 'Rule on the problem first.' : 'Needs at least 3 Power.' }),
    b('data-act="compose-answer"', 'Answer a prayer', `${g.prayers.length} waiting`, { ok: !state.event && g.prayers.length > 0 && g.power >= CONFIG.costs.answer, why: state.event ? 'Rule on the problem first.' : g.prayers.length ? 'Needs 1 Power.' : 'Nobody is praying to you just now.' }),
    b('data-act="compose-dream"', 'Send a dream', '1 Power · learn what someone is like', { ok: !state.event && anyDream && g.power >= 1, why: state.event ? 'Rule on the problem first.' : anyDream ? 'Needs 1 Power.' : 'You know all of them already.' }),
    b('data-action="festival"', 'Hold a festival', `${CONFIG.costs.festival} Offerings · devotion up, maybe a convert`, state.event ? { ok: false, why: 'Rule on the problem first.' } : festival),
    b('data-action="dispute"', 'Disputation', dispute.ok ? `Your Scripture ${dispute.mine} against hers ${dispute.hers} · one soul to the winner` : '', state.event ? { ok: false, why: 'Rule on the problem first.' } : dispute),
    b('data-action="poach"', `Answer one of ${esc(o.name)}'s`, 'A prayer she has ignored · 3 Power · one soul', state.event ? { ok: false, why: 'Rule on the problem first.' } : poach),
    b('data-action="silent"', 'Stay silent', 'Mystery rises; they stop expecting things', { ok: !state.event, why: 'Rule on the problem first.' }),
  ].join('');
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
      <div class="what"><div class="caps">${OFFICES[office].label}</div><small>${OFFICES[office].does}</small>
        ${f ? `<div class="does">${settled ? '' : '<b>Settling in this season.</b> '}${esc(does)}</div>` : '<div class="does down">Vacant. Nothing happens here until someone is posted.</div>'}</div>
      <select data-post="${office}" aria-label="${OFFICES[office].label}">
        <option value="">Nobody</option>
        ${g.flock.map((x) => `<option value="${x.id}" ${f && f.id === x.id ? 'selected' : ''}>${esc(x.name)}${x.known ? ` (${TRAITS[x.traits[0]].label})` : ''}${x.office && x.office !== office ? ` · ${OFFICES[x.office].label}` : ''}</option>`).join('')}
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
    return `<div class="person">${sprite(f, 28)}<div><b>${esc(f.name)}</b> ${esc(f.trade.label)}<small>${esc(traitLabel(f))}${f.office ? ` · ${OFFICES[f.office].label}` : ''}</small>${w ? `<small class="want">${esc(w)}</small>` : ''}</div></div>`;
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
  return `<h2>The Tablets</h2>
    <p class="hint">Seven Tablets are in force; an eighth retires the oldest to the Apocrypha. ${sum.doctrine} of yours do some good. The Review wants ${CONFIG.review.doctrine}.</p>
    ${tabs.length ? tabs.map((t) => tabletHtml(g, t, sum.contradictions)).join('') : '<p class="empty">Nothing is carved yet. Send a Revelation from the Village page: what reaches the last person in the chain is carved here for good.</p>'}
    ${g.apocrypha.length ? `<details><summary>The Apocrypha (${g.apocrypha.length})</summary>${g.apocrypha.map((t) => `<p class="serif">${esc(t.title)}: ${esc(renderVerse(t.verse))}</p>`).join('')}</details>` : ''}
    <h2>Legends being told</h2>
    ${legends.length ? legends.map((L) => `<p>${L.text ? esc(L.text) : `A ${MIRACLES[L.kind].label.toLowerCase()}, as ${L.by ? esc(who(L.by)?.name) : 'nobody'} tells it.`} <small>Still told for ${L.left} more season${L.left > 1 ? 's' : ''}.</small></p>`).join('') : '<p class="empty">No legends. A miracle with someone posted as Witness is retold for seasons afterwards; without one it is forgotten at once.</p>'}`;
}

// ---- heavens -----------------------------------------------------------------------

function heavensTab() {
  const g = me(), o = her();
  const stand = reviewStanding(g, doctrineOf(g));
  return `<h2>The Review</h2>
    <p class="hint">After season ${CONFIG.seasons} the Registry reviews your file. Pass every line and you are promoted. Or bring ${esc(o.name)} under ${CONFIG.fallBelow} souls for ${CONFIG.fallSeasons} seasons and she is yours.</p>
    <table class="review">${stand.map((x) => `<tr><td>${x.label}</td><td>${x.need}</td><td class="${x.ok ? 'up' : 'down'}">${typeof x.have === 'number' ? whole(x.have) : x.have}</td></tr>`).join('')}</table>
    <h2>${esc(o.name)}, Goddess of Being Noticed</h2>
    <div class="rival"><canvas data-sprite="her" width="16" height="16" style="width:48px;height:48px"></canvas>
      <p>${o.souls} souls. Faith ${whole(o.faith)}. ${Object.keys(o.works).length} Works. Her missionary is ${o.missionaryOut ? `recovering for ${o.missionaryOut} more season${o.missionaryOut > 1 ? 's' : ''}` : 'about'}. ${o.prayers.length} of her people are waiting on her.</p></div>
    <h3 class="caps">Her Scripture</h3>
    ${o.tablets.length ? [...o.tablets].reverse().map((t) => `<p class="serif">${esc(t.title)}: ${esc(renderVerse(t.verse))}</p>`).join('') : '<p class="empty">She has carved nothing yet.</p>'}
    <h2>Pim's file</h2>
    ${state.chronicle.length ? [...state.chronicle].reverse().slice(0, 12).filter((r) => r.memo).map((r) => `<p class="mono small">${esc(seasonName(r.season))}: ${esc(r.memo)}</p>`).join('') : '<p class="empty">Nothing filed yet.</p>'}`;
}

// ---- menu --------------------------------------------------------------------------

function menuTab() {
  return `<h2>Menu</h2><div class="stack">
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
  <p><b>Miracles</b> are as good as the account of them. Your Witness tells the story, and a good story is retold for seasons.</p>
  <p><b>Silence</b> is an act. People wonder, Mystery rises, and they stop expecting favours.</p>
  <p><b>Faith</b> is checked by the Registry every year, against a line that rises. Two years under it and you are archived.</p>
  <p><b>Winning</b>: pass the Review after season 30, or bring your rival down to almost nobody.</p>
  <button class="primary" data-act="close">Close</button>`;

// ---- sheets ------------------------------------------------------------------------

function sheetHtml() {
  if (!sheet) return '';
  const body = ({ reveal: revealHtml, miracle: miracleHtml, answer: answerHtml, dream: dreamHtml, report: () => reportHtml(sheet.record), text: () => sheet.html })[sheet.kind]();
  return `<div class="scrim"><div class="sheet">${body}</div></div>`;
}

function rulingHtml() {
  const f = who(state.event.by);
  return `<div class="caps">${esc(seasonName(state.season))} · a problem</div>
    <div class="petition">${f ? sprite(f, 40) : ''}<p class="serif">${esc(state.event.text)}</p></div>
    <div class="stack">${rulingOptions(state).map((o) => `<button data-ruling="${o.i}" ${o.ok ? '' : 'disabled'}><b>${esc(o.label)}</b><small>${esc(o.ok ? effectsText(o.effects) || 'No great matter either way' : o.why)}</small></button>`).join('')}</div>`;
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
    return `<div class="house"><div class="caps">Household ${h + 1}${locked ? ' · your Prophet' : ''}</div><div class="people">
      ${(locked ? [prophet] : [null, ...people]).map((f) => {
        const on = f ? draft.chain.includes(f.id) : !draft.chain.some((id) => g.flock.find((x) => x.id === id).household === h);
        return `<button class="chip ${on ? 'on' : ''}" data-chain="${h}:${f ? f.id : ''}" ${locked ? 'disabled' : ''}>${f ? `${sprite(f, 20)}<span>${esc(f.name)}<small>${f.known ? esc(TRAITS[f.traits[0]].tends) : 'Trait not known'}</small></span>` : '<span>Leave this household out</span>'}</button>`;
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
  return `<div class="caps">A miracle</div>
    <p class="hint">${wit ? `${esc(wit.name)} is your Witness${wit.known ? ` (${TRAITS[wit.traits[0]].label})` : ''} and will tell people what happened.` : 'Nobody is posted as Witness. People will put it down to the weather.'} A miracle the village has seen before is worth less each time.</p>
    <div class="stack">${Object.entries(MIRACLES).map(([id, m]) => {
      const p = preview(state, 0, { kind: 'miracle', miracle: id });
      const seen = g.seen[id] || 0;
      return `<button data-action="miracle" data-miracle="${id}" ${p.ok ? '' : 'disabled'}><b>${m.label}</b><small>${esc(p.ok ? `${m.does} ${CONFIG.costs[id]} Power.${seen ? ` Seen ${seen} time${seen > 1 ? 's' : ''} before.` : ''}` : p.why)}</small></button>`;
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
    <p class="hint">Answering costs 1 Power: Faith and devotion up, and they expect a little more next time. A prayer ${esc(her().name)} ignores for ${CONFIG.neglectedAfter} seasons can be answered by you instead, and the same is true the other way.</p>
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
  if (a.kind === 'reveal') {
    const t = [...g.tablets, ...g.apocrypha].find((x) => x.id === a.tablet);
    out.push(`<div class="chain"><div class="step"><canvas data-sprite="you" width="16" height="15" style="width:28px;height:26px"></canvas><div><div class="who">You said</div><div class="said serif">${esc(t.said)}</div></div></div>
      ${t.steps.map((st) => { const f = who(st.by); return `<div class="step">${sprite(f, 28)}<div><div class="who">${esc(f.name)} ${esc(f.trade.label)} · ${TRAITS[st.trait].label} · ${esc(st.note || 'passed it on unchanged')}</div><div class="said serif">${esc(st.text)}</div></div></div>`; }).join('')}</div>
      <article class="tablet"><div class="caps">Carved: ${esc(t.title)}</div><div class="verse">${esc(renderVerse(t.verse))}</div>${t.after ? `<div class="by">${esc(t.after)}</div>` : ''}<div class="counts">Counts for: ${esc(tabletCounts(g, t).text)}</div></article>`);
  } else if (a.kind === 'miracle') {
    const L = g.legends.find((x) => x.id === a.legend);
    out.push(`<p><b>${MIRACLES[a.miracle].label}.</b> ${L && L.text ? esc(L.text) : a.reported !== a.miracle ? `It was reported as a ${MIRACLES[a.reported].label.toLowerCase()}.` : L ? '' : 'Nobody was posted to witness it.'}${a.stale ? ' The village had seen this before.' : ''}</p>`);
  } else if (a.kind === 'answer') out.push(`<p>${esc(a.text || 'You answered a prayer.')}</p>`);
  else if (a.kind === 'dream') { const f = who(a.id); out.push(`<p>You visited ${esc(f.name)} in a dream. ${esc(f.name)} is ${esc(traitLabel(f))}.</p>`); }
  else if (a.kind === 'dispute') out.push(`<p>Disputation: your Scripture ${a.mine}, hers ${a.hers}. ${a.won ? 'The crowd followed you.' : a.lost ? 'The crowd followed her.' : 'Nobody moved.'}</p>`);
  else if (a.kind === 'festival') out.push('<p>You held a festival.</p>');
  else if (a.kind === 'poach') out.push(`<p>You answered a prayer ${esc(her().name)} had ignored. They are yours now.</p>`);
  for (const o of r.me.offices || []) {
    if (o.text) out.push(`<p class="incident">${esc(o.text)}</p>`);
    if (o.done) out.push(`<p><b>${WORKS[o.done].label} finished.</b> ${WORKS[o.done].does}</p>`);
    if (o.misquoted) out.push(`<p>${esc(who(o.by).name)} misquoted a Tablet from the pulpit. It now reads: “${esc(o.now)}”</p>`);
    if (o.defected) out.push(`<p>${esc(who(o.by).name)}, your missionary, has gone over to ${esc(her().name)}.</p>`);
  }
  if (r.me.schism) out.push(`<p class="down">A schism: ${r.me.schism} left over a point of doctrine.</p>`);
  out.push(`<p class="tally">Souls ${r.souls.me >= 0 ? '+' : '−'}${Math.abs(r.souls.me)} · Faith ${signed(r.faith) || '±0'} · ${esc(her().name)} ${r.souls.her >= 0 ? '+' : '−'}${Math.abs(r.souls.her)} souls</p>`);
  if (r.registry) out.push(`<p class="${r.registry.strikes ? 'down' : ''}">Year ${r.registry.year} end: the Registry wanted ${r.registry.min} Faith and found ${whole(r.registry.faith)}.</p>`);
  if (r.memo) out.push(memoCard(r.memo, r));
  if (r.her.line) out.push(`<p class="rival-line">${esc(r.her.line)}</p>`);
  out.push(`<button class="primary" data-act="close">${state.over ? 'To the Review' : 'Continue'}</button>`);
  return out.join('');
}

function endingHtml() {
  const g = me();
  const o = OUTCOMES[state.outcome];
  const last = state.chronicle[state.chronicle.length - 1];
  const worst = worstVerse(g);
  const all = [...g.apocrypha, ...g.tablets];
  return `<div class="ending">
    <div class="caps">${esc(seasonName(last.season))} · ${o.win ? 'a win' : 'a loss'}</div>
    <h2>${o.label}</h2>
    <p class="serif">${esc(last.ending || '')}</p>
    ${worst ? `<p>The verse that did the most harm was ${esc(worst.tablet.title)}: “${esc(renderVerse(worst.tablet.verse))}”${worst.by ? ` Mostly the doing of ${esc(worst.by.name)} ${esc(worst.by.trade.label)}.` : ''}</p>` : ''}
    <h3 class="caps">Your Scripture, as it stood</h3>
    ${all.length ? all.map((t) => `<p class="serif">${esc(t.title)}: ${esc(renderVerse(t.verse))}</p>`).join('') : '<p class="empty">You carved nothing.</p>'}
    <div class="stack"><button data-act="copy-scripture">Copy your Scripture as text</button><button class="primary" data-act="new">Play again</button></div></div>`;
}

function scriptureText() {
  const g = me();
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
  const t = e.target.closest('[data-act],[data-tab],[data-action],[data-ruling],[data-template],[data-chain]');
  if (!t || busy || t.disabled) return;
  busy = true;
  try {
    const d = t.dataset;
    if (d.tab) { tab = d.tab; sheet = null; }
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
      if (a === 'reveal') act({ kind: 'reveal', template: draft.template, object: draft.object, tail: draft.tail, chain: draft.chain });
      else if (a === 'miracle') act({ kind: 'miracle', miracle: d.miracle });
      else if (a === 'answer') act({ kind: 'answer', prayer: d.prayer });
      else if (a === 'dream') act({ kind: 'dream', id: d.id });
      else act({ kind: a });
    } else {
      const a = d.act;
      if (a === 'new') {
        const name = (document.getElementById('godname')?.value || '').trim() || (state ? me().name : 'the God of Doors That Stick');
        state = newGame({ seed: (Math.random() * 2 ** 31) >>> 0, name });
        tab = 'village'; sheet = null; banner = null; save();
      }
      else if (a === 'continue') { state = load(); tab = 'village'; }
      else if (a === 'close') { sheet = null; }
      else if (a === 'dismiss') { banner = null; }
      else if (a === 'quit') { state = null; sheet = null; }
      else if (a === 'install') { install?.(); }
      else if (a === 'how') { sheet = { kind: 'text', html: HOW }; }
      else if (a === 'compose-reveal') { startDraft(); sheet = { kind: 'reveal' }; }
      else if (a === 'compose-miracle') { sheet = { kind: 'miracle' }; }
      else if (a === 'compose-answer') { sheet = { kind: 'answer' }; }
      else if (a === 'compose-dream') { sheet = { kind: 'dream' }; }
      else if (a === 'export') { sheet = { kind: 'text', html: `<h2>Save code</h2><textarea readonly rows="6">${esc(toCode(state))}</textarea><button class="primary" data-act="close">Done</button>` }; }
      else if (a === 'copy-scripture') { sheet = { kind: 'text', html: `<h2>Your Scripture</h2><textarea readonly rows="12">${esc(scriptureText())}</textarea><button class="primary" data-act="close">Done</button>` }; }
      else if (a === 'load-code') {
        const code = prompt('Paste a save code');
        if (code) { try { state = fromCode(code); save(); tab = 'village'; sheet = null; } catch (err) { banner = err.message; } }
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

installPrompt((go) => { install = go; if (!state) title(); });
render();
registerSW({ onUpdate: (reload) => { banner = 'A new version is ready.'; render(); app.querySelector('.banner')?.insertAdjacentHTML('beforeend', ' <button data-act="reload-now">Reload</button>'); app.querySelector('[data-act="reload-now"]')?.addEventListener('click', reload); } });

// For tools/smoke.mjs and tools/check-bundle.mjs: read-only access to the game.
globalThis.__game = { get state() { return state; } };
