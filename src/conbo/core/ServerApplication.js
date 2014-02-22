/**
 * Server Application 
 * 
 * Base class for applications that don't require DOM, e.g. Node.js
 * 
 * @author		Neil Rackett
 */
conbo.ServerApplication = conbo.Bindable.extend
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
		options.app = this;
		options.context || (options.context = new this.contextClass(options));
		
		this._inject(options);
		this.options = options;
		this.initialize.apply(this, arguments);
	},
	
	initialize: function() {},
	
	toString: function()
	{
		return 'conbo.ServerApplication';
	},
});
