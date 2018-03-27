import { options, REACT_FRAGMENT_TYPE } from "./util.js";
import { Children } from "./Children.js";
import * as eventSystem from "./event.js";
import { PropTypes } from "./PropTypes.js";
import { Component } from "./Component.js";
import { win as window } from "./browser.js";
import { createClass } from "./createClass.js";
import { cloneElement } from "./cloneElement.js";
import { PureComponent } from "./PureComponent.js";
import { createElement } from "./createElement.js";
import { createPortal } from "./createPortal.js";
import { render, findDOMNode, isValidElement, unmountComponentAtNode, unstable_renderSubtreeIntoContainer } from "./diff.js";

var React;
if (window.React && window.React.options) {
    React = window.React; //解决引入多个
} else {
    React = window.React = window.ReactDOM = {
        version: "VERSION",
        render,
        hydrate: render,
        options,
        Fragment: REACT_FRAGMENT_TYPE,
        PropTypes,
        Children,
        createPortal,
        Component,
        eventSystem,
        findDOMNode,
        createClass,
        createElement,
        cloneElement,
        PureComponent,
        isValidElement,
        unmountComponentAtNode,
        unstable_renderSubtreeIntoContainer,
        createFactory(type) {
            console.warn("createFactory is deprecated"); // eslint-disable-line
            var factory = createElement.bind(null, type);
            factory.type = type;
            return factory;
        }
    };
}
export default React;
