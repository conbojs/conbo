/**
 * Application
 * 
 * Base application class for client-side applications
 * 
 * @class		conbo.Application
 * @augments	conbo.View
 * @author		Neil Rackett
 * @param 		{object} options - Object containing optional initialisation options, see View
 * @fires		conbo.ConboEvent#ADD
 * @fires		conbo.ConboEvent#DETACH
 * @fires		conbo.ConboEvent#REMOVE
 * @fires		conbo.ConboEvent#BIND
 * @fires		conbo.ConboEvent#UNBIND
 * @fires		conbo.ConboEvent#TEMPLATE_COMPLETE
 * @fires		conbo.ConboEvent#TEMPLATE_FAULT
 * @fires		conbo.ConboEvent#CREATION_COMPLETE
 */
conbo.Application = conbo.View.extend(
/** @lends conbo.Application.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 * @private
	 */
	__construct: function(options)
	{
		options = conbo.clone(options) || {};
		
		if (!(this.namespace instanceof conbo.Namespace))
		{
			throw new Error('Application namespace must be an instance of conbo.Namespace');
		}
		
		options.app = this;
		options.context = new this.contextClass(options);
		options.el || (options.el = this.__findAppElement());
		
		conbo.View.prototype.__construct.call(this, options);
	},
	
	/**
	 * Default context class to use
	 * You'll normally want to override this with your own
	 */
	get contextClass() 
	{
		return this.__contextClass || conbo.Context;
	},
	
	set contextClass(value)
	{
		this.__contextClass = value;
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
	
	__setEl: function(element)
	{
		conbo.View.prototype.__setEl.call(this, element);
		this.$el.addClass('cb-app');
		return this;
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
	
});

__denumerate(conbo.Application.prototype);
