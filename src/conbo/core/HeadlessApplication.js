/**
 * Headless Application 
 * 
 * Base class for applications that don't require DOM, e.g. Node.js
 * 
 * @class		HeadlessApplication
 * @memberof	conbo
 * @augments	conbo.EventDispatcher
 * @author		Neil Rackett
 * @param 		{Object} options - Object containing initialisation options
 */
conbo.HeadlessApplication = conbo.EventDispatcher.extend(
/** @lends conbo.HeadlessApplication.prototype */
{
	/**
	 * Default context class to use
	 * You'll normally want to override this with your own
	 */
	contextClass: conbo.Context,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	__construct: function(options)
	{
		options = conbo.clone(options || {});
		options.app = this;
		
		this.context = new this.contextClass(options);
	},
	
	toString: function()
	{
		return 'conbo.HeadlessApplication';
	}
	
}).implement(conbo.IInjectable);

__denumerate(conbo.HeadlessApplication.prototype);
