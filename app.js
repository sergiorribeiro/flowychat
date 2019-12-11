function loadjson(file,callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4){
            if(this.status == 200){callback(JSON.parse(this.responseText));}
            if(this.status != 200){
                console.log("whoopsie");
            }
        }
    };
    xhttp.open("get", file, true);
    xhttp.send();
}

function updatePermalink() {
    document.querySelector("#permalink").innerHTML = location.href;
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
            answer.dataset.node = n.target;
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
    let flowData = window.executor.currentPath.join("/");
    flowData = `${window.flow}/${flowData}`;
    buildFlow(window.executor.stepForward(nextNode));
    history.replaceState({},"","/?" + flowData);
    updatePermalink();
    let exb = document.querySelectorAll("exchange");
    if(exb.length > 0)
        window.scrollTo(0,exb[exb.length-1].offsetTop);
}

function buildChecklistItem(item) {
    let cli = document.createElement("li");
    cli.innerHTML = item;
    return cli;
}

(function () {
    let href = window.location.href;
    let qsStart = href.indexOf("?");
    window.path = qsStart == -1 ? "0" : href.substring(qsStart + 1);
    window.flow = window.path.split("/")[0];
    window.path = window.path.substring(window.path.indexOf("/") + 1);

    loadjson(`${window.flow}.json`, x => {
        window.executor = new Executor(x);

        window.executor.path = window.path;
        let flow = window.executor.flowThrough(window.path);

        buildFlow(flow);

        updatePermalink();
    });
}());