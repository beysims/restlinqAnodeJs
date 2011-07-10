require("./rx");
var tcp = require("tcp");
for(var k in tcp)
{
	exports[k] = tcp[k];
}
exports.createServer = function()
{
	var subject = new Rx.Subject();
	var handler = function(connection)
	{
		subject.OnNext(connection);
	};
	var observable = subject.AsObservable();
	observable.server = tcp.createServer(handler);
	return observable;
};
