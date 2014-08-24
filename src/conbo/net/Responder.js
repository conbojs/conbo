/**
 * Responder
 * @author Neil Rackett
 */
conbo.Responder = conbo.Class.extend
({
	initialize: function(resultHandler, faultHandler, scope)
	{
		this.resultHandler = resultHandler;
		this.faultHandler = faultHandler;
		this.scope = scope;
	},
	
	toString: function()
	{
		return 'conbo.Responder';
	}
});

_denumerate(conbo.Responder.prototype);
