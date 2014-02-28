/**
 * Injectable
 * 
 * Base class that enables the Conbo.js framework to add context to this 
 * class instance and inject specified dependencies (properties of undefined
 * value which match registered singletons)
 * 
 * @author		Neil Rackett
 */
conbo.Injectable = conbo.Class.extend
({
	constructor: function(options)
	{
		this._inject(options);
		this.initialize.apply(this, arguments);
	},
	
	toString: function()
	{
		return 'conbo.Injectable';
	},
	
	/**
	 * Inject
	 * @private
	 */
	_inject: function(options)
	{
		options || (options = {});
		
		this.defineAccessor
		(
			'context', 
			undefined, 
			this.bind(this._setContext), 
			_.result(this, 'context') || options.context
		);
		
		if (!!this.context()) 
		{
			this.context().injectSingletons(this);
		}
		
		return this;
	},
	
	/**
	 * Enables the shorthand use of this.context(value) to add the current
	 * context to an object or class instance.
	 * 
	 * Where value is an conbo.Context, the current context is changed.
	 * 
	 * @param 	{Object}		value
	 * @returns	{Object|this}
	 */
	_setContext: function(value)
	{
		if (value instanceof conbo.Context)
		{
			this._context = value;
			return this;
		}
		
		this.context().addTo(value);
		return value;
	}
});
