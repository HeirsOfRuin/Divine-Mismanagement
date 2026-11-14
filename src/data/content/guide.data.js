// Pim's notes when something opens in a guided match, and the Registry's
// goals. Logic-free. The notes teach, so they say what a thing does and what
// it costs; they still keep the house voice (WORLD.md section 6).

// Keyed by the season of the opening in GUIDE (src/data/match.data.js).
export const GUIDE_NOTES = {
  1: { title: 'Your first season', text: 'You cannot speak to anyone directly. Post someone as Prophet on the Flock page: they hear your Revelations first. Post a Preacher too; they keep the flock believing. Then send a Revelation. Expect it to arrive changed. Everything does.' },
  2: { title: 'New: the Missionary, and prayers', text: 'A Missionary brings in souls from the Unbothered. Your people have also started praying to you. Answering costs a little Power and buys a little love. Ignore them long enough and someone else may answer.' },
  3: { title: 'New: the Collector and the Builder', text: 'The Collector gathers Offerings; the Builder spends them on Works. Choose a Work on the Flock page and post a Builder. What goes up depends on who builds it.' },
  4: { title: 'New: miracles, and the Witness', text: 'You can work miracles now. They are only as good as the account of them, so post a Witness first. The village tires of a miracle it has seen before. And it is a year end: the Registry is checking your Faith.' },
  6: { title: 'New: dreams and festivals', text: 'Send a dream to learn what someone is really like before you trust them with an office. A festival needs a Feast Hall and Offerings, and makes people fond of you.' },
  8: { title: 'New: the other gods', text: 'You may now act against the other gods: singe a missionary, answer a prayer one of them has ignored, or send your Prophet to argue in the market. Scripture that agrees with itself wins arguments.' },
};

// The Registry's goals. `n` is scaled to the size of the world where marked.
// `needs`: an opening (guide key) or 'villages' (more than one village).
export const PETITIONS = [
  { id: 'two_offices',   text: 'Have two offices filled.',                          reward: { power: 2 } },
  { id: 'tablet_good',   text: 'Carve a Tablet that does some good.',                reward: { power: 2 }, needs: 'act:reveal' },
  { id: 'answer_two',    text: 'Answer two prayers.',                                reward: { power: 2 }, needs: 'act:answer' },
  { id: 'souls_n',       text: 'Reach {n} souls.', n: 15, scaled: true,             reward: { faith: 5 } },
  { id: 'four_offices',  text: 'Have four offices filled.',                         reward: { offerings: 3 }, needs: 'office:builder' },
  { id: 'work_done',     text: 'Finish a Work.',                                    reward: { faith: 5 }, needs: 'office:builder' },
  { id: 'witnessed',     text: 'Work a miracle with a Witness posted.',             reward: { faith: 4 }, needs: 'act:miracle' },
  { id: 'two_good',      text: 'Have two Tablets doing good at once.',              reward: { offerings: 4 }, needs: 'act:reveal' },
  { id: 'know_five',     text: 'Know what five of your people are like.',          reward: { power: 2 } },
  { id: 'lead_rival',    text: 'Have more souls than {rival}.',                     reward: { power: 3 } },
  { id: 'convert_three', text: 'Win three souls in one season.',                    reward: { faith: 6 } },
  { id: 'all_offices',   text: 'Fill all six offices.',                             reward: { offerings: 5 }, needs: 'office:witness' },
  { id: 'heresy_calm',   text: 'End a season with three Tablets and Heresy under 2.', reward: { faith: 5 }, needs: 'act:reveal' },
  { id: 'legends_two',   text: 'Have two legends being told at once.',             reward: { power: 2 }, needs: 'act:miracle' },
  { id: 'festival',      text: 'Hold a festival.',                                  reward: { faith: 4 }, needs: 'act:festival' },
  { id: 'dispute_won',   text: 'Win a disputation.',                                reward: { faith: 5 }, needs: 'act:dispute' },
  { id: 'rank_one',      text: 'Become a Local Deity.',                             reward: { power: 3 } },
  { id: 'field_away',    text: 'Send your missionary to work another village.',     reward: { power: 2 }, needs: 'villages' },
  { id: 'hold_two',      text: 'Hold the most souls in two villages.',              reward: { faith: 6 }, needs: 'villages' },
  { id: 'souls_m',       text: 'Reach {n} souls.', n: 22, scaled: true,             reward: { faith: 8 } },
];
