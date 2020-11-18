import ExecNg from "./engine.js";

export default function Ctl() {
  const self = this;
  let executor = null;

  self.init = function() {
    api("get", "/api/executions/:exec_id", null, null, function(data) {
      executor = new ExecNg(JSON.parse(data.flow_descriptor));
      buildFlow(executor.setPath(data.path));
      if(executor.executionComplete()) {
        let checklist = document.querySelector(".flow .checklist");
        window.scroll(0,Math.max(0,checklist.offsetTop));
      }
    });

    document.querySelectorAll(".options input[type='checkbox']").forEach(function(checkbox) {
      checkbox.addEventListener("change", self.buildEmbedCode)
    });

    self.buildEmbedCode();
  }

  self.buildEmbedCode = function() {
    let embed = document.querySelector("#embed");
    let base_url = embed.dataset.base;
    let query = "";
    document.querySelectorAll(".options input[type='checkbox']").forEach(function(checkbox) {
      if(checkbox.checked){ query += `&${checkbox.dataset.param}=1`; }
    });
    let url = `${base_url}${query === "" ? "" : "?"}${query.substring(1)}`;
    let code = `<iframe 
  src="${url}"
  width="600"
  height="500"
  frameborder="0">
</iframe>`;
    embed.querySelector("pre").innerText = code;
  }

  function api(method, url, body, content_type, callback){
    const authorization_token = document.body.dataset.authorization;
    const flow_id = document.body.dataset.flowId;
    const execution_id = document.body.dataset.executionId;

    let req = new XMLHttpRequest();
    req.onload = function() {
      callback(JSON.parse(req.responseText));
    };
    req.open(method, url.replace(":flow_id",flow_id).replace(":exec_id",execution_id), true);
    req.setRequestHeader("authorization", authorization_token);
    if(content_type) { req.setRequestHeader("Content-type", content_type); }
    req.send(body);
  }
  
  function buildNode(node) {
    let exchange = document.createElement("exchange");
    exchange.dataset.id = node.id;
    let him = document.createElement("him");
    him.innerHTML = node.question.replaceAll("\n","<br/>");
    exchange.appendChild(him);
    if(node.exit !== null){
        let me = document.createElement("me");
        me.innerHTML = node.exit.label.replaceAll("\n","<br/>");
        exchange.appendChild(me);
    }else{
        let answers = document.createElement("answers");
        answers.classList.add("answers");
        node.exits.forEach(n => {
            let answer = document.createElement("answer");
            answer.innerHTML = n.label.replaceAll("\n","<br/>");
            answer.dataset.exitId = n.uid;
            answer.addEventListener("click",stepForward)
            answers.appendChild(answer);
        });
        exchange.appendChild(answers);
    }
    return exchange;
  }
  
  function buildFlow(flow) {
    let chat = document.querySelector(".chat");
    let checklist = document.querySelector(".checklist ul");
    let checklist_wrapper = document.querySelector(".checklist")
  
    chat.innerHTML = "";
    checklist.innerHTML = "";
    checklist_wrapper.classList.remove("-visible");
  
    flow.nodes.forEach(x=>{
        chat.appendChild(buildNode(x));
    });
    flow.checklist.forEach(x=>{
        checklist.appendChild(buildChecklistItem(x));
    });

    if(flow.checklist.length > 0) {
      checklist_wrapper.classList.add("-visible");
    }
  }
  
  function stepForward() {
    let exitId = this.dataset.exitId;
    buildFlow(executor.stepForward(exitId));

    let chatBound = document.querySelector(".flow .chat").getBoundingClientRect();
    let scrollPosition = chatBound.height - window.innerHeight;
    scrollPosition += 30;

    if(executor.executionComplete()) {
      let checklist = document.querySelector(".flow .checklist");
      scrollPosition = checklist.offsetTop;
    }

    window.scroll(0,Math.max(0,scrollPosition));

    api("put", "/api/executions/:exec_id", JSON.stringify({
      path: executor.currentPath.join("/"),
      completed: executor.executionComplete()
    }), "text/plain; charset=utf-8", function() {
      // silence is golden
    });
  }
  
  function buildChecklistItem(item) {
    let cli = document.createElement("li");
    cli.innerHTML = item.label;
    return cli;
  }
}