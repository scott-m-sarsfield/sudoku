/* jshint esversion: 6 */

import React from 'react';
import assign from 'object-assign';

const styles = {
    table:{
        borderCollapse:'collapse',
        border:'solid 5px'
    },
    cell:{
        border:'solid 1px',
        cursor:'pointer'
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

const GRID_SIZE = 9;
const NROWS = 9;
const NCOLS = 9;


class SudokuGameCell extends React.Component{


        getCellStyleByXY(i,j){
            let cellStyle = assign({},styles.cell);

            if(i == 3 || i == 6){
                cellStyle = assign(cellStyle,{borderTopWidth:'5px'});
            }

            if(j == 3 || j == 6){
                cellStyle = assign(cellStyle,{borderLeftWidth:'5px'});
            }

            return cellStyle;
        }

        renderOptionGrid(opts){
            let c_rows = [];
            let ii, ll = opts.length, currRow = null;
            for(ii = 0; ii < ll; ii++){
                if(!currRow){
                    currRow = [];
                }
                currRow.push((<td key={ii}>{opts[ii]}</td>));

                if(currRow.length == 3){
                    c_rows.push((
                        <tr key={ii}>
                            {currRow}
                        </tr>
                    ));
                    currRow = null;
                }
            }
            if(currRow){
                c_rows.push((
                    <tr key={ii}>
                        {currRow}
                    </tr>
                ));
            }
            return (
                <div style={{margin:'-0.5em'}}>
                    <table style={{fontSize:'0.6em',lineHeight:'0.7em',width:'100%'}}><tbody>
                        {c_rows}
                    </tbody></table>
                </div>
            );

        }
    render(){
        let i = this.props.row, j = this.props.col;
        let spanStyle = {};

        let _given = this.props.given;//grid.isGiven(j+1,i+1);
        let _value = this.props.value;//grid.get(j+1,i+1);
        let _options = this.props.options;//grid.cells[i][j].notes.options;

        if(_given) spanStyle = assign(spanStyle,{fontWeight:'bold'});

        let inner = null, val;
        if(_value){
            inner = (
                <span style={spanStyle}>
                    {_value || ""}
                </span>
            );
        }else{
            inner = this.renderOptionGrid(_options);
        }
        return (
            <td
                key={j}
                className={"sudoku_cell "+((this.props.highlighted) ? this.props.highlightClass : "")}
                data-index={i*GRID_SIZE+j}
                style={this.getCellStyleByXY(i,j)}
                >
                <div style={styles.cellDiv}>
                    {inner}
                </div>
            </td>
        );
    }
}





export default class SudokuGameGrid extends React.Component{
    constructor(props){
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e){
        //;

        let elm = e.target;
        while(elm && !elm.className.match("sudoku_cell")) elm = elm.parentElement;
        if(!elm){ console.error("can't find cell"); return;}

        let index = parseInt(elm.dataset.index);
        this.props.onSelectCell(index);
    }


    render(){
        let srows = [];

        let grid = this.props.grid;

        let i,j;

        if(grid){
            for(i=0; i < NROWS; i++){
                let cells = [];
                for(j=0; j < NCOLS; j++){


                    let _given = grid.isGiven(j+1,i+1);
                    let _value = grid.get(j+1,i+1);
                    let _options = grid.cells[i][j].notes.options;

                    let index = i*GRID_SIZE + j;
                    let _highlighted = (index == this.props.highlighted_cell_index);

                    //console.log(this.props.highlightClass);

                    cells.push(
                        <SudokuGameCell
                            key={i*GRID_SIZE+j}
                            given={_given}
                            value={_value}
                            options={_options}
                            row={i}
                            col={j}
                            highlightClass={this.props.highlightClass}
                            highlighted={_highlighted} />
                    );
                }
                srows.push(
                    <tr key={i}>
                        {cells}
                    </tr>
                );
            }
        }

        return (
            <table className="sudoku-grid" style={styles.table} onTouchTap={this.handleClick}>
                <thead></thead>
                <tbody>
                    {srows}
                </tbody>
            </table>
        );
    }
}
