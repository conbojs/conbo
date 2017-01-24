var View__templateCache = {};

/**
 * View
 * 
 * Creating a conbo.View creates its initial element outside of the DOM,
 * if an existing element is not provided...
 * 
 * @class		conbo.View
 * @augments	conbo.Glimpse
 * @author 		Neil Rackett
 * @param 		{object}	options - Object containing optional initialisation options, including 'attributes', 'className', 'data', 'el', 'id', 'tagName', 'template', 'templateUrl'
 */
conbo.View = conbo.Glimpse.extend(
/** 
 * @lends 		conbo.View.prototype
 */
{
	/**
	 * @member		{object}	attributes - Attributes to apply to the View's element
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{string}	className - CSS class name(s) to apply to the View's element
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{object}	data - Arbitrary data Object
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{string}	id - ID to apply to the View's element
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{string}	tagName - The tag name to use for the View's element (if no element specified)
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{string}	template - Template to apply to the View's element
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{string}	templateUrl - Template to load and apply to the View's element
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{boolean}	templateCacheEnabled - Whether or not the contents of templateUrl should be cached on first load for use with future instances of this View class (default: true)
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{boolean}	autoInitTemplate - Whether or not the template should automatically be loaded and applied, rather than waiting for the user to call initTemplate (default: true)
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 * @private
	 */
	__construct: function(options)
	{
		options = conbo.clone(options) || {};
		
		var viewOptions = conbo.union
		(
			[
				'attributes',
				'className', 
				'data', 
				'id', 
				'tagName', 
				'template', 
				'templateUrl',
				'templateCacheEnabled',
				'autoInitTemplate',
			],
			
			// Adds interface properties
			conbo.intersection
			(
				conbo.properties(this, true), 
				conbo.properties(options)
			)
		);
		
		conbo.setValues(this, conbo.pick(options, viewOptions));
		conbo.makeBindable(this, ['currentState']);
		
		this.context = options.context;
		this.__setEl(options.el || document.createElement(this.tagName));
	},

	__postInitialize: function(options)
	{
		__definePrivateProperty(this, '__initialized', true);
		
		this.__content =  this.el.innerHTML;
		
		if (this.autoInitTemplate !== false)
		{
			this.initTemplate();
		}
	},
	
	/**
	 * This View's element wrapped as a jQuery object
	 * @deprecated
	 */
	get $el()
	{
		if (this.__el)
		{
			return $(this.el);
		}
	},
	
	/**
	 * This View's element
	 */
	get el()
	{
		return this.__el;
	},
	
	/**
	 * Has this view completed its life cycle phases?
	 */
	get initialized()
	{
		return !!this.__initialized;
	},
	
	/**
	 * Returns a reference to the parent View of this View, based on this 
	 * View element's position in the DOM
	 */
	get parent()
	{
		if (this.initialized)
		{
			return this.__getParent();
		}
	},
	
	/**
	 * Returns a reference to the parent Application of this View, based on
	 * this View element's position in the DOM
	 */
	get parentApp()
	{
		if (this.initialized)
		{
			return this.__getParent(true);
		}
	},
	
	/**
	 * Does this view have a template?
	 */
	get hasTemplate()
	{
		return !!(this.template || this.templateUrl);
	},
	
	/**
	 * A jQuery wrapped version of the `content` element
	 * 
	 * @see	#content
	 */
	get $content()
	{
		if (this.initialized)
		{
			var $content = this.$('[cb-content]:first');
			
			if ($content.closest('.cb-view')[0] == this.el)
			{
				return $content;
			}
		}
	},
	
	/**
	 * The element into which HTML content should be placed; this is either the 
	 * first DOM element with a `cb-content` or the root element of this view
	 */
	get content()
	{
		if (this.$content)
		{
			return this.$content[0];
		}
	},
	
	/**
	 * Does this View support HTML content?
	 */
	get hasContent()
	{
		return !!this.content;
	},
	
	/**
	 * A jQuery wrapped version of the body element
	 * @see		body
	 */
	get $body()
	{
		return this.$content || this.$el;
	},
	
	/**
	 * A View's body is the element to which content should be added:
	 * the View's content, if it exists, or the View's main element, if it doesn't
	 */
	get body()
	{
		return this.content || this.el;
	},
	
	/**
	 * The context that will automatically be applied to children
	 * when binding or appending Views inside of this View
	 */
	get subcontext()
	{
		return this.__subcontext || this.context;
	},
	
	set subcontext(value)
	{
		this.__subcontext = value;
	},
	
	/**
	 * jQuery delegate for finding elements within the current view, with 
	 * nested Views and Applications excluded from the search by default. 
	 * 
	 * This should be prefered to global lookups where possible.
	 * 
	 * @param	{string}	selector - The jQuery selector to use
	 * @param	{boolean}	isDeep - Whether or not to include nested views in the search (default: false)
	 */
	$: function(selector, isDeep)
	{
		if (isDeep)
		{
			return this.$el.find(selector);
		}
		
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
	 * Take the View's element element from of the DOM
	 */
	detach: function() 
	{
		this.$el.detach();		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.DETACH));
		
		return this;
	},
	
	/**
	 * Remove and destroy this View by taking the element out of the DOM, 
	 * unbinding it, removing all event listeners and removing the View from 
	 * its Context
	 */
	remove: function()
	{
		this.unbindView()
			.removeEventListener()
			;
		
		this.$el.remove();
		
		if (this.data)
		{
			this.data = undefined;
		}
		
		if (this.context)
		{
			this.context
				.uninjectSingletons(this)
				.removeEventListener(undefined, undefined, this)
				;
			
			this.context = undefined;
		}
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		
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
	
		this.$body.append(view.el);
		
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
		
		this.$body.prepend(view.el);
		
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
	 * Initialize the View's template, either by loading the templateUrl
	 * or using the contents of the template property, if either exist
	 */
	initTemplate: function()
	{
		var template = this.template;
		
		if (!!this.templateUrl)
		{
			this.loadTemplate();
		}
		else
		{
			if (conbo.isFunction(template))
			{
				template = template(this);
			}
			
			if (conbo.isString(template))
			{
				this.$el.html(template);
			}
			
			this.__initView();
		}
		
		return this;
	},
	
	/**
	 * Load HTML template and use it to populate this View's element
	 * 
	 * @param 	{String}	url			A string containing the URL to which the request is sent
	 */
	loadTemplate: function(url)
	{
		url || (url = this.templateUrl);
		
		var $el = this.$el;
		
		this.unbindView();
		
		if (this.templateCacheEnabled !== false && View__templateCache[url])
		{
			$el.html(View__templateCache[url]);
			this.__initView();
			
			return this;
		}
		
		var resultHandler = function(event)
		{
			var result = event.result;
			
			if (this.templateCacheEnabled !== false)
			{
				View__templateCache[url] = result;
			}
			
			$el.html(result);
			this.__initView();
		};
		
		var faultHandler = function(event)
		{
			$el.empty();
			
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.TEMPLATE_ERROR));
			this.__initView();
		};
		
		conbo.httpRequest({url:url, dataType:'text'})
			.then(resultHandler, faultHandler, this)
			;
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.View';
	},
	
	/**
	 * Set this View's element
	 * @private
	 */
	__setEl: function(element)
	{
		if (element instanceof $)
		{
			element = element[0];
		}
		
		var attrs = conbo.setValues({}, this.attributes);
		
		if (this.id && !element.id) 
		{
			attrs.id = this.id;
		}
		
		var el = element;
		var $el = $(el);
		
		el.cbView = this;
		
		$el.addClass('cb-view');
		$el.attr(attrs);
		$el.addClass(this.className);
		
		__definePrivateProperty(this, '__el', el);
		
		return this;
	},
	
	/**
	 * Populate and render the View's HTML content
	 * @private
	 */
	__initView: function()
	{
		if (this.hasTemplate && this.hasContent)
		{
			this.content.innerHTML = this.__content;
		}
		
		delete this.__content;
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.TEMPLATE_LOADED))
			.bindView()
			;
		
		conbo.defer(function()
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.INIT)) // Deprecated: use CREATION_COMPLETE
				.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CREATION_COMPLETE))
				;
		}, this);
		
		return this;
	},
	
	__getParent: function(selectApp)
	{
		if (!this.el 
			|| !this.el.parentElement 
			|| conbo.instanceOf(this, conbo.Application)
			)
		{
			return;
		}
		
		var selector = selectApp ? '.cb-app' : '.cb-view';
		var el = this.$el.parents(selector)[0];
		var parentApp = this.parentApp;
		
		if (el && (selectApp || (parentApp && parentApp.$el.has(el).length)))
		{
			return el.cbView;
		}
	}
	
});

__denumerate(conbo.View.prototype);
