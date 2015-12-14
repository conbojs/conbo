/**
 * Responder
 * 
 * @class		conbo.Responder
 * @augments	conbo.Class
 * @author 		Neil Rackett
 */
conbo.Responder = conbo.Class.extend(
/** @lends conbo.Responder */
{
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

__denumerate(conbo.Responder.prototype);
