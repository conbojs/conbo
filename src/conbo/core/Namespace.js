/**
 * Conbo namespaces enable you to create modular, encapsulated code, similar to
 * how you might use packages in languages like Java or ActionScript.
 * 
 * By default, namespaces will automatically call initDom() when the HTML page
 * has finished loading.
 * 
 * @class		conbo.Namespace
 * @augments	conbo.Class
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options
 */
conbo.Namespace = conbo.Class.extend(
/** @lends conbo.Namespace.prototype */
{
	constructor: function()
	{
		if ($)
		{
			// Automatically initializes the DOM when the page is completely loaded
			var init = this.bind(function()
			{
				if (this.autoInit !== false)
				{
					this.initDom();
				}
			});
			
			$(init);
		}
		
		conbo.Class.prototype.constructor.apply(this, arguments);
	},
	
	/**
	 * Search the DOM and initialize Applications contained in this namespace
	 * 
	 * @param 	{Element} rootEl - The root element to initialize (optional)
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
	 * @param 	{Element} rootEl - The root element to initialize (optional)
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
	 * @param 	{Element} rootEl - The root element to initialize (optional)
	 * @returns {this}
	 */
	unobserveDom: function(rootEl)
	{
		conbo.unobserveDom(this, rootEl);
		return this;
	},
	
});
