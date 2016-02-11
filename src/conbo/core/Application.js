/**
 * Application
 * 
 * Base application class for client-side applications
 * 
 * @class		conbo.Application
 * @augments	conbo.View
 * @author		Neil Rackett
 * @param 		{object} options - Object containing optional initialisation options, see View
 */
conbo.Application = conbo.View.extend(
/** @lends conbo.Application.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 * @private
	 */
	constructor: function(options)
	{
		options = conbo.clone(options) || {};
		
		if (!conbo.instanceOf(this.namespace, conbo.Namespace))
		{
			throw new Error('Application namespace must be an instance of conbo.Namespace');
		}
		
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
		
		var mo;
			
		if (value)
		{
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
			mo = this.__mo;
			mo.removeEventListener();
			mo.disconnect();
			
			delete this.__mo;
		}
		
		this.dispatchChange('observeEnabled');
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Application';
	},
	
	/**
	 * Find element with matching cb-app attribute, if it exists
	 * @private
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
	 * @private
	 */
	__updateEl: function()
	{
		conbo.View.prototype.__updateEl.call(this);
		this.$el.addClass('cb-app');
	},
	
});

__denumerate(conbo.Application.prototype);
