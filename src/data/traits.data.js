// The six traits of v0.1. Logic-free: what each is called, the prop its sprite
// carries, and the line the Reveal screen shows once the trait is known.
// What each one does to a verse is in src/engine/telephone.js.

export const TRAITS = {
  literalist: { label: 'Literalist', prop: 'stick',  tends: 'Takes one part of it exactly at its word.' },
  drunk:      { label: 'Drunk',      prop: 'mug',    tends: 'Mishears one word for another that sounds like it.' },
  ambitious:  { label: 'Ambitious',  prop: 'hat',    tends: 'Adds a clause that happens to benefit the speaker.' },
  poet:       { label: 'Poet',       prop: 'quill',  tends: 'Makes it lovely and unclear, and softens it to "Let...".' },
  lazy:       { label: 'Lazy',       prop: 'pillow', tends: 'Leaves one part out.' },
  zealot:     { label: 'Zealot',     prop: 'torch',  tends: 'Makes it stricter, makes it apply to more people, and adds a threat.' },
};

export const TRAIT_IDS = Object.keys(TRAITS);
