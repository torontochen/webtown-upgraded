<template>
  <!-- Launcher: shown when the window is closed, same role as the library's fab. -->
  <v-btn
    v-if="!isOpen" icon
    theme="dark"
    :color="launcherColor"
    @click="$emit('open')"
    aria-label="Open guild chat"
  >
    <v-icon>mdi-message-text</v-icon>
  </v-btn>

  <v-card v-else class="guild-chat d-flex flex-column" :color="listColor">
    <v-toolbar density="compact" flat :color="headerColor" :dark="true" class="flex-grow-0">
      <slot name="header"></slot>
      <v-spacer></v-spacer>
      <v-btn icon size="small" @click="$emit('close')" aria-label="Close guild chat">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

    <div ref="scroller" class="guild-chat__messages flex-grow-1">
      <div
        v-for="(message, index) in messageList"
        :key="index"
        class="d-flex my-2"
        :class="isMine(message) ? 'justify-end' : 'justify-start'"
      >
        <!-- Other people's messages carry the avatar, nickname and meta line
             that used to live in the library's `user-avatar` slot. -->
        <div v-if="!isMine(message)" class="d-flex flex-column align-center mr-1">
          <v-avatar size="40">
            <v-img :src="avatarOf(message)" />
          </v-avatar>
          <small class="guild-chat__nickname">{{ message.nickName }}</small>
          <small v-if="message.data && message.data.meta" class="guild-chat__meta">
            {{ message.data.meta }}
          </small>
        </div>

        <div
          class="guild-chat__bubble"
          :style="{ backgroundColor: isMine(message) ? sentColor : receivedColor }"
        >
          <span v-if="message.type === 'emoji'" class="guild-chat__emoji">
            {{ message.data.emoji }}
          </span>
          <!-- Kept the library's class name so App.vue's existing
               `.sc-message--text-content` rule still styles the text. -->
          <p v-else class="sc-message--text-content mb-0">
            {{ message.data.text }}
          </p>
          <small v-if="isMine(message) && message.data && message.data.meta"
                 class="guild-chat__meta d-block text-right">
            {{ message.data.meta }}
          </small>
        </div>
      </div>
    </div>

    <div class="guild-chat__input flex-grow-0" :style="{ backgroundColor: inputColor }">
      <v-textarea variant="solo"
        v-model="draft"
        rows="1"
        auto-grow
        hide-details density="compact" 
        flat
        :background-color="inputColor"
        placeholder="Write a message…"
        @keydown.enter.exact.prevent="send"
      >
        <template v-slot:append>
          <v-btn icon size="small" :disabled="!draft.trim()" @click="send" aria-label="Send">
            <v-icon :color="headerColor">mdi-send</v-icon>
          </v-btn>
        </template>
      </v-textarea>
    </div>
  </v-card>
</template>

<script>
/**
 * Replaces `vue-beautiful-chat` (Phase 4b-3c).
 *
 * The library has no Vue 3 release at any major, ships a 381 kB minified dist
 * with no source, and pulls eight dependencies including `imagemin` (a build
 * tool) and `v-tooltip`, which is itself Vue 2 only. It was the last thing in
 * the app with no forward path.
 *
 * The data contract is unchanged, so App.vue's message and participant
 * plumbing did not move:
 *   - `messageList` items are
 *     `{ author, type: "text"|"emoji", data: { text|emoji, meta }, nickName }`,
 *     where `author === "me"` marks the signed-in resident's own messages
 *   - `participants` are `{ id: residentName, name: nickName, imageUrl }`
 *   - sending emits `send` with the library's `{ type, data: { text } }` shape,
 *     which is what `onMessageWasSent` already expects
 *
 * **Deliberate change: message text is rendered as text, not `v-html`.** The
 * old `text-message-body` slot did `v-html="scopedProps.messageText"` on a
 * value the library had escaped and run through markdown/autolinking. Doing
 * that here without the library's escaping would be stored XSS in guild chat,
 * so the text is interpolated instead. What is lost is auto-linked URLs and
 * light markdown; what goes with it is the `v-html` sink.
 *
 * Not carried over: the emoji picker, and the edit/delete controls. The
 * library rendered edit and delete buttons because `showEdition` and
 * `showDeletion` were true, but **App.vue binds no `@edit` or `@remove`
 * listener** — they emitted into nothing. Emoji still render (`type: "emoji"`
 * messages are handled); only the picker UI is gone, and typing an emoji works.
 */
const pad = (n) => String(n).padStart(2, "0");

/** Matches the "MM-DD HH:mm" App.vue stamps on messages arriving from the server. */
const formatMeta = (d) =>
  `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

export default {
  name: "GuildChat",

  props: {
    messageList: { type: Array, default: () => [] },
    participants: { type: Array, default: () => [] },
    isOpen: { type: Boolean, default: false },
    // The signed-in resident's guild nickname, stamped onto their own
    // outgoing messages so they read the same as everyone else's.
    nickName: { type: String, default: "" },
    // Same nested shape the library took, so App.vue's `colors` object is
    // passed through untouched.
    colors: { type: Object, default: () => ({}) },
  },

  data() {
    return { draft: "" };
  },

  computed: {
    headerColor() {
      return this.colors.header?.bg || "primary";
    },
    launcherColor() {
      return this.colors.launcher?.bg || this.headerColor;
    },
    listColor() {
      return this.colors.messageList?.bg || "white";
    },
    sentColor() {
      return this.colors.sentMessage?.bg || "#E8EAF6";
    },
    receivedColor() {
      return this.colors.receivedMessage?.bg || "#eaeaea";
    },
    inputColor() {
      return this.colors.userInput?.bg || "#f4f7f9";
    },
  },

  watch: {
    messageList() {
      this.scrollToBottom();
    },
    isOpen(open) {
      if (open) this.scrollToBottom();
    },
  },

  mounted() {
    this.scrollToBottom();
  },

  methods: {
    isMine(message) {
      return message.author === "me";
    },

    avatarOf(message) {
      // participants are keyed by residentName, which is what `author` holds
      // for everyone except the signed-in resident.
      const user = this.participants.find((p) => p.id === message.author);
      return user ? user.imageUrl : undefined;
    },

    send() {
      const text = this.draft.trim();
      if (!text) return;

      // App.vue's onMessageWasSent pushes this object straight into
      // messageList, so it has to be a *complete* message, not just the parts
      // the mutation needs.
      //
      // vue-beautiful-chat stamped author "me" itself before invoking the
      // callback. The first version of this component did not, so sent
      // messages arrived with no author — isMine() was false, they rendered
      // as somebody else's, and the avatar lookup and nickname came back
      // empty. That is the missing-avatar report.
      this.$emit("send", {
        author: "me",
        nickName: this.nickName,
        type: "text",
        data: { text, meta: formatMeta(new Date()) },
      });
      this.draft = "";
    },

    scrollToBottom() {
      // The library's alwaysScrollToBottom, which App.vue had set true.
      this.$nextTick(() => {
        const el = this.$refs.scroller;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
  },
};
</script>

<style scoped>
.guild-chat {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.guild-chat__messages {
  overflow-y: auto;
  padding: 8px;
  min-height: 0;
}

.guild-chat__bubble {
  border-radius: 10px;
  padding: 6px 10px;
  max-width: 75%;
  word-break: break-word;
}

.guild-chat__emoji {
  font-size: 22px;
}

.guild-chat__nickname {
  font-size: 10px;
  text-align: center;
}

.guild-chat__meta {
  color: red;
  font-size: 10px;
}

.guild-chat__input {
  padding: 0 8px;
}
</style>
