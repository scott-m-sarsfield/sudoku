/* jshint esversion: 6 */
/* eslint-env mocha */

import clone from 'clone';
import _test from '../src/test';
import SudokuGrid, {isCollectionValid} from '../src/model/SudokuGrid';
import SudokuSolver from '../src/model/SudokuSolver';

const expect = require('chai').expect;

describe('This', () => {
	describe('that', () => {
		it('sings Halleluja', () => {
			return true;
		});
		it('has matching test export', () => {
			expect(_test).to.equal('tester');
		});
	});
});

const perfectGrid = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 3, 4, 5, 6, 7, 8, 9, 1],
    [5, 6, 7, 8, 9, 1, 2, 3, 4],
    [8, 9, 1, 2, 3, 4, 5, 6, 7],
    [3, 4, 5, 6, 7, 8, 9, 1, 2],
    [6, 7, 8, 9, 1, 2, 3, 4, 5],
    [9, 1, 2, 3, 4, 5, 6, 7, 8]
];

const rowViolationGrid = [
    [1, 2, 3, 1, 2, 3, 1, 2, 3],
    [4, 5, 6, 4, 5, 6, 4, 5, 6],
    [7, 8, 9, 7, 8, 9, 7, 8, 9],
    [2, 3, 4, 2, 3, 4, 2, 3, 4],
    [5, 6, 7, 5, 6, 7, 5, 6, 7],
    [8, 9, 1, 8, 9, 1, 8, 9, 1],
    [3, 4, 5, 3, 4, 5, 3, 4, 5],
    [6, 7, 8, 6, 7, 8, 6, 7, 8],
    [9, 1, 2, 9, 1, 2, 9, 1, 2]
];

const colViolationGrid = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6]
];

const boxViolationGrid = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [2, 3, 4, 5, 6, 7, 8, 9, 1],
    [3, 4, 5, 6, 7, 8, 9, 1, 2],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [5, 6, 7, 8, 9, 1, 2, 3, 4],
    [6, 7, 8, 9, 1, 2, 3, 4, 5],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [8, 9, 1, 2, 3, 4, 5, 6, 7],
    [9, 1, 2, 3, 4, 5, 6, 7, 8]
];

describe('A collection (row,column,box)', () => {
	it('is valid if it is empty and null doesn\'t count as invalid', () => {
		const collection = [
			null, null, null,
			null, null, null,
			null, null, null
		];

		expect(isCollectionValid(collection, false)).to.equal(true);
	});
	it('is invalid if it is empty and null counts as invalid', () => {
		const collection = [
			null, null, null,
			null, null, null,
			null, null, null
		];

		expect(isCollectionValid(collection, true)).to.equal(false);
	});
});

describe('A Sudoku Grid', () => {
	let grid;
	beforeEach(() => {
		grid = new SudokuGrid();
	});
	it('has 9 rows', () => {
		expect(grid.cells.length).to.equal(9);
	});

	it('is valid when perfectly filled', () => {
		grid.setCells(clone(perfectGrid));
		expect(grid.valid()).to.equal(true);
	});

	it('is invalid when it is incomplete', () => {
		expect(grid.valid()).to.equal(false);
	});
	it('is invalid when a number appears twice in a row', () => {
		grid.setCells(clone(rowViolationGrid));
		expect(grid.valid()).to.equal(false);
	});
	it('is invalid when a number appears twice in a column', () => {
		grid.setCells(clone(colViolationGrid));
        // Console.log(grid.cells);
		expect(grid.valid()).to.equal(false);
	});
	it('is invalid when a number appears twice in a box', () => {
		grid.setCells(clone(boxViolationGrid));

		expect(grid.valid()).to.equal(false);
	});
});

const easyUnsolved = [
    [6, null, null, 2, null, 4, 8, null, null],
    [2, null, null, null, null, null, 3, null, 9],
    [null, 5, null, null, null, null, null, null, null],
    [null, null, null, null, null, 6, null, null, null],
    [4, 6, null, null, 1, null, null, 9, 3],
    [9, 8, null, null, 4, 7, null, null, null],
    [8, null, null, null, null, null, null, 1, null],
    [null, null, null, null, 6, 2, null, null, null],
    [null, 7, null, null, 3, 5, null, 4, null]
];

const easySolved = [
    [6, 3, 1, 2, 9, 4, 8, 7, 5],
    [2, 4, 8, 7, 5, 1, 3, 6, 9],
    [7, 5, 9, 6, 8, 3, 1, 2, 4],
    [3, 1, 5, 9, 2, 6, 4, 8, 7],
    [4, 6, 7, 5, 1, 8, 2, 9, 3],
    [9, 8, 2, 3, 4, 7, 6, 5, 1],
    [8, 2, 3, 4, 7, 9, 5, 1, 6],
    [5, 9, 4, 1, 6, 2, 7, 3, 8],
    [1, 7, 6, 8, 3, 5, 9, 4, 2]
];

const hardUnsolved = [
    [null, null, null, null, 8, null, 7, null, null],
    [null, null, 5, 1, null, null, null, null, null],
    [null, null, 8, null, null, null, null, 1, 4],
    [4, null, null, null, null, 2, 3, 6, null],
    [null, 2, null, null, 3, null, null, 8, null],
    [null, 3, 7, 4, null, null, null, null, 2],
    [6, 4, null, null, null, null, 9, null, null],
    [null, null, null, null, null, 3, 1, null, null],
    [null, null, 3, null, 6, null, null, null, null]
];

const hardSolved = [
    [2, 1, 4, 6, 8, 9, 7, 5, 3],
    [3, 6, 5, 1, 7, 4, 8, 2, 9],
    [7, 9, 8, 3, 2, 5, 6, 1, 4],
    [4, 5, 1, 8, 9, 2, 3, 6, 7],
    [9, 2, 6, 5, 3, 7, 4, 8, 1],
    [8, 3, 7, 4, 1, 6, 5, 9, 2],
    [6, 4, 2, 7, 5, 1, 9, 3, 8],
    [5, 8, 9, 2, 4, 3, 1, 7, 6],
    [1, 7, 3, 9, 6, 8, 2, 4, 5]
];

describe('The Sudoku Solver', () => {
	let grid;
	beforeEach(() => {
		grid = new SudokuGrid();
	});

	it('can solve an \'easy\' puzzle', () => {
		grid.setCells(clone(easyUnsolved));
		const solver = new SudokuSolver(grid);
		const solvedGrid = solver.solve();
		const solved = solvedGrid.cells.map(v => v.map(v => v.value));

		expect(solved).to.deep.equal(easySolved);
	});

	it('can solve a \'hard\' puzzle', () => {
		grid.setCells(clone(hardUnsolved));
		const solver = new SudokuSolver(grid);
		const solvedGrid = solver.solve();
		const solved = solvedGrid.cells.map(v => v.map(v => v.value));

		expect(solved).to.deep.equal(hardSolved);
	});
});
