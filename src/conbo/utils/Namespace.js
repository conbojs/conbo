/**
 * Namespace
 * 
 * @class		conbo.Namespace
 * @augments	conbo.Class
 * @author 		Neil Rackett
 */
conbo.Namespace = conbo.Class.extend(
/** @lends conbo.Namespace.prototype */
{
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
