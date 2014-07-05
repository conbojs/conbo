/**
 * Class
 * Extendable base class from which all others extend
 */
conbo.Class = function(options) 
{
	this.initialize.apply(this, arguments);
};

conbo.Class.prototype =
{
	/**
	 * Entry point
	 * 
	 * In most circumstances, custom classes should override initialize 
	 * and use it as your class constructor
	 */
	initialize: function() {},
	
	/**
	 * Calls the specified function after the current call stack has cleared
	 */
	defer: function(callback)
	{
		_.defer(this.bind.apply(this, [callback].concat(_.rest(arguments))));
		return this;
	},
	
	/**
	 * Calls the specified method on the _super object, scoped to this
	 * @param 	methodName		String
	 * @param	...				Zero or more additional parameters
	 */
	callSuper: function(methodName)
	{
		if (!this._super[methodName]) return undefined;
		return this._super[methodName].apply(this, _.rest(arguments));
	},
	
	/**
	 * Scope one or more methods to this class instance
	 * @param 	method
	 * @returns
	 */
	bind: function(method)
	{
		return _.bind.apply(_, [method, this].concat(_.rest(arguments)));
	},
	
	/**
	 * Scope all methods of this class instance to this class instance
	 * @returns this
	 */
	bindAll: function()
	{
		_.bindAll.apply(_, [this].concat(_.toArray(arguments)))
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Class';
	}
		
};

conbo.Class.extend = function(protoProps, staticProps)
{
	var child, parent=this;
	
	/**
	 * The constructor function for the new subclass is either defined by you
	 * (the "constructor" property in your `extend` definition), or defaulted
	 * by us to simply call the parent's constructor.
	 */
	child = protoProps && _.has(protoProps, 'constructor')
		? protoProps.constructor
		: function(){ return parent.apply(this, arguments); };
	
	_.extend(child, parent, staticProps);
	
	/**
	 * Set the prototype chain to inherit from parent, without calling
	 * parent's constructor
	 */
	var Surrogate = function(){ this.constructor = child; };
	Surrogate.prototype = parent.prototype;
	child.prototype = new Surrogate;
	
	if (protoProps) _.extend(child.prototype, protoProps);
	child.prototype._super = parent.prototype;
	
	return child;
};
