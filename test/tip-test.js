var tape = require("@redsift/tape-reel")("<div id='test'></div>"),
    d3 = require("d3-selection"),
    tip = require("../");

// This test should be on all brick compatable charts
tape("html() empty state", function(t) {
    var host = tip.body();
    var el = d3.select('#test');
    el.call(host);
    
    t.equal(el.selectAll('svg').size(), 1);
    
    // should have an X and Y major and minor axis
    t.equal(el.selectAll('g.axis').size(), 4);
        
    t.end();
});