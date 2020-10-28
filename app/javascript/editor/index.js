import FlowNg from "./engine.js";
import FlowEd from "./editor.js";

window.addEventListener("DOMContentLoaded", function() {
  window.fEd = new FlowEd();
  let engine = new FlowNg();
  window.fEd.init(engine, document.querySelector("#editor canvas"), "emitter", 60);
});
