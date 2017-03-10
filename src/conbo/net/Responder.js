/**
 * Responder
 * 
 * @class		conbo.Responder
 * @augments	conbo.Class
 * @author 		Neil Rackett
 * @param 		{function}	resultHandler - Function that handles successful results
 * @param 		{function}	faultHandler - Function that handles errors
 * @param 		{option} 	scope - The scope the callback functions should be run in
 * @fires		conbo.ConboEvent#RESULT
 * @fires		conbo.ConboEvent#FAULT
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
