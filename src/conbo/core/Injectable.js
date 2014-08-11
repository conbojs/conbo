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
		conbo.propertize(this);
		
		if (!!options) 
		{
			this.context = options.context;
		}
		
		this.initialize.apply(this, arguments);
	},
	
	toString: function()
	{
		return 'conbo.Injectable';
	}
	
});

(function()
{
	var context;
	
	Object.defineProperty
	(
		conbo.Injectable.prototype,
		'context',
		
		{
			configurable: true,
			enumerable: false,
			
			get: function()
			{
				return context;
			},
			
			set: function(value)
			{
				if (value instanceof conbo.Context)
				{
					value.injectSingletons(this);
				}
				
				context = value;
			}
		}
	);
	
})();

conbo.denumerate(conbo.Injectable.prototype);
