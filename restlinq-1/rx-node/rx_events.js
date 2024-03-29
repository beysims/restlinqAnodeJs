require("./rx");
var events = require("events");
for(var k in events)
{
    exports[k] = events[k];
}

exports.EventEmitter.prototype.toObservable = function(eventName)
{
	var parent = this;
	return Rx.Observable.Create(function(observer)
	{
		var handler = function(o)
		{
			observer.OnNext(o);
		};
		parent.addListener(eventName, handler);
		return function()
		{
			parent.removeListener(eventName, handler);
		};
	});
};
