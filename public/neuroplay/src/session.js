/**
 * session.js — the passive telemetry recorder.
 *
 * This is the heart of "therapy that doubles as diagnosis". While the elder
 * simply plays, every game calls into a SessionRecorder to silently capture,
 * per trial:
 *   - reaction time  (stimulus shown -> answer committed)
 *   - hesitation     (stimulus shown -> first touch, even if later changed)
 *   - accuracy & error type
 *   - retries / self-corrections
 *   - abandonment    (left the trial without answering)
 *
 * Games never do their own maths — they just report raw timings. All
 * aggregation lives in analytics.js so there is a single source of truth.
 */

import { store, cryptoId } from "./store.js";
import { gameDomain } from "./catalog.js";

export class SessionRecorder {
  constructor({ patientId, language }) {
    this.session = {
      id: cryptoId(),
      patientId: patientId || "primary",
      language: language || "en",
      startedAt: Date.now(),
      endedAt: null,
      games: [],
      summary: null,
    };
    this.events = [];
    this._trial = null;
  }

  /** Call when a game screen mounts. */
  addGame(gameId) {
    if (!this.session.games.includes(gameId)) this.session.games.push(gameId);
  }

  /**
   * Begin a trial. `startTrial` marks the moment the stimulus is fully
   * presented (after any voice prompt), which is time-zero for reaction time.
   */
  startTrial({ gameId, trialIndex, difficulty = 1, meta = {} }) {
    this._trial = {
      id: cryptoId(),
      sessionId: this.session.id,
      gameId,
      domain: gameDomain(gameId),
      trialIndex,
      difficulty,
      promptAt: performance.now(),
      firstTouchAt: null,
      respondedAt: null,
      reactionTimeMs: null,
      hesitationMs: null,
      correct: null,
      errorType: null,
      retries: 0,
      abandoned: false,
      meta,
    };
    this.addGame(gameId);
    return this._trial.id;
  }

  /** Record the very first interaction (used to measure hesitation). */
  markFirstTouch() {
    if (this._trial && this._trial.firstTouchAt == null) {
      this._trial.firstTouchAt = performance.now();
      this._trial.hesitationMs = Math.round(this._trial.firstTouchAt - this._trial.promptAt);
    }
  }

  /** Record a wrong attempt that the player then corrects (self-correction). */
  markRetry() {
    if (this._trial) this._trial.retries += 1;
  }

  /**
   * Commit the trial result.
   * `correct` boolean, `errorType` one of null | 'wrong_option' |
   * 'sequence_error' | 'omission' | 'commission' | 'timeout'.
   */
  endTrial({ correct, errorType = null } = {}) {
    if (!this._trial) return;
    const t = this._trial;
    t.respondedAt = performance.now();
    t.reactionTimeMs = Math.round(t.respondedAt - t.promptAt);
    if (t.firstTouchAt == null) {
      // answered in one motion — hesitation equals reaction time
      t.hesitationMs = t.reactionTimeMs;
    }
    t.correct = !!correct;
    t.errorType = correct ? null : errorType || "wrong_option";
    this.events.push(stripPerf(t));
    this._trial = null;
  }

  /** The player walked away / skipped without answering. */
  abandonTrial() {
    if (!this._trial) return;
    const t = this._trial;
    t.abandoned = true;
    t.correct = false;
    t.errorType = "omission";
    t.respondedAt = null;
    t.reactionTimeMs = null;
    this.events.push(stripPerf(t));
    this._trial = null;
  }

  /** Persist the whole session + its events to IndexedDB. */
  async finish() {
    if (this._trial) this.abandonTrial();
    this.session.endedAt = Date.now();
    this.session.summary = summarise(this.events);
    for (const ev of this.events) await store.saveEvent(ev);
    await store.saveSession(this.session);
    return this.session;
  }
}

// Convert performance.now() relative marks into a clean persisted record.
function stripPerf(t) {
  return {
    id: t.id,
    sessionId: t.sessionId,
    gameId: t.gameId,
    domain: t.domain,
    trialIndex: t.trialIndex,
    difficulty: t.difficulty,
    reactionTimeMs: t.reactionTimeMs,
    hesitationMs: t.hesitationMs,
    correct: t.correct,
    errorType: t.errorType,
    retries: t.retries,
    abandoned: t.abandoned,
    meta: t.meta || {},
  };
}

/** Per-session summary — also recomputable from events, never trusted blindly. */
export function summarise(events) {
  const trials = events.length;
  const answered = events.filter((e) => !e.abandoned);
  const correct = events.filter((e) => e.correct).length;
  const abandoned = events.filter((e) => e.abandoned).length;
  const rts = answered.filter((e) => e.correct && e.reactionTimeMs != null).map((e) => e.reactionTimeMs);
  const byDomain = {};
  for (const e of events) {
    const d = (byDomain[e.domain] = byDomain[e.domain] || { trials: 0, correct: 0, rts: [] });
    d.trials += 1;
    if (e.correct) d.correct += 1;
    if (e.correct && e.reactionTimeMs != null) d.rts.push(e.reactionTimeMs);
  }
  for (const d of Object.values(byDomain)) {
    d.accuracy = d.trials ? d.correct / d.trials : 0;
    d.medianRT = median(d.rts);
    delete d.rts;
  }
  return {
    trials,
    correct,
    accuracy: trials ? correct / trials : 0,
    abandonmentRate: trials ? abandoned / trials : 0,
    medianReactionMs: median(rts),
    meanReactionMs: mean(rts),
    byDomain,
  };
}

export function median(arr) {
  if (!arr || !arr.length) return null;
  const a = [...arr].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2);
}
export function mean(arr) {
  if (!arr || !arr.length) return null;
  return Math.round(arr.reduce((s, x) => s + x, 0) / arr.length);
}
