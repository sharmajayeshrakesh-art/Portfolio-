/**
 * plan.js — the training plan itself, as data.
 *
 * Transcribed from the revised PPL document. Two things about the shape here
 * matter:
 *
 * 1. CYCLE is Pull → Push → Legs, twice. That is the order actually trained,
 *    which is not the order the document lists the days in.
 *
 * 2. Exercise ids are shared across sessions wherever the movement is the same
 *    (a lat pulldown is the same lift on Pull 1 and Pull 2, even though the set
 *    counts differ). That is what lets the app answer "which exercise do I skip
 *    most" across the whole plan rather than per day.
 */

/** The rotation. Position in this list is the only notion of "which day" the
 *  app has — see gym.js for why that makes a missed day harmless. */
export const CYCLE = ["pull1", "push1", "legs1", "pull2", "push2", "legs2"];

export const SESSIONS = {
  pull1: {
    name: "Pull 1",
    focus: "Lat width",
    exercises: [
      { id: "lat_pulldown", name: "Wide-Grip Lat Pulldown", reps: "4×8-10", sets: 4, note: "Lat width — full stretch at top" },
      { id: "seated_row", name: "Chest-Supported / Seated Row", reps: "3×10", sets: 3, note: "Lat thickness, mid-back" },
      { id: "straight_arm", name: "Straight-Arm Cable Pulldown", reps: "3×12", sets: 3, note: "Lat isolation" },
      { id: "rev_pec_deck", name: "Reverse Pec Deck", reps: "3×15", sets: 3, note: "Rear delts" },
      { id: "incline_curl", name: "Incline DB Curl", reps: "3×10", sets: 3, note: "Bicep short head, stretched" },
      { id: "hammer_curl", name: "Hammer Curl", reps: "3×12", sets: 3, note: "Brachialis" },
      { id: "hanging_knee", name: "Hanging Knee Raise", reps: "3×12", sets: 3, note: "Abs" },
    ],
  },

  push1: {
    name: "Push 1",
    focus: "Chest",
    exercises: [
      { id: "incline_press", name: "Incline Machine / DB Press", reps: "4×8-10", sets: 4, note: "Upper chest — do FIRST" },
      { id: "flat_press", name: "Flat Machine Chest Press", reps: "3×10", sets: 3, note: "Overall chest" },
      { id: "pec_fly", name: "Pec Deck / Cable Fly", reps: "3×12", sets: 3, note: "Isolation, stretch" },
      { id: "shoulder_press", name: "Machine Shoulder Press", reps: "3×10", sets: 3, note: "Front + medial delts" },
      { id: "lat_raise", name: "Cable Lateral Raise", reps: "4×12-15", sets: 4, note: "Elbow leads the hand" },
      { id: "tri_pushdown", name: "Tricep Pushdown", reps: "3×12", sets: 3 },
      { id: "tri_oh_ext", name: "Overhead Tricep Ext", reps: "3×12", sets: 3, note: "Long head" },
    ],
  },

  legs1: {
    name: "Legs 1",
    focus: "Quad + glute",
    exercises: [
      { id: "squat", name: "Barbell / Hack Squat", reps: "4×8-10", sets: 4, note: "Quads, glutes" },
      { id: "leg_press", name: "Leg Press", reps: "3×12", sets: 3 },
      { id: "bulgarian", name: "Bulgarian Split Squat", reps: "3×10 each", sets: 3, note: "Alternate the starting leg; rest 60-90s between legs" },
      { id: "leg_curl", name: "Seated / Lying Leg Curl", reps: "3×15", sets: 3, note: "Hamstrings" },
      { id: "calf_raise", name: "Standing Calf Raise", reps: "4×15-20", sets: 4 },
      { id: "ab_crunch", name: "Weighted Ab-Machine Crunch", reps: "3×15", sets: 3, note: "Abs" },
    ],
  },

  pull2: {
    name: "Pull 2",
    focus: "Rear delt + bicep",
    exercises: [
      { id: "lat_pulldown", name: "Wide-Grip Lat Pulldown", reps: "4×8-10", sets: 4 },
      { id: "db_row", name: "DB / Machine Row", reps: "3×10", sets: 3, note: "Back thickness" },
      { id: "rev_pec_deck", name: "Reverse Pec Deck", reps: "3×15", sets: 3, note: "Rear delts" },
      { id: "face_pull", name: "Face Pull (cable)", reps: "3×15", sets: 3, note: "Rear delt + posture" },
      { id: "preacher_curl", name: "Preacher / Cable Curl", reps: "3×10", sets: 3 },
      { id: "hammer_curl", name: "Hammer Curl", reps: "3×12", sets: 3 },
      { id: "back_ext", name: "Back Extension (45°)", reps: "3×12", sets: 3, note: "Finish neutral, don't over-arch" },
      { id: "ab_wheel", name: "Ab Wheel / Hollow Hold", reps: "3×10", sets: 3, note: "Anti-extension — helps APT" },
    ],
  },

  push2: {
    name: "Push 2",
    focus: "Shoulders",
    exercises: [
      { id: "shoulder_press", name: "Machine Shoulder Press", reps: "4×8-10", sets: 4, note: "Delts — do FIRST" },
      { id: "lat_raise", name: "Cable Lateral Raise", reps: "4×12-15", sets: 4, note: "Medial delt — priority" },
      { id: "incline_press", name: "Incline Machine Press", reps: "3×10", sets: 3, note: "Upper chest" },
      { id: "pec_fly", name: "Pec Deck Fly", reps: "3×12", sets: 3 },
      { id: "shrugs", name: "DB Shrugs", reps: "3×15", sets: 3, note: "Only once this week" },
      { id: "tri_pushdown", name: "Tricep Pushdown", reps: "3×12", sets: 3 },
      { id: "tri_oh_ext", name: "Overhead Tricep Ext", reps: "3×12", sets: 3 },
    ],
  },

  legs2: {
    name: "Legs 2",
    focus: "Ham/glute",
    exercises: [
      { id: "leg_press", name: "Leg Press", reps: "4×10", sets: 4 },
      { id: "pull_through", name: "Cable Pull-Through", reps: "3×12", sets: 3, note: "Glute/ham hinge — APT key" },
      { id: "leg_curl", name: "Lying Leg Curl", reps: "3×12", sets: 3, note: "Slow eccentric" },
      { id: "bulgarian", name: "Bulgarian Split Squat", reps: "3×10 each", sets: 3, note: "Alternate the starting leg" },
      { id: "calf_raise", name: "Standing Calf Raise", reps: "4×15-20", sets: 4 },
      { id: "dead_bug", name: "Dead Bug + Plank", reps: "3 sets", sets: 3, note: "Deep core for APT" },
    ],
  },
};

/** Sessions per full rotation — the denominator for "a complete week". */
export const SESSIONS_PER_WEEK = CYCLE.length;

export function sessionDef(slot) {
  return SESSIONS[slot] || null;
}

/** Total sets prescribed for a session, for the "18 of 19 sets" summary. */
export function plannedSets(slot) {
  const def = SESSIONS[slot];
  return def ? def.exercises.reduce((n, e) => n + e.sets, 0) : 0;
}

/** Every distinct movement in the plan, with the sessions it appears in. */
export function allExercises() {
  const seen = new Map();
  for (const slot of CYCLE) {
    for (const ex of SESSIONS[slot].exercises) {
      if (!seen.has(ex.id)) seen.set(ex.id, { id: ex.id, name: ex.name, slots: [] });
      seen.get(ex.id).slots.push(slot);
    }
  }
  return [...seen.values()];
}
