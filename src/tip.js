/**
 * Extension of work by Justin Palmer (https://github.com/Caged/d3-tip)
 *
 * Copyright (c) 2016 Redsift Limited. All rights reserved.
*/
// d3.tip
// Copyright (c) 2013 Justin Palmer
//
// Tooltips for d3.js SVG visualizations

import { select, selection, event } from 'd3-selection';
import { transition as dummy } from 'd3-transition';
import { 
  display,
  fonts
} from '@redsift/d3-rs-theme';

export default function tip(id) {
  let d3_tip_functor = v => (typeof v === "function" ? v : () => v);
  let d3_tip_direction = () => 'n';
  let d3_tip_offset = () => [0, 0];
  let d3_tip_html = () => ' ';
  let IsDOMElement = o => o instanceof Node;


  dummy(); // dummy injection for transition
  
  let direction = d3_tip_direction,
      offset    = d3_tip_offset,
      html      = d3_tip_html,
      classed   = 'd3-tip',
      node      = initNode(),
      point     = null,
      target    = null,
      parent    = null,
      theme     = 'light',
      transition= false,
      style     = undefined;

  function initNode() {
    let node = select(document.createElement('div'))
    node
      .attr('id', id)
      .attr('class', classed)
      .style('position','absolute')
      .style('top', 0)
      .style('left', 0)
      .style('opacity', 0)
      .style('pointer-events', 'none')
      .style('box-sizing', 'border-box');
    return node.node()
  }

  function getSVGNode(el) {
    el = el.node()
    if(!el) return;
    return el.tagName.toLowerCase() === 'svg' ? el : el.ownerSVGElement;
  }

  function getNodeEl() {
    if(node === null) {
      node = initNode();
      // re-add node to DOM
      parent.appendChild(node);
    }
    return select(node);
  }

  function _impl(vis) {
    let svg = getSVGNode(vis)
    if (!svg) return;
    
    if (svg.createSVGPoint != null) {
      point = svg.createSVGPoint();
    }
    svg = select(svg);

    let defsEl = svg.select('defs');
    if (defsEl.empty()) {
      defsEl = svg.append('defs');
    }
    
    let _style = style;
    if (_style === undefined) {
      _style = _impl.defaultStyle(theme);
    }

    let styleEl = defsEl.selectAll('style' + (id ?  '#style-tip-' + id : '.style-' + classed)).data(_style ? [ _style ] : []);
    styleEl.exit().remove();
    styleEl = styleEl.enter()
                  .append('style')
                    .attr('type', 'text/css')
                    .attr('id', (id ?  'style-tip-' + id : null))
                    .attr('class', (id ?  null : 'style-' + classed))
                  .merge(styleEl);
    styleEl.text(s => s);
  }

  _impl.self = function() { return 'div' + (id ?  '#' + id : '.' + classed); }

  _impl.id = function() { return id; };
    
  _impl.classed = function(_) {
    return arguments.length ? (classed = _, _impl) : classed;
  };

  // Public - show the tooltip on the screen
  //
  // Returns a tip
  _impl.show = function() {
    if(!parent) _impl.parent(document.body);
    let args = [].slice.call(arguments);
    target = this;
    if(args.length === 1 && IsDOMElement(args[0])){
      target = args[0];
      args[0] = target.__data__;
    }

    let content = html.apply(target, args),
        poffset = offset.apply(target, args),
        dir     = direction.apply(target, args),
        nodel   = getNodeEl(),
        i       = directions.length,
        parentCoords = node.offsetParent.getBoundingClientRect();

    while(i--) nodel.classed(directions[i], false);
    
    let coords = direction_callbacks[dir].apply(target);

    nodel.classed(dir, true)
      .style('top', (coords.top +  poffset[0]) - parentCoords.top + 'px')
      .style('left', (coords.left + poffset[1]) - parentCoords.left + 'px')
      .html(content);
    
    if (transition != null && transition !== false) {
      nodel = nodel.transition();
      if (typeof transition === 'number') {
        nodel = nodel.duration(transition);
      }
    }
      
    
    nodel.style('opacity', 1.0);

    return _impl;
  }

  // Public - hide the tooltip
  //
  // Returns a tip
  _impl.hide = function() {
    getNodeEl().style('opacity', 0.0);
    return _impl;
  }

  // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
  //
  // n - name of the attribute
  // v - value of the attribute
  //
  // Returns tip or attribute value
  _impl.attr = function(n) {
    if (arguments.length < 2 && typeof n === 'string') {
      return getNodeEl().attr(n)
    } else {
      let args =  [].slice.call(arguments)
      selection.prototype.attr.apply(getNodeEl(), args)
    }

    return _impl;
  }

  // Public: Set or get the direction of the tooltip
  //
  // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
  //     sw(southwest), ne(northeast) or se(southeast)
  //
  // Returns tip or direction
  _impl.direction = function(v) {
    if (!arguments.length) return direction
    direction = v == null ? v : d3_tip_functor(v)

    return _impl;
  }

  // Public: Sets or gets the offset of the tip
  //
  // v - Array of [x, y] offset
  //
  // Returns offset or
  _impl.offset = function(v) {
    if (!arguments.length) return offset
    offset = v == null ? v : d3_tip_functor(v)

    return _impl;
  }

  // Public: sets or gets the html value of the tooltip
  //
  // v - String value of the tip
  //
  // Returns html value or tip
  _impl.html = function(v) {
    if (!arguments.length) return html
    html = v == null ? v : d3_tip_functor(v)

    return _impl;
  }

  // Public: destroys the tooltip and removes it from the DOM
  //
  // Returns a tip
  _impl.destroy = function() {
    if(node) {
      getNodeEl().remove();
      node = null;
    }
    return _impl;
  }

  _impl.style = function(_) {
    return arguments.length ? (style = _, _impl) : style;
  }
  
  _impl.transition = function(_) {
    return arguments.length ? (transition = _, _impl) : transition;
  }

  _impl.theme = function(_) {
    return arguments.length ? (theme = _, _impl) : theme;
  }  
  

  _impl.parent = function(v) {
    if (!arguments.length) return parent;
    parent = v || document.body;
    parent.appendChild(node);

    // Make sure offsetParent has a position so the tip can be
    // based from it. Mainly a concern with <body>.
    let offsetParent = select(node.offsetParent)
    if (offsetParent.style('position') === 'static') {
     offsetParent.style('position', 'relative')
    }

    return _impl;
  }

  _impl.defaultStyle = _theme => `
                  ${fonts.variable.cssImport}  
                  ${_impl.self()} {
                                    line-height: 1;
                                    font-family: ${fonts.variable.family};
                                    color: ${display[_theme].negative.text};
                                    font-weight: ${fonts.fixed.weightMonochrome};  
                                    padding: 8px;
                                    background: ${display[_theme].negative.background};
                                    border-radius: 2px;
                                    pointer-events: none;
                                  }
                    /* Creates a small triangle extender for the tooltip */
                    ${_impl.self()}:after {
                                      box-sizing: border-box;
                                      display: inline;
                                      width: 100%;
                                      line-height: 1;
                                      color: ${display[_theme].negative.background};
                                      position: absolute;
                                      pointer-events: none;
                                    }
                    /* Northward tooltips */
                    ${_impl.self()}.n:after {
                                      content: "\\25bc";
                                      margin: -2px 0 0 0;
                                      top: 100%;
                                      left: 0;
                                      text-align: center;
                                    }
                    /* Eastward tooltips */
                    ${_impl.self()}.e:after {
                                      content: "\\25C0";
                                      margin: -4px 0 0 0;
                                      top: 50%;
                                      left: -8px;
                                    }
                    /* Southward tooltips */
                    ${_impl.self()}.s:after {
                                      content: "\\25B2";
                                      margin: 0 0 1px 0;
                                      top: -7px;
                                      left: 0;
                                      text-align: center;
                                    }
                    /* Westward tooltips */
                    ${_impl.self()}.w:after {
                                      content: "\\25B6";
                                      margin: -4px 0 0 -1px;
                                      top: 50%;
                                      left: 100%;
                                    }                
                `;

  function direction_n() {
    let bbox = getScreenBBox()
    return {
      top:  Math.round(bbox.n.y - node.offsetHeight),
      left: Math.round(bbox.n.x - node.offsetWidth / 2)
    }
  }

  function direction_s() {
    let bbox = getScreenBBox()
    return {
      top:  Math.round(bbox.s.y),
      left: Math.round(bbox.s.x - node.offsetWidth / 2)
    }
  }

  function direction_e() {
    let bbox = getScreenBBox()
    return {
      top:  Math.round(bbox.e.y - node.offsetHeight / 2),
      left: Math.round(bbox.e.x)
    }
  }

  function direction_w() {
    let bbox = getScreenBBox()
    return {
      top:  Math.round(bbox.w.y - node.offsetHeight / 2),
      left: Math.round(bbox.w.x - node.offsetWidth)
    }
  }

  function direction_nw() {
    let bbox = getScreenBBox()
    return {
      top:  Math.round(bbox.nw.y - node.offsetHeight),
      left: Math.round(bbox.nw.x - node.offsetWidth)
    }
  }

  function direction_ne() {
    let bbox = getScreenBBox()
    return {
      top:  Math.round(bbox.ne.y - node.offsetHeight),
      left: Math.round(bbox.ne.x)
    }
  }

  function direction_sw() {
    let bbox = getScreenBBox()
    return {
      top:  Math.round(bbox.sw.y),
      left: Math.round(bbox.sw.x - node.offsetWidth)
    }
  }

  function direction_se() {
    let bbox = getScreenBBox()
    return {
      top:  Math.round(bbox.se.y),
      left: Math.round(bbox.se.x)
    }
  }

  // Private - gets the screen coordinates of a shape
  //
  // Given a shape on the screen, will return an SVGPoint for the directions
  // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
  // sw(southwest).
  //
  //    +-+-+
  //    |   |
  //    +   +
  //    |   |
  //    +-+-+
  //
  // Returns an Object {n, s, e, w, nw, sw, ne, se}
  function getScreenBBox() {
    let targetel   = target || event.target;

    while ('undefined' === typeof targetel.getScreenCTM && 'undefined' === targetel.parentNode) {
        targetel = targetel.parentNode;
    }

    let bbox       = {},
        matrix     = targetel.getScreenCTM(),
        tbbox      = targetel.getBBox(),
        width      = tbbox.width,
        height     = tbbox.height,
        x          = tbbox.x,
        y          = tbbox.y

    point.x = x
    point.y = y
    bbox.nw = point.matrixTransform(matrix)
    point.x += width
    bbox.ne = point.matrixTransform(matrix)
    point.y += height
    bbox.se = point.matrixTransform(matrix)
    point.x -= width
    bbox.sw = point.matrixTransform(matrix)
    point.y -= height / 2
    bbox.w  = point.matrixTransform(matrix)
    point.x += width
    bbox.e = point.matrixTransform(matrix)
    point.x -= width / 2
    point.y -= height / 2
    bbox.n = point.matrixTransform(matrix)
    point.y += height
    bbox.s = point.matrixTransform(matrix)

    return bbox;
  }

  let direction_callbacks = {
    n:  direction_n,
    s:  direction_s,
    e:  direction_e,
    w:  direction_w,
    nw: direction_nw,
    ne: direction_ne,
    sw: direction_sw,
    se: direction_se
  },
  directions = Object.keys(direction_callbacks);

  return _impl;
}
