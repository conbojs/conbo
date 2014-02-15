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
		options = _.clone(options) || {};
		options.application = this;
		options.namespace = options.namespace || window;
		
		this.prefix = options.prefix || this.prefix || '';
		this.context = options.context || new this.contextClass(options);
		this.namespace = options.namespace;
		
		if (!options.el)
		{
			var appClassName;
			
			for (var a in this.namespace)
			{
				if (this instanceof this.namespace[a])
				{
					appClassName = a;
					break;
				}
			}
			
			var selector = '[cb-app="'+this.addPrefix(appClassName)+'"]';
			var el = conbo.$(selector)[0];
			
			if (!!el) options.el = el;
		}
		
		conbo.View.prototype.constructor.apply(this, arguments);
	},
	
	/**
	 * Get the prefixed class name
	 * @param 	name
	 * @returns
	 */
	addPrefix: function(name)
	{
		name = name || '';
		return !!this.prefix ? this.prefix+'.'+name : name;
	},
	
	/**
	 * Apply View classes to HTML elements based on their cb-view attribute
	 */
	bindViews: function()
	{
		var selector = !!this.prefix
			? '[cb-view^="'+this.addPrefix()+'"]'
			: '[cb-view]';
		
		this.$(selector).each(this.bind(function(index, el)
		{
			var view = this.$(el).cbData().view.replace(this.addPrefix(), ''),
				viewClass = this.namespace[view];
			
			if (!_.isFunction(viewClass)) 
			{
				return;
			}
			
			new viewClass(this.context.addTo({el:el}));
			
		}));
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Application';
	},
});
