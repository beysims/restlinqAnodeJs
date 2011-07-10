
Array.prototype.last = function (off) {
    if (arguments.length < 1) off = 1;
    if (this.length >= off) return this[this.length - off];
    return null;
}

function Reference(obj)
{
    var ret;

    if (typeof(obj) == 'number')
    {
        ret = RML.byId[obj];
        if (ret) return ret;
    }
    else if (typeof(obj) == 'string') 
    {
        if (obj.indexOf("#") == 0)
        {
            ret = RML.byName[obj];
            if (ret) return ret;
        }
    }
    return obj;
}

function clone(obj){
    if(obj == null || typeof(obj) != 'object' || typeof(obj) != 'string')
        return obj;

    var temp = new obj.constructor();

    for(var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}

var global = this;

function Construct(obj, t, args)
{
    var _contract = Contract[t];

    if (_contract.$_inherit) Construct(obj, _contract.$_inherit, args); // better to cache these at least

    if (args) for (var memb in args)           // copy constructor for whatever is provided
    {
        var t = _contract[memb];
        if (t && typeof(t) == 'function' && t != String) obj[memb] = new t(args[memb]); // construct with local type. string is weird
        else obj[memb] = clone(args[memb]); // otherwise just deep copy the arg object as is
    }

    if (_contract.$_require) for (i = 0;i < _contract.$_require.length;i++)
    {
        memb = _contract.$_require[i];
        if (obj[memb] == null) // take this _contract entry if obj is not already defined above, TODO: check types of provided items
        {
            var t = _contract[memb];
            if (typeof(t) == 'function' && t != String) 
            {
                if (t) obj[memb] = new t(); // contract functions are assumed to be constructors
                else if (RML.t) obj[memb] = new RML.t(); // contract functions are assumed to be constructors
            }
            else obj[memb] = clone(t);
        }
    }

    if (_contract.init) _contract.init.call(obj, args);

    return obj;
}

function ObjectStore()
{
    this.byName = { };
    this.byId = { };
    this.byType = { Photo: new Parametric(), Relation: new Parametric() };
    this.needsDraw = true;
    this.seq = 0;
    this.serverTimestamp = 0;
    this.optimum = 500;
        
    this.viewBox = new Vector4(-180,-90,180,90);
    this.viewMoveEnergy = 0;
    this.serverContext = null;
    this._localID = 0;
}

ObjectStore.prototype.StartServices = function()
{
    //RML.GetElements(this.optimum); // once
    //this.bgFetch = setInterval("RML.GetElements(" + this.optimum + ")",1000);
    //RML.GetStream();

    this.bgDraw  = setInterval("RML.DrawCheck()", 33);
}

ObjectStore.prototype.StopServices = function()
{
    clearInterval(this.bgDraw);
    clearInterval(this.bgFetch);
}

ObjectStore.prototype.GetTime = function()
{
    return (new Date()).getTime() / 1000.0;
}

ObjectStore.prototype.LocalID = function()
{
    return --this._localID;
}

ObjectStore.prototype.Add = function(obj)
{
    if (!this.firstTimestamp) this.firstTimestamp = obj.timestamp;

   var isNew = (this.byId[obj.id] == null);

   if (isNew)  // new object
    {
        obj._local = { priotity: 1 - obj.priority, size: 1, animFadeIn: this.GetTime() };
    }
    else // updated object
    {
        obj._local = this.byId[obj.id]._local;
        obj._local.priotity = 1 - obj.priority;
        if (!obj._local.animRipple) obj._local.animRipple = this.GetTime();
    }

    if (obj.id)   this.byId  [obj.id] = obj;
    var typeSet = this.byType[obj.type];

    if (!typeSet) typeSet = this.byType[obj.type] = new Parametric(); // one Parametric list for each distinct type
    typeSet.update(obj, obj.priority );

    if (obj.transform)
    {
        if (obj.transform.worldPos) obj._local.coord = MercatorToNormalized(new Vector2(obj.transform.worldPos));
        if (obj.transform.worldBox) 
        {
            obj._local.box = { };
            obj._local.box.min = MercatorToNormalized(new Vector2(obj.transform.worldBox[0]));
            obj._local.box.max = MercatorToNormalized(new Vector2(obj.transform.worldBox[1]));
        }
    }

    if (obj.entities) // patch up entity links for relationships here
    {
        var rel = obj;
        if (!rel._local) rel._local = { priotity: 1 - obj.priority, size: 1, animSpider: this.GetTime() };

        var found = this.Find(rel.sources.id);
        if (found && found._local.animPending) delete found._local.animPending; // remove the spinning animation
    }

    return obj;
}

ObjectStore.prototype.Remove = function(obj)
{
    if (typeof(obj) == 'number') obj = this.byId[obj];
    else if (typeof(obj) == 'string') obj = this.byName[obj];

    if (obj == undefined) return;

    if (obj.name && this.byName['#' + obj.name]) delete this.byName['#' + obj.name];
    if (obj.id && this.byId[obj.id])             delete this.byId[obj.id];

    for (var typeSet in this.byType)
    {
        this.byType[typeSet].remove(obj);
    }

    graphCanvas.pictures.remove(obj); // shouldn't be necessary, but safer

    if (graphCanvas.selectedElement == obj) graphCanvas.selectedElement = null;
    if (graphCanvas.movingElement == obj) graphCanvas.movingElement = null;
}

ObjectStore.prototype.Create = function (type, p1, p2, p3, p4) {
    var obj = new type(p1,p2,p3,p4);
    this.Add(obj);
    return obj;
}

ObjectStore.prototype.Find = function(ref)
{
    if (ref instanceof Object) return ref;
    else if (typeof(ref) == 'string' && ref.charAt(0) == '#') return this.byName[ref];

    return this.byId[ref];
}

ObjectStore.prototype.ctorCast = function(obj)
{
    for (var member in obj)
    {
        var memb = obj[member];
        if (memb instanceof Object) 
        {
            obj[member] = this.ctorCast(memb);
        }
        else if (memb instanceof Array) 
        {
            for (var i = 0;i<memb.length;i++) obj[member][i] = this.CtorCast(memb[i]);
        }
    }

    if (obj.type) 
    {
        type = eval("RML."+obj.type); // table lookup would be safer and probably faster, but less extensible
        obj = new type(obj);
    }

    return obj;
}

ObjectStore.prototype.Stringify = function(obj, indent)
{
    var ret = "";
    var i = 0;
    if (!indent) indent = "";

    if (obj instanceof Array) 
    {
        ret += "[";
        for (var i = 0; i < obj.length; i++) ret += indent + (i > 0 ? ", ":"  ") + this.Stringify(obj[i], indent);
        ret += "]";
    }
    else if (obj instanceof Function)
    {
        // nothing
    }
    else if (obj instanceof Object) 
    {
        if (obj.stringify) ret += obj.stringify();
        else 
        {
            ret += "{\n\r";
            for (memb in obj) if (obj.hasOwnProperty(memb) && memb != '_local')
            {
                ret += indent + (i++ > 0 ? ", ":"  ") + "\"" + memb + "\"" + " : " + this.Stringify(obj[memb], indent + "  ") + "\n\r";
            }
            ret += indent + "}";
        }
    }
    else if (typeof(obj) == 'string') ret += "\"" + obj + "\"";
    else if (obj != null) ret += obj;
    
    else ret += "null";

    return ret;
}

ObjectStore.prototype.Serialize = function(obj)
{
    if (obj instanceof String) obj = byName[obj];
    else if (obj instanceof Number) obj = byId[obj];

    return JSON.stringify(obj);
}

ObjectStore.prototype.Deserialize = function(json)
{
    return this.ctorCast(JSON.parse(json));
}

var debugData;

ObjectStore.prototype.Receive = function(data) 
{
    debugdata = data;

    try {
        if (data.timestamp)
        {
            RML.serverTimestamp = data.timestamp;
        }

        if (data.context)
        {
            RML.serverContext = data.context;
        }

        if (data.removed) for (i = 0; i < data.removed.length; i++) 
        {
            var obj = RML.byId[data.removed[i]];
            if (obj)
            {
                if (obj._local) 
                {
                    obj._local.animFadeOut = RML.GetTime();
                    obj._local.priority = -1;
                }
            }
        }

        if (data.updated)
        {
            var i;
            try
            {
                for (i = 0;i<data.updated.length;i++) 
                {
                    var obj = RML.ctorCast(data.updated[i]);
                    var old = RML.byId[obj.id];
                    if (old == null || old.timestamp < obj.timestamp) RML.Add(obj);
                }

                if (i > 0)
                {
                    sendText.innerHTML += "received: " + i + " (" + data.updated.length + ")<br\>";
                    sendText.scrollTop = sendText.scrollHeight;
                }
            }        
            catch (err)
            {
                sendText.innerHTML += "updated: error: " + err;
            }
        }
    }
    catch (err) {
        sendText.innerHTML += "receive error: " + err + "<br>";
    }

    RML.needsDraw = true;
}

ObjectStore.prototype.GetElements = function(optimize) 
{   
    this.seq++;

    if (optimize)
    {
        var needed = optimize - graphCanvas.visible.length;
        if (needed <= 0) return;

        sendText.innerHTML += "fetching recent: " + needed + "<br\>";

        url = "getElements.rml?x1=" + RML.viewBox.x + "&y1=" + RML.viewBox.y + 
                             "&x2=" + RML.viewBox.z + "&y2=" + RML.viewBox.w + 
                             "&seq=" + this.seq + "&now=" + optimize + "&later=0"; // + needed;
    }
    else
    {
        var get = 5;

        sendText.innerHTML += "fetching latest " + get + "<br\>";

        url = "getElements.rml?x1=" + RML.viewBox.x + "&y1=" + RML.viewBox.y + "&x2=" + RML.viewBox.z + "&y2=" + RML.viewBox.w + 
                "&t1=" + RML.serverTimestamp + "&seq=" + this.seq + "&now=" + get;
    }

    if (sendText.innerHTML.length > 30000) sendText.innerHTML = "";

     $.ajax({
         type: "POST",
         url: url,
         data: "",
         _contractentType: "application/json; charset=utf-8",
         dataType: "json",
         success: RML.Receive,
         error: function (err) {
            sendText.innerHTML += "get error: " + err + "<br>";
         }
        });
}

ObjectStore.prototype.GetNeighbors = function(id) 
{   
    this.seq++;

    var url = "getNeighbors.rml?id="+id;

    var obj = this.byId[id];

    if (this.serverContext) url += "&context=" + this.serverContext;

    //sendText.innerHTML += "<br\>sending: " + url + "<br\>";

     $.ajax({
         type: "POST",
         url: url,
         data: "",
         dataType: "json",
         success: RML.Receive,
         error: function (err) {
            if (obj._local.animPending) delete obj._local.animPending;
            if (obj._local.lastPoll) delete obj._local.lastPoll;
            sendText.innerHTML += "get neighbor error: " + err + "<br>";
         }
        });
}

ObjectStore.prototype.SetElement = function(str) 
{
    try
    {
        var obj = this.Deserialize(str);
        var entity = RML.byId[obj.id]; // need to validate
        for (memb in obj)
        {
            entity[memb] = obj[memb];
        }

        var url = "setElement.rml?key=99988017a9c40abcdffbb4380fdebbfa";

        //sendText.innerHTML += "sending: " + url + ": " "\n";
        //sendText.scrollTop = sendText.scrollHeight;

         $.ajax({
             type: "POST",
             url: url,
             data: str,
             dataType: "json",
             success: function (data) 
             {
                 //sendText.innerHTML += "save success + " + data + "<br>";
             },
             error: function (err) {
                 sendText.innerHTML += "save error: " + err + "<br>";
             }
         });

         return obj;
    }
    catch (err)
    {
        sendText.innerHTML += "save error: " + err + "<br>";
        debugger;
    }
}

ObjectStore.prototype.SetElementWorldPos = function(obj) 
{
    try
    {
        var url = "setElement.rml?key=99988017a9c40abcdffbb4380fdebbfa";
        var str = "{ \"id\":" + obj.id + ", \"transform\": { \"worldPos\": [" + obj.transform.worldPos.x + "," + obj.transform.worldPos.y + "] } }";

        //sendText.innerHTML += "sending: " + str + "\n";
        //sendText.scrollTop = sendText.scrollHeight;

         $.ajax({
             type: "POST",
             url: url,
             data: str,
             dataType: "json",
             success: function (data) 
             {
                 //sendText.innerHTML += "save success + " + data + "<br>";
             },
             error: function (err) {
                 sendText.innerHTML += "save error: " + err + "<br>";
             }
         });

         return obj;
    }
    catch (err)
    {
        sendText.innerHTML += "save error: " + err + "<br>";
        debugger;
    }
}

ObjectStore.prototype.Draw = function() 
{ 
    graphCanvas.Draw(this); 
}

ObjectStore.prototype.DrawCheck = function() 
{ 
    if (RML.needsDraw) 
    {
        RML.needsDraw = false;
        globalDrawer.update();
    }

    if (RML.viewMoveEnergy > 0) 
    {
        RML.UpdateContext();
    }
}

RML = new ObjectStore();

function MercatorToNormalized(pt)
{
    var sinLat = Math.sin(pt.y * Math.PI / 180);
    return new Vector2( (pt.x + 180) / 360,
                        (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) );
}

function NormalizedToMercator(pt)
{
    return new Vector2( (pt.x - 0.5) * 360,  
                         (90 - 2 * Math.atan(Math.exp((pt.y * 2 - 1) * Math.PI)) * (180 / Math.PI)) );
}

var lastStart = 0;

function createXMLHttpRequest() {
  lastStart = 0;
  try { return new XDomainRequest(); } catch(e) {}
  try { return new XHttpRequest();   } catch(e) {}
  return null;
}

function loaded() {
    // start a new request if this one ends
    RML.GetStream();
}

function progress() {
    var begin = lastStart;
    var end = begin;
    var depth = 0;
    var str = RML.req.responseText;
    while (end < str.length)
    {
        if (str[end] == "{") depth++;
        else if (str[end] == "}") depth--;

        if (depth == 0 && end > begin)
        {
            var process = RML.req.responseText.substring(begin,end+1);
            var data = JSON.parse(process);
            
            RML.Receive(data);

            begin = end+2;
            end   = begin;
        }
        else end++;
    }

    lastStart = begin;
}

function error(err)
{
    sendText.innerHTML += "stream receive error <br\>";
    //alert("stream receive error");
    RML.GetStream();
}

var inc = 0;

ObjectStore.prototype.lastSendTime = 0;

ObjectStore.prototype.UpdateContext = function()
{
    var t = RML.GetTime();
    var dt = t - RML.lastSendTime;

    if (dt < 0.25) return; // don't send more than every 1/10th second, which is fast.

    if (!RML.serverContext) return;

    RML.lastSendTime = t;
    RML.viewMoveEnergy = 0;

    var url = "setContext.rml?context=" + RML.serverContext;
    url += "&x1=" + RML.viewBox.x;
    url += "&y1=" + RML.viewBox.y;
    url += "&x2=" + RML.viewBox.z;
    url += "&y2=" + RML.viewBox.w;

    $.ajax({
    type: "POST",
    url: url,
    success: function (data) 
    { 
        RML.Receive(data);
    },
    error: function (err)    
    { 
        sendText.innerHTML += "SetBox Error: " + err + "<br>"; 
    }
    });
}

ObjectStore.prototype.GetStream = function()
{
    if (RML.req) RML.req.abort();

    RML.req = createXMLHttpRequest();
    RML.req.contentType = "text/plain";
    RML.req.onprogress = progress;
    RML.req.onload = loaded;
    RML.req.onerror = error;

    RML.req.open("POST", "getStream.rml?max=100&context=" + RML.serverContext);
    RML.req.send();
}
