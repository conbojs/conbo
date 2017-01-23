/**
 * Conbo class
 * 
 * Base class for most Conbo framework classes that calls preinitialize before 
 * the constructor and initialize afterwards, populating the options parameter
 * with an empty Object if no parameter is passed and automatically making all
 * properties bindable.
 * 
 * @class		conbo.ConboClass
 * @augments	conbo.Class
 * @author		Neil Rackett
 * @param 		{object}	options - Class configuration object
 */
conbo.ConboClass = conbo.Class.extend(
/** @lends conbo.ConboClass.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param 	{object}	options - Class configuration object
	 */
	constructor: function(options)
	{
		var args = conbo.toArray(arguments);
		if (args[0] === undefined) args[0] = {};
		
		this.declarations.apply(this, args);
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
