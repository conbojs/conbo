/**
 * Application
 * 
 * Base application class for client-side applications
 * 
 * @author		Neil Rackett
 */
conbo.Application = conbo.View.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options = conbo.clone(options) || {};
		
		var namespace = options.namespace || this.namespace;
		
		if (conbo.isString(namespace))
		{
			namespace = conbo(namespace);
		}
		
		if (!namespace)
		{
			conbo.warn('Application namespace not specified');
		}
		
		__defineUnenumerableProperty(this, 'namespace', namespace);
		
		options.app = this;
		options.context = new this.contextClass(options);
		options.el || (options.el = this.__findAppElement());
		
		conbo.View.prototype.constructor.call(this, options);
		conbo.BindingUtils.applyViews(this, this.namespace);
	},
	
	/**
	 * Default context class to use
	 * You'll normally want to override this with your own
	 */
	get contextClass() 
	{
		return conbo.Context;
	},
	
	/**
	 * If true, the application will automatically apply Glimpse and View 
	 * classes to elements when they're added to the DOM 
	 */
	get observeEnabled()
	{
		return !!this.__mo;
	},
	
	set observeEnabled(value)
	{
		if (value == this.observeEnabled) return;
		
		if (value)
		{
			var mo;
			
			mo = new conbo.MutationObserver();
			mo.observe(this.el);
			
			mo.addEventListener(conbo.ConboEvent.ADD, function()
			{
				conbo.BindingUtils.applyViews(this, this.namespace);
				conbo.BindingUtils.applyViews(this, this.namespace, 'glimpse');
			}, 
			this);
			
			this.__mo = mo;
		}
		else if (this.__mo)
		{
			var mo = this.__mo;
			
			mo.removeEventListener();
			mo.disconnect();
			
			delete this.__mo;
		}
		
		this.dispatchChange('observeEnabled');
	},
	
	toString: function()
	{
		return 'conbo.Application';
	},
	
	/**
	 * Find element with matching cb-app attribute, if it exists
	 */
	__findAppElement: function()
	{
		var $apps = $('[cb-app]');
		
		if (!$apps.length) return undefined;
		
		if (!this.namespace)
		{
			if ($apps.length)
			{
				conbo.warn('Application namespace not specified: unable to bind to cb-app element');
			}
			
			return undefined;
		}
		
		var appName;
		
		for (var a in this.namespace)
		{
			if (conbo.isClass(this.namespace[a])
				&& this instanceof this.namespace[a])
			{
				appName = a;
				break;
			}
		}
		
		if (!appName) return undefined;
		
		var selector = '[cb-app="'+appName+'"]',
			el = $(selector)[0];
		
		return el || undefined;
	},
	
	/**
	 * Ensure that this class has an element
	 * @override
	 */
	__updateEl: function()
	{
		conbo.View.prototype.__updateEl.call(this);
		this.$el.addClass('cb-app');
	},
	
});

_denumerate(conbo.Application.prototype);
