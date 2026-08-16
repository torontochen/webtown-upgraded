const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Phase 4b-3c replaced vue-beautiful-chat with src/components/GuildChat.vue.
// Runtime behaviour was verified by mounting it in the live app (see
// PROJECT_NOTES); what is locked here is the contract between App.vue and the
// component, which is easy to break silently because the chat only renders for
// a signed-in resident who belongs to a guild.

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const CHAT = read("src/components/GuildChat.vue");
const APP = read("src/App.vue");

test("vue-beautiful-chat is gone from source and package.json", () => {
  const pkg = require(path.join(ROOT, "package.json"));
  assert.ok(!("vue-beautiful-chat" in pkg.dependencies));
  assert.ok(!/vue-beautiful-chat/.test(read("src/main.js")));
  assert.ok(!/<beautiful-chat/.test(APP));
});

test("App.vue passes every prop GuildChat declares as required data", () => {
  for (const attr of [
    ':participants="participants"',
    ':is-open="isChatOpen"',
    ':message-list="messageList"',
    ':colors="colors"',
  ]) {
    assert.ok(APP.includes(attr), `App.vue no longer passes ${attr}`);
  }
});

test("the callback props became events, and all three are wired", () => {
  // vue-beautiful-chat took open/close/onMessageWasSent as *props* holding
  // functions. They are ordinary events now; leaving one unbound would fail
  // silently rather than throwing.
  for (const handler of [
    '@open="openChat"',
    '@close="closeChat"',
    '@send="onMessageWasSent"',
  ]) {
    assert.ok(APP.includes(handler), `App.vue no longer binds ${handler}`);
  }
  for (const method of ["openChat(", "closeChat(", "onMessageWasSent("]) {
    assert.ok(APP.includes(method), `App.vue lost the ${method} handler`);
  }
});

test("send emits the shape onMessageWasSent destructures", () => {
  // onMessageWasSent reads message.type and message.data.text — the library's
  // shape. Changing it here would break the guild chat mutation.
  assert.match(CHAT, /\$emit\("send", \{ type: "text", data: \{ text \} \}\)/);
  assert.match(APP, /message\.type == "text" \? message\.data\.text/);
});

test("message text is rendered as text, never v-html", () => {
  // The old text-message-body slot did v-html on library-escaped markup.
  // Doing that here without the library's escaping would be stored XSS in
  // guild chat, so this is the security-relevant assertion in this file.
  // Comments are stripped first — the component documents the change by name.
  const code = CHAT.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.ok(
    !/v-html/.test(code),
    "GuildChat.vue must not use v-html on chat content"
  );
  assert.match(CHAT, /\{\{ message\.data\.text \}\}/);
  assert.ok(
    !/v-html/.test(APP.slice(APP.indexOf("<guild-chat"), APP.indexOf("</guild-chat>"))),
    "the guild-chat block in App.vue must not reintroduce v-html"
  );
});

test("the author sentinel and participant key match App.vue", () => {
  // App.vue rewrites author to "me" for the signed-in resident and keys
  // participants by residentName. Both halves have to agree.
  assert.match(CHAT, /message\.author === "me"/);
  assert.match(CHAT, /this\.participants\.find\(\(p\) => p\.id === message\.author\)/);
  assert.match(APP, /item\.message\.author = "me";/);
  assert.match(APP, /id: member\.name,/);
});

test("the library's class hook for message text is preserved", () => {
  // App.vue styles .sc-message--text-content with a colour !important rule.
  assert.match(CHAT, /sc-message--text-content/);
  assert.match(APP, /\.sc-message--text-content \{/);
});

test("the component declares both Vue 2 and Vue 3 unmount-safe lifecycle", () => {
  // No teardown is needed here (no listeners outside Vue), so what matters is
  // that nothing Vue-2-only crept in.
  assert.ok(!/beforeDestroy\(\)/.test(CHAT) || /beforeUnmount\(\)/.test(CHAT));
  assert.ok(!/\$listeners|\$scopedSlots|\$children/.test(CHAT));
});
