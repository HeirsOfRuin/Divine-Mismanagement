// Things followers add to a verse. Logic-free.
// Tone rules: docs/WORLD.md section 6. Penalties are slapstick: nobody is hurt.

// What a Zealot threatens. `noun` names the verse if nothing odder is in it.
export const PENALTIES = [
  { id: 'pond',    text: 'or be put in the pond', noun: 'Pond' },
  { id: 'stern',   text: 'or be looked at sternly by everyone', noun: 'Stern Look' },
  { id: 'hat',     text: 'or forfeit their good hat', noun: 'Good Hat' },
  { id: 'well',    text: 'or apologise to the well', noun: 'Well' },
  { id: 'stone',   text: 'or carry the big stone up the hill and back', noun: 'Big Stone' },
  { id: 'turnip',  text: 'or be called a turnip in front of their mother', noun: 'Turnip' },
  { id: 'wall',    text: 'or sit facing the wall at the harvest feast', noun: 'Wall' },
  { id: 'bell',    text: 'or be struck off the bell-ringing list', noun: 'Bell' },
  { id: 'supper',  text: 'or eat supper standing up', noun: 'Standing Supper' },
  { id: 'spoon',   text: 'or be given the small spoon', noun: 'Small Spoon' },
  { id: 'bucket',  text: 'or wear the bucket', noun: 'Bucket' },
  { id: 'voice',   text: 'or have their name said in a disappointed voice', noun: 'Disappointed Voice' },
];

// What an Ambitious follower adds. {name} is the speaker, {good} what their
// trade sells. Any rider must read after any verse.
export const RIDERS = [
  { id: 'buy',     text: ', having first bought {good} from {name}' },
  { id: 'oversee', text: ', under the supervision of {name}, who is to be paid' },
  { id: 'excused', text: ', and {name} is excused on account of important work' },
  { id: 'fee',     text: ', and a small fee is owed to {name} each time' },
  { id: 'thanks',  text: ', and {name} is to be thanked by name' },
];

export const RIDER_AFTER = "{name}'s devotion has risen sharply. So has {name}.";
