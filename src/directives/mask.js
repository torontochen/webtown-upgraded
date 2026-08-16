/**
 * Replaces `vue-the-mask`'s `mask` directive (Phase 4b-3).
 *
 * That package is Vue 2 only and unmaintained. It is MIT licensed and its
 * masking core is small, so the string-mask path is reproduced here rather
 * than swapped for a differently-behaving library — this drives the phone
 * fields on vendor signup and vendor profile, and a subtle change in how a
 * half-typed number formats is exactly the kind of thing that would not be
 * noticed until a user complained.
 *
 * A **plain function** is directive shorthand in both Vue 2 (`bind` + `update`)
 * and Vue 3 (`mounted` + `updated`), so this file needs no change at the 4b-4
 * flip. That is also how vue-the-mask registered itself, so the Vue 2
 * behaviour is identical.
 *
 * Dropped from the original: the dynamic-mask path, where `mask` is an array
 * of candidate masks. Both call sites pass the single string "(###)###-####".
 * Passing an array now throws rather than silently formatting wrongly.
 */

const TOKENS = {
  "#": { pattern: /\d/ },
  X: { pattern: /[0-9a-zA-Z]/ },
  S: { pattern: /[a-zA-Z]/ },
  A: { pattern: /[a-zA-Z]/, transform: (v) => v.toLocaleUpperCase() },
  a: { pattern: /[a-zA-Z]/, transform: (v) => v.toLocaleLowerCase() },
  "!": { escape: true },
};

/**
 * Format `value` against `mask`. Ported from vue-the-mask's maskit(), keeping
 * its behaviour including the trailing-literal handling that stops "(" from
 * appearing before the user has typed a digit.
 */
export function maskit(value, mask) {
  value = value || "";
  mask = mask || "";

  let iMask = 0;
  let iValue = 0;
  let output = "";

  while (iMask < mask.length && iValue < value.length) {
    let cMask = mask[iMask];
    const token = TOKENS[cMask];
    const cValue = value[iValue];

    if (token && !token.escape) {
      if (token.pattern.test(cValue)) {
        output += token.transform ? token.transform(cValue) : cValue;
        iMask++;
      }
      iValue++;
    } else {
      if (token && token.escape) {
        iMask++; // the next mask char is a literal
        cMask = mask[iMask];
      }
      output += cMask;
      if (cValue === cMask) iValue++; // user typed the literal themselves
      iMask++;
    }
  }

  // Trailing literals are only emitted when nothing else follows them, so a
  // mask ending "(#)" does not render the ")" until the digit is there.
  let rest = "";
  while (iMask < mask.length) {
    const cMask = mask[iMask];
    if (TOKENS[cMask]) {
      rest = "";
      break;
    }
    rest += cMask;
    iMask++;
  }

  return output + rest;
}

// Vuetify's v-model listens for a native `input` event, so the directive has
// to dispatch one after rewriting the value.
function inputEvent() {
  const evt = document.createEvent("Event");
  evt.initEvent("input", true, true);
  return evt;
}

export default function mask(el, binding) {
  const config = binding.value;

  if (Array.isArray(config)) {
    throw new Error(
      "v-mask: array (dynamic) masks are not supported; pass a mask string"
    );
  }

  // The directive is applied to <v-text-field>, so it lands on the component's
  // root element and has to find the real input underneath.
  let input = el;
  if (input.tagName.toLocaleUpperCase() !== "INPUT") {
    const inputs = el.getElementsByTagName("input");
    if (inputs.length !== 1) {
      throw new Error(
        `v-mask directive requires 1 input, found ${inputs.length}`
      );
    }
    input = inputs[0];
  }

  input.oninput = function (evt) {
    if (!evt.isTrusted) return; // the event we dispatch below would re-enter

    // Keep the caret where it was, then walk it forward past any mask
    // literals the rewrite inserted before the character just typed.
    let position = input.selectionEnd;
    const typed = input.value[position - 1];
    input.value = maskit(input.value, config);
    while (
      position < input.value.length &&
      input.value.charAt(position - 1) !== typed
    ) {
      position++;
    }

    if (input === document.activeElement) {
      input.setSelectionRange(position, position);
      setTimeout(() => input.setSelectionRange(position, position), 0);
    }

    input.dispatchEvent(inputEvent());
  };

  // Format whatever the field was seeded with (an existing vendor's phone
  // number on the profile form).
  const formatted = maskit(input.value, config);
  if (formatted !== input.value) {
    input.value = formatted;
    input.dispatchEvent(inputEvent());
  }
}
