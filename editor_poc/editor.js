(function(){
  window.refs = {
    selection: document.querySelector("#selection")
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
          const refs = window.fE.addTask(window.fE.selectedStep().id, {
            from: null,
            task: null
          });
          let structure = window.editor.getStructure("task", {step: refs.step, task: refs.task});
          document.querySelector("#tasks").appendChild(structure);
        });
      });

      document.querySelector("[data-action='selection.update.title']").addEventListener("keyup", function() {
        alert("update title");
      });

      document.querySelector("[data-action='selection.update.step']").addEventListener("keyup", function() {
        alert("update step");
      });

      document.querySelector("[data-action='selection.delete']").addEventListener("click", function() {
        alert("delete step");
      });
    },

    getStructure: function(structure, datas) {
      const st = document.querySelector("[data-structure='" + structure + "']");
      if(st){
        const dup = st.cloneNode(true);

        dup.removeAttribute("data-structure");

        for(var data in datas) {
          dup.dataset[data] = datas[data];
        }

        switch(structure) {
          case "task":
            dup.querySelector("select").addEventListener("change", function() {
              alert("update task");
            });
            dup.querySelector("input").addEventListener("keyup", function() {
              alert("update task");
            });
            dup.querySelector("button").addEventListener("click", function() {
              alert("delete task");
            });
            break;
        }
        return dup;
      }
      return null;
    },

    initSelected: function() {

    }
  };

  window.fE = new flowNgin.Engine(document.querySelector("#editor canvas"), "emitter", 60);
  window.editor.rigActions();
})();