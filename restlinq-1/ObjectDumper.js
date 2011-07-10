//   ____  __     _         __  ___
//  / __ \/ /    (_)__ ____/ /_/ _ \__ ____ _  ___ ___ ____
// / /_/ / _ \  / / -_) __/ __/ // / // /  ' \/ _ \ -_) __/
// \____/_.__/_/ /\__/\__/\__/____/\_,_/_/_/_/ .__\__/_/
//          |___/                           /_/
//
// Use this to dump out node.js objects IN LIEU of documentation :)
//
// from http://refactormycode.com/codes/226-recursively-dump-an-object

DUMP = (function () {
    var max, depth = 0, INDENT = 
		"                                ";
    	//"\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t";

    function valueToStr(value, depth, ownOnly) {
        switch (typeof value) {
            case "object":
                return objectToStr(value, depth + 1, ownOnly);
            case "function":
                return "function";
            case "string":
                return "'" + value + "'";
            default:
                return value;
        }
    };

    function objectToStr(object, depth, ownOnly) {
        if (depth > max)
            return "{*** depth exceeded ***}";
        var type = Object.prototype.toString.call(object),
            output = "\n",
            indent = INDENT.substr(0, depth);
        for (var key in object){
            if ((ownOnly && object.hasOwnProperty(key)) || (!ownOnly)){
                output += indent + valueToStr(key) + ": " +
                    valueToStr(object[key], depth, ownOnly) + ",\n";
            }
        }
        indent = INDENT.substr(0, depth - 1);
        switch (type) {
            case "[object Object]":
                return "{ " + output.substr(0, output.length - 2) + "\n" + indent + "}";
            case "[object Array]":
                return "[ " + output.substr(0, output.length - 2) + "\n" + indent + "]";
            default:
                return;
        }
    };

    return function (value, MAXdepth, ownOnly, aggregate) {
        if (ownOnly === undefined)
            ownOnly = true;
        if (MAXdepth === '*')
            MAXdepth = 16;
        max = MAXdepth || 4;
        value = valueToStr(value, depth, ownOnly);
        return aggregate ? (aggregate + value) : value;
    };
})();