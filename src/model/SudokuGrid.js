/* jshint esversion:6 */

import clone from 'clone';

const GRID_SIZE = 9;
const BOX_SIZE = 3;

function SudokuCell(id){
    this.id = id;
    this.value = null;
    this.notes = {
        given: false,
        options:[1,2,3,4,5,6,7,8,9]
    };
}

SudokuCell.prototype.setGiven = function setGiven(given){
    this.notes.given = given;
};

SudokuCell.prototype.clearOptions = function clearOptions(given){
    this.notes.options = [];
};

SudokuCell.prototype.toggleOption = function toggleOption(option){
    if(this.notes.options.find((v)=>v==option)){
        this.notes.options = this.notes.options.filter((v)=>v!=option);
    }else{
        this.notes.options.push(option);
        this.notes.options = this.notes.options.sort();
    }
};

function SudokuGrid(){
    this.cells = [];
    let i,j;
    for(i = 0; i < GRID_SIZE; i++){
        let arr = [];
        for(j = 0; j < GRID_SIZE; j++){
            arr.push(new SudokuCell(i*GRID_SIZE+j));
        }
        this.cells.push(arr);
    }
}

SudokuGrid.prototype.getUnsolvedGrid = function getUnsolvedGrid(){
    let _unsolved = this.cells.map((row)=>{
        return row.map((cell)=>{
            return (cell.notes.given) ? cell.value : null;
        });
    });

    return (new SudokuGrid()).setCells(_unsolved);
};

SudokuGrid.prototype.toString = function(){
    let str = "\n";

    let i,j;
    for(i=0;i<GRID_SIZE;i++){

        if(i==3 || i == 6){
            str += Array(23).join("=")+"\n";
        }

        for(j=0;j<GRID_SIZE;j++){
            if(j==3 || j==6) str+="| ";
            str+=(this.cells[i][j].value || "_")+ " ";
        }

        str += "\n";
    }
    return str;
};

SudokuGrid.prototype.toMatrix = function toMatrix(){
    return this.cells.reduce((a,b)=>{
        a.push(b.map((v)=>v.value));
        return a;
    },[]);
};

SudokuGrid.prototype.setCells = function setCells(cells){
    if(cells && (cells instanceof Array)){
        let i,j;
        for(i=0;i<GRID_SIZE;i++){
            for(j=0;j<GRID_SIZE;j++){
                let _cell = this.cells[i][j],
                    src_cell = cells[i][j];

                if(src_cell instanceof SudokuCell){
                    _cell.value = src_cell.value;
                    _cell.notes.given = src_cell.notes.given;
                    _cell.notes.options = src_cell.notes.options;
                }else if(cells[i][j] && typeof cells[i][j] == "object"){
                    _cell.value = src_cell.value;
                    _cell.notes.given = src_cell.notes.given;
                    _cell.notes.options = src_cell.notes.options;
                }else{
                    _cell.value = src_cell;
                }
            }
        }
    }
    return this;
};

SudokuGrid.prototype.initializeToGivens = function initializeToGivens(){
    this.setAssignedAsGiven();
    let i,j;
    for(i=0;i<GRID_SIZE;i++){
        for(j=0;j<GRID_SIZE;j++){
            let c= this.cells[i][j];
            c.clearOptions();
        }
    }
};

SudokuGrid.prototype.setAssignedAsGiven = function setAssignedAsGiven(){
    let i,j;
    for(i=0;i<GRID_SIZE;i++){
        for(j=0;j<GRID_SIZE;j++){
            let c= this.cells[i][j];
            c.setGiven(!!c.value);
        }
    }
    return;
};

SudokuGrid.prototype.set = function set(x,y,val){
    //console.log("set",x,y,val);
    this.cells[y-1][x-1].value = val;
};
SudokuGrid.prototype.get = function get(x,y){
    return this.cells[y-1][x-1].value;
};

SudokuGrid.prototype.getCellByIndex = function getCellByIndex(index){
    return this.cells[ Math.floor(index / GRID_SIZE)][index % GRID_SIZE];
};

SudokuGrid.prototype.isGiven = function isGiven(x,y){
    //console.log("isGiven",x,y);
    //console.log(this.given);
    return this.cells[y-1][x-1].notes.given;
};

function isCollectionValid(arr,nullIsInvalid){
    var counts = arr.map((v)=>0);

    for(var i = 0; i < GRID_SIZE; i++){
        var v = arr[i];
        if(!v || v < 1 || v > GRID_SIZE){
            if(nullIsInvalid) return false;
            continue;
        }
        if(counts[v-1] !== 0) return false;
        counts[v-1]++;
    }

    return true;
}

exports.isCollectionValid = isCollectionValid;

// -----------------------------------------------------------------------------

function getRow(i){
    return this.cells[i].map((v)=>v.value);
}

function getCol(i){
    var col = [];
    for(var j = 0; j < GRID_SIZE; j++){
        col.push(this.cells[j][i].value);
    }
    return col;
}

function getBox(i){
    var box = [];
    var x = i % BOX_SIZE;
    var y = (i-x) / BOX_SIZE;

    for(var j = 0; j < GRID_SIZE / BOX_SIZE; j++){
        box = box.concat(
            this.cells[y*BOX_SIZE+j]
                .slice(x*BOX_SIZE,(x+1)*BOX_SIZE)
                .map((v)=>v.value)
        );
    }

    //console.log(box);

    return box;
}

// -----------------------------------------------------------------------------

SudokuGrid.prototype.valid = function valid(nullIsInvalid){
    //console.log(nullIsInvalid);
    if(nullIsInvalid === undefined) nullIsInvalid = true;
    //console.log(nullIsInvalid);

    // row check
    var i,j;

    // for each row...
    for(i = 0; i < GRID_SIZE; i++){
        if(!isCollectionValid( getRow.call(this,i), nullIsInvalid)){
            //console.log("invalid row",i);
            return false;
        }
    }

    // for each column...
    for(i = 0; i < GRID_SIZE; i++){
        if(!isCollectionValid( getCol.call(this,i), nullIsInvalid)){
            //console.log("invalid col",i);
            return false;
        }
    }

    // for each box...
    for(i = 0; i < GRID_SIZE; i++){
        if(!isCollectionValid( getBox.call(this,i), nullIsInvalid)){
            //console.log("invalid box",i);
            return false;
        }
    }


    return true;
};

export default SudokuGrid;
