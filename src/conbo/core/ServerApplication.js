/**
 * Server Application 
 * 
 * Base class for applications that don't require DOM, e.g. Node.js
 * 
 * @author		Neil Rackett
 */
conbo.ServerApplication = conbo.EventDispatcher.extend
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
		options = conbo.clone(options) || {};
		options.app = this;
		options.context || (options.context = new this.contextClass(options));
		
		if (!!options) this.context = options.context;
		this.options = options;
		this.initialize.apply(this, arguments);
		
		conbo.bindProperties(this, this.bindable);
	},
	
	toString: function()
	{
		return 'conbo.ServerApplication';
	}
	
}).implement(conbo.Injectable);

_denumerate(conbo.ServerApplication.prototype);
