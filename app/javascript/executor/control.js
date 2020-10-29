import ExecNg from "./engine.js";

export default function Ctl() {
  const self = this;
  let executor = null;

  self.init = function() {
    api("get", "/api/executions/:exec_id", null, null, function(data) {
      executor = new ExecNg(JSON.parse(data.flow_descriptor));
      let flow = executor.flowUntil(data.path);
      buildFlow(flow);
    });
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
    him.innerHTML = node.question;
    exchange.appendChild(him);
    if(node.exit !== null){
        let me = document.createElement("me");
        me.innerHTML = node.exit.label;
        exchange.appendChild(me);
    }else{
        let answers = document.createElement("answers");
        answers.classList.add("answers");
        node.exits.forEach(n => {
            let answer = document.createElement("answer");
            answer.innerHTML = n.label;
            answer.dataset.node = n.to;
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
  
    chat.innerHTML = "";
    checklist.innerHTML = "";
  
    flow.nodes.forEach(x=>{
        chat.appendChild(buildNode(x));
    });
    flow.checklist.forEach(x=>{
        checklist.appendChild(buildChecklistItem(x));
    });
  }
  
  function stepForward() {
    let nextNode = this.dataset.node;
    buildFlow(executor.stepForward(nextNode));

    let exb = document.querySelectorAll("exchange");
    if(exb.length > 0)
        window.scrollTo(0,exb[exb.length-1].offsetTop);
  }
  
  function buildChecklistItem(item) {
    let cli = document.createElement("li");
    cli.innerHTML = item;
    return cli;
  }
}