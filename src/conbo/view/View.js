/**
 * View
 * 
 * Creating a conbo.View creates its initial element outside of the DOM,
 * if an existing element is not provided...
 * 
 * Some methods derived from the Backbone.js class of the same name
 */
conbo.View = conbo.Glimpse.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		conbo.propertize(this);
		
		options = conbo.clone(options) || {};
		
		this._configure(options);
		this._ensureElement();
		if (!!options) this.context = options.context;
		
 		this.initialize.apply(this, arguments);
		
		var templateUrl = conbo.result(this, 'templateUrl'),
			template;
		
		try
		{
			template = conbo.result(this, 'template');
		}
		catch (e) {}
		
		if (!!templateUrl)
		{
			this.loadTemplate(templateUrl);
		}
		else
		{
			if (!!template && conbo.isString(template))
			{
				this.$el.html(template);
			}
			
			this.render();
			this.bindView();
		}
	},
	
	/**
	 * jQuery delegate for element lookup, scoped to DOM elements within the
	 * current view. This should be prefered to global lookups where possible.
	 */
	$: function(selector)
	{
		return this.$el.find(selector);
	},
	
	/**
	 * Remove this view by taking the element out of the DOM, and removing any
	 * applicable events listeners.
	 */
	remove: function() 
	{
		this.unbindView()
			.removeEventListener();
		
		this.$el.remove();
		
		return this;
	},
	
	/**
	 * Change the view's element (`this.el` property) and re-bind events
	 */
	setElement: function(element)
	{
		var isBound = !!this.__bindings__;
		
		if (!!this.el) delete this.el.cbView;
		if (isBound) this.unbindView();
		
		conbo.defineIncalculableProperty(this, '$el', $(element));
		conbo.defineIncalculableProperty(this, 'el', this.$el[0]);
		
		this.el.cbView = this;
		
		if (isBound) this.bindView();
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ELEMENT_CHANGE));
		
		return this;
	},
	
	/**
	 * Append this DOM element from one View class instance this class 
	 * instances DOM element
	 * 
	 * @param 		view
	 * @returns 	this
	 */
	appendView: function(view)
	{
		if (arguments.length > 1)
		{
			conbo.each(arguments, function(view, index, list) {
				this.appendView(view);
			}, this);
			
			return this;
		}
		
		if (!(view instanceof conbo.View))
			throw new Error('Parameter must be instance of conbo.View class');
		
		this.$el.append(view.el);
		return this;
	},
	
	/**
	 * Prepend this DOM element from one View class instance this class 
	 * instances DOM element
	 * 
	 * @param 		view
	 * @returns 	this
	 */
	prependView: function(view)
	{
		if (arguments.length > 1)
		{
			conbo.each(arguments, function(view, index, list) {
				this.prependView(view);
			}, this);
			
			return this;
		}
		
		if (!(view instanceof conbo.View))
			throw new Error('Parameter must be instance of conbo.View class');
		
		this.$el.prepend(view.el);
		return this;
	},
	
	/**
	 * Automatically bind elements to properties of this View
	 * 
	 * @example	<div cb-bind="property|parseMethod" cb-hide="property">Hello!</div> 
	 * @returns	this
	 */
	bindView: function()
	{
		conbo.BindingUtils.bindView(this);
		return this;
	},
	
	/**
	 * Unbind elements from class properties
	 * @returns	this
	 */
	unbindView: function() 
	{
		conbo.BindingUtils.unbindView(this);
		return this;
	},
	
	/**
	 * Loads HTML template and apply it to this.el, storing the loaded
	 * template will in this.template
	 * 
	 * @param 	{String}	url			A string containing the URL to which the request is sent
	 * @param 	{Object}	data		A plain object or string that is sent to the server with the request
	 * @param 	{Function} 	callback	Callback in format function(responseText, textStatus, xmlHttpRequest)
	 * 
	 * @see					https://api.jquery.com/load/
	 */
	loadTemplate: function(url, data, callbackFunction)
	{
		this.unbindView();
		
		var completeHandler = this.bind(function(response, status, xhr)
		{
			this.template = response;
			
			if (!!callbackFunction)
			{
				callbackFunction.apply(this, arguments);
			}
			
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.TEMPLATE_LOADED));
			this.render();
			this.bindView();
		});
		
		this.$el.load(url, data, completeHandler);
	},	
	
	toString: function()
	{
		return 'conbo.View';
	},
	
	/**
	 * List of view options to be merged as properties.
	 */
	_viewOptions: 
	[
		'model', 
		'collection', 
		'el', 
		'id', 
		'attributes', 
		'className', 
		'tagName', 
		'template',
		'templateUrl'
	],	
	
	/**
	 * Performs the initial configuration of a View with a set of options.
	 * Keys with special meaning *(model, collection, id, className)*, are
	 * attached directly to the view.
	 * 
	 * @private
	 */
	_configure: function(options) 
	{
		if (this.options) options = conbo.extend({}, conbo.result(this, 'options'), options);
		conbo.extend(this, conbo.pick(options, this._viewOptions));
		this.options = options;
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
			var attrs = conbo.extend({}, conbo.result(this, 'attributes'));
			if (this.id) attrs.id = conbo.result(this, 'id');
			if (this.className) attrs['class'] = conbo.result(this, 'className');
			var $el = $('<' + conbo.result(this, 'tagName') + '>').attr(attrs);
			this.setElement($el);
		}
		else 
		{
			this.setElement(conbo.result(this, 'el'));
			if (!!this.className) this.$el.addClass(this.className);
		}
		
		if (this instanceof conbo.Application)
		{
			this.$el.addClass('cb-app');
		}
		
		this.$el.addClass('cb-view');
	},
});

conbo.denumerate(conbo.View.prototype);
