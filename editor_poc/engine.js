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
      this.from = from;
      this.to = to;
      this.label = label;
    },

    Step: function() {
      flowNgin.objects.Drawable.call(this);
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
        maxWidth = ctx.measureText(this.id).width;
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
        ctx.fillText(this.id, x + 10, y + 10 + titleFontSize);

        ctx.restore();
      }
    }
  },

  Data: function() {
    this.steps = [];
  },

  Engine: function(canvas, fps) {
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
      consecutiveClicks: 0
    };
    const _data = new flowNgin.Data();
    let running = false;
    const _ctx = canvas.getContext("2d", {alpha: false});
    _ctx.imageSmoothingEnabled = false;

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
      _data.steps.push(step);
      console.log(step);
      return step.id;
    }

    self.addConnector = function(parent, from, to, label) {
      const step = getStepById(parent);
      if(step) {
        const connector = new flowNgin.objects.Connection(getStepById(from), getStepById(to), label);
        step.exits.push(connector);
        console.log(step);
      }
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