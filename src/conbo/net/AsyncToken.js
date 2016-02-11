/**
 * Async Token
 * 
 * @class		conbo.AsyncToken
 * @augments	conbo.Promise
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing optional initialisation options, including 'makeObjectsBindable' and 'resultClass'
 */
conbo.AsyncToken = conbo.Promise.extend(
/** @lends conbo.AsyncToken.prototype */
{
	initialize: function(options)
	{
		options || (options = {});
		
		conbo.setValues(this, conbo.pick(options, 
 		    'makeObjectsBindable', 
 		    'resultClass'
 		));
		
		this.responders = [];
		this.bindAll('dispatchResult', 'dispatchFault');
		
		var promise = options.promise;
		if (!promise) return;
		
		promise
			.done(this.dispatchResult)
			.fail(this.dispatchFault);
	},
	
	addResponder: function(responder)
	{
		if (!conbo.instanceOf(responder, conbo.Responder)) 
		{
			conbo.warn(responder+' is not a Responder');
			return;
		}
		
		this.responders.push(responder);
		
		return this;
	},
	
	// override
	dispatchResult: function(result, status, xhr)
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
			if (responder.resultHandler)
			{
				responder.resultHandler.call(responder.scope, event);
			}
		});
		
		this.dispatchEvent(event);
		
		return this;
	},
	
	// override
	dispatchFault: function(xhr, status, errorThrown)
	{
		var event = new conbo.ConboEvent('fault', {fault:errorThrown, status:xhr.status, xhr:xhr});
		
		this.responders.forEach(function(responder)
		{
			if (responder.faultHandler)
			{
				responder.faultHandler.call(responder.scope, event);
			}
		});
		
		this.dispatchEvent(event);
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.AsyncToken';
	},
	
});

__denumerate(conbo.AsyncToken.prototype);
