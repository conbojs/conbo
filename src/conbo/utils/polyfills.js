/*
 * Polyfills for common JavaScript methods that are missing from
 * older browsers (yes, IE, I'm looking at you!)
 * 
 * We're only include the minimum possible number here as we don't want 
 * to end up bloated with stuff most people will never use
 * 
 * @author		Neil Rackett
 */

if (!Array.prototype.indexOf) 
{
	Array.prototype.indexOf = function(value, fromIndex)
	{
		return _.indexOf(this, value, fromIndex); 
	};
}

if (!Array.prototype.forEach) 
{
	Array.prototype.forEach = function(callback, thisArg)
	{
		return _.each(this, callback, thisArg); 
	};
}

if (!String.prototype.trim) 
{
	String.prototype.trim = function () 
	{
		return this.replace(/^\s+|\s+$/g,''); 
	};
}

if (!Object.prototype.hasOwnProperty) 
{
	Object.prototype.hasOwnProperty = function(prop) 
	{
		return _.has(this, prop);
	};
}
