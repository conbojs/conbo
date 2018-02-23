/**
 * conbo.Command
 * 
 * Base class for commands to be registered in your Context 
 * using mapCommand(...)
 * 
 * @class		Command
 * @memberof	conbo
 * @augments	conbo.ConboClass
 * @author		Neil Rackett
 * @param 		{Object} options - Object containing optional initialisation options, including 'context' (Context)
 */
conbo.Command = conbo.ConboClass.extend(
/** @lends conbo.Command.prototype */
{
	/**
	 * @member		{conbo.Context}	context - Application context
	 * @memberof	conbo.Command.prototype
	 */

	/**
	 * @member		{conbo.Event}	event - The event that caused this command to execute
	 * @memberof	conbo.Command.prototype
	 */

	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 * @private
	 */
	__construct: function(options)
	{
		this.event = options.event || {};
	},
	
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
