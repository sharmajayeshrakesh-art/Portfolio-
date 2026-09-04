/**
 * catalog.js — the cognitive map of the app.
 *
 * Every game is tagged with the cognitive DOMAIN it primarily exercises, so
 * the same gameplay that provides therapy also produces per-domain diagnostic
 * signal. Keep this list and the games in sync.
 */

export const DOMAINS = {
  memory: { id: "memory", color: "var(--d-memory)", icon: "brain" },
  attention: { id: "attention", color: "var(--d-attention)", icon: "target" },
  language: { id: "language", color: "var(--d-language)", icon: "chat" },
  reasoning: { id: "reasoning", color: "var(--d-reasoning)", icon: "puzzle" },
  orientation: { id: "orientation", color: "var(--d-orientation)", icon: "calendar" },
};

export const DOMAIN_ORDER = ["memory", "attention", "language", "reasoning", "orientation"];

export const GAMES = {
  face_name: { id: "face_name", domain: "memory", icon: "face", tKey: "game_face_name" },
  memory_quiz: { id: "memory_quiz", domain: "memory", icon: "photo", tKey: "game_memory_quiz" },
  pattern: { id: "pattern", domain: "attention", icon: "grid", tKey: "game_pattern" },
  word_recall: { id: "word_recall", domain: "language", icon: "chat", tKey: "game_word_recall" },
  orientation: { id: "orientation", domain: "orientation", icon: "calendar", tKey: "game_orientation" },
  number_attention: { id: "number_attention", domain: "reasoning", icon: "puzzle", tKey: "game_number" },
  card_match: { id: "card_match", domain: "memory", icon: "grid", tKey: "game_card_match" },
  money: { id: "money", domain: "reasoning", icon: "coin", tKey: "game_money" },
};

export const GAME_ORDER = [
  "card_match",
  "pattern",
  "money",
  "number_attention",
  "word_recall",
  "orientation",
  "face_name",
  "memory_quiz",
];

export function gameDomain(gameId) {
  return (GAMES[gameId] && GAMES[gameId].domain) || "memory";
}
