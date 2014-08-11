/**
 * conbo.Command
 * 
 * Base class for commands to be registered in your Context 
 * using mapCommand(...)
 * 
 * @author		Neil Rackett
 */
conbo.Command = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		conbo.propertize(this);
		
		if (!!options) this.context = options.context;
		this.event = options.event || {};
		this.initialize.apply(this, arguments);
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
	
});

conbo.denumerate(conbo.Command.prototype);
