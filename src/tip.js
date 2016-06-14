// d3.tip
// Copyright (c) 2013 Justin Palmer
//
// Tooltips for d3.js SVG visualizations

import { select, selection } from 'd3-selection';
import { html as svg } from '@redsift/d3-rs-svg';

export default function tip() {
  var d3_tip_functor = (v) => (typeof v === "function" ? v : _ => v);
  var d3_tip_direction = () => 'n';
  var d3_tip_offset = () => [0, 0];
  var d3_tip_html = () => ' ';
  var defaultTipStyle = '.d3-tip {line-height: 1;font-weight: bold;padding: 12px;background: rgba(0, 0, 0, 0.8);color: #fff;border-radius: 2px;}' +
    '/* Creates a small triangle extender for the tooltip */.d3-tip:after {box-sizing: border-box;display: inline;font-size: 10px;width: 100%;line-height: 1;color: rgba(0, 0, 0, 0.8);content: &#9660;;position: absolute;text-align: center;}' +
    '/* Style northward tooltips differently */.d3-tip.n:after {margin: -1px 0 0 0;top: 100%;left: 0;}';

  var direction = d3_tip_direction,
      offset    = d3_tip_offset,
      html      = d3_tip_html,
      node      = initNode(),
      svg       = null,
      point     = null,
      target    = null,
      style     = defaultTipStyle;

  function initNode() {
    var node = select(document.createElement('div'))
    node
      .style('position','absolute')
      .style('top', 0)
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
      document.body.appendChild(node);
    };
    return select(node);
  }

  function _impl(vis) {
    svg = getSVGNode(vis)
    if(!svg) return;
    point = svg.createSVGPoint()
    svg = select(svg)
    svg.append('defs')
    var defsEl = svg.select('defs');
    var styleEl = defsEl.selectAll('style').data(style ? [ style ] : []);
    styleEl.exit().remove();
    styleEl = styleEl.enter().append('style').attr('type', 'text/css').merge(styleEl);
    styleEl.text(style);
    document.body.appendChild(node)
  }

  // Public - show the tooltip on the screen
  //
  // Returns a tip
  _impl.show = function() {
    var args = [].slice.call(arguments)
    if(args[args.length - 1] instanceof SVGElement) {
      target = args.pop()
    }

    var content = html.apply(this, args),
        poffset = offset.apply(this, args),
        dir     = direction.apply(this, args),
        nodel   = getNodeEl(),
        i       = directions.length,
        coords,
        scrollTop  = document.documentElement.scrollTop || document.body.scrollTop,
        scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft

    nodel.html(content)
      .style('opacity', 1)
      .style('pointer-events', 'all')

    while(i--) nodel.classed(directions[i], false)
    coords = direction_callbacks[dir].apply(this)
    nodel.classed(dir, true)
      .style('top', (coords.top +  poffset[0]) + scrollTop + 'px')
      .style('left', (coords.left + poffset[1]) + scrollLeft + 'px')

    return _impl;
  }

  // Public - hide the tooltip
  //
  // Returns a tip
  _impl.hide = function() {
    var nodel = getNodeEl()
    nodel.style('opacity', 0)
      .style('pointer-events', 'none')
    return _impl;
  }

  // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
  //
  // n - name of the attribute
  // v - value of the attribute
  //
  // Returns tip or attribute value
  _impl.attr = function(n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return getNodeEl().attr(n)
    } else {
      var args =  [].slice.call(arguments)
      selection.prototype.attr.apply(getNodeEl(), args)
    }

    return _impl;
  }

  // Public: Proxy style calls to the d3 tip container.  Sets or gets a style value.
  //
  // n - name of the property
  // v - value of the property
  //
  // Returns tip or style property value
  _impl.style = function(n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return getNodeEl().style(n)
    } else {
      var args =  [].slice.call(arguments)
      selection.prototype.style.apply(getNodeEl(), args)
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

  _impl.style = function(value) {
    return arguments.length ? (style = defaultTipStyle + value, _impl) : style;
  }; 


  function direction_n() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.n.y - node.offsetHeight,
      left: bbox.n.x - node.offsetWidth / 2
    }
  }

  function direction_s() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.s.y,
      left: bbox.s.x - node.offsetWidth / 2
    }
  }

  function direction_e() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.e.y - node.offsetHeight / 2,
      left: bbox.e.x
    }
  }

  function direction_w() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.w.y - node.offsetHeight / 2,
      left: bbox.w.x - node.offsetWidth
    }
  }

  function direction_nw() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.nw.y - node.offsetHeight,
      left: bbox.nw.x - node.offsetWidth
    }
  }

  function direction_ne() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.ne.y - node.offsetHeight,
      left: bbox.ne.x
    }
  }

  function direction_sw() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.sw.y,
      left: bbox.sw.x - node.offsetWidth
    }
  }

  function direction_se() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.se.y,
      left: bbox.e.x
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
    var targetel   = target || d3.event.target;

    while ('undefined' === typeof targetel.getScreenCTM && 'undefined' === targetel.parentNode) {
        targetel = targetel.parentNode;
    }

    var bbox       = {},
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

  var direction_callbacks = {
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
};
