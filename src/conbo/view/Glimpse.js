/**
 * Glimpse
 * 
 * A lightweight View that has no dependencies, doesn't take any options 
 * and doesn't support data binding
 */
conbo.Glimpse = conbo.Bindable.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function()
	{
		this._ensureElement();
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * The default `tagName` of a View's element is `"div"`.
	 */
	tagName: 'div',
	
	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	initialize: function(){},
	
	/**
	 * Your class should override **render**, which is called automatically 
	 * after your View is initialized. If you're using a template, this means
	 * **render** is called immediately after the template is applied to your
	 * View's element (`this.el`).
	 * 
	 * If you want to apply Lo-Dash, Mustache or any other third party
	 * templating to your View, this is the place to do it.
	 * 
	 * The convention is for **render** to always return `this`.
	 */
	render: function() 
	{
		return this;
	},
	
	/**
	 * Change the view's element (`this.el` property)
	 */
	setElement: function(element)
	{
		this.el = element;
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
			var attrs = _.extend({}, _.result(this, 'attributes'));
			var el = document.createElement(this.tagName);
			
			if (!!this.id) el.id = this.id;
			if (!!this.className) el.className = this.className;
			
			_.extend(el, attrs);
			
			this.setElement(el);
		}
		else 
		{
			this.setElement(this.el);
			if (!!this.className) this.el.className += ' '+this.className;
		}
	},
});
