/**
 * Class
 * Extendable base class from which all others extend
 */
conbo.Class = function(options) 
{
	this._inject(options);
	this.initialize.apply(this, arguments);
};

conbo.Class.prototype =
{
	initialize: function() {},
	
	/**
	 * Calls the specified function after the current call stack has cleared
	 */
	callLater: function(callback)
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
	 * Creates an AS3-style accessor when using an ECMAScript 5 compliant browser
	 * (Latest Chrome, Firefox, Safari and IE9+)
	 */
	defineProperty: function(name, getter, setter, initialValue)
	{
		if (!('defineProperty' in Object)) throw new Error('Object.defineProperty is not supported by the current browser');
		
		getter = getter || function() { return this['_'+name]; };
		setter = setter || function(value) { this['_'+name] = value; };
		
		Object.defineProperty(this, name, {enumerable:true, configurable:true, get:getter, set:setter});
		if (initialValue !== undefined) this[name] = initialValue;
		return this;
	},
	
	/**
	 * Creates a jQuery style, chainable property accessor
	 * @example		obj.x(123).y(456).visible(true);
	 */
	defineAccessor: function(name, getter, setter, initialValue)
	{
		getter = getter || function() { return this['_'+name]; };
		setter = setter || function(value) { this['_'+name] = value; return this; };
		
		this[name] = function()
		{
			return (arguments.length ? setter : getter).apply(this, arguments);
		};
		
		if (initialValue !== undefined) this[name](initialValue);
		return this;
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
		return '[conbo.Class]';
	},
	
	/**
	 * Injector
	 * Add context to this class instance and inject specified dependencies
	 * (properties of undefined value which match registered singletons)
	 * @private
	 */
	_inject: function(options)
	{
		this.options = _.defaults(options || {}, this.options);
		this.context || (this.context = this.options.context);
		
		if (this.context) this.context.injectSingletons(this);
		
		return this;
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

/*
 * Polyfills for common HTML5/JS methods
 * 
 * Only include the minimum possible number here: we don't want to end 
 * up bloated with stuff most people will never use
 */

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(value, fromIndex) 
		{ return _.indexOf(this, value, fromIndex); };
}

if (!Array.prototype.forEach) {
	Array.prototype.forEach = function(callback, thisArg)
		{ _.each(this, callback, thisArg); };
}

if (!String.prototype.trim) {
	String.prototype.trim = function () 
		{ return this.replace(/^\s+|\s+$/g,''); };
}
