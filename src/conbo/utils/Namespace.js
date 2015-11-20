/**
 * Conbo namespace
 * @author 	Neil Rackett
 */
conbo.Namespace = conbo.Class.extend
({
	initDom: function(rootEl)
	{
		conbo.initDom(this, rootEl);
	},
	
	observeDom: function(rootEl)
	{
		conbo.observeDom(this, rootEl);
	},
	
	unobserveDom: function(rootEl)
	{
		conbo.unobserveDom(this, rootEl);
	},
	
});
