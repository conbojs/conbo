/**
 * conbo.Map
 * 
 * A simple, lightweight, bindable Object class for when a Model is overkill,
 * e.g. when you don't need to sync your data with a web service
 * 
 * @author		Neil Rackett
 */
conbo.Map = conbo.Bindable.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		this._inject(options);
		this.initialize.apply(this, arguments);
		_.defaults(this._attributes(), this.defaults);
	},
	
	/**
	 * Returns an object ready to be converted to JSON
	 * TODO Ensure we return only user's props and accessors (converted to props)
	 * @returns
	 */
	toJSON: function()
	{
		return _.clone(this._attributes());
	},
	
	toString: function()
	{
		return '[conbo.Map]';
	}
});
