/**
 * Command
 * @param options
 * @returns {conbo.Command}
 */
conbo.Command = conbo.EventDispatcher.extend
({
	constructor: function(options)
	{
		this._inject(options);
		
		this.event = this.options.event || {};
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Initialiser included just for consistency
	 */
	initialize: function() 
	{
		return this;
	},
	
	/**
	 * Execute: should be overridden
	 */
	execute: function() 
	{
		return this;
	},
	
	toString: function()
	{
		return '[conbo.Command]';
	}
	
});
