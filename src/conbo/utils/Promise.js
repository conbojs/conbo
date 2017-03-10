/**
 * Promise
 * 
 * @class		conbo.Promise
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options
 * @fires		conbo.ConboEvent#RESULT
 * @fires		conbo.ConboEvent#FAULT
 */
conbo.Promise = conbo.EventDispatcher.extend(
/** @lends conbo.Promise.prototype */
{
	initialize: function(options)
	{
		this.bindAll('dispatchResult', 'dispatchFault');
	},
	
	/**
	 * Dispatch a result event using the specified result
	 * @param 	result
	 * @returns {conbo.Promise}
	 */
	dispatchResult: function(result)
	{
		this.dispatchEvent(new conbo.ConboEvent('result', {result:result}));
		return this;
	},
	
	/**
	 * Dispatch a fault event using the specified fault
	 * @param 	result
	 * @returns {conbo.Promise}
	 */
	dispatchFault: function(fault)
	{
		this.dispatchEvent(new conbo.ConboEvent('fault', {fault:fault}));
		return this;
	},
	
	/**
	 * Shorthand method for adding a result and fault event handlers
	 *  
	 * @param	{function}	resultHandler
	 * @param	{function}	faultHandler
	 * @param	{object}	scope
	 * @returns	{conbo.Promise}
	 */
	then: function(resultHandler, faultHandler, scope)
	{
		if (resultHandler) this.addEventListener('result', resultHandler, scope);
		if (faultHandler) this.addEventListener('fault', faultHandler, scope);
		
		return this;
	},
	
	/**
	 * The class name as a string
	 * @returns {String}
	 */
	toString: function()
	{
		return 'conbo.Promise';
	},
	
});
