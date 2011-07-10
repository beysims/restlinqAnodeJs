

     
var testData = [
{
    "_id": {
        "$oid": "4e0520f853fc7203d03de207"
    },
    "Name": "Gionino's Pizzeria",
    "Tags": [
        " 4 22 ",
        " 10 16 ",
        " 8 20 ",
        " 9 23 ",
        " 11 23 ",
        " 7 18 ",
        " 9 23 "
    ],
    "Location": [
        -81.1456936,
        41.31070872
    ],
    "Address": "11679 Hayden St",
    "City": "Hiram",
    "State": "OH",
    "PostalCode": "44234",
    "Category": "PIZZA",
    "Type": "Restaurant",
    "Phone": "(330) 569-3222",
    "Website": "http://www.gioninos.com/",
    "YPID": "681x220662242"
}
]

function toRML(strange)
{
    if (!strange instanceof Array) return { result: "bad input" };

    var ret = [];

    var i = 0, j = 0;
    while (i < strange.length)
    {
        var obj = strange[i];
        
        var rml       = { 
            id        : obj._id["$oid"], 
            type      : obj.Type, 
            priority  : Math.random() 
        };

        ret[i] = rml; 

        try
        {
            rml.transform = { worldPos: obj.Location };

            rml.info      = { 
                title: obj.Name, 
                ypid: obj.YPID, 
                origin: obj.Website 
            };

            rml.info.address = {
                street      : obj.Address,
                city        : obj.City,
                state       : obj.State,
                postal_code : obj.PostalCode,
                phone       : obj.Phone
            }

            rml.business =  {
                hours       : obj.Tags // fix
            };

            RML.Add(rml);

            rml._local.image = icons["restaurant"];

            if (obj.Category)
            {
                var cat = obj.Category.toLowerCase();

                var minDist = 15;
                for (icon in icons)
                {
                    var t = cat.levenshtein(icon);
                    if (t < minDist)
                    {
                        minDist = t;
                        rml._local.image = icons[icon];
                    }
                }
            }
        }
        catch (err)
        {
            rml.error = err;
        }

        i++;
    }

    return ret;
}

function Test() 
{ 
    console.log('original url', window.document.URL);
    //HACK!!
    var url = window.document.URL.replace('editor.html', '').replace('http://', 'ws://');   
    var socket = new WebSocket(url);//'ws://eladg-dev:80');
    console.log('connecting to websocket at: ' + url);
    
    socket.onopen = function () {
			
		// First, send up a LINQ processing chain to apply to the data
				
		// TODO: build queries from elementary instructions and 
		// operands -- which are lambda expressions. 
		var categoryFilter = '.Where(function(entity) {return entity.Category !== undefined;})';
		var categorySelector = '.Select(function(entity) {return entity;})';
			
		// var entityAttributesQuery = '.SelectMany(function(entity) {return entity.Attributes;})';
		// var categorySelectorQuery = '.Where(function(attribute) {return attribute.Key === "Category";})';
		// var valueTransformQuery = '.Select(function(category) {return JSON.parse(category.Value);})';
				
		var distinctifyingQuery = '.Distinct()';
		var orderingQuery = '.OrderBy(function(category) {return category})';
				
		var entityProcessingChain = 
			categoryFilter +
			categorySelector +
			// entityAttributesQuery +
			// categorySelectorQuery +
			// valueTransformQuery +
			distinctifyingQuery +
			orderingQuery;
					
		socket.send(
			JSON.stringify({
				"QueryKind": "LinqInjection",
				"Vulnerability": "DenialOfService",
				"QueryTerms": entityProcessingChain
				}));

        var locationMockObservable = Rx.Observable.GenerateWithTime(
            1 /* initial state */,
            function (x) { return x > 0; } /* condition */,
            function (x) { return x + 1; } /* iterate */,
            function (x) { return x; } /* result selector */,
            function (x) { return 250; } /* time selector */,
            Rx.timeoutScheduler);

		// The OBSERVER we're subscribing here is a websockets proxy
		// for the real observer, which resides on the middle tier.
        locationMockObservable
			// Demonstrate filtering the observable using LINQ Operators:
			// .Where(function(tick) {return tick % 2 == 0;})
			.Subscribe(function (tick) {
            socket.send(
                JSON.stringify({
					"QueryKind": "BoundingBox",
                    "clientTick": tick,

					// Here is a bounding box that actually works -- 
							
                    "lowerLeftLon": RML.viewBox.x, //-81.5,
                    "lowerLeftLat": RML.viewBox.y, //40.5,
                    "upperRightLon":RML.viewBox.z, // -80.0,
                    "upperRightLat":RML.viewBox.w // 41.5

                    // Selvi's original bounding box

                    // "lowerLeftLon": -81.5,
                    // "lowerLeftLat": 40.5,
                    // "upperRightLon": -80.0,
                    // "upperRightLat": 41.5

                }));
        });
    };

    // append to div '#log' whatever server pushes.
	socket.onmessage = function(ev) {
    //break
		var received = JSON.parse(ev.data);

        RML.Receive(received);

        if (received.updated)
        {
            for (var i=0;i<received.updated.length;i++)
            {
                var obj = received.updated[i];
                RML.Add(obj);
                obj._local.image = icons["restaurant"];
            }
        }

        if (received.removed) for (i = 0; i < received.removed.length; i++) 
        {
            var obj = RML.byId[received.removed[i]];
            if (obj)
            {
                if (obj._local) 
                {
                    obj._local.animFadeOut = RML.GetTime(); // gets the object fading out nicely
                    obj._local.priority = -1;
                }
            }
        }
		//$('#pretty').append(prettyPrint(entity, {maxDepth: 8}));
	}

}
