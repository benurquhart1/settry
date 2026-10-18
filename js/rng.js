// Seeded randomness. Every random choice in a game goes through the game's Rng,
// so the same seed always deals the same cards (and later, the same rewards).
const Rng = {
  // Turns any seed text into a random() function returning numbers in [0, 1).
  create(seed) {
    let h = 1779033703 ^ String(seed).length;
    for (const ch of String(seed)) {
      h = Math.imul(h ^ ch.charCodeAt(0), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    let a = h >>> 0;
    return () => {                       // mulberry32
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  int(random, n) {
    return Math.floor(random() * n);
  },

  // A fresh seed to suggest on the start menu (this one is not seeded on purpose).
  newSeed() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  },
};
