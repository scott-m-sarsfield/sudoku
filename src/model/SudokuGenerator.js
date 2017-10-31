/* eslint-disable func-names, one-var, unicorn/filename-case */

import clone from 'clone';
import SudokuGrid from './SudokuGrid';
import SudokuSolver from './SudokuSolver';

// Utils

function randInt(ceil) {
	return Math.floor(Math.random() * ceil);
}

function SudokuGenerator() {
}

const GRID_SIZE = 9;

// Seed an initial 12.
SudokuGenerator.prototype.randomInitCells = function randomInitCells() {
	const cells = [];
	let i, j;
	const l = GRID_SIZE;
	for (i = 0; i < l; i++) {
		cells.push([]);
		for (j = 0; j < l; j++) {
			cells[i].push(null);
		}
	}

	const nEntries = 12;

	const o = {};
	i = nEntries;
	while (i > 0) {
		j = randInt(81);
		if (o[j]) {
			continue;
		}
		o[j] = true;
		i--;
	}
	const a = Object.keys(o);

	for (i = 0; i < nEntries; i++) {
		cells[Math.floor(a[i] / GRID_SIZE)][a[i] % 9] = randInt(9) + 1;
	}

	return cells;
};

SudokuGenerator.prototype.getSolvedSudoku = function getSolvedSudoku() {
	let cells, grid;

	while (!(grid && grid.valid && grid.valid(false))) {
		cells = this.randomInitCells();
		grid = new SudokuGrid();
		grid.setCells(cells);
	}

	const solver = new SudokuSolver(grid);
	return solver.solve();
};

SudokuGenerator.prototype.unsetNCells = function unsetNCells(cells, n) {
	let nUnset = 0;

	const o = {};

	let nChosen = 0;

	function pickNextCell() {
		let j = randInt(81);
		while (o[j] !== undefined) {
			j = randInt(81);
		}
		nChosen++;
		return j;
	}

	function onSuccess(j) {
		o[j] = true;
		nUnset++;
	}
	function onFailure(j) {
		o[j] = false;
	}

	let grid, solver;

	let m = 0;

	while (nUnset < n && nChosen < 81) {
		const index = pickNextCell();
		const modifiedCells = clone(cells);
		modifiedCells[Math.floor(index / GRID_SIZE)][index % GRID_SIZE] = null;

		grid = new SudokuGrid();
		grid.setCells(modifiedCells);
		solver = new SudokuSolver(grid);

		if (solver.hasMultipleSolutions()) {
			onFailure(index);
		} else {
			onSuccess(index);
			cells = modifiedCells;
		}

		if (++m > 1000) {
			console.log('pressure value (unsetNCells)');
			break;
		}
	}

	return cells;
};

SudokuGenerator.prototype.generate = function generate(nGiven) {
	const nToBeRemoved = (GRID_SIZE * GRID_SIZE) - nGiven;

	let solvedCells = this.getSolvedSudoku().toMatrix();

	solvedCells = this.unsetNCells(solvedCells, nToBeRemoved);

	const grid = new SudokuGrid();
	grid.setCells(solvedCells);
	return grid;
};

export default SudokuGenerator;
