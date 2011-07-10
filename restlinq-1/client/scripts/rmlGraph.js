
function MIN()
{
    var min = +1E+300;
    for (a in arguments) if (arguments[a] < min) min = arguments[a];
    return min;
}

function MAX()
{
    var max = -1E+300;
    for (a in arguments) if (arguments[a] > max) max = arguments[a];
    return max;
}

var debugStage = "";

var flickrLicenseList = 
        [
            { text: "All Rights Reserved" ,                         url:"" },
            { text: "Attribution-NonCommercial-ShareAlike License" ,url:"http://creativecommons.org/licenses/by-nc-sa/2.0/" },
            { text: "Attribution-NonCommercial License" ,           url:"http://creativecommons.org/licenses/by-nc/2.0/" },
            { text: "Attribution-NonCommercial-NoDerivs License" ,  url:"http://creativecommons.org/licenses/by-nc-nd/2.0/" },
            { text: "Attribution License" ,                         url:"http://creativecommons.org/licenses/by/2.0/" },
            { text: "Attribution-ShareAlike License" ,              url:"http://creativecommons.org/licenses/by-sa/2.0/" },
            { text: "Attribution-NoDerivs License" ,                url:"http://creativecommons.org/licenses/by-nd/2.0/" },
            { text: "No known copyright restrictions" ,             url:"http://www.flickr.com/commons/usage/" },
            { text: "United States Government Work" ,               url:"http://www.usa.gov/copyright.shtml" }
        ];


function Canvas(element) {
    this.element = element
    this.ctx = this.element.getContext("2d");

    this.view = { 
        pos: new Vector3(0, 0, 0),
        mouseWorldPos: new Vector3(0, 0, 0),
        screenPos: new Vector3(0, 0, 0),
        screenStart: new Vector3(0, 0, 0),
        deltaPos: new Vector3(0,0, 0),
        scrollPos: new Vector3(0,0, 0),
        scale: 1.0,
        width: 640,
        height: 480
    }

    this.drawSet = RML.byType["Restaurant"];

    this.fadeSpeed = 2.0;

    this.mouseRadius = 1; // anything other than zero means mouse-follow

    this.meta = 
    {
        width: 360,
        height: 75
    }

    this.entityUpdateEnergy = 0;

    this.images = { };
    this.objRadius = 10;

    this.ctx.globalCompositeOperation = "source-over";

    this.lineThresh = 10;

    this.drawPics = true;

    this.time = RML.GetTime();
    this.firstTime = this.time;

    this.moveStart = new Vector3(0, 0, 0);
    this.movingElement = null;
    this.tracingEntity = null;
    this.stickyMode = false;

    this.selectingSpan = null;
    this.selectingPano = null;

    this.visible = [];
    this.pictures = new Parametric();

    this.path = new Parametric();
    var w = element.width * 0.45;
    var h = element.height * 0.40;
    this.path.insert(new Vector3(-w,-h,0),0);
    this.path.insert(new Vector3(+w,-h,0),0.25);
    this.path.insert(new Vector3(+w,+h,0),0.5);
    this.path.insert(new Vector3(-w,+h,0),0.75);
    this.path.insert(new Vector3(-w,-h,0),1.0);
    this.path.order();
}

function makeDraggable(element) {

  /* Simple drag implementation */
  element.onmousedown = function(event) {

    document.onmousemove = function(event) {
      event = event || window.event;
      element.style.left = event.clientX + 'px';
      element.style.top = event.clientY + 'px';
    };

    document.onmouseup = function() {
      document.onmousemove = null;

      if(element.releaseCapture) { element.releaseCapture(); }
    };

    if(element.setCapture) { element.setCapture(); }
  };

  /* These 3 lines are helpful for the browser to not accidentally 
   * think the user is trying to "text select" the draggable object
   * when drag initiation happens on text nodes.
   * Unfortunately they also break draggability outside the window.
   */
  element.unselectable = "on";
  element.onselectstart = function(){return false};
  element.style.userSelect = element.style.MozUserSelect = "none";
}

Canvas.prototype.AddEvents = function (which) {
    var canvas = this;

    this.layout = which;

    this.element.unselectable = "on";
    this.element.onselectstart = function(){return false};
    this.element.style.userSelect = this.element.style.MozUserSelect = "none";

    //this.element.addEventListener("dblclick",  function (e) { onDoubleClick(canvas, e) }, false);
    //this.element.addEventListener("mousewheel",function (e) { onMouseWheel(canvas, e) }, false);
    //this.element.addEventListener("blur",      function (e) { onBlur(canvas, e) }, false);

    this.element.addEventListener("mousedown", function (e) { onMouseDown(canvas, e) }, false);
    this.element.addEventListener("mousemove", function (e) { onMouseMove(canvas, e) }, false);
}


Canvas.prototype.EventToWindow = function (e) 
{
    if (e.pageX != undefined && e.pageY != undefined) {
        return new Vector3(e.pageX - this.view.width * 0.5, e.pageY - this.view.height * 0.5, 0);
    }
    else {
        return new Vector3((e.clientX + document.body.scrollLeft + document.documentLinkable.scrollLeft) - this.view.width * 0.5,
            		       (e.clientY + document.body.scrollTop + document.documentLinkable.scrollTop) - this.view.height * 0.5,
                           0);
    }
}

Canvas.prototype.EventToWorld = function (e) 
{
    var screenPos = EventToWindow(e);
    var pos = new Vector3(screenPos.x - this.element.offsetLeft,
		                  this.view.height - (screenPos.y - this.element.offsetTop), 0);

    pos.x -= this.view.width * 0.5;
    pos.y -= this.view.height * 0.5;

    pos.x /= this.view.scale;
    pos.y /= this.view.scale;

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

    document.onmousemove = function(event) {
      event = event || window.event;
      onMouseMove(canvas, event);
    };

    document.onmouseup = function(event) {
        debugText.innerHTML = "mouse up";
        document.onmousemove = null;

        if (WhichButton(event) == 4 && canvas.movingElementMoved == false 
            && canvas.selectedElement && canvas.selectedElement._local)
        {
            if (canvas.selectedElement._local.animPending) 
            {
                delete canvas.selectedElement._local.animPending;
            }
            else
            {
                canvas.selectedElement._local.animPending = (canvas.selectedElement._local.lastPoll = RML.GetTime()); // start timer animation and guard for re-poll
                RML.GetNeighbors(canvas.selectedElement.id);
            }
        }

        if (canvas.movingElement && canvas.movingElementMoved)
        {
            RML.SetElementWorldPos(canvas.movingElement);
        }

        canvas.moving = false;
        canvas.movingElement = null;
        canvas.movingElementMoved = false;
        canvas.mouseButton = 0;

        if(canvas.element.releaseCapture) { canvas.element.releaseCapture(); }
    };

    if(canvas.element.setCapture) { canvas.element.setCapture(); }

    var pos = canvas.EventToWindow(e);
    canvas.mouseButton = WhichButton(e);

    if (canvas.mouseButton == 4) 
    {
        canvas.moveStart = new Vector3(pos.x, pos.y, pos.z);
        canvas.movingElement = canvas.selectedElement;
    }
}

function FindElements(objects, pos, radius)
{
    radius = radius * radius;

    var ret = new Parametric();

    try
    {
        var cur = objects.head;
        while (cur)
        {
            var obj = cur.obj;
            if (obj._local.screen) 
            {
                var dist = pos.distanceSquared(obj._local.screen); 
                if (dist < radius) ret.insert(obj, dist);
            }
            cur = cur.next;
        }
    }
    catch(err)
    {
        debugger;
    }
    return ret;
}

function computeMeta(canvas, info, local)
{
    var y = 0;
    var x = 0;

    canvas.ctx.font =  "12pt Calibri bold";

    if (info.user)   { x = MAX(x, canvas.ctx.measureText("User: " + info.user).width); y += 16; }
    if (info.author) { x = MAX(x, canvas.ctx.measureText("Name: " + info.author).width); y += 16; }
    if (info.title)  { x = MAX(x, canvas.ctx.measureText("Title: " + info.title).width); y += 16; }
    if (info.url)    { x = MAX(x, canvas.ctx.measureText("Url: "   + info.url).width); y += 16; }
    if (info.license != null){ x = MAX(x, canvas.ctx.measureText("License: "   + flickrLicenseList[info.license].text).width); y += 16; }

    var picPt = local.path;
    var newPt = new Vector2(0,0);
    var s = local.size;

    if (!picPt) return null;

    var meta = { width: x, height : y };

    var pts = [
        new Vector2(picPt.x - s - meta.width, picPt.y - s),
        new Vector2(picPt.x + s,              picPt.y - s),
        new Vector2(picPt.x - s, picPt.y - s - meta.height),
        new Vector2(picPt.x - s, picPt.y + s)
        ];

    var min = 100000000;

    for (s=0;s<4;s++) 
    {
        var dist = pts[s].distanceSquared(newPt);
        if (dist < min)
        {
            meta.pos = pts[s];
            min = dist;
        }
    }

    RML.needsDraw = true;

    return meta;
}

function FindPopup2D(objects, pos)
{
    var closestDist = 10000000;
    var closestObj = null;
    var cur = objects.head;
    while (cur)
    {
        var obj = cur.obj;
        var local = obj._local;
        if (local.path)
        {
            var dist = pos.distanceSquared(local.path);

            if (dist < (local.size*local.size) && dist < closestDist)
            {
                closestDist = dist;
                closestObj = obj;
            }
        }
        cur = cur.next;
    }
    return closestObj;
}

var globalSelected;

function onMouseMove(canvas, e) 
{
    var pos = canvas.EventToWindow(e);
    
    debugText.innerHTML = "mouse move at (" +  pos.x + "," + pos.y + ")";

    canvas.view.screenPos.x = (pos.x / canvas.view.width);
    canvas.view.screenPos.y = (pos.y / canvas.view.height);

    if (canvas.hoverTimer) clearTimeout(canvas.hoverTimer);

    try {
        if (canvas.mouseButton == 4 && canvas.movingElement)
        {
            //local.screen.x = (entity._local.coord.x - view.pos.x) * view.scale * view.width;
            //local.screen.y = (entity._local.coord.y - view.pos.y) * view.scale * view.width;

            var delta = new Vector2((pos.x - canvas.moveStart.x),(pos.y - canvas.moveStart.y));
            canvas.entityUpdateEnergy += delta.lengthSquared();

            delta.x /= (canvas.view.scale * canvas.view.width);
            delta.y /= (canvas.view.scale * canvas.view.width); // height?

            canvas.movingElement._local.coord.offsetSelf(delta); 
            var x = canvas.movingElement._local.coord.x;
            var y = canvas.movingElement._local.coord.y;

            canvas.movingElement.transform.worldPos.x = (x - 0.5) * 360;
            canvas.movingElement.transform.worldPos.y = 90 - 2 * Math.atan(Math.exp((y * 2 - 1) * Math.PI)) * (180 / Math.PI);

            canvas.moveStart = pos;
            canvas.movingElementMoved = true;

            canvas.movingElement.timestamp = RML.lastTimestamp + 2;

            if (canvas.entityUpdateEnergy > 2)  //42
            { 
                RML.SetElementWorldPos(canvas.movingElement);
                canvas.entityUpdateEnergy = 0;
            }
        }
        else if (canvas.pictures.length > 0)
        {
            map.tracker.setTracking(true);

            var newFound = FindPopup2D(canvas.pictures, pos);
            if (newFound)
            {
                canvas.selectedElement = newFound;

                if (canvas.meta) delete canvas.meta;
                canvas.hoverTimer = setTimeout(function() { canvas.meta = computeMeta(canvas, newFound.info, newFound._local ); }, 300 );

                map.tracker.setTracking(false);
                entityText.innerText = RML.Stringify(canvas.selectedElement);            
            }
            else if (canvas.drawSet)
            {
                newFound = FindElements(canvas.drawSet, pos, canvas.objectRadius);
                var front = canvas.drawSet.head.t1 - newFound.length * 0.001;
                newFound.order();

                var cur = newFound.head;
                while (cur)
                {
                    var obj = cur.obj;

                    canvas.drawSet.update(cur.obj, front + cur.ordinal * 0.001); // push these objects to the front of the list for next time

                    if (obj && obj._local.relations)
                    {
                        for (var id in obj._local.relations) 
                        {
                            var rel = obj._local.relations[id];
                            rel._local.animSpider = RML.GetTime(); // animate spider
                        }
                    }

                    cur = cur.next;
                }

                if (newFound.head)
                {
                    newFound = canvas.selectedElement = newFound.head.obj;
                    entityText.innerText = RML.Stringify(canvas.selectedElement);
                    if (canvas.meta) delete canvas.meta;
                    canvas.hoverTimer = setTimeout(function() { canvas.meta = computeMeta(canvas, newFound.info, newFound._local ); }, 300 );
                }
                else 
                {
                    canvas.selectedElement = null;
                    if (canvas.meta) delete canvas.meta;
                    map.tracker.setTracking(true);
                }
            }
        }
        globalDrawer.update();
    }
    catch (err) {
        debugger;
    }
}

var lay;

Canvas.prototype.Draw = function () {

    if (!this.element) return;

    this.path = new Parametric();
    var w = this.element.width * 0.45;
    var h = this.element.height * 0.40;
    this.path.insert(new Vector3(-w,-h,0),0);
    this.path.insert(new Vector3(+w,-h,0),0.25);
    this.path.insert(new Vector3(+w,+h,0),0.5);
    this.path.insert(new Vector3(-w,+h,0),0.75);
    this.path.insert(new Vector3(-w,-h,0),1.0);
    this.path.order();

    this.span = [];
    this.span[0] = { begin: this.path.at(0.05), end: this.path.at(0.2), offset: 0 };

    this.time = RML.GetTime();

    var ctx = this.ctx;
    var view = this.view;

    ctx.save();
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "rgb(255,128,128);";

    try
    {

    /* setup the view */

    ctx.translate(0.5 * this.element.width, 0.5 * this.element.height);

    if (!globalBounds) return;

    debugStage = "transform";

    var c = map.viewport.getCenter(true);
    var m = new Vector3();
    var s = map.viewport.getZoom(true);
    var invs = (s > 0 ? 0.6 / s : 1);
    var dx, dy;

    view.width  = this.element.width;
    view.height = this.element.height;

    if (this.mouseRadius > 0)
    {
        view.pos.x  = c.x;
        view.pos.y  = c.y;

        c.x += view.screenPos.x / s;
        c.y += view.screenPos.y * view.height / (s * view.width);

        dx = (c.x - view.mouseWorldPos.x) * s * view.width;
        dy = (c.y - view.mouseWorldPos.y) * s * view.width;

        view.mouseWorldPos.x = c.x;
        view.mouseWorldPos.y = c.y;

        invs *= 0.25;
    }
    else
    {
        dx = (c.x - view.pos.x) * s * view.width;
        dy = (c.y - view.pos.y) * s * view.width;
        view.pos.x  = c.x;
        view.pos.y  = c.y;
    }

    view.deltaPos = new Vector3(dx,dy,0);
    RML.viewMoveEnergy += view.deltaPos.lengthSquared();
    RML.viewMoveEnergy += (s - view.scale) * (s - view.scale);
    view.scale  = s;

    var sp1 = new Vector3(c.x - invs * 0.45, c.y + invs * 0.4, 0);
    var sp2 = new Vector3(c.x + invs * 0.45, c.y - invs * 0.4, 0);
    var p1 = NormalizedToMercator(sp1);
    var p2 = NormalizedToMercator(sp2);

    RML.viewBox = new Vector4(p1.x, p1.y, p2.x, p2.y);

    var radius = 8;
    this.objectRadius = radius;

    if (!this.drawSet) this.drawSet = RML.byType["Restaurant"];
    if (!this.drawSet) return;

    this.Layout(this.drawSet, view);

    debugText.innerHTML = " total: " + this.drawSet.length + " visible: " + this.visible.length + " pictured: " + this.pictures.length + 
        c + " energy: " + RML.viewMoveEnergy;

    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 3.0;
    var i = 0;

    // draw path
    debugStage = "drawPath";

    ctx.beginPath();
    var cur = this.path.head;
    if (cur) ctx.moveTo(cur.obj.x, cur.obj.y);
    while (cur)
    {
        ctx.lineTo(cur.obj.x, cur.obj.y);
        cur = cur.next;
    }
    ctx.stroke();

    // draw path
    debugStage = "drawBox";

    ctx.strokeStyle = "#e000e0";
    ctx.lineWidth = 2.0;

    sp1.x -= view.pos.x;
    sp1.y -= view.pos.y;
    sp2.x -= view.pos.x;
    sp2.y -= view.pos.y;

    sp1.multSelf( view.width * view.scale );
    sp2.multSelf( view.width * view.scale );

    ctx.beginPath();
    ctx.moveTo(sp1.x, sp1.y);
    ctx.lineTo(sp2.x, sp1.y);
    ctx.lineTo(sp2.x, sp2.y);
    ctx.lineTo(sp1.x, sp2.y);
    ctx.lineTo(sp1.x, sp1.y);
    ctx.stroke();

    var j;
    var r1 = radius;
    var r2 = radius * 1.25;
    var r3 = radius * 1.5;

    ctx.globalAlpha = 1.0;
    // draw the POI bg image

    if (RML.byType["View"]) cur = RML.byType["View"].head; else cur = null;
    while (cur)
    {
        debugStage = "draw box " + cur.obj.id;

        p1.x = (cur.obj._local.box.min.x - view.pos.x) * view.scale * view.width;
        p1.y = (cur.obj._local.box.min.y - view.pos.y) * view.scale * view.width;
        p2.x = (cur.obj._local.box.max.x - view.pos.x) * view.scale * view.width;
        p2.y = (cur.obj._local.box.max.y - view.pos.y) * view.scale * view.width;

        ctx.strokeStyle = cur.obj.info.color;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p1.x, p2.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();

        cur = cur.next;
    }

    // draw the POI bg image
    cur = this.drawSet.head;
    while (cur)
    {
        debugStage = "draw POIbg " + cur.obj.id;

        var local = cur.obj._local;
        var t = local.screen;

        ctx.globalAlpha = local.alpha;

        if (t) ctx.drawImage(poiBG, t.x - r2, t.y - r2, r2 * 2, r2 * 2);

        if (t && local.animRipple) 
        {
            var r = this.time - local.animRipple;
            if (r < 1)
            {
                ctx.globalAlpha = 1 - r;
                r += 0.25;
                r *= radius * 4;
                ctx.drawImage(ripple, t.x - r, t.y - r, r * 2, r * 2);
                RML.needsDraw = true;
            }
            else delete local.animRipple;
        }

        cur = cur.next;
    }

    // draw the POI fg image
    cur = this.drawSet.head;
    while (cur)
    {
        var obj   = cur.obj;
        var local = obj._local;
        var t     = local.screen;

        debugStage = "draw POIfg " + obj.id;

        cur = cur.next; // must do before potentially deleting obj

        ctx.globalAlpha = local.alpha;

        if (t) ctx.drawImage(poiFG, t.x - r1, t.y - r1, r1 * 2, r1 * 2);

        if (local.animPending)
        {
            ctx.save();
            ctx.translate(t.x,t.y);
            ctx.rotate((this.time - local.animPending) * 1.25); // speed
            ctx.drawImage(spinner,-r3,-r3, r3 * 2, r3 * 2);
            ctx.restore();

            RML.needsDraw = true;
        }
    }

    // draw spider relations

    ctx.save();
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.strokeStyle = "#FF2020";
    ctx.lineWidth = 4.0;

    debugStage = "Draw Spider";

    cur = RML.byType["Relation"].head;
    while (cur)
    {
        debugStage = "draw spider " + cur.obj.id;

        var rel = cur.obj;
        var src = RML.byId[rel.sources.id];
        if (src == this.selectedElement) rel._local.animSpider = this.time; // refresh the animation each frame if selected

        if (!src) { cur = cur.next; continue; }

        var s = src._local.screen; 

        var alpha = 1.0 - (this.time - rel._local.animSpider) * 1.1;
        if (alpha > 0 && src._local)
        {
            ctx.globalAlpha = alpha;
            ctx.shadowOffsetX = 2;        ctx.shadowOffsetY = 2;        ctx.shadowBlur = 2;
            ctx.beginPath();
            for (j = 0; j < rel.entities.length; j++)
            {
                var obj = RML.byId[rel.entities[j]];
                if (obj) 
                {
                    debugStage = "draw spider2 " + cur.obj.id;
                    t = obj._local.screen;  
                    ctx.moveTo(s.x, s.y);
                    ctx.lineTo(t.x, t.y);
                }
            }
            ctx.stroke();
            RML.needsDraw = true;
        }

        ctx.globalAlpha = 1.0;

        ctx.shadowOffsetX = 2;        ctx.shadowOffsetY = 2;        ctx.shadowBlur = 2;
        ctx.drawImage(poiBG, s.x - r2, s.y - r2, r2 * 2, r2 * 2);
        ctx.shadowOffsetX = 0;        ctx.shadowOffsetY = 0;        ctx.shadowBlur = 0;
        ctx.drawImage(poiActive, s.x - r2, s.y - r2, r2 * 2, r2 * 2);

        cur = cur.next;
    }
    ctx.restore();

    //draw the picture lines
    ctx.strokeStyle = "#808080";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    var cur = this.pictures.head;
    while (cur)
    {
        debugStage = "draw Pic lines " + cur.obj.id;

        var local = cur.obj._local;

        ctx.globalAlpha = local.alpha;

        var t = local.screen;
        if (local.size > 1 && t && local.path)
        {
            ctx.drawImage(poiActive, t.x - r1, t.y - r1, r1 * 2, r1 * 2);
            ctx.moveTo(t.x, t.y);            t = local.path;            
            ctx.lineTo(t.x, t.y);
        }
        cur = cur.next;
    }
    ctx.stroke();

    ctx.globalAlpha = 1;

    // draw the selected element, photo edging, black line, black dot
    if (this.selectedElement != null)
    {
        debugStage = "drawSelected";
        var local = this.selectedElement._local;
        var t = local.screen;          
        var r = radius + 2;            
        if (t)
        {
            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#000000";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(t.x, t.y);
            ctx.drawImage(poiActive, t.x - r, t.y - r, r * 2, r * 2);
            if (t = local.path)
            {
                r = local.size + 2;
                ctx.lineTo(t.x, t.y);
                ctx.fillRect(t.x - r, t.y - r, r * 2, r * 2);
            }
            ctx.stroke();
        }
    }

    ctx.globalAlpha = 1.0;

    // draw the photo thumbnails
    var cur = this.pictures.head;
    while (cur)
    {
        var local = cur.obj._local;
        var r = local.size;
        debugStage = "draw images " + cur.obj.id;
        if (r > 1 && local.screen && local.path)
        {
            try
            {
                if (!local.image && cur.obj.sources.length && cur.obj.sources[0]) 
                {
                    local.image = new global.Image();
                    if (cur.obj.sources[0].type == "CubeMap") 
                        local.image.src = cur.obj.sources[1].url;
                    else 
                        local.image.src = cur.obj.sources[0].url;

                    local.image.onload = function () { RML.needsDraw = true; }
                }
                var t = local.path;
                ctx.globalAlpha = local.alpha;
                ctx.drawImage(local.image, t.x - r, t.y - r, r * 2, r * 2);
            }
            catch (err)
            {
                if (cur.obj && cur.obj.sources && cur.obj.sources[0]) delete cur.obj.sources[0].url;
                if (local && local.image) local.image.src = "img/sphere.png";
            }
        }
        cur = cur.next;
    }

    debugStage = "draw meta";

    if (this.meta && this.meta.pos && this.selectedElement)
    {
        var t = this.meta.pos;
        var w = this.meta.width;
        var h = this.meta.height;

        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#000000";
        ctx.globalAlpha = 0.5;
        ctx.fillRect(t.x, t.y, w, h);
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(t.x -1,      t.y-1);
        ctx.lineTo(t.x + w+1,   t.y-1);
        ctx.lineTo(t.x + w+1,   t.y + h+1);
        ctx.lineTo(t.x-1,       t.y + h+1);
        ctx.lineTo(t.x-1,       t.y-1);
        ctx.stroke();
        ctx.fillStyle = "#FFFFFF";

        ctx.font = "12pt Calibri bold";
        
        var y = t.y + 12;
        var info = this.selectedElement.info;
        if (info.user)   { ctx.fillText("User: "  + info.user,   t.x+4, y, w-8); y += 16; }
        if (info.author) { ctx.fillText("Name: "  + info.author, t.x+4, y, w-8); y += 16; }
        if (info.title)  { ctx.fillText("Title: " + info.title,  t.x+4, y, w-8); y += 16; }
        if (info.url)    { ctx.fillText("Url: "   + info.url,    t.x+4, y, w-8); y += 16; }
        if (info.license != null){ ctx.fillText("License: " + flickrLicenseList[info.license].text, t.x+4, y, w-8); y += 16; }
    }

    ctx.restore();
    }
    catch (err)
    {
        ctx.restore();
        debugger;
    }
}


var layoutFrame = 0;

Canvas.prototype.Layout = function(objects , view)
{
    var w = this.element.width * 0.4;
    var h = this.element.height * 0.4;
    var w2 = this.element.width * 1.1;
    var h2 = this.element.height * 1.1;
    
    var processed = 0;
    var cumW = 0, newCentroid = new Vector3(0,0,0);

    if (!this.centroid) this.centroid = new Vector3(0,0,0);

    this.visible = [];

    if (this.selectedElement) 
    {
        this.visible.push(this.selectedElement);
    }

    var cur = objects.head;

    var max = 500;

    while (cur)
    {
        debugStage = "layout " + cur.obj.id;

        var entity = cur.obj;
        cur = cur.next; // do this here so we can delete entity if needed.

        if (entity.transform) // && entity.sources.length > 0 && entity.sources[0].type == "Image")
        {
            var local = entity._local;

            if (!local.screen) local.screen = new Vector3(0,0,0);

            local.screen.x = (entity._local.coord.x - view.pos.x) * view.scale * view.width;
            local.screen.y = (entity._local.coord.y - view.pos.y) * view.scale * view.width;

            if (this.visible.length < max && local.screen.x >= -w2 && local.screen.x <= +w2 && local.screen.y >= -h2 && local.screen.y <= +h2)
            {
                if (local.animFadeOut)
                {
                    local.alpha = 1 - (this.time - local.animFadeOut) * this.fadeSpeed;
                    if (local.alpha >= 0) RML.needsDraw = true;
                    else                  
                    {
                        RML.Remove(entity); // faded out, remove
                        this.pictures.remove(entity);
                        continue;
                    }
                }
                else if (local.animFadeIn)
                {
                    local.alpha = (this.time - local.animFadeIn) * this.fadeSpeed;
                    RML.needsDraw = true;
                    if (local.alpha > 1) 
                    {
                        local.alpha = 1;
                        delete local.animFadeIn; // stop the animation
                    }
                }

                if (local.screen.x >= -w && local.screen.x <= +w && local.screen.y >= -h && local.screen.y <= +h)
                {
                    var weight = local.alpha;
                    newCentroid.x += local.screen.x * weight;
                    newCentroid.y += local.screen.y * weight;
                    cumW += weight;

                    this.visible.push(entity);
                }
                else this.pictures.remove(entity);
            }
            else this.pictures.remove(entity);
        }
    }   
     
    var lastCentroid = this.centroid;

    if (cumW > 0) 
    {
        this.centroid = this.centroid.lerp(0.99, newCentroid.multiplyScalar(1.0/cumW));
    }

    if (this.centroid.distanceSquared(lastCentroid) > 0.001) RML.needsDraw = true;

    this.pictures = new Parametric();

    try
    {
        var i;
        for (i=0; i <this.visible.length && i < 200;i++)
        {
            var entity = this.visible[i];
            var local = entity._local;

            debugStage = "picture " + entity.id;

            if (local)
            {
                // these are in priority order, so taking the top N isn't bad
                if ((this.pictures.length < 30)) // && (entity instanceof RML.Photo))
                {
                    var dir = local.screen.subtract(this.centroid);
                    var len = dir.length();
                    if (len > 0.000001) local.path = local.screen.madd(dir, 100 * view.width / len); // project far enough out to hit the path
                    else                local.path = this.path.at(0);

                    var ray = new Ray(local.screen, local.path);
                    var result = this.path.IntersectRay(ray, local.seg);

                    if (result) 
                    {
                        local.path = result.closest;
                        local.seg  = result.seg;

                        var guessT = (result.param.y + result.seg.ordinal) / (this.path.length-1); // normalized 0 to 1 around the path
                        var store = this.pictures.update(entity, guessT);

                        var maxSize = 50 * 50;
                        var prevSpace = maxSize;
                        var nextSpace = maxSize;
                        var dist = local.path.distanceSquared(local.screen);

                        if (store.prev && store.prev.obj._local && store.prev.obj._local.path)
                        {
                            var prev = store.prev.obj._local;
                            prevSpace = local.path.distanceSquared(prev.path) - 2.5 * prev.size * prev.size;
                            if (prevSpace < 0) prevSpace = 0;
                        }

                        if (store.next && store.next.obj._local && store.next.obj._local.path)
                        {
                            var next = store.next.obj._local;
                            nextSpace = local.path.distanceSquared(next.path) - 2.5 * next.size * next.size;
                            if (nextSpace < 0) nextSpace = 0;
                        }

                        local.size = Math.sqrt(MIN(prevSpace, nextSpace, dist, maxSize));
                        if (local.size < 2) 
                        {
                            local.size = 0;
                            //delete local.path;
                            this.pictures.remove(entity);
                        }
                    }
                    else
                    {
                        local.size = 0;
                        this.pictures.remove(entity);
                    }
                }
            }
        }
    }
    catch (err)
    {
        debugger;
    }

}
/*
    var size = 75 * 0.5;
    var spacing = 100;
    var spacing2 = spacing * 0.5;

    this.view.scrollPos = this.view.scrollPos.add(this.view.deltaPos);
    while (this.view.scrollPos.x > spacing2)  this.view.scrollPos.x -= spacing;
    while (this.view.scrollPos.x < -spacing2) this.view.scrollPos.x += spacing;
    while (this.view.scrollPos.y > spacing2)  this.view.scrollPos.y -= spacing;
    while (this.view.scrollPos.y < -spacing2) this.view.scrollPos.y += spacing;

    this.AddSpan(this.pictures, this.path.at(0.0), this.path.at(0.25), this.view.scrollPos, size, spacing); // top
    this.AddSpan(this.pictures, this.path.at(0.25), this.path.at(0.5), this.view.scrollPos, size, spacing); // top
    this.AddSpan(this.pictures, this.path.at(0.5), this.path.at(0.75), this.view.scrollPos, size, spacing); // top
    this.AddSpan(this.pictures, this.path.at(0.75), this.path.at(1.0), this.view.scrollPos, size, spacing); // top
    
}

Canvas.prototype.AddSpan = function(pictures, p1, p2, offset, size, spacing)
{
    var diff = p2.subtract(p1);
    var dist = diff.length();
    var max = Math.floor(dist / spacing) - 1;

    diff.x *= spacing / dist;
    diff.y *= spacing / dist;

    p1 = p1.madd(diff, 1.5 -diff.dot(offset) / (spacing * spacing));

    for (var i=0; i < max && this.visible.length > 0; i++) 
    {
        var obj = this.visible.pop();
        obj._local.size = size;
        obj._local.path = p1;

        p1 = p1.add(diff);

        pictures.update(obj, 0);
    }
}
*/

