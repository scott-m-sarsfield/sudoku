/* eslint-disable unicorn/filename-case */
/* global window, localStorage */
import React from 'react';
import SudokuGrid from '../model/SudokuGrid';
import SudokuSolver from '../model/SudokuSolver';
import SudokuGenerator from '../model/SudokuGenerator';

import SudokuGameGrid from './SudokuGameGrid';
import SudokuKeyListener from './SudokuKeyListener';

import BezierMenu from './BezierMenu';

const _generator = new SudokuGenerator();
let _generatedPuzzle = new SudokuGrid();
try {
	window.mypuzzle = _generatedPuzzle;
} catch (err) { /* nothing */ }

const GRID_SIZE = 9;

function loadGame() {
	try {
		const savedData = localStorage.getItem('game_in_progress');
		if (savedData) {
			_generatedPuzzle.setCells(
                JSON.parse(savedData).cells || null
            );
			getClearedAndSolvedGrids();
		} else {
			newGame();
			saveGame();
		}
	} catch (err) {
        /* Nothing */
	}
}

function saveGame() {
	try {
		localStorage.setItem('game_in_progress', JSON.stringify(_generatedPuzzle));
	} catch (err) {
        /* Nothing */
	}
}

function newGame(n) {
	n = n || 45;
	_generatedPuzzle = _generator.generate(n);
	_generatedPuzzle.initializeToGivens();

	getClearedAndSolvedGrids();
}

let unsolvedGrid;
let solvedGrid;
function getClearedAndSolvedGrids() {
	unsolvedGrid = _generatedPuzzle.getUnsolvedGrid();
	solvedGrid = (new SudokuSolver(unsolvedGrid)).solve();
}

let solutionMessage = '';

function checkSolution() {
	function flatten(a, b) {
		return a.concat(b);
	}

	const userSolution = _generatedPuzzle.toMatrix().reduce(flatten, []);
	const actualSolution = solvedGrid.toMatrix().reduce(flatten, []);

	let i;
	const l = userSolution.length;
	let nCorrect = 0;
	let nWrong = 0;
	for (i = 0; i < l; i++) {
		if (userSolution[i]) {
			if (userSolution[i] === actualSolution[i]) {
				nCorrect++;
			}	else {
				nWrong++;
			}
		}
	}

	try {
		if (nWrong > 0) {
			solutionMessage = 'You have a few incorrect.';
		} else if (nCorrect === 81) {
			solutionMessage = 'Congratulations! You solved this puzzle!';
		} else {
			solutionMessage = 'You\'re good so far...';
		}
	} catch (err) { /* nothing */ }
}

loadGame();

function matrix(nr, nc, def) {
	const ret = [];
	let i;
	let j;
	for (i = 0; i < nr; i++) {
		ret[i] = [];
		for (j = 0; j < nc; j++) {
			ret[i][j] = def;
		}
	}
	return ret;
}

let highlightedCellIndex = -1;
let noteMode = false;

const MENU_CLOSED = -1;
const MENU_MAIN = 0;
const MENU_NEWGAME = 1;
const MENU_HOWTOPLAY = 2;
const MENU_CREDITS = 3;

let currentMenu = MENU_CLOSED;

function getStateFromStores() {
	return {
		sGrid: _generatedPuzzle,
		highlightedCellIndex,
		noteMode,
		solutionMessage,

		highlightedCellCol: highlightedCellIndex % 9,
		highlightedCellRow: Math.floor(highlightedCellIndex / 9),

		currentMenu
	};
}

function setCurrentMenu(m) {
	currentMenu = m;
}

//------------------------------------------------------------------------------

let DeviceHeight = 600;
let DeviceWidth = 600;
try {
	DeviceHeight = window.innerHeight;
	DeviceWidth = window.innerWidth;
} catch (err) {
    /* Nothing */
}

function calcTextSize(h, w) {
	if (w < h - 342) {
		return (w - 26) / 20;
	}
	return (h - 342) / 19;
}

let SudokuTextSize = calcTextSize(DeviceHeight, DeviceWidth);

//------------------------------------------------------------------------------

class ButtonPanel extends React.Component {
	constructor(props) {
		super(props);
		this.isActiveOption = this.isActiveOption.bind(this);
		this.getButtonClass = this.getButtonClass.bind(this);
	}

	isActiveOption(option) {
		return this.props.activeButtons.join('').indexOf(String(option)) >= 0;
	}

	getButtonClass(option) {
		return this.isActiveOption(option) ? 'on' : 'off';
	}

	render() {
		const buttons = [];
		let i;
		for (i = 1; i <= 9; i++) {
			buttons.push(
                <button
                    className={this.getButtonClass(i)}
                    key={i}
                    data-value={i}
                >
                    {i}
                </button>
            );
		}

		const clearButton = (<button className="clear" key={'clear'} onTouchTap={this.props.onClear}>Clear</button>);

		return (
            <div className="button-panel">
                <div className="clear-button-container">
                    {clearButton}
                </div>
                <div className="option-buttons-container" onTouchTap={e => {
                    // ;
	console.log(e.target.dataset.value);
	this.props.onNumberSelect(e.target.dataset.value);
}}>
                    {buttons}
                </div>
            </div>
		);
	}
}

//------------------------------------------------------------------------------

class Main extends React.Component {

	constructor(props, context) {
		super(props, context);

		this.state = getStateFromStores();

		this._onChange = this._onChange.bind(this);
		this.handleClear = this.handleClear.bind(this);
		this.handleNumberInputCell = this.handleNumberInputCell.bind(this);
		this.handleClearCell = this.handleClearCell.bind(this);
		this.handleSelectCell = this.handleSelectCell.bind(this);
		this.handleToggleNoteMode = this.handleToggleNoteMode.bind(this);
		this.handleWindowResize = this.handleWindowResize.bind(this);
		this.handleSetNoteMode = this.handleSetNoteMode.bind(this);
	}

	componentDidMount() {
		try {
			window.addEventListener('resize', this.handleWindowResize);
		} catch (err) {
            /* Nothing */
		}
	}

	componentWillUnmount() {
		try {
			window.removeEventListener('resize', this.handleWindowResize);
		} catch (err) { /* nothing */ }
	}

	_onChange() {
		this.setState(getStateFromStores());
	}

	handleWindowResize() {
		SudokuTextSize = calcTextSize(window.innerHeight, window.innerWidth);
        // Console.log("resized");
		this.setState({});
	}

	handleChange(e) {
        // Console.log(e.target.value);

		const elm = e.target;

		let x = elm.dataset.x;
		let y = elm.dataset.y;
		const v = elm.value;

		console.log('Changed (' + x + ',' + y + ') to "' + v + '"');

		let n = '';
		try {
			x = parseInt(x, 10);
			y = parseInt(y, 10);
			n = parseInt(v, 10);
		} catch (err) {
			n = '';
		}

		unsolvedGrid.set(x + 1, y + 1, n);

		localStorage.setItem('cells', JSON.stringify(unsolvedGrid.cells));

		this._onChange();
	}

	handleClear() {
		const mat = matrix(GRID_SIZE, GRID_SIZE, null);
		console.log(mat);
		unsolvedGrid.setCells(
            mat
        );
		this._onChange();
	}

	handleNumberInputCell(val) {
		if (this.state.highlightedCellIndex < 0) {
			return;
		}

		const col = this.state.highlightedCellCol;
		const row = this.state.highlightedCellRow;

		if (_generatedPuzzle.isGiven(col + 1, row + 1)) {
			return;
		} // Can't set given cell.

		if (this.state.noteMode) {
			const cell = _generatedPuzzle.cells[row][col];
			cell.toggleOption(val);
		} else {
            // Set value
			if (_generatedPuzzle.get(col + 1, row + 1) === val) {
				val = null;
			}
			_generatedPuzzle.set(col + 1, row + 1, val);
		}

		saveGame();

		this._onChange();
	}

	handleClearCell() {
        // ;
		const col = this.state.highlightedCellCol;
		const row = this.state.highlightedCellRow;

		if (_generatedPuzzle.isGiven(col + 1, row + 1)) {
			return;
		} // Can't delete given cell.

		if (this.state.noteMode) {
			const cell = _generatedPuzzle.cells[row][col];
			cell.clearOptions();
		} else {
			_generatedPuzzle.set(col + 1, row + 1, null);
		}

		saveGame();

		this._onChange();
	}

	handleSelectCell(index) {
		highlightedCellIndex = index;
		this._onChange();
	}

	handleToggleNoteMode() {
		noteMode = !noteMode;
		this._onChange();
	}

	handleSetNoteMode(on) {
		noteMode = on;
		this._onChange();
	}

	handleStartNewGame(v) {
		newGame(v);
		saveGame();
		setCurrentMenu(MENU_CLOSED);
		this._onChange();
	}
	handleChangeMenu(menu) {
		setCurrentMenu(menu);
		this._onChange();
	}

	render() {
		let _cellOptions = [];
		const _currentIndex = this.state.highlightedCellIndex;
		let _cellValue = null;
		if (_currentIndex >= 0) {
			const _cell = this.state.sGrid.getCellByIndex(_currentIndex);
			_cellValue = _cell.value;
			_cellOptions = _cell.notes.options;
		}

		const gridStyles = {
			display: 'inline-block',
			padding: '0',
			paddingTop: (this.state.solutionMessage) ? '0' : '1em',
			fontSize: SudokuTextSize + 'px'
		};

		const newGameButton = (
            <button id={'new-game-button'} onTouchTap={this.handleChangeMenu.bind(this, MENU_MAIN)}>
                {'Menu'}
            </button>
        );

		const checkSolutionButton = (
            <button onTouchTap={e => {
	checkSolution(e);
	this._onChange();
}}>
                {'Check Solution'}
            </button>
        );

		const buttonInputs = (
            <div id="control-panel" className={(this.state.noteMode ? 'note-mode' : 'value-mode')}>
                <div className="mode-selection">
                    <button className="values" onTouchTap={this.handleSetNoteMode.bind(this, false)}>Values</button>
                    <button className="notes" onTouchTap={this.handleSetNoteMode.bind(this, true)}>Notes</button>
                </div>
                <div>
                    <ButtonPanel
                        activeButtons={this.state.noteMode ? _cellOptions : [_cellValue]}
                        onNumberSelect={this.handleNumberInputCell}
                        onClear={this.handleClearCell}
                        />
                </div>
            </div>
        );

		const mainMenu = (
            <div>
                <div style={{textAlign: 'center'}}>Menu</div>
                <ul>
                    <li><button onTouchTap={this.handleChangeMenu.bind(this, MENU_NEWGAME)}>New Game</button></li>
                    <li><button onTouchTap={() => {
	window.location = './scan';
}}>Scan-In Game</button></li>
                    <li><button onTouchTap={this.handleChangeMenu.bind(this, MENU_HOWTOPLAY)}>How To Play</button></li>
                    <li><button onTouchTap={this.handleChangeMenu.bind(this, MENU_CREDITS)}>Credits</button></li>
                    <li><button onTouchTap={this.handleChangeMenu.bind(this, MENU_CLOSED)}>Exit</button></li>
                  </ul>
            </div>
        );

		const newGameMenu = (
            <div>
                <div style={{textAlign: 'center'}}>New Game</div>
                <ul>
                    <li><button onTouchTap={this.handleStartNewGame.bind(this, 40)}>Easy</button></li>
                    <li><button onTouchTap={this.handleStartNewGame.bind(this, 35)}>Medium</button></li>
                    <li><button onTouchTap={this.handleStartNewGame.bind(this, 30)}>Hard</button></li>
                    <li><button onTouchTap={this.handleStartNewGame.bind(this, 25)}>Evil</button></li>
                    <br />
                    <li><button onTouchTap={this.handleChangeMenu.bind(this, MENU_MAIN)}>Back</button></li>
                  </ul>
            </div>
        );

		const howToMenu = (
            <div>
                <div style={{textAlign: 'center'}}>How To Play</div>
                <ul>
                    <li>(Ask Google.  I'll add this later.)</li>
                    <br />
                    <li><button onTouchTap={this.handleChangeMenu.bind(this, MENU_MAIN)}>Back</button></li>
                  </ul>
            </div>
        );

		const creditsMenu = (
            <div>
                <div style={{textAlign: 'center'}}>Credits</div>
                <ul>
                    <li>Copyright 2016 -- Scott Sarsfield</li>
                    <li><a href="http://scottmsarsfield.com" style={{textDecoration: 'none'}}>scottmsarsfield.com</a></li>
                    <br />
                    <li><button onTouchTap={this.handleChangeMenu.bind(this, MENU_MAIN)}>Back</button></li>
                  </ul>
            </div>
        );

		let _themenu;
		switch (this.state.currentMenu) {
			case MENU_MAIN:
				_themenu = mainMenu;
				break;
			case MENU_NEWGAME:
				_themenu = newGameMenu;
				break;
			case MENU_HOWTOPLAY:
				_themenu = howToMenu;
				break;
			case MENU_CREDITS:
				_themenu = creditsMenu;
				break;

			default:
				_themenu = mainMenu;
				break;
		}

		return (
            <div>
                <BezierMenu show={this.state.currentMenu !== -1} onClose={this.handleCloseMenu.bind(this)}>
                    {_themenu}
                </BezierMenu>
                <div className="game-header">
                    {newGameButton}
                    Sudoku
                </div>

                {/* newGameButton */}
                <div id="check-solution-panel">
                    <div className="button">{checkSolutionButton}</div>
                    <div className="result" style={{display: (this.state.solutionMessage) ? 'block' : 'none'}}>
                        {this.state.solutionMessage}
                    </div>
                </div>

                <div style={{textAlign: 'center'}}>
                    <div style={gridStyles}>
                        <SudokuKeyListener
                            highlightedCellIndex={this.state.highlightedCellIndex}
                            onClearCell={this.handleClearCell}
                            onSelectCell={this.handleSelectCell}
                            onNumberInput={this.handleNumberInputCell}
                            onSpaceBar={this.handleToggleNoteMode}/>

                        <SudokuGameGrid
                            grid={this.state.sGrid}
                            onSelectCell={this.handleSelectCell}
                            highlightClass={(this.state.noteMode) ? 'option_highlight' : 'value_highlight'}
                            highlightedCellIndex={this.state.highlightedCellIndex}/>
                    </div>
                </div>
                {buttonInputs}
            </div>
		);
	}

	handleCloseMenu() {
		setCurrentMenu(MENU_CLOSED);
		this._onChange();
	}
}

export default Main;
