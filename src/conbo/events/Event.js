/**
 * Event class
 * 
 * Base class for all events triggered in Conbo.js
 * 
 * @class		conbo.Event
 * @augments	conbo.Class
 * @author		Neil Rackett
 * @param 		{string}	type - The type of event this object represents
 */
conbo.Event = conbo.Class.extend(
/** @lends conbo.Event.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(type)
	{
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
	 * @param type
	 */
	initialize: function(type, data)
	{
		this.data = data;
	},
	
	/**
	 * Create an identical clone of this event
	 * @returns 	Event
	 */
	clone: function()
	{
		return conbo.clone(this);
	},
	
	/**
	 * Prevent whatever the default framework action for this event is
	 */
	preventDefault: function() 
	{
		this.defaultPrevented = true;
		
		return this;
	},
	
	/**
	 * Not currently used
	 */
	stopPropagation: function() 
	{
		this.cancelBubble = true;
		
		return this;
	},
	
	/**
	 * Keep the rest of the handlers from being executed
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
