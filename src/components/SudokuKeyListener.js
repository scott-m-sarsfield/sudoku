/* eslint-disable unicorn/filename-case */
/* global window */

// kind of a bastardization of the React components, but it helps simplify things somewhat.

import React from 'react';
import PropTypes from 'prop-types';
import Constants from '../constants/Constants';

const keycode = require('keycode');

const GRID_SIZE = Constants.GRID_SIZE;

export default class SudokuKeyListener extends React.Component {

	static get propTypes() {
		return {
			highlightedCellIndex: PropTypes.any,
			onSelectCell: PropTypes.func,
			onClearCell: PropTypes.func,
			onNumberInput: PropTypes.func,
			onSpaceBar: PropTypes.func
		};
	}

	constructor(props) {
		super(props);
		this.handleKeyboardEvent = this.handleKeyboardEvent.bind(this);
	}

	componentDidMount() {
		try {
			window.addEventListener('keydown', this.handleKeyboardEvent);
		} catch (err) { /* nothing */ }
	}
	componentWillUnmount() {
		try {
			window.removeEventListener('keydown', this.handleKeyboardEvent);
		} catch (err) { /* nothing */ }
	}

	handleKeyboardEvent(e) {
		const key = e.keyCode || e.which;

		const _cellIndex = this.props.highlightedCellIndex;
		const _onSelectCell = this.props.onSelectCell;
		const _onClearCell = this.props.onClearCell;
		const _onNumberInput = this.props.onNumberInput;

		if (_cellIndex < 0) {
			return;
		} // Nothing selected.

		const highlightedCellRow = Math.floor(_cellIndex / GRID_SIZE);
		const highlightedCellCol = _cellIndex % GRID_SIZE;

		const translatedKey = keycode(key);
		let n = null;
		switch (translatedKey) {
			case 'left':
				if (highlightedCellCol > 0) {
					_onSelectCell(_cellIndex - 1);
				}
				break;
			case 'right':
				if (highlightedCellCol < 8) {
					_onSelectCell(_cellIndex + 1);
				}
				break;
			case 'down':
				if (highlightedCellRow < 8) {
					_onSelectCell(_cellIndex + GRID_SIZE);
				}
				break;
			case 'up':
				if (highlightedCellRow > 0) {
					_onSelectCell(_cellIndex - GRID_SIZE);
				}
				break;
			case 'delete':
			case 'backspace':
				_onClearCell();
				break;

			case 'space':
				this.props.onSpaceBar();
				break;

			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
			case 'numpad 1':
			case 'numpad 2':
			case 'numpad 3':
			case 'numpad 4':
			case 'numpad 5':
			case 'numpad 6':
			case 'numpad 7':
			case 'numpad 8':
			case 'numpad 9':
				n = parseInt(translatedKey.match(/[1-9]/)[0], 10);
				_onNumberInput(n);
				break;
			default:
				break;
		}
	}

	render() {
		return (<div />);
	}
}
