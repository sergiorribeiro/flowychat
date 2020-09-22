var flowNgin = flowNgin || {
  helpers: {
    uuid: function() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  },

  objects: {
    Point: function(x, y) {
      this.x = x;
      this.y = y;

      this.distanceTo = function(point) {
        return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));
      }

      this.vectorTo = function(point) {
        return new flowNgin.objects.Point(point.x - this.x, point.y - this.y);
      }

      this.add = function(point) {
        return new flowNgin.objects.Point(this.x + point.x, this.y + point.y);
      }
    },

    Size: function(width, height) {
      this.width = width;
      this.height = height;

      this.area = function() {
        return this.width * this.height;
      }
    },

    Drawable: function() {
      this.id = flowNgin.helpers.uuid();
      this.position = new flowNgin.objects.Point(0, 0);
      this.size = new flowNgin.objects.Size(0, 0);

      this.intersectPoint = function(point) {
        const p = this.position;
        const s = this.size;
        const pt = point;

        return (
          (p.x <= pt.x) && 
          (p.y <= pt.y) &&
          ((p.x + s.width) >= pt.x) &&
          ((p.y + s.height) >= pt.y)
        );
      }
    },

    Connection: function(from, to, label) {
      this.id = flowNgin.helpers.uuid();
      this.from = from;
      this.to = to;
      this.label = label;
    },

    Task: function(from, label) {
      this.id = flowNgin.helpers.uuid();
      this.from = from;
      this.label = label;
    },

    Step: function() {
      flowNgin.objects.Drawable.call(this);
      this.sequentialId = 0;
      this.exits = [];
      this.tasks = [];
      this.title = "untitled";

      this.draw = function(ctx) {
        const padding = 10;
        const x = this.position.x;
        const y = this.position.y;

        this.size.width = 0;
        this.size.height = 0;

        const titleFontSize = 15;
        ctx.font = `${titleFontSize}px Arial`;
        this.size.width += padding;
        let maxWidth = 0;
        maxWidth = ctx.measureText(this.title).width;
        // check exits's width
          // here, on a loop
        this.size.width += maxWidth;
        this.size.width += padding;

        this.size.height += padding;
        this.size.height += titleFontSize;
        this.size.height += padding;

        const w = this.size.width;
        const h = this.size.height;

        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.fillRect(x, y, w, h);

        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.fillText(this.title, x + 10, y + 10 + titleFontSize);

        ctx.restore();
      }
    }
  },

  Data: function() {
    this.steps = [];
  },

  Engine: function(canvas, emitter, fps) {
    const self = this;
    const FPS = fps;
    const SNAP = 5;
    const CLICKTMR = null;
    const STATE = {
      holdPoint: null,
      mouseDown: false,
      selectedStep: undefined,
      holdStep: undefined,
      holdOffset: undefined,
      heldMovement: false,
      consecutiveClicks: 0,
      stepSequencer: 1
    };
    const _data = new flowNgin.Data();
    let running = false;
    const _ctx = canvas.getContext("2d", {alpha: false});
    _ctx.imageSmoothingEnabled = false;

    var stepSelectedEvent = new Event("fngin_step_selected");

    const updateViewport = function() {
      let cr = _ctx.canvas.getBoundingClientRect();
      _ctx.canvas.width = cr.width;
      _ctx.canvas.height = cr.height;
    };

    const rigEvents = function() {
      window.addEventListener("resize", updateViewport);
      ["mouseup", "mousedown", "mousemove"].forEach(function(eventName){
        _ctx.canvas.addEventListener(eventName, handleInteraction);
      })
    };

    const snapPosition = function(point) {
      return new flowNgin.objects.Point(
        Math.round(point.x / SNAP) * SNAP,
        Math.round(point.y / SNAP) * SNAP
      );
    }

    const getStepUnder = function(point) {
      return _data.steps.find(function(step) {
        return step.intersectPoint(point)
      });
    }

    const getStepById = function(id) {
      return _data.steps.find(function(step) {
        return step.id === id;
      });
    }

    const getExitById = function(step, id) {
      return step.exits.find(function(exit) {
        return exit.id === id;
      });
    }

    const getTaskById = function(step, id) {
      return step.tasks.find(function(task) {
        return task.id === id;
      });
    }

    const deleteStepById = function(id) {
      _data.steps = _data.steps.filter(function(step) {
        return step.id !== id;
      });
    }

    const deleteConnectorById = function(step, id) {
      step.exits = step.exits.filter(function(exit) {
        return exit.id !== id;
      });
    }

    const deleteTaskById = function(step, id) {
      step.tasks = step.tasks.filter(function(task) {
        return task.id !== id;
      });
    }

    self.start = function() {
      running = true;
      cycle();
    };

    self.stop = function() {
      running = false;
    };

    self.addStep = function(position) {
      const step = new flowNgin.objects.Step();
      step.size = new flowNgin.objects.Size(0,0);
      step.position = position;
      step.sequentialId = STATE.stepSequencer;
      _data.steps.push(step);
      STATE.stepSequencer += 1;
      return step.id;
    }

    self.addExit = function(parent, data) {
      const step = getStepById(parent);
      if(step) {
        data = data || {from: null, to: null, label: null}
        const connector = new flowNgin.objects.Connection(getStepById(data.from), getStepById(data.to), data.label);
        step.exits.push(connector);
        return { step: step.id, exit: connector.id };
      }
    }

    self.removeExit = function(step, id) {
      deleteConnectorById(getStepById(step), id);
    }

    self.removeStep = function(id) {
      deleteStepById(id);
    }

    self.removeTask = function(step, id) {
      deleteTaskById(getStepById(step), id);
    }

    self.updateExit = function(step, id, data) {
      const exit = getExitById(getStepById(step), id);
      if(exit) {
        data = data || {from: null, to: null, label: null};
        if(data.from) { exit.from = getStepById(data.from); }
        if(data.to) { exit.to = getStepById(data.to); }
        if(data.label) { exit.label = data.label; }
      }
    }

    self.updateStep = function(id, data) {
      const step = getStepById(id);
      if(step) {
        data = data || {title: null, step: null};
        if(data.title) { step.title = data.title; }
        if(data.step) { step.step = data.step; }
      }
    }

    self.addTask = function(parent, data) {
      const step = getStepById(parent);
      if(step) {
        data = data || {from: null, label: null}
        const task = new flowNgin.objects.Task(getStepById(data.from), data.label);
        step.tasks.push(task);
        return { step: step.id, task: task.id };
      }
    }

    self.updateTask = function(id, data) {

    }

    self.selectedStep = function() {
      return STATE.selectedStep;
    }

    self.activeSteps = function(excludeSelected) {
      return _data.steps.filter(function(step) {
        if(STATE.selectedStep && excludeSelected && STATE.selectedStep.id === step.id){
          return false;
        }
        return true;
      }).map(function(step) {
        return {
          sequence: step.sequentialId,
          uid: step.id,
          title: step.title
        }
      })
    }

    const handleInteraction = function(event) {
      const cursorPosition = new flowNgin.objects.Point(event.x, event.y);
      
      switch(event.type) {
        case "mousedown":
          STATE.mouseDown = true;
          STATE.holdPoint = cursorPosition;
          STATE.holdStep = getStepUnder(cursorPosition);
          STATE.heldMovement = false;
          if(STATE.holdStep) {
            STATE.holdStep.referencePosition = STATE.holdStep.position;
          }else {
            // referencePosition on ALL OBJECTS
          }
        break;
        case "mouseup":
          STATE.consecutiveClicks += 1;
          clearTimeout(CLICKTMR);
          setTimeout(function(){
            STATE.consecutiveClicks = 0;
          },350);
          STATE.mouseDown = false;
          STATE.holdPoint = undefined;
          STATE.holdStep = undefined;
          STATE.holdOffset = undefined;
          if(!STATE.heldMovement) {
            STATE.selectedStep = getStepUnder(cursorPosition);
            document.querySelector(emitter).dispatchEvent(stepSelectedEvent);
          }
          if(STATE.consecutiveClicks >= 2) {
            STATE.consecutiveClicks = 0;
            if(!STATE.selectedStep) {
              self.addStep(cursorPosition);
            }
          }
        break;
        case "mousemove":
          if(STATE.mouseDown) {
            STATE.heldMovement = true;
            STATE.holdOffset = STATE.holdPoint.vectorTo(cursorPosition);
            if(STATE.holdStep) {
              STATE.holdStep.position = snapPosition(STATE.holdStep.referencePosition.add(STATE.holdOffset));
            }else {
              // update position of ALL OBJECTS
            }
          }
        break;
      }
    }

    const cycle = function() {
      _ctx.fillStyle = "#fff";
      _ctx.fillRect(0,0,_ctx.canvas.width,_ctx.canvas.height);
      draw();
      update();
      if(running) {
        setTimeout(requestAnimationFrame.bind(this,cycle), 1000 / FPS)
      }
    };

    const draw = function() {
      _data.steps.forEach(function(step) {
        step.draw(_ctx);
      });
    };

    const update = function() {
      
    };

    updateViewport();
    rigEvents();
    self.start();
  }
};