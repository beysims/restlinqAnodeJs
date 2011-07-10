require("./rx");
var dns = require("dns");
for(var k in dns)
{
    exports[k] = dns[k];
}

exports.resolve = function(domain, rrtype)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, addresses, ttl, cname)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext( { addresses : addresses, ttl: ttl, cname: cname } );
            subject.OnCompleted();
        }
    };
    dns.resolve(domain, rrtype, callback);
    return subject;
};

exports.resolve4 = function(domain)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, addresses, ttl, cname)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext( { addresses : addresses, ttl: ttl, cname: cname } );
            subject.OnCompleted();
        }
    };
    dns.resolve4(domain, callback);
    return subject;
};

exports.resolve6 = function(domain)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, addresses, ttl, cname)
    {
        if (err)
        {
             subject.OnError(err);
        }
        else
        {
                subject.OnNext( { addresses : addresses, ttl: ttl, cname: cname } );
                subject.OnCompleted();
        }
    };
    dns.resolve6(domain, callback);
    return subject;
};

exports.resolveMx = function(domain)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, addresses, ttl, cname)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext( { addresses : addresses, ttl: ttl, cname: cname } );
            subject.OnCompleted();
        }
    };
    dns.resolveMx(domain, callback);
    return subject;
};

exports.resolveTxt = function(domain)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, addresses, ttl, cname)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext( { addresses : addresses, ttl: ttl, cname: cname } );
            subject.OnCompleted();
        }
    };
    dns.resolveTxt(domain, callback);
    return subject;
};

exports.resolveSrv = function(domain)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, addresses, ttl, cname)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext( { addresses : addresses, ttl: ttl, cname: cname } );
            subject.OnCompleted();
        }
    };
    dns.resolveSrv(domain, callback);
    return subject;
};

exports.reverse = function(ip)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, domains, ttl, cname)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext( { domains : domains, ttl: ttl, cname: cname } );
            subject.OnCompleted();
        }
    };
    dns.reverse(ip, callback);
    return subject;
};

