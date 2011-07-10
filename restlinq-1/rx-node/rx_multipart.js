require("./rx");
var multipart = require("multipart");

for(var k in multipart)
{
    exports[k] = multipart[k];
}

exports.cat = function(message)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, stream)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext(stream);
            subject.OnCompleted();
        }
    };
    multipart.cat(message, handler);
    return subject;
};

