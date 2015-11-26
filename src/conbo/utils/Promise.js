/**
 * Promise
 * @author Neil Rackett
 */
conbo.Promise = conbo.EventDispatcher.extend
({
	initialize: function(options)
	{
		options || (options = {});
		
		this.bindAll('dispatchResult', 'dispatchFault');
	},
	
	dispatchResult: function(result)
	{
		this.dispatchEvent(new conbo.ConboEvent('result', {result:result}));
	},
	
	dispatchFault: function(fault)
	{
		this.dispatchEvent(new conbo.ConboEvent('fault', {fault:fault}));
	},
	
	toString: function()
	{
		return 'conbo.Promise';
	},
	
});

//__denumerate(conbo.Promise.prototype);
