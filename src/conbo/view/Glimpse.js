/**
 * Glimpse
 * 
 * A lightweight element wrapper that has no dependencies, no context and 
 * no data binding, but is able to apply a super-simple template.
 * 
 * It's invisible to View, so it's great for creating components, and you 
 * can bind data to it using the `cb-data` attribute to set the data 
 * property of your Glimpse
 * 
 * @class		conbo.Glimpse
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options
 */
conbo.Glimpse = conbo.EventDispatcher.extend(
/** @lends conbo.Glimpse.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 * @private
	 */
	__construct: function(options)
	{
		if (options.el)
		{
			this.el = options.el;
		}
		
		this.__ensureElement();
		
		if (this.template)
		{
			this.el.innerHTML = this.template;
		}
	},
	
	/**
	 * The default `tagName` of a Glimpse is `div`.
	 */
	tagName: 'div',
	
	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	initialize: function(){},
		
	/**
	 * The class's element
	 */
	get el()
	{
		return this.__el;
	},
	
	set el(element)
	{
		if (this.__el)
		{
			this.__el.className = this.el.className.replace('cb-glimpse', '');
			delete this.el.cbGlimpse;
		}
		
		__defineUnenumerableProperty(this, '__el', element);
		
		element.className += ' cb-glimpse';
		element.cbGlimpse = this;
		
		this.dispatchChange('el');
	},
	
	toString: function()
	{
		return 'conbo.Glimpse';
	},
	
	/**
	 * Ensure that the View has a DOM element to render into, creating 
	 * a new element using the `id`, `className` and `tagName` properties if
	 * one does not already exist
	 * 
	 * @private
	 */
	__ensureElement: function() 
	{
		var el = this.el;
		
		if (!el) 
		{
			var attrs = conbo.defineValues({}, this.attributes);
			
			el = document.createElement(this.tagName);
			
			if (this.id) el.id = this.id;
			if (this.className) el.className = this.className;
			
			conbo.defineValues(el, attrs);
		}
		else 
		{
			if (this.className) el.className += ' '+this.className;
		}
		
		this.el = el;
		
		return this;
	},
	
});

__denumerate(conbo.Glimpse.prototype);
