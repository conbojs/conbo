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
 * @param 		{Object}	options - Properties to be added to this event object
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
	 * Special event used to listed for all event types 
	 * 
	 * @event			conbo.ConboEvent#ALL
     * @type 			{conbo.ConboEvent}
	 */
	ALL:				'*',

	/**
	 * Something has changed (also 'change:[name]')
	 * 
	 * @event			conbo.ConboEvent#CHANGE
     * @type 			{conbo.ConboEvent}
     * @property		{string} property - The name of the property that changed
     * @property		{*} value - The new value of the property
	 */
	CHANGE:				'change',
	
	/** 
	 * Something was added
	 * 
	 * @event			conbo.ConboEvent#ADD
     * @type 			{conbo.ConboEvent}
	 */
	ADD:				'add', 				

	/**
	 * Something was removed
	 * 
	 * @event			conbo.ConboEvent#REMOVE
     * @type 			{conbo.ConboEvent}
	 */
	REMOVE:				'remove',

	/**
	 * The route has changed (also 'route:[name]')
	 * 
	 * @event			conbo.ConboEvent#ROUTE
     * @type 			{conbo.ConboEvent}
     * @property		{conbo.Router}	router - The router that handled the route change
     * @property		{RegExp} 		route - The route that was followed
     * @property		{string} 		name - The name assigned to the route
     * @property		{Array} 		parameters - The parameters extracted from the route
     * @property		{string} 		path - The new path 
	 */
	ROUTE:				'route', 			

	/** 
	 * Something has started
	 * 
	 * @event			conbo.ConboEvent#START
     * @type 			{conbo.ConboEvent}
	 */
	START:				'start',

	/**
	 * Something has stopped
	 * 
	 * @event			conbo.ConboEvent#STOP
     * @type 			{conbo.ConboEvent}
	 */
	STOP:				'stop',
	
	/**
	 * A template is ready to use
	 * 
	 * @event			conbo.ConboEvent#TEMPLATE_COMPLETE
     * @type 			{conbo.ConboEvent}
	 */
	TEMPLATE_COMPLETE:	'templateComplete',

	/** 
	 * A template error has occurred
	 *  
	 * @event			conbo.ConboEvent#TEMPLATE_ERROR
     * @type 			{conbo.ConboEvent}
	 */
	TEMPLATE_ERROR:		'templateError',

	/** 
	 * Something has been bound
	 *  
	 * @event			conbo.ConboEvent#BIND
     * @type 			{conbo.ConboEvent}
	 */
	BIND:				'bind',

	/** 
	 * Something has been unbound
	 *  
	 * @event			conbo.ConboEvent#UNBIND
     * @type 			{conbo.ConboEvent}
	 */
	UNBIND:				'unbind',			

	/** 
	 * Something has been created and it's ready to use
	 * 
	 * @event			conbo.ConboEvent#CREATION_COMPLETE
     * @type 			{conbo.ConboEvent}
	 */
	CREATION_COMPLETE:	'creationComplete',
	
	/** 
	 * Something has been detached
	 * 
	 * @event			conbo.ConboEvent#DETACH
     * @type 			{conbo.ConboEvent}
	 */
	DETACH:				'detach',
	
	/** 
	 * A result has been received
	 *  
	 * @event			conbo.ConboEvent#RESULT
     * @type 			{conbo.ConboEvent}
     * @property		{*} result - The data received 
	 */
	RESULT:				'result',
	
	/** 
	 * A fault has occurred
	 *  
	 * @event			conbo.ConboEvent#FAULT
     * @type 			{conbo.ConboEvent}
     * @property		{*} fault - The fault received 
	 */
	FAULT:				'fault',			
	
});
