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
	constructor: function(properties, options)
	{
		if (!!options) this.context = options.context;
		
		conbo.defaults(this, properties, this.defaults)		
		_defineIncalculableProperty(this, '__properties__', this);
		
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
		
		return conbo.pick(this.__properties__, conbo.filter(keys, filter));
	},
	
	toString: function()
	{
		return 'conbo.Hash';
	}
	
}).implement(conbo.Injectable);

//Underscore methods that we want to implement on the Model.
var hashMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'size'];

//Mix in each available Lo-Dash/Underscore method as a proxy to `Model#attributes`.
conbo.each(hashMethods, function(method)
{
	if (!(method in conbo)) return;
	
	conbo.Hash.prototype[method] = function() 
	{
		return conbo[method].apply(conbo, [this.__properties__].concat(conbo.rest(arguments)));
	};
});

_denumerate(conbo.Hash.prototype);
