/**
 * Promise
 * 
 * @class		conbo.Promise
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options
 */
conbo.Promise = conbo.EventDispatcher.extend(
/** @lends conbo.Promise.prototype */
{
	initialize: function(options)
	{
		options || (options = {});
		
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
	 * The class name as a string
	 * @returns {String}
	 */
	toString: function()
	{
		return 'conbo.Promise';
	},
	
});

//__denumerate(conbo.Promise.prototype);
