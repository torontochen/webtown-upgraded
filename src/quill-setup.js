/**
 * Quill must exist on `window` before quill-image-resize-module is evaluated.
 *
 * webpack did this with `new webpack.ProvidePlugin({ Quill: ... })` in
 * vue.config.js, plus a `<script src="/node_modules/...">` tag in index.html
 * that only ever worked because webpack-dev-server served node_modules.
 *
 * Vite has no ProvidePlugin, so the assignment is explicit. main.js imports
 * this module first; ES module imports evaluate in declaration order, so
 * `window.Quill` is set before the resize module's import runs.
 */
import Quill from "quill";

window.Quill = Quill;

export default Quill;
