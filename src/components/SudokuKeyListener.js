/* jshint esversion: 6 */

// kind of a bastardization of the React components, but it helps simplify things somewhat.

import React from 'react';
var keycode = require('keycode');
import Constants from '../constants/Constants';
const GRID_SIZE = Constants.GRID_SIZE;

export default class SudokuKeyListener extends React.Component{
    constructor(props){
        super(props);
        this.handleKeyboardEvent = this.handleKeyboardEvent.bind(this);
    }

    componentDidMount(){
        try{
            window.addEventListener('keydown',this.handleKeyboardEvent);
        }catch(e){}
    }
    componentWillUnmount(){
        try{
            window.removeEventListener('keydown',this.handleKeyboardEvent);
        }catch(e){}
    }

    handleKeyboardEvent(e){
        let key = e.keyCode || e.which;

        let _cellIndex = this.props.highlighted_cell_index;
        let _onSelectCell = this.props.onSelectCell;
        let _onClearCell = this.props.onClearCell;
        let _onNumberInput = this.props.onNumberInput;


        if(_cellIndex < 0) return; // nothing selected.

        let highlighted_cell_row = Math.floor(_cellIndex / GRID_SIZE);
        let highlighted_cell_col = _cellIndex % GRID_SIZE;

        let translated_key = keycode(key);
        //console.log(translated_key);
        switch(translated_key){
            case "left":
                if(highlighted_cell_col > 0){
                    _onSelectCell(_cellIndex - 1);
                }
                break;
            case "right":
                if(highlighted_cell_col < 8){
                    _onSelectCell(_cellIndex + 1);
                }
                break;
            case "down":
                if(highlighted_cell_row < 8){
                    _onSelectCell(_cellIndex + GRID_SIZE);
                }
                break;
            case "up":
                if(highlighted_cell_row > 0){
                    _onSelectCell(_cellIndex - GRID_SIZE);
                }
                break;
            case "delete":
            case "backspace":
                _onClearCell();
                break;

            case "space":
                this.props.onSpaceBar();
                break;

            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "numpad 1":
            case "numpad 2":
            case "numpad 3":
            case "numpad 4":
            case "numpad 5":
            case "numpad 6":
            case "numpad 7":
            case "numpad 8":
            case "numpad 9":
                let n = parseInt(translated_key.match(/[1-9]/)[0]);
                console.log("typed in number",n);
                _onNumberInput(n);
                break;
            default:
                break;
        }
    }

    render(){
        return (<div />);
    }
}
