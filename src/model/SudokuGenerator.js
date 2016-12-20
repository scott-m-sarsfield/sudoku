/* jshint esversion: 6 */

import SudokuGrid from './SudokuGrid';
import SudokuSolver from './SudokuSolver';
import clone from 'clone';

// utils

function randInt(ceil){
    return Math.floor( Math.random()*ceil );
}



function SudokuGenerator(){
}

const GRID_SIZE = 9;

// seed an initial 12.
SudokuGenerator.prototype.randomInitCells = function randomInitCells(){
    let cells = [];
    let i,j,l = GRID_SIZE;
    for(i=0;i<l;i++){
        cells.push([]);
        for(j=0;j<l;j++)
            cells[i].push(null);
    }
    //console.log(cells);

    let nEntries = 12;

    let o = {};
    i = nEntries;
    while(i > 0){
        j = randInt(81);
        if(o[j]) continue;
        o[j] = true;
        i--;
    }
    let a = Object.keys(o);

    for(i = 0; i < nEntries; i++){
        cells[Math.floor(a[i] / GRID_SIZE)][a[i] % 9] = randInt(9)+1;
    }

    /*
    console.log(cells.reduce((a,b)=>{
        return a.concat(b);
    },[]));
    */
    return cells;
};

SudokuGenerator.prototype.getSolvedSudoku = function getSolvedSudoku(){
    let cells, grid, solver, solved = false;

    while(!solved){
        cells = this.randomInitCells();
        grid = new SudokuGrid();
        grid.setCells(cells);
        if(!grid.valid(false)) continue;
        solver = new SudokuSolver(grid);
        let solved_grid = solver.solve();

        //console.log(solved_grid);
        //console.log(solved_grid.valid());

        return solved_grid;
        //solved = true;
    }

};

SudokuGenerator.prototype.unsetNCells = function unsetNCells(cells,n){

    let nUnset = 0;

    let i = 0;
    let o = {};

    let nChosen = 0;

    function pickNextCell(){
        let j = randInt(81);
        while(o[j] !== undefined) j = randInt(81);
        nChosen++;
        return j;
    }

    function onSuccess(j){
        o[j] = true;
        nUnset++;
    }
    function onFailure(j){
        o[j] = false;
    }

    let grid, solver;

    let m =0;

    while(nUnset < n && nChosen < 81){

        let index = pickNextCell();
        let mod_cells = clone(cells);
        mod_cells[Math.floor(index / GRID_SIZE)][index % GRID_SIZE] = null;

        grid = new SudokuGrid();
        grid.setCells(mod_cells);
        solver = new SudokuSolver(grid);

        if(solver.hasMultipleSolutions()){
            onFailure(index);
        }else{
            onSuccess(index);
            cells = mod_cells;
        }

        if(++m > 1000){ console.log("pressure value (unsetNCells)"); break;}
    }

    return cells;
};

SudokuGenerator.prototype.generate = function generate(nGiven){

    let nToBeRemoved = GRID_SIZE*GRID_SIZE - nGiven;

    let solved_cells = this.getSolvedSudoku().toMatrix();

    solved_cells = this.unsetNCells(solved_cells,nToBeRemoved);

    let grid = new SudokuGrid();
    grid.setCells(solved_cells);
    return grid;
};

export default SudokuGenerator;
