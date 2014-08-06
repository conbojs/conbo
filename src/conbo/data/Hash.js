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
		this._attributes = conbo.defaults(this, attributes, this.defaults);
		
		this.initialize.apply(this, arguments);
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
		return conbo[method].apply(conbo, [this._attributes].concat(conbo.rest(arguments)));
	};
});
