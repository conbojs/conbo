/**
 * Application
 */
conbo.Application = conbo.View.extend
({
	contextClass: conbo.Context,
	
	constructor: function(options)
	{
		options = options || {};
		options.view = options.view || this;
		
		this.context = options.context || new this.contextClass(options);
		
		conbo.View.prototype.constructor.apply(this, arguments);
	},
	
	toString: function()
	{
		return '[conbo.Application]';
	},
});
