/**
 * Adapters between this app's date model and Vuetify 3's `v-date-picker`.
 *
 * The app stores dates as `YYYY-MM-DD` strings everywhere: `dateFrom`,
 * `dateTo` and `birthday` are strings in component state, the GraphQL schema
 * types them as `String`, and the server parses them with `new Date(...)`
 * before writing to Mongo. On the way back they arrive as epoch-millisecond
 * strings and are rendered through `moment.utc(...)`.
 *
 * Vuetify 3's picker is asymmetric about this:
 *
 *   - **in**  — its date adapter accepts a `YYYY-MM-DD` string and parses it
 *     with `parseLocalDate`, so the getter can pass the string straight through
 *   - **out** — `update:modelValue` emits a `Date` object
 *
 * So only the write direction needs converting, which is what `toDateString`
 * does. It reads the **local** components rather than calling `toISOString()`,
 * and that choice is the whole point: the adapter built the Date at *local*
 * midnight, so formatting it in UTC would move it back a day for anyone east
 * of UTC — a vendor in Sydney picking the 28th would store the 27th.
 * Reading the local components recovers exactly the day that was clicked, and
 * keeps the string pipeline UTC-consistent end to end the way it already was.
 *
 * This is why the model stayed strings rather than becoming Date objects: the
 * server contract is unchanged, and the off-by-one never gets a chance.
 */

const pad = (n) => String(n).padStart(2, "0");

/** A Date (or null) from the picker → the `YYYY-MM-DD` string the app stores. */
export function toDateString(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Builds the computed pair for a `YYYY-MM-DD` string property, so a component
 * can bind `v-model="dateFromModel"` without repeating the conversion.
 *
 *   computed: { dateFromModel: dateModel("dateFrom") }
 */
export function dateModel(key) {
  return {
    get() {
      // Passed through unchanged — Vuetify's adapter parses YYYY-MM-DD itself.
      return this[key];
    },
    set(value) {
      this[key] = toDateString(value);
    },
  };
}

export default dateModel;
