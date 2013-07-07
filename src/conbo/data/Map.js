/**
 * Map: A simple, bindable Object class for when a Model is overkill
 * @deprecated
 */
conbo.Map = conbo.Bindable.extend
({
	constructor: function(options)
	{
		if (_.isObject(options) && !!options.context) this._inject(options);
		this.initialize.apply(this, arguments);
		_.defaults(this, this.defaults);
	},
	
	toJSON: function()
	{
		return _.clone(this._attributes());
	},
	
	toString: function()
	{
		return '[conbo.Map]';
	}
});
