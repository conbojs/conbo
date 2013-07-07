/**
 * Server Application (e.g. Node.js)
 */
conbo.ServerApplication = conbo.Bindable.extend
({
	contextClass: conbo.Context,
	
	constructor: function(options)
	{
		options = options || {};
		options.view = options.view || this;
		
		this.context = options.context || new this.contextClass(options);
		this._inject(options);
		this.options = options;
		this.initialize.apply(this, arguments);
	},
	
	initialize: function() {},
	
	toString: function()
	{
		return '[conbo.ServerApplication]';
	},
});
