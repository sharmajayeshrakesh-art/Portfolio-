/**
 * categories.js — sorting a merchant string into a bucket.
 *
 * The keyword table is only a cold start. What actually makes this useful is
 * the learned map: every time a category is corrected by hand, that merchant is
 * remembered permanently and checked *before* the keywords. After a few weeks
 * of ordinary spending almost everything files itself, including the local
 * petrol pump and kirana that no keyword list could ever anticipate.
 */

export const CATEGORIES = [
  "Fuel",
  "Eating",
  "Groceries",
  "Travel",
  "Shopping",
  "Bills & recharge",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

const KEYWORDS = {
  // "PETRO" rather than "PETROL": it still catches PETROL and PETROLEUM, and
  // half the pumps in the country are named "<something> Petro".
  "Fuel": ["HP", "HPCL", "IOCL", "BPCL", "INDIAN OIL", "PETRO", "PUMP", "SHELL", "NAYARA", "FUEL"],
  "Eating": ["SWIGGY", "ZOMATO", "CAFE", "HOTEL", "RESTAURANT", "BAKERY", "DOMINO", "MCDONALD", "CHAI", "BREW"],
  "Groceries": ["BLINKIT", "ZEPTO", "INSTAMART", "DMART", "BIGBASKET", "KIRANA", "SUPERMARKET"],
  "Travel": ["OLA", "UBER", "RAPIDO", "IRCTC", "REDBUS", "MSRTC", "METRO", "PARKING"],
  "Shopping": ["AMAZON", "FLIPKART", "MYNTRA", "AJIO", "DECATHLON", "MEESHO"],
  "Bills & recharge": ["JIO", "AIRTEL", "VI", "BSNL", "NETFLIX", "SPOTIFY", "ELECTRICITY", "MSEB", "RECHARGE"],
  // Not in the starter list, but the category exists and would otherwise be
  // unreachable without a manual correction every single time.
  "Entertainment": ["BOOKMYSHOW", "PVR", "INOX", "CINEPOLIS", "CINEMA", "MULTIPLEX"],
  "Health": ["PHARMACY", "MEDICAL", "APOLLO", "CLINIC", "HOSPITAL", "PATHOLOGY", "WELLNESS"],
  "Education": ["COLLEGE", "TUITION", "CLASSES", "BOOK", "STATIONERY", "XEROX"],
};

// Short keywords ("HP", "VI", "OLA") would match inside unrelated words —
// "SHOP" contains "HP", "VIJAY" contains "VI". Those are matched on word
// boundaries; longer ones can match anywhere, so "SWIGGYINSTAMART" still works.
const WORD_BOUNDED = new Set(["HP", "VI", "OLA", "BOOK", "METRO", "CHAI", "BREW", "PUMP"]);

/** Canonical form used as the learned-map key and for all matching. */
export function normalizeMerchant(raw) {
  return String(raw || "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function keywordCategory(key) {
  for (const [category, words] of Object.entries(KEYWORDS)) {
    for (const word of words) {
      if (WORD_BOUNDED.has(word)) {
        if (new RegExp(`\\b${word}\\b`).test(key)) return category;
      } else if (key.includes(word)) {
        return category;
      }
    }
  }
  return null;
}

/**
 * Learned mappings win over keywords, always. An exact match is preferred; if
 * there is none, a learned merchant that is a prefix of this one (or vice
 * versa) counts, so "SHREE GANESH PETRO" also covers "SHREE GANESH PETRO PUMP"
 * when the receipt text wanders slightly between screenshots.
 */
export function guessCategory(merchant, learned = {}) {
  const key = normalizeMerchant(merchant);
  if (!key) return "Other";

  if (learned[key]) return learned[key];

  for (const [known, category] of Object.entries(learned)) {
    if (known.length < 5) continue;
    if (key.startsWith(known) || known.startsWith(key)) return category;
  }

  return keywordCategory(key) || "Other";
}
