(function() {
    
    if (!window.Seadragon) {
        var msg = "VETileSource requires the Seadragon Ajax library.";
        alert(msg);
        throw new Error(msg);
    } else if (Seadragon.VETileSource) {
        // our work is already done
        return;
    }
        
    // Constants
    
    var Modes = {
        AERIAL: 'a',
        HYBRID: 'h',
        ROAD: 'r'
    };
    
    var TILE_SIZE = 256;
    var MIN_LEVEL = 9;                       // 8 is highest empty level
    var MAX_LEVEL = MIN_LEVEL + 19 - 1;       // 19 actual tiled levels
    var DIMENSION = 1 << MAX_LEVEL;
    
    // be sure to update this value every once in a while
    //var GEN_KEY = "330";        // most recent key as of 9/24/09
    var GEN_KEY = "671";  //updated pesibley
    var GEN_URL = "http://t0.tiles.virtualearth.net/tiles/gen";
    
    // VETileSource class
    
    var VETileSource = function(mode) {
        
        // Inheritance
        
        Seadragon.TileSource.apply(this, [DIMENSION, DIMENSION, TILE_SIZE, 0, MIN_LEVEL]);
        
        // Fields
        
        var self = this;
        
        // Properties
        
        this.mode = mode ? mode : Modes.AERIAL;
        
        // Helpers
        
        function getQuadKey(level, x, y) {
            var key = [];
http://ecn.t3.tiles.virtualearth.net/tiles/r133?g=671&mkt=en-us&lbl=l1&stl=h&shading=hill&n=z
            
            for (var i = level; i >= MIN_LEVEL; i--) {
                var digit = 0;
                var mask = 1 << (i - MIN_LEVEL);
                
                if ((x & mask) != 0)
                    digit += 1;
                if ((y & mask) != 0)
                    digit += 2;
                
                key.push(digit);
            }
            
            return key;
        }
        
        // Methods -- OVERRIDDEN
        
        this.getTileUrl = function(level, x, y) {
            // use array join instead of string concatenation for better perf
            var parts = [],
                quadKey = getQuadKey(level, x, y);
            
            parts.push("http://ecn.t");
            parts.push(quadKey[quadKey.length - 1]);        // VE load balance
            parts.push(".tiles.virtualearth.net/tiles/");
            parts.push(self.mode);
            parts.push(quadKey.join(''));
            parts.push("?g=");
            parts.push(GEN_KEY);
                
            if(self.mode === 'r')
            { //remove this stuff if you want old style tiles.
                parts.push('&mkt=en-us&lbl=l1&stl=h&shading=hill&n=z');
            }
            
            
            return parts.join('');
        };
        
    }
    
    VETileSource.prototype = new Seadragon.TileSource();
    
    VETileSource.Modes = Modes;
    
    // And finally...
    
    Seadragon.VETileSource = VETileSource;

})();
