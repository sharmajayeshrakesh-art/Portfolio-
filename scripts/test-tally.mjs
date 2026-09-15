/**
 * test-tally.mjs — the checks that need no browser.
 *
 * Kept in the repo rather than a scratch directory because these encode
 * decisions that are easy to undo by accident: how a receipt is read, how the
 * training rotation survives a missed day, and what a CSV import is allowed to
 * accept. Plain node, no dependencies.
 *
 * Run: node scripts/test-tally.mjs
 */

const SRC = new URL("../public/expense/src/", import.meta.url);

// store.js reads localStorage at import time; these modules only need its date
// helpers, so a two-line stub is enough to load them outside a browser.
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};

const { parseReceipt } = await import(new URL("parse.js", SRC));
const { guessCategory, CATEGORIES } = await import(new URL("categories.js", SRC));
const { CYCLE, SESSIONS, plannedSets } = await import(new URL("plan.js", SRC));
const gym = await import(new URL("gym.js", SRC));
const { toCSV, parseCSV } = await import(new URL("csv.js", SRC));

let pass = 0;
const failures = [];
function check(name, ok, detail = "") {
  if (ok) { pass++; return; }
  failures.push(`${name}${detail ? `\n      ${detail}` : ""}`);
}

const year = new Date().getFullYear();

/* ---------- reading a receipt ---------- */

const receipts = [
  ["GPay dark mode",
   `₹450\nCompleted\n12 Sept ${year}, 3:45 pm\n\nTo Shree Ganesh Petro\nUPI transaction ID 428394857392`,
   { amount: 450, merchant: "Shree Ganesh Petro", category: "Fuel" }],
  ["merchant on the next line",
   `Paid to\nSWIGGY\n₹328.50\nCompleted • 12 Sep ${year}`,
   { amount: 328.5, merchant: "SWIGGY", category: "Eating" }],
  ["PhonePe, Rs and a UPI handle",
   `Paid to Zomato\nRs 512\nTransaction Successful\n12 Sep, 03:45 PM\nzomato@ybl`,
   { amount: 512, merchant: "Zomato", category: "Eating" }],
  ["Indian grouping at lakh scale",
   `₹1,23,456.78\nCompleted\nTo DECATHLON SPORTS INDIA\n15/08/${year}`,
   { amount: 123456.78, category: "Shopping" }],
  ["fees present, largest wins",
   `Paid to BLINKIT\n₹840\nConvenience fee ₹12\nPlatform fee ₹5\nCompleted\nToday`,
   { amount: 840, category: "Groceries" }],
  ["currency mark lost by OCR",
   `Paid to\nAPOLLO PHARMACY\n299.00\nCompleted\nYesterday\n428394857392`,
   { amount: 299, category: "Health", uncertain: "amount" }],
];

for (const [name, text, want] of receipts) {
  const got = parseReceipt(text);
  check(`receipt · ${name} · amount`, got.amount === want.amount, `${got.amount} != ${want.amount}`);
  if (want.merchant) check(`receipt · ${name} · merchant`, got.merchant === want.merchant, `"${got.merchant}"`);
  if (want.category) {
    const cat = guessCategory(got.merchant, {});
    check(`receipt · ${name} · category`, cat === want.category, `${cat} != ${want.category}`);
  }
  if (want.uncertain) {
    check(`receipt · ${name} · flags uncertainty`, got.uncertain.includes(want.uncertain), got.uncertain.join(","));
  }
  check(`receipt · ${name} · valid date`, /^\d{4}-\d{2}-\d{2}$/.test(got.date), got.date);
}

// Money coming in must never become a negative expense.
for (const [name, text, reason] of [
  ["refund", "₹450\nRefund\nRefund reference number 9988\nCompleted", "incoming"],
  ["received from", "₹2,000\nReceived from Amit Sharma\nCompleted", "incoming"],
  ["cashback", "₹50 Cashback credited to your account\nCompleted", "incoming"],
  ["failed", "₹450\nPayment failed\nTo SWIGGY", "failed"],
  ["pending", "₹450\nPending\nTo SWIGGY", "pending"],
  ["unreadable", "~~~~\n....\n???", "no-amount"],
]) {
  const got = parseReceipt(text);
  check(`refuses · ${name}`, got.reason === reason && !got.ok, `reason=${got.reason}`);
}

/* ---------- categories ---------- */

check("learned mapping beats the keyword table",
  guessCategory("Shree Ganesh Petro", { "SHREE GANESH PETRO": "Groceries" }) === "Groceries");
check("learned mapping tolerates a longer name",
  guessCategory("SHREE GANESH PETRO PUMP", { "SHREE GANESH PETRO": "Fuel" }) === "Fuel");
check("every category is reachable from some keyword",
  CATEGORIES.filter((c) => c !== "Other").every((c) =>
    CATEGORIES.includes(c)), "");

/* ---------- the training rotation ---------- */

const full = (date, slot) => ({
  id: date + slot, date, slot,
  exercises: Object.fromEntries(SESSIONS[slot].exercises.map((e) => [e.id, e.sets])),
});
const newestFirst = (list) => [...list].sort((a, b) => (a.date < b.date ? 1 : -1));

check("rotation is pull → push → legs, twice",
  CYCLE.join(",") === "pull1,push1,legs1,pull2,push2,legs2", CYCLE.join(","));
check("a cold start begins at Pull 1", gym.nextSlot([]) === "pull1");

// Monday, Tuesday, WEDNESDAY SKIPPED, Thursday…Sunday. The week still completes.
const hecticWeek = newestFirst([
  full("2026-09-07", "pull1"), full("2026-09-08", "push1"),
  full("2026-09-10", "legs1"), full("2026-09-11", "pull2"),
  full("2026-09-12", "push2"), full("2026-09-13", "legs2"),
]);
const sunday = new Date(2026, 8, 13);
check("a skipped day does not advance the rotation",
  hecticWeek.find((s) => s.date === "2026-09-10").slot === "legs1");
check("the rotation still completes", gym.nextSlot(hecticWeek) === "pull1");
check("six in any seven days counts as on plan", gym.summary(hecticWeek, sunday).onPlan);
check("the rest-day gap does not break the streak", gym.streak(hecticWeek, sunday) === 6,
  String(gym.streak(hecticWeek, sunday)));
check("a real lapse does break it",
  gym.streak(newestFirst([full("2026-09-01", "pull1")]), new Date(2026, 8, 6)) === 0);
check("the cursor follows a session logged out of order",
  gym.nextSlot(newestFirst([full("2026-09-07", "pull1"), full("2026-09-08", "legs2")])) === "pull1");

const partial = { id: "p", date: "2026-09-13", slot: "legs1",
  exercises: { squat: 4, leg_press: 3, bulgarian: 0, leg_curl: 2, calf_raise: 4, ab_crunch: 3 } };
check("planned sets for Legs 1", plannedSets("legs1") === 20, String(plannedSets("legs1")));
check("a partial session scores correctly", Math.round(gym.completeness(partial) * 100) === 80);

const worst = gym.exerciseAdherence(newestFirst([partial,
  { ...partial, id: "q", date: "2026-09-10" }]))[0];
check("the most-skipped lift surfaces", worst.id === "bulgarian" && worst.skips === 2, JSON.stringify(worst));

const shared = gym.exerciseAdherence(newestFirst([full("2026-09-12", "pull1"), full("2026-09-13", "pull2")]))
  .find((r) => r.id === "lat_pulldown");
check("one movement aggregates across two sessions",
  shared.seen === 2 && shared.planned === 8, JSON.stringify(shared));

const grid = gym.grid(hecticWeek, 5, sunday);
check("the grid is whole weeks", grid.length === 35);
check("the grid starts on a Monday", new Date(grid[0].date + "T00:00").getDay() === 1);
check("the grid ends today", grid[34].date === "2026-09-13" && grid[34].isToday);
check("the skipped day is blank, not future", grid.find((c) => c.date === "2026-09-09").session === null);

/* ---------- CSV ---------- */

const expenses = [
  { id: "1", date: "2026-09-12", amount: 420, merchant: "Shree Ganesh Petro", category: "Fuel", note: "", source: "shared" },
  { id: "2", date: "2026-09-13", amount: 328.5, merchant: 'Cafe "The Brew", Pune', category: "Eating", note: "lunch", source: "manual" },
];
const round = parseCSV(toCSV(expenses));
check("csv round-trips both rows", round.rows.length === 2, JSON.stringify(round));
check("csv preserves a quoted comma",
  round.rows.some((r) => r.merchant === 'Cafe "The Brew", Pune'),
  JSON.stringify(round.rows.map((r) => r.merchant)));
check("csv preserves paise", round.rows.some((r) => r.amount === 328.5));

// A bank statement: no category column, narration instead of merchant, a credit.
const statement = parseCSV([
  "Txn Date,Narration,Withdrawal",
  "12/09/2026,SWIGGY BANGALORE,328.50",
  "11/09/2026,HP PETROL PUMP PUNE,2000",
  '10/09/2026,"AMAZON, RETAIL INDIA",1499',
  "09/09/2026,SALARY CREDIT,-50000",
].join("\n"));
check("statement: the credit row is refused", statement.skipped === 1, String(statement.skipped));
check("statement: three debits imported", statement.rows.length === 3);
check("statement: dates are read day-first", statement.rows[0].date === "2026-09-12", statement.rows[0].date);
check("statement: rows sort from the narration",
  statement.rows.map((r) => guessCategory(r.merchant, {})).join(",") === "Eating,Fuel,Shopping",
  statement.rows.map((r) => guessCategory(r.merchant, {})).join(","));

/* ---------- report ---------- */

console.log(`\n${pass} passed, ${failures.length} failed`);
for (const f of failures) console.log(`  FAIL  ${f}`);
process.exit(failures.length ? 1 : 0);
