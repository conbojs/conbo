/**
 * Application
 * 
 * Base application class for client-side applications
 * 
 * @author		Neil Rackett
 */
conbo.Application = conbo.View.extend
({
	/**
	 * Default context class to use
	 * You'll normally want to override this with your own
	 */
	contextClass: conbo.Context,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options = _.clone(options) || {};
		options.view = options.view || this;
		
		this.context = options.context || new this.contextClass(options);
		
		conbo.View.prototype.constructor.apply(this, arguments);
	},
	
	toString: function()
	{
		return '[conbo.Application]';
	},
});
