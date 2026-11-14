// Who lives in Little Fretting. Logic-free.
// `good` is what the trade sells; `rider` is the trade's own Ambitious rider.

export const NAMES = [
  'Odo', 'Brenna', 'Wilf', 'Cuthwin', 'Hesper', 'Maud', 'Tibb', 'Aldous', 'Pernel',
  'Gytha', 'Osric', 'Linnet', 'Hob', 'Edda', 'Fenn', 'Marigold', 'Tostig', 'Sabin',
  'Wren', 'Godric', 'Annis', 'Bartle', 'Ysmay', 'Dunstan',
];

export const TRADES = [
  { id: 'miller',    label: 'the Miller',      good: 'flour',    rider: ", and {name}'s mill is henceforth the Holy Mill" },
  { id: 'alewife',   label: 'the Brewer',      good: 'ale',      rider: ", and any thirst arising is to be settled at {name}'s" },
  { id: 'carpenter', label: 'the Carpenter',   good: 'a stool',  rider: ', seated upon a stool bought new from {name}' },
  { id: 'shepherd',  label: 'the Shepherd',    good: 'wool',     rider: ", and {name}'s sheep go first" },
  { id: 'beekeeper', label: 'the Beekeeper',   good: 'honey',    rider: ", and {name}'s honey is declared medicinal" },
  { id: 'eeler',     label: 'the Eel-Catcher', good: 'an eel',   rider: ', and eels are to be eaten on feast days, at the usual price' },
  { id: 'clerk',     label: 'the Clerk',       good: 'a permit', rider: ', by permit, obtainable from {name} for two eggs' },
  { id: 'gooseherd', label: 'the Gooseherd',   good: 'a goose',  rider: ", and {name}'s geese are not to be discussed" },
];
