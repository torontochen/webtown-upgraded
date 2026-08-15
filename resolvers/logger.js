/**
 * Minimal leveled logger for the server.
 *
 * The Phase 0 audit reported "1,617 console.log calls" across the codebase.
 * That count included commented-out code, which is the overwhelming majority.
 * The live server-side total is **27** — 17 of them in Subscription.js, which
 * logged a line every time any client opened any subscription.
 *
 * At that size, pulling in pino and its transitive dependencies costs more
 * (install weight, audit surface) than it returns. This is a ~30-line
 * replacement that provides what was actually missing: levels, a threshold, and
 * timestamps, so subscription chatter can be silenced in production without
 * losing errors.
 *
 * Set LOG_LEVEL to error | warn | info | debug (default: info).
 * Swapping this for pino later is a one-file change.
 */

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const threshold = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

function emit(level, stream, args) {
  if (LEVELS[level] > threshold) return;
  stream(`[${new Date().toISOString()}] ${level.toUpperCase()}:`, ...args);
}

const logger = {
  error: (...a) => emit("error", console.error, a),
  warn: (...a) => emit("warn", console.warn, a),
  info: (...a) => emit("info", console.log, a),
  debug: (...a) => emit("debug", console.log, a),
};

module.exports = { logger, LEVELS };
