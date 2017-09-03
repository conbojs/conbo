/**
 * Conbo namespaces enable you to create modular, encapsulated code, similar to
 * how you might use packages in languages like Java or ActionScript.
 * 
 * By default, namespaces will automatically call initDom() when the HTML page
 * has finished loading.
 * 
 * @class		Namespace
 * @memberof	conbo
 * @augments	conbo.Class
 * @author 		Neil Rackett
 * @param 		{Object} options - Object containing initialisation options
 */
conbo.Namespace = conbo.ConboClass.extend(
/** @lends conbo.Namespace.prototype */
{
	__construct: function()
	{
		var readyHandler = function()
		{
			if (document && this.autoInit !== false)
			{
				this.initDom();
			}
		};
		
		conbo.ready(readyHandler, this);
	},
	
	/**
	 * Search the DOM and initialize Applications contained in this namespace
	 * 
	 * @param 	{Element} 	[rootEl] - The root element to initialize
	 * @returns {this}
	 */
	initDom: function(rootEl)
	{
		conbo.initDom(this, rootEl);
		return this;
	},
	
	/**
	 * Watch the DOM and automatically initialize Applications contained in 
	 * this namespace when an element with the appropriate cb-app attribute
	 * is added.
	 * 
	 * @param 	{Element} 	[rootEl] - The root element to initialize
	 * @returns {this}
	 */
	observeDom: function(rootEl)
	{
		conbo.observeDom(this, rootEl);
		return this;
	},
	
	/**
	 * Stop watching the DOM for Applications
	 * 
	 * @param 	{Element} 	[rootEl] - The root element to initialize
	 * @returns {this}
	 */
	unobserveDom: function(rootEl)
	{
		conbo.unobserveDom(this, rootEl);
		return this;
	},
	
	/**
	 * Add classes, properties or methods to the namespace. Using this method
	 * will not overwrite existing items of the same name.
	 * 
	 * @param 	{Object}			obj - An object containing items to add to the namespace 
	 * @returns	{conbo.Namespace}	This Namespace instance
	 */
	import: function(obj)
	{
		conbo.setDefaults.apply(conbo, [this].concat(conbo.toArray(arguments)));
		return this;
	},
	
});
