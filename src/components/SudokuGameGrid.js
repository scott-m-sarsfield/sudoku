/* eslint-disable unicorn/filename-case */

import React from 'react';
import assign from 'object-assign';

const styles = {
	table: {
		borderCollapse: 'collapse',
		border: 'solid 5px'
	},
	cell: {
		border: 'solid 1px',
		cursor: 'pointer'
	},
	cellInput: {
		border: 'none',
		width: '1em',
		padding: '0.5em',
		textAlign: 'center'
	},
	cellDiv: {
		width: '1em',
		height: '1em',
		padding: '0.5em',
		textAlign: 'center'
	}
};

const GRID_SIZE = 9;
const NROWS = 9;
const NCOLS = 9;

class SudokuGameCell extends React.Component {

	getCellStyleByXY(i, j) {
		let cellStyle = assign({}, styles.cell);

		if (i === 3 || i === 6) {
			cellStyle = assign(cellStyle, {borderTopWidth: '5px'});
		}

		if (j === 3 || j === 6) {
			cellStyle = assign(cellStyle, {borderLeftWidth: '5px'});
		}

		return cellStyle;
	}

	renderOptionGrid(opts) {
		const rows = [];
		let ii;
		const ll = opts.length;
		let currRow = null;
		for (ii = 0; ii < ll; ii++) {
			if (!currRow) {
				currRow = [];
			}
			currRow.push((<td key={ii}>{opts[ii]}</td>));

			if (currRow.length === 3) {
				rows.push((
                        <tr key={ii}>
                            {currRow}
                        </tr>
                    ));
				currRow = null;
			}
		}
		if (currRow) {
			rows.push((
                    <tr key={ii}>
                        {currRow}
                    </tr>
                ));
		}
		return (
                <div style={{margin: '-0.5em'}}>
                    <table style={{fontSize: '0.6em', lineHeight: '0.7em', width: '100%'}}><tbody>
                        {rows}
                    </tbody></table>
                </div>
		);
	}
	render() {
		const i = this.props.row;
		const j = this.props.col;
		let spanStyle = {};

		const _given = this.props.given;// Grid.isGiven(j+1,i+1);
		const _value = this.props.value;// Grid.get(j+1,i+1);
		const _options = this.props.options;// Grid.cells[i][j].notes.options;

		if (_given) {
			spanStyle = assign(spanStyle, {fontWeight: 'bold'});
		}

		let inner = null;
		if (_value) {
			inner = (
                <span style={spanStyle}>
                    {_value || ''}
                </span>
            );
		} else {
			inner = this.renderOptionGrid(_options);
		}
		return (
            <td
                key={j}
                className={'sudoku_cell ' + ((this.props.highlighted) ? this.props.highlightClass : '')}
                data-index={(i * GRID_SIZE) + j}
                style={this.getCellStyleByXY(i, j)}
                >
                <div style={styles.cellDiv}>
                    {inner}
                </div>
            </td>
		);
	}
}

export default class SudokuGameGrid extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(e) {
        // ;

		let elm = e.target;
		while (elm && !elm.className.match('sudoku_cell')) {
			elm = elm.parentElement;
		}
		if (!elm) {
			console.error('can\'t find cell');
			return;
		}

		const index = parseInt(elm.dataset.index, 10);
		this.props.onSelectCell(index);
	}

	render() {
		const srows = [];

		const grid = this.props.grid;

		let i;
		let j;

		if (grid) {
			for (i = 0; i < NROWS; i++) {
				const cells = [];
				for (j = 0; j < NCOLS; j++) {
					const _given = grid.isGiven(j + 1, i + 1);
					const _value = grid.get(j + 1, i + 1);
					const _options = grid.cells[i][j].notes.options;

					const index = (i * GRID_SIZE) + j;
					const _highlighted = (index === this.props.highlighted_cell_index);

                    // Console.log(this.props.highlightClass);

					cells.push(
                        <SudokuGameCell
                            key={(i * GRID_SIZE) + j}
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
