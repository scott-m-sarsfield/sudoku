/* eslint-disable unicorn/filename-case */

import React from 'react';
import PropTypes from 'prop-types';

export default class BezierMenu extends React.Component {

	static get propTypes() {
		return {
			show: PropTypes.bool,
			children: PropTypes.any,
			onClose: PropTypes.func
		};
	}

	constructor(props) {
		super(props);
		this.bounceOut = this.bounceOut.bind(this);
		this.dropIn = this.dropIn.bind(this);
	}

	componentDidMount() {
		if (this.props.show) {
			this.dropIn();
		}	else {
			this.screen.className = 'inactive';
		}
	}

	dropIn() {
		const elm = this.menu;

		elm.style.transitionDelay = '0.5s';
		elm.style.transitionDuration = '0.5s';
		elm.style.transitionTimingFunction = 'cubic-bezier(1,.83,.53,1.08)';

		const scr = this.screen;
		scr.className = '';

		setTimeout(() => {
			scr.className = 'visible';
			elm.className = 'enteredScene';
		}, 0);
	}

	bounceOut() {
		const elm = this.menu;

		elm.style.transitionDelay = '0s';
		elm.style.transitionTimingFunction = 'cubic-bezier(.5, .36, 0.28, -.66)';
		elm.style.transitionDuration = '0.8s';

		elm.className = '';

		const scr = this.screen;
		scr.className = '';

		setTimeout(() => {
			scr.className = 'inactive';
		}, 1000);
	}

	componentWillReceiveProps(np) {
		if (this.props.show && !np.show) {
			this.bounceOut();
		}
		if (!this.props.show && np.show) {
			this.dropIn();
		}
	}

	shouldComponentUpdate(np) {
		return np.show;
	}

	render() {
		const children = this.props.children || null;

		const screenRef = r => {
			this.screen = r;
		};

		const menuRef = r => {
			this.menu = r;
		};

		return (
            <div>
                <div ref={screenRef} id="screen" onTouchTap={this.props.onClose} />
                <div ref={menuRef} id="menu">
                    {children}
                </div>
            </div>
		);
	}
}
