/* jshint esversion:6 */

var React = require('react');
import assign from 'object-assign';
import SudokuGrid from '../model/SudokuGrid';
import SudokuSolver from '../model/SudokuSolver';
import SudokuGenerator from '../model/SudokuGenerator';

//import SudokuInputGrid from './SudokuInputGrid';
//import SolvedSudokuGrid from './SolvedSudokuGrid';
import SudokuGameGrid from './SudokuGameGrid';
import SudokuKeyListener from './SudokuKeyListener';

import BezierMenu from './BezierMenu';

import $ from 'jquery';

const NROWS = 9;
const NCOLS = 9;

const styles = {
    table:{
        borderCollapse:'collapse',
        border:'solid 5px'
    },
    cell:{
        border:'solid 1px'
    },
    cellInput:{
        border:'none',
        width:'1em',
        padding:'0.5em',
        textAlign:'center'
    },
    cellDiv:{
        width:'1em',
        height:'1em',
        padding:'0.5em',
        textAlign:'center'
    }
};

let _generator = new SudokuGenerator();
let _generatedPuzzle = new SudokuGrid();
try{
    window.mypuzzle = _generatedPuzzle;
}catch(e){}

function loadGame(){
    try{
        let saved_data = localStorage.getItem('game_in_progress');
        if(saved_data){
            _generatedPuzzle.setCells(
                JSON.parse( saved_data ).cells || null
            );
            getClearedAndSolvedGrids();
        }
        else{
            newGame();
            saveGame();
        }
    }catch(e){

    }
}

function saveGame(){
    try{
        localStorage.setItem('game_in_progress',JSON.stringify(_generatedPuzzle));
    }catch(e){

    }
}

function newGame(n){
    n = n || 45;
    _generatedPuzzle = _generator.generate(n);
    _generatedPuzzle.initializeToGivens();

    getClearedAndSolvedGrids();
}


let unsolvedGrid, solvedGrid;
function getClearedAndSolvedGrids(){
    unsolvedGrid = _generatedPuzzle.getUnsolvedGrid();
    solvedGrid = (new SudokuSolver(unsolvedGrid)).solve();
}

let solutionMessage = "";

function checkSolution(ev){

    function flatten(a,b){ return a.concat(b);}

    let userSolution = _generatedPuzzle.toMatrix().reduce(flatten,[]);
    let actualSolution = solvedGrid.toMatrix().reduce(flatten,[]);

    let i, l = userSolution.length, nCorrect = 0, nWrong = 0;
    for(i=0;i<l;i++){
        if(userSolution[i]){
            if(userSolution[i]==actualSolution[i]) nCorrect++;
            else nWrong++;
        }
    }

    try{
        if(nWrong > 0){
             solutionMessage = "You have a few incorrect.";
        }else if(nCorrect == 81){
             solutionMessage = "Congratulations! You solved this puzzle!";
        }else{
             solutionMessage = "You're good so far...";
        }
    }catch(e){}

}


loadGame();

function matrix(nr,nc,def){
    let ret = [];
    let i,j;
    for(i=0;i<nr;i++){
        ret[i] = [];
        for(j=0;j<nc;j++){
            ret[i][j] = def;
        }
    }
    return ret;
}


let highlighted_cell_index = -1;
let note_mode = false;

const MENU_CLOSED = -1;
const MENU_MAIN = 0;
const MENU_NEWGAME = 1;
const MENU_HOWTOPLAY = 2;
const MENU_CREDITS = 3;

let current_menu = MENU_CLOSED;

function getStateFromStores(){

    return {
        s_grid:_generatedPuzzle,
        highlighted_cell_index: highlighted_cell_index,
        note_mode:note_mode,
        solution_message: solutionMessage,

        highlighted_cell_col: highlighted_cell_index % 9,
        highlighted_cell_row: Math.floor(highlighted_cell_index / 9),

        current_menu: current_menu
    };
}

function setCurrentMenu(m){
    current_menu = m;
}

//------------------------------------------------------------------------------

let DeviceHeight = 600, DeviceWidth = 600;
try{
    DeviceHeight = window.innerHeight;
    DeviceWidth = window.innerWidth;
}catch(e){
}



function max(a,b){
    return (a > b) ? a : b;
}
function min(a,b){
    return (a > b) ? b : a;
}

function calcTextSize(h,w){
    if(w < h - 342){
        return (w - 26) / 20;
    }else{
        return (h - 342) / 19;
    }
}

let SudokuTextSize = calcTextSize(DeviceHeight,DeviceWidth);


//------------------------------------------------------------------------------

class ButtonPanel extends React.Component{
    constructor(props){
        super(props);
        this.isActiveOption = this.isActiveOption.bind(this);
        this.getButtonClass = this.getButtonClass.bind(this);
    }

    isActiveOption(option){
        return this.props.activeButtons.join("").indexOf( String(option) ) >= 0;
    }

    getButtonClass(option){
        return this.isActiveOption(option) ? "on" : "off";
    }

    render(){
        let buttons = [],i;
        for(i = 1; i<= 9; i++){
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

        let clear_button = (<button className="clear" key={"clear"} onTouchTap={this.props.onClear}>Clear</button>);

        return (
            <div className="button-panel">
                <div className="clear-button-container">
                    {clear_button}
                </div>
                <div className="option-buttons-container" onTouchTap={(e)=>{
                    //;
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

class Main extends React.Component{

    constructor(props,context){
        super(props,context);

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

    componentDidMount(){
        try{
            window.addEventListener('resize',this.handleWindowResize);
        }catch(e){

        }
    }

    componentWillUnmount(){
        try{
            window.removeEventListener('resize',this.handleWindowResize);
        }catch(e){}
    }

    _onChange(){
        this.setState(getStateFromStores());
    }

    handleWindowResize(){
        SudokuTextSize = calcTextSize(window.innerHeight,window.innerWidth);
        //console.log("resized");
        this.setState({});
    }

    handleChange(e){
        //console.log(e.target.value);

        let elm = e.target;

        let x = elm.dataset.x,
            y = elm.dataset.y,
            v = elm.value;

        console.log("Changed ("+x+","+y+") to \""+v+"\"");

        let n = "";
        try{
            x = parseInt(x);
            y = parseInt(y);
            n = parseInt(v);
        }catch(error){
            n = "";
        }

        unsolved.set(x+1,y+1,n);

        localStorage.setItem("cells",JSON.stringify(unsolved.cells));

        this._onChange();
    }

    handleClear(){
        let mat = matrix(GRID_SIZE,GRID_SIZE,null);
        console.log(mat);
        unsolved.setCells(
            mat
        );
        this._onChange();
    }

    handleNumberInputCell(val){
        if(this.state.highlighted_cell_index < 0) return;

        let col = this.state.highlighted_cell_col;
        let row = this.state.highlighted_cell_row;

        if(_generatedPuzzle.isGiven(col+1,row+1)) return; // can't set given cell.

        if(this.state.note_mode){
            let cell = _generatedPuzzle.cells[row][col];
            cell.toggleOption(val);
        }else{
            //set value
            if(_generatedPuzzle.get(col+1,row+1) == val) val = null;
            _generatedPuzzle.set(col+1,row+1,val);
        }

        saveGame();

        this._onChange();
    }

    handleClearCell(e){
        //;
        let col = this.state.highlighted_cell_col;
        let row = this.state.highlighted_cell_row;

        if(_generatedPuzzle.isGiven(col+1,row+1)) return; // can't delete given cell.

        if(this.state.note_mode){
            let cell = _generatedPuzzle.cells[row][col];
            cell.clearOptions();
        }else{
            _generatedPuzzle.set(col+1,row+1,null);
        }

        saveGame();

        this._onChange();
    }

    handleSelectCell(index){
        highlighted_cell_index = index;
        this._onChange();
    }

    handleToggleNoteMode(e){
        //;
        note_mode = !note_mode;
        this._onChange();
    }

    handleSetNoteMode(on){
        note_mode = on;
        this._onChange();
    }

    handleStartNewGame(v){
        newGame(v);
        saveGame();
        setCurrentMenu(MENU_CLOSED);
        this._onChange();
    }
    handleChangeMenu(menu){
        setCurrentMenu(menu);
        this._onChange();
    }

    render(){

        const GRID_SIZE = 9;

        let _cellOptions = [];
        let _currentIndex = this.state.highlighted_cell_index;
        let _cellValue = null;
        if(_currentIndex >= 0){
            let _cell = this.state.s_grid.getCellByIndex(_currentIndex);
            _cellValue = _cell.value;
            _cellOptions = _cell.notes.options;
        }

        let gridStyles = {
            display:'inline-block',
            padding:'0',
            paddingTop: (this.state.solution_message) ? '0' : '1em',
            fontSize:SudokuTextSize+'px'
        };

        let note_mode_button = (
            <button onTouchTap={this.handleToggleNoteMode}>
                {"Note Mode: "+(note_mode ? "ON" : "OFF")}
            </button>
        );
        let new_game_button = (
            <button id={"new-game-button"} onTouchTap={this.handleChangeMenu.bind(this,MENU_MAIN)}>
                {"Menu"}
            </button>
        );

        let check_solution_button = (
            <button onTouchTap={(e)=>{
                ////;
                checkSolution(e);
                this._onChange();
            }}>
                {"Check Solution"}
            </button>
        );

        let button_inputs = (
            <div id="control-panel" className={(this.state.note_mode ? "note-mode" : "value-mode")}>
                <div className="mode-selection">
                    <button className="values" onTouchTap={this.handleSetNoteMode.bind(this,false)}>Values</button>
                    <button className="notes" onTouchTap={this.handleSetNoteMode.bind(this,true)}>Notes</button>

                    {/*note_mode_button*/}
                </div>
                <div>
                    <ButtonPanel
                        activeButtons={this.state.note_mode ? _cellOptions : [_cellValue]}
                        onNumberSelect={this.handleNumberInputCell}
                        onClear={this.handleClearCell}
                        />
                </div>
            </div>
        );

        let main_menu = (
            <div>
                <div style={{textAlign:'center'}}>Menu</div>
                <ul>
                    <li><button onTouchTap={this.handleChangeMenu.bind(this,MENU_NEWGAME)}>New Game</button></li>
                    <li><button onTouchTap={()=>{window.location = "./scan";}}>Scan-In Game</button></li>
                    <li><button onTouchTap={this.handleChangeMenu.bind(this,MENU_HOWTOPLAY)}>How To Play</button></li>
                    <li><button onTouchTap={this.handleChangeMenu.bind(this,MENU_CREDITS)}>Credits</button></li>
                    <li><button onTouchTap={this.handleChangeMenu.bind(this,MENU_CLOSED)}>Exit</button></li>
                  </ul>
            </div>
        );

        let new_game_menu = (
            <div>
                <div style={{textAlign:'center'}}>New Game</div>
                <ul>
                    <li><button onTouchTap={this.handleStartNewGame.bind(this,40)}>Easy</button></li>
                    <li><button onTouchTap={this.handleStartNewGame.bind(this,35)}>Medium</button></li>
                    <li><button onTouchTap={this.handleStartNewGame.bind(this,30)}>Hard</button></li>
                    <li><button onTouchTap={this.handleStartNewGame.bind(this,25)}>Evil</button></li>
                    <br />
                    <li><button onTouchTap={this.handleChangeMenu.bind(this,MENU_MAIN)}>Back</button></li>
                  </ul>
            </div>
        );

        let howto_menu = (
            <div>
                <div style={{textAlign:'center'}}>How To Play</div>
                <ul>
                    <li>(Ask Google.  I'll add this later.)</li>
                    <br />
                    <li><button onTouchTap={this.handleChangeMenu.bind(this,MENU_MAIN)}>Back</button></li>
                  </ul>
            </div>
        );

        let credits_menu = (
            <div>
                <div style={{textAlign:'center'}}>Credits</div>
                <ul>
                    <li>Copyright 2016 -- Scott Sarsfield</li>
                    <li><a href="http://scottmsarsfield.com" style={{textDecoration:'none'}}>scottmsarsfield.com</a></li>
                    <br />
                    <li><button onTouchTap={this.handleChangeMenu.bind(this,MENU_MAIN)}>Back</button></li>
                  </ul>
            </div>
        );

        let _themenu;
        switch(this.state.current_menu){
            case MENU_MAIN:
                _themenu = main_menu;
                break;
            case MENU_NEWGAME:
                _themenu = new_game_menu;
                break;
            case MENU_HOWTOPLAY:
                _themenu = howto_menu;
                break;
            case MENU_CREDITS:
                _themenu = credits_menu;
                break;

            default:
                _themenu = main_menu;
                break;
        }


        return (
            <div>
                <BezierMenu show={this.state.current_menu != -1} onClose={()=>{setCurrentMenu(MENU_CLOSED); this._onChange();}}>
                    {_themenu}
                </BezierMenu>
                <div className="game-header">
                    {new_game_button}
                    Sudoku
                </div>

                {/*new_game_button*/}
                <div id="check-solution-panel">
                    <div className="button">{check_solution_button}</div>
                    <div className="result" style={{display:(this.state.solution_message)?"block":"none"}}>
                        {this.state.solution_message}
                    </div>
                </div>

                <div style={{textAlign:'center'}}>
                    <div style={gridStyles}>
                        <SudokuKeyListener
                            highlighted_cell_index={this.state.highlighted_cell_index}
                            onClearCell={this.handleClearCell}
                            onSelectCell={this.handleSelectCell}
                            onNumberInput={this.handleNumberInputCell}
                            onSpaceBar={this.handleToggleNoteMode}/>

                        <SudokuGameGrid
                            grid={this.state.s_grid}
                            onSelectCell={this.handleSelectCell}
                            highlightClass={(this.state.note_mode)? "option_highlight" : "value_highlight"}
                            highlighted_cell_index={this.state.highlighted_cell_index}/>
                    </div>
                </div>
                {button_inputs}
            </div>
        );
    }
}

export default Main;
