/**
 * Class
 * Extendable base class from which all others extend
 * @class		conbo.Class
 * @param 		{object} options - Object containing initialisation options
 */
conbo.Class = function(options) 
{
	this.declarations.apply(this, arguments);
	this.preinitialize.apply(this, arguments);
	this.initialize.apply(this, arguments);
};

/**
 * @memberof conbo.Class
 */
conbo.Class.prototype =
{
	/**
	 * Declarations is used to declare instance properties used by this class 
	 */
	declarations: function() {},
	
	/**
	 * Preinitialize is called before any code in the constructor has been run
	 */
	preinitialize: function() {},
	
	/**
	 * Initialize (entry point) is called immediately after the constructor has completed
	 */
	initialize: function() {},
	
	/**
	 * Similar to `super` in ActionScript or Java, this property enables 
	 * you to access properties and methods of the super class prototype, 
	 * which is the case of JavaScript is the next prototype up the chain
	 */
	get supro()
	{
		return Object.getPrototypeOf(Object.getPrototypeOf(this));
	},
	
	/**
	 * Scope one or more methods to this class instance
	 * @param 	{function} method - The function to bind to this class instance
	 * @returns	this
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
		conbo.bindAll.apply(conbo, [this].concat(conbo.toArray(arguments)));
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Class';
	},
};

__denumerate(conbo.Class.prototype);

/**
 * Extend this class to create a new class
 * 
 * @memberof 	conbo.Class
 * @param		{object}	protoProps - Object containing the new class's prototype
 * @param		{object}	staticProps - Object containing the new class's static methods and properties
 * 
 * @example		
 * var MyClass = conbo.Class.extend
 * ({
 * 	doSomething:function()
 * 	{ 
 * 		console.log(':-)'); 
 * 	}
 * });
 */
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
	
	conbo.defineValues(child, parent, staticProps);
	
	/**
	 * Set the prototype chain to inherit from parent, without calling
	 * parent's constructor
	 */
	var Surrogate = function(){ this.constructor = child; };
	Surrogate.prototype = parent.prototype;
	child.prototype = new Surrogate();
	
	if (protoProps)
	{
		conbo.defineValues(child.prototype, protoProps);
	}
	
	conbo.makeBindable(child.prototype);
	
	return child;
};

/**
 * Implements the specified pseudo-interface(s) on the class, copying 
 * the default methods or properties from the partial(s) if they have 
 * not already been implemented.
 * 
 * @memberof	conbo.Class
 * @param		{Object} interface - Object containing one or more properties or methods to be implemented (an unlimited number of parameters can be passed)
 * 
 * @example
 * var MyClass = conbo.Class.extend().implement(conbo.IInjectable);
 */
conbo.Class.implement = function()
{
	var implementation = conbo.defineDefaults.apply(conbo, conbo.union([{}], arguments)),
		keys = conbo.keys(implementation),
		prototype = this.prototype;
	
	conbo.defineDefaults(this.prototype, implementation);
	
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
