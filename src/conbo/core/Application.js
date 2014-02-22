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
		options.app = this;
		
		this.defineAccessor('context', undefined, undefined, new this.contextClass(options)); 
		this.defineAccessor('prefix', undefined, undefined, options.prefix || this.prefix || '');
		this.defineAccessor('namespace', undefined, undefined, options.namespace);
		
		if (!options.el && options.autoApply !== false)
		{
			this.applyApp();
		}
		
		conbo.View.prototype.constructor.apply(this, arguments);
		
		if (options.autoApply !== false)
		{
			this.applyViews();
		}
	},
	
	/**
	 * Apply this Application class to DOM element with matching cb-app attribute
	 */
	applyApp: function()
	{
		var appClassName;
		
		for (var a in this.namespace())
		{
			if (this instanceof this.namespace()[a])
			{
				appClassName = a;
				break;
			}
		}
		
		var selector = '[cb-app="'+this._addPrefix(appClassName)+'"]';
		var el = conbo.$(selector)[0];
		
		if (!!el) this.el = el;
		
		return this;
	},
	
	/**
	 * Apply View classes to DOM elements based on their cb-view attribute
	 */
	applyViews: function()
	{
		var selector = !!this.prefix()
			? '[cb-view^="'+this._addPrefix()+'"]'
			: '[cb-view]';
		
		this.$(selector).each(this.bind(function(index, el)
		{
			var view = this.$(el).cbData().view.replace(this._addPrefix(), ''),
				viewClass = this.namespace()[view];
			
			if (!_.isFunction(viewClass)) 
			{
				return;
			}
			
			new viewClass(this.context().addTo({el:el}));
			
		}));
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Application';
	},
	
	/**
	 * Returns prefixed class name
	 * @param 	name
	 * @returns
	 */
	_addPrefix: function(name)
	{
		name = name || '';
		return !!this.prefix() ? this.prefix()+'.'+name : name;
	}
	
});
