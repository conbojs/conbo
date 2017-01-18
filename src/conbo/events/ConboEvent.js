/**
 * conbo.Event
 * 
 * Default event class for events fired by ConboJS
 * 
 * For consistency, callback parameters of Backbone.js derived classes 
 * are event object properties in ConboJS
 * 
 * @class		conbo.ConboEvent
 * @augments	conbo.Event
 * @author		Neil Rackett
 * @param 		{string}	type - The type of event this object represents
 * @param 		{object}	options - Properties to be added to this event object
 */
conbo.ConboEvent = conbo.Event.extend(
/** @lends conbo.ConboEvent.prototype */
{
	initialize: function(type, options)
	{
		conbo.defineDefaults(this, options);
	},
	
	toString: function()
	{
		return 'conbo.ConboEvent';
	}
},
/** @lends conbo.ConboEvent */
{
	/** Special event fires for any triggered event */
	ALL:					'*',
	
	/** When a save call fails on the server (Properties: model, xhr, options) */
	ERROR:					'error',
	
	/** (Properties: model, error, options) when a model's validation fails on the client */	
	INVALID:				'invalid', 			

	/**
	 * When a Bindable instance's attributes have changed (Properties: property, value)
	 * Also, `change:[attribute]` when a specific attribute has been updated (Properties: property, value)								
	 */
	CHANGE:					'change',
	
	/** when a model is added to a collection (Properties: model, collection, options) */
	ADD:					'add', 				

	/**
	 * When a model is removed from a collection (Properties: model, collection, options)
	 * or a View's element has been removed from the DOM
	 */
	REMOVE:					'remove',

	/** (Properties: model, collection, options) when a model is destroyed */
	DESTROY:				'destroy', 			

	/** (Properties: collection, options) when the collection's entire contents have been replaced */
	RESET:					'reset', 			

	/** (Properties: collection, options) when the collection has been re-sorted */
	SORT:					'sort', 			

	/** (Properties: model, xhr, options) when a model (or collection) has started a request to the server */	
	REQUEST:				'request', 			

	/** (Properties: model, response, options) when a model (or collection) has been successfully synced with the server */
	SYNC:					'sync',

	/**
	 * (Properties: router, route, params) Fired by history (or router) when any route has been matched
	 * Also, 'route:[name]' // (Properties: params) Fired by the router when a specific route is matched 
	 */
	ROUTE:					'route', 			
											
	/** Dispatched by history (or router) when the path changes, regardless of whether the route has changed */
	NAVIGATE:				'navigate',

	/** A process, e.g. history, has started */
	STARTED:				'started',

	/** A process, e.g. history, has stopped */
	STOPPED:				'stopped',
	
	// View
	
	/** Template data has been loaded into the View and can now be manipulated in the DOM */
	TEMPLATE_LOADED:		'templateloaded',

	/** An error occurred while loading the template */
	TEMPLATE_ERROR:			'templateerror',

	/** Fired by an element after having one or more property bound to it by Conbo */
	BIND:					'bind',

	/** All elements in HTML have been bound to the View */
	BOUND:					'bound',			

	/** All elements in HTML have been unbound from the View */
	UNBOUND:				'unbound',			

	/** For a View, this means template loaded, elements bound, DOM rendered */
	INIT:					'init',				  

	/** The View has been detached from the DOM */
	DETACH:					'detach',
	
	// Web Services & Promises
	
	/** A result has been received */
	RESULT:					'result',
	
	/** A fault has occurred */
	FAULT:					'fault',			
	
});

__denumerate(conbo.ConboEvent.prototype);
