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
		options = conbo.clone(options) || {};
		
		var viewOptions = 
		[
			'attributes',
			'className', 
			'data', 
			'el', 
			'id', 
			'tagName', 
			'template', 
			'templateUrl'
		];
		
		conbo.setValues(this, conbo.pick(options, viewOptions));
		
		this.__updateEl();
		this.context = options.context;
		
		__defineUnenumerableProperty(this, 'currentState');
		
 		this.initialize.apply(this, arguments);
 		
		conbo.makeAllBindable(this, (this.bindable || []).concat(['currentState']));
		
		var templateUrl = this.templateUrl,
			template = this.template;
		
		if (!!templateUrl)
		{
			this.loadTemplate(templateUrl);
		}
		else
		{
			if (conbo.isString(template))
			{
				this.$el.html(template);
			}
			
			this.__initView();
		}
	},
	
	/**
	 * Returns a reference to the parent View of this View, based on this 
	 * View element's position in the DOM
	 */
	get parent()
	{
		return this.__getParent();
	},
	
	/**
	 * Returns a reference to the parent Application of this View, based on
	 * this View element's position in the DOM
	 */
	get parentApp()
	{
		return this.__getParent(true);
	},
	
	/**
	 * A jQuery wrapped version of the `content` element
	 * 
	 * @see	#content
	 */
	get $content()
	{
		if (this.el)
		{
			var $content = this.$('[cb-content]');
			
			return $content.length
				? $content
				: this.$el;
		}
	},
	
	/**
	 * The element into which HTML content should be placed; this is either the 
	 * first DOM element with a `cb-content` or the root element of this view
	 */
	get content()
	{
		if (this.el)
		{
			return this.$content[0];
		}
	},
			
	/**
	 * The context that will automatically be applied to children
	 * when binding or appending Views inside of this View
	 */
	get subcontext()
	{
		return this._subcontext || this.context;
	},
	
	set subcontext(value)
	{
		this._subcontext = value;
	},
	
	/**
	 * jQuery delegate for element lookup, scoped to DOM elements within the
	 * current view and automatically excludes nested Views and Applications. 
	 * 
	 * This should be prefered to global lookups where possible.
	 */
	$: function(selector)
	{
		var $nestedViews = this.$el.find('.cb-app, [cb-app], .cb-view, [cb-view]');
		
		return this.$el.find(selector).filter(function()
		{
			if (!!$nestedViews.find(this).length || !!$nestedViews.filter(this).length) 
			{
				return false;
			}
			
			return true;
		});
	},
	
	/**
	 * Take the View's element element out of the DOM
	 */
	detach: function() 
	{
		this.$el.detach();		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.DETACH));
		
		return this;
	},
	
	/**
	 * Remove and destroy this View by taking the element out of the DOM, 
	 * unbinding it and removing all event listeners
	 */
	remove: function()
	{
		this.unbindView()
			.removeEventListener();
		
		this.$el.remove();
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		
		return this;
	},
	
	get $el()
	{
		return $(this.el);
	},
	
	set $el(element)
	{
		this.el = element;
	},
	
	get el()
	{
		return this._el;
	},
	
	/**
	 * Change the view's element (`this.el` property) and re-bind events
	 */
	set el(element)
	{
		var isBound = !!this.__bindings__;
		var el = this._el;
		var $el = $(element);
		
		if (!!el) delete el.cbView;
		if (isBound) this.unbindView();
		
		el = $el[0];
		el.cbView = this;
		
		__defineUnenumerableProperty(this, '_el', el);
		
		if (isBound) this.bindView();
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ELEMENT_CHANGE));
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
			conbo.forEach(arguments, function(view, index, list) 
			{
				this.appendView(view);
			},
			this);
			
			return this;
		}
		
		if (!(view instanceof conbo.View))
		{
			throw new Error('Parameter must be instance of conbo.View class');
		}
	
		this.$content.append(view.el);
		
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
			conbo.forEach(arguments, function(view, index, list) 
			{
				this.prependView(view);
			}, 
			this);
			
			return this;
		}
		
		if (!(view instanceof conbo.View))
		{
			throw new Error('Parameter must be instance of conbo.View class');
		}
		
		this.$content.prepend(view.el);
		
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
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.BOUND));
		return this;
	},
	
	/**
	 * Unbind elements from class properties
	 * @returns	this
	 */
	unbindView: function() 
	{
		conbo.BindingUtils.unbindView(this);
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.UNBOUND));
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
			
			this.__initView();
		});
		
		this.$el.load(url, data, completeHandler);
	},	
	
	toString: function()
	{
		return 'conbo.View';
	},
	
	/**
	 * Populate and render the View's HTML content
	 */
	__initView: function()
	{
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.TEMPLATE_LOADED));
		this.bindView();
		
		conbo.defer(this.bind(function()
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.INIT));
		}));
	},
	
	/**
	 * Ensure that the View has a DOM element to render and that its attributes,
	 * ID and classes are set correctly using the `id`, `className` and 
	 * `tagName` properties.
	 * 
	 * @private
	 */
	__updateEl: function() 
	{
		var attrs = conbo.setValues({}, this.attributes);
		
		if (!this.el) 
		{
			if (this.id) attrs.id = this.id;
			this.el = $('<'+this.tagName+'>');
		}
		
		this.$el.attr(attrs);
		this.$el.addClass('cb-view '+(this.className||''));
	},
	
	__getParent: function(findApp)
	{
		if (!this.el || conbo.instanceOf(this, conbo.Application))
		{
			return;
		}
		
		var selector = findApp
			? '.cb-app'
			: '.cb-view';
		
		var el = this.$el.parents().closest(selector)[0];
		
		if (el && (findApp || this.parentApp.$el.has(el).length))
		{
			return el.cbView;
		}
	},
	
});

__denumerate(conbo.View.prototype);
