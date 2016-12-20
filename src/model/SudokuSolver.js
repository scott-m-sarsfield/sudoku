/* jshint esversion: 6 */

import SudokuGrid from './SudokuGrid';

let window = window || {
    localStorage:{
        getItem:()=>{},
        setItem:()=>{}
    }
};

function Queue(){
    this.data = [];
}

Queue.prototype.enqueue = function enqueue(x){
    this.data.push(x);
};

Queue.prototype.dequeue = function dequeue(){
    return this.data.splice(0,1)[0];
};


function SudokuSolver(grid){
    if(!(grid instanceof SudokuGrid)){
        console.error("SudokuGrid not provided to SudokuSolver.",grid,"provided instead.");
        return;
    }
    this.originalGrid = grid;
    this.resetGridToGivens();

    this.entityQueue = new Queue();

    this.solveHistory = [];
    this.checkpoints = [];
}

SudokuSolver.prototype.resetGridToGivens = function resetGridToGivens(){
    let grid = this.originalGrid;

    this.grid = new SudokuGrid();
    this.grid.setCells(grid.cells);
    this.grid.setAssignedAsGiven();
};

SudokuSolver.prototype.loadFromSolveHistory = function loadFromSolveHistory(index){
    let _cells = this.grid.cells.reduce((a,b)=>a.concat(b),[]);

    //console.log("reverting to step",index);

    //console.log(_cells.map((v)=>v.value));

    this.solveHistory = this.solveHistory.slice(0,index);
    for(let i = 0; i < index; i++){
        let entry = this.solveHistory[i];
        //console.log("ENTRY",_cells[entry.id],entry.value);
        _cells[ entry.id ].value = entry.value;
    }

    //console.log(_cells.map((v)=>v.value));
};

SudokuSolver.prototype.solveCell = function solveCell(cell,value,note){
    // Actually set the value.
    cell.value = value;

    // Record the action.
    this.solveHistory.push({
        id:cell.id,
        value:value,
        note:note
    });

    // announce it
    let row_number = Math.floor(cell.id / GRID_SIZE),
        col_number = cell.id % GRID_SIZE;

    //console.log(note,"[",col_number+1,",",row_number+1,"]","=",value);

    this.propagateKnowledge(cell);

};

SudokuSolver.prototype.propagateKnowledge = function propagateKnowledge(cell){
    let row_number = Math.floor(cell.id / GRID_SIZE),
        col_number = cell.id % GRID_SIZE;
    let box_number = Math.floor(row_number / 3)*3 + Math.floor(col_number / 3);

    // Make sure related entities get updated.

    this.entityQueue.enqueue({type:ENT_ROW,number:row_number});
    this.entityQueue.enqueue({type:ENT_COL,number:col_number});
    this.entityQueue.enqueue({type:ENT_BOX,number:box_number});
};

const GRID_SIZE = 9;

function getOptionsForCell(grid,row,col){
    let options = [];
    let i;
    for(i=0;i<GRID_SIZE;i++) options.push(true); // init to true.

    for(i=0;i<GRID_SIZE;i++){
        // check row
        let v = grid.cells[row][i].value;
        if(v) options[v-1] = false;

        // check column
        v = grid.cells[i][col].value;
        if(v) options[v-1] = false;

        // check subgrid
        let subgrid = {
            row:Math.floor(row/3),
            col:Math.floor(col/3)
        };
        //console.log(subgrid);
        let si = subgrid.row*3+(Math.floor(i/3)),
            sj = subgrid.col*3+(i%3);
        //console.log(si,sj);
        v = grid.cells[ si ][ sj ].value;
        if(v) options[v-1] = false;
    }

    let opts = [];
    for(i=0;i<GRID_SIZE;i++){
        if(options[i]) opts.push(i+1);
    }
    return opts;
}

window.getOptionsForCell = getOptionsForCell;

SudokuSolver.prototype.getRow = function getRow(i){
    return this.grid.cells[i];
};

SudokuSolver.prototype.getCol = function getCol(i){
    return this.grid.cells.map((v)=>v[i]);
};

SudokuSolver.prototype.getBox = function getBox(i){
    let sr = Math.floor( i / 3 ), sc = i % 3;
    return this.grid.cells.slice(sr*3,(sr+1)*3).map((v)=>v.slice(sc*3,(sc+1)*3)).reduce((a,b)=>{
        return a.concat(b);
    },[]);
};

const ENT_ROW = 0;
const ENT_COL = 1;
const ENT_BOX = 2;

SudokuSolver.prototype.getEntity = function getEntity(type,number){

    switch(type){
        case ENT_ROW:
            return this.getRow(number);
        case ENT_COL:
            return this.getCol(number);
        case ENT_BOX:
            return this.getBox(number);
        default:
            console.error("Invalid entity requested.");
            return;
    }
};

SudokuSolver.prototype.updateCellOptions = function updateCellOptions(cell,opts,note){
    if(cell.notes.options.join("") != opts.join("") && opts.length < cell.notes.options.length){
        // announce it
        let row_number = Math.floor(cell.id / GRID_SIZE),
            col_number = cell.id % GRID_SIZE;

        //console.log(note || "","(Options)","[",col_number+1,",",row_number+1,"]","=",opts);

        // If left with one, solve it.
        if(opts.length == 1){
            this.solveCell(cell,opts[0],"Option Elimination ["+note+"]");
            return;
        }else if(opts.length === 0){
            //console.error("Eliminated all options.  You sure it's solvable?");
            throw "Not solvable.";
        }

        this.propagateKnowledge(cell);
        cell.notes.options = opts;
    }
};

SudokuSolver.prototype.basicTechnique = function basicTechnique(arr){
    let i, l = arr.length, valueSet = false;

    for(i = 0; i < l; i++){
        let cell = arr[i];

        if(cell.value) continue;

        //console.log(cell.id);
        let r = Math.floor(cell.id / GRID_SIZE), c = cell.id % GRID_SIZE;

        let opts = getOptionsForCell(this.grid,r,c);

        this.updateCellOptions(cell,opts,"Basic Elimination");
    }

    return valueSet;
};

function InXNotInY(x,y){
    return x.filter((v)=>{
        return (y.indexOf(v) == -1);
    });
}

SudokuSolver.prototype.excludeOptionsFromCells = function excludeOptionsFromCells(cells,options,note){
    let ii, ll = cells.length;
    for(ii = 0; ii < ll; ii++){
        if(cells[ii].value) continue;
        let opts = InXNotInY(cells[ii].notes.options,options);
        //console.log("Reducing",otherCells[ii].notes.options,"to",opts,"-- removed",excludedVals);
        this.updateCellOptions(cells[ii],opts,note);
    }
};

SudokuSolver.prototype.twinHunt = function twinHunt(arr){
    let optionsRef = {};
    let i, l = arr.length;
    for(i = 0; i < l; i++){
        if(arr[i].value) continue;
        let str = arr[i].notes.options.join("");
        if(!optionsRef[str]) optionsRef[str] = [];
        optionsRef[str].push(arr[i]);
    }

    let o = Object.keys(optionsRef);
    l = o.length;

    let otherCells,excludedVals;
    for(i = 0; i < o.length; i++){

        // Twin Scenario
        if(o[i].length == 2 && optionsRef[ o[i] ].length > 1){
            //console.log("TWINS",optionsRef[ o[i] ]);

            otherCells = InXNotInY(arr, optionsRef[ o[i] ]);
            excludedVals = optionsRef[ o[i] ][0].notes.options;

            this.excludeOptionsFromCells(otherCells,excludedVals,"TWINS");
        }

        // Triplet Scenario
        let triplets;
        if(o[i].length == 3){
            let s = o[i];
            triplets = [].concat(optionsRef[s]);
            //console.log("POSTINIT",tripletCount,triplets);

            let subsets = [
                s[0]+s[1],
                s[1]+s[2],
                s[0]+s[2]
            ];

            let ii, ll = 3;
            for(ii = 0; ii < ll; ii++){
                let refs = optionsRef[ subsets[ii] ];
                if(refs){
                    triplets = triplets.concat(refs);
                    //console.log(subsets,optionsRef);
                    //console.log("Subset of",o[i],"=",subsets[ii],"--",refs);
                }
            }

            if(triplets.length >= 3){
                //console.log("TRIPLETS",o[i],triplets);
                otherCells = InXNotInY(arr,triplets);
                excludedVals = optionsRef[ o[i] ][0].notes.options;
                this.excludeOptionsFromCells(otherCells,excludedVals,"TRIPLETS");
            }
        }


    }
};

SudokuSolver.prototype.evalEntity = function evalEntity(arr){

    if( this.basicTechnique(arr) ) return true;

    if( this.loneRanger(arr) ) return true;

    this.twinHunt(arr);

    return false;
};

SudokuSolver.prototype.getRefLookup = function getRefLookup(arr){
    let i,l=GRID_SIZE,refs = [],safe = [];
    for(i = 0; i < l; i++){
        refs[i] = [];
        safe[i] = true;
    }

    l = arr.length;
    for(i=0;i<l;i++){
        let opts = arr[i].notes.options;

        let v= arr[i].value;
        if(v){
            refs[v-1] = [];
            safe[v-1] = false;
            continue;
        }

        let j,ll = opts.length;
        for(j=0;j<ll;j++){
            v = opts[j]-1;
            if(!safe[v]) continue;
            refs[v].push(arr[i]);
        }
    }
    /*for(i=0;i<l;i++){
        if(arr[i].value){
            refs[ arr[i].value -1 ] = [];
        }
    }*/

    return refs;
};

SudokuSolver.prototype.loneRanger = function loneRanger(arr){

    let refs = this.getRefLookup(arr), valueSet = false;

    let i,l = GRID_SIZE;
    for(i = 0; i < l; i++){
        if(refs[i].length == 1){
            //console.log(refs);
            if(refs[i][0].value){
                if(refs[i][0].value != i+1) throw "already assigned a different value";

                continue; // don't bother solving it again...
            }
            //throw "help";
            this.solveCell(refs[i][0],i+1,"LONERANGER");
            //console.log("LONERANGER",refs[i][0],i+1);
            //refs[i][0].value = i+1;
            valueSet = true;
        }
    }

    return valueSet;
};

SudokuSolver.prototype.determinePivotPoint = function determinePivotPoint(){
    let cellsWithXOptions = [null,null,null,
                            null,null,null,
                            null,null,null];

    let _cells = this.grid.cells.reduce((a,b)=>a.concat(b),[]).filter((v)=>!v.value);

    //console.log(_cells.map((v)=>v.value));

    let i, l = this.grid.cells.length;

    for(i=0;i<l;i++){
        let cell = _cells[i];
        let ind = cell.notes.options.length;
        if(ind == 2) return cell; // just run with it.
        cellsWithXOptions[ind] = cellsWithXOptions[ind] || [];
        cellsWithXOptions[ind].push(cell);
    }

    l = 9;
    for(i=0;i<l;i++){
        if(cellsWithXOptions[i]){
            return cellsWithXOptions[i][0];
        }
    }
};

SudokuSolver.prototype.solveDeterministic = function solveDeterministic(){

    // add all rows to be evaluated.
    let i, l = GRID_SIZE;
    for(i = 0; i < l; i++){
        this.entityQueue.enqueue({type:ENT_ROW,number:i});
    }

    let ent;let m = 0;
    while((ent = this.entityQueue.dequeue())){
        try{
            this.evalEntity(this.getEntity(ent.type,ent.number));
        } catch(e){
            throw "Not solvable.";
        }
    }
};

SudokuSolver.prototype.getLastCheckpoint = function getLastCheckpoint(){
    if(this.checkpoints.length === 0) return null;
    return this.checkpoints[this.checkpoints.length-1];
};

SudokuSolver.prototype.rollbackToCheckpoint = function rollbackToCheckpoint(){

};

SudokuSolver.prototype.getNumberOfCellsGiven = function getNumberOfCellsGiven(){
    let _cells = this.grid.cells.reduce((a,b)=>a.concat(b),[]);

    let nGiven = _cells.reduce((a,b)=>{
        return a+(b.value ? 1 : 0);
    },0);

    return nGiven;
};

const ACTION_CONTINUE = 1;
const ACTION_BREAK = 2;
const ACTION_DEADEND = 3;

SudokuSolver.prototype.__onSolve = function __onSolve(onSolution){
    /*let solvesById = this.solveHistory.reduce((a,b)=>{
        if(!a[b.id]) a[b.id] = [];
        a[b.id].push(b);
        return a;
    },{});
    console.log(solvesById);*/

    return onSolution();
};

SudokuSolver.prototype.__onDeadEnd = function __onDeadEnd(onNoSolution){

    let cp;
    while((cp = this.getLastCheckpoint()) !== null){
        if(cp.options.length < 2) this.checkpoints.splice(-1,1); // remove the last...
        else break;
    }
    if(cp === null){
        //console.log("no solution");
        return onNoSolution();
    } // truly unsolvable.

    this.resetGridToGivens();
    this.loadFromSolveHistory(cp.step);

    let remOptions = cp.options.slice(1);
    cp.value = remOptions[0];
    cp.options = remOptions;


    this.solveCell(
        this.grid.cells[Math.floor(cp.id / GRID_SIZE)][cp.id % GRID_SIZE],
        cp.value,
        "BRUTE FORCE"
    );
    return ACTION_CONTINUE;
};

SudokuSolver.prototype.__onTimeout = function __onTimeout(){
    console.log("Safety Valve Released");
};

SudokuSolver.prototype.__onFork = function __onFork(){
    let pivotPoint = this.determinePivotPoint();

    let cp = {
        step: this.solveHistory.length,
        id: pivotPoint.id,
        value:pivotPoint.notes.options[0],
        options: [].concat(pivotPoint.notes.options)
    };

    this.checkpoints.push(cp);

    this.solveCell(pivotPoint,pivotPoint.notes.options[0],"BRUTE FORCE");
};

SudokuSolver.prototype.solve = function solve(){
    return this.solveWithEvents(()=>{
        return ACTION_BREAK;
    },()=>{
        return ACTION_BREAK;
    });
};

SudokuSolver.prototype.hasMultipleSolutions = function hasMultipleSolutions(){
    let nSolutions = 0;

    this.resetGridToGivens();

    this.solveWithEvents(()=>{
        if(++nSolutions > 1) return ACTION_BREAK;
        return ACTION_DEADEND;
    },()=>{
        return ACTION_BREAK;
    });

    return (nSolutions > 1);
};

SudokuSolver.prototype.solveWithEvents = function solveWithEvents(onSolution,onNoSolution){

    let nGiven = this.getNumberOfCellsGiven();
    let nToSolve = 81 - nGiven;
    let nSolved = 0;

    let m = 0;

    if(nGiven < 10) return this.grid; // don't expect to solve.



    let onSolve = this.__onSolve;
    let onDeadEnd = this.__onDeadEnd;
    let onTimeout = this.__onTimeout;
    let onFork = this.__onFork;

    let act;

    while(nSolved < nToSolve){
        try{
            this.solveDeterministic();
        }catch(e){
            act = onDeadEnd.call(this,onNoSolution);
            if(act == ACTION_BREAK) break;
            if(act == ACTION_CONTINUE) continue; // skip to next...
        }

        nSolved = this.solveHistory.length;

        if(nSolved >= nToSolve){

            act = onSolve.call(this,onSolution);
            if(act == ACTION_BREAK) break;

            // pretend it wasn't a solution.
            if(act == ACTION_DEADEND){
                act = onDeadEnd.call(this,onNoSolution);
                nSolved = this.solveHistory.length; // will need to be re-adjusted.
                if(act == ACTION_BREAK) break;
                if(act == ACTION_CONTINUE) continue; // skip to next...
            }
        }

        // determine pivot point.
        onFork.call(this);

        if(++m > 1000){
            onTimeout.call(this);
             break; //safety.
        }
    }
    return this.grid;
};

export default SudokuSolver;
