require("./rx");
var http = require("http");

for(var k in http)
{
	exports[k] = http[k];
}

exports.createServer = function(options)
{
    var subject = new Rx.Subject();
    var handler = function(request, response)
    {
            subject.OnNext( { request: request, response:  response });
    };
	var observable = subject.AsObservable();
    observable.server  = http.createServer(handler, options);
	return observable;
};






