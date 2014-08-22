/**
 * Responder
 * @author Neil Rackett
 */
conbo.Responder = conbo.Class.extend
({
	initialize: function(resultHandler, faultHandler)
	{
		this.resultHandler = resultHandler;
		this.faultHandler = faultHandler;
	}
});

_denumerate(conbo.Responder.prototype);
