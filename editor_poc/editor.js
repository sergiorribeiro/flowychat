(function(){
  window.refs = {
    selection: document.querySelector("#selection"),
    selection_exits: document.querySelector("#selection [data-role='exits']"),
    selection_tasks: document.querySelector("#selection [data-role='tasks']")
  };

  window.editor = {
    rigActions: function() {
      document.querySelector("emitter").addEventListener("fngin_step_selected", function() {
        window.refs.selection.classList.remove("-active");

        if(window.fE.selectedStep()) {
          window.editor.initSelected();
          window.refs.selection.classList.add("-active");
        }
      });

      document.querySelectorAll("[data-action='selection.add.task']").forEach(function(action) {
        action.addEventListener("click", function() {
          const refs = window.fE.addTask(window.fE.selectedStep().id, null);
          let structure = window.editor.getStructure("task", {step: refs.step, task: refs.task});
          window.refs.selection_tasks.appendChild(structure);
        });
      });

      document.querySelectorAll("[data-action='selection.add.exit']").forEach(function(action) {
        action.addEventListener("click", function() {
          const refs = window.fE.addExit(window.fE.selectedStep().id, null);
          let structure = window.editor.getStructure("exit", {step: refs.step, exit: refs.exit});
          window.refs.selection_exits.appendChild(structure);
        });
      });

      document.querySelector("[data-action='selection.update.title']").addEventListener("keyup", function() {
        window.fE.updateStep(window.fE.selectedStep().id, {
          title: this.value
        });
      });

      document.querySelector("[data-action='selection.update.step']").addEventListener("keyup", function() {
        window.fE.updateStep(window.fE.selectedStep().id, {
          step: this.value
        });
      });

      document.querySelector("[data-action='selection.delete']").addEventListener("click", function() {
        window.fE.removeStep(window.fE.selectedStep().id);
      });
    },

    getStructure: function(structure, datas, values) {
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
                const nroot = window.editor.getNRoot(this).dataset;
                window.fE.updateTask(nroot.step, nroot.task, {from: this.value});
              });
              labelInput.addEventListener("keyup", function() {
                const nroot = window.editor.getNRoot(this).dataset;
                window.fE.updateTask(nroot.step, nroot.task, {label: this.value});
              });
              dup.querySelector("button[data-role='delete']").addEventListener("click", function() {
                const nroot = window.editor.getNRoot(this);
                window.fE.removeTask(nroot.dataset.step, nroot.dataset.task);
                nroot.remove();
              });
              fromSelect.innerHTML = "";
              let allOption = document.createElement("option");
              allOption.innerText = "*) Anywhere";
              fromSelect.appendChild(allOption);
              window.fE.activeSteps(true).forEach(function(step) {
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
                const nroot = window.editor.getNRoot(this).dataset;
                window.fE.updateExit(nroot.step, nroot.exit, {from: this.value});
              });
              toSelect.addEventListener("change", function() {
                const nroot = window.editor.getNRoot(this).dataset;
                window.fE.updateExit(nroot.step, nroot.exit, {to: this.value});
              });
              labelInput.addEventListener("keyup", function() {
                const nroot = window.editor.getNRoot(this).dataset;
                window.fE.updateExit(nroot.step, nroot.exit, {label: this.value});
              });
              dup.querySelector("button[data-role='delete']").addEventListener("click", function() {
                const nroot = window.editor.getNRoot(this).dataset;
                window.fE.removeExit(nroot.dataset.step, nroot.dataset.exit);
                nroot.remove();
              });
              fromSelect.innerHTML = "";
              toSelect.innerHTML = "";
              let allOption = document.createElement("option");
              allOption.innerText = "*) Anywhere";
              fromSelect.appendChild(allOption);
              let noneOption = document.createElement("option");
              noneOption.innerText = "x) Nowhere";
              toSelect.appendChild(noneOption);
              window.fE.activeSteps(true).forEach(function(step) {
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
    },

    getNRoot: function(caller) {
      if(!caller.parentNode) { return null; }
      if(!caller.parentNode.dataset.nlevel && 
          caller.parentNode.dataset.nlevel !== "root") { 
        return window.editor.getNRoot(caller.parentNode); 
      }
      return caller.parentNode;
    },

    initSelected: function() {
      let step = window.fE.selectedStep();
      window.refs.selection.querySelector("input[data-role='title']").value = step.title;
      window.refs.selection.querySelector("textarea[data-role='step']").value = step.step;
      window.refs.selection.querySelector("[data-role='ordinal']").innerText = step.sequentialId;
      window.refs.selection.querySelector("[data-role='tasks']").innerHTML = "";
      window.refs.selection.querySelector("[data-role='exits']").innerHTML = "";

      step.exits.forEach(function(exit) {
        let structure = window.editor.getStructure("exit", {step: step.id, exit: exit.id}, {
          from: exit.from ? exit.from.id : null,
          to: exit.to ? exit.to.id : null,
          label: exit.label
        });
        window.refs.selection_exits.appendChild(structure);
      });

      step.tasks.forEach(function(task) {
        let structure = window.editor.getStructure("task", {step: step.id, task: task.id}, {
          from: task.from ? task.from.id : null,
          label: task.label
        });
        window.refs.selection_tasks.appendChild(structure);
      });
    }
  };

  window.fE = new flowNgin.Engine(document.querySelector("#editor canvas"), "emitter", 60);
  window.editor.rigActions();
})();