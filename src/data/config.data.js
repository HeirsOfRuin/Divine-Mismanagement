// Every tunable number of the season. Logic-free. Started from the kill-gate
// model (prototypes/killgate/data.mjs, docs/KILLGATE.md) with the author's
// decisions of 2026-11-14: one divine act a season, and a Registry minimum
// that rises each year. Anything marked (gate) was measured there; anything
// else is new and measured in docs/BALANCE.md.

export const CONFIG = {
  seasons: 30,
  seasonsPerYear: 4,
  village: 36,
  households: 4,
  start: { souls: 12, faith: 10, power: 3, mystery: 50, offerings: 3, devotion: 5 },
  rivalStart: { souls: 12, faith: 10, power: 3, mystery: 50, offerings: 3, devotion: 5 },

  faithPerSoul: 0.3,        // a season, at devotion 5 and Mystery 50 (gate)
  faithDecay: 0.1,          // of the balance, each season (gate)
  powerBase: 1, powerPerFaithIncome: 0.25, powerCap: 12,

  mysteryPull: 0.08,        // Mystery moves this share of the way back to 50 each season (gate)
  mysteryPerAct: -2,        // being present is the opposite of being mysterious (gate)
  mysterySilence: 3,        // a season with no act (gate)
  silenceDevotion: -0.1,    // ...and they wonder if anyone is there (gate)
  silenceEntitlement: -1,   // ...and stop expecting things (new: fault 1)
  devotionPull: 0.15,       // devotion moves this share of the way back to 5 (gate)

  entitlementDecay: 0.3, entitlementLine: 3,
  heresyDecay: 1.5, schismAt: 10, schismLoss: 3, schismHeresyAfter: 4,
  leakBelow: 4, leakRate: 0.4,
  drawAbove: 7, drawRate: 0.2,
  fallBelow: 4, fallSeasons: 2,
  poachFactor: 0.5,
  tablets: 7,
  verseCap: 240,            // characters. Was 140; the author: "raise the cap as you need" (2026-11-14).
                            // Measured in play: median 105, 99% under 201, longest 234 (200 games).
  prayersMax: 3,
  prayerChance: 0.5,        // a new prayer most seasons, not every one: one act a season has to go round
  neglectedAfter: 3,        // a prayer unanswered this many seasons can be answered by the other god
  disputeEvery: 4,          // seasons between disputations, for each god
  eventChance: 0.5,

  // The Registry's minimum Faith, checked at each year's end (after seasons
  // 4, 8, ... 28). Under it twice running and you are archived: Forgotten.
  registry: [8, 20, 34, 48, 62, 76, 90],
  registryStrikes: 2,
  // The Review after the last season.
  review: { faith: 150, souls: 21, heresy: 8, doctrine: 3 },

  costs: { link: 1, bounty: 3, sign: 4, smite: 3, answer: 1, poach: 3, dream: 1, festival: 4, dispute: 2 },
};

export const OUTCOMES = {
  ascended:    { win: true,  label: 'Promoted' },
  rival_fell:  { win: true,  label: 'The rival fell' },
  passed_over: { win: false, label: 'Passed over' },
  absorbed:    { win: false, label: 'Absorbed' },
  forgotten:   { win: false, label: 'Forgotten' },
};
