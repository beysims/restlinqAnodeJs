require("./rx");
var fs = require("fs");
for(var k in fs)
{
    exports[k] = fs[k];
}

exports.rename = function(path1, path2)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext();
                    subject.OnCompleted();
        }
    };
    fs.rename(path1, path2, handler);
    return subject;
};

exports.truncate = function(fd, len)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err)
    {
        if (err)
        {
             subject.OnError(err);
        }
        else
        {
            subject.OnNext();
            subject.OnCompleted();
        }
    };
    fs.truncate(fn, len, handler);
    return subject;
};

exports.chmod  = function(path, mode)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext();
            subject.OnCompleted();
        }
    };
    fs.chmod(path, mode, handler);
    return subject;
};

exports.stat  = function(path)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, stats)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext(stats);
            subject.OnCompleted();
        }
    };
    fs.stat(path, handler);
    return subject;
};

exports.lstat  = function(path)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, stats)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext(stats);
            subject.OnCompleted();
        }
    };
    fs.lstat(path, handler);
    return subject;
};


exports.link = function(srcpath, dstpath)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext();
            subject.OnCompleted();
        }
    };
    fs.link(srcpath, dstpath, handler);
    return subject;
};


exports.symlink = function(linkdata, path)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext();
            subject.OnCompleted();
        }
    };
    fs.symlink(linkdata, path, handler);
    return subject;
};

exports.readlink  = function(path)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, resolvedPath)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext(resolvedPath);
            subject.OnCompleted();
        }
    };
    fs.readlink(path, handler);
    return subject;
};

exports.realpath  = function(path)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, resolvedPath)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext(resolvedPath);
            subject.OnCompleted();
        }
    };
    fs.realpath(path, handler);
    return subject;
};

exports.unlink  = function(path)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext();
            subject.OnCompleted();
        }
    };
    fs.unlink(path, handler);
    return subject;
};

exports.rmdir  = function(path)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext();
            subject.OnCompleted();
        }
    };
    fs.rmdir(path, handler);
    return subject;
};


exports.mkdir  = function(path, mode)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext();
            subject.OnCompleted();
        }
    };
    fs.mkdir(path, mode, handler);
    return subject;
};

exports.readdir = function(path)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, files)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext(files);
            subject.OnCompleted();
        }
    };
    fs.readdir(path, handler);
    return subject;
};

exports.close  = function(fd)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err)
    {
        if (err)
        {
           subject.OnError(err);
        }
        else
        {
            subject.OnNext();
            subject.OnCompleted();
        }
    };
    fs.close(fd, handler);
    return subject;
};

exports.open = function(path, flags, mode)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, fd)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext(fd);
            subject.OnCompleted();
        }
    };
    fs.open(path, flags, mode,  handler);
    return subject;
};

exports.write = function(fd, data, position, encoding)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, written)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext(written);
            subject.OnCompleted();
        }
    };
    fs.write(fd, data, position, encoding, handler);
    return subject;
};

exports.read = function(fd, length, position, encoding)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, data, bytesRead)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext( { data : data, bytesRead : bytesRead });
            subject.OnCompleted();
        }
    };
    fs.read(fd, length, position, encoding,  handler);
    return subject;
};

exports.readFile = function(fileName, encoding)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, data)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext(data);
            subject.OnCompleted();
        }
    };
    fs.readFile(fileName, encoding,  handler);
    return subject;
};

exports.writeFile  = function(fileName, data, encoding)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext();
            subject.OnCompleted();
        }
    };
    fs.writeFile(fileName, data, encoding, handler);
    return subject;
};


exports.watchFile = function(filename, options)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(curr, prev)
    {
        subject.OnNext( { curr: curr, prev: prev });
        subject.OnCompleted();
    };
    fs.watchFile(filename, options, handler);
    return subject;
};

exports.FileReadStream.prototype._forceClose = 
exports.FileReadStream.prototype.forceClose;

exports.FileReadStream.prototype.forceClose = function()
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext();
            subject.OnCompleted();
        }
    };
    this._forceClose(handler);
    return subject;
};

exports.FileReadStream.prototype._write =
exports.FileReadStream.prototype.write;

exports.FileReadStream.prototype.write = function(data)
{
    var subject = new Rx.AsyncSubject();
    var handler = function(err, bytesWritten)
    {
        if (err)
        {
            subject.OnError(err);
        }
        else
        {
            subject.OnNext(bytesWritten);
            subject.OnCompleted();
        }
    };
    this._write(data, handler);
    return subject;
};

exports.FileReadStream.prototype._close =
exports.FileReadStream.prototype.close;

exports.FileReadStream.prototype.close = function(data)
{
    var subject = new Rx.AsyncSubject();
    var handler = function()
    {
        subject.OnNext();            
        subject.OnCompleted();
    };
    this._close(data, handler);
    return subject;
};


