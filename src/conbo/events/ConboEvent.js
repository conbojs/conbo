/**
 * Conbo Event
 */
conbo.ConboEvent = conbo.Event.extend
({
	toString: function()
	{
		return '[conbo.ConboEvent]';
	}
},
{
	ERROR:		"error", 	// (model, xhr, options) — when a model's save call fails on the server.
	INVALID:	"invalid", 	// (model, error, options) — when a model's validation fails on the client.
	CHANGE:		"change", 	// (model, options) — when a model's attributes have changed.
							// "change:[attribute]" // (model, value, options) — when a specific attribute has been updated.
	ADD:		"add", 		// (model, collection, options) — when a model is added to a collection.
	REMOVE:		"remove", 	// (model, collection, options) — when a model is removed from a collection.
	DESTROY:	"destroy", 	// (model, collection, options) — when a model is destroyed.
	RESET:		"reset", 	// (collection, options) — when the collection's entire contents have been replaced.
	SORT:		"sort", 	// (collection, options) — when the collection has been re-sorted.
	
	REQUEST:	"request", 	// (model, xhr, options) — when a model (or collection) has started a request to the server.
	SYNC:		"sync", 	// (model, resp, options) — when a model (or collection) has been successfully synced with the server.
	
	ROUTE:		"route", 	// (router, route, params) — Fired by history (or router) when any route has been matched.
							// "route:[name]" // (params) — Fired by the router when a specific route is matched.
	
	ALL:		"all", 		// special event fires for any triggered event, passing the event name as the first argument.
});
