/**
 * conbo.Map
 * 
 * A Map is a bindable object that associates keys and values
 * 
 * @example	
 * 	this.set('fun', 123};
 * 	this.get('fun');
 * 
 * @author		Neil Rackett
 */
conbo.Map = conbo.Bindable.extend
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
		return _.clone(this._attributes);
	},
	
	toString: function()
	{
		return '[conbo.Map]';
	}
});
