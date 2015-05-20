/**
 * Glimpse
 * 
 * A lightweight element wrapper that has no dependencies, no context and 
 * doesn't support data binding, but can apply a super-simple template.
 * 
 * It's invisible to View, so it's great for creating components. 
 */
conbo.Glimpse = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options || (options = {});
		
		if (options.el)
		{
			this.setElement(options.el);
		}
		
		this._ensureElement();
		
		if (this.template)
		{
			this.el.innerHTML = this.template;
		}
		
		this.initialize.apply(this, arguments);
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
	 * Change the view's element (`this.el` property)
	 */
	setElement: function(element)
	{
		if (this.el) delete this.el.cbGlimpse;
		
		_defineIncalculableProperty(this, 'el', element);
		
		this.el.cbGlimpse = this;
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ELEMENT_CHANGE));
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Glimpse';
	},
	
	/**
	 * Ensure that the View has a DOM element to render into.
	 * If `this.el` is a string, pass it through `$()`, take the first
	 * matching element, and re-assign it to `el`. Otherwise, create
	 * an element from the `id`, `className` and `tagName` properties.
	 * 
	 * @private
	 */
	_ensureElement: function() 
	{
		if (!this.el) 
		{
			var attrs = conbo.extend({}, this.attributes);
			var el = document.createElement(this.tagName);
			
			if (!!this.id) el.id = this.id;
			if (!!this.className) el.className = this.className;
			
			conbo.extend(el, attrs);
			
			this.setElement(el);
		}
		else 
		{
			this.setElement(this.el);
			if (this.className) this.el.className += ' '+this.className;
		}
	},
	
});

_denumerate(conbo.Glimpse.prototype);
