//  __  __ _     _     _ _     _____ _
// |  \/  (_) __| | __| | | __|_   _(_) ___  _ __
// | |\/| | |/ _` |/ _` | |/ _ \| | | |/ _ \| '__|
// | |  | | | (_| | (_| | |  __/| | | |  __/| |
// |_|  |_|_|\__,_|\__,_|_|\___||_| |_|\___||_|
//      ____  _           _   _   _
//     / ___|| |__  _   _| |_| |_| | ___
//     \___ \| '_ \| | | | __| __| |/ _ \
//      ___) | | | | |_| | |_| |_| |  __/
//     |____/|_| |_|\__,_|\__|\__|_|\___|


console.log("SETUP: ");
var libLoadedP = function(library, libName) {
    return (library ? (libName + " loaded") : (libName + " NOT loaded"));
}

var dumper = require('./objectDumper.js');
console.log("ObjectDumper loaded");

// Wrapper over node.js http library to support rx functionality
// linq over observables
var http = require('./rx-node/rx_http.js');
console.log(libLoadedP(http, "httpRx"));

// linq over enumerables (TODO: replace with MS implementation)
// (TODO: add linq entry points to node's exports object)
var linq = require('./linq.js_ver2.2.0.2/linq.min.js');
console.log(libLoadedP(linq, "linq"));

// TODO: sandboxing
var lint = require('./douglascrockford-JSLint-54f04c5/jslint.js');
console.log(libLoadedP(lint, "lint"));

var sys = require("sys");
console.log(libLoadedP(sys, "sys"));

// some ideas from http://anismiles.wordpress.com/2011/01/25/ ...
//     websocket-and-node-js-why-shud%E2%80%99ya-care/
// Library https://github.com/miksago/node-websocket-server
var websocket = require('websocket-server');
console.log("websocket library loaded");

//    ____    __                _      __    __   ____        __       __
//   / __/__ / /_  __ _____    | | /| / /__ / /  / __/__ ____/ /_____ / /_
//  _\ \/ -_) __/ / // / _ \   | |/ |/ / -_) _ \_\ \/ _ \ __/  '_/ -_) __/
// /___/\__/\__/  \_,_/ .__/   |__/|__/\__/_.__/___/\___\__/_/\_\\__/\__/
//    ____           /_/
//   / __/__ ____ _  _____ ____
//  _\ \/ -_) __/| |/ / -_) __/
// /___/\__/_/   |___/\__/_/
// 

var ns = require('node-static');
var fileserver = new ns.Server('./client');
var httpserver = require('http').createServer(function(req, res) {
  // hack: rewrite the url so that the first will be omitted.
  // this wlil change later when we pass the root path of the service
  // as an command line argument and we can use it.
  req.url = req.url.split('/').slice(2).join('/');
  fileserver.serve(req, res);
});

// TODO: would like to view port 80 as an iobservable and the 
// callbacks here as iobservers.
var websocketServer = websocket.createServer({ server:httpserver });
httpserver.listen(process.argv[3]);
// sys.log("WEBSOCKET DETAILS: \n" + DUMP(websocketServer, 4));

websocketServer.addListener("listening", function () {
    sys.log("Listening on localhost:" + process.argv[3]);
    // console.log(DUMP(http) + "\nThat's the RX-NODE LIBRARY"); 
});

//   ____  __                          ________
//  / __ \/ /  ______ ____ _  _____   /_  __/ / ___
// / /_/ / _ \(_-< -_) __/| |/ / -_)   / / / _ \ -_)
// \____/_.__/___\__/_/   |___/\__/   /_/ /_//_\__/
//    ____       __          ____
//   /  _/__ ___/ /____ __  / __/__ ____ _  _____ ____
//  _/ // _ \ _  / -_) \ / _\ \/ -_) __/| |/ / -_) __/
// /___/_//_\_,_/\__/_\_\ /___/\__/_/   |___/\__/_/


// Descriptor for the final tier -- conventional argument for
// rx-node's "http.request" call.
var MongoIndexService = {
    port: 8080,
    host: "157.55.208.104", // '2fa7a0dcbd2e469a9972a2081517eb4b.cloudapp.net',
    path: undefined, 
    method: "GET"
};

// Tailor URL query to particular bounding box
function GetEntityQueryString(
    lowerLeftLon, 
    lowerLeftLat, 
    upperRightLon, 
    upperRightLat) {
    return '/IndexServerRESTService.svc/Query?dbName=Instances&collectionName=Place.Business&queryString=<IndexQueryType:Box><AND:{LocationName:Location},{LL_X:' + lowerLeftLon + '},{LL_Y:' + lowerLeftLat + '},{UR_X:' + upperRightLon + '},{UR_Y:' + upperRightLat + '}>&limitCount=25';
}

function CreateEntitiesObservable(
    lowerLeftLon, 
    lowerLeftLat, 
    upperRightLon, 
    upperRightLat) {

    // TODO: Assert validity of arguments!

    return Rx.Observable.Create(function (entitiesObserver) {

        MongoIndexService.path = GetEntityQueryString(
            lowerLeftLon, lowerLeftLat, upperRightLon, upperRightLat);

        // Create the observable for the Mongo Index Service. This observable
        // has a Subscribe method that takes an observer. 
        var mongoIndexServiceObservable = Rx.Observable.Create(function (indexServerObserver) {

            // Communicate with Mongo Index Server via http; the events of 
            // the http.request will simply forward to the indexServerObserver callbacks.
            var mongoRequest = http.request(MongoIndexService, function (response) {

                // When the response hits, get the ball rolling ...
                // sys.log('(Rx) INDEX-SERVER HTTP STATUS: ' + response.statusCode);
                // sys.log('(Rx) INDEX-SERVER HTTP HEADERS: \n' + DUMP(response.headers));
                response.setEncoding('utf8');

                // Forward the HTTP callbacks to the indexServerObserver:
                // *always wrap functions in closures that forward to ensure that
                //  'this' gets transferred properly* (Matthew Podwysocki)
                response.on('data', function (chunk) { indexServerObserver.OnNext(chunk); });
                response.on('end', function () { indexServerObserver.OnCompleted(); });
            });

            // Sign up the indexServerObserver's OnError callback to the http.request:
            mongoRequest.on('error', function (e) { indexServerObserver.OnError(e); });

            // As soon as the indexServerObserver subscribes, start up the observable.
            mongoRequest.end();

            // return the Dispose function from this Subscribe function.
            return function () { 
                // sys.log('(Rx) INDEX-SERVER OBSERVABLE -- Dispose()'); 
                };
        });

        // TODO: wrap this payload in a constructed object.
        var payload = new String();
        // Create the observer for the IndexServer Observable inline
        mongoIndexServiceObservable.Subscribe(Rx.Observer.Create(
        // OnNext
            function (chunk) {
                // sys.log('(Rx) INDEX-SERVER OBSERVER -- OnNext(chunk); size: ' + chunk.length);
                payload += chunk;
            },

        // OnError 
            function (exception) {
                sys.log('(Rx) INDEX-SERVER OBSERVER -- OnError(exception)\n' + exception);
            },

        // OnCompleted 
            function () {
                // sys.log("PAYLOAD" + payload);
                // TODO: There is a mysterious first character:
                //       it's always 65279: Zero-Width no-break space, U+FEFF 
                //       http://www.fileformat.info/info/unicode/char/feff/index.htm 
                //       Don't know how it got in there.
                // sys.log('(Rx) INDEX-SERVER OBSERVER: STRANGE CHARACTER: ' + payload.charCodeAt(0));
                // Skip the mystery character
                var entities = JSON.parse(payload.substring(1));
                // sys.log('(Rx) INDEX-SERVER OBSERVER -- OnCompleted(); size: ' + entities.length);

                entitiesObserver.OnNext(entities);

                entitiesObserver.OnCompleted();
            }
        ));

        // Dispose method -- Every Subscribe method must return a disposable or a dispose method
        return function () { 
            // sys.log('(Rx) INDEX-SERVER OBSERVABLE -- Dispose()'); 
            }
    });
    }

//   ____  __                          ________
//  / __ \/ /  ______ ____ _  _____   /_  __/ / ___
// / /_/ / _ \(_-< -_) __/| |/ / -_)   / / / _ \ -_)
// \____/_.__/___\__/_/   |___/\__/   /_/ /_//_\__/
//   ________         __
//  / ___/ (_)__ ___ / /_
// / /__/ / / -_) _ \ __/
// \___/_/_/\__/_//_\__/

// All entities in Enums are in RML!
//	var CachedEntitiesEnum = Enumerable.Empty();
var AllClientsEntityCache = {}; 
var GetEntityId = function(ent) {return ent.id;};

websocketServer.addListener("connection", function (client) {

    // When client connects, create observable for it. The Create method
    // takes a single function argument. That function argument is the 
    // implementation of the Subscribe method of the observable. That
    // method is a function of an observer. When the observer subscribes,
    // all we do in this Subscribe implementation is forward the 
    // messages received from the websocket client to the observer's
    // OnNext(message) callback; we don't call the OnCompleted or OnError
    // methods.
    var clientObservable = Rx.Observable.Create(function (observer) {
        // This function of observer is the body of the Subscribe method.
        // This Subscribe method will just forward the message to 
        // the observer's OnNext, ...
        client.addListener("message", function (message) {
            observer.OnNext(message);
        });
        // and then return this Dispose method:
        return function () {
            // sys.log('(Rx) CLIENT OBSERVABLE -- Dispose()');
        };
    });
    // sys.log("CLIENT CONNECTION DETAIL: \n" + DUMP(client, 4));

    // The injected LINQ query begins life as just the identity function
    var linqInjection = function (x) { return x; };
    
    var jsMessage = "";

    // TODO: Pull this observer out into an independent object -- don't
    // instantiate on every connection.
    var clientObserver = Rx.Observer.Create(
    // OnNext
        function (message) {

            jsMessage = JSON.parse(message);
            // sys.log("(Rx) CLIENT OBSERVER -- OnNext(message)\n" + DUMP(jsMessage));
            if (jsMessage.QueryKind === "BoundingBox") {
                // Create the observable, and subscribe an observer right here, inline:
                CreateEntitiesObservable(
                    jsMessage.lowerLeftLon,
                    jsMessage.lowerLeftLat,
                    jsMessage.upperRightLon,
                    jsMessage.upperRightLat)
                    .Subscribe( // Entities Observer inline
                    // OnNext
                        function (entities) {

                            var ms = (new Date).getTime();

                            var filteredEntities = linqInjection(entities);

                            // All entities in Enums are in RML!
                            var cachedEntitiesEnum = Enumerable.From(AllClientsEntityCache[client.id]);

                            var fetchedEntitiesEnum =
                                Enumerable.From(filteredEntities)
                                .Select(toRMLRestaurantObject)
                                ;

                            var updatedEntitiesEnum =
                                fetchedEntitiesEnum
                                .Except(AllClientsEntityCache[client.id], GetEntityId)
                                ;
                            
                            var removedEntitiesEnum =
                                Enumerable.From(AllClientsEntityCache[client.id])
                                .Except(fetchedEntitiesEnum, GetEntityId)
                               ;
                               
                            var cachedEntitiesWithoutCurrentClientEnum = cachedEntitiesEnum
                                .Where(function(clientCache) {return clientCache.Key !== client.id;})
                                .Select(function(clientCache) {return clientCache.Value;})
                                .Aggregate(Enumerable.Empty(), function(x,y) {return x.Union(y);})
                                ;
                                                      
                            // sys.log("SIZES: fetch = " + fetchedEntitiesEnum.Count() +
                            //        ", update = " + updatedEntitiesEnum.Count() +
                            //        ", remove = " + removedEntitiesEnum.Count() +
                            //        ", cache = " + cachedEntitiesEnum.Count()
                            //        );

                            var updatedEntities = updatedEntitiesEnum
                                .Except(cachedEntitiesWithoutCurrentClientEnum)
                                .ToArray()
                                .concat(toViewRML(client, jsMessage))
                                ;

                            // sys.log("sizes: updatedentities = " + updatedentities.length + "\n" +
                                    // "\tfetchedentitiesenum = " + fetchedentitiesenum.count() + "\n" +
                                    // "\tfetchedandcachedenum = " + fetchedandcachedenum.count() + "\n" +
                                    // "\tremovedentitiesenum = " + removedentitiesenum.count() + "\n" +
                                    // "\tupdatedentitiesenum = " + fetchedandcachedenum.count() + "\n" +
                                    // "\tcachedentitiesenum = " + cachedentitiesenum.count() + "\n"
                            //						    		", filteredEntities = " + DUMP(filteredEntities)
                                    // );

                            var removedEntitiesIds = removedEntitiesEnum
                                .Except(cachedEntitiesWithoutCurrentClientEnum)
                                .Select(GetEntityId)
                                .ToArray()
                                ;

                            var rmlResponse = {
                                updated: updatedEntities,
                                removed: removedEntitiesIds,
                                queryTime: 1000 * ((new Date).getTime() - ms)
                            };

                            AllClientsEntityCache[client.id] = fetchedEntitiesEnum.ToArray();
                            
                            websocketServer.manager.forEach(function (client) {
                                // sys.log('(Rx) ENTITIES OBSERVER -- OnNext; size: ' + entities.length);
                                client.write(JSON.stringify(rmlResponse));
                            });
                            // sys.log("query runtime: " + ((new Date).getTime() - ms));
                        },
                    // OnError
                        function (exception) {
                            sys.log("(Rx) ENTITIES OBSERVER -- OnError; " + exception);
                        },
                    // OnCompleted
                        function () {
                            // sys.log("(Rx) ENTITIES OBSERVER -- OnCompleted");
                        });
            }
            else if (jsMessage.QueryKind === "LinqInjection") {
                sys.log("building linq injection: \n" + jsMessage.QueryTerms);
                // TODO: write new "secure" eval.
                eval('linqInjection = function(entities) {return Enumerable.From(entities)' + jsMessage.QueryTerms + '.ToArray();}');
                sys.log("linq injection: \n" + DUMP(linqInjection));
            };
        },

    // OnError 
        function (exception) {
            sys.log('(Rx) CLIENT OBSERVER -- OnError(exception)\n' + exception);
        },

    // OnCompleted 
        function () {
            // sys.log('(Rx) CLIENT OBSERVER -- OnCompleted()');
        }
    );

    clientObservable.Subscribe(clientObserver);
});

function toViewRML(client, jsMessage) {

    var ret = [];

    var rml = {
        id: 'ClientSessionId' + client.id, 
        type: 'View',
        priority : 0.95
    };
    
    var shrink = 0.90;
    var deltaLon = shrink*(jsMessage.upperRightLon - jsMessage.lowerLeftLon);
    var deltaLat = shrink*(jsMessage.upperRightLat - jsMessage.lowerLeftLat);
    
    rml.transform = { worldBox: [[jsMessage.lowerLeftLon + deltaLon, 
                                  jsMessage.lowerLeftLat + deltaLat],
                                 [jsMessage.upperRightLon - deltaLon, 
                                  jsMessage.upperRightLat - deltaLat]] };
                                 
    rml.info = {color: '#00FF00'};
                                 
    ret[0] = rml;
    
    // sys.log("MESSAGE \n" + DUMP(jsMessage, 4));
    // sys.log("VIEW RML \n" + DUMP(rml, 4));
    
    return ret;
}

function toRMLRestaurantObject(obj) {

    var rml = {
        id: obj._id["$oid"],
        type: obj.Type,
        priority : 0.95
    };

    try {
        rml.transform = { worldPos: obj.Location };

        rml.info = {
            title: obj.Name,
            ypid: obj.YPID,
            origin: obj.Website
        };

        rml.info.address = {
            street: obj.Address,
            city: obj.City,
            state: obj.State,
            postal_code: obj.PostalCode,
            phone: obj.Phone
        }

        rml.business = {
            hours: obj.Tags // fix
        };
    }
    catch (err) {
        sys.log("ERROR: " + err);
        rml.error = err;
    }
 
    return rml;
}