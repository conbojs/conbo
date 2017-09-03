/**
 * conbo.Command
 * 
 * Base class for commands to be registered in your Context 
 * using mapCommand(...)
 * 
 * @class		conbo.Command
 * @augments	conbo.EventDispatcher
 * @author		Neil Rackett
 * @param 		{Object} options - Object containing optional initialisation options, including 'context' (Context)
 */
conbo.Command = conbo.EventDispatcher.extend(
/** @lends conbo.Command.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	__construct: function(options)
	{
		this.context = options.context;
		this.event = options.event || {};
	},
	
	/**
	 * Initialiser included for consistency, but should probably never be used
	 */
	initialize: function() {},
	
	/**
	 * Execute: should be overridden
	 * 
	 * When a Command is called in response to an event registered with the
	 * Context, the class is instantiated, this method is called then the 
	 * class instance is destroyed
	 */
	execute: function() {},
	
	toString: function()
	{
		return 'conbo.Command';
	}
	
}).implement(conbo.IInjectable);
__denumerate(conbo.Command.prototype);
