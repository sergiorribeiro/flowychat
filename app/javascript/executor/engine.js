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

    this.coherentMove = (id,currentId,exits) => {
      return (exits.find(x => x.target === id && ((!x.from) || (x.from === currentId)))) !== undefined;
    };

    this._currentNode = this.startNode();
    this._path = [this._currentNode.id];
  }

  get currentPath() {
    return this._path;
  }

  set path(flowData) {
    this._path = flowData.split("/");
    this.flowUntil(flowData);
  }

  stepForward = (id) => {
    if(!this.coherentMove(id, this._currentNode.id, this._currentNode.exits))
      throw `Node flow exception: (id=${id} not an exit of id=${this._currentNode.id})`;
    this._path.push(id);
    return this.flowUntil(this._path.join("/"));
  }

  stepBackward = (steps) => {
    if(this._path.length == 1)
      return;
    for(let i=steps;i>0;i--)
      this._path = this._path.pop();
    return this.flowUntil(this._path.join("/"));
  }

  flowUntil = (pathData) => {
    if(!pathData)
      pathData = this.startNode().id;
    let ctl = {
      nodes: [],
      checklist: []
    };
    let path = pathData.split("/").reverse();
    let breadcrumb = [];
    let lastNode = null;

    while(path.length > 0){
      let nodeId = path.pop();
      let exitId = path[path.length-1];
      breadcrumb.push(nodeId);
      if(lastNode != null && !this.coherentMove(nodeId, this._currentNode.uid, lastNode.exits))
        throw `Node flow exception: (id=${nodeId} not an exit of id=${lastNode.id})`;
      let currentNode = this.nodeById(nodeId);
      let exitNode = exitId !== undefined ? this.nodeById(exitId) : null;
      currentNode.path = breadcrumb;
      let newNode = {
        id: currentNode.uid,
        path: breadcrumb,
        question: currentNode.step,
        exits: currentNode.exits.filter(x => { return (x.from === null) || (x.from === this._currentNode.uid); }),
        exit: exitNode
      };
      ctl.nodes.push(newNode);
      lastNode = newNode;
      this._currentNode = lastNode;
      if(currentNode.tasks){
        for(let i=0;i<currentNode.tasks.length;i++){
          let task = currentNode.tasks[i];
          if(ctl.checklist.indexOf(task) == -1)
          ctl.checklist.push(task);
        }
      }
    }
    return ctl;
  }
}