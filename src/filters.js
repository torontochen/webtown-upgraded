// The seven template filters that used to be registered with `Vue.filter`.
//
// Vue 3 removes filters and the `|` syntax outright, so they are plain
// functions here, exposed on every component as `$filters` (see main.js).
// Templates call them as `{{ $filters.formatIntAmount(x) }}` — a form that is
// identical under Vue 2 and Vue 3, so this landed before the framework flip.
//
// Behaviour is unchanged from the `Vue.filter` bodies, including the `new
// Number(value)` coercion the date filters have always used.
//
// `ellipsis-order-no` is not carried over: it had no call site anywhere in
// `src/`, only its definition in main.js.
import moment from "moment";

export const convertDate = (value) =>
  moment.utc(new Number(value)).format("YYYY-MM-DD");

export const convertCustomerRatingTime = (value) =>
  moment.utc(new Number(value)).format("MMMM Do YYYY, h:mm:ss a");

export const ellipsisDescription = (value) =>
  value.length > 20 ? value.substr(0, 15) + "..." + value.substr(-4) : value;

export const formatCurrencyAmount = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    trailingZeroDisplay: "auto",
  }).format(value);

export const formatAmount = (value) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);

export const formatIntAmount = (value) =>
  new Intl.NumberFormat("en-US", {}).format(value);

export default {
  convertDate,
  convertCustomerRatingTime,
  ellipsisDescription,
  formatCurrencyAmount,
  formatAmount,
  formatIntAmount,
};
