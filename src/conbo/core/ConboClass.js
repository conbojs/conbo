/**
 * Conbo class
 * 
 * Base class for most Conbo framework classes that calls preinitialize before 
 * the constructor and initialize afterwards, populating the options parameter
 * with an empty Object if no parameter is passed and automatically making all
 * properties bindable.
 * 
 * @class		ConboClass
 * @memberof	conbo
 * @augments	conbo.Class
 * @author		Neil Rackett
 * @param 		{Object}	options - Class configuration object
 */
conbo.ConboClass = conbo.Class.extend(
/** @lends conbo.ConboClass.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param 	{Object|conbo.Context}	[options] - Options object
	 */
	constructor: function(options)
	{
		var args = conbo.toArray(arguments);
		
		if (args[0] === undefined) 
		{
			args[0] = {};
		}
		else if (args[0] instanceof conbo.Context && conbo.is(this, conbo.IInjectable, false)) 
		{
			args[0] = args[0].addTo();
		}
		
		this.declarations.apply(this, args);
		
		if (!!args[0].context)
		{
			this.context = args[0].context;
		}
	
		this.preinitialize.apply(this, args);
		this.__construct.apply(this, args);
		
		this.initialize.apply(this, args);
		conbo.makeAllBindable(this, this.bindable);
		this.__postInitialize.apply(this, args);
	},
	
	toString: function()
	{
		return 'conbo.ConboClass';
	},
	
	/**
	 * @private
	 */
	__construct: function() {},
	
	/**
	 * @private
	 */
	__postInitialize: function() {}
	
});

__denumerate(conbo.ConboClass.prototype);
