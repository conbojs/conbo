/*
 * Internal utility methods
 */

/**
 * Dispatch a property change event from the specified object
 * @private
 */
var __dispatchChange = function(obj, propName)
{
	if (obj instanceof conbo.EventDispatcher)
	{
		var options = {property:propName, value:obj[propName]};
		
		obj.dispatchEvent(new conbo.ConboEvent('change:'+propName, options));
		obj.dispatchEvent(new conbo.ConboEvent('change', options));
	}
};

/**
 * Creates a property which can be bound to DOM elements and others
 * 
 * @param	{Object}	obj	- The EventDispatcher object on which the property will be defined
 * @param	{string}	propName - The name of the property to be defined
 * @param	{*}			[value] - The initial value of the property (optional)
 * @private
 */
var __defineBindableProperty = function(obj, propName, value)
{
	if (conbo.isAccessor(obj, propName)) return;
	if (arguments.length < 3) value = obj[propName];
	
	var enumerable = propName.indexOf('_') != 0;
	var internalName = '__'+propName;
	
	__definePrivateProperty(obj, internalName, value);

	var getter = function()
	{
		return this[internalName];
	};

	var setter = function(newValue)
	{
		if (!conbo.isEqual(newValue, this[internalName])) 
		{
			this[internalName] = newValue;
			__dispatchChange(this, propName);
		}
	};
	
	Object.defineProperty(obj, propName, {enumerable:enumerable, configurable:true, get:getter, set:setter});
};

/**
 * Used by ConboJS to define private and internal properties (usually prefixed 
 * with an underscore) that can't be enumerated
 * 
 * @private
 */
var __definePrivateProperty = function(obj, propName, value)
{
	if (arguments.length == 2)
	{
		value = obj[propName];
	}
	
	Object.defineProperty(obj, propName, {enumerable:false, configurable:true, writable:true, value:value});
	return this;
};

/**
 * Define properties that can't be enumerated
 * @private
 */
var __definePrivateProperties = function(obj, values)
{
	for (var key in values)
	{
		__definePrivateProperty(obj, key, values[key]);
	}
	
	return this;
}

/**
 * Convert enumerable properties of the specified object into non-enumerable ones
 * @private
 */
var __denumerate = function(obj)
{
	var regExp = arguments[1];
	
	var keys = regExp instanceof RegExp
		? conbo.filter(conbo.keys(obj), function(key) { return regExp.test(key); })
		: (arguments.length > 1 ? conbo.rest(arguments) : conbo.keys(obj));
	
	keys.forEach(function(key)
	{
		var descriptor = Object.getOwnPropertyDescriptor(obj, key) 
			|| {value:obj[key], configurable:true, writable:true};
		
		descriptor.enumerable = false;
		Object.defineProperty(obj, key, descriptor);
	});
	
	return this;
};

/**
 * Warn developers that the method they are using is deprecated
 * @private
 */
var __deprecated = function(message)
{
	conbo.warn('Deprecation warning: '+message);
};

/**
 * Shortcut for new conbo.ElementProxy(el);
 * @private
 */
var __ep = function(el)
{
	return new conbo.ElementProxy(el);
};
