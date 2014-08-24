/**
 * Async Token
 * @author Neil Rackett
 */
conbo.AsyncToken = conbo.EventDispatcher.extend
({
	initialize: function(options)
	{
		options || (options = {});
		
		this.resultClass = options.resultClass;
		this.responders = [];
		this.bindAll('_dispatchResult', '_dispatchFault');
		
		var promise = options.promise;
		if (!promise) return;
		
		promise
			.done(this._dispatchResult)
			.fail(this._dispatchFault);
	},
	
	addResponder: function(responder)
	{
		if (!conbo.instanceOf(responder, conbo.Responder)) return;
		this.responders.push(responder);
	},
	
	toString: function()
	{
		return 'conbo.AsyncToken';
	},
	
	_dispatchResult: function(result, status, xhr)
	{
		if (!this.resultClass)
		{
			this.resultClass = result instanceof Array
				? conbo.List
				: conbo.Hash;
		}
		
		result = new this.resultClass(result);
		
		var event = new conbo.ConboEvent('result', {result:result, status:xhr.status, xhr:xhr});
		
		this.responders.forEach(function(responder)
		{
			responder.resultHandler.call(responder.scope, event);
		});
		
		this.dispatchEvent(event);
	},
	
	_dispatchFault: function(xhr, status, errorThrown)
	{
		var event = new conbo.ConboEvent('fault', {fault:errorThrown, status:xhr.status, xhr:xhr});
		
		this.responders.forEach(function(responder)
		{
			responder.faultHandler.call(responder.scope, event);
		});
		
		this.dispatchEvent(event);
	}
	
});

_denumerate(conbo.AsyncToken.prototype);
