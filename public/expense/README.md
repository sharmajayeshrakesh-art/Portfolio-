# Tally

A personal expense tracker that runs entirely in the browser on a phone.

Two things it does. Pay for something on Google Pay, tap Share on the receipt,
pick Tally from the Android share sheet — it reads the screenshot on the
device, shows what it found, and you tap Save. And it tracks the PPL rotation:
what to train next, what actually got done, and how consistent it has been.

Live at `/Portfolio-/expense/`.

## What it is not

No backend, no accounts, no API keys, no network calls after the first load.
The OCR runs on the phone. Nothing about a payment leaves the device.

It tracks **spending only**. A screenshot that looks like a refund, cashback or
money received is refused rather than stored as a negative — a credit filed as
an expense is a number nobody would ever notice was wrong.

## The share target

This is the part that took the work, and the part most likely to break silently.

1. `manifest.json` declares a `share_target` posting `multipart/form-data` to
   `share`, relative to the manifest.
2. `sw.js` intercepts `POST` requests ending in `/share`, pulls the image out of
   the `FormData`, stores it in the `tally-share` cache, and replies with a
   **303** redirect to `./?shared=1`. (302 would re-issue the POST.)
3. On load the app finds `?shared=1`, reads the blob, deletes it so it cannot be
   saved twice, strips the query from the address bar, and runs OCR.

It only appears in the Android share sheet once the app has been installed via
**Add to home screen** *and* the service worker has activated. It cannot be
tested from a desktop browser — use the **Scan a screenshot** button for that.

### Paths

This deploys to a GitHub Pages subfolder, so no URL anywhere may start with `/`.
`src/base.js` derives everything from `import.meta.url` and `sw.js` from
`self.registration.scope`, which means the same build works at a domain root, in
this subfolder, and on localhost with no configuration.

## Reading the screenshot

Tesseract.js from a CDN, cached by the service worker after the first run, so
there is a one-time download (~15MB) and it is fully offline afterwards.

Before recognition the image is downscaled to ~1000px, converted to greyscale
and contrast-raised — and **inverted if it is predominantly dark**. That last
step is the difference between reading the amount and reading nothing: payment
apps are dark-themed and Tesseract is trained on dark-on-light.

The parser (`src/parse.js`) then looks for:

| Field | How |
|---|---|
| Amount | Largest `₹`/`Rs`/`INR`-tagged number; falls back to a number alone on its line, excluding reference numbers and years |
| Date | `12 Sept 2026`, `Sep 12, 2026`, `12/09/2026` (day first), `12 Sept`, `Today`, `Yesterday` |
| Merchant | Line after `To` / `Paid to`, or the next usable line; UPI handles and masked account tails stripped |
| Status | Explicit `Failed` / `Pending` is refused |

Nothing is ever saved without confirmation, and every field the parser guessed
at is named on the review card so you know where to look.

## Categories

Fixed list, seeded with a keyword table — but the part that matters is the
learned map. Correct a category once and that merchant is remembered
permanently, checked *before* the keywords. After a few weeks most things file
themselves, including the local pump and kirana no keyword list could predict.
Settings → Learned merchants to fix a bad one.

## Gym

The plan lives in `src/plan.js`, transcribed from the PPL document. The rotation
is **Pull → Push → Legs, twice**: `pull1 · push1 · legs1 · pull2 · push2 · legs2`.

### Why there is no timetable

The app tracks a **position in the cycle**, never a day of the week, and the
cursor only moves when a session is actually logged.

That one decision is what makes a hectic Wednesday cost nothing. Thursday still
owes Legs 1. Training on Sunday advances the cursor like any other day. There is
no "missed day" to fall behind on, because the plan is a loop rather than a
calendar — which is how it is actually trained.

Consistency is therefore measured over a **rolling seven days** rather than a
calendar week: six sessions in any seven days is the plan being followed,
whatever days they land on. A streak counts consecutive sessions no more than
two days apart, so the weekly rest day never breaks it.

The cursor is derived from the last logged session rather than a stored counter,
so it stays correct after an edit, a deletion, or a session logged out of order —
train legs when push was due and the rotation simply follows you.

### The check-in

One session per day. Every exercise starts at its full set count, so a normal day
is **one tap on Log**. You only touch what went wrong:

- tap dot *n* → you did *n* sets
- tap `–` → skipped entirely
- the running total at the top shows sets done against sets planned

Logging the same day twice replaces that day rather than double-counting.
`Trained a different session?` overrides which session it was.

Exercise ids are shared across sessions wherever the movement is the same, so
"most skipped" aggregates a lat pulldown across Pull 1 and Pull 2 rather than
treating them as two different lifts.

## Storage and backup

`localStorage` under `tally.v1`. A browser can clear it without warning and
there is no server copy, **so backup is the strategy, not a convenience.** The
app nags if the last backup is over 30 days old.

Two different exports, because they do different jobs:

- **Back up everything** → JSON. Expenses, workouts and learned merchants, and
  the only one that restores. Sessions and the learned map have no sensible CSV
  representation, so a CSV alone would be a backup that quietly loses half the
  app.
- **Export expenses to CSV** → for reading in a spreadsheet.

CSV import is tolerant enough for a bank statement: columns matched by header
name, several date formats, credits refused, and rows without a category sorted
the same way a shared receipt would be. Rows that are unparseable are counted and
reported rather than dropped silently.

## The landing screen

It used to lead with "spent today", which is ₹0 every morning — not an empty
state to decorate but the **normal** state, so the app greeted you with a giant
zero and three different ways of saying "nothing", most times you opened it.

Home now leads with the month (never zero after day one) and spends the rest of
the screen on the two questions worth asking: where the money is going, and
whether you are training. One chart answers both — spending as columns, training
as filled/hollow dots beneath, over a shared seven-day axis.

Chart decisions, deliberately:

- **One hero figure per view**, in proportional figures. `tabular-nums` gives
  every digit the width of a zero, which makes a large number look gappy; the
  lists keep it, because there the vertical alignment is the point.
- **One accent for every column.** Colouring by size would double-encode the
  height as hue and burn the only free channel on what the chart already shows.
- **No gridlines.** A direct label on today carries the one value worth reading
  exactly; the rest is shape, and tapping a day reads it out.
- **Bars capped at 20px** with a 4px rounded cap, square on the baseline, so the
  band's leftover is air.
- **Filled vs hollow dots** are a shape difference, so the training row never
  depends on colour alone.
- **Day one shows a statement, not charts.** Charts of nothing are worse than no
  charts.

## Tests

`node scripts/test-tally.mjs` — no dependencies, no browser. Covers the parts
that are easy to break by accident: reading a receipt, refusing money coming in,
the training rotation surviving a missed day, and what CSV import will accept.

What that suite deliberately does **not** cover is layout, and that gap has
already cost once: a hidden screen kept its layout box and pushed every other
tab a full viewport down, while every content-based assertion sailed straight
through it. Layout needs checks on **position**, and screens need looking at —
not just the one being worked on.

## Layout

```
index.html         shell: five screens, tab bar, sheet, toast
manifest.json      icons + share_target
sw.js              offline shell, share-target POST handler
styles/app.css
src/base.js        the one place that knows the deploy path
src/store.js       localStorage, dates, totals, sessions
src/categories.js  keyword table + learned map
src/parse.js       OCR text → fields
src/ocr.js         preprocessing + Tesseract
src/csv.js         export / import
src/ui.js          DOM helpers, sheet, toast
src/app.js         money screens, routing, share → review → save
src/home.js        the overview: hero, seven-day chart, panels
src/plan.js        the PPL plan as data
src/gym.js         rotation cursor, streaks, adherence
src/gymscreen.js   Gym tab + the check-in sheet
icons/             generated by scripts/gen-tally-icons.mjs
```

## The name

It was called **Kharcha** — "expense" — when money was all it tracked, with a
rupee for a mark. Once training arrived, the name and the icon described half
the app. **Tally** names the act instead of the domain: you tally expenses and
you tally sets, and a third thing could join without another rename. The mark is
four uneven columns — the home screen's own chart. Uneven on purpose; a clean
ascending ramp reads as a signal-strength meter.

Renaming touched two things that could have cost data, and neither did:

- `store.js` reads `tally.v1`, falling back to `kharcha.v1` once and copying it
  forward. The old key is **left in place**, not deleted — it costs a few
  kilobytes and it is the only safety net if the migration is ever wrong.
- The share cache became `tally-share`, but a service worker updates on its own
  schedule, so for a moment the new page can be live while the old worker still
  handles the share. The page checks `LEGACY_SHARE_CACHES` too, so a screenshot
  shared in that window is not dropped.

`id`, `scope` and `start_url` in the manifest are unchanged, so Android updates
the installed app in place rather than treating it as a new one.

## Testing on a real phone

Steps 1–3 can be checked in any browser. Step 4 onward needs an actual Android
device, over HTTPS.

1. Open the URL, add an entry by hand, reload — it should still be there.
2. Check the week/month/year totals on History.
3. Chrome menu → **Add to home screen**. It should open fullscreen with no
   browser chrome.
4. Open Google Pay, any receipt, **Share** → Tally should be in the sheet.
5. Share a real receipt. First run downloads the OCR engine; after that it is
   instant and works in airplane mode.
6. Correct a category, then share another receipt from the same merchant — it
   should now come back already sorted.
7. Settings → Back up everything, and confirm the JSON file saves.
8. Gym → log a session. Skip a lift, cut another short, check the total.
9. Miss a day deliberately, train the next day, and confirm the rotation did not
   skip ahead — that is the whole point of the cursor.
