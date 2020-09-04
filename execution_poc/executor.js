class Executor {

    constructor(flowData) {
        this._flowData = flowData;
        this.nodeById = (id,simplified) => {
            simplified = simplified || false;
            let node = flowData.find(x => x.id === id);
            if(node === undefined)
                throw `Node identity exception: (id=${id})`;
            if(simplified)
                node = {
                id: node.id,
                path: "0",
                question: node.question,
                exits: node.connections[0].exits,
                exit: null
            }
            return JSON.parse(JSON.stringify(node));
        };
        this.descendFrom = (from,path) => {
            if(from.length > path.length)
                return false;
            let fromIdx = from.length - 1;
            let pathIdx = path.length - 1;
            for(let i=0;i<from.length;i++){
                if(from[fromIdx - i] != path[pathIdx - 1])
                    return false;
            }
            return true;
        };
        this.coherentMove = (id,exits) => {
            return (exits.find(x => x.target === id)) !== undefined;
        };
        this._path = ["0"];
        this._currentNode = this.nodeById("0",true);
    }

    get currentPath() {
        return this._path;
    }

    set path(flowData) {
        this._path = flowData.split("/");
        this.flowThrough(flowData);
    }

    stepForward = (id) => {
        if(!this.coherentMove(id,this._currentNode.exits))
            throw `Node flow exception: (id=${id} not an exit of id=${this._currentNode.id})`;
        this._path.push(id);
        return this.flowThrough(this._path.join("/"));
    }

    stepBackward = (steps) => {
        if(this._path.length == 1)
            return;
        for(let i=steps;i>0;i--)
            this._path = this._path.pop();
        return this.flowThrough(this._path.join("/"));
    }

    flowThrough = (pathData) => {
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
            if(lastNode != null && !this.coherentMove(nodeId,lastNode.exits))
                throw `Node flow exception: (id=${nodeId} not an exit of id=${lastNode.id})`;
            let currentNode = this.nodeById(nodeId);
            let exitNode = exitId !== undefined ? this.nodeById(exitId) : null;
            currentNode.path = breadcrumb;
            let connection = currentNode.connections.find(c => this.descendFrom(c.from, breadcrumb));
            if(exitNode !== null)
                exitNode.label = connection.exits.find(x => x.target===exitId).label;
            let newNode = {
                id: currentNode.id,
                path: breadcrumb,
                question: currentNode.question,
                exits: (connection === undefined) ? [] : connection.exits,
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