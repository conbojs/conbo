/**
 * Async Token
 * @author Neil Rackett
 */
conbo.AsyncToken = conbo.EventDispatcher.extend
({
	initialize: function(options)
	{
		options || (options = {});
		
		conbo.setValues(this, conbo.pick(options, 
 		    'makeObjectsBindable', 
 		    'resultClass'
 		));
		
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
		if (!conbo.instanceOf(responder, conbo.Responder)) 
		{
			conbo.warn(responder+' is not a Responder');
			return;
		}
		
		this.responders.push(responder);
	},
	
	toString: function()
	{
		return 'conbo.AsyncToken';
	},
	
	_dispatchResult: function(result, status, xhr)
	{
		var resultClass = this.resultClass;
		
		if (!resultClass && this.makeObjectsBindable)
		{
			switch (true)
			{
				case conbo.isArray(result):
					resultClass = conbo.List;
					break;
				
				case conbo.isObject(result):
					resultClass = conbo.Hash;
					break;
			}
		}
		
		if (resultClass)
		{
			result = new resultClass(result);
		}
		
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
