/* jshint esversion:6 */

const React = require('react');
const ReactDOM = require('react-dom');
const $ = require('jquery');

// Tap plugin
const injectTapEventPlugin = require('react-tap-event-plugin');

injectTapEventPlugin({
	shouldRejectClick(lastTouchEventTimestamp, clickEventTimestamp) {
		const time_diff = clickEventTimestamp - lastTouchEventTimestamp;
		console.log(time_diff);
		if (time_diff < 750) {
			return true;
		}
	}
});

import Main from './components/Main';

$(document).ready(() => {
	ReactDOM.render(<Main />, document.getElementById('content'));
});
