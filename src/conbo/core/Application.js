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
	 * Default context class to use
	 * You'll normally want to override this with your own
	 */
	contextClass: conbo.Context,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options)
	{
		options = conbo.clone(options) || {};
		
		this.prefix = options.prefix || conbo.result(this, 'prefix') || '';
		this.namespace = options.namespace || conbo.result(this, 'namespace') || '';
		
		options.app = this;
		options.context = new this.contextClass(options);
		options.el || (options.el = this._findAppElement());
		
		conbo.View.prototype.constructor.apply(this, arguments);
		
		this.applyViews();
	},
	
	/**
	 * Apply View classes child DOM elements based on their cb-view attribute
	 */
	applyViews: function()
	{
		var selector = '[cb-view]';
		
		this.$(selector).not('.cb-view').each(this.bind(function(index, el)
		{
			var view = this.$(el).cbAttrs().view,
				viewClass;
			
			if (viewClass = this.getClass(view))
			{
				new viewClass(this.context.addTo({el:el}));
			}
			
		}));
		
		return this;
	},
	
	/**
	 * Attempt to convert string into a conbo.Class
	 * @param name
	 * @returns
	 */
	getClass: function(name)
	{
		if (!name) return;
		
		var viewClass = !!this.namespace
			? this.namespace[name]
			: eval(name);
		
		if (conbo.isClass(viewClass)) 
		{
			return viewClass;
		}		
	},
	
	toString: function()
	{
		return 'conbo.Application';
	},
	
	/**
	 * Find element with matching cb-app attribute, if it exists
	 */
	_findAppElement: function()
	{
		var $apps = $('[cb-app]');
		
		if (!$apps.length) return undefined;
		
		if (!this.namespace)
		{
			if (!!$apps.length)
			{
				console.warn('Application namespace not specified: unable to bind to cb-app element');
			}
			
			return undefined;
		}
		
		var appName;
		
		for (var a in this.namespace)
		{
			if (this instanceof this.namespace[a])
			{
				appName = a;
				break;
			}
		}
		
		if (!appName) return undefined;
		
		var selector = '[cb-app="'+this._addPrefix(appName)+'"]',
			el = $(selector)[0];
		
		return !!el ? el : undefined;
	},
	
	/**
	 * Returns prefixed class name
	 * @param 	name
	 * @returns
	 */
	_addPrefix: function(name)
	{
		name || (name = '');
		return !!this.prefix ? this.prefix+'.'+name : name;
	}

});
