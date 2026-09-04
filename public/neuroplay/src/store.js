/**
 * store.js — the single on-device data layer for NeuroPlay.
 *
 * Everything lives in IndexedDB so it survives offline, handles binary blobs
 * (caregiver photos / audio) and does not hit the 5 MB localStorage cap.
 * Nothing here ever leaves the device — there is no network code in this file
 * by design.
 *
 * Object stores
 *   settings   keyPath 'key'         app settings (language, mode, pin, tts…)
 *   patient    keyPath 'id'          the person being supported (usually one)
 *   sessions   keyPath 'id'          one play sitting, with a computed summary
 *   events     keyPath 'id'          one trial/interaction inside a game
 *   content    keyPath 'id'          caregiver uploads: faces, quiz items, reminders
 *   blobs      keyPath 'id'          photo/audio binary, referenced by content.blobId
 *   voice      keyPath 'id'          family-voice recordings, keyed by phrase hash
 */

const DB_NAME = "neuroplay";
const DB_VERSION = 2;

let _dbPromise = null;

function openDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (!db.objectStoreNames.contains("settings")) {
        db.createStore = null; // noop guard
        db.createObjectStore("settings", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("patient")) {
        db.createObjectStore("patient", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("sessions")) {
        const s = db.createObjectStore("sessions", { keyPath: "id" });
        s.createIndex("byStartedAt", "startedAt");
      }
      if (!db.objectStoreNames.contains("events")) {
        const ev = db.createObjectStore("events", { keyPath: "id" });
        ev.createIndex("bySession", "sessionId");
        ev.createIndex("byDomain", "domain");
      }
      if (!db.objectStoreNames.contains("content")) {
        const c = db.createObjectStore("content", { keyPath: "id" });
        c.createIndex("byType", "type");
      }
      if (!db.objectStoreNames.contains("blobs")) {
        db.createObjectStore("blobs", { keyPath: "id" });
      }
      // v2: a relative's own voice, one recording per phrase.
      if (!db.objectStoreNames.contains("voice")) {
        const v = db.createObjectStore("voice", { keyPath: "id" });
        v.createIndex("byLang", "lang");
      }
      void e;
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
}

function tx(store, mode, fn) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, mode);
        const os = t.objectStore(store);
        let result;
        Promise.resolve(fn(os)).then((r) => (result = r));
        t.oncomplete = () => resolve(result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      })
  );
}

function reqToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const store = {
  // ---- generic helpers -------------------------------------------------
  put(storeName, value) {
    return tx(storeName, "readwrite", (os) => reqToPromise(os.put(value)));
  },
  get(storeName, key) {
    return tx(storeName, "readonly", (os) => reqToPromise(os.get(key)));
  },
  getAll(storeName) {
    return tx(storeName, "readonly", (os) => reqToPromise(os.getAll()));
  },
  delete(storeName, key) {
    return tx(storeName, "readwrite", (os) => reqToPromise(os.delete(key)));
  },
  clear(storeName) {
    return tx(storeName, "readwrite", (os) => reqToPromise(os.clear()));
  },
  getByIndex(storeName, indexName, value) {
    return tx(storeName, "readonly", (os) =>
      reqToPromise(os.index(indexName).getAll(value))
    );
  },

  // ---- settings (key/value) -------------------------------------------
  async setSetting(key, value) {
    return this.put("settings", { key, value });
  },
  async getSetting(key, fallback = null) {
    const row = await this.get("settings", key);
    return row ? row.value : fallback;
  },
  async getSettings() {
    const rows = await this.getAll("settings");
    const out = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  },

  // ---- sessions & events ----------------------------------------------
  saveSession(session) {
    return this.put("sessions", session);
  },
  allSessions() {
    return this.getAll("sessions").then((rows) =>
      rows.sort((a, b) => a.startedAt - b.startedAt)
    );
  },
  saveEvent(ev) {
    return this.put("events", ev);
  },
  eventsForSession(sessionId) {
    return this.getByIndex("events", "bySession", sessionId);
  },
  allEvents() {
    return this.getAll("events");
  },

  // ---- content (faces, quiz, reminders) + blobs -----------------------
  async saveContent(item, blob) {
    if (blob) {
      const blobId = item.blobId || cryptoId();
      await this.put("blobs", { id: blobId, blob });
      item.blobId = blobId;
    }
    return this.put("content", item);
  },
  contentByType(type) {
    return this.getByIndex("content", "byType", type);
  },
  async blobURL(blobId) {
    if (!blobId) return null;
    const row = await this.get("blobs", blobId);
    if (!row) return null;
    return URL.createObjectURL(row.blob);
  },

  // ---- family voice recordings ----------------------------------------
  // Keyed by the same phrase hash the bundled voicebank uses, so a recorded
  // phrase simply takes precedence over the synthetic one.
  saveVoiceClip(row) {
    return this.put("voice", row);
  },
  voiceClip(id) {
    return this.get("voice", id);
  },
  voiceClipsFor(lang) {
    return this.getByIndex("voice", "byLang", lang);
  },
  deleteVoiceClip(id) {
    return this.delete("voice", id);
  },

  // ---- wholesale reset (used by demo re-seed) -------------------------
  async wipeGameData() {
    await this.clear("sessions");
    await this.clear("events");
  },
  async wipeEverything() {
    for (const s of ["settings", "patient", "sessions", "events", "content", "blobs", "voice"])
      await this.clear(s);
  },
};

// Small stable id generator (crypto if available, else timestamp+random).
export function cryptoId() {
  if (globalThis.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}
