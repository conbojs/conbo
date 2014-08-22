/**
 * conbo.Hash
 * 
 * A Hash is a bindable object of associated keys and values
 * 
 * @example	
 * 	this.set('fun', 123};
 * 	this.get('fun');
 * 
 * @author		Neil Rackett
 */

conbo.Hash = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(source, options)
	{
		if (!!options) this.context = options.context;
		
		conbo.defaults(this, source, this.defaults)		
		
		this.initialize.apply(this, arguments);
		
		conbo.bindProperties.apply(conbo, [this].concat(this.bindable || []));
	},
	
	/**
	 * Return an object that can easily be converted into JSON
	 */
	toJSON: function()
	{
		var keys = conbo.keys(this.__properties__),
			filter = function(value) { return String(value).indexOf('_') != 0; };
		
		return conbo.pick(this, conbo.filter(keys, filter));
	},
	
	toString: function()
	{
		return 'conbo.Hash';
	}
	
}).implement(conbo.Injectable);

_denumerate(conbo.Hash.prototype);
