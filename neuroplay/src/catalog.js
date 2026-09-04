/**
 * catalog.js — the cognitive map of the app.
 *
 * Every game is tagged with the cognitive DOMAIN it primarily exercises, so
 * the same gameplay that provides therapy also produces per-domain diagnostic
 * signal. Keep this list and the games in sync.
 */

export const DOMAINS = {
  memory: { id: "memory", color: "#0E7C6B", icon: "brain" },
  attention: { id: "attention", color: "#3A6EA5", icon: "target" },
  language: { id: "language", color: "#C77D2E", icon: "chat" },
  reasoning: { id: "reasoning", color: "#7A5AA6", icon: "puzzle" },
  orientation: { id: "orientation", color: "#4E9A6B", icon: "calendar" },
};

export const DOMAIN_ORDER = ["memory", "attention", "language", "reasoning", "orientation"];

export const GAMES = {
  face_name: { id: "face_name", domain: "memory", icon: "face", tKey: "game_face_name" },
  memory_quiz: { id: "memory_quiz", domain: "memory", icon: "photo", tKey: "game_memory_quiz" },
  pattern: { id: "pattern", domain: "attention", icon: "grid", tKey: "game_pattern" },
  word_recall: { id: "word_recall", domain: "language", icon: "chat", tKey: "game_word_recall" },
  orientation: { id: "orientation", domain: "orientation", icon: "calendar", tKey: "game_orientation" },
  number_attention: { id: "number_attention", domain: "reasoning", icon: "puzzle", tKey: "game_number" },
};

export const GAME_ORDER = [
  "face_name",
  "memory_quiz",
  "pattern",
  "word_recall",
  "orientation",
  "number_attention",
];

export function gameDomain(gameId) {
  return (GAMES[gameId] && GAMES[gameId].domain) || "memory";
}
