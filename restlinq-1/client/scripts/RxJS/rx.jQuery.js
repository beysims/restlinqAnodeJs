// Copyright (c) Microsoft Corporation.  All rights reserved.
// This code is licensed by Microsoft Corporation under the terms
// of the MICROSOFT REACTIVE EXTENSIONS FOR JAVASCRIPT AND .NET LIBRARIES License.
// See http://go.microsoft.com/fwlink/?LinkId=186234.

(function () {
    var a = jQuery;
    var b = a.fn;
    var c = this;
    var d;
    if (typeof ProvideCustomRxRootObject == "undefined") d = c.Rx;
    else d = ProvideCustomRxRootObject();
    var e = d.Observable;
    var f = d.AsyncSubject;
    var g = e.Create;
    var h = d.Disposable.Empty;
    b.toObservable = function (j, k) {
        var l = this;
        return g(function (m) {
            var n = function (o) {
                m.OnNext(o);
            };
            l.bind(j, k, n);
            return function () {
                l.unbind(j, n);
            };
        });
    };
    b.toLiveObservable = function (j, k) {
        var l = this;
        return g(function (m) {
            var n = function (o) {
                m.OnNext(o);
            };
            l.live(j, k, n);
            return function () {
                l.die(j, n);
            };
        });
    };
    b.hideAsObservable = function (j) {
        var k = new f();
        this.hide(j, function () {
            k.OnNext(this);
            k.OnCompleted();
        });
        return k;
    };
    b.showAsObservable = function (j) {
        var k = new f();
        this.show(j, function () {
            k.OnNext(this);
            k.OnCompleted();
        });
        return k;
    };
    b.animateAsObservable = function (j, k, l) {
        var m = new f();
        this.animate(j, k, l, function () {
            m.OnNext(this);
            m.OnCompleted();
        });
        return m;
    };
    b.fadeInAsObservable = function (j) {
        var k = new f();
        this.fadeIn(j, function () {
            k.OnNext(this);
            k.OnCompleted();
        });
        return k;
    };
    b.fadeToAsObservable = function (j, k) {
        var l = new f();
        this.fadeTo(j, k, function () {
            l.OnNext(this);
            l.OnCompleted();
        });
        return l;
    };
    b.fadeOutAsObservable = function (j) {
        var k = new f();
        this.fadeOut(j, function () {
            k.OnNext(this);
            k.OnCompleted();
        });
        return k;
    };
    b.slideDownAsObservable = function (j) {
        var k = new f();
        this.slideDown(j, function () {
            k.OnNext(this);
            k.OnCompleted();
        });
        return k;
    };
    b.slideUpAsObservable = function (j) {
        var k = new f();
        this.slideUp(j, function () {
            k.OnNext(this);
            k.OnCompleted();
        });
        return k;
    };
    b.slideToggleAsObservable = function (j) {
        var k = new f();
        this.slideToggle(j, function () {
            k.OnNext(this);
            k.OnCompleted();
        });
        return k;
    };
    var i = a.ajaxAsObservable = function (j) {
        var k = {};
        for (var l in j) k[l] = j[l];
        var m = new f();
        k.success = function (n, o, p) {
            m.OnNext({
                data: n,
                textStatus: o,
                xmlHttpRequest: p
            });
            m.OnCompleted();
        };
        k.error = function (n, o, p) {
            m.OnError({
                xmlHttpRequest: n,
                textStatus: o,
                errorThrown: p
            });
        };
        a.ajax(k);
        return m;
    };
    a.getJSONAsObservable = function (j, k) {
        return i({
            url: j,
            dataType: "json",
            data: k
        });
    };
    a.getScriptAsObservable = function (j, k) {
        return i({
            url: j,
            dataType: "script",
            data: k
        });
    };
    a.postAsObservable = function (j, k) {
        return i({
            url: j,
            type: "POST",
            data: k
        });
    };
    b.loadAsObservable = function (j, k) {
        var l = new f();
        var m = function (n, o, p) {
            if (o === "error") l.OnError({
                response: n,
                status: o,
                xmlHttpRequest: p
            });
            else {
                l.OnNext({
                    response: n,
                    status: o,
                    xmlHttpRequest: p
                });
                l.OnCompleted();
            }
        };
        this.load(j, k, m);
        return l;
    };
    a.getScriptAsObservable = function (j) {
        return i({
            url: j,
            dataType: "script"
        });
    };
    a.postAsObservable = function (j, k, l) {
        return i({
            url: j,
            dataType: l,
            data: k,
            type: "POST"
        });
    };
})();