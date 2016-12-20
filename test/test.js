/*jshint esversion: 6 */

var expect = require('chai').expect;

import _test from '../src/test';
import SudokuGrid, {isCollectionValid} from '../src/model/SudokuGrid';
import SudokuSolver from '../src/model/SudokuSolver';
import assign from 'object-assign';
import clone from 'clone';

describe('This',function(){
    describe("that",function(){
        it("sings Halleluja",function(){
            return true;
        });
        it("has matching test export",function(){
            expect(_test).to.equal("tester");
        });
    });
});

const perfectGrid = [
    [1,2,3,4,5,6,7,8,9,],
    [4,5,6,7,8,9,1,2,3,],
    [7,8,9,1,2,3,4,5,6,],
    [2,3,4,5,6,7,8,9,1,],
    [5,6,7,8,9,1,2,3,4,],
    [8,9,1,2,3,4,5,6,7,],
    [3,4,5,6,7,8,9,1,2,],
    [6,7,8,9,1,2,3,4,5,],
    [9,1,2,3,4,5,6,7,8,]
];

const rowViolationGrid = [
    [1,2,3,1,2,3,1,2,3,],
    [4,5,6,4,5,6,4,5,6,],
    [7,8,9,7,8,9,7,8,9,],
    [2,3,4,2,3,4,2,3,4,],
    [5,6,7,5,6,7,5,6,7,],
    [8,9,1,8,9,1,8,9,1,],
    [3,4,5,3,4,5,3,4,5,],
    [6,7,8,6,7,8,6,7,8,],
    [9,1,2,9,1,2,9,1,2,]
];

const colViolationGrid = [
    [1,2,3,4,5,6,7,8,9,],
    [4,5,6,7,8,9,1,2,3,],
    [7,8,9,1,2,3,4,5,6,],
    [1,2,3,4,5,6,7,8,9,],
    [4,5,6,7,8,9,1,2,3,],
    [7,8,9,1,2,3,4,5,6,],
    [1,2,3,4,5,6,7,8,9,],
    [4,5,6,7,8,9,1,2,3,],
    [7,8,9,1,2,3,4,5,6,],
];

const boxViolationGrid = [
    [1,2,3,4,5,6,7,8,9,],
    [2,3,4,5,6,7,8,9,1,],
    [3,4,5,6,7,8,9,1,2,],
    [4,5,6,7,8,9,1,2,3,],
    [5,6,7,8,9,1,2,3,4,],
    [6,7,8,9,1,2,3,4,5,],
    [7,8,9,1,2,3,4,5,6,],
    [8,9,1,2,3,4,5,6,7,],
    [9,1,2,3,4,5,6,7,8,]
];

describe("A collection (row,column,box)",function(){
    it("is valid if it is empty and null doesn't count as invalid",function(){
        let collection  = [
                            null,null,null,
                            null,null,null,
                            null,null,null
                        ];

        expect(isCollectionValid(collection,false)).to.equal(true);
    });
    it("is invalid if it is empty and null counts as invalid",function(){
        let collection  = [
                            null,null,null,
                            null,null,null,
                            null,null,null
                        ];

        expect(isCollectionValid(collection,true)).to.equal(false);
    });
});

describe("A Sudoku Grid",function(){
    let grid;
    beforeEach(function(){
        grid = new SudokuGrid();
    });
    it("has 9 rows",function(){
        expect(grid.cells.length).to.equal(9);
    });

    it("is valid when perfectly filled",function(){
        grid.setCells(clone(perfectGrid));
        expect(grid.valid()).to.equal(true);
    });

    it("is invalid when it is incomplete",function(){
        expect(grid.valid()).to.equal(false);
    });
    it("is invalid when a number appears twice in a row",function(){
        grid.setCells(clone(rowViolationGrid));
        expect(grid.valid()).to.equal(false);
    });
    it("is invalid when a number appears twice in a column",function(){
        grid.setCells(clone(colViolationGrid));
        //console.log(grid.cells);
        expect(grid.valid()).to.equal(false);
    });
    it("is invalid when a number appears twice in a box",function(){
        grid.setCells(clone(boxViolationGrid));

        expect(grid.valid()).to.equal(false);
    });
});

const easyUnsolved = [
    [6,null,null,2,null,4,8,null,null],
    [2,null,null,null,null,null,3,null,9],
    [null,5,null,null,null,null,null,null,null],
    [null,null,null,null,null,6,null,null,null],
    [4,6,null,null,1,null,null,9,3],
    [9,8,null,null,4,7,null,null,null],
    [8,null,null,null,null,null,null,1,null],
    [null,null,null,null,6,2,null,null,null],
    [null,7,null,null,3,5,null,4,null]
];

const easySolved = [
    [6,3,1,2,9,4,8,7,5],
    [2,4,8,7,5,1,3,6,9],
    [7,5,9,6,8,3,1,2,4],
    [3,1,5,9,2,6,4,8,7],
    [4,6,7,5,1,8,2,9,3],
    [9,8,2,3,4,7,6,5,1],
    [8,2,3,4,7,9,5,1,6],
    [5,9,4,1,6,2,7,3,8],
    [1,7,6,8,3,5,9,4,2]
];

const hardUnsolved = [
    [null,null,null,null,8,null,7,null,null],
    [null,null,5,1,null,null,null,null,null],
    [null,null,8,null,null,null,null,1,4],
    [4,null,null,null,null,2,3,6,null],
    [null,2,null,null,3,null,null,8,null],
    [null,3,7,4,null,null,null,null,2],
    [6,4,null,null,null,null,9,null,null],
    [null,null,null,null,null,3,1,null,null],
    [null,null,3,null,6,null,null,null,null]
];

const hardSolved = [
    [2,1,4,6,8,9,7,5,3],
    [3,6,5,1,7,4,8,2,9],
    [7,9,8,3,2,5,6,1,4],
    [4,5,1,8,9,2,3,6,7],
    [9,2,6,5,3,7,4,8,1],
    [8,3,7,4,1,6,5,9,2],
    [6,4,2,7,5,1,9,3,8],
    [5,8,9,2,4,3,1,7,6],
    [1,7,3,9,6,8,2,4,5]
];

describe("The Sudoku Solver",function(){
    let grid;
    beforeEach(function(){
         grid = new SudokuGrid();
    });

    it("can solve an 'easy' puzzle",function(){

        grid.setCells(clone(easyUnsolved));
        let solver = new SudokuSolver(grid);
        let s_grid = solver.solve();
        let solved = s_grid.cells.map((v)=>v.map((v)=>v.value));

        expect(solved).to.deep.equal(easySolved);
    });

    it("can solve a 'hard' puzzle",function(){
        grid.setCells(clone(hardUnsolved));
        let solver = new SudokuSolver(grid);
        let s_grid = solver.solve();
        let solved = s_grid.cells.map((v)=>v.map((v)=>v.value));

        expect(solved).to.deep.equal(hardSolved);
    });
});
