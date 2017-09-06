/**
 * Event class
 * 
 * Base class for all events triggered in ConboJS
 * 
 * @class		Event
 * @memberof	conbo
 * @augments	conbo.Class
 * @author		Neil Rackett
 * @param 		{string}	type - The type of event this object represents
 */
conbo.Event = conbo.Class.extend(
/** @lends conbo.Event.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param 	{string} type - The type of event this class instance represents
	 */
	constructor: function(type)
	{
		this.preinitialize.apply(this, arguments);
		
		if (conbo.isString(type)) 
		{
			this.type = type;
		}
		else 
		{
			conbo.defineDefaults(this, type);
		}
		
		if (!this.type) 
		{
			throw new Error('Invalid or undefined event type');
		}
		
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Initialize: Override this!
	 * @param 	{string} type - The type of event this class instance represents
	 * @param 	{*} data - Data to store in the event's data property
	 */
	initialize: function(type, data)
	{
		this.data = data;
	},
	
	/**
	 * Create an identical clone of this event
	 * @returns 	{conbo.Event}	A clone of this event
	 */
	clone: function()
	{
		return conbo.clone(this);
	},
	
	/**
	 * Prevent whatever the default framework action for this event is
	 * @returns	{conbo.Event}	A reference to this event instance 
	 */
	preventDefault: function() 
	{
		this.defaultPrevented = true;
		return this;
	},
	
	/**
	 * Not currently used
	 * @returns	{conbo.Event}	A reference to this event instance
	 */
	stopPropagation: function() 
	{
		this.cancelBubble = true;
		
		return this;
	},
	
	/**
	 * Keep the rest of the handlers from being executed
	 * @returns	{conbo.Event}	A reference to this event 
	 */
	stopImmediatePropagation: function() 
	{
		this.immediatePropagationStopped = true;
		this.stopPropagation();
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Event';
	}
},
/** @lends conbo.Event */
{
	ALL: '*',
});

__denumerate(conbo.Event.prototype);
