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
	/** 
	 * Special event fires for any triggered event 
	 * @event	conbo.ConboEvent#ALL
	 */
	ALL:				'*',

	/**
	 * Something has changed, also 'change:[name]' (Properties: property, value)
	 * @event	conbo.ConboEvent#CHANGE
	 */
	CHANGE:				'change',
	
	/** 
	 * When something is added
	 * @event	conbo.ConboEvent#ADD
	 */
	ADD:				'add', 				

	/**
	 * Something was removed
	 * @event	conbo.ConboEvent#REMOVE
	 */
	REMOVE:				'remove',

	/**
	 * The route has changed, also 'route:[name]' (Properties: router, route, name, parameters, path)
	 * @event	conbo.ConboEvent#ROUTE
	 */
	ROUTE:				'route', 			

	/** 
	 * Something has started
	 * @event	conbo.ConboEvent#STARTED
	 */
	STARTED:			'started',

	/**
	 * Something has stopped
	 * @event	conbo.ConboEvent#STOPPED
	 */
	STOPPED:			'stopped',
	
	/**
	 * A template has loaded 
	 * @event	conbo.ConboEvent#TEMPLATE_LOADED
	 */
	TEMPLATE_LOADED:	'templateloaded',

	/** 
	 * A template error has occurred 
	 * @event	conbo.ConboEvent#TEMPLATE_ERROR
	 */
	TEMPLATE_ERROR:		'templateerror',

	/** 
	 * Something has been bound 
	 * @event	conbo.ConboEvent#BIND
	 */
	BIND:				'bind',

	/** 
	 * Something has been unbound 
	 * @event	conbo.ConboEvent#UNBIND
	 */
	UNBIND:				'unbind',			

	/** 
	 * Something has been created
	 * @event	conbo.ConboEvent#CREATION_COMPLETE
	 */
	CREATION_COMPLETE:	'creationcomplete',
	
	/** 
	 * Something has been detached
	 * @event	conbo.ConboEvent#DETACH
	 */
	DETACH:				'detach',
	
	/** 
	 * A result has been received 
	 * @event	conbo.ConboEvent#RESULT
	 */
	RESULT:				'result',
	
	/** 
	 * A fault has occurred 
	 * @event	conbo.ConboEvent#FAULT
	 */
	FAULT:				'fault',			
	
});
