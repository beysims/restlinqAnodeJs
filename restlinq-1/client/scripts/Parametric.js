
Array.prototype.last = function (off) {
    if (arguments.length < 1) off = 1;
    if (this.length >= off) return this[this.length - off];
    return null;
}

function Parametric(p) {

    this.head = null;
    this.closed = true;
    this.length = 0;
    
    if (p && p instanceof Array) {
        var i;
        for (i = 0; i < p.length; i++) this.update(p[i]);
    }
}

function testPar()
{
    var p = new Parametric();
    p.update(new Vector3(5,5,5),0.5);
    p.update(new Vector3(4,4,4),0.4);
    p.update(new Vector3(7,7,7),0.7);
    p.update(new Vector3(2,2,2),0.2);
    p.update(new Vector3(3,3,3),0.3);
    p.update(new Vector3(6,6,6),0.6);

    console.debug(p.toString());

    return p;
}

Parametric.prototype.foreach = function (func)
{
    var cur = this.head;
    while (cur) 
    {
        func.call(cur.obj, cur.t1, cur.t2);
        cur = cur.next;
    }
}

Parametric.prototype.remove = function (obj)
{
    var store = this[obj.id];
    if (store == undefined) return;

    this.length--;

    if (store == this.head) this.head = store.next;

    if (store.prev) store.prev.next = store.next;
    if (store.next) store.next.prev = store.prev;
    store.prev = store.next = null;

    delete this[obj.id];
}

Parametric.prototype.insert = function (obj, t1, t2)
{
    if (obj.id == undefined) obj.id = "pk" + Parametric.nextKey++;
    var store = this[obj.id];
    if (store == undefined)   
    {
        store = this[obj.id] = { obj: obj, t1: t1, t2: t2 }; 
    }

    this.length++;

    var cur = this.head;
    if (!cur)
    {
        this.head = store;
        store.next = store.prev = null;
        return store;
    }

    while (cur.next && store.t1 > cur.next.t1) cur = cur.next;
    while (cur      && store.t1 < cur.t1)      cur = cur.prev;

    if (cur) 
    {
        store.next = cur.next;
        if (cur.next) cur.next.prev = store;
        cur.next = store;
        store.prev = cur;
    }
    else 
    {
        //console.debug("inserting at head");

        if (this.head) this.head.prev = store;
        store.next = this.head;
        store.prev = null;
        this.head = store;
    }
    return store;
}

Parametric.prototype.order = function()
{
    var cur = this.head;
    var i = 0;
    while (cur) { cur.ordinal = i++; cur = cur.next; }

    this.length = i;
}

Parametric.prototype.contains = function (obj) 
{
    return this[obj.id] != null;
}

Parametric.nextKey = 0;

Parametric.prototype.update = function (obj, t1, t2) 
{
    if (obj.id == undefined) obj.id = "pk" + Parametric.nextKey++;

    var store = this[obj.id];
    if (store == undefined) return this.insert(obj,t1,t2);
    
    store.obj = obj;
    store.t1 = t1;
    store.t2 = t2;
        
    if ((store.prev && t1 < store.prev.t1) || (store.next && t1 > store.next.t1)) 
    {
        // fast remove and re-insert
        this.length--;
        if (store == this.head) this.head = store.next;
        if (store.prev) store.prev.next = store.next;
        if (store.next) store.next.prev = store.prev;

        this.insert(obj,t1,t2);
    }

    return store;
}

Parametric.prototype.near = function (t1, hint) 
{
    var p = (hint ? hint : this.head);
    if (p == null) return null;

    while (p.next && t1 > p.next.t1) p = p.next;

    return p;
}

Parametric.prototype.at = function (t1, hint) 
{
    var p = (hint ? hint : this.head);
    if (p == null) return null;

    while (p.next && t1 > p.next.t1) p = p.next;

    if (this.closed && p.next == null) 
    {
        var t = (t1 - p.t1) / (head.t1 - p.t1);
        return p.obj.lerp(t, head.obj);
    }
    else
    {
        var t = (t1 - p.t1) / (p.next.t1 - p.t1);
        return p.obj.lerp(t, p.next.obj);
    }
}

/*
Parametric.prototype.from = function (t1, t2) {
    var i = 0, ret = [];
    while (i < this.length && t1 > this[i].t1) i++;
    while (i < this.length) {
        if (this[i].t2 && t2 <= this[i].t2) {
            ret.push(this[i].p); i++; 
        }
        else if (this[i].t1 <= t2) ret.push(this[i].p); i++
    }
    return ret;
}

Parametric.prototype.normalize = function () {
    var i;
    var max = 0;

    for (i = 0; i < this.length && this[0].t1 > 0; i++) {
        if (this[i].t2) this[i].t2 -= this[0].t1;
        this[i].t1 -= this[0].t1;
    }

    for (i = 0; i < this.length; i++) {
        if (this[i].t2 && this[i].t2 > max) max = this[i].t2;
        else if (this[i].t1 > max) max = this[i].t1;
    }

    for (i = 0; i < this.length; i++) {
        if (this[i].t2) this[i].t2 /= max;
        this[i].t1 /= max;
    }
}
*/

Parametric.prototype.IntersectRay = function(ray, seg)
{
    var thresh = 0.00000001;

    if (seg) // shortcut test to see if it's the same seg as last time
    {
        var result = ray.intersectLine(seg.obj, seg.next.obj, thresh);
        if (result) 
        {
            result.seg = seg;
            return result;
        }
    }
    // ideally, we'd go left and right from the previous seg first. But this is fine for now.

    var cur = this.head;
    while (cur && cur.next)
    {
        var result = ray.intersectLine(cur.obj, cur.next.obj, thresh);
        if (result) 
        {
            result.seg = cur;
            return result;
        }
        cur = cur.next;
    }

    return null;
}

Parametric.prototype.toString = function () {
    var ststart = "P: ";
    var p = this.head;
    
    while (p)
    {
       ststart += p.t1 + (p.t2 ? "," + p.t2 : "") + ":" + p.obj.toString() + ", ";
       p = p.next;
    }

    return ststart;
}
