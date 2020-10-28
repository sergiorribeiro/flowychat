export default function FlowNg() {
  const flowNgin = this;

  flowNgin._data = new function(){
    let sequence = 1;
    this.steps = [];
    this.sequencer = {
      use: function() {
        sequence++;
        return sequence-1;
      },
      peek: function() {
        return sequence;
      }
    }
  };

  flowNgin._global = {
    offset: null,
    selectedStep: null,
    signals: {}
  };

  flowNgin._config = {
    SNAP: 5,
    EXIT_INBOUND_COLOR: "#EA6D09",
    EXIT_OUTBOUND_COLOR: "#0BD49B",
    EXIT_HIGHLIGHT_COLOR: "#FFF63A",
  };

  flowNgin.helpers = {
    uuid: function() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },

    snapPosition: function(point) {
      return new flowNgin.objects.Point(
        Math.round(point.x / flowNgin._config.SNAP) * flowNgin._config.SNAP,
        Math.round(point.y / flowNgin._config.SNAP) * flowNgin._config.SNAP
      );
    },

    snapSize: function(size) {
      return new flowNgin.objects.Size(
        Math.round(size.width / flowNgin._config.SNAP) * flowNgin._config.SNAP,
        Math.round(size.height / flowNgin._config.SNAP) * flowNgin._config.SNAP
      );
    },

    getStepUnder: function(point) {
      return flowNgin._data.steps.find(function(step) {
        return step.intersectPoint(point)
      });
    },

    getStepById: function(id) {
      return flowNgin._data.steps.find(function(step) {
        return step.id === id;
      });
    },

    getExitById: function(step, id) {
      return step.exits.find(function(exit) {
        return exit.id === id;
      });
    },

    getTaskById: function(step, id) {
      return step.tasks.find(function(task) {
        return task.id === id;
      });
    },

    deleteStepById: function(id) {
      flowNgin._data.steps = flowNgin._data.steps.filter(function(step) {
        return step.id !== id;
      });
    },

    deleteConnectorById: function(step, id) {
      step.exits = step.exits.filter(function(exit) {
        return exit.id !== id;
      });
    },

    deleteTaskById: function(step, id) {
      step.tasks = step.tasks.filter(function(task) {
        return task.id !== id;
      });
    }
  };

  flowNgin.objects = {
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

      this.subtract = function(point) {
        return new flowNgin.objects.Point(this.x - point.x, this.y - point.y);
      }

      this.angleTo = function(point) {
        return Math.atan2(this.y - point.y, this.x - point.x);
      }

      this.midPointTo = function(point) {
        return new flowNgin.objects.Point(
          (this.x + point.x) / 2,
          (this.y + point.y) / 2,
        );
      }

      this.clone = function() {
        return new flowNgin.objects.Point(this.x, this.y);
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
      this.label = label || "-";
    },

    Task: function(from, label) {
      this.id = flowNgin.helpers.uuid();
      this.from = from;
      this.label = label || "";
    },

    Step: function() {
      flowNgin.objects.Drawable.call(this);
      this.sequentialId = 0;
      this.exits = [];
      this.tasks = [];
      this.title = "untitled";
      this.step = "";
      let self = this;

      this.is = function(step) {
        if(!step) {return false;}

        return this.id === step.id;
      }

      this.update = function(ctx,layer) {
        const padding = 10;
        const halfPadding = padding * 0.5;
        const titleFontSize = 15;
        const exitFontSize = 13;
        const titleFont = `${titleFontSize}px Arial`;
        const exitFont = `${exitFontSize}px Arial`;

        if(layer === 1) {
          this.size.width = 0;
          this.size.height = 0;
          this.size.width += padding;
          let maxWidth = 0;
          ctx.font = titleFont;
          maxWidth = ctx.measureText(this.title).width;
          
          ctx.font = exitFont;
          this.exits.forEach(function(exit){
            maxWidth = Math.max(maxWidth, ctx.measureText(exit.label).width);
          });

          this.size.width += maxWidth;
          this.size.width += padding;

          this.size.height += padding;
          this.size.height += titleFontSize;
          
          if(this.exits.length > 0) {
            this.size.height += padding;
            this.exits.forEach(function(exit) {
              self.size.height += halfPadding;
              self.size.height += exitFontSize;
            });
          }

          this.size.height += padding;

          this.size = flowNgin.helpers.snapSize(this.size);

          this.center = new flowNgin.objects.Point(
            this.position.x + this.size.width / 2, 
            this.position.y + this.size.height / 2
          );
        }

        if(layer === 2) {
          let exitPosition = 
            (this.position.y + flowNgin._global.offset.y) +
            padding +
            titleFontSize +
            padding +
            exitFontSize;

          this.exits.forEach(function(exit){
            exit._temp = exit._temp || {};
            exit._temp.yPos = exitPosition;
            exitPosition += halfPadding + exitFontSize;
            if(exit.to) {
              exit._temp.targetPoint = exit.to.center.add(flowNgin._global.offset);
            }
          });
        }
      };

      this.draw = function(ctx,layer) {
        const offsetPosition = this.position.add(flowNgin._global.offset);
        const x = offsetPosition.x;
        const y = offsetPosition.y;
        const w = this.size.width;
        const h = this.size.height;
        const padding = 10;
        const seqPadding = padding * 0.2;
        const titleFontSize = 15;
        const exitFontSize = 13;
        const sequenceFontSize = 10;
        const titleFont = `${titleFontSize}px Arial`;
        const exitFont = `${exitFontSize}px Arial`;
        const sequenceFont = `${sequenceFontSize}px Arial`;

        ctx.save();

        if(layer == 1) {
          if(this.exits.length > 0) {
            this.exits.forEach(function(exit){
              if(exit.to) {
                const exitXStart = (exit._temp.targetPoint.x < self.center.x) ? x : x + self.size.width;
                const startPt = new flowNgin.objects.Point(exitXStart, exit._temp.yPos - exitFontSize / 2);
                const endPt = new flowNgin.objects.Point(exit._temp.targetPoint.x, exit._temp.targetPoint.y);

                const hleSig = flowNgin._global.signals["highlight_exit"];

                if(hleSig){
                  const tmpStep = flowNgin.helpers.getStepById(hleSig.step);
                  const tmpExit = flowNgin.helpers.getExitById(tmpStep, hleSig.exit);

                  if(
                      (!tmpExit.from && exit.to.is(tmpStep)) || 
                      (tmpExit.from && exit.to.is(tmpStep) && tmpExit.from.is(self)) || 
                      tmpExit.id === exit.id
                    ) {
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = flowNgin._config.EXIT_HIGHLIGHT_COLOR;
                    ctx.beginPath();
                    ctx.moveTo(startPt.x, startPt.y);
                    ctx.lineTo(endPt.x, endPt.y);
                    ctx.stroke();
                  } 
                }

                ctx.lineWidth = 1;
                if(exit.to.is(flowNgin._global.selectedStep)){
                  ctx.strokeStyle = flowNgin._config.EXIT_OUTBOUND_COLOR;
                  ctx.fillStyle = flowNgin._config.EXIT_OUTBOUND_COLOR;
                }else if(self.is(flowNgin._global.selectedStep)){
                  ctx.strokeStyle = flowNgin._config.EXIT_INBOUND_COLOR;
                  ctx.fillStyle = flowNgin._config.EXIT_INBOUND_COLOR;
                }else{
                  ctx.strokeStyle = "#000";
                  ctx.fillStyle = "#000";
                }
                ctx.beginPath();
                ctx.moveTo(startPt.x, startPt.y);
                ctx.lineTo(endPt.x, endPt.y);
                ctx.stroke();

                const midPoint = startPt.midPointTo(endPt);
                const angle = startPt.angleTo(endPt);

                const arrowSize = 5;
                ctx.save();
                ctx.translate(midPoint.x, midPoint.y);
                ctx.rotate(angle - Math.PI / 2);
                ctx.beginPath();
                ctx.moveTo(-arrowSize, arrowSize);
                ctx.lineTo(0, -arrowSize);
                ctx.lineTo(arrowSize, arrowSize);
                ctx.fill();
                ctx.restore();
              }
            });
          }
        }

        if(layer === 2) {
          if(this.is(flowNgin._global.selectedStep)){
            ctx.fillStyle = "#eee";
          }else{
            ctx.fillStyle = "#fff";
          }
          ctx.fillRect(x, y, w, h);

          ctx.beginPath();
          ctx.rect(x, y, w, h);
          if(this.is(flowNgin._global.selectedStep)){
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#000";
          }else{
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#000";
          }
          ctx.stroke();

          let seqW = ctx.measureText(this.sequentialId).width + seqPadding * 2
          const seqBH = sequenceFontSize + seqPadding * 3;
          const outdent = sequenceFontSize * 0.5;
          ctx.fillStyle = "#fff";
          ctx.fillRect(x - outdent, y - outdent, seqW, seqBH);

          ctx.beginPath();
          ctx.rect(x - outdent, y - outdent, seqW, seqBH);
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#000";
          ctx.stroke();

          ctx.font = sequenceFont;
          ctx.fillStyle = "#000";
          ctx.fillText(
            this.sequentialId, 
            (x - outdent) + (seqPadding * 1.5), 
            (y - outdent) + seqPadding + sequenceFontSize);
          
          if(self.tasks.length > 0) {
            seqW = ctx.measureText(this.tasks.length).width + seqPadding * 2
            ctx.fillStyle = "#fff";
            ctx.fillRect((x + w) - outdent * 1.5, (y + h) - outdent * 1.5, seqW, seqBH);

            ctx.beginPath();
            ctx.rect((x + w) - outdent * 1.5, (y + h) - outdent * 1.5, seqW, seqBH);
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#000";
            ctx.stroke();

            ctx.fillStyle = "#000";
            ctx.fillText(
              this.tasks.length, 
              ((x + w) - outdent * 1.5) + seqPadding, 
              ((y + h) - outdent * 1.5) + seqPadding + sequenceFontSize);
          }

          ctx.font = titleFont;
          ctx.fillStyle = "#000";
          ctx.fillText(this.title, x + padding, y + padding + titleFontSize);

          if(this.exits.length > 0) {
            ctx.font = exitFont;
            this.exits.forEach(function(exit){
              ctx.fillStyle = "#000";
              ctx.fillText(exit.label, x + padding, exit._temp.yPos);
              if(exit.to) {

                if(exit.to.is(flowNgin._global.selectedStep)){
                  ctx.fillStyle = flowNgin._config.EXIT_OUTBOUND_COLOR;
                }else if(self.is(flowNgin._global.selectedStep)){
                  ctx.fillStyle = flowNgin._config.EXIT_INBOUND_COLOR;
                }else{
                  ctx.fillStyle = "#000";
                }

                ctx.beginPath();
                const exitXStart = (exit._temp.targetPoint.x < self.center.x) ? x : x + self.size.width;
                ctx.arc(exitXStart, exit._temp.yPos - exitFontSize / 2, 3, 0, 2 * Math.PI);
                ctx.fill();
              }
            });
          }
        }

        ctx.restore();
      }
    }
  };

  flowNgin.Engine = function(canvas, emitter, fps) {
    const self = this;
    const FPS = fps;
    const SNAP = flowNgin._config.SNAP;
    const CLICKTMR = null;
    const STATE = {
      holdPoint: null,
      mouseDown: false,
      holdStep: undefined,
      holdOffset: undefined,
      heldMovement: false,
      consecutiveClicks: 0,
      offset: new flowNgin.objects.Point(0,0),
      offsetReference: new flowNgin.objects.Point(0,0)
    };
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

    self.signal = function(signal, data) {
      flowNgin._global.signals[signal] = data;
    };

    self.unsignal = function(signal) {
      delete flowNgin._global.signals[signal];
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
      step.position = flowNgin.helpers.snapPosition(position.subtract(flowNgin._global.offset));
      step.sequentialId = flowNgin._data.sequencer.use();
      flowNgin._data.steps.push(step);
      return step.id;
    };

    self.addExit = function(parent, data) {
      const step = flowNgin.helpers.getStepById(parent);
      if(step) {
        data = data || {from: null, to: null, label: null}
        const connector = new flowNgin.objects.Connection(flowNgin.helpers.getStepById(data.from), flowNgin.helpers.getStepById(data.to), data.label);
        step.exits.push(connector);
        return { step: step.id, exit: connector.id };
      }
    };

    self.removeExit = function(step, id) {
      flowNgin.helpers.deleteConnectorById(flowNgin.helpers.getStepById(step), id);
    };

    self.removeStep = function(id) {
      flowNgin.helpers.deleteStepById(id);
      flowNgin._global.selectedStep = null;
      document.querySelector(emitter).dispatchEvent(stepSelectedEvent);
    };

    self.removeTask = function(step, id) {
      flowNgin.helpers.deleteTaskById(flowNgin.helpers.getStepById(step), id);
    };

    self.updateExit = function(step, id, data) {
      const exit = flowNgin.helpers.getExitById(flowNgin.helpers.getStepById(step), id);
      if(exit) {
        data = data || {from: null, to: null, label: null};
        if(data.from) { exit.from = flowNgin.helpers.getStepById(data.from); }
        if(data.to) { exit.to = flowNgin.helpers.getStepById(data.to); }
        if(data.label) { exit.label = data.label; }
      }
    };

    self.updateStep = function(id, data) {
      const step = flowNgin.helpers.getStepById(id);
      if(step) {
        data = data || {title: null, step: null};
        if(data.title) { step.title = data.title; }
        if(data.step) { step.step = data.step; }
      }
    };

    self.addTask = function(parent, data) {
      const step = flowNgin.helpers.getStepById(parent);
      if(step) {
        data = data || {from: null, label: null}
        const task = new flowNgin.objects.Task(flowNgin.helpers.getStepById(data.from), data.label);
        step.tasks.push(task);
        return { step: step.id, task: task.id };
      }
    };

    self.updateTask = function(step, id, data) {
      const task = flowNgin.helpers.getTaskById(flowNgin.helpers.getStepById(step), id);
      if(task) {
        data = data || {from: null, label: null};
        if(data.from) { task.from = flowNgin.helpers.getStepById(data.from); }
        if(data.label) { task.label = data.label; }
      }
    };

    self.selectedStep = function() {
      return flowNgin._global.selectedStep;
    };

    self.activeSteps = function(excludeSelected) {
      return flowNgin._data.steps.filter(function(step) {
        if(flowNgin._global.selectedStep && excludeSelected && flowNgin._global.selectedStep.id === step.id){
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
    };

    self.export = function() {
      return JSON.stringify({
        steps: flowNgin._data.steps.map(function(step) {
          return {
            uid: step.id,
            position: {
              x: step.position.x,
              y: step.position.y
            },
            title: step.title,
            step: step.step,
            tasks: step.tasks.map(function(task) {
              return {
                uid: task.id,
                from: task.from ? task.from.id : null,
                label: task.label
              };
            }),
            exits: step.exits.map(function(exit) {
              return {
                uid: exit.id,
                to: exit.to ? exit.to.id : null,
                from: exit.from ? exit.from.id : null,
                label: exit.label
              };
            })
          }
        })
      });
    };

    self.import = function(raw) {
      const data = JSON.parse(raw);
      flowNgin._data.steps = [];

      data.steps.forEach(function(step) {
        const newstep = new flowNgin.objects.Step();
        newstep.position = new flowNgin.objects.Point(step.position.x, step.position.y);
        newstep.sequentialId = flowNgin._data.sequencer.use();
        newstep.id = step.uid;
        newstep.title = step.title;
        newstep.step = step.step;
        flowNgin._data.steps.push(newstep);
      });

      data.steps.forEach(function(step){
        const newstep = flowNgin.helpers.getStepById(step.uid);

        step.tasks.forEach(function(task){
          const newtask = new flowNgin.objects.Task(flowNgin.helpers.getStepById(task.from), task.label);
          newstep.tasks.push(newtask);
        });

        step.exits.forEach(function(exit){
          const newexit = new flowNgin.objects.Connection(flowNgin.helpers.getStepById(exit.from), flowNgin.helpers.getStepById(exit.to), exit.label);
          newstep.exits.push(newexit);
        });
      });
    };

    const handleInteraction = function(event) {
      const cursorPosition = new flowNgin.objects.Point(event.x, event.y);
      const calculatedCursorPosition = cursorPosition.subtract(flowNgin._global.offset);
      
      switch(event.type) {
        case "mousedown":
          STATE.mouseDown = true;
          STATE.holdPoint = cursorPosition;
          STATE.holdStep = flowNgin.helpers.getStepUnder(calculatedCursorPosition);
          STATE.heldMovement = false;
          if(STATE.holdStep) {
            STATE.holdStep.referencePosition = STATE.holdStep.position.clone();
          } else {
            STATE.offsetReference = flowNgin._global.offset.clone();
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
            flowNgin._global.selectedStep = flowNgin.helpers.getStepUnder(calculatedCursorPosition);
            document.querySelector(emitter).dispatchEvent(stepSelectedEvent);
          }
          if(STATE.consecutiveClicks >= 2) {
            STATE.consecutiveClicks = 0;
            if(!flowNgin._global.selectedStep) {
              self.addStep(calculatedCursorPosition);
            }
          }
        break;
        case "mousemove":
          if(STATE.mouseDown) {
            STATE.heldMovement = true;
            STATE.holdOffset = STATE.holdPoint.vectorTo(cursorPosition);
            if(STATE.holdStep) {
              STATE.holdStep.position = flowNgin.helpers.snapPosition(STATE.holdStep.referencePosition.add(STATE.holdOffset));
            }else {
              flowNgin._global.offset = flowNgin.helpers.snapPosition(STATE.offsetReference.add(STATE.holdOffset));
            }
          }
        break;
      }
    };

    const cycle = function() {
      _ctx.fillStyle = "#fff";
      _ctx.fillRect(0,0,_ctx.canvas.width,_ctx.canvas.height);
      update();
      draw();
      if(running) {
        setTimeout(requestAnimationFrame.bind(this,cycle), 1000 / FPS)
      }
    };

    const drawDesignSupport = function(layer) {
      switch(layer) {
        case "low":
          if(STATE.holdStep) {
            _ctx.save();
            _ctx.lineWidth = 1;
            const ssp = STATE.holdStep.position.add(flowNgin._global.offset);
            const sss = STATE.holdStep.size;
            _ctx.globalAlpha = 0.3;
            _ctx.beginPath();
            _ctx.moveTo(0,ssp.y);
            _ctx.lineTo(_ctx.canvas.width, ssp.y);
            _ctx.moveTo(0,ssp.y + sss.height);
            _ctx.lineTo(_ctx.canvas.width, ssp.y + sss.height);
            _ctx.moveTo(ssp.x,0);
            _ctx.lineTo(ssp.x, _ctx.canvas.height);
            _ctx.moveTo(ssp.x + sss.width, 0);
            _ctx.lineTo(ssp.x + sss.width, _ctx.canvas.height);
            _ctx.stroke();
            _ctx.restore();
          }
          break;
        case "high":
          break;
      }
    }

    const draw = function() {
      drawDesignSupport("low");
      flowNgin._data.steps.forEach(function(step) {
        step.draw(_ctx,1);
      });
      flowNgin._data.steps.forEach(function(step) {
        step.draw(_ctx,2);
      });
      drawDesignSupport("high");
    };

    const update = function() {
      flowNgin._data.steps.forEach(function(step){
        step.update(_ctx,1);
      });
      flowNgin._data.steps.forEach(function(step){
        step.update(_ctx,2);
      });
    };

    updateViewport();
    rigEvents();
    self.start();
  }

  flowNgin.init = function(canvas, emitter, fps) {
    flowNgin._global.offset = new flowNgin.objects.Point(0,0);
    flowNgin.engine = new flowNgin.Engine(canvas, emitter, fps);
  }

  return flowNgin;
}
