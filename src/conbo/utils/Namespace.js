/**
 * Conbo namespace
 * @author 	Neil Rackett
 */
conbo.Namespace = conbo.Class.extend
({
	initDom: function(rootEl)
	{
		conbo.initDom(this, rootEl);
		return this;
	},
	
	observeDom: function(rootEl)
	{
		conbo.observeDom(this, rootEl);
		return this;
	},
	
	unobserveDom: function(rootEl)
	{
		conbo.unobserveDom(this, rootEl);
		return this;
	},
	
});
