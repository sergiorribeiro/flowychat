export default class ExecNg {

  constructor(flowData) {
    this._flowData = flowData;
    this.nodeById = (id) => {
      let node = this._flowData.steps.find(x => x.uid === id);
      if(node === undefined)
        throw `Node identity exception: (id=${id})`;
      return JSON.parse(JSON.stringify(node));
    };

    this.startNode = () => {
      // this must be revised. determine which should be the start node
      const step = this._flowData.steps[0];

      return {
        id: step.uid,
        path: [],
        question: step.step,
        exits: step.exits,
        exit: null
      };
    };

    this.validExit = (id) => {
      return true;
    };

    this.setPath = (flowData) => {
      this._path = flowData === "" ? [] : flowData.split("/");
      return this.flowThrough(flowData);
    }

    this.executionComplete = () => {
      return this._completed;
    }

    this._currentNode = this.startNode();
    this._path = [];
    this._completed = false;
  }

  get currentPath() {
    return this._path;
  }

  resetExecution = () => {
    this._currentNode = this.startNode();
  }

  stepForward = (id) => {
    if(!this.validExit(id))
      throw `Node flow exception: (exit=${id} not an exit of id=${this._currentNode.id})`;
    this._path.push(id);
    return this.flowThrough(this._path.join("/"));
  }

  flowThrough = (pathData) => {
    this.resetExecution();
    let ctl = {
      nodes: [this._currentNode],
      checklist: []
    };
    let path = pathData === "" ? [] : pathData.split("/").reverse();

    while(path.length > 0){
      let exitId = path.pop();
      if(!this.validExit(exitId))
        throw `Node flow exception: (exit=${exitId} not an exit of id=${this._currentNode.id})`;
      let exit = this._currentNode.exits.find(x => x.uid === exitId);
      let nextNode = this.nodeById(exit.to);
      let currentNode = this.nodeById(this._currentNode.id);

      ctl.nodes[ctl.nodes.length-1].exit = { label: exit.label };

      let newNode = {
        id: nextNode.uid,
        question: nextNode.step,
        exits: nextNode.exits.filter(x => { return (x.from === null) || (x.from === this._currentNode.id); }),
        exit: null
      };
      ctl.nodes.push(newNode);

      if(currentNode.tasks){
        currentNode.tasks.forEach(t => {
          ctl.checklist.push(t);
        });
      }

      if(newNode.exits.length === 0){ this._completed = true; }

      this._currentNode = newNode;
    }
    return ctl;
  }
}