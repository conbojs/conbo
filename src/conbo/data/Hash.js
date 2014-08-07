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

conbo.Hash = conbo.Bindable.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(attributes, options)
	{
		conbo.propertize(this);
		
		this._inject(options);
		
		conbo.defaults(this, attributes, this.defaults)		
		Object.defineProperty(this, '__attributes__', {enumerable:false, configurable:true, writable:true, value:this});
		
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Return an object that can easily be converted into JSON
	 */
	toJSON: function()
	{
		var keys = conbo.keys(this.__attributes__),
			filter = function(value) { return String(value).indexOf('_') != 0; };
		
		return conbo.pick(this.__attributes__, conbo.filter(keys, filter));
	},
	
	toString: function()
	{
		return 'conbo.Hash';
	}
});

//Underscore methods that we want to implement on the Model.
var hashMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'size'];

//Mix in each available Lo-Dash/Underscore method as a proxy to `Model#attributes`.
conbo.each(hashMethods, function(method)
{
	if (!(method in conbo)) return;
	
	conbo.Hash.prototype[method] = function() 
	{
		return conbo[method].apply(conbo, [this.__attributes__].concat(conbo.rest(arguments)));
	};
});

conbo.denumerate(conbo.Hash.prototype);
