/* jshint esversion:6 */

var React = require('react');
var ReactDOM = require('react-dom');
var $ = require('jquery');

// tap plugin
var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin({
  shouldRejectClick: function (lastTouchEventTimestamp, clickEventTimestamp) {
      let time_diff = clickEventTimestamp - lastTouchEventTimestamp;
    console.log(time_diff);
    if(time_diff < 750) return true;
  }
});

import Main from './components/Main';

$(document).ready(()=>{
    ReactDOM.render(<Main />,document.getElementById('content'));
});
