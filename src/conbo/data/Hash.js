/**
 * conbo.Hash
 * A Hash is a bindable object of associated keys and values
 * 
 * @class		conbo.Hash
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing optional initialisation options, including 'source' (object) containing initial values
 */
conbo.Hash = conbo.EventDispatcher.extend(
/** @lends conbo.Hash.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options || (options = {});
		
		if (!!options.context) this.context = options.context;
		
		conbo.setDefaults(this, options.source, this.defaults);	
		delete this.defaults;
		
		this.initialize.apply(this, arguments);
		
		conbo.makeAllBindable(this, this.bindable);
	},
	
	/**
	 * Return an object that can easily be converted into JSON
	 */
	toJSON: function()
	{
		var filter = function(value) 
		{
			return String(value).indexOf('_') !== 0; 
		};
		
		var obj = {},
			keys = conbo.filter(conbo.properties(this), filter);
		
		keys.forEach(function(value) 
		{
			obj[value] = this[value]; 
		}, 
		this);
		
		return obj;
	},
	
	toString: function()
	{
		return 'conbo.Hash';
	}
	
});

__denumerate(conbo.Hash.prototype);
