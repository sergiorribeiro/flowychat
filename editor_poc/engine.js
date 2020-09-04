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

    Connection: function() {
      
    },

    Step: function() {
      flowNgin.objects.Drawable.call(this);
      this.exits = [];

      this.draw = function(ctx) {
        ctx.save();
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
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
    const STATE = {
      holdPoint: null,
      mouseDown: false,
      selectedStep: undefined,
      holdStep: undefined,
      holdOffset: undefined,
      heldMovement: false
    };
    const _data = new flowNgin.Data();
    let running = false;
    const _ctx = canvas.getContext("2d", {alpha: false});
    _ctx.imageSmoothingEnabled = true;

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

    self.start = function() {
      running = true;
      cycle();
    };

    self.stop = function() {
      running = false;
    };

    self.addStep = function() {
      const step = new flowNgin.objects.Step();
      step.position = new flowNgin.objects.Point(30,30);
      step.size = new flowNgin.objects.Size(30,30);
      _data.steps.push(step);
      return step.id;
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
          STATE.mouseDown = false;
          STATE.holdPoint = undefined;
          STATE.holdStep = undefined;
          STATE.holdOffset = undefined;
          if(!STATE.heldMovement) {
            STATE.selectedStep = getStepUnder(cursorPosition);
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

      console.log(STATE.selectedStep);
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