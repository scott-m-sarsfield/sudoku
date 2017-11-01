/* global document */
import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import $ from 'jquery';

import injectTapEventPlugin from 'react-tap-event-plugin';
import Main from './components/Main';

injectTapEventPlugin({
	shouldRejectClick(lastTouchEventTimestamp, clickEventTimestamp) {
		const timeDiff = clickEventTimestamp - lastTouchEventTimestamp;
		if (timeDiff < 750) {
			return true;
		}
	}
});

$(document).ready(() => {
	ReactDOM.render(<Main />, document.getElementById('content'));
});
