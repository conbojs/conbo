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
	 * Equivilent to ActionScript or Java `super`, enabling you to access 
	 * properties and methods of the super class, which is the case of
	 * JavaScript is the next prototype up the chain
	 */
	get proto()
	{
		return Object.getPrototypeOf(Object.getPrototypeOf(this));
	},
	
	/**
	 * Scope one or more methods to this class instance
	 * @param 	method
	 * @returns
	 */
	bind: function(method)
	{
		return conbo.bind.apply(conbo, [method, this].concat(conbo.rest(arguments)));
	},
	
	/**
	 * Scope all methods of this class instance to this class instance
	 * @returns this
	 */
	bindAll: function()
	{
		conbo.bindAll.apply(conbo, [this].concat(conbo.toArray(arguments)))
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Class';
	},
};

_denumerate(conbo.Class.prototype);

conbo.Class.extend = function(protoProps, staticProps)
{
	var child, parent=this;
	
	/**
	 * The constructor function for the new subclass is either defined by you
	 * (the 'constructor' property in your `extend` definition), or defaulted
	 * by us to simply call the parent's constructor.
	 */
	child = protoProps && conbo.has(protoProps, 'constructor')
		? protoProps.constructor
		: function() { return parent.apply(this, arguments); };
	
	conbo.extend(child, parent, staticProps);
	
	/**
	 * Set the prototype chain to inherit from parent, without calling
	 * parent's constructor
	 */
	var Surrogate = function(){ this.constructor = child; };
	Surrogate.prototype = parent.prototype;
	child.prototype = new Surrogate;
	
	if (protoProps)
	{
		conbo.extend(child.prototype, protoProps);
	}
	
	conbo.makeBindable(child.prototype);
	
	return child;
};

/**
 * Implements the specified pseudo-interface(s) on the class, copying 
 * the default methods or properties from the partial(s) if they have 
 * not already been implemented.
 * 
 * @example					var MyClass = conbo.Class.extend().implement(conbo.IInjectable);
 * @param	{Object}		Object containing one or more properties or methods to be implemented
 * @returns	{conbo.Class}
 */
conbo.Class.implement = function()
{
	var implementation = conbo.defaults.apply(conbo, conbo.union({}, arguments)),
		keys = conbo.keys(implementation),
		prototype = this.prototype;
	
	conbo.defaults(this.prototype, implementation);
	
	var rejected = conbo.reject(keys, function(key)
	{
		return prototype[key] !== conbo.notImplemented;
	});
	
	if (rejected.length)
	{
		throw new Error(prototype.toString()+' does not implement the following method(s): '+rejected.join(', '));
	}
	
	return this;
};
