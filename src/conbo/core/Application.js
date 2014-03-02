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
		
		this.defineAccessor('prefix', undefined, undefined, options.prefix || _.result(this, 'prefix') || '');
		this.defineAccessor('namespace', undefined, undefined, options.namespace || _.result(this, 'namespace'));
		
		options.app = this;
		options.context = new this.contextClass();
		options.el || (options.el = this._findAppElement());
		
		conbo.View.prototype.constructor.apply(this, arguments);
		
		this.applyViews();
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
			var view = this.$(el).cbData().view.replace(this._addPrefix(), '');
			
			var viewClass = !!this.namespace()
				? this.namespace()[view]
				: eval(view);
			
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
	 * Find element with matching cb-app attribute, if it exists
	 */
	_findAppElement: function()
	{
		if (!this.namespace())
		{
			console.warn('Application namespace has not been specified.');
			return undefined;
		}
		
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
		var el = $(selector)[0];
		
		if (!!el) return  el;
		return undefined;
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
