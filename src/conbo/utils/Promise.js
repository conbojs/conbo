(function()
{
	var Promise__removeEventListeners = function()
	{
		this.removeEventListener();
	};
	
	/**
	 * A Promise is a proxy for a value not necessarily known when the promise is created. 
	 * It allows you to associate handlers with an asynchronous action's eventual success 
	 * value or failure reason. This lets asynchronous methods return values like synchronous 
	 * methods: instead of immediately returning the final value, the asynchronous method 
	 * returns a promise to supply the value at some point in the future.
	 * 
	 * The Conbo implementation varies slightly from ES6 in that the values passed to the
	 * resolve and reject methods are ResultEvent and FaultEvent objects, respectively.
	 * 
	 * @class		Promise
	 * @memberof	conbo
	 * @augments	conbo.EventDispatcher
	 * @author 		Neil Rackett
	 * @param 		[{Function}] executor - A function that is passed with the arguments resolve and reject, which is executed immediately by the Promise
	 * @fires		conbo.ConboEvent#RESULT
	 * @fires		conbo.ConboEvent#FAULT
	 */
	conbo.Promise = conbo.EventDispatcher.extend(
	/** @lends conbo.Promise.prototype */
	{
		initialize: function(executor)
		{
			this.bindAll('dispatchResult', 'dispatchFault')
				.addEventListener('result fault', Promise__removeEventListeners, this, Number.NEGATIVE_INFINITY)
				;
			
			this.resolve = this.dispatchResult;
			this.reject = this.dispatchFault;
			
			if (conbo.isFunction(executor))
			{
				executor(dispatchResult, dispatchFault);
			}
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
		 * Shorthand method for adding a result and/or fault event handlers
		 *  
		 * @param	{Function}	resultHandler
		 * @param	{Function}	faultHandler
		 * @param	{Object}	scope
		 * @returns	{conbo.Promise}
		 */
		then: function(resultHandler, faultHandler, scope)
		{
			if (resultHandler) this.addEventListener('result', resultHandler, scope);
			if (faultHandler) this.addEventListener('fault', faultHandler, scope);
			
			return this;
		},
		
		/**
		 * Shorthand method for adding a fault event handler
		 *  
		 * @param	{Function}	faultHandler
		 * @param	{Object}	scope
		 * @returns	{conbo.Promise}
		 */
		catch: function(faultHandler, scope)
		{
			if (faultHandler) this.addEventListener('fault', faultHandler, scope);
			
			return this;
		},
		
		/**
		 * The class name as a string
		 * @returns {string}
		 */
		toString: function()
		{
			return 'conbo.Promise';
		},
		
	});

})();
