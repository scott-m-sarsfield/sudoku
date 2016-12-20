/* jshint esversion:6 */

import React from 'react';

export default class BezierMenu extends React.Component{
    constructor(props){
        super(props);
        this.bounceOut = this.bounceOut.bind(this);
        this.dropIn = this.dropIn.bind(this);
    }

    componentDidMount(){
        if(this.props.show) this.dropIn();
        else{
            this.refs.screen.className = "inactive";
        }
    }

    dropIn(){
        var elm  = this.refs.menu;
        //console.log(elm);


        elm.style.transitionDelay = '0.5s';
        elm.style.transitionDuration = '0.5s';
        elm.style.transitionTimingFunction = 'cubic-bezier(1,.83,.53,1.08)';

        var scr = this.refs.screen;
        scr.className = "";

        setTimeout(()=>{
            scr.className = "visible";
            elm.className = "enteredScene";

        },0);
    }

    bounceOut(){
        var elm  = this.refs.menu;
        //console.log(elm);
        elm.style.transitionDelay = "0s";
        elm.style.transitionTimingFunction = "cubic-bezier(.5, .36, 0.28, -.66)";
        elm.style.transitionDuration = "0.8s";
        elm.className = "";
        var scr = this.refs.screen;
        scr.className = "";
        setTimeout(()=>{
            scr.className = "inactive";
        },1000);
    }

    componentWillReceiveProps(np){
        if(this.props.show && !np.show) this.bounceOut();
        if(!this.props.show && np.show) this.dropIn();
    }

    shouldComponentUpdate(np,ns){
        return np.show;
    }

    render(){

        let children = this.props.children || null;

        return(
            <div>
            <div ref="screen" id="screen" onTouchTap={this.props.onClose}/>
            <div ref="menu" id="menu">
            {children}
            </div>
            </div>
        );
    }
}
