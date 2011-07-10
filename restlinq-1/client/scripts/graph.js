function RandomColor() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgba(" + r + "," + g + "," + b + ",0.75)";
}

Array.prototype.last = function (off) {
    if (arguments.length < 1) off = 1;
    if (this.length >= off) return this[this.length - off];
    return null;
}

function Parametric (p) {
    if (p && p instanceof Array) {
        var i;
        for (i = 0; i < p.length; i++) this.push(p[i]);
    }
}

Parametric.prototype = new Array();

Parametric.prototype.push = function (obj, t1, t2) {
    Array.prototype.push.call(this, null); // add an empty, we'll shift into it

    var i = this.length - 1;

    while (i > 0 && this[i - 1].t1 > t1) {
        this[i] = this[i - 1];
        i--;
    }
    this[i] = { p: obj, t1: t1, t2: t2 };
}

Parametric.prototype.at = function (t1) 
{
    var i = 0, j;

    while (i < this.length - 1 && t1 > this[i].t1) i++;

    if (i > 0 && this[i].p.lerp) {
        j = i - 1;
        while (this[j].t1 == this[i].t1 && j >= 0) j--;
        while (this[j].t1 == this[i].t1 && i < this.length) i++;
        var t = (t1 - this[j].t1) / (this[i].t1 - this[j].t1);
        return this[j].p.lerp(t, this[i].p);
    }
    return this[i].p;
}

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

Parametric.prototype.toString = function () {
    var string = "SA:";
    var i;
    for (i = 0; i < this.length; i++) {
        if (this[i].t2)
            string += this[i].t1 + "," + this[i].t2 + ":" + this[i].p.toString() + ", ";
        else
            string += this[i].t1 + ":" + this[i].p.toString() + ", ";
    }
    return string;
}

var ctx;
var canvas;

var internalID = -100;
function genID(id) {
    if (id) { return id; }
    return --internalID; 
}


function Linkable(id) {
    this.id = genID(id);
    this.links = { };
}

Linkable.prototype.ResetLinks = function () {
    this.links = {};
}

Linkable.prototype.RemoveLink = function (ptr) {
    delete this.links[ptr.id];
}

Linkable.prototype.RemoveBackLinks = function () {
    for (id in this.links) {
        this.links[id].p.RemoveLink(this); // remove any back links
    } 
}

Linkable.prototype.AddLink = function(ptr, t)
{
    this.links[ptr.id] = { p: ptr, t1: t };
}

Linkable.prototype.FindLink = function (ptr) {
    return this.links[ptr.id];
}

Linkable.prototype.LinksOfType = function(type)
{
    var ret = [];
    for (id in this.links)
    {
        if (this.links[id].p instanceof type) ret.push(this.links[id].p);
    }
    return ret;
}

function Node(pos, rad, id) {
    Linkable.prototype.constructor.call(this, id);

    this.pos = pos;
    this.blocks = {};
    this.ways = {};

    if (rad) this.radius = rad; else this.radius = 1;
}

Node.prototype = new Linkable();
Node.prototype.offset = function (d) {
    this.pos.offset(d);
}
Node.prototype.contains = function (pt, fac) {
    if (arguments.length == 1) fac = 1;

    var d = this.pos.distanceSquared(pt);
    var r = this.radius * this.radius;

    if (d < (r * fac * fac)) return true;
    return false;
}

function Way(nodes, id) {
    Linkable.prototype.constructor.call(this, id);

    this.nodes = nodes.slice(); // copy, don't share
    this.color = "rgba(128,32,32,0.2)";
    this.panos = {};
}

Way.prototype = new Linkable();

function PanoMap(node, id) {
    Linkable.prototype.constructor.call(this, id);
    this.node = node;
}
PanoMap.prototype = new Linkable();

function BlockMap(nodes, way, id) {
    Linkable.prototype.constructor.call(this, id);
    this.way   = way;
    this.nodes = new Parametric(nodes);
    this.perps = new Parametric();
    this.color = RandomColor();
}
BlockMap.prototype = new Linkable();

BlockMap.prototype.ComputeBlockMap = function (canvas) {

    try {
        var numNodes = this.nodes.length;
        var perps = new Array(numNodes);
        var wayLen = 0;
        var i;

        for (i = 1; i < numNodes; i++) {
            var p1 = this.nodes[i - 1].p.pos;
            var p2 = this.nodes[i].p.pos;
            wayLen += Math.sqrt(p2.distanceSquared(p1));
            this.nodes[i].t1 = wayLen;
            perps[i] = new Vector3(p2.y - p1.y, -(p2.x - p1.x), 0).normalize(); // perp 2D
        }
        perps[0] = perps[1];
        this.nodes.normalize();

        var s = 10;

        this.perps = new Parametric();

        var pos = this.nodes[0].p.pos, lastPos = pos;
        var p1 = pos.madd(perps[0], s), p2, p3;
        this.perps.push(p1, 0);
        var t1, t2, t3;

        var i;
        for (i = 1; i < numNodes - 1; i++) {
            pos = this.nodes[i].p.pos;
            p1 = pos.madd(perps[i], s);
            t1 = this.nodes[i].t1;
            p2 = pos.madd(perps[i + 1], s);

            var n = perps[i].add(perps[i + 1]);
            p3 = pos.madd(n, s / n.length());

            if (lastPos.distanceSquared(p2) > lastPos.distanceSquared(p1)) // inner vs. outer bend trick to avoid atan2's
            {
                this.perps.push(p1, t1);
                this.perps.push(p3, t1);
                this.perps.push(p2, t1);
            }
            else {
                this.perps.push(p3, t1);
            }
            lastPos = pos;
        }

        pos = this.nodes[numNodes - 1].p.pos;
        p1 = pos.madd(perps[numNodes - 1], s);
        this.perps.push(p1, 1);

        this.perps.normalize();
    }
    catch (err) { alert("computeBlockMaps " + err); }
}

function Canvas(name) {
    this.canvas = document.getElementById(name);
    this.ctx = this.canvas.getContext("2d");


    this.view = { pos: new Vector3(0, 0, 0),
        screenPos: new Vector3(0, 0, 0),
        screenStart: new Vector3(0, 0, 0),
        scale: 1
    }
    this.lineThresh = 10;

    this.editOSM = false;
    this.editPanos = false;
    this.autoBlocks = true;
    this.autoPanos = true;

    this.moveStart = new Vector3(0, 0, 0);
    this.movingNode = null;
    this.tracingNode = null;
    this.stickyMode = false;

    this.selectingSpan = null;
    this.selectingPano = null;

    this.nodes = {};
    this.ways = {};
    this.blocks = {};
    this.panos = {};
    this.tracingPath = [];

    this.Draw();
}

Canvas.prototype.FindPanoMaps = function (pos, rad, way) {
    // dumb linear search for now

    var ret = [];
    var i;
    rad *= rad;

    if (way) {
        var nearWays = {};
        nearWays[way.id] = way;
        var last = way.nodes.length - 1;
        for (id in way.nodes[0].ways) {
            nearWays[id] = way.nodes[0].ways[id];
        }
        for (id in way.nodes[last].ways) {
            nearWays[id] = way.nodes[last].ways[id];
        }
        for (id in nearWays) {
            way = nearWays[id];
            for (i = 0; i < way.panos; i++) {
                var pano = way.panos[id];
                if (pano.node.pos.distanceSquared(pos) < rad) ret.push(pano);
            }
        }
    }
    else for (id in this.panos) {
        var pano = canvas.panos[id];
        if (pano.node.pos.distanceSquared(pos) < rad) ret.push(pano);
    }
    return ret;
}

Canvas.prototype.Remove = function (p) {

    p.RemoveBackLinks();

    if (p instanceof PanoMap) delete canvas.panos[p.id];
    else if (p instanceof BlockMap) delete canvas.blocks[p.id];
}

Canvas.prototype.AddNode = function (pos, id) {

    var node = this.nodes[id];
    if (!node) {
        node = new Node(pos, 8, id);
        this.nodes[node.id] = node;
    }
    else node.pos = pos;

    //node.blocks = {};
    //node.ways = {};

    return node;
}

Canvas.prototype.AddWay = function (nodes, id) {

    var way = this.ways[id];

    if (!way) {
        way = new Way(nodes, id);
        this.ways[way.id] = way;
    }

    var i; // add pointers from nodes to this way
    for (i = 0; i < nodes.length; i++) nodes[i].ways[way.id] = way;

    return way;
}

Canvas.prototype.DeletePanoMaps = function (way) {
    for (id in way.panos) {
        delete this.panos[id];
    }
}

Canvas.prototype.ComputePanoMaps = function (way) {
    var t = 0;
    var i, j;
    var segStart = 0;

    try {
        for (i = 1; i < way.nodes.length; i++) {

            p1 = way.nodes[i - 1].pos;
            p2 = way.nodes[i].pos;

            var diff = p2.subtract(p1);
            var segLen = diff.length();

            diff = diff.mult(1 / segLen); // normalize;

            var step = 20; // fix units
            var rad1 = 30;
            var rad2 = 10 * 10;

            while (t < segLen) {
                var skip = false;
                var pos = p1.madd(diff, t);

                var closePanos = this.FindPanoMaps(pos, rad1);
                var pano, j;
                for (j = 0; j < closePanos.length && !skip; j++) {
                    if (pos.distanceSquared(closePanos[j].node.pos) < rad2) skip = true;
                }

                if (!skip) {
                    pano = this.AddPanoMap(pos);
                    way.panos[pano.id] = pano;
                    for (j = 0; j < closePanos.length && !skip; j++) {
                        pano.AddLink(closePanos[j], 0);
                    }
                }

                t += step;
            }
            t -= segLen;
            segStart += segLen;
        }
    }
    catch (err) {
        alert("computepanomaps " + err);
    }
}

Canvas.prototype.AddPanoMap = function (pos) {
    var node = new Node(pos, 6);
    var map = new PanoMap(node);
    this.panos[map.id] = map;
    return map;
}

Canvas.prototype.AddBlockMap = function (nodes, way, id) {

    var block = this.blocks[id];

    if (!block) {
        block = new BlockMap(nodes, way, id);
        this.blocks[block.id] = block;
    }

    var i;
    for (i = 0; i < nodes.length; i++) {
        this.nodes[nodes[i].id].blocks[block.id] = block;
    }

    block.ComputeBlockMap(this);

    return block;
}


Canvas.prototype.Draw = function () {

    this.ctx.scale(1, 1);
    this.ctx.translate(0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();

    /* setup the view */

    this.ctx.scale(this.view.scale, this.view.scale);
    this.ctx.translate(this.view.pos.x, this.view.pos.y);

    var f = this.selectingNodeAmt;

    /* Draw the blocks */

    try {
        for (id in this.blocks) {
            var block = this.blocks[id];
            this.ctx.strokeStyle = block.color;
            this.ctx.lineWidth = 5;

            if (block.perps.length) {
                var pos = block.perps[0].p;

                this.ctx.beginPath();
                this.ctx.moveTo(pos.x, pos.y);

                for (var j = 0; j < block.perps.length; j++) {
                    pos = block.perps[j].p;
                    this.ctx.lineTo(pos.x, pos.y);
                }
                this.ctx.stroke();
            }

            this.ctx.lineWidth = 1;

            for (id in block.links) {
                var ref = block.links[id].p;
                if (ref instanceof PanoMap) {
                    var pos = block.perps.at(block.links[id].t1);
                    this.ctx.beginPath();
                    this.ctx.moveTo(pos.x, pos.y);
                    this.ctx.lineTo(ref.pos.x, ref.pos.y);
                    this.ctx.stroke();
                }
            }
        }
    } catch (err) { alert("DrawBlockMaps " + err); }

    /* Draw the panos */

    try {
        this.ctx.strokeStyle = "rgba(128,128,128,0.5);";

        for (id in this.panos) {
            var pano = this.panos[id];
            if (!this.editOSM) {
                for (id in pano.links) {
                    var ref = pano.links[id].p;
                    if (ref instanceof PanoMap) {
                        var pos = pano.node.pos;
                        this.ctx.beginPath();
                        this.ctx.moveTo(pos.x, pos.y);
                        this.ctx.lineTo(ref.node.pos.x, ref.node.pos.y);
                        this.ctx.stroke();
                    }
                }
            }
        }
        for (id in this.panos) {
            var pano = this.panos[id];
            var node = pano.node;
            this.ctx.drawImage(bubbleImage, node.pos.x - node.radius, node.pos.y - node.radius, node.radius * 2, node.radius * 2);
        }
    } catch (err) { alert("DrawPanoMaps " + err); }

    /* Draw the selected node boundary */

    if (this.selectingNode && !this.movingNode) {
        var node = this.selectingNode;
        this.ctx.fillStyle = "rgb(128,128,255);";
        this.ctx.fillRect(node.pos.x - node.radius * (2.5 + f), node.pos.y - node.radius * (2.5 + f), node.radius * (5 + f * 2), node.radius * (5 + f * 2));
        this.ctx.fillStyle = "rgb(255,255,255);";
        this.ctx.fillRect(node.pos.x - node.radius * (1.5 + f), node.pos.y - node.radius * (1.5 + f), node.radius * (3 + f * 2), node.radius * (3 + f * 2));
    }

    /* Draw the current path, if any, that is being added */

    if (this.tracingNode) {
        var node = this.tracingNode;

        this.ctx.beginPath();
        this.ctx.strokeStyle = "rgb(0,0,0)";
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(node.pos.x, node.pos.y);
        for (var j = 1; j < canvas.tracingPath.length; j++) {
            this.ctx.lineTo(canvas.tracingPath[j].pos.x, canvas.tracingPath[j].pos.y);
        }
        this.ctx.lineTo(canvas.moveStart.x, canvas.moveStart.y);
        this.ctx.stroke();

        this.ctx.fillStyle = "rgb(255,255,0);";
        this.ctx.fillRect(node.pos.x - node.radius * 2, node.pos.y - node.radius * 2, node.radius * 4, node.radius * 4);
    }

    /* Draw the selected node under motion */

    if (this.movingNode) {
        var node = this.movingNode;
        var radius = node.radius;
        var pos = node.pos;
        f = 0;
        this.ctx.fillStyle = "rgb(0,255,0);";
        this.ctx.fillRect(pos.x - radius * (1.5 + f), pos.y - radius * (1.5 + f),
		          radius * (3 + f * 2), radius * (3 + f * 2));
    }

    if (this.editOSM) {

        /* Draw the ways */

        try {
            for (id in this.ways) {
                var way = this.ways[id];
                if (way.nodes.length > 0) {
                    var pos = way.nodes[0].pos;

                    this.ctx.beginPath();
                    this.ctx.strokeStyle = way.color;
                    this.ctx.lineWidth = 8;
                    this.ctx.moveTo(pos.x, pos.y);

                    for (var j = 1; j < way.nodes.length; j++) {
                        pos = way.nodes[j].pos;
                        this.ctx.lineTo(pos.x, pos.y);
                    }
                    this.ctx.stroke();
                }
            }
        } catch (err) { alert("DrawWays " + err); }

        /* Draw the nodes */

        try {
            for (id in this.nodes) {
                var node = this.nodes[id];
                this.ctx.fillStyle = node.color;
                var r = node.radius;

                //        this.ctx.fillRect(node.pos.x - node.radius, node.pos.y - node.radius, node.radius * 2, node.radius * 2);
                this.ctx.drawImage(sphereImage, node.pos.x - r, node.pos.y - r, r * 2, r * 2);
            }
        } catch (err) { alert("DrawNodes " + err); }

    } // editOSM

    /* Draw the highlighted ways and the single closest span */

    if (this.selectingSpan && !this.movingNode) {

        var block = this.selectingSpan.block;
        var index = this.selectingSpan.index;
        var p1 = block.perps[index - 1].p;
        var p2 = block.perps[index].p;

        var pos = block.perps[0].p;

        this.ctx.strokeStyle = "rgba(200,200,200,0.5)";
        this.ctx.beginPath();
        this.ctx.lineWidth = 8;
        this.ctx.moveTo(pos.x, pos.y);

        for (var j = 1; j < block.perps.length; j++) {
            pos = block.perps[j].p;
            this.ctx.lineTo(pos.x, pos.y);
        }
        this.ctx.stroke();

        pos = p2.subtract(p1);
        pos = p1.madd(pos, this.selectingSpan.t);
        var r = 6; // position size
        this.ctx.drawImage(sphereImage, pos.x - r, pos.y - r, r * 2, r * 2);
    }

    if (this.selectingPano && !this.movingNode) {
        var pos = this.selectingPano.pos;
        var r = 6; // position size
        this.ctx.drawImage(sphereImage, pos.x - r, pos.y - r, r * 2, r * 2);
    }

    this.ctx.restore();
}

GetScreenPos = function (e) {
    if (e.pageX != undefined && e.pageY != undefined) {
        return new Vector3(e.pageX, e.pageY,0);
    }
    else {
        return new Vector3(e.clientX + document.body.scrollLeft + document.documentLinkable.scrollLeft,
		      e.clientY + document.body.scrollTop + document.documentLinkable.scrollTop,0);
    }
}

Canvas.prototype.ScreenEventToWorldPos = function (e) {
    this.view.screenPos = GetScreenPos(e);

    var pos = new Vector3(this.view.screenPos.x - this.canvas.offsetLeft,
		                  this.view.screenPos.y - this.canvas.offsetTop, 0);

    pos.mult(1.0 / this.view.scale);

    pos.x -= this.view.pos.x;
    pos.y -= this.view.pos.y;
    pos.z -= this.view.pos.z;

    return pos;
}

function WhichButton(event) {
    if (event.which) {
        switch (event.which) {
            case 0: return 0;
            case 1: return 1;
            case 2: return 2;
            case 3: return 4;
        }
    }
    
    return event.button;
}

function onMouseDown(canvas, e) {
    var pos = canvas.ScreenEventToWorldPos(e);

    canvas.mouseButton = WhichButton(e);

    if (canvas.mouseButton == 1) {
        canvas.moveStart = new Vector3(pos.x, pos.y, pos.z);
        canvas.moving = (canvas.selectingNode == null || canvas.movingNode)

        if (canvas.editOSM && !canvas.moving && !canvas.tracingNode) {
            if (canvas.selectingNode) {
                canvas.tracingNode = canvas.selectingNode;
                canvas.tracingPath = [canvas.tracingNode];
            }
        }
        else if (canvas.editOSM && canvas.tracingNode && !canvas.selectingNode) {
            var node = canvas.AddNode(pos);
            canvas.selectingNode = node;
            canvas.movingNode = node;
        }
        canvas.Draw();
    }
    else if (canvas.mouseButton == 4) {
        canvas.view.zoomCenter = pos;
        canvas.view.screenStart = canvas.view.screenPos;
    }
}

function onMouseUp(canvas, e) {
    var pos = canvas.ScreenEventToWorldPos(e);

    if (canvas.tracingNode && canvas.selectingNode) {
        canvas.tracingPath.push(canvas.selectingNode);

        if (canvas.selectingNode == canvas.tracingPath[0]) {
            canvas.AddPath(canvas.tracingPath);
            canvas.tracingNode = null;
            canvas.Draw();
            SetGraph();
        }
    }

    canvas.moving = false;
    canvas.movingNode = null;
    canvas.mouseButton = 0;


}

function onMouseMove(canvas, e) {
    var pos = canvas.ScreenEventToWorldPos(e);

    try {
        if (canvas.mouseButton == 4) {
            var f = (canvas.view.screenPos.y - canvas.view.screenStart.y) * 0.01;
            canvas.view.screenStart = canvas.view.screenPos;

            canvas.view.scale *= Math.pow(2, f);
            if (canvas.view.scale < 0.1) canvas.view.scale = 0.1;
            if (canvas.view.scale > 10) canvas.view.scale = 10;

            canvas.moveStart = pos;
            pos = canvas.ScreenEventToWorldPos(e); // need coords again in moved frame
            var delta = pos.subtract(canvas.moveStart);
            canvas.moveStart = pos;
            canvas.view.pos.offset(delta);

            canvas.Draw();
            return;
        }

        if (canvas.moving) {
            if (canvas.movingNode) {
                canvas.movingNode.offset(pos.subtract(canvas.moveStart));

                for (id in canvas.movingNode.blocks) {
                    var block = canvas.blocks[id];
                    if (canvas.autoPanos && block && block.way) {
                        canvas.DeletePanoMaps(block.way);
                        canvas.ComputePanoMaps(block.way);
                    }
                    if (block) block.ComputeBlockMap(canvas);
                    else alert("missing block");
                }
            }
            else if (!canvas.selectingNode) {
                canvas.view.pos.offset(pos.subtract(canvas.moveStart));
                pos = canvas.ScreenEventToWorldPos(e); // need coords again in moved frame
            }
        }
        else {
            if (canvas.editOSM) {
                var closestNode = null;
                var closestDist2 = canvas.lineThresh; // distance2 in terms of a given node radius

                for (id in canvas.nodes) {
                    var node = canvas.nodes[id];
                    var distanceSquared = node.pos.distanceSquared(pos) / (node.radius * node.radius);
                    if (distanceSquared < closestDist2) {
                        closestNode = node;
                        closestDist2 = distanceSquared;
                    }
                }
                canvas.selectingNode = closestNode;
                canvas.selectingNodeAmt = (closestDist2 / canvas.lineThresh) - 0.5;

                if (closestNode && canvas.tracingNode) {
                    pos = canvas.selectingNode.pos;

                    if (canvas.mouseButton & 1) {
                        if (canvas.selectingNode == canvas.tracingPath.last(2)) {
                            canvas.tracingPath.pop();
                            canvas.tracingPath.pop();
                        }
                        else if (canvas.selectingNode != canvas.tracingPath.last(1)) {
                            canvas.tracingPath.push(canvas.selectingNode);
                        }
                    }
                }
                else if (closestNode && closestDist2 < 1.2) {
                    canvas.movingNode = canvas.selectingNode;
                }
                else canvas.movingNode = null;

            }

            // no closest node, so let's check the edges

            var ray = new Ray(pos, new Vector3(0, 0, 1));
            var result = new HitResult();
            var closestDist2 = canvas.lineThresh;

            canvas.selectingSpan = null;
            canvas.selectingPano = null;

            for (id in canvas.blocks) {
                var block = canvas.blocks[id];
                var i; 

                for (i = 1; i < block.perps.length; i++) {
                    var p1 = block.perps[i - 1].p;
                    var p2 = block.perps[i].p;
                    if (ray.intersectLine(result, p1, p2, canvas.lineThresh)) {
                        canvas.selectingSpan = { block: block, index: i, t: result.param.y, local: result.local, distance: result.distance };
                        document.getElementById("dist").innerHTML = "local = " + result.local;
                        closestDist2 = result.distance * result.distance;
                    }
                }
            }

            try {
                for (id in canvas.panos) {
                    var pano = canvas.panos[id];
                    var dir = pano.node.pos.subtract(pos);
                    var distanceSquared = dir.lengthSquared();
                    if (distanceSquared < closestDist2) {
                        canvas.selectingPano = { pano: pano, pos: pano.node.pos }
                        closestDist2 = distanceSquared;
                    }
                }
            }
            catch (err) {
                alert("mousePano " + err);
            }
            if (canvas.selectingPano) canvas.selectingSpan = null;

        }

        canvas.moveStart = pos;
        canvas.Draw();
    }
    catch (err) {
        alert(err);
    }
}

function onDoubleClick(canvas, e) {
    var pos = canvas.ScreenEventToWorldPos(e);

    if (canvas.editPanos && e.which == 1) {
        var pano = canvas.AddPanoMap(pos);
        canvas.selectingPano = pano;
    }
    else if (canvas.editOSM && e.which == 1) {
        if (canvas.tracingNode && canvas.tracingPath.length > 0) {
            canvas.AddPath(canvas.tracingPath);
            canvas.tracingNode = null;
            
            SetGraph();
        }
        else {
            var node = canvas.AddNode(pos);
            canvas.selectingNode = node;
            canvas.tracingNode = node;
            canvas.tracingPath = [node];
        }

        canvas.Draw();
    }

    document.getElementById("graphtext").selectionStart = 0;
    document.getElementById("graphtext").selectionEnd = 0;

}

function onMouseWheel(canvas, e) {
    var fac = 1;
    if (e.detail) fac = (e.detail);
    else fac = (e.wheelDelta / 120);

}

function onBlur(canvas, e) {
    canvas.mouseButton = 0;
}

Canvas.prototype.addEvents = function () {
    var canvas = this;
    this.canvas.addEventListener("mousedown", function (e) { onMouseDown(canvas, e) }, false);
    this.canvas.addEventListener("blur", function (e) { onBlur(canvas, e) }, false);
    this.canvas.addEventListener("mouseup", function (e) { onMouseUp(canvas, e) }, false);
    this.canvas.addEventListener("mousemove", function (e) { onMouseMove(canvas, e) }, false);
    this.canvas.addEventListener("dblclick", function (e) { onDoubleClick(canvas, e) }, false);
    this.canvas.addEventListener("mousewheel", function (e) { onMouseWheel(canvas, e) }, false);
}

function onsuccess(s, e) {
    alert(e);
}

function onerror(s, e) {
    alert("error " + e);
}

function receive(data) {
    try {
        var graph;
        if (data.graphStr) graph = eval(data.graphStr);
        else graph = data;

        var string = JSON.stringify(graph);
        var gt = document.getElementById("graphtext");
        gt.innerHTML = string;

        var i;
        for (i = 0; i < graph.Nodes.length; ++i) {
            var Node = graph.Nodes[i];
            var pos = new Vector3(Node.pos[0], Node.pos[1], Node.pos[2]);
            if (!pos.z) pos.z = 0;
            canvas.AddNode(pos, Node.RMLID);
        }

        for (i = 0; i < graph.Ways.length; ++i) {
            var Way = graph.Ways[i];
            var nodes = [];
            for (var j = 0; j < Way.nodes.length; j++) // convert IDs to pointers
            {
                var node = canvas.nodes[Way.nodes[j]];
                nodes.push(node); // remove redundant ones
            }

            canvas.AddPath(nodes, Way.RMLID);
        }

        canvas.Draw();
    }
    catch (err) {
        alert("receive " + err);
    }
}

function GetGraph() {

     $.ajax({
         type: "GET",
         url: "getGraph.rml",
         data: "",
         contentType: "application/json; charset=utf-8",
         dataType: "json",
         success: receive,
         error: function (err) {
             alert("failed" + err.responseText);
         }
        });
}

 function SetGraph() {

     var string = canvas.stringify();

     $.ajax({
         type: "POST",
         url: "setGraph.rml",
         data: string,
         contentType: "application/json; charset=utf-8",
         dataType: "json",
         success: function (data) {
             alert("okay");
         },
         error: function (err) {
             alert("failed" + err.responseText);
         }
     });
}

function SetElement(which, obj) {

    var string = JSON.stringify(obj);

    $.ajax({
        type: "POST",
        url: "set" + which + ".rml",
        data: string,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            alert("okay");
        },
        error: function (err) {
            alert("failed" + err.responseText);
        }
    });
}

Canvas.prototype.stringify = function () {
    var g = { Nodes: [], Ways: [] };

    for (id in canvas.nodes) {
        var node = canvas.nodes[id];
        var ids = [];
        var i;
        for (id in node.ways) ids.push(node.ways[id].id);
        g.Nodes.push({ RMLID: node.id, pos: [node.pos.x, node.pos.y, node.pos.z], ways: ids });
    }

    for (id in canvas.ways) {
        var way = canvas.ways[id];
        var ids = [];
        var i;
        for (i = 0; i < way.nodes.length; i++) ids.push(way.nodes[i].id);
        g.Ways.push({ RMLID: way.id, nodes: ids });
    }

    var string = JSON.stringify(g);
    var gt = document.getElementById("graphtext");
    gt.innerHTML = string;

    return string;

}

Canvas.prototype.DeleteBlockMaps = function (way) {
    for (id in this.blocks) {
        if (this.blocks[id].way.id == way.id) {
            var i;
            for (i = 0; i < way.nodes.length; i++) {
                delete way.nodes[i].blocks[id];
            }
            delete this.blocks[id];
        }
    }
}

Canvas.prototype.AddPath = function (path, id) {

    var way = this.AddWay(path, id);

    if (this.autoPanos) {
        this.DeletePanoMaps(way);
        this.ComputePanoMaps(way);
    }

    if (this.autoBlocks) {
        this.DeleteBlockMaps(way);
        this.AddBlockMap(path, way);
        this.AddBlockMap(path.reverse(), way);
    }
    canvas.stringify();
}

function reset() {
    canvas.nodes = {};
    canvas.ways = {};
    canvas.blocks = {};
    canvas.panos = {};

    canvas.Draw();

    canvas.stringify();
}

function editOSM(e) {
    canvas.editOSM = e.srcElement.checked;
    canvas.Draw();
}

function editPanos(e) {
    canvas.editPanos = e.srcElement.checked;
    canvas.Draw();
}

function autoPanos(e) {
    canvas.autoPanos = e.srcElement.checked;
    canvas.Draw();
}

function autoBlocks(e) {
    canvas.autoBlocks = e.srcElement.checked;
    canvas.Draw();
}

function include(destination) {
    var e = window.document.createLinkable('script');
    e.setAttribute('src', destination);
    window.document.body.appendChild(e);
}

var sphereImage;
var sphereImage;

var p;

function testParametric() {

    p = new Parametric();
    p.push(new Vector3(4, 4, 4), 0.4, 0.5);
    p.push(new Vector3(3, 3, 3), 0.3, 0.4);
    p.push(new Vector3(1, 1, 1), 0.1, 0.2);
    p.push(new Vector3(2, 2, 2), 0.2, 0.3);
    p.push(new Vector3(5, 5, 5), 0.5);
    p.push(new Vector3(105, 105, 105), 1.0);

    p.normalize();

    document.getElementById("graphtext").innerHTML = p.toString() + "\r";
    document.getElementById("graphtext").innerHTML += "0.0:" + p.at(0.0).toString() + "\r";
    document.getElementById("graphtext").innerHTML += "0.1:" + p.at(0.1).toString() + "\r";
    document.getElementById("graphtext").innerHTML += "0.2:" + p.at(0.2).toString() + "\r";
    document.getElementById("graphtext").innerHTML += "0.3:" + p.at(0.3).toString() + "\r";
    document.getElementById("graphtext").innerHTML += "0.4:" + p.at(0.4).toString() + "\r";
    document.getElementById("graphtext").innerHTML += "1.0:" + p.at(1.0).toString() + "\r";
    document.getElementById("graphtext").innerHTML += "0.75:" + p.at(0.75).toString() + "\r";
    document.getElementById("graphtext").innerHTML += "0.275:" + p.at(0.275).toString() + "\r";
    document.getElementById("graphtext").innerHTML += "0.375:" + p.at(0.375).toString() + "\r";

    document.getElementById("graphtext").innerHTML += "0.1<->0.4:" + p.from(0.1, 0.4).toString() + "\r";
    document.getElementById("graphtext").innerHTML += "0.3<->0.3:" + p.from(0.3, 0.3).toString() + "\r";

    var vectors = p.filter(function (x) { return (x.p instanceof Vector3); });

    document.getElementById("graphtext").innerHTML += "vectors:" + vectors.toString() + "\r";

}


$(document).ready(function () {

    testParametric(); return;

    canvas = new Canvas("graph");
    canvas.addEvents();

    sphereImage = document.getElementById("sphereImage");
    bubbleImage = document.getElementById("bubbleImage");

    $('#graphtext').focus();
    $('#getGraph').click(GetGraph);
    $('#setGraph').click(SetGraph);
    $('#resetGraph').click(reset);
    $('#editOSM').click(editOSM);
    $('#editPanos').click(editPanos);
    $('#autoBlocks').click(autoBlocks);
    $('#autoPanos').click(autoPanos);

    //GetGraph();

});

function hello()
{
    return "there";
}
