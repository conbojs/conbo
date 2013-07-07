/**
 * Event class (should probably merge with jQuery's Event class?)
 */
conbo.Event = conbo.Class.extend
({
	//cancelBubble: false,
	//defaultPrevented: false,
	//immediatePropagationStopped: false,
	
	currentTarget: undefined,
	target: undefined,
	type: undefined,
	
	constructor: function(type)
	{
		if (_.isString(type)) this.type = type;
		else _.defaults(this, type);
		
		this.initialize.apply(this, arguments);
	},
	
	initialize: function(type) {},
	
	clone: function()
	{
		return _.clone(this);
	},
	
	preventDefault: function() 
	{
		this.defaultPrevented = true;
	},
	
	stopPropagation: function() 
	{
		this.cancelBubble = true;
	},
	
	stopImmediatePropagation: function() 
	{
		this.immediatePropagationStopped = true;
		this.stopPropagation();
	},
	
	toString: function()
	{
		return '[conbo.Event]';
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
			if (!_.isString(this[a]) || this[a] == this.ALL) continue;
			types.push(this[a]);
		}
		
		if (asArray) return types;
		return types.join(' ');
	}
});
