// Copyright (c) Microsoft Corporation.  All rights reserved.
// This code is licensed by Microsoft Corporation under the terms
// of the MICROSOFT REACTIVE EXTENSIONS FOR JAVASCRIPT AND .NET LIBRARIES License.
// See http://go.microsoft.com/fwlink/?LinkId=186234.
(function () {
    var a;
    var b;
    var c = this;
    var d = "Index out of range";
    if (typeof ProvideCustomRxRootObject == "undefined") b = c.Rx = {};
    else b = ProvideCustomRxRootObject();
    var e = function () {};
    var f = function () {
            return new Date().getTime();
        };
    var g = function (r0, s0) {
            return r0 === s0;
        };
    var h = function (r0) {
            return r0;
        };
    var i = function (r0) {
            return {
                Dispose: r0
            };
        };
    var j = {
        Dispose: e
    };
    b.Disposable = {
        Create: i,
        Empty: j
    };
    var k = b.BooleanDisposable = function () {
            var r0 = false;
            this.GetIsDisposed = function () {
                return r0;
            };
            this.Dispose = function () {
                r0 = true;
            };
        };
    var l = function (r0) {
            var s0 = false;
            r0.a++;
            this.Dispose = function () {
                var t0 = false;
                if (!r0.b) {
                    if (!this.c) {
                        this.c = true;
                        r0.a--;
                        if (r0.a == 0 && r0.d) {
                            r0.b = true;
                            t0 = true;
                        }
                    }
                }
                if (t0) r0.e.Dispose();
            };
        };
    var m = b.RefCountDisposable = function (r0) {
            this.d = false;
            this.b = false;
            this.e = r0;
            this.a = 0;
            this.Dispose = function () {
                var s0 = false;
                if (!this.b) {
                    if (!this.d) {
                        this.d = true;
                        if (this.a == 0) {
                            this.b = true;
                            s0 = true;
                        }
                    }
                }
                if (s0) this.e.Dispose();
            };
            this.GetDisposable = function () {
                if (this.b) return j;
                else return new l(this);
            };
        };
    var n = b.CompositeDisposable = function () {
            var r0 = new q();
            for (var s0 = 0; s0 < arguments.length; s0++) r0.Add(arguments[s0]);
            var t0 = false;
            this.GetCount = function () {
                return r0.GetCount();
            };
            this.Add = function (u0) {
                if (!t0) r0.Add(u0);
                else u0.Dispose();
            };
            this.Remove = function (u0, v0) {
                if (!t0) {
                    var w0 = r0.Remove(u0);
                    if (!v0 & w0) u0.Dispose();
                }
            };
            this.Dispose = function () {
                if (!t0) {
                    t0 = true;
                    this.Clear();
                }
            };
            this.Clear = function () {
                for (var u0 = 0; u0 < r0.GetCount(); u0++) r0.GetItem(u0).Dispose();
                r0.Clear();
            };
        };
    var o = b.MutableDisposable = function () {
            var r0 = false;
            var s0;
            this.Get = function () {
                return s0;
            }, this.Replace = function (t0) {
                if (r0 && t0 !== a) t0.Dispose();
                else {
                    if (s0 !== a) s0.Dispose();
                    s0 = t0;
                }
            };
            this.Dispose = function () {
                if (!r0) {
                    r0 = true;
                    if (s0 !== a) s0.Dispose();
                }
            };
        };
    var p = function (r0) {
            var s0 = [];
            for (var t0 = 0; t0 < r0.length; t0++) s0.push(r0[t0]);
            return s0;
        };
    var q = b.List = function (r0) {
            var s0 = [];
            var t0 = 0;
            var u0 = r0 !== a ? r0 : g;
            this.Add = function (v0) {
                s0[t0] = v0;
                t0++;
            };
            this.RemoveAt = function (v0) {
                if (v0 < 0 || v0 >= t0) throw d;
                if (v0 == 0) {
                    s0.shift();
                    t0--;
                } else {
                    s0.splice(v0, 1);
                    t0--;
                }
            };
            this.IndexOf = function (v0) {
                for (var w0 = 0; w0 < t0; w0++) {
                    if (u0(v0, s0[w0])) return w0;
                }
                return -1;
            };
            this.Remove = function (v0) {
                var w0 = this.IndexOf(v0);
                if (w0 == -1) return false;
                this.RemoveAt(w0);
                return true;
            };
            this.Clear = function () {
                s0 = [];
                t0 = 0;
            };
            this.GetCount = function () {
                return t0;
            };
            this.GetItem = function (v0) {
                if (v0 < 0 || v0 >= t0) throw d;
                return s0[v0];
            };
            this.SetItem = function (v0, w0) {
                if (v0 < 0 || v0 >= t0) throw d;
                s0[v0] = w0;
            };
            this.ToArray = function () {
                var v0 = [];
                for (var w0 = 0; w0 < this.GetCount(); w0++) v0.push(this.GetItem(w0));
                return v0;
            };
        };
    var r = function (r0) {
            if (r0 === null) r0 = g;
            this.f = r0;
            var s0 = 4;
            this.g = new Array(s0);
            this.h = 0;
        };
    r.prototype.i = function (r0, s0) {
        return this.f(this.g[r0], this.g[s0]) < 0;
    };
    r.prototype.j = function (r0) {
        if (r0 >= this.h || r0 < 0) return;
        var s0 = r0 - 1 >> 1;
        if (s0 < 0 || s0 == r0) return;
        if (this.i(r0, s0)) {
            var t0 = this.g[r0];
            this.g[r0] = this.g[s0];
            this.g[s0] = t0;
            this.j(s0);
        }
    };
    r.prototype.k = function (r0) {
        if (r0 === a) r0 = 0;
        var s0 = 2 * r0 + 1;
        var t0 = 2 * r0 + 2;
        var u0 = r0;
        if (s0 < this.h && this.i(s0, u0)) u0 = s0;
        if (t0 < this.h && this.i(t0, u0)) u0 = t0;
        if (u0 != r0) {
            var v0 = this.g[r0];
            this.g[r0] = this.g[u0];
            this.g[u0] = v0;
            this.k(u0);
        }
    };
    r.prototype.GetCount = function () {
        return this.h;
    };
    r.prototype.Peek = function () {
        if (this.h == 0) throw "Heap is empty.";
        return this.g[0];
    };
    r.prototype.Dequeue = function () {
        var r0 = this.Peek();
        this.g[0] = this.g[--this.h];
        delete this.g[this.h];
        this.k();
        return r0;
    };
    r.prototype.Enqueue = function (r0) {
        var s0 = this.h++;
        this.g[s0] = r0;
        this.j(s0);
    };
    var s = b.Scheduler = function (r0, s0, t0) {
            this.Schedule = r0;
            this.ScheduleWithTime = s0;
            this.Now = t0;
            this.ScheduleRecursive = function (u0) {
                var v0 = this;
                var w0 = new n();
                var x0;
                x0 = function () {
                    u0(function () {
                        var y0 = false;
                        var z0 = false;
                        var A0;
                        A0 = v0.Schedule(function () {
                            x0();
                            if (y0) w0.Remove(A0);
                            else z0 = true;
                        });
                        if (!z0) {
                            w0.Add(A0);
                            y0 = true;
                        }
                    });
                };
                w0.Add(v0.Schedule(x0));
                return w0;
            };
            this.ScheduleRecursiveWithTime = function (u0, v0) {
                var w0 = this;
                var x0 = new n();
                var y0;
                y0 = function () {
                    u0(function (z0) {
                        var A0 = false;
                        var B0 = false;
                        var C0;
                        C0 = w0.ScheduleWithTime(function () {
                            y0();
                            if (A0) x0.Remove(C0);
                            else B0 = true;
                        }, z0);
                        if (!B0) {
                            x0.Add(C0);
                            A0 = true;
                        }
                    });
                };
                x0.Add(w0.ScheduleWithTime(y0, v0));
                return x0;
            };
        };
    var t = b.VirtualScheduler = function (r0, s0, t0, u0) {
            var v0 = new s(function (w0) {
                return this.ScheduleWithTime(w0, 0);
            }, function (w0, x0) {
                return this.ScheduleVirtual(w0, u0(x0));
            }, function () {
                return t0(this.l);
            });
            v0.ScheduleVirtual = function (w0, x0) {
                var y0 = new k();
                var z0 = s0(this.l, x0);
                var A0 = function () {
                        if (!y0.IsDisposed) w0();
                    };
                var B0 = new y(A0, z0);
                this.m.Enqueue(B0);
                return y0;
            };
            v0.Run = function () {
                while (this.m.GetCount() > 0) {
                    var w0 = this.m.Dequeue();
                    this.l = w0.n;
                    w0.o();
                }
            };
            v0.RunTo = function (w0) {
                while (this.m.GetCount() > 0 && this.f(this.m.Peek().n, w0) <= 0) {
                    var x0 = this.m.Dequeue();
                    this.l = x0.n;
                    x0.o();
                }
            };
            v0.GetTicks = function () {
                return this.l;
            };
            v0.l = 0;
            v0.m = new r(function (w0, x0) {
                return r0(w0.n, x0.n);
            });
            v0.f = r0;
            return v0;
        };
    var u = b.TestScheduler = function () {
            var r0 = new t(function (s0, t0) {
                return s0 - t0;
            }, function (s0, t0) {
                return s0 + t0;
            }, function (s0) {
                return new Date(s0);
            }, function (s0) {
                if (s0 <= 0) return 1;
                return s0;
            });
            return r0;
        };
    var v = new s(function (r0) {
        return this.ScheduleWithTime(r0, 0);
    }, function (r0, s0) {
        var t0 = this.Now() + s0;
        var u0 = new y(r0, t0);
        if (this.m === a) {
            var v0 = new w();
            try {
                this.m.Enqueue(u0);
                v0.p();
            } finally {
                v0.q();
            }
        } else this.m.Enqueue(u0);
        return u0.r();
    }, f);
    v.s = function (r0) {
        if (this.m === a) {
            var s0 = new w();
            try {
                r0();
                s0.p();
            } finally {
                s0.q();
            }
        } else r0();
    };
    s.CurrentThread = v;
    var w = function () {
            v.m = new r(function (r0, s0) {
                try {
                    return r0.n - s0.n;
                } catch (t0) {
                    debugger;
                }
            });
            this.q = function () {
                v.m = a;
            };
            this.p = function () {
                while (v.m.GetCount() > 0) {
                    var r0 = v.m.Dequeue();
                    if (!r0.t()) {
                        while (r0.n - v.Now() > 0);
                        if (!r0.t()) r0.o();
                    }
                }
            };
        };
    var x = 0;
    var y = function (r0, s0) {
            this.u = x++;
            this.o = r0;
            this.n = s0;
            this.v = new k();
            this.t = function () {
                return this.v.GetIsDisposed();
            };
            this.r = function () {
                return this.v;
            };
        };
    var z = new s(function (r0) {
        r0();
        return j;
    }, function (r0, s0) {
        while (this.Now < s0);
        r0();
    }, f);
    s.Immediate = z;
    var A = new s(function (r0) {
        var s0 = c.setTimeout(r0, 0);
        return i(function () {
            c.clearTimeout(s0);
        });
    }, function (r0, s0) {
        var t0 = c.setTimeout(r0, s0);
        return i(function () {
            c.clearTimeout(t0);
        });
    }, f);
    s.Timeout = A;
    var B = b.Observer = function (r0, s0, t0) {
            this.OnNext = r0 === a ? e : r0;
            this.OnError = s0 === a ?
            function (u0) {
                throw u0;
            } : s0;
            this.OnCompleted = t0 === a ? e : t0;
            this.AsObserver = function () {
                var u0 = this;
                return new B(function (v0) {
                    u0.OnNext(v0);
                }, function (v0) {
                    u0.OnError(v0);
                }, function () {
                    u0.OnCompleted();
                });
            };
        };
    var C = B.Create = function (r0, s0, t0) {
            return new B(r0, s0, t0);
        };
    var D = b.Observable = function (r0) {
            this.w = r0;
        };
    var E = D.CreateWithDisposable = function (r0) {
            return new D(r0);
        };
    var F = D.Create = function (r0) {
            return E(function (s0) {
                return i(r0(s0));
            });
        };
    var G = function () {
            return this.Select(function (r0) {
                return r0.Value;
            });
        };
    D.prototype = {
        Subscribe: function (r0, s0, t0) {
            var u0;
            if (arguments.length == 0 || arguments.length > 1 || typeof r0 == "function") u0 = new B(r0, s0, t0);
            else u0 = r0;
            return this.x(u0);
        },
        x: function (r0) {
            var s0 = false;
            var t0 = new o();
            var u0 = this;
            v.s(function () {
                var v0 = new B(function (w0) {
                    if (!s0) r0.OnNext(w0);
                }, function (w0) {
                    if (!s0) {
                        s0 = true;
                        t0.Dispose();
                        r0.OnError(w0);
                    }
                }, function () {
                    if (!s0) {
                        s0 = true;
                        t0.Dispose();
                        r0.OnCompleted();
                    }
                });
                t0.Replace(u0.w(v0));
            });
            return new n(t0, i(function () {
                s0 = true;
            }));
        },
        Select: function (r0) {
            var s0 = this;
            return E(function (t0) {
                var u0 = 0;
                return s0.Subscribe(new B(function (v0) {
                    var w0;
                    try {
                        w0 = r0(v0, u0++);
                    } catch (x0) {
                        t0.OnError(x0);
                        return;
                    }
                    t0.OnNext(w0);
                }, function (v0) {
                    t0.OnError(v0);
                }, function () {
                    t0.OnCompleted();
                }));
            });
        },
        Let: function (r0, s0) {
            if (s0 === a) return r0(this);
            var t0 = this;
            return E(function (u0) {
                var v0 = s0();
                var w0;
                try {
                    w0 = r0(v0);
                } catch (A0) {
                    return L(A0).Subscribe(u0);
                }
                var x0 = new o();
                var y0 = new o();
                var z0 = new n(y0, x0);
                x0.Replace(w0.Subscribe(function (A0) {
                    u0.OnNext(A0);
                }, function (A0) {
                    u0.OnError(A0);
                    z0.Dispose();
                }, function () {
                    u0.OnCompleted();
                    z0.Dispose();
                }));
                y0.Replace(t0.Subscribe(v0));
                return z0;
            });
        },
        MergeObservable: function () {
            var r0 = this;
            return E(function (s0) {
                var t0 = false;
                var u0 = new n();
                var v0 = new o();
                u0.Add(v0);
                v0.Replace(r0.Subscribe(function (w0) {
                    var x0 = new o();
                    u0.Add(x0);
                    x0.Replace(w0.Subscribe(function (y0) {
                        s0.OnNext(y0);
                    }, function (y0) {
                        s0.OnError(y0);
                    }, function () {
                        u0.Remove(x0);
                        if (u0.GetCount() == 1 && t0) s0.OnCompleted();
                    }));
                }, function (w0) {
                    s0.OnError(w0);
                }, function () {
                    t0 = true;
                    if (u0.GetCount() == 1) s0.OnCompleted();
                }));
                return u0;
            });
        },
        y: function (r0, s0) {
            var t0 = p(s0);
            t0.unshift(this);
            return r0(t0);
        },
        Concat: function () {
            return this.y(I, arguments);
        },
        Merge: function () {
            return this.y(H, arguments);
        },
        Catch: function () {
            return this.y(P, arguments);
        },
        OnErrorResumeNext: function () {
            return this.y(V, arguments);
        },
        Zip: function (r0, s0) {
            var t0 = this;
            return E(function (u0) {
                var v0 = false;
                var w0 = [];
                var x0 = [];
                var y0 = false;
                var z0 = false;
                var A0 = new n();
                var B0 = function (C0) {
                        A0.Dispose();
                        w0 = a;
                        x0 = a;
                        u0.OnError(C0);
                    };
                A0.Add(t0.Subscribe(function (C0) {
                    if (z0) {
                        u0.OnCompleted();
                        return;
                    }
                    if (x0.length > 0) {
                        var D0 = x0.shift();
                        var E0;
                        try {
                            E0 = s0(C0, D0);
                        } catch (F0) {
                            A0.Dispose();
                            u0.OnError(F0);
                            return;
                        }
                        u0.OnNext(E0);
                    } else w0.push(C0);
                }, B0, function () {
                    if (z0) {
                        u0.OnCompleted();
                        return;
                    }
                    y0 = true;
                }));
                A0.Add(r0.Subscribe(function (C0) {
                    if (y0) {
                        u0.OnCompleted();
                        return;
                    }
                    if (w0.length > 0) {
                        var D0 = w0.shift();
                        var E0;
                        try {
                            E0 = s0(D0, C0);
                        } catch (F0) {
                            A0.Dispose();
                            u0.OnError(F0);
                            return;
                        }
                        u0.OnNext(E0);
                    } else x0.push(C0);
                }, B0, function () {
                    if (y0) {
                        u0.OnCompleted();
                        return;
                    }
                    z0 = true;
                }));
                return A0;
            });
        },
        CombineLatest: function (r0, s0) {
            var t0 = this;
            return E(function (u0) {
                var v0 = false;
                var w0 = false;
                var x0 = false;
                var y0;
                var z0;
                var A0 = false;
                var B0 = false;
                var C0 = new n();
                var D0 = function (E0) {
                        C0.Dispose();
                        u0.OnError(E0);
                    };
                C0.Add(t0.Subscribe(function (E0) {
                    if (B0) {
                        u0.OnCompleted();
                        return;
                    }
                    if (x0) {
                        var F0;
                        try {
                            F0 = s0(E0, z0);
                        } catch (G0) {
                            C0.Dispose();
                            u0.OnError(G0);
                            return;
                        }
                        u0.OnNext(F0);
                    }
                    y0 = E0;
                    w0 = true;
                }, D0, function () {
                    if (B0) {
                        u0.OnCompleted();
                        return;
                    }
                    A0 = true;
                }));
                C0.Add(r0.Subscribe(function (E0) {
                    if (A0) {
                        u0.OnCompleted();
                        return;
                    }
                    if (w0) {
                        var F0;
                        try {
                            F0 = s0(y0, E0);
                        } catch (G0) {
                            C0.Dispose();
                            u0.OnError(G0);
                            return;
                        }
                        u0.OnNext(F0);
                    }
                    z0 = E0;
                    x0 = true;
                }, D0, function () {
                    if (A0) {
                        u0.OnCompleted();
                        return;
                    }
                    B0 = true;
                }));
            });
        },
        Switch: function () {
            var r0 = this;
            return E(function (s0) {
                var t0 = false;
                var u0 = new o();
                var v0 = new o();
                v0.Replace(r0.Subscribe(function (w0) {
                    if (!t0) {
                        var x0 = new o();
                        x0.Replace(w0.Subscribe(function (y0) {
                            s0.OnNext(y0);
                        }, function (y0) {
                            v0.Dispose();
                            u0.Dispose();
                            s0.OnError(y0);
                        }, function () {
                            u0.Replace(a);
                            if (t0) s0.OnCompleted();
                        }));
                        u0.Replace(x0);
                    }
                }, function (w0) {
                    u0.Dispose();
                    s0.OnError(w0);
                }, function () {
                    t0 = true;
                    if (u0.Get() === a) s0.OnCompleted();
                }));
                return new n(v0, u0);
            });
        },
        TakeUntil: function (r0) {
            var s0 = this;
            return E(function (t0) {
                var u0 = new n();
                u0.Add(r0.Subscribe(function () {
                    t0.OnCompleted();
                    u0.Dispose();
                }, function (v0) {
                    t0.OnError(v0);
                }, function () {}));
                u0.Add(s0.Subscribe(t0));
                return u0;
            });
        },
        SkipUntil: function (r0) {
            var s0 = this;
            return E(function (t0) {
                var u0 = true;
                var v0 = new n();
                v0.Add(r0.Subscribe(function () {
                    u0 = false;
                }, function (w0) {
                    t0.OnError(w0);
                }, e));
                v0.Add(s0.Subscribe(new B(function (w0) {
                    if (!u0) t0.OnNext(w0);
                }, function (w0) {
                    t0.OnError(w0);
                }, function () {
                    if (!u0) t0.OnCompleted();
                })));
                return v0;
            });
        },
        Scan1: function (r0) {
            var s0 = this;
            return O(function () {
                var t0;
                var u0 = false;
                return s0.Select(function (v0) {
                    if (u0) t0 = r0(t0, v0);
                    else {
                        t0 = v0;
                        u0 = true;
                    }
                    return t0;
                });
            });
        },
        Scan: function (r0, s0) {
            var t0 = this;
            return O(function () {
                var u0;
                var v0 = false;
                return t0.Select(function (w0) {
                    if (v0) u0 = s0(u0, w0);
                    else {
                        u0 = s0(r0, w0);
                        v0 = true;
                    }
                    return u0;
                });
            });
        },
        Scan0: function (r0, s0) {
            var t0 = this;
            return E(function (u0) {
                var v0 = r0;
                var w0 = true;
                return t0.Subscribe(function (x0) {
                    if (w0) {
                        w0 = false;
                        u0.OnNext(v0);
                    }
                    try {
                        v0 = s0(v0, x0);
                    } catch (y0) {
                        u0.OnError(y0);
                        return;
                    }
                    u0.OnNext(v0);
                }, function (x0) {
                    if (w0) u0.OnNext(v0);
                    u0.OnError(x0);
                }, function () {
                    if (w0) u0.OnNext(v0);
                    u0.OnCompleted();
                });
            });
        },
        Finally: function (r0) {
            var s0 = this;
            return F(function (t0) {
                var u0 = s0.Subscribe(t0);
                return function () {
                    try {
                        u0.Dispose();
                        r0();
                    } catch (v0) {
                        r0();
                        throw v0;
                    }
                };
            });
        },
        Do: function (r0, s0, t0) {
            var u0;
            if (arguments.length == 0 || arguments.length > 1 || typeof r0 == "function") u0 = new B(r0, s0 !== a ? s0 : e, t0);
            else u0 = r0;
            var v0 = this;
            return E(function (w0) {
                return v0.Subscribe(new B(function (x0) {
                    try {
                        u0.OnNext(x0);
                    } catch (y0) {
                        w0.OnError(y0);
                        return;
                    }
                    w0.OnNext(x0);
                }, function (x0) {
                    if (s0 !== a) try {
                        u0.OnError(x0);
                    } catch (y0) {
                        w0.OnError(y0);
                        return;
                    }
                    w0.OnError(x0);
                }, function () {
                    if (t0 !== a) try {
                        u0.OnCompleted();
                    } catch (x0) {
                        w0.OnError(x0);
                        return;
                    }
                    w0.OnCompleted();
                }));
            });
        },
        Where: function (r0) {
            var s0 = this;
            return E(function (t0) {
                var u0 = 0;
                return s0.Subscribe(new B(function (v0) {
                    var w0 = false;
                    try {
                        w0 = r0(v0, u0++);
                    } catch (x0) {
                        t0.OnError(x0);
                        return;
                    }
                    if (w0) t0.OnNext(v0);
                }, function (v0) {
                    t0.OnError(v0);
                }, function () {
                    t0.OnCompleted();
                }));
            });
        },
        Take: function (r0, s0) {
            if (s0 === a) s0 = z;
            var t0 = this;
            return E(function (u0) {
                if (r0 <= 0) {
                    t0.Subscribe().Dispose();
                    return N(s0).Subscribe(u0);
                }
                var v0 = r0;
                return t0.Subscribe(new B(function (w0) {
                    if (v0-- > 0) {
                        u0.OnNext(w0);
                        if (v0 == 0) u0.OnCompleted();
                    }
                }, function (w0) {
                    u0.OnError(w0);
                }, function () {
                    u0.OnCompleted();
                }));
            });
        },
        GroupBy: function (r0, s0, t0) {
            if (r0 === a) r0 = h;
            if (s0 === a) s0 = h;
            if (t0 === a) t0 = function (v0) {
                return v0.toString();
            };
            var u0 = this;
            return E(function (v0) {
                var w0 = {};
                var x0 = new o();
                var y0 = new m(x0);
                x0.Replace(u0.Subscribe(function (z0) {
                    var A0;
                    try {
                        A0 = r0(z0);
                    } catch (G0) {
                        for (var H0 in w0) w0[H0].OnError(G0);
                        v0.OnError(G0);
                        return;
                    }
                    var B0 = false;
                    var C0;
                    try {
                        var D0 = t0(A0);
                        if (w0[D0] === a) {
                            C0 = new i0();
                            w0[D0] = C0;
                            B0 = true;
                        } else C0 = w0[D0];
                    } catch (G0) {
                        for (var H0 in w0) w0[H0].OnError(G0);
                        v0.OnError(G0);
                        return;
                    }
                    if (B0) {
                        var E0 = E(function (G0) {
                            return new n(y0.GetDisposable(), C0.Subscribe(G0));
                        });
                        E0.Key = A0;
                        v0.OnNext(E0);
                    }
                    var F0;
                    try {
                        F0 = s0(z0);
                    } catch (G0) {
                        for (var H0 in w0) w0[H0].OnError(G0);
                        v0.OnError(G0);
                        return;
                    }
                    C0.OnNext(F0);
                }, function (z0) {
                    for (var A0 in w0) w0[A0].OnError(z0);
                    v0.OnError(z0);
                }, function () {
                    for (var z0 in w0) w0[z0].OnCompleted();
                    v0.OnCompleted();
                }));
                return y0;
            });
        },
        TakeWhile: function (r0) {
            var s0 = this;
            return E(function (t0) {
                var u0 = true;
                return s0.Subscribe(new B(function (v0) {
                    if (u0) {
                        try {
                            u0 = r0(v0);
                        } catch (w0) {
                            t0.OnError(w0);
                            return;
                        }
                        if (u0) t0.OnNext(v0);
                        else t0.OnCompleted();
                    }
                }, function (v0) {
                    t0.OnError(v0);
                }, function () {
                    t0.OnCompleted();
                }));
            });
        },
        SkipWhile: function (r0) {
            var s0 = this;
            return E(function (t0) {
                var u0 = false;
                return s0.Subscribe(new B(function (v0) {
                    if (!u0) try {
                        u0 = !r0(v0);
                    } catch (w0) {
                        t0.OnError(w0);
                        return;
                    }
                    if (u0) t0.OnNext(v0);
                }, function (v0) {
                    t0.OnError(v0);
                }, function () {
                    t0.OnCompleted();
                }));
            });
        },
        Skip: function (r0) {
            var s0 = this;
            return E(function (t0) {
                var u0 = r0;
                return s0.Subscribe(new B(function (v0) {
                    if (u0-- <= 0) t0.OnNext(v0);
                }, function (v0) {
                    t0.OnError(v0);
                }, function () {
                    t0.OnCompleted();
                }));
            });
        },
        SelectMany: function (r0) {
            return this.Select(r0).MergeObservable();
        },
        TimeInterval: function (r0) {
            if (r0 === a) r0 = z;
            var s0 = this;
            return O(function () {
                var t0 = r0.Now();
                return s0.Select(function (u0) {
                    var v0 = r0.Now();
                    var w0 = v0 - t0;
                    t0 = v0;
                    return {
                        Interval: w0,
                        Value: u0
                    };
                });
            });
        },
        RemoveInterval: G,
        Timestamp: function (r0) {
            if (r0 === a) r0 = z;
            return this.Select(function (s0) {
                return {
                    Timestamp: r0.Now(),
                    Value: s0
                };
            });
        },
        RemoveTimestamp: G,
        Materialize: function () {
            var r0 = this;
            return E(function (s0) {
                return r0.Subscribe(new B(function (t0) {
                    s0.OnNext(new h0("N", t0));
                }, function (t0) {
                    s0.OnNext(new h0("E", t0));
                    s0.OnCompleted();
                }, function () {
                    s0.OnNext(new h0("C"));
                    s0.OnCompleted();
                }));
            });
        },
        Dematerialize: function () {
            return this.SelectMany(function (r0) {
                return r0;
            });
        },
        AsObservable: function () {
            var r0 = this;
            return E(function (s0) {
                return r0.Subscribe(s0);
            });
        },
        Delay: function (r0, s0) {
            if (s0 === a) s0 = A;
            var t0 = this;
            return E(function (u0) {
                var v0 = [];
                var w0 = false;
                var x0 = new o();
                var y0 = t0.Materialize().Timestamp().Subscribe(function (z0) {
                    if (z0.Value.Kind == "E") {
                        u0.OnError(z0.Value.Value);
                        v0 = [];
                        if (w0) x0.Dispose();
                        return;
                    }
                    v0.push({
                        Timestamp: s0.Now() + r0,
                        Value: z0.Value
                    });
                    if (!w0) {
                        x0.Replace(s0.ScheduleRecursiveWithTime(function (A0) {
                            var B0;
                            do {
                                B0 = a;
                                if (v0.length > 0 && v0[0].Timestamp <= s0.Now()) B0 = v0.shift().Value;
                                if (B0 !== a) B0.Accept(u0);
                            } while (B0 !== a);
                            if (v0.length > 0) {
                                A0(Math.max(0, v0[0].Timestamp - s0.Now()));
                                w0 = true;
                            } else w0 = false;
                        }, r0));
                        w0 = true;
                    }
                });
                return new n(y0, x0);
            });
        },
        Throttle: function (r0, s0) {
            if (s0 === a) s0 = A;
            var t0 = this;
            return E(function (u0) {
                var v0;
                var w0 = false;
                var x0 = new o();
                var y0 = 0;
                var z0 = t0.Subscribe(function (A0) {
                    w0 = true;
                    v0 = A0;
                    y0++;
                    var B0 = y0;
                    x0.Replace(s0.ScheduleWithTime(function () {
                        if (w0 && y0 == B0) u0.OnNext(v0);
                        w0 = false;
                    }, r0));
                }, function (A0) {
                    x0.Dispose();
                    u0.OnError(A0);
                    w0 = false;
                    y0++;
                }, function () {
                    x0.Dispose();
                    if (w0) u0.OnNext(v0);
                    u0.OnCompleted();
                    w0 = false;
                    y0++;
                });
                return new n(z0, x0);
            });
        },
        Timeout: function (r0, s0, t0) {
            if (t0 === a) t0 = A;
            if (s0 === a) s0 = L("Timeout", t0);
            var u0 = this;
            return E(function (v0) {
                var w0 = new o();
                var x0 = new o();
                var y0 = 0;
                var z0 = y0;
                var A0 = false;
                x0.Replace(t0.ScheduleWithTime(function () {
                    A0 = y0 == z0;
                    if (A0) w0.Replace(s0.Subscribe(v0));
                }, r0));
                w0.Replace(u0.Subscribe(function (B0) {
                    var C0 = 0;
                    if (!A0) {
                        y0++;
                        C0 = y0;
                        v0.OnNext(B0);
                        x0.Replace(t0.ScheduleWithTime(function () {
                            A0 = y0 == C0;
                            if (A0) w0.Replace(s0.Subscribe(v0));
                        }, r0));
                    }
                }, function (B0) {
                    if (!A0) {
                        y0++;
                        v0.OnError(B0);
                    }
                }, function () {
                    if (!A0) {
                        y0++;
                        v0.OnCompleted();
                    }
                }));
                return new n(w0, x0);
            });
        },
        Sample: function (r0, s0) {
            if (s0 === a) s0 = A;
            var t0 = this;
            return E(function (u0) {
                var v0 = false;
                var w0;
                var x0 = false;
                var y0 = new n();
                y0.Add(Y(r0, s0).Subscribe(function (z0) {
                    if (v0) {
                        u0.OnNext(w0);
                        v0 = false;
                    }
                    if (x0) u0.OnCompleted();
                }, function (z0) {
                    u0.OnError(z0);
                }, function () {
                    u0.OnCompleted();
                }));
                y0.Add(t0.Subscribe(function (z0) {
                    v0 = true;
                    w0 = z0;
                }, function (z0) {
                    u0.OnError(z0);
                    y0.Dispose();
                }, function () {
                    x0 = true;
                }));
                return y0;
            });
        },
        Repeat: function (r0, s0) {
            var t0 = this;
            if (s0 === a) s0 = z;
            if (r0 === a) r0 = -1;
            return E(function (u0) {
                var v0 = r0;
                var w0 = new o();
                var x0 = new n(w0);
                var y0 = function (z0) {
                        w0.Replace(t0.Subscribe(function (A0) {
                            u0.OnNext(A0);
                        }, function (A0) {
                            u0.OnError(A0);
                        }, function () {
                            if (v0 > 0) {
                                v0--;
                                if (v0 == 0) {
                                    u0.OnCompleted();
                                    return;
                                }
                            }
                            z0();
                        }));
                    };
                x0.Add(s0.ScheduleRecursive(y0));
                return x0;
            });
        },
        Retry: function (r0, s0) {
            var t0 = this;
            if (s0 === a) s0 = z;
            if (r0 === a) r0 = -1;
            return E(function (u0) {
                var v0 = r0;
                var w0 = new o();
                var x0 = new n(w0);
                var y0 = function (z0) {
                        w0.Replace(t0.Subscribe(function (A0) {
                            u0.OnNext(A0);
                        }, function (A0) {
                            if (v0 > 0) {
                                v0--;
                                if (v0 == 0) {
                                    u0.OnError(A0);
                                    return;
                                }
                            }
                            z0();
                        }, function () {
                            u0.OnCompleted();
                        }));
                    };
                x0.Add(s0.ScheduleRecursive(y0));
                return x0;
            });
        },
        BufferWithTime: function (r0, s0, t0) {
            if (t0 === a) t0 = A;
            if (s0 === a) s0 = r0;
            var u0 = this;
            return E(function (v0) {
                var w0 = new q();
                var x0 = t0.Now();
                var y0 = function () {
                        var C0 = [];
                        for (var D0 = 0; D0 < w0.GetCount(); D0++) {
                            var E0 = w0.GetItem(D0);
                            if (E0.Timestamp - x0 >= 0) C0.push(E0.Value);
                        }
                        return C0;
                    };
                var z0 = new n();
                var A0 = function (C0) {
                        v0.OnError(C0);
                    };
                var B0 = function () {
                        v0.OnNext(y0());
                        v0.OnCompleted();
                    };
                z0.Add(u0.Subscribe(function (C0) {
                    w0.Add({
                        Value: C0,
                        Timestamp: t0.Now()
                    });
                }, A0, B0));
                z0.Add(a0(r0, s0, t0).Subscribe(function (C0) {
                    var D0 = y0();
                    var E0 = t0.Now() + s0 - r0;
                    while (w0.GetCount() > 0 && w0.GetItem(0).Timestamp - E0 <= 0) w0.RemoveAt(0);
                    v0.OnNext(D0);
                    x0 = E0;
                }, A0, B0));
                return z0;
            });
        },
        BufferWithTimeOrCount: function (r0, s0, t0) {
            if (t0 === a) t0 = A;
            var u0 = this;
            return E(function (v0) {
                var w0 = 0;
                var x0 = new q();
                var y0 = function () {
                        v0.OnNext(x0.ToArray());
                        x0.Clear();
                        w0++;
                    };
                var z0 = new o();
                var A0;
                A0 = function (C0) {
                    var D0 = t0.ScheduleWithTime(function () {
                        var E0 = false;
                        var F0 = 0;
                        if (C0 == w0) {
                            y0();
                            F0 = w0;
                            E0 = true;
                        }
                        if (E0) A0(F0);
                    }, r0);
                    z0.Replace(D0);
                };
                A0(w0);
                var B0 = u0.Subscribe(function (C0) {
                    var D0 = false;
                    var E0 = 0;
                    x0.Add(C0);
                    if (x0.GetCount() == s0) {
                        y0();
                        E0 = w0;
                        D0 = true;
                    }
                    if (D0) A0(E0);
                }, function (C0) {
                    v0.OnError(C0);
                    x0.Clear();
                }, function () {
                    v0.OnNext(x0.ToArray());
                    w0++;
                    v0.OnCompleted();
                    x0.Clear();
                });
                return new n(B0, z0);
            });
        },
        BufferWithCount: function (r0, s0) {
            if (s0 === a) s0 = r0;
            var t0 = this;
            return E(function (u0) {
                var v0 = [];
                var w0 = 0;
                return t0.Subscribe(function (x0) {
                    if (w0 == 0) v0.push(x0);
                    else w0--;
                    var y0 = v0.length;
                    if (y0 == r0) {
                        var z0 = v0;
                        v0 = [];
                        var A0 = Math.min(s0, y0);
                        for (var B0 = A0; B0 < y0; B0++) v0.push(z0[B0]);
                        w0 = Math.max(0, s0 - r0);
                        u0.OnNext(z0);
                    }
                }, function (x0) {
                    u0.OnError(x0);
                }, function () {
                    if (v0.length > 0) u0.OnNext(v0);
                    u0.OnCompleted();
                });
            });
        },
        StartWith: function (r0, s0) {
            if (!(r0 instanceof Array)) r0 = [r0];
            if (s0 === a) s0 = z;
            var t0 = this;
            return E(function (u0) {
                var v0 = new n();
                var w0 = 0;
                v0.Add(s0.ScheduleRecursive(function (x0) {
                    if (w0 < r0.length) {
                        u0.OnNext(r0[w0]);
                        w0++;
                        x0();
                    } else v0.Add(t0.Subscribe(u0));
                }));
                return v0;
            });
        },
        DistinctUntilChanged: function (r0, s0) {
            if (r0 === a) r0 = h;
            if (s0 === a) s0 = g;
            var t0 = this;
            return E(function (u0) {
                var v0;
                var w0 = false;
                return t0.Subscribe(function (x0) {
                    var y0;
                    try {
                        y0 = r0(x0);
                    } catch (A0) {
                        u0.OnError(A0);
                        return;
                    }
                    var z0 = false;
                    if (w0) try {
                        z0 = s0(v0, y0);
                    } catch (A0) {
                        u0.OnError(A0);
                        return;
                    }
                    if (!w0 || !z0) {
                        w0 = true;
                        v0 = y0;
                        u0.OnNext(x0);
                    }
                }, function (x0) {
                    u0.OnError(x0);
                }, function () {
                    u0.OnCompleted();
                });
            });
        },
        Publish: function (r0) {
            if (r0 === a) return new q0(this, new i0());
            var s0 = this;
            return E(function (t0) {
                var u0 = new q0(s0, new i0());
                return new n(r0(u0).Subscribe(B), u0.Connect());
            });
        },
        Prune: function (r0, s0) {
            if (s0 === a) s0 = z;
            if (r0 === a) return new q0(this, new k0(s0));
            var t0 = this;
            return E(function (u0) {
                var v0 = new q0(t0, new k0(s0));
                return new n(r0(v0).Subscribe(B), v0.Connect());
            });
        },
        Replay: function (r0, s0, t0, u0) {
            if (u0 === a) u0 = v;
            if (r0 === a) return new q0(this, new m0(s0, t0, u0));
            var v0 = this;
            return E(function (w0) {
                var x0 = new q0(v0, new m0(s0, t0, u0));
                return new n(r0(x0).Subscribe(B), x0.Connect());
            });
        },
        SkipLast: function (r0) {
            var s0 = this;
            return E(function (t0) {
                var u0 = [];
                return s0.Subscribe(function (v0) {
                    u0.push(v0);
                    if (u0.length > r0) t0.OnNext(u0.shift());
                }, function (v0) {
                    t0.OnError(v0);
                }, function () {
                    t0.OnCompleted();
                });
            });
        },
        TakeLast: function (r0) {
            var s0 = this;
            return E(function (t0) {
                var u0 = [];
                return s0.Subscribe(function (v0) {
                    u0.push(v0);
                    if (u0.length > r0) u0.shift();
                }, function (v0) {
                    t0.OnError(v0);
                }, function () {
                    while (u0.length > 0) t0.OnNext(u0.shift());
                    t0.OnCompleted();
                });
            });
        }
    };
    var H = D.Merge = function (r0, s0) {
            if (s0 === a) s0 = z;
            return J(r0, s0).MergeObservable();
        };
    var I = D.Concat = function (r0, s0) {
            if (s0 === a) s0 = z;
            return E(function (t0) {
                var u0 = new o();
                var v0 = 0;
                var w0 = s0.ScheduleRecursive(function (x0) {
                    if (v0 < r0.length) {
                        var y0 = r0[v0];
                        v0++;
                        var z0 = new o();
                        u0.Replace(z0);
                        z0.Replace(y0.Subscribe(function (A0) {
                            t0.OnNext(A0);
                        }, function (A0) {
                            t0.OnError(A0);
                        }, x0));
                    } else t0.OnCompleted();
                });
                return new n(u0, w0);
            });
        };
    var J = D.FromArray = function (r0, s0) {
            if (s0 === a) s0 = z;
            return E(function (t0) {
                var u0 = 0;
                return s0.ScheduleRecursive(function (v0) {
                    if (u0 < r0.length) {
                        t0.OnNext(r0[u0++]);
                        v0();
                    } else t0.OnCompleted();
                });
            });
        };
    var K = D.Return = function (r0, s0) {
            if (s0 === a) s0 = z;
            return E(function (t0) {
                return s0.Schedule(function () {
                    t0.OnNext(r0);
                    t0.OnCompleted();
                });
            });
        };
    var L = D.Throw = function (r0, s0) {
            if (s0 === a) s0 = z;
            return E(function (t0) {
                return s0.Schedule(function () {
                    t0.OnError(r0);
                });
            });
        };
    var M = D.Never = function () {
            return E(function (r0) {
                return j;
            });
        };
    var N = D.Empty = function (r0) {
            if (r0 === a) r0 = z;
            return E(function (s0) {
                return r0.Schedule(function () {
                    s0.OnCompleted();
                });
            });
        };
    var O = D.Defer = function (r0) {
            return E(function (s0) {
                var t0;
                try {
                    t0 = r0();
                } catch (u0) {
                    s0.OnError(u0);
                    return j;
                }
                return t0.Subscribe(s0);
            });
        };
    var P = D.
    Catch = function (r0, s0) {
            if (s0 === a) s0 = z;
            return E(function (t0) {
                var u0 = new o();
                var v0 = 0;
                var w0 = s0.ScheduleRecursive(function (x0) {
                    var y0 = r0[v0];
                    v0++;
                    var z0 = new o();
                    u0.Replace(z0);
                    z0.Replace(y0.Subscribe(function (A0) {
                        t0.OnNext(A0);
                    }, function (A0) {
                        if (v0 < r0.length) x0();
                        else t0.OnError(A0);
                    }, function () {
                        t0.OnCompleted();
                    }));
                });
                return new n(u0, w0);
            });
        };
    var Q = D.Using = function (r0, s0) {
            return E(function (t0) {
                var u0;
                var v0 = j;
                try {
                    var w0 = r0();
                    if (w0 !== a) v0 = w0;
                    u0 = s0(w0);
                } catch (x0) {
                    return new n(Throw(x0).Subscribe(t0), v0);
                }
                return new n(u0.Subscribe(t0), v0);
            });
        };
    var R = D.Range = function (r0, s0, t0) {
            if (t0 === a) t0 = z;
            var u0 = r0 + s0 - 1;
            return T(r0, function (v0) {
                return v0 <= u0;
            }, function (v0) {
                return v0 + 1;
            }, h, t0);
        };
    var S = D.Repeat = function (r0, s0, t0) {
            if (t0 === a) t0 = z;
            if (s0 === a) s0 = -1;
            var u0 = s0;
            return E(function (v0) {
                return t0.ScheduleRecursive(function (w0) {
                    v0.OnNext(r0);
                    if (u0 > 0) {
                        u0--;
                        if (u0 == 0) {
                            v0.OnCompleted();
                            return;
                        }
                    }
                    w0();
                });
            });
        };
    var T = D.Generate = function (r0, s0, t0, u0, v0) {
            if (v0 === a) v0 = z;
            return E(function (w0) {
                var x0 = r0;
                var y0 = true;
                return v0.ScheduleRecursive(function (z0) {
                    var A0 = false;
                    var B0;
                    try {
                        if (y0) y0 = false;
                        else x0 = t0(x0);
                        A0 = s0(x0);
                        if (A0) B0 = u0(x0);
                    } catch (C0) {
                        w0.OnError(C0);
                        return;
                    }
                    if (A0) {
                        w0.OnNext(B0);
                        z0();
                    } else w0.OnCompleted();
                });
            });
        };
    var U = D.GenerateWithTime = function (r0, s0, t0, u0, v0, w0) {
            if (w0 === a) w0 = A;
            return new E(function (x0) {
                var y0 = r0;
                var z0 = true;
                var A0 = false;
                var B0;
                var C0;
                return w0.ScheduleRecursiveWithTime(function (D0) {
                    if (A0) x0.OnNext(B0);
                    try {
                        if (z0) z0 = false;
                        else y0 = t0(y0);
                        A0 = s0(y0);
                        if (A0) {
                            B0 = u0(y0);
                            C0 = v0(y0);
                        }
                    } catch (E0) {
                        x0.OnError(E0);
                        return;
                    }
                    if (A0) D0(C0);
                    else x0.OnCompleted();
                }, 0);
            });
        };
    var V = D.OnErrorResumeNext = function (r0, s0) {
            if (s0 === a) s0 = z;
            return E(function (t0) {
                var u0 = new o();
                var v0 = 0;
                var w0 = s0.ScheduleRecursive(function (x0) {
                    if (v0 < r0.length) {
                        var y0 = r0[v0];
                        v0++;
                        var z0 = new o();
                        u0.Replace(z0);
                        z0.Replace(y0.Subscribe(function (A0) {
                            t0.OnNext(A0);
                        }, x0, x0));
                    } else t0.OnCompleted();
                });
                return new n(u0, w0);
            });
        };
    var W = D.Amb = function () {
            var r0 = arguments;
            return E(function (s0) {
                var t0 = new n();
                var u0 = new o();
                u0.Replace(t0);
                var v0 = false;
                for (var w0 = 0; w0 < r0.length; w0++) {
                    var x0 = r0[w0];
                    var y0 = new o();
                    var z0 = new B(function (A0) {
                        if (!v0) {
                            t0.Remove(this.z, true);
                            t0.Dispose();
                            u0.Replace(this.z);
                            v0 = true;
                        }
                        s0.OnNext(A0);
                    }, function (A0) {
                        s0.OnError(A0);
                        u0.Dispose();
                    }, function () {
                        s0.OnCompleted();
                        u0.Dispose();
                    });
                    z0.z = y0;
                    y0.Replace(x0.Subscribe(z0));
                    t0.Add(y0);
                }
                return u0;
            });
        };
    var X = D.ForkJoin = function () {
            var r0 = arguments;
            return E(function (s0) {
                var t0 = [];
                var u0 = [];
                var v0 = [];
                var w0 = new n();
                for (var x0 = 0; x0 < r0.length; x0++)(function (y0) {
                    w0.Add(r0[y0].Subscribe(function (z0) {
                        t0[y0] = true;
                        v0[y0] = z0;
                    }, function (z0) {
                        s0.OnError(z0);
                    }, function (z0) {
                        if (!t0[y0]) {
                            s0.OnCompleted();
                            v0 = a;
                            t0 = a;
                            return;
                        }
                        u0[y0] = true;
                        var A0 = true;
                        for (var B0 = 0; B0 < r0.length; B0++) {
                            if (!u0[B0]) A0 = false;
                        }
                        if (A0) {
                            s0.OnNext(v0);
                            s0.OnCompleted();
                            v0 = a;
                            u0 = a;
                            t0 = a;
                        }
                    }));
                })(x0);
                return w0;
            });
        };
    var Y = D.Interval = function (r0, s0) {
            return a0(r0, r0, s0);
        };
    var Z = function (r0) {
            return Math.max(0, r0);
        };
    var a0 = D.Timer = function (r0, s0, t0) {
            if (t0 === a) t0 = A;
            if (r0 === a) return M();
            if (r0 instanceof Date) return O(function () {
                return D.Timer(r0 - new Date(), s0, t0);
            });
            var u0 = Z(r0);
            if (s0 === a) return E(function (w0) {
                return t0.ScheduleWithTime(function () {
                    w0.OnNext(0);
                    w0.OnCompleted();
                }, u0);
            });
            var v0 = Z(s0);
            return E(function (w0) {
                var x0 = 0;
                return t0.ScheduleRecursiveWithTime(function (y0) {
                    w0.OnNext(x0++);
                    y0(v0);
                }, u0);
            });
        };
    var b0 = D.While = function (r0, s0) {
            return E(function (t0) {
                var u0 = new o();
                var v0 = new n(u0);
                v0.Add(z.ScheduleRecursive(function (w0) {
                    var x0;
                    try {
                        x0 = r0();
                    } catch (y0) {
                        t0.OnError(y0);
                        return;
                    }
                    if (x0) u0.Replace(s0.Subscribe(function (y0) {
                        t0.OnNext(y0);
                    }, function (y0) {
                        t0.OnError(y0);
                    }, function () {
                        w0();
                    }));
                    else t0.OnCompleted();
                }));
                return v0;
            });
        };
    var c0 = D.If = function (r0, s0, t0) {
            if (t0 === a) t0 = N();
            return O(function () {
                return r0() ? s0 : t0;
            });
        };
    var d0 = D.DoWhile = function (r0, s0) {
            return I([r0, b0(s0, r0)]);
        };
    var e0 = D.Case = function (r0, s0, t0, u0) {
            if (u0 === a) u0 = z;
            if (t0 === a) t0 = N(u0);
            return O(function () {
                var v0 = s0[r0()];
                if (v0 === a) v0 = t0;
                return v0;
            });
        };
    var f0 = D.For = function (r0, s0) {
            return E(function (t0) {
                var u0 = new n();
                var v0 = 0;
                u0.Add(z.ScheduleRecursive(function (w0) {
                    if (v0 < r0.length) {
                        var x0;
                        try {
                            x0 = s0(r0[v0]);
                        } catch (y0) {
                            t0.OnError(y0);
                            return;
                        }
                        u0.Add(x0.Subscribe(function (y0) {
                            t0.OnNext(y0);
                        }, function (y0) {
                            t0.OnError(y0);
                        }, function () {
                            v0++;
                            w0();
                        }));
                    } else t0.OnCompleted();
                }));
                return u0;
            });
        };
    var g0 = D.Let = function (r0, s0) {
            return O(function () {
                return s0(r0);
            });
        };
    var h0 = b.Notification = function (r0, s0) {
            this.Kind = r0;
            this.Value = s0;
            this.toString = function () {
                return this.Kind + ": " + this.Value;
            };
            this.Accept = function (t0) {
                switch (this.Kind) {
                case "N":
                    t0.OnNext(this.Value);
                    break;
                case "E":
                    t0.OnError(this.Value);
                    break;
                case "C":
                    t0.OnCompleted();
                    break;
                }
                return j;
            };
            this.w = function (t0) {
                var u0 = this.Accept(t0);
                if (r0 == "N") t0.OnCompleted();
                return u0;
            };
        };
    h0.prototype = new D;
    var i0 = b.Subject = function () {
            var r0 = new q();
            var s0 = false;
            this.OnNext = function (t0) {
                if (!s0) {
                    var u0 = r0.ToArray();
                    for (var v0 = 0; v0 < u0.length; v0++) {
                        var w0 = u0[v0];
                        w0.OnNext(t0);
                    }
                }
            };
            this.OnError = function (t0) {
                if (!s0) {
                    var u0 = r0.ToArray();
                    for (var v0 = 0; v0 < u0.length; v0++) {
                        var w0 = u0[v0];
                        w0.OnError(t0);
                    }
                    s0 = true;
                    r0.Clear();
                }
            };
            this.OnCompleted = function () {
                if (!s0) {
                    var t0 = r0.ToArray();
                    for (var u0 = 0; u0 < t0.length; u0++) {
                        var v0 = t0[u0];
                        v0.OnCompleted();
                    }
                    s0 = true;
                    r0.Clear();
                }
            };
            this.w = function (t0) {
                if (!s0) {
                    r0.Add(t0);
                    return i(function () {
                        r0.Remove(t0);
                    });
                } else return j;
            };
        };
    i0.prototype = new D;
    for (var j0 in B.prototype) i0.prototype[j0] = B.prototype[j0];
    var k0 = b.AsyncSubject = function (r0) {
            var s0 = new q();
            var t0;
            var u0 = false;
            if (r0 === a) r0 = z;
            this.OnNext = function (v0) {
                if (!u0) t0 = new h0("N", v0);
            };
            this.OnError = function (v0) {
                if (!u0) {
                    t0 = new h0("E", v0);
                    var w0 = s0.ToArray();
                    for (var x0 = 0; x0 < w0.length; x0++) {
                        var y0 = w0[x0];
                        if (y0 !== a) y0.OnError(v0);
                    }
                    u0 = true;
                    s0.Clear();
                }
            };
            this.OnCompleted = function () {
                if (!u0) {
                    if (t0 === a) t0 = new h0("C");
                    var v0 = s0.ToArray();
                    for (var w0 = 0; w0 < v0.length; w0++) {
                        var x0 = v0[w0];
                        if (x0 !== a) t0.w(x0);
                    }
                    u0 = true;
                    s0.Clear();
                }
            };
            this.w = function (v0) {
                if (!u0) {
                    s0.Add(v0);
                    return i(function () {
                        s0.Remove(v0);
                    });
                } else return r0.Schedule(function () {
                    t0.w(v0);
                });
            };
        };
    k0.prototype = new i0;
    var l0 = b.BehaviorSubject = function (r0, s0) {
            var t0 = new m0(1, -1, s0);
            t0.OnNext(r0);
            return t0;
        };
    var m0 = b.ReplaySubject = function (r0, s0, t0) {
            var u0 = new q();
            var v0 = new q();
            var w0 = false;
            if (t0 === a) t0 = v;
            var x0 = s0 > 0;
            var y0 = function (z0, A0) {
                    v0.Add({
                        Value: new h0(z0, A0),
                        Timestamp: t0.Now()
                    });
                };
            this.A = function () {
                if (r0 !== a) while (v0.GetCount() > r0) v0.RemoveAt(0);
                if (x0) while (v0.GetCount() > 0 && t0.Now() - v0.GetItem(0).Timestamp > s0) v0.RemoveAt(0);
            };
            this.OnNext = function (z0) {
                if (!w0) {
                    var A0 = u0.ToArray();
                    for (var B0 = 0; B0 < A0.length; B0++) {
                        var C0 = A0[B0];
                        C0.OnNext(z0);
                    }
                    y0("N", z0);
                }
            };
            this.OnError = function (z0) {
                if (!w0) {
                    var A0 = u0.ToArray();
                    for (var B0 = 0; B0 < A0.length; B0++) {
                        var C0 = A0[B0];
                        C0.OnError(z0);
                    }
                    w0 = true;
                    u0.Clear();
                    y0("E", z0);
                }
            };
            this.OnCompleted = function () {
                if (!w0) {
                    var z0 = u0.ToArray();
                    for (var A0 = 0; A0 < z0.length; A0++) {
                        var B0 = z0[A0];
                        B0.OnCompleted();
                    }
                    w0 = true;
                    u0.Clear();
                    y0("C");
                }
            };
            this.w = function (z0) {
                var A0 = new n0(this, z0);
                var B0 = new n(A0);
                var C0 = this;
                B0.Add(t0.Schedule(function () {
                    if (!A0.B) {
                        C0.A();
                        for (var D0 = 0; D0 < v0.GetCount(); D0++) v0.GetItem(D0).Value.Accept(z0);
                        u0.Add(z0);
                        A0.C = true;
                    }
                }));
                return B0;
            };
            this.D = function (z0) {
                u0.Remove(z0);
            };
        };
    m0.prototype = new i0;
    var n0 = function (r0, s0) {
            this.E = r0;
            this.F = s0;
            this.C = false;
            this.B = false;
            this.Dispose = function () {
                if (this.C) this.E.D(this.F);
                this.B = true;
            };
        };
    var o0 = D.ToAsync = function (r0, s0) {
            if (s0 === a) s0 = A;
            return function () {
                var t0 = new k0(s0);
                var u0 = function () {
                        var x0;
                        try {
                            x0 = r0.apply(this, arguments);
                        } catch (y0) {
                            t0.OnError(y0);
                            return;
                        }
                        t0.OnNext(x0);
                        t0.OnCompleted();
                    };
                var v0 = this;
                var w0 = p(arguments);
                s0.Schedule(function () {
                    u0.apply(v0, w0);
                });
                return t0;
            };
        };
    var p0 = D.Start = function (r0, s0, t0, u0) {
            if (t0 === a) t0 = [];
            return o0(r0, u0).apply(s0, t0);
        };
    var q0 = b.ConnectableObservable = function (r0, s0) {
            if (s0 === a) s0 = new i0();
            this.E = s0;
            this.G = r0;
            this.H = false;
            this.Connect = function () {
                var t0;
                var u0 = false;
                if (!this.H) {
                    this.H = true;
                    var v0 = this;
                    t0 = new n(i(function () {
                        v0.H = false;
                    }));
                    this.I = t0;
                    t0.Add(r0.Subscribe(this.E));
                }
                return this.I;
            };
            this.w = function (t0) {
                return this.E.Subscribe(t0);
            };
            this.RefCount = function () {
                var t0 = 0;
                var u0 = this;
                var v0;
                return F(function (w0) {
                    var x0 = false;
                    t0++;
                    x0 = t0 == 1;
                    var y0 = u0.Subscribe(w0);
                    if (x0) v0 = u0.Connect();
                    return function () {
                        y0.Dispose();
                        t0--;
                        if (t0 == 0) v0.Dispose();
                    };
                });
            };
        };
    q0.prototype = new D;
})();