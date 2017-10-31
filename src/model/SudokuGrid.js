/* jshint esversion:6 */
/* eslint-disable func-names, one-var, unicorn/filename-case */

const GRID_SIZE = 9;
const BOX_SIZE = 3;

function SudokuCell(id) {
	this.id = id;
	this.value = null;
	this.notes = {
		given: false,
		options: [1, 2, 3, 4, 5, 6, 7, 8, 9]
	};
}

SudokuCell.prototype.setGiven = function setGiven(given) {
	this.notes.given = given;
};

SudokuCell.prototype.clearOptions = function clearOptions() {
	this.notes.options = [];
};

SudokuCell.prototype.toggleOption = function toggleOption(option) {
	if (this.notes.options.find(v => v === option)) {
		this.notes.options = this.notes.options.filter(v => v !== option);
	} else {
		this.notes.options.push(option);
		this.notes.options = this.notes.options.sort();
	}
};

function SudokuGrid() {
	this.cells = [];
	let i, j;
	for (i = 0; i < GRID_SIZE; i++) {
		const arr = [];
		for (j = 0; j < GRID_SIZE; j++) {
			arr.push(new SudokuCell((i * GRID_SIZE) + j));
		}
		this.cells.push(arr);
	}
}

SudokuGrid.prototype.getUnsolvedGrid = function getUnsolvedGrid() {
	const _unsolved = this.cells.map(row => {
		return row.map(cell => {
			return (cell.notes.given) ? cell.value : null;
		});
	});

	return (new SudokuGrid()).setCells(_unsolved);
};

SudokuGrid.prototype.toString = function () {
	let str = '\n';

	let i, j;
	for (i = 0; i < GRID_SIZE; i++) {
		if (i === 3 || i === 6) {
			str += Array(23).join('=') + '\n';
		}

		for (j = 0; j < GRID_SIZE; j++) {
			if (j === 3 || j === 6) {
				str += '| ';
			}
			str += (this.cells[i][j].value || '_') + ' ';
		}

		str += '\n';
	}
	return str;
};

SudokuGrid.prototype.toMatrix = function toMatrix() {
	return this.cells.reduce((a, b) => {
		a.push(b.map(v => v.value));
		return a;
	}, []);
};

SudokuGrid.prototype.setCells = function setCells(cells) {
	if (cells && (Array.isArray(cells))) {
		let i, j;
		for (i = 0; i < GRID_SIZE; i++) {
			for (j = 0; j < GRID_SIZE; j++) {
				const _cell = this.cells[i][j],
					sourceCell = cells[i][j];

				if (sourceCell instanceof SudokuCell) {
					_cell.value = sourceCell.value;
					_cell.notes.given = sourceCell.notes.given;
					_cell.notes.options = sourceCell.notes.options;
				} else if (cells[i][j] && typeof cells[i][j] === 'object') {
					_cell.value = sourceCell.value;
					_cell.notes.given = sourceCell.notes.given;
					_cell.notes.options = sourceCell.notes.options;
				} else {
					_cell.value = sourceCell;
				}
			}
		}
	}
	return this;
};

SudokuGrid.prototype.initializeToGivens = function initializeToGivens() {
	this.setAssignedAsGiven();
	let i, j;
	for (i = 0; i < GRID_SIZE; i++) {
		for (j = 0; j < GRID_SIZE; j++) {
			const c = this.cells[i][j];
			c.clearOptions();
		}
	}
};

SudokuGrid.prototype.setAssignedAsGiven = function setAssignedAsGiven() {
	let i, j;
	for (i = 0; i < GRID_SIZE; i++) {
		for (j = 0; j < GRID_SIZE; j++) {
			const c = this.cells[i][j];
			c.setGiven(Boolean(c.value));
		}
	}
};

SudokuGrid.prototype.set = function set(x, y, val) {
    // Console.log("set",x,y,val);
	this.cells[y - 1][x - 1].value = val;
};
SudokuGrid.prototype.get = function get(x, y) {
	return this.cells[y - 1][x - 1].value;
};

SudokuGrid.prototype.getCellByIndex = function getCellByIndex(index) {
	return this.cells[Math.floor(index / GRID_SIZE)][index % GRID_SIZE];
};

SudokuGrid.prototype.isGiven = function isGiven(x, y) {
    // Console.log("isGiven",x,y);
    // console.log(this.given);
	return this.cells[y - 1][x - 1].notes.given;
};

export function isCollectionValid(arr, nullIsInvalid) {
	const counts = arr.map(() => 0);

	for (let i = 0; i < GRID_SIZE; i++) {
		const v = arr[i];
		if (!v || v < 1 || v > GRID_SIZE) {
			if (nullIsInvalid) {
				return false;
			}
			continue;
		}
		if (counts[v - 1] !== 0) {
			return false;
		}
		counts[v - 1]++;
	}

	return true;
}

// -----------------------------------------------------------------------------

function getRow(i) {
	return this.cells[i].map(v => v.value);
}

function getCol(i) {
	const col = [];
	for (let j = 0; j < GRID_SIZE; j++) {
		col.push(this.cells[j][i].value);
	}
	return col;
}

function getBox(i) {
	let box = [];
	const x = i % BOX_SIZE;
	const y = (i - x) / BOX_SIZE;

	for (let j = 0; j < GRID_SIZE / BOX_SIZE; j++) {
		box = box.concat(
            this.cells[(y * BOX_SIZE) + j]
                .slice(x * BOX_SIZE, (x + 1) * BOX_SIZE)
                .map(v => v.value)
        );
	}

	return box;
}

// -----------------------------------------------------------------------------

SudokuGrid.prototype.valid = function valid(nullIsInvalid) {
	if (nullIsInvalid === undefined) {
		nullIsInvalid = true;
	}

    // Row check
	let i;

    // For each row...
	for (i = 0; i < GRID_SIZE; i++) {
		if (!isCollectionValid(getRow.call(this, i), nullIsInvalid)) {
			return false;
		}
	}

    // For each column...
	for (i = 0; i < GRID_SIZE; i++) {
		if (!isCollectionValid(getCol.call(this, i), nullIsInvalid)) {
			return false;
		}
	}

    // For each box...
	for (i = 0; i < GRID_SIZE; i++) {
		if (!isCollectionValid(getBox.call(this, i), nullIsInvalid)) {
			return false;
		}
	}

	return true;
};

export default SudokuGrid;
