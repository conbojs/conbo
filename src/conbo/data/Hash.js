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
		this._inject(options);
		this._attributes = _.defaults({}, attributes, _.result(this, 'defaults'));
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Returns an object ready to be converted to JSON
	 * TODO Ensure we return only user's props and accessors (converted to props)
	 * @returns
	 */
	toJSON: function()
	{
		console.log(this.toString());
		return _.clone(this._attributes);
	},
	
	toString: function()
	{
		return 'conbo.Hash';
	}
});

//Underscore methods that we want to implement on the Model.
var hashMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit', 'size'];

//Mix in each available Lo-Dash/Underscore method as a proxy to `Model#attributes`.
_.each(hashMethods, function(method)
{
	if (!(method in _)) return;
	
	conbo.Hash.prototype[method] = function() 
	{
		return _[method].apply(_, [this._attributes].concat(_.rest(arguments)));
	};
});
