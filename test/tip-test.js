var tape = require("@redsift/tape-reel")("<div id='test'></div>"),
    d3 = require("d3-selection"),
    tip = require("../");

// This test should be on all brick compatable charts
tape("html() empty state", function(t) {
    var host = tip.body();
    var el = d3.select('#test').append('svg');
    el.call(host);
    
    // should have an X and Y major and minor axis
    t.equal(el.selectAll('style').size(), 1);
        
    t.end();
});

tape("html() reentrant", function(t) {
    var host = tip.body();
    var el = d3.select('#test').append('svg');
    
    el.call(host);
    
    var initial = el.selectAll('*').size();
    
    el.call(host);
    
    t.equal(initial, el.selectAll('*').size());
        
    t.end();
});