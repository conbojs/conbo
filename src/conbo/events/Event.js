/**
 * Event class
 * 
 * Base class for all events triggered in Conbo.js
 * 
 * @author		Neil Rackett
 */
conbo.Event = conbo.Class.extend
({
	//cancelBubble: false,
	//defaultPrevented: false,
	//immediatePropagationStopped: false,
	
	//currentTarget: undefined,
	//target: undefined,
	//type: undefined,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(type)
	{
		conbo.propertize(this);
		
		if (conbo.isString(type)) this.type = type;
		else conbo.defaults(this, type);
		
		if (!this.type) throw new Error('Invalid or undefined event type');
		
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Initialize: Override this!
	 * @param type
	 */
	initialize: function(type) {},
	
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
	},
	
	/**
	 * Not currently used
	 */
	stopPropagation: function() 
	{
		this.cancelBubble = true;
	},
	
	/**
	 * Keep the rest of the handlers from being executed
	 */
	stopImmediatePropagation: function() 
	{
		this.immediatePropagationStopped = true;
		this.stopPropagation();
	},
	
	toString: function()
	{
		return 'conbo.Event';
	}
},
{
	ALL: 'all',
	
	/**
	 * Get all event types separated by spaces
	 */
	all: function(asArray)
	{
		var types = [];
		
		for (var a in this)
		{
			if (!conbo.isString(this[a]) || this[a] == this.ALL) continue;
			types.push(this[a]);
		}
		
		if (asArray) return types;
		return types.join(' ');
	}
});
