# d3-rs-tip

`d3-rs-tip` is a component for adding tooltips in charts made with D3, an extension of Justin Palmer's [d3-tip](https://github.com/Caged/d3-tip). This component is dependent on D3 v4 (Alpha).

## Builds

[![Circle CI](https://circleci.com/gh/Redsift/d3-rs-tip.svg?style=svg)](https://circleci.com/gh/Redsift/d3-rs-tip)

UMD from //static.redsift.io/reusable/d3-rs-tip/latest/d3-rs-tip.umd-es2015.min.js

## Usage

### ES6
```
  import { tip } from "@redsift/d3-rs-tip";
  
  var rtip = tip()
      .attr('class', 'd3-tip')
      .html(d => d.text)
  elmS.call(rtip);

  node.on('mouseover', rtip.show)
    .on('mouseout', rtip.hide)
  ...
```
If using rollup.js for a browser target, ensure `d3-rs-tip` is part of the global map.
  
### Require
```
  var d3Tip = require("@redsift/d3-rs-tip");
  var eml = d3Tip.tip();
  ...
  
```
### Parameters

|Name|Description| Expected Value|
|----|-----------| --------------|
|attr|Sets or gets attribute value| same as d3 e.g. attr('key',`value|function`)
|style| Sets or gets a style value| same as d3 e.g. style('key',`value|function`)
|direction| Sets or gets direction of the tooltip| one of `n`,`s`,`e`,`w`,`nw`,`sw`,`ne`,`se`
|style| Sets or gets the CSS wrapped with the component| string of CSS properties
|parent| Sets or gets the parent element the tip will be appended to| DOM Node (default: `body`)
