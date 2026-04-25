/**
 * session-manager.js
 * In-memory session store for WhatsApp and Telegram SOS flows.
 * Sessions expire after 1 hour automatically.
 */

const sessions = new Map(); // phone/chatId → session data
const TTL_MS   = 60 * 60 * 1000; // 1 hour

export const getSession = async (key) => {
  const entry = sessions.get(String(key));
  if (!entry) return null;
  if (Date.now() - entry.createdAt > TTL_MS) {
    sessions.delete(String(key));
    return null;
  }
  return entry.data;
};

export const setSession = async (key, data) => {
  const existing = sessions.get(String(key));
  sessions.set(String(key), {
    data,
    createdAt: existing?.createdAt ?? Date.now(),
  });
};

export const deleteSession = async (key) => {
  sessions.delete(String(key));
};

// Auto-cleanup expired sessions every 30 min
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of sessions.entries()) {
    if (now - entry.createdAt > TTL_MS) sessions.delete(key);
  }
}, 30 * 60 * 1000);
