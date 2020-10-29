export default function FlowEd() {
  const self = this;

  self.init = function(engine, canvas, emitter, fps) {
    self.refs = {
      emitter: document.querySelector("emitter"),
      selection: document.querySelector("#selection"),
      selection_exits: document.querySelector("#selection [data-role='exits']"),
      selection_tasks: document.querySelector("#selection [data-role='tasks']"),
      selection_add_task: document.querySelectorAll("[data-action='selection.add.task']"),
      selection_add_exit: document.querySelectorAll("[data-action='selection.add.exit']"),
      selection_update_title: document.querySelector("[data-action='selection.update.title']"),
      selection_update_step: document.querySelector("[data-action='selection.update.step']"),
      selection_delete: document.querySelector("[data-action='selection.delete']")
    }

    rigActions();
    self.fng = engine;
    self.fng.init(canvas, emitter, fps);

    loadDescriptor();
  }

  self.save = function() {
    const descriptor = self.fng.engine.export();
    api("put", "/api/flows/:id", descriptor, "text/plain; charset=utf-8", function() {
      alert("shit is saved!");
    });
  }

  function api(method, url, body, content_type, callback){
    const authorization_token = document.body.dataset.authorization;
    const flow_id = document.body.dataset.flowId;

    let req = new XMLHttpRequest();
    req.onload = function() {
      callback(JSON.parse(req.responseText));
    };
    req.open(method, url.replace(":id",flow_id), true);
    req.setRequestHeader("authorization", authorization_token);
    if(content_type) { req.setRequestHeader("Content-type", content_type); }
    req.send(body);
  }

  function loadDescriptor() {
    api("get", "/api/flows/:id", null, null, function(flow_data) {
      self.fng.engine.import(flow_data.descriptor);
    });
  }

  function rigActions() {
    self.refs.emitter.addEventListener("fngin_step_selected", function() {
      self.refs.selection.classList.remove("-active");

      if(self.fng.engine.selectedStep()) {
        initSelected();
        self.refs.selection.classList.add("-active");
      }
    });

    self.refs.selection_add_task.forEach(function(action) {
      action.addEventListener("click", function() {
        const refs = self.fng.engine.addTask(self.fng.engine.selectedStep().id, null);
        let structure = getStructure("task", {step: refs.step, task: refs.task});
        self.refs.selection_tasks.appendChild(structure);
      });
    });

    self.refs.selection_add_exit.forEach(function(action) {
      action.addEventListener("click", function() {
        const refs = self.fng.engine.addExit(self.fng.engine.selectedStep().id, null);
        let structure = getStructure("exit", {step: refs.step, exit: refs.exit});
        self.refs.selection_exits.appendChild(structure);
      });
    });

    self.refs.selection_update_title.addEventListener("keyup", function() {
      self.fng.engine.updateStep(self.fng.engine.selectedStep().id, {
        title: this.value
      });
    });

    self.refs.selection_update_step.addEventListener("keyup", function() {
      self.fng.engine.updateStep(self.fng.engine.selectedStep().id, {
        step: this.value
      });
    });

    self.refs.selection_delete.addEventListener("click", function() {
      self.fng.engine.removeStep(self.fng.engine.selectedStep().id);
    });
  }

  function getStructure(structure, datas, values) {
    const st = document.querySelector("[data-structure='" + structure + "']");
    if(st){
      const dup = st.cloneNode(true);

      dup.removeAttribute("data-structure");

      for(var data in datas) {
        dup.dataset[data] = datas[data];
      }

      switch(structure) {
        case "task":
        {
          let fromSelect = dup.querySelector("select[data-role='from']");
          let labelInput = dup.querySelector("input[data-role='label']");
          fromSelect.addEventListener("change", function() {
            const nroot = getNRoot(this).dataset;
            self.fng.engine.updateTask(nroot.step, nroot.task, {from: this.value});
          });
          labelInput.addEventListener("keyup", function() {
            const nroot = getNRoot(this).dataset;
            self.fng.engine.updateTask(nroot.step, nroot.task, {label: this.value});
          });
          dup.querySelector("button[data-role='delete']").addEventListener("click", function() {
            const nroot = getNRoot(this);
            self.fng.engine.removeTask(nroot.dataset.step, nroot.dataset.task);
            nroot.remove();
          });
          fromSelect.innerHTML = "";
          let allOption = document.createElement("option");
          allOption.innerText = "*) Anywhere";
          fromSelect.appendChild(allOption);
          self.fng.engine.activeSteps(true).forEach(function(step) {
            let option = document.createElement("option");
            option.value = step.uid;
            option.innerText = step.sequence + ") " + step.title;
            fromSelect.appendChild(option);
          });

          if(values) {
            if(values.from) {
              fromSelect.value = values.from;
            }
            if(values.label) {
              labelInput.value = values.label;
            }
          }
        }
        break;
        case "exit":
        {
          let fromSelect = dup.querySelector("select[data-role='from']");
          let toSelect = dup.querySelector("select[data-role='to']");
          let labelInput = dup.querySelector("input[data-role='label']");
          fromSelect.addEventListener("change", function() {
            const nroot = getNRoot(this).dataset;
            self.fng.engine.updateExit(nroot.step, nroot.exit, {from: this.value});
          });
          toSelect.addEventListener("change", function() {
            const nroot = getNRoot(this).dataset;
            self.fng.engine.updateExit(nroot.step, nroot.exit, {to: this.value});
          });
          labelInput.addEventListener("keyup", function() {
            const nroot = getNRoot(this).dataset;
            self.fng.engine.updateExit(nroot.step, nroot.exit, {label: this.value});
          });
          dup.querySelector("button[data-role='delete']").addEventListener("click", function() {
            const nroot = getNRoot(this).dataset;
            self.fng.engine.removeExit(nroot.dataset.step, nroot.dataset.exit);
            nroot.remove();
          });
          dup.addEventListener("mouseenter", function(){
            self.fng.engine.signal("highlight_exit", {
              step: this.dataset.step,
              exit: this.dataset.exit
            });
          });
          dup.addEventListener("mouseleave", function(){
            self.fng.engine.unsignal("highlight_exit");
          });
          fromSelect.innerHTML = "";
          toSelect.innerHTML = "";
          let allOption = document.createElement("option");
          allOption.innerText = "*) Anywhere";
          fromSelect.appendChild(allOption);
          let noneOption = document.createElement("option");
          noneOption.innerText = "x) Nowhere";
          toSelect.appendChild(noneOption);
          self.fng.engine.activeSteps(true).forEach(function(step) {
            let option = document.createElement("option");
            option.value = step.uid;
            option.innerText = step.sequence + ") " + step.title;
            fromSelect.appendChild(option);
            toSelect.appendChild(option.cloneNode(true));
          });

          if(values) {
            if(values.from) {
              fromSelect.value = values.from;
            }
            if(values.to) {
              toSelect.value = values.to;
            }
            if(values.label) {
              labelInput.value = values.label;
            }
          }
        }
        break;
      }
      return dup;
    }
    return null;
  }

  function getNRoot(caller) {
    if(!caller.parentNode) { return null; }
    if(!caller.parentNode.dataset.nlevel && caller.parentNode.dataset.nlevel !== "root") { 
      return getNRoot(caller.parentNode); 
    }
    return caller.parentNode;
  }

  function initSelected() {
    let step = self.fng.engine.selectedStep();
    self.refs.selection.querySelector("input[data-role='title']").value = step.title;
    self.refs.selection.querySelector("textarea[data-role='step']").value = step.step;
    self.refs.selection.querySelector("[data-role='ordinal']").innerText = step.sequentialId;
    self.refs.selection.querySelector("[data-role='tasks']").innerHTML = "";
    self.refs.selection.querySelector("[data-role='exits']").innerHTML = "";

    step.exits.forEach(function(exit) {
      let structure = getStructure("exit", {step: step.id, exit: exit.id}, {
        from: exit.from ? exit.from.id : null,
        to: exit.to ? exit.to.id : null,
        label: exit.label
      });
      self.refs.selection_exits.appendChild(structure);
    });

    step.tasks.forEach(function(task) {
      let structure = getStructure("task", {step: step.id, task: task.id}, {
        from: task.from ? task.from.id : null,
        label: task.label
      });
      self.refs.selection_tasks.appendChild(structure);
    });
  }

  return self;
}