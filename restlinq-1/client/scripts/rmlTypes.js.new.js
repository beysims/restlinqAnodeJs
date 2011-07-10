

var Contract = { }

Contract.Info = {
    author      : String,
    version     : Number,
    date        : String,
    copyright   : String,
    description : String,
    tags        : [ ]
};

RML.Info = function(args)
{
    return Construct(this,'Info', args);
    return this;
}

Contract.Transform = {
    type        : "Transform",
    parent      : RML.Reference,     // optional
    name        : String,        // optional
    worldPos    : Vector3,       // [ x, y, z ], // optional for globally indexed objects
    worldRotHPR : Vector3,       //[ h, p, r ], // optional, 1D/2D/3D ok, exclusive of other rotation types
    worldRot    : Quaternion,    //[ qw, qx, qy, qz ], // optional, exclusive of other rotation types
    localPos    : Vector3,       //[ x, y, z ], // optional, 1D/2D/3D ok
    localRotHPR : Vector3,       //[ h, p, r ], // optional, 1D/2D/3D ok, exclusive of other rotation types
    localRot    : Quaternion,    //[ qw, qx, qy, qz ], // optional, exclusive of other rotation types
    localScale  : Vector3,       //[ sx, sy, sz ], // optional, 2D ok
    homography  : [ ],           // optional, exclusive of all others
    fieldOfView : Vector2,       // optional
    children    : Array(Reference), // optional

    $_require   : [ 'type' ],
    $_exclusive : [ { homography: "$_all" } ] // doesn't do anything yet, idea is for later type checking
}

RML.Transform = function(args)
{
    return Construct(this,'Transform', args);
    return this;
}

Contract.Entity = {
    type      : "Entity",
    id        : Number,
    timestamp : Number,
    name      : String,
    info      : RML.Info,
    parent    : RML.Reference,
    children  : Array(RML.Reference), // array syntax isn't implemented yet, but should be not too hard to do.
    relations : Array(RML.Reference),
    sources   : [],                   //Basic untyped arrays work fine.
    transform : RML.Transform,
    init      : function(args) { if (this.id == 0) this.id = RML.LocalID(); },

    $_require   : [ 'type', 'id', 'info' ]
}

RML.Entity = function(args)
{
    return Construct(this,'Entity', args);
    return this;
}


Contract.Node = {
    type      : "Node",
    $_inherit : "Entity",

    $_require : [ "type" ]
}

RML.Node = function(args)
{
    return Construct(this,'Node', args);
}
RML.Node.prototype = new RML.Entity();


Contract.Photo = {
    type      : "Photo",
    $_inherit : "Entity",
    ps        : { cid: String, captureDate: String },

    $_require : [ "type", "id" ]
}

RML.Photo = function(args)
{
    return Construct(this,"Photo",args);
}
RML.Photo.prototype = new RML.Entity();


Contract.Relation = {
    type      : "Relation",
    id        : Number,
    timestamp : Number,
    name      : String,
    info      : RML.Info,
    entities  : [],

    $_require : [ "type", "id" ]
 };

RML.Relation = function(args)
{
    return Construct(this,"Relation",args);
}


Contract.View = {
    type       : "View",
    controller : "default",
    tours      : [ ],

    $_inherit  : "Relation",
    $_require : [ "type" ]
};

Contract.Block = {
    type       : "Block",
    realLength : Number,

    $_inherit  : "Relation",
    $_require  : [ "type" ]
};



Contract.Image = {
    type      : "Image",
    url       : String,
    size      : Vector2,
    $_require : [ 'type', 'url' ]
};

RML.Image = function(args) {
    return Construct(this,"Image",args);
}

Contract.MSI = {
    type      : "MSI",
    size      : [],
    clip      : { vertices: [], loops: [] },

    $_inherit : "Image",
    $_require : [ 'type', 'size' ]
};

RML.MSI = function(args) {
    return Construct(this,"MSI",args);
}
RML.MSI.prototype = new RML.Image();



Contract.CubeMap = {
    type        : "CubeMap",
    megapixels  : Number,
    atlas       : RML.Image,
    front       : RML.MSI,
    right       : RML.MSI,
    back        : RML.MSI,
    left        : RML.MSI,
    top         : RML.MSI,
    bottom      : RML.MSI,

    $_inherit   : "Image",
    $_require   : [ "type", "atlas", "front", "right", "back", "left", "top", "bottom" ]
};


RML. CubeMap = function(args) {
    return Construct(this,"CubeMap",args);
}
RML.CubeMap.prototype = new RML.Image();



Contract.Video = {
    type    : "Video",
    format  : String,

    $_require : [ "type", "format" ]
};









RML.View = function(args)
{ 
    return Construct(this,"View",args);
}
RML.View.prototype = new RML.Relation();

RML.Block = function(args)
{ 
    return Construct(this,"Block",args);
}
RML.Block.prototype = new RML.Relation();

RML.Parametric = function(args)
{ 
    if (args && args instanceof Array) {
        var i;
        for (i = 0; i < p.length; i++) this.push(p[i]);
        args = null;
    }
    return Construct(this,"Parametric",args);
}
RML.Parametric.prototype = new Array();


RML.Video = function(args) {
    return Construct(this,"Video",args);
}
RML.Video.prototype = new RML.Image();

