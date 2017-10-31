/* eslint-disable unicorn/filename-case */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Main from './src/components/Main';

const main = React.createElement(Main);

export default {
	content: ReactDOMServer.renderToString(main)
};
