(function(window, document, factory, undefined)
{
	/* Universal Module Definition (UMD) */

    // AMD (recommended)
    if (typeof define == 'function' && define.amd) 
	{
		define('conbo', function()
		{
			return factory(window, document);
		});
	}
	// Common.js & Node.js
	else if (typeof module != 'undefined' && module.exports)
	{
   		module.exports = factory(window, document);
    }
	// Global
	else
	{
		window.conbo = factory(window, document);
	}
	
})(this, this.document, function(window, document, undefined)
{
	'use strict';
	
/*! 
 * ConboJS: Lightweight MVC application framework for JavaScript
 * http://conbojs.mesmotronic.com/
 * 
 * Copyright (c) 2015 Mesmotronic Limited
 * Released under the MIT license
 * http://www.mesmotronic.com/legal/mit
 */

var __namespaces = {};

/**
 * ConboJS is a lightweight MVC application framework for JavaScript featuring 
 * dependency injection, context and encapsulation, data binding, command 
 * pattern and an event model which enables callback scoping and consistent 
 * event handling
 * 
 * Dependencies
 *
 * Lite: None
 * Complete: jQuery 1.7+
 * 
 * @namespace 	conbo
 * @param		namespace	{String}	The selected namespace
 * @author		Neil Rackett
 * @see			http://www.mesmotronic.com/
 * 
 * @example
 * // Conbo can replace the standard minification pattern with modular namespace definitions
 * // If an Object is returned, its contents will be added to the namespace
 * conbo('com.namespace.example', window, document, conbo, function(window, document, conbo, undefined)
 * {
 * 	var example = this;
 * 	
 * 	// Your code here
 * });  
 */
var conbo = function(namespace)
{
	if (!namespace || !conbo.isString(namespace))
	{
		conbo.warn('First parameter must be the namespace string, received', namespace);
		return;
	}

	if (!__namespaces[namespace])
	{
		__namespaces[namespace] = new conbo.Namespace();
	}
	
	var ns = __namespaces[namespace],
		params = conbo.rest(arguments),
		func = params.pop()
		;
	
	if (conbo.isFunction(func))
	{
		var obj = func.apply(ns, params);
		
		if (conbo.isObject(obj) && !conbo.isArray(obj))
		{
			ns.add(obj);
		}
	}
	
	return ns;
};

/**
 * Internal reference to self, enables full functionality to be used via 
 * ES2015 import statements
 * 
 * @augments	conbo
 * @returns		{conbo}
 * 
 * @example 
 * import {conbo} from 'conbo';
 */
conbo.conbo = conbo;

/**
 * @augments	conbo
 * @returns 	{String}
 */
conbo.VERSION = '4.0.5';
	
/**
 * @augments	conbo
 * @returns 	{String}
 */
conbo.toString = function() 
{ 
	return 'ConboJS v'+this.VERSION; 
};

/*
 * Internal utility methods
 */

/**
 * Dispatch a property change event from the specified object
 * @private
 */

var __dispatchChange = function(obj, propName)
{
	if (!(obj instanceof conbo.EventDispatcher)) return;
	
	var options = {property:propName, value:obj[propName]};
	
	obj.dispatchEvent(new conbo.ConboEvent('change:'+propName, options));
	obj.dispatchEvent(new conbo.ConboEvent('change', options));
	
	return this;
};

/**
 * Creates a property which can be bound to DOM elements and others
 * 
 * @param	(Object)	obj			The EventDispatcher object on which the property will be defined
 * @param	(String)	propName	The name of the property to be defined
 * @param	(*)			value		The default value of the property (optional)
 * @param	(Function)	getter		The getter function (optional)
 * @param	(Function)	setter		The setter function (optional)
 * @param	(Boolean)	enumerable	Whether of not the property should be enumerable (optional, default: true)
 * @private
 */
var __defineProperty = function(obj, propName, value, getter, setter, enumerable)
{
	if (conbo.isAccessor(obj, propName))
	{
		return this;
	}
	
	if (conbo.isUndefined(value))
	{
		value = obj[propName];
	}
	
	var nogs = !getter && !setter;
	
	if (arguments.length < 6)
	{
		enumerable = propName.indexOf('_') !== 0;
	}
	
	if (nogs)
	{
		getter = function()
		{
			return value;
		};
	
		setter = function(newValue)
		{
			if (!conbo.isEqual(newValue, value)) 
			{
				value = newValue;
				__dispatchChange(this, propName);
			}
		};
		
		setter.bindable = true;
	}
	else if (!!setter)
	{
		setter = conbo.wrap(setter, function(fn, newValue)
		{
			fn.call(this, newValue);
			__dispatchChange(this, propName);
		});
		
		setter.bindable = true;
	}
	
	Object.defineProperty(obj, propName, {enumerable:enumerable, configurable:true, get:getter, set:setter});
	
	return this;
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

/*
 * Utility methods: a modified subset of Underscore.js methods and loads of our own
 */

// TODO Remove methods that are now available natively in all target browsers

(function() 
{
	// Establish the object that gets returned to break out of a loop iteration.
	var breaker = false;

	// Save bytes in the minified (but not gzipped) version:
	var
		ArrayProto = Array.prototype, 
		ObjProto = Object.prototype, 
		FuncProto = Function.prototype
		;

	// Create quick reference variables for speed access to core prototypes.
	var
		push			= ArrayProto.push,
		slice			= ArrayProto.slice,
		concat			= ArrayProto.concat,
		toString		= ObjProto.toString,
		hasOwnProperty	= ObjProto.hasOwnProperty
		;

	// All ECMAScript 5 native function implementations that we hope to use
	// are declared here.
	var
		nativeIndexOf		= ArrayProto.indexOf,
		nativeLastIndexOf	= ArrayProto.lastIndexOf,
		nativeMap			= ArrayProto.map,
		nativeReduce		= ArrayProto.reduce,
		nativeReduceRight	= ArrayProto.reduceRight,
		nativeFilter		= ArrayProto.filter,
		nativeEvery			= ArrayProto.every,
		nativeSome			= ArrayProto.some,
		nativeIsArray		= Array.isArray,
		nativeKeys			= Object.keys
		;
	
	// Collection Functions
	// --------------------

	/**
	 * Handles objects, arrays, lists and raw objects using a for loop (because 
	 * tests show that a for loop can be twice as fast as a native forEach).
	 * 
	 * Return `false` to break the loop.
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The list to iterate
	 * @param		{function}	iterator - Iterator function with parameters: item, index, list
	 * @param		{object}	scope - The scope the iterator function should run in (optional)
	 */
	 conbo.forEach = function(obj, iterator, scope) 
	 {
		if (obj == undefined) return;
		
		var i, length;
		
		if (conbo.isIterable(obj)) 
		{
			for (i=0, length=obj.length; i<length; ++i) 
			{
				if (iterator.call(scope, obj[i], i, obj) === breaker) return;
			}
		}
		else
		{
			var keys = conbo.keys(obj);
			
			for (i=0, length=keys.length; i<length; i++) 
			{
				if (iterator.call(scope, obj[keys[i]], keys[i], obj) === breaker) return;
			}
		}
		
		return obj;
	};
	
	var forEach = conbo.forEach;
	
	/**
	 * Return the results of applying the iterator to each element.
	 * Delegates to native `map` if available.
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The list to iterate
	 * @param		{function}	iterator - Iterator function with parameters: item, index, list
	 * @param		{object}	scope - The scope the iterator function should run in (optional)
	 */
	conbo.map = function(obj, iterator, scope) 
	{
		var results = [];
		
		if (obj == undefined) return results;
		if (nativeMap && obj.map === nativeMap) return obj.map(iterator, scope);
		
		forEach(obj, function(value, index, list) 
		{
			results.push(iterator.call(scope, value, index, list));
		});
		
		return results;
	};
	
	/**
	 * Returns the index of the first instance of the specified item in the list
	 * 
	 * @param	{object}	obj - The list to search
	 * @param	{object}	item - The value to find the index of
	 */
	conbo.indexOf = function(obj, item)
	{
		return nativeIndexOf.call(obj, item);
	};
	
	/**
	 * Returns the index of the last instance of the specified item in the list
	 * 
	 * @param	{object}	obj - The list to search
	 * @param	{object}	item - The value to find the index of
	 */
	conbo.lastIndexOf = function(obj, item)
	{
		return nativeLastIndexOf.call(obj, item);
	};
	
	/**
	 * Return the first value which passes a truth test
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The list to iterate
	 * @param		{function}	predicate - Function that tests each value, returning true or false
	 * @param		{object}	scope - The scope the predicate function should run in (optional)
	 */
	conbo.find = function(obj, predicate, scope) 
	{
		var result;
		
		conbo.some(obj, function(value, index, list) 
		{
			if (predicate.call(scope, value, index, list)) 
			{
				result = value;
				return true;
			}
		});
		
		return result;
	};
	
	/**
	 * Return the index of the first value which passes a truth test
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The list to iterate
	 * @param		{function}	predicate - Function that tests each value, returning true or false
	 * @param		{object}	scope - The scope the predicate function should run in (optional)
	 */
	conbo.findIndex = function(obj, predicate, scope) 
	{
		var value = conbo.find(obj, predicate, scope);
		return obj.indexOf(value);
	};
	
	/**
	 * Return all the elements that pass a truth test.
	 * Delegates to native `filter` if available.
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The list to iterate
	 * @param		{function}	predicate - Function that tests each value, returning true or false
	 * @param		{object}	scope - The scope the predicate function should run in (optional)
	 */
	conbo.filter = function(obj, predicate, scope) 
	{
		var results = [];
		
		if (obj == undefined) return results;
		if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, scope);
		
		forEach(obj, function(value, index, list) 
		{
			if (predicate.call(scope, value, index, list)) results.push(value);
		});
		
		return results;
	};

	/**
	 * Return all the elements for which a truth test fails.
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The list to iterate
	 * @param		{function}	predicate - Function that tests each value, returning true or false
	 * @param		{object}	scope - The scope the predicate function should run in (optional)
	 */
	conbo.reject = function(obj, predicate, scope) 
	{
		return conbo.filter(obj, function(value, index, list) 
		{
			return !predicate.call(scope, value, index, list);
		},
		scope);
	};
	
	/**
	 * Determine whether all of the elements match a truth test.
	 * Delegates to native `every` if available.
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The list to iterate
	 * @param		{function}	predicate - Function that tests each value, returning true or false
	 * @param		{object}	scope - The scope the predicate function should run in (optional)
	 */
	conbo.every = function(obj, predicate, scope) 
	{
		predicate || (predicate = conbo.identity);
		
		var result = true;
		
		if (obj == undefined) return result;
		if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, scope);
		
		forEach(obj, function(value, index, list) 
		{
			if (!(result = result && predicate.call(scope, value, index, list))) return breaker;
		});
		
		return !!result;
	};

	/**
	 * Determine if at least one element in the object matches a truth test.
	 * Delegates to native `some` if available.
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The list to iterate
	 * @param		{function}	predicate - Function that tests each value, returning true or false
	 * @param		{object}	scope - The scope the predicate function should run in (optional)
	 */
	conbo.some = function(obj, predicate, scope) 
	{
		predicate || (predicate = conbo.identity);
		var result = false;
		if (obj == undefined) return result;
		if (nativeSome && obj.some === nativeSome) return obj.some(predicate, scope);
		forEach(obj, function(value, index, list) {
			if (result || (result = predicate.call(scope, value, index, list))) return breaker;
		});
		return !!result;
	};
	
	var some = conbo.some;
	
	/**
	 * Determine if the array or object contains a given value (using `===`).
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The list to iterate
	 * @param		{function}	target - The value to match
	 */
	conbo.contains = function(obj, target) 
	{
		if (obj == undefined) return false;
		return obj.indexOf(target) != -1;
	};

	/**
	 * Invoke a method (with arguments) on every item in a collection.
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The list to iterate
	 * @param		{function}	method - Function to invoke on every item
	 */
	conbo.invoke = function(obj, method) 
	{
		var args = slice.call(arguments, 2);
		var isFunc = conbo.isFunction(method);
		
		return conbo.map(obj, function(value) 
		{
			return (isFunc ? method : value[method]).apply(value, args);
		});
	};
	
	/**
	 * Convenience version of a common use case of `map`: fetching a property.
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object
	 * @param		{string}	key - Property name
	 */
	conbo.pluck = function(obj, key) 
	{
		return conbo.map(obj, conbo.property(key));
	};

	/**
	 * Return the maximum element or (element-based computation).
	 * Can't optimize arrays of integers longer than 65,535 elements.
	 * 
	 * @see https://bugs.webkit.org/show_bug.cgi?id=80797
	 * @memberof	conbo
	 * @param		{object}	obj - The list to iterate
	 * @param		{function}	iterator - Function that tests each value (optional)
	 * @param		{object}	scope - The scope the iterator function should run in (optional)
	 */
	conbo.max = function(obj, iterator, scope) 
	{
		if (!iterator && conbo.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) 
		{
			return Math.max.apply(Math, obj);
		}
		
		var result = -Infinity, lastComputed = -Infinity;
		
		forEach(obj, function(value, index, list) 
		{
			var computed = iterator ? iterator.call(scope, value, index, list) : value;
			if (computed > lastComputed) {
				result = value;
				lastComputed = computed;
			}
		});
		
		return result;
	};

	/**
	 * Return the minimum element (or element-based computation).
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The list to iterate
	 * @param		{function}	iterator - Function that tests each value (optional)
	 * @param		{object}	scope - The scope the iterator function should run in (optional)
	 */
	conbo.min = function(obj, iterator, scope) 
	{
		if (!iterator && conbo.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
			return Math.min.apply(Math, obj);
		}
		
		var result = Infinity, lastComputed = Infinity;
		
		forEach(obj, function(value, index, list) 
		{
			var computed = iterator ? iterator.call(scope, value, index, list) : value;
			
			if (computed < lastComputed) 
			{
				result = value;
				lastComputed = computed;
			}
		});
		
		return result;
	};

	/**
	 * Shuffle an array, using the modern version of the Fisher-Yates shuffle
	 * @see http://en.wikipedia.org/wiki/Fisher–Yates_shuffle
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The list to shuffle
	 */
	conbo.shuffle = function(obj) 
	{
		var rand;
		var index = 0;
		var shuffled = [];
		
		forEach(obj, function(value) 
		{
			rand = conbo.random(index++);
			shuffled[index - 1] = shuffled[rand];
			shuffled[rand] = value;
		});
		
		return shuffled;
	};

	/**
	 * An internal function to generate lookup iterators.
	 * @private
	 */
	var lookupIterator = function(value) 
	{
		if (value == undefined) return conbo.identity;
		if (conbo.isFunction(value)) return value;
		return conbo.property(value);
	};
	
	/**
	 * Convert anything iterable into an Array
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The object to convert into an Array 
	 */
	conbo.toArray = function(obj) 
	{
		if (!obj) return [];
		if (conbo.isArray(obj)) return slice.call(obj);
		if (conbo.isIterable(obj)) return conbo.map(obj, conbo.identity);
		return conbo.values(obj);
	};
	
	/**
	 * Return the number of elements in an object.
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The object to count the keys of
	 */
	conbo.size = function(obj) 
	{
		if (!obj) return 0;
		
		return conbo.isIterable(obj)
			? obj.length 
			: conbo.keys(obj).length;
	};
	
	// Array Functions
	// ---------------

	/**
	 * Get the last element of an array. Passing n will return the last N
	 * values in the array. The guard check allows it to work with `conbo.map`.
	 * 
	 * @memberof	conbo
	 * @param		{array}		array - The array to slice
	 * @param		{function}	n - The number of elements to return (default: 1)
	 * @param		{object}	guard - Optional
	 */
	conbo.last = function(array, n, guard) 
	{
		if (array == undefined) return undefined;
		if (n == undefined || guard) return array[array.length - 1];
		return slice.call(array, Math.max(array.length - n, 0));
	};

	/**
	 * Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	 * Especially useful on the arguments object. Passing an n will return
	 * the rest N values in the array. The guard
	 * check allows it to work with `conbo.map`.
	 * 
	 * @memberof	conbo
	 * @param		{array}		array - The array to slice
	 * @param		{function}	n - The number of elements to return (default: 1)
	 * @param		{object}	guard - Optional
	 */
	conbo.rest = function(array, n, guard) 
	{
		return slice.call(array, (n == undefined) || guard ? 1 : n);
	};

	/**
	 * Trim out all falsy values from an array.
	 * 
	 * @memberof	conbo
	 * @param		{array}		array - The array to trim
	 */
	conbo.compact = function(array) 
	{
		return conbo.filter(array, conbo.identity);
	};

	/**
	 * Internal implementation of a recursive `flatten` function.
	 * @private
	 */
	var flatten = function(input, shallow, output) 
	{
		if (shallow && conbo.every(input, conbo.isArray)) 
		{
			return concat.apply(output, input);
		}
		
		forEach(input, function(value) 
		{
			if (conbo.isArray(value) || conbo.isArguments(value)) 
			{
				shallow ? push.apply(output, value) : flatten(value, shallow, output);
			}
			else 
			{
				output.push(value);
			}
		});
		
		return output;
	};

	/**
	 * Flatten out an array, either recursively (by default), or just one level.
	 * 
	 * @memberof	conbo
	 * @param		{array}		array - The array to flatten
	 */
	conbo.flatten = function(array, shallow) 
	{
		return flatten(array, shallow, []);
	};

	/**
	 * Return a version of the array that does not contain the specified value(s).
	 * 
	 * @memberof	conbo
	 * @param		{array}		array - The array to remove the specified values from
	 */
	conbo.without = function(array) 
	{
		return conbo.difference(array, slice.call(arguments, 1));
	};

	/**
	 * Split an array into two arrays: one whose elements all satisfy the given
	 * predicate, and one whose elements all do not satisfy the predicate.
	 * 
	 * @memberof	conbo
	 * @param		{array}		array - The array to split
	 * @param		{function}	predicate - Function to determine a match, returning true or false
	 * @returns		{array}
	 */
	conbo.partition = function(array, predicate) 
	{
		var pass = [], fail = [];
		
		forEach(array, function(elem) 
		{
			(predicate(elem) ? pass : fail).push(elem);
		});
		
		return [pass, fail];
	};

	/**
	 * Produce a duplicate-free version of the array. If the array has already
	 * been sorted, you have the option of using a faster algorithm.
	 * 
	 * @memberof	conbo
	 * @param		{array}		array - The array to filter
	 * @param		{boolean}	isSorted - Should the returned array be sorted?
	 * @param		{object}	iterator - Iterator function
	 * @param		{object}	scope - The scope the iterator function should run in (optional)
	 */
	conbo.uniq = function(array, isSorted, iterator, scope) 
	{
		if (conbo.isFunction(isSorted)) 
		{
			scope = iterator;
			iterator = isSorted;
			isSorted = false;
		}
		
		var initial = iterator ? conbo.map(array, iterator, scope) : array;
		var results = [];
		var seen = [];
		
		forEach(initial, function(value, index) 
		{
			if (isSorted ? (!index || seen[seen.length - 1] !== value) : !conbo.contains(seen, value)) 
			{
				seen.push(value);
				results.push(array[index]);
			}
		});
		
		return results;
	};

	/**
	 * Produce an array that contains the union: each distinct element from all of
	 * the passed-in arrays.
	 * 
	 * @memberof	conbo
	 */
	conbo.union = function() 
	{
		return conbo.uniq(conbo.flatten(arguments, true));
	};

	/**
	 * Produce an array that contains every item shared between all the
	 * passed-in arrays.
	 * 
	 * @memberof	conbo
	 * @param		{array}		array - Array of values
	 * @returns		{array}
	 */
	conbo.intersection = function(array) 
	{
		var rest = slice.call(arguments, 1);
		
		return conbo.filter(conbo.uniq(array), function(item) 
		{
			return conbo.every(rest, function(other) 
			{
				return conbo.contains(other, item);
			});
		});
	};

	/**
	 * Take the difference between one array and a number of other arrays.
	 * Only the elements present in just the first array will remain.
	 * 
	 * @memberof	conbo
	 * @param		{array}		array - Array of compare
	 * @returns		{array}
	 */
	conbo.difference = function(array) 
	{
		var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
		return conbo.filter(array, function(value){ return !conbo.contains(rest, value); });
	};

	/**
	 * Converts lists into objects. Pass either a single array of `[key, value]`
	 * pairs, or two parallel arrays of the same length -- one of keys, and one of
	 * the corresponding values.
	 * 
	 * @memberof	conbo
	 * @param		{object}	list - List of keys
	 * @param		{object}	values - List of values
	 * @returns		{array}
	 */
	conbo.object = function(list, values) 
	{
		if (list == undefined) return {};
		
		var result = {};
		
		for (var i = 0, length = list.length; i < length; i++) 
		{
			if (values) 
			{
				result[list[i]] = values[i];
			}
			else 
			{
				result[list[i][0]] = list[i][1];
			}
		}
		return result;
	};
	
	/**
	 * Generate an integer Array containing an arithmetic progression. A port of
	 * the native Python `range()` function.
	 * 
	 * @see http://docs.python.org/library/functions.html#range
	 * @memberof	conbo
	 * @param		{number}	start - Start
	 * @param		{number}	stop - Stop
	 * @param		{number}	stop - Step
	 */
	conbo.range = function(start, stop, step) 
	{
		if (arguments.length <= 1) 
		{
			stop = start || 0;
			start = 0;
		}
		
		step = arguments[2] || 1;

		var length = Math.max(Math.ceil((stop - start) / step), 0);
		var idx = 0;
		var range = new Array(length);

		while(idx < length) 
		{
			range[idx++] = start;
			start += step;
		}

		return range;
	};

	// Function (ahem) Functions
	// ------------------

	// Reusable constructor function for prototype setting.
	var ctor = function(){};

	/**
	 * Create a function bound to a given object (assigning `this`)
	 * 
	 * @deprecated
	 * @memberof	conbo
	 * @param		{function}	func - Method to bind
	 * @param		{object}	scope - The scope to bind the method to
	 */
	conbo.bind = function(func, scope) 
	{
//		__deprecated('conbo.bind is deprecated, use native function.bind(obj)');
		return func.bind.apply(func, conbo.rest(arguments));
	};
	
	/**
	 * Bind one or more of an object's methods to that object. Remaining arguments
	 * are the method names to be bound. If no additional arguments are passed,
	 * all of the objects methods that are not native or accessors are bound to it.
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object to bind methods to
	 */
	conbo.bindAll = function(obj)
	{
		var funcs;
		
		if (arguments.length > 1)
		{
			funcs = conbo.rest(arguments);
		}
		else
		{
			funcs = conbo.filter(conbo.getFunctionNames(obj, true), function(func)
			{
				return !(conbo.isAccessor(obj, func) || conbo.isNative(obj[func]));
			});
		}
		
		funcs.forEach(function(func)
		{
			obj[func] = obj[func].bind(obj);
		});
		
		return obj;
	};

	/**
	 * Partially apply a function by creating a version that has had some of its
	 * arguments pre-filled, without changing its dynamic `this` scope. _ acts
	 * as a placeholder, allowing any combination of arguments to be pre-filled.
	 * 
	 * @memberof	conbo
	 * @param		{function}	func - Method to partially pre-fill
	 */
	conbo.partial = function(func) 
	{
		var boundArgs = slice.call(arguments, 1);
		
		return function() 
		{
			var position = 0;
			var args = boundArgs.slice();
			
			for (var i = 0, length = args.length; i < length; i++) 
			{
				if (args[i] === conbo) args[i] = arguments[position++];
			}
			
			while (position < arguments.length) args.push(arguments[position++]);
			return func.apply(this, args);
		};
	};	
	
	var ready__domContentLoaded = !document || ['complete', 'loaded'].indexOf(document.readyState) != -1;
	
	/**
	 * Calls the specified function as soon as the DOM is ready, or at the end 
	 * of the current callstack if the DOM is already ready
	 * 
	 * @memberof	conbo
	 * @param		{function}	func - The function to call
	 * @param		{object}	scope - The scope in which to run the specified function
	 */
	conbo.ready = function(func, scope)
	{
		var args = conbo.toArray(arguments);
		
		var readyHandler = function()
		{
			if (document)
			{
				document.removeEventListener('DOMContentLoaded', readyHandler);
			}
			
			ready__domContentLoaded = true;
			conbo.defer.apply(conbo, args);
		};
		
		ready__domContentLoaded
			? readyHandler()
			: document.addEventListener('DOMContentLoaded', readyHandler);
	};
	
	/**
	 * Defers a function, scheduling it to run after the current call stack has
	 * cleared.
	 * 
	 * @memberof	conbo
	 * @param		{function}	func - Function to call
	 * @param		{object}	scope - The scope in which to call the function
	 */
	conbo.defer = function(func, scope) 
	{
		if (scope)
		{
			func = func.bind(scope);
		}
		
		return setTimeout.apply(undefined, [func, 0].concat(conbo.rest(arguments, 2)));
	};

	var callLater__tasks = [];
	
	var callLater__run = function()
	{
		var task;
		
		while (task = callLater__tasks.shift()) 
		{
			task();
		}
	};
	
	/**
	 * Calls a function at the start of the next animation frame, useful when 
	 * updating multiple elements in the DOM
	 * 
	 * @memberof	conbo
	 * @param		{function}	func - Function to call
	 * @param		{object}	scope - The scope in which to call the function
	 */
	conbo.callLater = function(func, scope)
	{
		if (callLater__run.length === 0)
		{
			window.requestAnimationFrame(callLater__run);
		}
		
		var task = function()
		{
			func.apply(scope, conbo.rest(arguments, 2));
		}
		
		callLater__tasks.push(task);
	};
	
	/**
	 * Returns a function that will be executed at most one time, no matter how
	 * often you call it. Useful for lazy initialization.
	 * 
	 * @memberof	conbo
	 * @param		{function}	func - Function to call
	 */
	conbo.once = function(func) 
	{
		var ran = false, memo;
		
		return function() 
		{
			if (ran) return memo;
			ran = true;
			memo = func.apply(this, arguments);
			func = undefined;
			return memo;
		};
	};

	/**
	 * Returns the first function passed as an argument to the second,
	 * allowing you to adjust arguments, run code before and after, and
	 * conditionally execute the original function.
	 * 
	 * @memberof	conbo
	 * @param		{function}	func - Function to wrap
	 * @param		{function}	wrapper - Function to call 
	 */
	conbo.wrap = function(func, wrapper) 
	{
		return conbo.partial(wrapper, func);
	};
	
	// Object Functions
	// ----------------

	/**
	 * Extends Object.keys to retrieve the names of an object's enumerable 
	 * properties
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object to get keys from
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain?
	 * @returns		{array}
	 */
	conbo.keys = function(obj, deep)
	{
		if (!obj) return [];
		
		if (deep)
		{
			var keys = [];
			for (var key in obj) { keys.push(key); }
			return keys;
		}
		
		return nativeKeys(obj);
	};
	
	/**
	 * Extends Object.keys to retrieve the names of an object's enumerable 
	 * functions
	 * 
	 * @memberof	conbo
	 * @see			#keys
	 * @param		{object}	obj - Object to get keys from
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain?
	 * @param		{boolean}	includeAccessors - Whether or not to include accessors that contain functions (default: false)
	 * @returns		{array}
	 */
	conbo.functions = function(obj, deep, includeAccessors)
	{
		return conbo.filter(conbo.keys(obj, deep), function(name) 
		{
			return includeAccessors ? conbo.isFunction(obj[name]) : conbo.isFunc(obj, name);
		});
	};
	
	/**
	 * Extends Object.keys to retrieve the names of an object's enumerable 
	 * variables
	 * 
	 * @memberof	conbo
	 * @see			#keys
	 * @param		{object}	obj - Object to get keys from
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain?
	 * @returns		{array}
	 */
	conbo.variables = function(obj, deep)
	{
		return conbo.difference(conbo.keys(obj, deep), conbo.functions(obj, deep));
	};
	
	/**
	 * Extends Object.keys to retrieve the names of an object's enumerable 
	 * variables
	 * 
	 * @deprecated
	 * @memberof	conbo
	 * @see			#keys
	 * @param		{object}	obj - Object to get keys from
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain?
	 * @returns		{array}
	 */
	conbo.properties = function(obj, deep)
	{
		__deprecated('conbo.properties is deprecated, use conbo.variables');
		return conbo.variables(obj, deep);
	};
	
	/**
	 * Extends Object.getOwnPropertyNames to retrieve the names of every 
	 * property of an object, regardless of whether it's enumerable or 
	 * unenumerable
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object to get keys from
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain?
	 * @returns		{array}
	 */
	conbo.getPropertyNames = function(obj, deep)
	{
		if (!obj) return [];
		
		if (deep)
		{
			var names = [];
			do { names = names.concat(Object.getOwnPropertyNames(obj)); }
			while (obj = Object.getPrototypeOf(obj));
			return conbo.uniq(names);
		}
		
		return Object.getOwnPropertyNames(obj);
	};
	
	/**
	 * Extends Object.getOwnPropertyNames to retrieves the names of every 
	 * function of an object, regardless of whether it's enumerable or 
	 * unenumerable
	 * 
	 * @memberof	conbo
	 * @see			#getPropertyNames
	 * @param		{object}	obj - Object to get keys from
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain?
	 * @param		{boolean}	includeAccessors - Whether or not to include accessors that contain functions (default: false)
	 * @returns		{array}
	 */
	conbo.getFunctionNames = function(obj, deep, includeAccessors)
	{
		return conbo.filter(conbo.getPropertyNames(obj, deep), function(name) 
		{
			return includeAccessors ? conbo.isFunction(obj[name]) : conbo.isFunc(obj, name);
		});
	},
	
	/**
	 * Extends Object.getOwnPropertyNames to retrieves the names of every 
	 * variable of an object, regardless of whether it's enumerable or 
	 * unenumerable
	 * 
	 * @memberof	conbo
	 * @see			#getPropertyNames
	 * @param		{object}	obj - Object to get keys from
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain?
	 * @returns		{array}
	 */
	conbo.getVariableNames = function(obj, deep)
	{
		return conbo.difference(conbo.getPropertyNames(obj, deep), conbo.getFunctionNames(obj, deep));
	};
	
	/**
	 * Extends Object.getOwnPropertyDescriptor to return a property descriptor 
	 * for a property of a given object, regardless of where it is in the 
	 * prototype chain
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object containing the property
	 * @param		{string}	propName - Name of the property
	 * 
	 */
	conbo.getPropertyDescriptor = function(obj, propName)
	{
		if (!obj) return;
		
		do
		{
			var descriptor = Object.getOwnPropertyDescriptor(obj, propName);
			if (descriptor) return descriptor;
		}
		while (obj = Object.getPrototypeOf(obj))
	};
	
	/**
	 * Retrieve the values of an object's enumerable properties, optionally 
	 * including values further up the prototype chain
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object to get values from
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain?
	 */
	conbo.values = function(obj, deep) 
	{
		var keys = conbo.keys(obj, deep);
		var length = keys.length;
		var values = new Array(length);
		
		for (var i=0; i<length; i++)
		{
			values[i] = obj[keys[i]];
		}
		
		return values;
	};

	/**
	 * Define the values of the given object by cloning all of the properties 
	 * of the passed-in object(s), destroying and overwriting the target's 
	 * property descriptors and values in the process
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object to define properties on
	 * @returns		{object}
	 * @see			conbo.setValues
	 */
	conbo.defineValues = function(obj) 
	{
		forEach(slice.call(arguments, 1), function(source) 
		{
			if (!source) return;
			
			for (var propName in source) 
			{
				conbo.cloneProperty(source, propName, obj);
			}
		});
		
		return obj;
	};
	
	/**
	 * Define bindable values on the given object using the property names and
	 * of the passed-in object(s), destroying and overwriting the target's 
	 * property descriptors and values in the process
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object to define properties on
	 * @returns		{object}
	 */
	conbo.defineBindableValues = function(obj) 
	{
		forEach(slice.call(arguments, 1), function(source) 
		{
			if (!source) return;
			
			for (var propName in source) 
			{
				delete obj[propName];
				__defineProperty(obj, propName, source[propName]);
			}
		});
		
		return obj;
	};
	
	/**
	 * Return a copy of the object only containing the whitelisted properties.
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object to copy properties from
	 */
	conbo.pick = function(obj) 
	{
		var copy = {};
		var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
		
		forEach(keys, function(key) 
		{
			if (key in obj)
			{
				conbo.cloneProperty(obj, key, copy);
			}
		});
		
		return copy;
	};
	
	/**
	 * Return a copy of the object without the blacklisted properties.
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object to copy
	 */
	conbo.omit = function(obj) 
	{
		var copy = {};
		var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
		
		for (var key in obj) 
		{
			if (!conbo.contains(keys, key))
			{
				conbo.cloneProperty(obj, key, copy);
			}
		}
		
		return copy;
	};

	/**
	 * Fill in an object's missing properties by cloning the properties of the 
	 * source object(s) onto the target object, overwriting the target's
	 * property descriptors
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object to populate
	 * @see			conbo.setDefaults
	 */
	conbo.defineDefaults = function(obj) 
	{
		forEach(slice.call(arguments, 1), function(source) 
		{
			if (source) 
			{
				for (var propName in source) 
				{
					if (obj[propName] !== undefined) continue;
					conbo.cloneProperty(source, propName, obj);
				}
			}
		});
		
		return obj;
	};
	
	/**
	 * Fill in missing values on an object by setting the property values on 
	 * the target object, without affecting the target's property descriptors
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object to populate
	 */
	conbo.setDefaults = function(obj) 
	{
		forEach(slice.call(arguments, 1), function(source) 
		{
			if (source) 
			{
				for (var propName in source) 
				{
					if (obj[propName] !== undefined) continue;
					obj[propName] = source[propName];
				}
			}
		});
		
		return obj;
	};
	
	/**
	 * Create a (shallow-cloned) duplicate of an object.
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object to clone
	 */
	conbo.clone = function(obj) 
	{
		if (!conbo.isObject(obj)) return obj;
		return conbo.isArray(obj) ? obj.slice() : conbo.defineValues({}, obj);
	};
	
	// Internal recursive comparison function for `isEqual`.
	var eq = function(a, b, aStack, bStack) {
		// Identical objects are equal. `0 === -0`, but they aren't identical.
		// See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
		if (a === b) return a !== 0 || 1 / a == 1 / b;
		// A strict comparison is necessary because `null == undefined`.
		if (a == null || b == null) return a === b;
		// Unwrap any wrapped objects.
		// Compare `[[Class]]` names.
		var className = toString.call(a);
		if (className != toString.call(b)) return false;
		switch (className) {
			// Strings, numbers, dates, and booleans are compared by value.
			case '[object String]':
				// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
				// equivalent to `new String("5")`.
				return a == String(b);
			case '[object Number]':
				// `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
				// other numeric values.
				return a != +a ? b != +b : (a === 0 ? 1 / a == 1 / b : a == +b);
			case '[object Date]':
			case '[object Boolean]':
				// Coerce dates and booleans to numeric primitive values. Dates are compared by their
				// millisecond representations. Note that invalid dates with millisecond representations
				// of `NaN` are not equivalent.
				return +a == +b;
			// RegExps are compared by their source patterns and flags.
			case '[object RegExp]':
				return a.source == b.source &&
							 a.global == b.global &&
							 a.multiline == b.multiline &&
							 a.ignoreCase == b.ignoreCase;
		}
		if (typeof a != 'object' || typeof b != 'object') return false;
		// Assume equality for cyclic structures. The algorithm for detecting cyclic
		// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
		var length = aStack.length;
		while (length--) {
			// Linear search. Performance is inversely proportional to the number of
			// unique nested structures.
			if (aStack[length] == a) return bStack[length] == b;
		}
		// Objects with different constructors are not equivalent, but `Object`s
		// from different frames are.
		var aCtor = a.constructor, bCtor = b.constructor;
		if (aCtor !== bCtor && !(conbo.isFunction(aCtor) && (aCtor instanceof aCtor) &&
														 conbo.isFunction(bCtor) && (bCtor instanceof bCtor))
												&& ('constructor' in a && 'constructor' in b)) {
			return false;
		}
		// Add the first object to the stack of traversed objects.
		aStack.push(a);
		bStack.push(b);
		var size = 0, result = true;
		// Recursively compare objects and arrays.
		if (className == '[object Array]') {
			// Compare array lengths to determine if a deep comparison is necessary.
			size = a.length;
			result = size == b.length;
			if (result) {
				// Deep compare the contents, ignoring non-numeric properties.
				while (size--) {
					if (!(result = eq(a[size], b[size], aStack, bStack))) break;
				}
			}
		} else {
			// Deep compare objects.
			for (var key in a) {
				if (conbo.has(a, key)) {
					// Count the expected number of properties.
					size++;
					// Deep compare each member.
					if (!(result = conbo.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
				}
			}
			// Ensure that both objects contain the same number of properties.
			if (result) {
				for (key in b) {
					if (conbo.has(b, key) && !(size--)) break;
				}
				result = !size;
			}
		}
		// Remove the first object from the stack of traversed objects.
		aStack.pop();
		bStack.pop();
		return result;
	};

	/**
	 * Perform a deep comparison to check if two objects are equal.
	 * 
	 * @memberof	conbo
	 * @param		{object}	a - Object to compare
	 * @param		{object}	b - Object to compare
	 * @returns		{boolean}
	 */
	conbo.isEqual = function(a, b) 
	{
		return eq(a, b, [], []);
	};

	/**
	 * Is the value empty?
	 * Based on PHP's `empty()` method
	 * 
	 * @memberof	conbo
	 * @param		{any}		value - Value that might be empty
	 * @returns		{boolean}
	 */
	conbo.isEmpty = function(value)
	{
		return !value // 0, false, undefined, null, ""
			|| (conbo.isArray(value) && value.length === 0) // []
			|| (!isNaN(value) && !parseFloat(value)) // "0", "0.0", etc
			|| (conbo.isObject(value) && !conbo.keys(value).length) // {}
			|| (conbo.isObject(value) && 'length' in value && value.length === 0) // Arguments, List, etc
			;
	};
	
	/**
	 * Can the value be iterated using a for loop? For example an Array, Arguments, ElementsList, etc.
	 * 
	 * @memberof	conbo
	 * @param		{any}		obj - Object that might be iterable 
	 * @returns		{boolean}
	 */
	conbo.isIterable = function(obj)
	{
		return obj && obj.length === +obj.length;
	};
	
	/**
	 * Is a given value a DOM element?
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Value that might be a DOM element
	 * @returns		{boolean}
	 */
	conbo.isElement = function(obj) 
	{
		return !!(obj && obj.nodeType === 1);
	};
	
	/**
	 * Is a given value an array?
	 * Delegates to ECMA5's native Array.isArray
	 * 
	 * @function
	 * @memberof	conbo
	 * @param		{object}	obj - Value that might be an Array
	 * @returns		{boolean}
	 */
	conbo.isArray = nativeIsArray || function(obj) 
	{
		return toString.call(obj) == '[object Array]';
	};

	/**
	 * Is a given variable an object?
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Value that might be an Object
	 */
	conbo.isObject = function(obj) 
	{
		return obj === Object(obj);
	};

	/**
	 * @member		{function}	isArguments - Is the specified object Arguments? 
	 * @memberOf	conbo
	 */
	
	/**
	 * @member		{function}	isFunction - Is the specified object a Function? 
	 * @memberOf	conbo
	 */
	
	/**
	 * @member		{function}	isString - Is the specified object a String? 
	 * @memberOf	conbo
	 */
	
	/**
	 * @member		{function}	isNumber - Is the specified object a Number? 
	 * @memberOf	conbo
	 */
	
	/**
	 * @member		{function}	isDate - Is the specified object a Date? 
	 * @memberOf	conbo
	 */
	
	/**
	 * @member		{function}	isRegExp - Is the specified object a RegExp (regular expression)? 
	 * @memberOf	conbo
	 */
	
	// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
	forEach(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) 
	{
		conbo['is' + name] = function(obj) 
		{
			return toString.call(obj) == '[object ' + name + ']';
		};
	});

	// Define a fallback version of the method in browsers (ahem, IE), where
	// there isn't any inspectable "Arguments" type.
	if (!conbo.isArguments(arguments)) 
	{
		conbo.isArguments = function(obj) 
		{
			return !!(obj && conbo.has(obj, 'callee'));
		};
	}
	
	// Optimize `isFunction` if appropriate.
	if (typeof(/./) !== 'function') 
	{
		conbo.isFunction = function(obj) 
		{
			return typeof obj === 'function';
		};
	}
	
	/**
	 * Detects whether the specified property was defined as a function, meaning
	 * accessors containing functions are excluded
	 * 
	 * @memberof	conbo
	 * @see			#isFunction
	 * 
	 * @param		{object}	Object containing the property
	 * @param		{string}	The name of the property
	 * @returns		{boolean}	true if it's a function
	 */
	conbo.isFunc = function(obj, propName)
	{
		var descriptor = conbo.getPropertyDescriptor(obj, propName);
		return descriptor && typeof(descriptor.value) == 'function';
	};
	
	/**
	 * Is a given object a finite number?
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Value that might be finite
	 * @returns		{boolean}
	 */
	conbo.isFinite = function(obj) 
	{
		return isFinite(obj) && !isNaN(parseFloat(obj));
	};

	/**
	 * Is the given value `NaN`? (NaN is the only number which does not equal itself).
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Value that might be NaN
	 * @returns		{boolean}
	 */
	conbo.isNaN = function(obj) 
	{
		return conbo.isNumber(obj) && obj != +obj;
	};

	/**
	 * Is a given value a boolean?
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Value that might be a Boolean
	 * @returns		{boolean}
	 */
	conbo.isBoolean = function(obj) 
	{
		return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
	};

	/**
	 * Is a given value equal to null?
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Value that might be null
	 * @returns		{boolean}
	 */
	conbo.isNull = function(obj)
	{
		return obj === null;
	};

	/**
	 * Is a given variable undefined?
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Value that might be undefined
	 * @returns		{boolean}
	 */
	conbo.isUndefined = function(obj) 
	{
		return obj === undefined;
	};

	/**
	 * Shortcut function for checking if an object has a given property directly
	 * on itself (in other words, not on a prototype).
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object
	 * @param		{string}	key - Property name
	 * @returns		{boolean}
	 */
	conbo.has = function(obj, key)
	{
		return hasOwnProperty.call(obj, key);
	};
	
	// Utility Functions
	// -----------------

	/**
	 * Keep the identity function around for default iterators.
	 * 
	 * @memberof	conbo
	 * @param		{any}		obj - Value to return
	 * @returns		{any}
	 */
	conbo.identity = function(value) 
	{
		return value;
	};
	
	/**
	 * Get the property value
	 * 
	 * @memberof	conbo
	 * @param		{string}	key - Property name
	 */
	conbo.property = function(key) 
	{
		return function(obj) 
		{
			return obj[key];
		};
	};

	/**
	 * Returns a predicate for checking whether an object has a given set of `key:value` pairs.
	 * 
	 * @memberof	conbo
	 * @param		{object}	attrs - Object containing key:value pairs to compare
	 */
	conbo.matches = function(attrs) 
	{
		return function(obj) 
		{
			if (obj === attrs) return true; //avoid comparing an object to itself.
			
			for (var key in attrs) 
			{
				if (attrs[key] !== obj[key])
				{
					return false;
				}
			}
			return true;
		};
	};
	
	/**
	 * Return a random integer between min and max (inclusive).
	 * 
	 * @memberof	conbo
	 * @param		{number}	min - Minimum number
	 * @param		{number}	max - Maximum number
	 * @returns		{number}
	 */
	conbo.random = function(min, max)
	{
		if (max == undefined) 
		{
			max = min;
			min = 0;
		}
		
		return min + Math.floor(Math.random() * (max - min + 1));
	};
	
	var idCounter = 0;

	/**
	 * Generate a unique integer id (unique within the entire client session).
	 * Useful for temporary DOM ids.
	 * 
	 * @memberof	conbo
	 * @param		{string}	prefix - String to prefix unique ID with
	 */
	conbo.uniqueId = function(prefix) 
	{
		var id = ++idCounter + '';
		return prefix ? prefix + id : id;
	};
	
	/**
	 * Is Conbo supported by the current browser?
	 * 
	 * @memberof	conbo
	 */
	conbo.isSupported = 
		window.addEventListener
		&& !!Object.defineProperty 
		&& !!Object.getOwnPropertyDescriptor;
	
	/**
	 * A function that does nothing
	 * @memberof	conbo
	 */
	conbo.noop = function() {}; 
	
	/**
	 * Default function to assign to the methods of pseudo-interfaces
	 * 
	 * @example	IExample = { myMethod:conbo.notImplemented };
	 * @memberof	conbo
	 */
	conbo.notImplemented = function() 
	{
		conbo.warn('Method not implemented');
	};
	
	/**
	 * Convert dash-or_underscore separated words into camelCaseWords
	 * 
	 * @memberof	conbo
	 * @param		{string}	string - underscore_case_string to convertToCamelCase
	 * @param		{boolean}	initCap - Should the first letter be a CapitalLetter? (default: false)
	 */
	conbo.toCamelCase = function(string, initCap)
	{
		var s = (string || '').toLowerCase().replace(/([\W_])([a-z])/g, function (g) { return g[1].toUpperCase(); }).replace(/(\W+)/, '');
		if (initCap) return s.charAt(0).toUpperCase() + s.slice(1);
		return s;
	};
	
	/**
	 * Convert camelCaseWords into underscore_case_words (or another user defined separator)
	 * 
	 * @memberof	conbo
	 * @param		{string}	string - camelCase string to convert to underscore_case
	 * @param		{string}	separator - Default: "_"
	 */
	conbo.toUnderscoreCase = function(string, separator)
	{
		separator || (separator = '_');
		return (string || '').replace(/\W+/g, separator).replace(/([a-z\d])([A-Z])/g, '$1'+separator+'$2').toLowerCase();
	};
	
	/**
	 * Convert camelCaseWords into kebab-case-words
	 * 
	 * @memberof	conbo
	 * @param		{string}	string - camelCase string to convert to underscore_case
	 */
	conbo.toKebabCase = function(string)
	{
		return conbo.toUnderscoreCase(string, '-');
	};
	
	conbo.padLeft = function(value, minLength, padChar)
	{
		if (!padChar && padChar !== 0) padChar = ' ';
		if (!value && value !== 0) value = '';
		
		minLength || (minLength = 2);
		
		padChar = padChar.toString().charAt(0);
		string = value.toString();
		
		while (string.length < minLength)
		{
			string = padChar+string;
		}
		
		return string;
	};
	
	/**
	 * Add a leading zero to the specified number and return it as a string
	 * @memberof 	conbo
	 * @param		{number}	number - The number to add a leading zero to
	 * @param		{number}	minLength - the minumum length of the returned string (default: 2)
	 */
	conbo.addLeadingZero = function(number, minLength)
	{
		return conbo.padLeft(number, minLength, 0);
	};
	
	/**
	 * Format a number using the selected number of decimals, using the 
	 * provided decimal point, thousands separator 
	 * 
	 * @memberof	conbo
	 * @see 		http://phpjs.org/functions/number_format/
	 * @param 		number
	 * @param 		decimals				default: 0
	 * @param 		decimalPoint			default: '.'
	 * @param 		thousandsSeparator		default: ','
	 * @returns		{string}				Formatted number
	 */
	conbo.formatNumber = function(number, decimals, decimalPoint, thousandsSeparator) 
	{
		number = (number+'').replace(/[^0-9+\-Ee.]/g, '');
		
		var n = !isFinite(+number) ? 0 : +number,
			prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
			sep = conbo.isUndefined(thousandsSeparator) ? ',' : thousandsSeparator,
			dec = conbo.isUndefined(decimalPoint) ? '.' : decimalPoint,
			s = n.toFixed(prec).split('.')
			;
		
		if (s[0].length > 3) 
		{
			s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
		}
		
		if ((s[1] || '').length < prec) 
		{
			s[1] = s[1] || '';
			s[1] += new Array(prec-s[1].length+1).join('0');
		}
		
		return s.join(dec);
	};
	
	/**
	 * Format a number as a currency
	 * 
	 * @memberof	conbo
	 * @param number
	 * @param symbol
	 * @param suffixed
	 * @param decimals
	 * @param decimalPoint
	 * @param thousandsSeparator
	 */
	conbo.formatCurrency = function(number, symbol, suffixed, decimals, decimalPoint, thousandsSeparator)
	{
		if (conbo.isUndefined(decimals)) decimals = 2;
		symbol || (symbol = '');
		var n = conbo.formatNumber(number, decimals, decimalPoint, thousandsSeparator);
		return suffixed ? n+symbol : symbol+n;
	};
	
	/**
	 * Encodes all of the special characters contained in a string into HTML 
	 * entities, making it safe for use in an HTML document
	 * 
	 * @memberof	conbo
	 * @param string
	 */
	conbo.encodeEntities = function(string)
	{
		if (!conbo.isString(string))
		{
			string = conbo.isNumber(string)
				? string.toString()
				: '';
		}
		
		return string.replace(/[\u00A0-\u9999<>\&]/gim, function(char)
		{
			return '&#'+char.charCodeAt(0)+';';
		});
	};
	
	/**
	 * Decodes all of the HTML entities contained in an string, replacing them with
	 * special characters, making it safe for use in plain text documents
	 * 
	 * @memberof	conbo
	 * @param string
	 */
	conbo.decodeEntities = function(string) 
	{
		if (!conbo.isString(string)) string = '';
		
		return string.replace(/&#(\d+);/g, function(match, dec) 
		{
			return String.fromCharCode(dec);
		});
	};
	
	/**
	 * Copies all of the enumerable values from one or more objects and sets
	 * them to another, without affecting the target object's property
	 * descriptors.
	 * 
	 * Unlike conbo.defineValues, setValues only sets the values on the target 
	 * object and does not destroy and redifine them.
	 * 
	 * @memberof	conbo
	 * @param		{Object}	obj		Object to copy properties to
	 * 
	 * @example	
	 * conbo.setValues({id:1}, {get name() { return 'Arthur'; }}, {get age() { return 42; }});
	 * => {id:1, name:'Arthur', age:42}
	 */
	conbo.setValues = function(obj)
	{
		conbo.rest(arguments).forEach(function(source) 
		{
			if (!source) return;
			
			for (var propName in source) 
			{
				obj[propName] = source[propName];
			}
		});
		
		return obj;
	};
	
	/**
	 * Is the value a Conbo class?
	 * 
	 * @memberof	conbo
	 * @param		{any}		value - Value that might be a class
	 * @param		{class}		classReference - The Conbo class that the value must match or be an extension of (optional) 
	 */
	conbo.isClass = function(value, classReference)
	{
		return !!value 
			&& typeof value == 'function' 
			&& value.prototype instanceof (classReference || conbo.Class)
			;
	};
	
	/**
	 * Copies a property, including defined properties and accessors, 
	 * from one object to another
	 * 
	 * @memberof	conbo
	 * @param		{object}	source - Source object
	 * @param		{string}	sourceName - Name of the property on the source
	 * @param		{object}	target - Target object
	 * @param		{string} 	targetName - Name of the property on the target (default: sourceName)
	 */
	conbo.cloneProperty = function(source, sourceName, target, targetName)
	{
		targetName || (targetName = sourceName);
		
		var descriptor = Object.getOwnPropertyDescriptor(source, sourceName);
		
		if (!!descriptor)
		{
			Object.defineProperty(target, targetName, descriptor);
		}
		else 
		{
			target[targetName] = source[sourceName];
		}
		
		return this;
	};
	
	/**
	 * Sorts the items in an array according to one or more fields in the array. 
	 * The array should have the following characteristics:
	 * 
	 * <ul>
	 * <li>The array is an indexed array, not an associative array.</li>
	 * <li>Each element of the array holds an object with one or more properties.</li>
	 * <li>All of the objects have at least one property in common, the values of which can be used to sort the array. Such a property is called a field.</li>
	 * </ul>
	 * 
	 * @memberof	conbo
	 * @param		{array}		array - The Array to sort
	 * @param		{string}	fieldName - The field/property name to sort on
	 * @param		{object}	options - Optional sort criteria: `descending` (Boolean), `caseInsensitive` (Boolean)
	 */
	conbo.sortOn = function(array, fieldName, options)
	{
		options || (options = {});
		
		if (conbo.isArray(array) && fieldName)
		{
			array.sort(function(a, b)
			{
				var values = [a[fieldName], b[fieldName]];
				
				// Configure
				if (options.descending)
				{
					values.reverse();
				}
				
				if (options.caseInsensitive)
				{
					conbo.forEach(values, function(value, index)
					{
						if (conbo.isString(value)) values[index] = value.toLowerCase();
					});
				}
				
				// Sort
				if (values[0] < values[1]) return -1;
				if (values[0] > values[1]) return 1;
				return 0;
			});
		}
		
		return array;
	};
	
	/**
	 * Is the object an instance of the specified class(es) or implement the
	 * specified pseudo-interface(s)?
	 * 
	 * This method will always return false if the specified object is a Conbo
	 * class, because by it's nature a class is not an instance of anything.
	 * 
	 * @memberof	conbo
	 * @param		obj					The class instance
	 * @param		classOrInterface	The Conbo class or pseudo-interface to compare against
	 * @example							var b = conbo.instanceOf(obj, conbo.EventDispatcher);
	 * @example							var b = conbo.instanceOf(obj, conbo.View, conbo.IInjectable);
	 */
	conbo.instanceOf = function(obj, classOrInterface)
	{
		if (!obj || conbo.isClass(obj)) return false;
		
		var partials = conbo.rest(arguments);
		
		for (var p=0, c=partials.length; p<c; p++)
		{
			classOrInterface = partials[p];
			
			if (!classOrInterface) return false;
			
			try { if (obj instanceof classOrInterface) return true; }
			catch (e) {}
			
			if (conbo.isObject(classOrInterface))
			{
				for (var a in classOrInterface)
				{
					if (!(a in obj) || conbo.isFunction(obj[a]) != conbo.isFunction(classOrInterface[a])) 
					{
						return false;
					}
				}
			}
			else
			{
				return false;
			}
		}
		
		return true;
	};
	
	/**
	 * Loads a CSS file and applies it to the DOM
	 * 
	 * @memberof	conbo
	 * @param 		{String}	url		The CSS file's URL
	 * @param 		{String}	media	The media attribute (defaults to 'all')
	 * @returns		conbo.Promise
	 */
	conbo.loadCss = function(url, media)
	{
		if (!('document' in window) || !!document.querySelector('[href="'+url+'"]'))
		{
			return this;
		}
		
		var link, head, promise;
		
		promise = new conbo.Promise();
			
		link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.media = media || 'all';
		
		link.addEventListener('load', function(event)
		{
			promise.dispatchResult();
		});
		
		link.addEventListener('error', function(event)
		{
			promise.dispatchFault();
		});
		
		link.href = url;
		
		document
			.querySelector('head')
			.appendChild(link)
			;
		
		return promise;
	};
	
	/**
	 * Load a JavaScript file and executes it
	 * 
	 * @memberof	conbo
	 * @param 		{String}	url - The JavaScript file's URL
	 * @param 		{object}	scope - The scope in which to run the loaded script
	 * @returns		conbo.Promise
	 */
	conbo.loadScript = function(url, scope)
	{
		return conbo.httpRequest
		({
			url: url,
			dataType: "script",
			scope: scope
		});
	};
	
	/*
	 * Property utilities
	 */
	
	/**
	 * Makes the specified properties of an object bindable; if no property 
	 * names are passed, all variables will be made bindable
	 * 
	 * @memberof	conbo
	 * @see 		#makeAllBindable
	 * 
	 * @param		{Object}		obj
	 * @param		{Array}			propNames (optional)
	 */
	conbo.makeBindable = function(obj, propNames)
	{
		propNames = conbo.uniq(propNames || conbo.getVariableNames(obj, true));
		
		propNames.forEach(function(propName)
		{
			__defineProperty(obj, propName);
		});
		
		return this;
	};
	
	/**
	 * Makes all existing properties of the specified object bindable, and 
	 * optionally creates additional bindable properties for each of the property 
	 * names in the propNames array
	 * 
	 * @memberof	conbo
	 * @see 		#makeBindable
	 * 
	 * @param		{String}		obj
	 * @param		{Array}			propNames (optional)
	 */
	conbo.makeAllBindable = function(obj, propNames)
	{
		propNames = (propNames || []).concat(conbo.getVariableNames(obj, true));
		conbo.makeBindable(obj, propNames);
		
		return this;
	};
	
	/**
	 * Is the specified property an accessor (defined using a getter and/or setter)?
	 * 
	 * @memberof	conbo
	 * @param		{object}	Object containing the property
	 * @param		{string}	The name of the property
	 * @returns		{Boolean}
	 */
	conbo.isAccessor = function(obj, propName)
	{
		if (obj)
		{
			return !!obj.__lookupGetter__(propName) 
				|| !!obj.__lookupSetter__(propName);
		}
		
		return false;
	};
	
	/**
	 * Is the specified property explicitely bindable?
	 * 
	 * @memberof	conbo
	 * @deprecated
	 * @returns		{boolean}
	 */
	conbo.isBindable = function(obj, propName)
	{
		if (!conbo.isAccessor(obj, propName))
		{
			return false;
		}
		
		return !!(obj.__lookupSetter__(propName) || {}).bindable;
	};
	
	/**
	 * Is the specified function native?
	 * 
	 * @memberof	conbo
	 * @returns		{boolean}	true if it's native, false if it's user defined
	 */
	conbo.isNative = function(func) 
	{
		try { return !('prototype' in func); }
		catch (e) {}
		
		return false;
	};
	
	/**
	 * Parse a template
	 * 
	 * @memberof	conbo
	 * @param	{string}	template - A string containing property names in {{moustache}} or ${ES2015} format to be replaced with property values
	 * @param	{object}	data - An object containing the data to be used to populate the template 
	 * @returns	{string}	The populated template
	 */
	conbo.parseTemplate = function(template, data)
	{
		if (!template) return "";
		
		data || (data = {});
		
		return template.replace(/(({{(.+?)}})|(\${(.+?)}))/g, function(propNameInBrackets, propName) 
		{
			var args = propName.split("|");
			var value, parseFunction;
			
			args[0] = conbo.BindingUtils.cleanPropertyName(args[0]);
			
			try { value = eval("data."+args[0]);			} catch(e) {}
			try { parseFunction = eval("data."+args[1]);	} catch(e) {}
			
			if (!conbo.isFunction(parseFunction)) 
			{
				parseFunction = conbo.BindingUtils.defaultParseFunction;
			}
			
			return parseFunction(value);
		});
	};
	
	/**
	 * Converts a template string into a pre-populated templating method that can 
	 * be evaluated for rendering.
	 * 
	 * @memberof	conbo
	 * @param	{string}	template - A string containing property names in {{moustache}} or ${ES2015} format to be replaced with property values
	 * @param	{object}	defaults - An object containing default values to use when populating the template (optional)
	 * @returns	{function}	A function that can be called with a data object, returning the populated template
	 */
	conbo.compileTemplate = function(template, defaults)
	{
		return function(data)
		{
			return conbo.parseTemplate(template, conbo.setDefaults(data || {}, defaults));
		}
	};
	
	/*
	 * Polyfill methods for useful ECMAScript 5 methods that aren't quite universal
	 */
	
	if (!String.prototype.trim) 
	{
		String.prototype.trim = function () 
		{
			return this.replace(/^\s+|\s+$/g,''); 
		};
	}
	
	if (!window.requestAnimationFrame)
	{
		window.requestAnimationFrame = (function()
		{
			return window.webkitRequestAnimationFrame
				|| window.mozRequestAnimationFrame
				|| window.msRequestAnimationFrame
				|| function(callback)
				{
					window.setTimeout(callback, 1000 / 60);
				};
		})();
	}
	
	/**
	 * Serialise an Object as a query string  suitable for appending to a URL 
	 * as GET parameters, e.g. foo=1&bar=2
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj	- The Object to encode
	 * @returns		{string}	The URL encoded string 
	 */
	conbo.toQueryString = function(obj)
	{
		return conbo.keys(obj).map(function(key) {
		    return key + '=' + encodeURIComponent(obj[key]);
		}).join('&');
	};
	
	/**
	 * Returns the value of the property matching the specified name, optionally
	 * searching for a case insensitive match. This is useful when extracting 
	 * response headers, where the case of properties such as "Content-Type" 
	 * cannot always be predicted
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - The object containing the property
	 * @param		{string}	propName - The property name
	 * @param		{boolean}	caseSensitive - Whether to search for a case-insensitive match (default: true)
	 * @returns		{*}			The value of the specified property
	 */
	conbo.getValue = function(obj, propName, caseSensitive)
	{
		if (caseSensitive !== false)
		{
			return obj[propName];
		}
		
		for (var a in obj)
		{
			if (a.toLowerCase() == propName.toLowerCase())
			{
				return obj[a];
			}
		}
	};
	
	/**
	 * Prepare data for submission to web services.
	 * 
	 * If no toJSON method is present on the specified Object, this method 
	 * returns a version of the object that can easily be converted into JSON, 
	 * with all functions, unenumerable and private properties removed.
	 * 
	 * This method can be assigned to an Object or Array as the toJSON method 
	 * for use with JSON.stringify().
	 * 
	 * @memberof	conbo
	 * @param		{*}			obj - Object to convert
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain?
	 * @returns		{*}			JSON ready version of the object
	 * 
	 * @example
	 * conbo.jsonify(myObj); // Defers to myObj.toJSON() if it exists
	 * conbo.jsonify.call(myObj); // Ignores myObj.toJSON(), even if it exists
	 * myObj.toJSON = conbo.jsonify; // Assign this method to your Object
	 */
	conbo.jsonify = function(obj, deep)
	{
		if (this != conbo)
		{
			deep = obj;
			obj = this;
		}
		
		if (conbo.isObject(obj))
		{
			if (this != obj && 'toJSON' in obj)
			{
				return obj.toJSON();
			}
			else
			{
				if (conbo.isArray(obj))
				{
					return conbo.map(obj, function(item)
					{
						return conbo.jsonify(item, deep);
					});
				}
				
				var keys = conbo.filter(conbo.variables(obj, deep), function(key)
				{
					return /^[a-z]*$/i.test(key);
				});
				
				return conbo.pick.apply(conbo, [obj].concat(keys));
			}
		}
		
		return obj;
	};
	
	/*
	 * Logging
	 */
	
	/**
	 * Should Conbo output data to the console when calls are made to loggin methods?
	 * 
	 * @memberof	conbo
	 * @type		{boolean}
	 * @example
	 * conbo.logEnabled = false;
	 * conbo.log('Blah!'); // Nothing will be displayed in the console
	 */
	conbo.logEnabled = true;
	
	/**
	 * @member		{function}	log - Add a log message to the console
	 * @function
	 * @memberOf	conbo
	 */
	
	/**
	 * @member		{function}	warn - Add a warning message to the console
	 * @function
	 * @memberOf	conbo
	 */
	
	/**
	 * @member		{function}	info - Add information to the console
	 * @function
	 * @memberOf	conbo
	 */
	
	/**
	 * @member		{function}	error - Add an error log message to the console
	 * @function
	 * @memberOf	conbo
	 */
	
	var logMethods = ['log','warn','info','error'];
	
	logMethods.forEach(function(method)
	{
		conbo[method] = function()
		{
			if (!console || !conbo.logEnabled) return;
			console[method].apply(console, arguments);		
		};
	});
	
})();

/*
 * Functions and utility methods use for manipulating the DOM
 * @author		Neil Rackett
 */

(function()
{
	/**
	 * Initialize Applications in the DOM using the specified namespace
	 * 
	 * By default, Conbo scans the entire DOM, but you can limit the
	 * scope by specifying a root element
	 * 
	 * @memberof	conbo
	 * @param		{conbo.Namespace} namespace
	 * @param		{Element} rootEl - Top most element to scan (optional)
	 */
	conbo.initDom = function(namespace, rootEl)
	{
		if (!namespace)
		{
			throw new Error('initDom: namespace is undefined');
		}
		
		if (conbo.isString(namespace))
		{
			namespace = conbo(namespace);
		}
		
		rootEl || (rootEl = document.querySelector('html'));
		
		var initDom = function()
		{
			var nodes = conbo.toArray(rootEl.querySelectorAll(':not(.cb-app)'));
			
			nodes.forEach(function(el)
			{
		   		var appName = __ep(el).attributes.cbApp || conbo.toCamelCase(el.tagName, true);
		   		var appClass = namespace[appName];
		   		
		   		if (appClass && conbo.isClass(appClass, conbo.Application))
		   		{
		   			new appClass({el:el});
		   		}
		   	});
		};
		
		conbo.ready(initDom);
		
		return this;	
	};
	
	/**
	 * @private
	 */
	var __observers = [];
	
	/**
	 * @private
	 */
	var __getObserverIndex = function(namespace, rootEl)
	{
		var length = __observers.length;
		
		for (var i=0; i<length; i++)
		{
			var observer = __observers[i];
			
			if (observer[0] == namespace && observer[1] == rootEl)
			{
				return i;
			}
		}
		
		return -1;
	};
	
	/**
	 * Watch the DOM for new Applications using the specified namespace
	 * 
	 * By default, Conbo watches the entire DOM, but you can limit the
	 * scope by specifying a root element
	 * 
	 * @memberof	conbo
	 * @param		{conbo.Namespace} namespace
	 * @param		{Element} rootEl - Top most element to observe (optional)
	 */
	conbo.observeDom = function(namespace, rootEl)
	{
		if (conbo.isString(namespace))
		{
			namespace = conbo(namespace);
		}
		
		if (__getObserverIndex(namespace, rootEl) != -1)
		{
			return;
		}
		
		rootEl || (rootEl = document.querySelector('html'));
		
		var mo = new conbo.MutationObserver();
		mo.observe(rootEl);
		
		mo.addEventListener(conbo.ConboEvent.ADD, function(event)
		{
			event.nodes.forEach(function(node)
			{
				var ep = __ep(node);
				var appName = ep.cbAttributes.app || conbo.toCamelCase(node.tagName, true);
				
				if (appName && namespace[appName] && !ep.hasClass('cb-app'))
				{
					new namespace[appName]({el:node});
				}
			});
		});
		
		__observers.push([namespace, rootEl, mo]);
		
		return this;
	};
	
	/**
	 * Stop watching the DOM for new Applications
	 * 
	 * @memberof	conbo
	 * @param		{conbo.Namespace} namespace
	 * @param		{Element} rootEl - Top most element to observe (optional)
	 */
	conbo.unobserveDom = function(namespace, rootEl)
	{
		if (conbo.isString(namespace))
		{
			namespace = conbo(namespace);
		}
		
		var i = __getObserverIndex(namespace, rootEl);
		
		if (i != -1)
		{
			var observer = __observers[i];
			
			observer[2].removeEventListener();
			__observers.slice(i,1);
		}
		
		return this;
	};
	
})();
/*
 * CSS styles used by ConboJS
 * @author 	Neil Rackett
 */

if (document && !document.querySelector('#cb-style'))
{
	document.querySelector('head').innerHTML += 
		'<style id="cb-style" type="text/css">'+
			'\n.cb-hide { visibility:hidden !important; }'+
			'\n.cb-exclude { display:none !important; }'+
			'\n.cb-disable { pointer-events:none !important; cursor:default !important; }'+
			'\n.cb-app span { font:inherit; color:inherit; }'+
		'\n</style>';
}

/**
 * Class
 * Extendable base class from which all others extend
 * @class		conbo.Class
 * @param 		{object} options - Object containing initialisation options
 */
conbo.Class = function() 
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
	 * Scope a function to this class instance
	 * 
	 * @deprecated
	 * @param 	{function} 	func - The function to bind to this class instance
	 * @returns	this
	 */
	bind: function(func)
	{
		return conbo.bind.apply(conbo, [func, this].concat(conbo.rest(arguments)));
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

/**
 * Conbo namespaces enable you to create modular, encapsulated code, similar to
 * how you might use packages in languages like Java or ActionScript.
 * 
 * By default, namespaces will automatically call initDom() when the HTML page
 * has finished loading.
 * 
 * @class		conbo.Namespace
 * @augments	conbo.Class
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options
 */
conbo.Namespace = conbo.ConboClass.extend(
/** @lends conbo.Namespace.prototype */
{
	__construct: function()
	{
		var readyHandler = function()
		{
			if (document && this.autoInit !== false)
			{
				this.initDom();
			}
		};
		
		conbo.ready(readyHandler, this);
	},
	
	/**
	 * Search the DOM and initialize Applications contained in this namespace
	 * 
	 * @param 	{Element} 	rootEl - The root element to initialize (optional)
	 * @returns {this}
	 */
	initDom: function(rootEl)
	{
		conbo.initDom(this, rootEl);
		return this;
	},
	
	/**
	 * Watch the DOM and automatically initialize Applications contained in 
	 * this namespace when an element with the appropriate cb-app attribute
	 * is added.
	 * 
	 * @param 	{Element} 	rootEl - The root element to initialize (optional)
	 * @returns {this}
	 */
	observeDom: function(rootEl)
	{
		conbo.observeDom(this, rootEl);
		return this;
	},
	
	/**
	 * Stop watching the DOM for Applications
	 * 
	 * @param 	{Element} 	rootEl - The root element to initialize (optional)
	 * @returns {this}
	 */
	unobserveDom: function(rootEl)
	{
		conbo.unobserveDom(this, rootEl);
		return this;
	},
	
	/**
	 * Add classes, properties or methods to the namespace. Using this method
	 * will not overwrite existing items of the same name.
	 * 
	 * @param 	{object}			obj - An object containing items to add to the namespace 
	 * @returns	{conbo.Namespace}	This Namespace instance
	 */
	add: function(obj)
	{
		conbo.setDefaults.apply(conbo, [this].concat(conbo.toArray(arguments)));
		return this;
	},
	
});

/**
 * Partial class that enables the ConboJS framework to add the application
 * specific Context class instance and inject specified dependencies 
 * (properties of undefined value which match registered singletons); should
 * be used via the Class.implement method
 * 
 * @augments	conbo
 * @example		var C = conbo.Class.extend().implement(conbo.IInjectable);
 * @author		Neil Rackett
 */
conbo.IInjectable =
{
	get context()
	{
		return this.__context;
	},
	
	set context(value)
	{
		if (value == this.__context) return;
		
		if (value instanceof conbo.Context) 
		{
			value.injectSingletons(this);
		}
		
		this.__context = value;
		
		__denumerate(this, '__context');
	}
	
};

/**
 * Event class
 * 
 * Base class for all events triggered in ConboJS
 * 
 * @class		conbo.Event
 * @augments	conbo.Class
 * @author		Neil Rackett
 * @param 		{string}	type - The type of event this object represents
 */
conbo.Event = conbo.Class.extend(
/** @lends conbo.Event.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(type)
	{
		this.preinitialize.apply(this, arguments);
		
		if (conbo.isString(type)) 
		{
			this.type = type;
		}
		else 
		{
			conbo.defineDefaults(this, type);
		}
		
		if (!this.type) 
		{
			throw new Error('Invalid or undefined event type');
		}
		
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Initialize: Override this!
	 * @param type
	 */
	initialize: function(type, data)
	{
		this.data = data;
	},
	
	/**
	 * Create an identical clone of this event
	 * @returns 	{conbo.Event}	A clone of this event
	 */
	clone: function()
	{
		return conbo.clone(this);
	},
	
	/**
	 * Prevent whatever the default framework action for this event is
	 * @returns	{conbo.Event}	A reference to this event 
	 */
	preventDefault: function() 
	{
		this.defaultPrevented = true;
		return this;
	},
	
	/**
	 * Not currently used
	 * @returns	{conbo.Event}	A reference to this event 
	 */
	stopPropagation: function() 
	{
		this.cancelBubble = true;
		
		return this;
	},
	
	/**
	 * Keep the rest of the handlers from being executed
	 * @returns	{conbo.Event}	A reference to this event 
	 */
	stopImmediatePropagation: function() 
	{
		this.immediatePropagationStopped = true;
		this.stopPropagation();
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Event';
	}
},
/** @lends conbo.Event */
{
	ALL: '*',
});

__denumerate(conbo.Event.prototype);

/**
 * conbo.Event
 * 
 * Default event class for events fired by ConboJS
 * 
 * For consistency, callback parameters of Backbone.js derived classes 
 * are event object properties in ConboJS
 * 
 * @class		conbo.ConboEvent
 * @augments	conbo.Event
 * @author		Neil Rackett
 * @param 		{string}	type - The type of event this object represents
 * @param 		{object}	options - Properties to be added to this event object
 */
conbo.ConboEvent = conbo.Event.extend(
/** @lends conbo.ConboEvent.prototype */
{
	initialize: function(type, options)
	{
		conbo.defineDefaults(this, options);
	},
	
	toString: function()
	{
		return 'conbo.ConboEvent';
	}
},
/** @lends conbo.ConboEvent */
{
	/** 
	 * Special event used to listed for all event types 
	 * 
	 * @event			conbo.ConboEvent#ALL
     * @type 			{conbo.ConboEvent}
	 */
	ALL:				'*',

	/**
	 * Something has changed (also 'change:[name]')
	 * 
	 * @event			conbo.ConboEvent#CHANGE
     * @type 			{conbo.ConboEvent}
     * @property		{string} property - The name of the property that changed
     * @property		{*} value - The new value of the property
	 */
	CHANGE:				'change',
	
	/** 
	 * Something was added
	 * 
	 * @event			conbo.ConboEvent#ADD
     * @type 			{conbo.ConboEvent}
	 */
	ADD:				'add', 				

	/**
	 * Something was removed
	 * 
	 * @event			conbo.ConboEvent#REMOVE
     * @type 			{conbo.ConboEvent}
	 */
	REMOVE:				'remove',

	/**
	 * The route has changed (also 'route:[name]')
	 * 
	 * @event			conbo.ConboEvent#ROUTE
     * @type 			{conbo.ConboEvent}
     * @property		{conbo.Router}	router - The router that handled the route change
     * @property		{RegExp} 		route - The route that was followed
     * @property		{string} 		name - The name assigned to the route
     * @property		{array} 		parameters - The parameters extracted from the route
     * @property		{string} 		path - The new path 
	 */
	ROUTE:				'route', 			

	/** 
	 * Something has started
	 * 
	 * @event			conbo.ConboEvent#START
     * @type 			{conbo.ConboEvent}
	 */
	START:				'start',

	/**
	 * Something has stopped
	 * 
	 * @event			conbo.ConboEvent#STOP
     * @type 			{conbo.ConboEvent}
	 */
	STOP:				'stop',
	
	/**
	 * A template is ready to use
	 * 
	 * @event			conbo.ConboEvent#TEMPLATE_COMPLETE
     * @type 			{conbo.ConboEvent}
	 */
	TEMPLATE_COMPLETE:	'templateComplete',

	/** 
	 * A template error has occurred
	 *  
	 * @event			conbo.ConboEvent#TEMPLATE_FAULT
     * @type 			{conbo.ConboEvent}
	 */
	TEMPLATE_FAULT:		'templateFault',

	/** 
	 * Something has been bound
	 *  
	 * @event			conbo.ConboEvent#BIND
     * @type 			{conbo.ConboEvent}
	 */
	BIND:				'bind',

	/** 
	 * Something has been unbound
	 *  
	 * @event			conbo.ConboEvent#UNBIND
     * @type 			{conbo.ConboEvent}
	 */
	UNBIND:				'unbind',			

	/** 
	 * Something has been created and it's ready to use
	 * 
	 * @event			conbo.ConboEvent#CREATION_COMPLETE
     * @type 			{conbo.ConboEvent}
	 */
	CREATION_COMPLETE:	'creationComplete',
	
	/** 
	 * Something has been detached
	 * 
	 * @event			conbo.ConboEvent#DETACH
     * @type 			{conbo.ConboEvent}
	 */
	DETACH:				'detach',
	
	/** 
	 * A result has been received
	 *  
	 * @event			conbo.ConboEvent#RESULT
     * @type 			{conbo.ConboEvent}
     * @property		{*} result - The data received 
	 */
	RESULT:				'result',
	
	/** 
	 * A fault has occurred
	 *  
	 * @event			conbo.ConboEvent#FAULT
     * @type 			{conbo.ConboEvent}
     * @property		{*} fault - The fault received 
	 */
	FAULT:				'fault',			
	
});

(function()
{
	/**
	 * @private
	 */
	var EventDispatcher__addEventListener = function(type, handler, scope, priority, once)
	{
		if (type == '*') type = 'all';
		if (!this.__queue) __definePrivateProperty(this, '__queue', {});
		
		if (!this.hasEventListener(type, handler, scope))
		{
			if (!(type in this.__queue)) this.__queue[type] = [];
			this.__queue[type].push({handler:handler, scope:scope, once:once, priority:priority||0});
			this.__queue[type].sort(function(a,b){return b.priority-a.priority;});
		}
	};
	
	/**
	 * @private
	 */
	var EventDispatcher__removeEventListener = function(type, handler, scope)
	{
		if (type == '*') type = 'all';
		if (!this.__queue) return;
		
		var queue, 
			i, 
			self = this;
		
		var removeFromQueue = function(queue, key)
		{
			for (i=0; i<queue.length; i++)
			{
				if ((!queue[i].handler || queue[i].handler == handler)
					&& (!queue[i].scope || queue[i].scope == scope))
				{
					queue.splice(i--, 1);
				}
			}
			
			if (!queue.length)
			{
				delete self.__queue[key];
			}
		};
		
		if (type in this.__queue)
		{
			queue = this.__queue[type];
			removeFromQueue(queue, type);
		}
		else if (type == undefined)
		{
			conbo.forEach(this.__queue, function(queue, key)
			{
				removeFromQueue(queue, key);
			});
		}
	};
	
	/**
	 * Event Dispatcher
	 * 
	 * Event model designed to bring events into line with DOM events and those 
	 * found in HTML DOM, jQuery and ActionScript 2 & 3, offering a more 
	 * predictable, object based approach to event dispatching and handling
	 * 
	 * Should be used as the base class for any class that won't be used for 
	 * data binding
	 * 
	 * @class		conbo.EventDispatcher
	 * @augments	conbo.Class
	 * @author		Neil Rackett
	 * @param 		{object} options - Object containing optional initialisation options, including 'context'
	 */
	conbo.EventDispatcher = conbo.ConboClass.extend(
	/** @lends conbo.EventDispatcher.prototype */
	{
		/**
		 * Do not override: use initialize
		 * @private
		 */
		__construct: function(options)
		{
			if (!!options.context)
			{
				this.context = options.context;
			}
		},
		
		/**
		 * Add a listener for a particular event type
		 * 
		 * @param 	{string}		type - Type of event ('change') or events ('change blur')
		 * @param 	{function}		handler - Function that should be called
		 * @param 	{object}		scope - The scope in which to run the event handler (optional)
		 * @param 	{number}		priority - The event handler's priority when the event is dispatached (default: 0)
		 * @param 	{boolean}		once - Should the event listener automatically be removed after it has been called once? (default: false)
		 * @returns	{conbo.EventDispatcher}	A reference to this class instance 
		 */
		addEventListener: function(type, handler, scope, priority, once)
		{
			if (!type) throw new Error('Event type undefined');
			if (!handler || !conbo.isFunction(handler)) throw new Error('Event handler is undefined or not a function');
	
			if (conbo.isString(type)) type = type.split(' ');
			if (conbo.isArray(type)) conbo.forEach(type, function(value, index, list) { EventDispatcher__addEventListener.call(this, value, handler, scope, priority, !!once); }, this);
			
			return this;
		},
		
		/**
		 * Remove a listener for a particular event type
		 * 
		 * @param {string}		type - Type of event ('change') or events ('change blur') (optional: if not specified, all listeners will be removed) 
		 * @param {function}	handler - Function that should be called (optional: if not specified, all listeners of the specified type will be removed)
		 * @param {object} 		scope - The scope in which the handler is set to run (optional)
		 * @returns	{conbo.EventDispatcher}	A reference to this class instance 
		 */
		removeEventListener: function(type, handler, scope)
		{
			if (!arguments.length)
			{
				__definePrivateProperty(this, '__queue', {});
				return this;
			}
			
			if (conbo.isString(type)) type = type.split(' ');
			if (!conbo.isArray(type)) type = [undefined];
			
			conbo.forEach(type, function(value, index, list) 
			{
				EventDispatcher__removeEventListener.call(this, value, handler, scope); 
			}, 
			this);
			
			return this;
		},
		
		/**
		 * Does this object have an event listener of the specified type?
		 * 
		 * @param 	{string}	type - Type of event (e.g. 'change') 
		 * @param 	{function}	handler - Function that should be called (optional)
		 * @param 	{object} 	scope - The scope in which the handler is set to run (optional)
		 * @returns	{boolean}	True if this object has the specified event listener, false if it does not
		 */
		hasEventListener: function(type, handler, scope)
		{
			if (!this.__queue 
				|| !(type in this.__queue)
				|| !this.__queue[type].length)
			{
				return false;
			}
			
			var queue = this.__queue[type];
			var length = queue.length;
			
			for (var i=0; i<length; i++)
			{
				if ((!handler || queue[i].handler == handler) 
					&& (!scope || queue[i].scope == scope))
				{
					return true;
				}
			}
			
			return false;
		},
		
		/**
		 * Dispatch the event to listeners
		 * @param {conbo.Event} 	event - The event to dispatch
		 * @returns	{conbo.EventDispatcher}	A reference to this class instance 
		 */
		dispatchEvent: function(event)
		{
			if (!event) throw new Error('Event undefined');
			
			var isString = conbo.isString(event);
			
			if (isString)
			{
				conbo.warn('Use of dispatchEvent("'+event+'") is deprecated, please use dispatchEvent(new conbo.Event("'+event+'"))');
			}
			
			if (isString || !(event instanceof conbo.Event))
			{
				event = new conbo.Event(event);
			}
			
			if (!this.__queue || (!(event.type in this.__queue) && !this.__queue.all)) return this;
			
			if (!event.target) event.target = this;
			event.currentTarget = this;
			
			var queue = conbo.union(this.__queue[event.type] || [], this.__queue.all || []);
			if (!queue || !queue.length) return this;
			
			for (var i=0, length=queue.length; i<length; ++i)
			{
				var value = queue[i];
				var returnValue = value.handler.call(value.scope || this, event);
				if (value.once) EventDispatcher__removeEventListener.call(this, event.type, value.handler, value.scope);
				if (returnValue === false || event.immediatePropagationStopped) break;
			}
			
			return this;
		},
		
		/**
		 * Dispatch a change event for one or more changed properties
		 * @param {string}	propName - The name of the property that has changed
		 * @returns	{conbo.EventDispatcher}	A reference to this class instance 
		 */
		dispatchChange: function(propName)
		{
			conbo.forEach(arguments, function(propName)
			{
				__dispatchChange(this, propName);
			},
			this);
			
			return this;
		},
	
		toString: function()
		{
			return 'conbo.EventDispatcher';
		},
		
	}).implement(conbo.IInjectable);
	
	//__definePrivateProperty(conbo.EventDispatcher.prototype, 'bindable');
	__denumerate(conbo.EventDispatcher.prototype);
	
})();

/**
 * Event Proxy
 * 
 * Standardises the adding and removing of event listeners across DOM elements,
 * Conbo EventDispatchers and jQuery instances 
 * 
 * @class		conbo.EventProxy
 * @augments	conbo.Class
 * @author 		Neil Rackett
 * @param 		{object} eventDispatcher - Element, EventDispatcher or jQuery object to be proxied
 */
conbo.EventProxy = conbo.Class.extend(
/** @lends conbo.EventProxy.prototype */
{
	constructor: function(obj)
	{
		this.__obj = obj;
	},
	
	/**
	 * Add a listener for a particular event type
	 * 
	 * @param 	{string}			type - Type of event ('change') or events ('change blur')
	 * @param 	{function}			handler - Function that should be called
	 * @returns	{conbo.EventProxy}	A reference to this class instance 
	 */
	addEventListener: function(type, handler)
	{
		var obj = this.__obj;
		
		if (obj)
		{
			switch (true)
			{
				// TODO Remove the last tiny piece of jQuery support?
				case conbo.$ && obj instanceof conbo.$:
				case window.$ && obj instanceof window.$:
				{
					obj.on(type, handler);
					break;
				}
				
				case obj instanceof conbo.EventDispatcher:
				{
					obj.addEventListener(type, handler);
					break;
				}
				
				default:
				{
					var types = type.split(' ');
					
					types.forEach(function(type)
					{
						obj.addEventListener(type, handler);
					});
				}
			}
		}
		
		return this;
	},
	
	/**
	 * Remove a listener for a particular event type
	 * 
	 * @param 	{string}			type - Type of event ('change') or events ('change blur')
	 * @param 	{function}			handler - Function that should be called
	 * @returns	{conbo.EventProxy}	A reference to this class instance 
	 */
	removeEventListener: function(type, handler)
	{
		var obj = this.__obj;
		
		if (obj)
		{
			switch (true)
			{
				// TODO Remove the last tiny piece of jQuery support?
				case conbo.$ && obj instanceof conbo.$:
				case window.$ && obj instanceof window.$:
				{
					obj.off(type, handler);
					break;
				}
				
				case obj instanceof conbo.obj:
				{
					obj.removeEventListener(type, handler);
					break;
				}
				
				default:
				{
					var types = type.split(' ');
					
					types.forEach(function(type)
					{
						obj.removeEventListener(type, handler);
					});
				}
			}
		}
		
		return this;
	},
	
});

/**
 * conbo.Context
 * 
 * This is your application's event bus and dependency injector, and is
 * usually where all your models and web service classes are registered,
 * using mapSingleton(...), and Command classes are mapped to events 
 * 
 * @class		conbo.Context
 * @augments	conbo.EventDispatcher
 * @author		Neil Rackett
 * @param 		{object} options - Object containing initialisation options, including 'app' (Application) and 'namespace' (Namespace) 
 */
conbo.Context = conbo.EventDispatcher.extend(
/** @lends conbo.Context.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	__construct: function(options)
	{
		__definePrivateProperties(this, 
		{
			__commands: {},
			__singletons: {},
			__app: options.app,
			__namespace: options.namespace || options.app.namespace,
			__parentContext: options instanceof conbo.Context ? options : undefined
		});
		
		this.addEventListener(conbo.Event.ALL, this.__allHandler);
	},
	
	/**
	 * The Application instance associated with this context
	 * @returns {conbo.Application}
	 */
	get app()
	{
		return this.__app;
	},
	
	/**
	 * The Namespace this context exists in
	 * @returns {conbo.Namespace}
	 */
	get namespace()
	{
		return this.__namespace;
	},
	
	/**
	 * If this is a subcontext, this is a reference to the Context that created it
	 * @returns {conbo.Context}
	 */
	get parentContext()
	{
		return this.__parentContext;
	},
	
	/**
	 * Create a new subcontext that shares the same application
	 * and namespace as this one
	 * 
	 * @param	The context class to use (default: conbo.Context)
	 * @returns {conbo.Context}
	 */
	createSubcontext: function(contextClass)
	{
		contextClass || (contextClass = conbo.Context);
		return new contextClass(this);
	},
	
	/**
	 * Map specified Command class the given event
	 */
	mapCommand: function(eventType, commandClass)
	{
		if (!eventType) throw new Error('eventType cannot be undefined');
		if (!commandClass) throw new Error('commandClass for '+eventType+' cannot be undefined');
		
		if (this.__mapMulti(eventType, commandClass, this.mapCommand)) return;
		
		if (this.__commands[eventType] && this.__commands[eventType].indexOf(commandClass) != -1)
		{
			return;
		}
		
		this.__commands[eventType] = this.__commands[eventType] || [];
		this.__commands[eventType].push(commandClass);
		
		return this;
	},
	
	/**
	 * Unmap specified Command class from given event
	 */
	unmapCommand: function(eventType, commandClass)
	{
		if (!eventType) throw new Error('eventType cannot be undefined');
		if (this.__mapMulti(eventType, commandClass, this.unmapCommand)) return;
		
		if (commandClass === undefined)
		{
			delete this.__commands[eventType];
			return;
		}
		
		if (!this.__commands[eventType]) return;
		var index = this.__commands[eventType].indexOf(commandClass);
		if (index == -1) return;
		this.__commands[eventType].splice(index, 1);
		
		return this;
	},
	
	/**
	 * Map class instance to a property name
	 * 
	 * To inject a property into a class, register the property name
	 * with the Context and declare the value as undefined in your class
	 * to enable it to be injected at run time
	 * 
	 * @example		context.mapSingleton('myProperty', MyModel);
	 * @example		myProperty: undefined
	 */
	mapSingleton: function(propertyName, singletonClass)
	{
		if (!propertyName) throw new Error('propertyName cannot be undefined');
		
		if (singletonClass === undefined)
		{
			conbo.warn('singletonClass for '+propertyName+' is undefined');
		}
		
		if (this.__mapMulti(propertyName, singletonClass, this.mapSingleton)) return;
		
		this.__singletons[propertyName] = conbo.isClass(singletonClass)
			// TODO Improved dynamic class instantiation
			? new singletonClass(arguments[2], arguments[3], arguments[4])
			: singletonClass;
			
		return this;
	},
	
	/**
	 * Unmap class instance from a property name
	 */
	unmapSingleton: function(propertyName)
	{
		if (!propertyName) throw new Error('propertyName cannot be undefined');
		if (this.__mapMulti(propertyName, null, this.unmapSingleton)) return;
		
		if (!this.__singletons[propertyName]) return;
		delete this.__singletons[propertyName];
		
		return this;
	},
	
	/**
	 * Map constant value to a property name
	 * 
	 * To inject a constant into a class, register the property name
	 * with the Context and declare the property as undefined in your 
	 * class to enable it to be injected at run time
	 * 
	 * @example		context.mapConstant('MY_VALUE', 123);
	 * @example		MY_VALUE: undefined
	 */
	mapConstant: function(propertyName, value)
	{
		return this.mapSingleton(propertyName, value);
	},
	
	/**
	 * Unmap constant value from a property name
	 */
	unmapConstant: function(propertyName)
	{
		return this.unmapSingleton(propertyName);
	},
	
	/**
	 * Add this Context to the specified Object, or create an object with a 
	 * reference to this Context
	 */
	addTo: function(obj)
	{
		return conbo.defineValues(obj || {}, {context:this});
	},
	
	/**
	 * Inject singleton instances into specified object
	 * 
	 * @param	obj		{object} 	The object to inject singletons into
	 */
	injectSingletons: function(obj)
	{
		for (var a in obj)
		{
			if (obj[a] !== undefined) continue;
			
			if (a in this.__singletons)
			{
				obj[a] = this.__singletons[a];
			}
		}
		
		return this;
	},
	
	/**
	 * Set all singleton instances on the specified object to undefined
	 * 
	 * @param	obj		{object} 	The object to remove singletons from
	 */
	uninjectSingletons: function(obj)
	{
		for (var a in obj)
		{
			if (a in this.__singletons)
			{
				obj[a] = undefined;
			}
		}
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Context';
	},
	
	/**
	 * @private
	 */
	__allHandler: function(event)
	{
		var commands = conbo.union(this.__commands.all || [], this.__commands[event.type] || []);
		if (!commands.length) return;
		
		conbo.forEach(commands, function(commandClass, index, list)
		{
			this.__executeCommand(commandClass, event);
		}, 
		this);
	},
	
	/**
	 * @private
	 */
	__executeCommand: function(commandClass, event)
	{
		var command, options;
		
		options = {event:event};
		
		command = new commandClass(this.addTo(options));
		command.execute();
		command = null;
		
		return this;
	},
	
	/**
	 * @private
	 */
	__mapMulti: function(n, c, f)
	{
		if (conbo.isArray(n) || n.indexOf(' ') == -1) return false;
		var names = conbo.isArray(n) ? n : n.split(' ');
		conbo.forEach(names, function(e) { f(e,c); }, this);
		return true;
	}
	
});

__denumerate(conbo.Context.prototype);

/**
 * conbo.Hash
 * A Hash is a bindable object of associated keys and values
 * 
 * @class		conbo.Hash
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing optional initialisation options, including 'source' (object) containing initial values
 * @fires		conbo.ConboEvent#CHANGE
 */
conbo.Hash = conbo.EventDispatcher.extend(
/** @lends conbo.Hash.prototype */
{
	/**
	 * @deprecated 
	 * @member		{object}	_defaults - The default values to use if not all properties are set. 
	 * 										This property is now deprected, defaults should be set in declarations() 
	 * @memberOf	conbo.Hash.prototype
	 */
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	__construct: function(options)
	{
		if (!!options.context) 
		{
			this.context = options.context;
		}
		
		conbo.setValues(this, conbo.setDefaults({}, options.source, this.toJSON(), this._defaults));
		delete this._defaults;
	},
	
	/**
	 * Returns a version of this object that can easily be converted into JSON
	 * @function
	 */
	toJSON: conbo.jsonify,
	
	toString: function()
	{
		return 'conbo.Hash';
	}
	
});

__denumerate(conbo.Hash.prototype);

/**
 * A persistent Hash that stores data in LocalStorage or Session
 * 
 * @class		conbo.LocalHash
 * @augments	conbo.Hash
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options, including 'name' (string), 'session' (Boolean) and 'source' (object) containing default values; see Hash for other options
 * @fires		conbo.ConboEvent#CHANGE
 */
conbo.LocalHash = conbo.Hash.extend(
/** @lends conbo.LocalHash.prototype */
{
	__construct: function(options)
	{
		var defaultName = 'ConboLocalHash';
		
		options = conbo.defineDefaults(options, {name:defaultName});
		
		var name = options.name;
		
		var storage = options.session
			? window.sessionStorage
			: window.localStorage;
		
		if (name == defaultName)
		{
			conbo.warn('No name specified for '+this.toString+', using "'+defaultName+'"');
		}
		
		var getLocal = function()
		{
			return name in storage 
				? JSON.parse(storage.getItem(name) || '{}')
				: options.source || {};
		};
		
		// Sync with LocalStorage
		this.addEventListener(conbo.ConboEvent.CHANGE, function(event)
  		{
  			storage.setItem(name, JSON.stringify(this.toJSON()));
  		}, 
  		this, 1000);
		
		options.source = getLocal();
		
		conbo.Hash.prototype.__construct.call(this, options);		
	},
	
	/**
	 * Immediately writes all data to local storage. If you don't use this method, 
	 * Conbo writes the data the next time it detects a change to a bindable property.
	 */
	flush: function()
	{
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE));
	},
	
	toString: function()
	{
		return 'conbo.LocalHash';
	}
	
});

__denumerate(conbo.LocalHash.prototype);

/**
 * A bindable Array wrapper that can be used when you don't require 
 * web service connectivity.
 * 
 * Plain objects will automatically be converted into an instance of 
 * the specified `itemClass` when added to a List, and the appropriate
 * events dispatched if the items it contains are changed or updated.
 * 
 * @class		conbo.List
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing optional initialisation options, including `source` (array), `context` (Context) and `itemClass` (Class)
 * @fires		conbo.ConboEvent#CHANGE
 * @fires		conbo.ConboEvent#ADD
 * @fires		conbo.ConboEvent#REMOVE
 */
conbo.List = conbo.EventDispatcher.extend(
/** @lends conbo.List.prototype */
{
	/**
	 * The class to use for items in this list (plain JS objects will 
	 * automatically be wrapped using this class), defaults to conbo.Hash
	 */
	itemClass: conbo.Hash,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	__construct: function(options) 
	{
		this.addEventListener(conbo.ConboEvent.CHANGE, this.__changeHandler, this, 999);
		
		var listOptions = 
		[
			'context',
			'itemClass'
		];
		
		conbo.setValues(this, conbo.pick(options, listOptions));
		
		this.source = options.source || [];
	},
	
	/**
	 * The Array used as the source for this List
	 */
	get source()
	{
		if (!this.__source)
		{
			this.__source = [];
		}
		
		return this.__source;
	},
	
	set source(value)
	{
		this.__source = [];
		this.push.apply(this, conbo.toArray(value));
		this.dispatchChange('source', 'length');
	},
	
	/**
	 * The number of items in the List
	 */
	get length()
	{
		if (this.source)
		{
			return this.source.length;
		}
		
		return 0;
	},
	
	/**
	 * Add an item to the end of the collection.
	 */
	push: function(item)
	{
		var items = conbo.toArray(arguments);
		
		if (items.length)
		{
			this.source.push.apply(this.source, this.__applyItemClass(items));
			this.__updateBindings(items);
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
			this.dispatchChange('length');
		}
		
		return this.length;
	},
	
	/**
	 * Remove an item from the end of the collection.
	 */
	pop: function()
	{
		if (!this.length) return;
		
		var item = this.source.pop();
		
		this.__updateBindings(item, false);
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		this.dispatchChange('length');
		
		return item;
	},
	
	/**
	 * Add an item to the beginning of the collection.
	 */
	unshift: function(item) 
	{
		if (item)
		{
			this.source.unshift.apply(this.source, this.__applyItemClass(conbo.toArray(arguments)));
			this.__updateBindings(conbo.toArray(arguments));
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
			this.dispatchChange('length');
		}
		
		return this.length;
	},
	
	/**
	 * Remove an item from the beginning of the collection.
	 */
	shift: function()
	{
		if (!this.length) return;
		
		var item = this.source.shift();
		
		this.__updateBindings(item, false);
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		this.dispatchChange('length');
		
		return item;
	},
	
	/**
	 * Slice out a sub-array of items from the collection.
	 */
	slice: function(begin, length)
	{
		begin || (begin = 0);
		if (conbo.isUndefined(length)) length = this.length;
		
		return new conbo.List({source:this.source.slice(begin, length)});
	},
	
	/**
	 * Splice out a sub-array of items from the collection.
	 */
	splice: function(begin, length)
	{
		begin || (begin = 0);
		if (conbo.isUndefined(length)) length = this.length;
		
		var inserts = conbo.rest(arguments,2);
		var items = this.source.splice.apply(this.source, [begin, length].concat(inserts));
		
		if (items.length) this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		if (inserts.length) this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		
		if (items.length || inserts.length)
		{
			this.dispatchChange('length');
		}
		
		return new conbo.List({source:items});
	},
	
	/**
	 * Get the item at the given index; similar to array[index]
	 */
	getItemAt: function(index) 
	{
		return this.source[index];
	},
	
	/**
	 * Add (or replace) item at given index with the one specified,
	 * similar to array[index] = value;
	 */
	setItemAt: function(index, item)
	{
		var length = this.length;
		
		var replaced = this.source[index];
		this.__updateBindings(replaced, false);
		
		this.source[index] = model;
		this.__updateBindings(model);
		
		if (this.length > length)
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
			this.dispatchChange('length');
		}
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE, {item:item}));
		
		return replaced;
	},
	
	/**
	 * Force the collection to re-sort itself.
	 * @param	{function}	compareFunction - Compare function to determine sort order
	 */
	sort: function(compareFunction) 
	{
		this.source.sort(compareFunction);
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE));
		
		return this;
	},
	
	/**
	 * Create a new collection with an identical list of models as this one.
	 */
	clone: function() 
	{
		return new this.constructor(this.source);
	},
	
	/**
	 * The JSON-friendly representation of the List
	 */
	toJSON: function() 
	{
		return conbo.jsonify(this.source);
	},
	
	toString: function()
	{
		return 'conbo.List';
	},
	
	/**
	 * Listen to the events of Bindable values so we can detect changes
	 * @param 	{any}		models
	 * @param 	{Boolean}	enabled
	 * @private
	 */
	__updateBindings: function(items, enabled)
	{
		var method = enabled === false ? 'removeEventListener' : 'addEventListener';
		
		items = (conbo.isArray(items) ? items : [items]).slice();
		
		while (items.length)
		{
			var item = items.pop();
			
			if (item instanceof conbo.EventDispatcher)
			{
				item[method](conbo.ConboEvent.CHANGE, this.dispatchEvent, this);
			}
		}
	},
	
	/**
	 * Enables array access operator, e.g. myList[0]
	 * @private
	 */
	__changeHandler: function(event)
	{
		var i;
		
		var define = this.bind(function(n)
		{
			Object.defineProperty(this, n, 
			{
				get: function() { return this.getItemAt(n); },
				set: function(value) { this.setItemAt(n, value); },
				configurable: true,
				enumerable: true
			});
		});
		
		for (i=0; i<this.length; i++)
		{
			define(i);
		}
		
		while (i in this)
		{
			delete this[i++];
		}
	},
	
	/**
	 * @private
	 */
	__applyItemClass: function(item)
	{
		if (item instanceof Array)
		{
			for (var i=0; i<item.length; i++)
			{
				item[i] = this.__applyItemClass(item[i]);
			}
			
			return item;
		}
		
		if (conbo.isObject(item) 
			&& !conbo.isClass(item)
			&& !(item instanceof conbo.Class)
			)
		{
			item = new this.itemClass({source:item, context:this.context});
		}
		
		return item;
	}
	
}).implement(conbo.IInjectable);

// Utility methods that we want to implement on the List.
var listMethods = 
[
	'forEach', 'map', 'reduce', 'reduceRight', 'find', 'findIndex', 'filter',
	'reject', 'every', 'any', 'contains', 'invoke', 'indexOf', 'lastIndexOf',
	'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
	'tail', 'drop', 'last', 'without', 'shuffle', 'isEmpty', 'chain', 'sortOn'
];

// Mix in each available Conbo utility method as a proxy
listMethods.forEach(function(method) 
{
	if (!(method in conbo)) return;
	
	conbo.List.prototype[method] = function() 
	{
		var args = [this.source].concat(conbo.toArray(arguments)),
			result = conbo[method].apply(conbo, args);
		
		// TODO What's the performance impact of doing this?
//		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE));
		
		return conbo.isArray(result)
//			? new this.constructor({source:result}) // TODO Return List of same type as original?
			? new conbo.List({source:result, itemClass:this.itemClass})
			: result;
	};
});

__denumerate(conbo.List.prototype);

/**
 * LocalList is a persistent List class that is saved into LocalStorage
 * or SessionStorage
 * 
 * @class		conbo.LocalList
 * @augments	conbo.List
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options, including 'name' (String), 'session' (Boolean) and 'source' (Array) of default options
 * @fires		conbo.ConboEvent#CHANGE
 * @fires		conbo.ConboEvent#ADD
 * @fires		conbo.ConboEvent#REMOVE
 */
conbo.LocalList = conbo.List.extend(
/** @lends conbo.LocalList.prototype */
{
	__construct: function(options)
	{
		var defaultName = 'ConboLocalList';
		
		options = conbo.defineDefaults(options, this.options, {name:defaultName});
		
		var name = options.name;
		
		var storage = options.session 
			? window.sessionStorage
			: window.localStorage;
		
		if (name == defaultName)
		{
			conbo.warn('No name specified for '+this.toString+', using "'+defaultName+'"');
		}
		
		var getLocal = function()
		{
			return name in storage
				? JSON.parse(storage.getItem(name) || '[]')
				: options.source || [];
		};
		
		// Sync with LocalStorage
		this.addEventListener(conbo.ConboEvent.CHANGE, function(event)
		{
  			storage.setItem(name, JSON.stringify(this));
		}, 
		this, 1000);
		
		options.source = getLocal();
		
		conbo.List.prototype.__construct.call(this, options);
	},
	
	/**
	 * Immediately writes all data to local storage. If you don't use this method, 
	 * Conbo writes the data the next time it detects a change to a bindable property.
	 */
	flush: function()
	{
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE));
	},
	
	toString: function()
	{
		return 'conbo.LocalList';
	}
	
});

__denumerate(conbo.LocalList.prototype);

/**
 * Attribute Bindings
 * 
 * Functions that can be used to bind DOM elements to properties of Bindable 
 * class instances to DOM elements via their attributes.
 * 
 * @class		conbo.AttributeBindings
 * @augments	conbo.Class
 * @author 		Neil Rackett
 */
conbo.AttributeBindings = conbo.Class.extend(
/** @lends conbo.AttributeBindings.prototype */
{
	initialize: function()
	{
		// Methods that can accept multiple parameters
		
		this.cbClass.multiple = true;
		this.cbStyle.multiple = true;
		
		// Methods that require raw attribute data instead of bound property values
		
		this.cbIncludeIn.raw = true;
		this.cbExcludeFrom.raw = true;
	},
	
	/**
	 * Can the given attribute be bound to multiple properties at the same time?
	 * @param 	{String}	attribute
	 * @returns {Boolean}
	 */
	canHandleMultiple: function(attribute)
	{
		var f = conbo.toCamelCase(attribute);
		
		return (f in this)
			? !!this[f].multiple
			: false;
	},
	
	/**
	 * Makes an element visible
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-show="propertyName"></div>
	 */
	cbShow: function(el, value)
	{
		this.cbHide(el, !value);
	},
	
	/**
	 * Hides an element by making it invisible, but does not remove
	 * if from the layout of the page, meaning a blank space will remain
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-hide="propertyName"></div>
	 */
	cbHide: function(el, value)
	{
		var ep = __ep(el);
		
		!!value
			? ep.addClass('cb-hide')
			: ep.removeClass('cb-hide');
	},
	
	/**
	 * Include an element on the screen and in the layout of the page
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-include="propertyName"></div>
	 */
	cbInclude: function(el, value)
	{
		this.cbExclude(el, !value);
	},
	
	/**
	 * Remove an element from the screen and prevent it having an effect
	 * on the layout of the page
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-exclude="propertyName"></div>
	 */
	cbExclude: function(el, value)
	{
		var ep = __ep(el);
		
		!!value
			? ep.addClass('cb-exclude')
			: ep.removeClass('cb-exclude');
	},
	
	/**
	 * The exact opposite of HTML's built-in `disabled` property
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-enabled="propertyName"></div>
	 */
	cbEnabled: function(el, value)
	{
		el.disabled = !value;
	},
	
	/**
	 * Inserts raw HTML into the element, which is rendered as HTML
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-html="propertyName"></div>
	 */
	cbHtml: function(el, value)
	{
		el.innerHTML = value;
	},
	
	/**
	 * Inserts text into the element so that it appears on screen exactly as
	 * it's written by converting special characters (<, >, &, etc) into HTML
	 * entities before rendering them, e.g. "8 < 10" becomes "8 &lt; 10", and
	 * line breaks into <br/>
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-text="propertyName"></div>
	 */
	cbText: function(el, value)
	{
		value = conbo.encodeEntities(value).replace(/\r?\n|\r/g, '<br/>');
		el.innerHTML = value;
	},
	
	/**
	 * Applies or removes a CSS class to or from the element based on the value
	 * of the bound property, e.g. cb-class="myProperty:class-name"
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-class="propertyName:my-class-name"></div>
	 */
	cbClass: function(el, value, options, className)
	{
		if (!className)
		{
			conbo.warn('cb-class attributes must specify one or more CSS classes in the format cb-class="myProperty:class-name"');
		}
		
		!!value
			? __ep(el).addClass(className)
			: __ep(el).removeClass(className)
			;
	},
	
	/**
	 * Applies class(es) to the element based on the value contained in a variable. 
	 * Experimental.
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-classes="propertyName"></div>
	 */
	cbClasses: function(el, value)
	{
		if (el.cbClasses)
		{
			__ep(el).removeClass(el.cbClasses);
		}
		
		el.cbClasses = value;
		
		if (value)
		{
			__ep(el).addClass(value);
		}
	},
	
	/**
	 * Apply styles from a variable
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-="propertyName:font-weight"></div>
	 */
	cbStyle: function(el, value, options, styleName)
	{
		if (!styleName)
		{
			conbo.warn('cb-style attributes must specify one or more styles in the format cb-style="myProperty:style-name"');
		}
		
		styleName = conbo.toCamelCase(styleName);
		el.style[styleName] = value;
	},
	
	/**
	 * Repeats the element once for each item of the specified list or Array,
	 * applying the specified Glimpse or View class to the element and passing
	 * each value to the item renderer as a "data" property.
	 * 
	 * The optional item renderer class can be specified by following the 
	 * property name with a colon and the class name or by using the tag name.
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <li cb-repeat="people" cb-hml="data.firstName"></li>
	 * <li cb-repeat="people:PersonItemRenderer" cb-hml="data.firstName"></li>
	 * <person-item-renderer cb-repeat="people"></person-item-renderer>
	 */
	cbRepeat: function(el, values, options, itemRendererClassName)
	{
		var a; 
		var args = conbo.toArray(arguments);
		var viewClass;
		var ep = __ep(el);
		
		options || (options = {});
		
		if (options.context && options.context.namespace)
		{
			itemRendererClassName || (itemRendererClassName = conbo.toCamelCase(el.tagName, true));
			viewClass = conbo.BindingUtils.getClass(itemRendererClassName, options.context.namespace);
		}
		
		viewClass || (viewClass = conbo.ItemRenderer);
		el.cbRepeat || (el.cbRepeat = {});
		
		var elements = el.cbRepeat.elements || [];
		
		ep.removeClass('cb-exclude');
		
		if (el.cbRepeat.list != values && values instanceof conbo.List)
		{
			if (el.cbRepeat.list)
			{
				el.cbRepeat.list.removeEventListener('change', el.cbRepeat.changeHandler);
			}
			
			el.cbRepeat.changeHandler = this.bind(function(event)
			{
				this.cbRepeat.apply(this, args);
			});
			
			values.addEventListener('change', el.cbRepeat.changeHandler);
			el.cbRepeat.list = values;
		}
		
		switch (true)
		{
			case values instanceof Array:
			case values instanceof conbo.List:
			{
				a = values;
				break;
			}
			
			default:
			{
				// To support element lists, etc
				a = conbo.isIterable(values)
					? conbo.toArray(values)
					: [];
				break;
			}
		}
		
		// Ensure the original element is re-inserted into the DOM before proceeding
		if (elements.length && elements[0].parentNode)
		{
			elements[0].parentNode.insertBefore(el, elements[0]);
		}
		
		while (elements.length)
		{
			var rEl = elements.pop();
			var rView = rEl.cbView || rEl.cbGlimpse;
			
			if (rView) rView.remove();
			else rEl.parentNode.removeChild(rEl);
		}
		
		// Switched from forEach loop to resolve issues using "new Array(n)"
		// see: http://stackoverflow.com/questions/23460301/foreach-on-array-of-undefined-created-by-array-constructor
		for (var index=0,length=a.length; index<length; ++index)
		{
			var value = a[index];
			var clone = el.cloneNode(true);
			
			if (conbo.isObject(value) && !(value instanceof conbo.Hash))
			{
				value = new conbo.Hash({source:value});
			}
			
			clone.removeAttribute('cb-repeat');
			
			var viewOptions = 
			{
				data: value, 
				el: clone, 
				index: index,
				isLast: index == a.length-1,
				list: a,
				className: 'cb-repeat'
			};
			
			var view = new viewClass(conbo.setValues(viewOptions, options));
			
			elements.push(view.el);
		};
		
		var fragment = document.createDocumentFragment();
		
		elements.forEach(function(el)
		{
			fragment.appendChild(el);
		});
		
		el.parentNode.insertBefore(fragment, el);
		el.cbRepeat.elements = elements;
		
		elements.length
			? el.parentNode.removeChild(el)
			: el.className += ' cb-exclude'
			;
	},
	
	/**
	 * Sets the properties of the element's dataset (it's `data-*` attributes)
	 * using the properties of the object being bound to it. Non-Object values 
	 * will be disregarded. You'll need to use a polyfill for IE <= 10.
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-dataset="propertyName"></div>
	 */
	cbDataset: function(el, value)
	{
		if (conbo.isObject(value))
		{
			conbo.setValues(el.dataset, value);
		}
	},
	
	/**
	 * When used with a standard DOM element, the properties of the element's
	 * `dataset` (it's `data-*` attributes) are set using the properties of the 
	 * object being bound to it; you'll need to use a polyfill for IE <= 10
	 * 
	 * When used with a Glimpse, the Glimpse's `data` property is set to
	 * the value of the bound property. 
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-data="propertyName"></div>
	 */
	cbData: function(el, value)
	{
		if (el.cbGlimpse)
		{
			el.cbGlimpse.data = value;
		}
		else
		{
			this.cbDataset(el, value);
		}
	},
	
	/**
	 * Only includes the specified element in the layout when the View's `currentState`
	 * matches one of the states listed in the attribute's value; multiple states should
	 * be separated by spaces
	 * 
	 * @param 		el
	 * @param 		value
	 * @param 		options
	 * 
	 * @example
	 * <div cb-include-in="happy sad elated"></div>
	 */
	cbIncludeIn: function(el, value, options)
	{
		var view = options.view;
		var states = value.split(' ');
		
		var stateChangeHandler = this.bind(function()
		{
			this.cbInclude(el, states.indexOf(view.currentState) != -1);
		});
		
		view.addEventListener('change:currentState', stateChangeHandler, this);
		stateChangeHandler.call(this);
	},
	
	/**
	 * Removes the specified element from the layout when the View's `currentState`
	 * matches one of the states listed in the attribute's value; multiple states should
	 * be separated by spaces
	 * 
	 * @param 		el
	 * @param 		value
	 * @param 		options
	 * 
	 * @example
	 * <div cb-exclude-from="confused frightened"></div>
	 */
	cbExcludeFrom: function(el, value, options)
	{
		var view = options.view;
		var states = value.split(' ');
		
		var stateChangeHandler = function()
		{
			this.cbExclude(el, states.indexOf(view.currentState) != -1);
		};
		
		view.addEventListener('change:currentState', stateChangeHandler, this);
		stateChangeHandler.call(this);
	},
	
	/**
	 * Completely removes an element from the DOM based on a bound property value, 
	 * primarily intended to facilitate graceful degredation and removal of desktop 
	 * features in mobile environments.
	 * 
	 * @example		cb-remove="isMobile"
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-remove="propertyName"></div>
	 */
	cbRemove: function(el, value)
	{
		if (!!value)
		{
			// TODO Remove binding, etc?
			el.parentNode.removeChild(el);
		}
	},
	
	/**
	 * The opposite of `cbRemove`
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-keep="propertyName"></div>
	 */
	cbKeep: function(el, value)
	{
		this.cbRemove(el, !value);
	},
	
	/**
	 * Enables the use of cb-onbind attribute to handle the 'bind' event 
	 * dispatched by the element after it has been bound by Conbo
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-onbind="functionName"></div>
	 */
	cbOnbind: function(el, handler)
	{
		el.addEventListener('bind', handler);
	},
	
	/**
	 * Uses JavaScript to open an anchor's HREF so that the link will open in
	 * an iOS WebView instead of Safari
	 * 
	 * @param el
	 * 
	 * @example
	 * <div cb-jshref="propertyName"></div>
	 */
	cbJshref: function(el)
	{
		if (el.tagName == 'A')
		{
			el.onclick = function(event)
			{
				window.location = el.href;
				event.preventDefault();
				return false;
			};
		}
	},
	
	/*
	 * FORM HANDLING & VALIDATION
	 */
	
	/**
	 * Detects changes to the specified element and applies the CSS class
	 * cb-changed or cb-unchanged, depending on whether the contents have
	 * changed from their original value.
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-detect-change></div>
	 */
	cbDetectChange: function(el, value)
	{
		var ep = __ep(el); 
		var form = ep.closest('form');
		var fp = __ep(form);
		var originalValue = el.value || el.innerHTML;
		
		var updateForm = function()
		{
			fp.removeClass('cb-changed cb-unchanged')
				.addClass(form.querySelector('.cb-changed') ? 'cb-changed' : 'cb-unchanged');
		};
		
		var changeHandler = function()
		{
			var changed = (el.value || el.innerHTML) != originalValue;
			
			ep.removeClass('cb-changed cb-unchanged')
				.addClass(changed ? 'cb-changed' : 'cb-unchanged')
				;
			
			updateForm();
		};
		
		ep.addEventListener('change input', changeHandler)
			.addClass('cb-unchanged')
			;
		
		updateForm();
	},
	
	/**
	 * Use a method or regex to validate a form element and apply a
	 * cb-valid or cb-invalid CSS class based on the outcome
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-validate="functionName"></div>
	 */
	cbValidate: function(el, validator)
	{
		var validateFunction;
		
		switch (true)
		{
			case conbo.isFunction(validator):
			{
				validateFunction = validator;
				break;
			}
			
			case conbo.isString(validator):
			{
				validator = new RegExp(validator);
			}
			
			case conbo.isRegExp(validator):
			{
				validateFunction = function(value)
				{
					return validator.test(value);
				};
				
				break;
			}
		}
		
		if (!conbo.isFunction(validateFunction))
		{
			conbo.warn(validator+' cannot be used with cb-validate');
			return;
		}
		
		var ep = __ep(el);
		var form = ep.closest('form');
		
		var removeClass = function(regEx) 
		{
			return function (classes) 
			{
				return classes.split(/\s+/).filter(function (el)
				{
					return regEx.test(el); 
				})
				.join(' ');
			};
		};
		
		var validate = function()
		{
			// Form item
			
			var value = el.value || el.innerHTML
				, result = validateFunction(value) 
				, valid = (result === true)
				, classes = []
				;
			
			classes.push(valid ? 'cb-valid' : 'cb-invalid');
			
			if (conbo.isString(result))
			{
				classes.push('cb-invalid-'+result);
			}
			
			ep.removeClass('cb-valid cb-invalid')
				.removeClass(removeClass(/^cb-invalid-/))
				.addClass(classes.join(' '))
				;
			
			// Form
			
			if (form)
			{
				var fp = __ep(form);
				
				fp.removeClass('cb-valid cb-invalid')
					.removeClass(removeClass(/^cb-invalid-/))
					;
				
				if (valid) 
				{
					valid = !form.querySelector('.cb-invalid');
					
					if (valid)
					{
						conbo.toArray(form.querySelectorAll('[required]')).forEach(function(rEl) 
						{
							if (!String(rEl.value || rEl.innerHTML).trim())
							{
								valid = false;
								return false; 
							}
						});
					}
				}
				
				fp.addClass(valid ? 'cb-valid' : 'cb-invalid');
			}
			
		};
		
		ep.addEventListener('change input blur', validate);
	},
	
	/**
	 * Restricts text input to the specified characters
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-restrict="propertyName"></div>
	 */
	cbRestrict: function(el, value)
	{
		// TODO Restrict to text input fields?
		
		if (el.cbRestrict)
		{
			el.removeEventListener('keypress', el.cbRestrict);
		}
		
		el.cbRestrict = function(event)
		{
			if (event.ctrlKey)
			{
				return;
			}
			
			var code = event.keyCode || event.which;
			var char = event.key || String.fromCharCode(code);
			var regExp = value;
				
			if (!conbo.isRegExp(regExp))
			{
				regExp = new RegExp('['+regExp+']', 'g');
			}
			
			if (!char.match(regExp))
			{
				event.preventDefault();
			}
		};
		
		el.addEventListener('keypress', el.cbRestrict);
	},
	
	/**
	 * Limits the number of characters that can be entered into
	 * input and other form fields
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-max-chars="propertyName"></div>
	 */
	cbMaxChars: function(el, value)
	{
		// TODO Restrict to text input fields?
		
		if (el.cbMaxChars)
		{
			el.removeEventListener('keypress', el.cbMaxChars);
		}
		
		el.cbMaxChars = function(event)
		{
			if ((el.value || el.innerHTML).length >= value)
			{
				event.preventDefault();
			}
		};
		
		el.addEventListener('keypress', el.cbMaxChars);
	},
	
});

(function()
{
	var BindingUtils__cbAttrs = new conbo.AttributeBindings();
	var BindingUtils__customAttrs = {};
	var BindingUtils__reservedAttrs = ['cb-app', 'cb-view', 'cb-glimpse', 'cb-content'];
	var BindingUtils__reservedNamespaces = ['cb', 'data', 'aria'];
	var BindingUtils__registeredNamespaces = ['cb'];
	
	/**
	 * Set the value of a property, ensuring Numbers are types correctly
	 * 
	 * @private
	 * @param 	propertyName
	 * @param 	value
	 * @example	BindingUtils__set.call(target, 'n', 123);
	 * @returns	this
	 */
	var BindingUtils__set = function(propertyName, value)
	{
		if (this[propertyName] === value)
		{
			return this;
		}
		
		// Ensure numbers are returned as Number not String
		if (value && conbo.isString(value) && !isNaN(value))
		{
			value = parseFloat(value);
			if (isNaN(value)) value = '';
		}
		
		this[propertyName] = value;
		
		return this;
	};
	
	/**
	 * Is the specified attribute reserved for another purpose?
	 * 
	 * @private
	 * @param 		{String}	value
	 * @returns		{Boolean}
	 */
	var BindingUtils__isReservedAttr = function(value)
	{
		return BindingUtils__reservedAttrs.indexOf(value) != -1;
	};
	
	/**
	 * Attempt to make a property bindable if it isn't already
	 * 
	 * @private
	 * @param 		{String}	value
	 * @returns		{Boolean}
	 */
	var BindingUtils__makeBindable = function(source, propertyName)
	{
		if (!conbo.isAccessor(source, propertyName))
		{
			if (source instanceof conbo.EventDispatcher)
			{
				conbo.makeBindable(source, [propertyName]);
			}
			else
			{
				conbo.warn('It will not be possible to detect changes to "'+propertyName+'" because "'+source.toString()+'" is not an EventDispatcher');
			}
		}
	}
	
	/**
	 * Remove everything except alphanumeric, dot, space and underscore 
	 * characters from Strings
	 * 
	 * @private
	 * @param 		{String}	value - String value to clean
	 * @returns		{String}
	 */
	var BindingUtils__cleanPropertyName = function(value)
	{
		return (value || '').trim().replace(/[^\w\._\s]/g, '');
	};
	
	/**
	 * Binding utility class
	 * 
	 * Used to bind properties of EventDispatcher class instances to DOM elements, 
	 * other EventDispatcher class instances or setter functions
	 * 
	 * @class		conbo.BindingUtils
	 * @augments	conbo.Class
	 * @author 		Neil Rackett
	 */
	conbo.BindingUtils = conbo.Class.extend({},
	/** @lends conbo.BindingUtils */
	{
		/**
		 * Bind a property of a EventDispatcher class instance (e.g. Hash or View) 
		 * to a DOM element's value/content, using Conbo's best judgement to
		 * work out how the value should be bound to the element.
		 * 
		 * This method of binding also allows for the use of a parse function,
		 * which can be used to manipulate bound data in real time
		 * 
		 * @param 		{conbo.EventDispatcher}	source			Class instance which extends from conbo.EventDispatcher
		 * @param 		{String} 				propertyName	Property name to bind
		 * @param 		{DOMElement} 			el				DOM element to bind value to (two-way bind on input/form elements)
		 * @param 		{Function}				parseFunction	Optional method used to parse values before outputting as HTML
		 * 
		 * @returns		{Array}									Array of bindings
		 */
		bindElement: function(source, propertyName, el, parseFunction)
		{
			var isEventDispatcher = source instanceof conbo.EventDispatcher;
			
			if (!el)
			{
				throw new Error('el is undefined');
			}
			
			BindingUtils__makeBindable(source, propertyName);
			
			var scope = this;
			var bindings = [];
			var eventType;
			var eventHandler;
			
			parseFunction || (parseFunction = this.defaultParseFunction);
			
			var ep = new conbo.EventProxy(el);
			var tagName = el.tagName;
			
			switch (tagName)
			{
				case 'INPUT':
				case 'SELECT':
				case 'TEXTAREA':
				{	
					var type = (el.type || tagName).toLowerCase();
					
					switch (type)
					{
						case 'checkbox':
						{
							el.checked = !!source[propertyName];
							
							if (isEventDispatcher)
							{
								eventType = 'change:'+propertyName;
								
								eventHandler = function(event)
								{
									el.checked = !!event.value;
								};
								
								source.addEventListener(eventType, eventHandler);
								bindings.push([source, eventType, eventHandler]);
							}
							
							eventType = 'input change';
							
							eventHandler = function(event)
							{
								BindingUtils__set.call(source, propertyName, el.checked);
							};
							
							ep.addEventListener(eventType, eventHandler);
							bindings.push([ep, eventType, eventHandler]);
							
							return;
						}
						
						case 'radio':
						{
							if (el.value == source[propertyName]) 
							{
								el.checked = true;
							}
							
							if (isEventDispatcher)
							{
								eventType = 'change:'+propertyName;
								
								eventHandler = function(event)
								{
									if (event.value == null) event.value = '';
									if (el.value != event.value) return; 
									
									el.checked = true;
								};
								
								source.addEventListener(eventType, eventHandler);
								bindings.push([source, eventType, eventHandler]);
							}
							
							break;
						}
						
						default:
						{
							var setVal = function() 
							{
								el.value = source[propertyName]; 
							};
							
							// Resolves issue with cb-repeat inside <select>
							if (type == 'select') conbo.defer(setVal);
							else setVal();
							
							if (isEventDispatcher)
							{
								eventType = 'change:'+propertyName;
								
								eventHandler = function(event)
								{
									if (event.value == null) event.value = '';
									if (el.value == event.value) return;
									
									el.value = event.value;
								};
								
								source.addEventListener(eventType, eventHandler);
								bindings.push([source, eventType, eventHandler]);
							}
							
							break;
						}
					}
					
					eventType = 'input change';
					
					eventHandler = function(event)
					{
						BindingUtils__set.call(source, propertyName, el.value === undefined ? el.innerHTML : el.value);
					};
					
					ep.addEventListener(eventType, eventHandler);
					bindings.push([ep, eventType, eventHandler]);
					
					break;
				}
				
				default:
				{
					el.innerHTML = parseFunction(source[propertyName]);
					
					if (isEventDispatcher)
					{
						eventType = 'change:'+propertyName;
						
						eventHandler = function(event) 
						{
							var html = parseFunction(event.value);
							el.innerHTML = html;
						};
						
						source.addEventListener(eventType, eventHandler);
						bindings.push([source, eventType, eventHandler]);
					}
					
					break;
				}
			}
			
			return bindings;
		},
		
		/**
		 * Unbinds the specified property of a bindable class from the specified DOM element
		 * 
		 *  @param	el		DOM element
		 *  @param	view	View class
		 */
		unbindElement: function(source, propertyName, element)
		{
			// TODO Implement unbindElement
		},
		
		/**
		 * Bind a DOM element to the property of a EventDispatcher class instance,
		 * e.g. Hash or Model, using cb-* attributes to specify how the binding
		 * should be made.
		 * 
		 * Two way bindings will automatically be applied where the attribute name 
		 * matches a property on the target element, meaning your EventDispatcher object 
		 * will automatically be updated when the property changes.
		 * 
		 * @param 	{conbo.EventDispatcher}	source			Class instance which extends from conbo.EventDispatcher (e.g. Hash or Model)
		 * @param 	{String}				propertyName	Property name to bind
		 * @param 	{DOMElement}			element			DOM element to bind value to (two-way bind on input/form elements)
		 * @param 	{String}				attributeName	The attribute to bind as it appears in HTML, e.g. "cb-prop-name"
		 * @param 	{Function} 				parseFunction	Method used to parse values before outputting as HTML (optional)
		 * @param	{Object}				options			Options related to this attribute binding (optional)
		 * 
		 * @returns	{Array}					Array of bindings
		 */
		bindAttribute: function(source, propertyName, element, attributeName, parseFunction, options)
		{
			var bindings = [];
			
			if (BindingUtils__isReservedAttr(attributeName))
			{
				return bindings;
			}
			
			if (!element)
			{
				throw new Error('element is undefined');
			}
			
			var split = attributeName.split('-'),
				hasNs = split.length > 1
				;
			
			if (!hasNs)
			{
				return bindings;
			}
			
			if (attributeName == "cb-bind")
			{
				return this.bindElement(source, propertyName, element, parseFunction);
			}
			
			BindingUtils__makeBindable(source, propertyName);
			
			var scope = this,
				eventType,
				eventHandler,
				args = conbo.toArray(arguments).slice(5),
				camelCase = conbo.toCamelCase(attributeName),
				ns = split[0],
				isConboNs = (ns == 'cb'),
				isConbo = isConboNs && camelCase in BindingUtils__cbAttrs,
				isCustom = !isConbo && camelCase in BindingUtils__customAttrs,
				isNative = isConboNs && split.length == 2 && split[1] in element,
				attrFuncs = BindingUtils__cbAttrs
				;
			
			parseFunction || (parseFunction = this.defaultParseFunction);
			
			switch (true)
			{
				// If we have a bespoke handler for this attribute, use it
				case isCustom:
					attrFuncs = BindingUtils__customAttrs;
				
				case isConbo:
				{
					if (!(source instanceof conbo.EventDispatcher))
					{
						conbo.warn('Source is not EventDispatcher');
						return this;
					}
					
					var fn = attrFuncs[camelCase];
					
					if (fn.raw)
					{
						fn.apply(attrFuncs, [element, propertyName].concat(args));
					}
					else
					{
						eventHandler = function(event)
						{
							fn.apply(attrFuncs, [element, parseFunction(source[propertyName])].concat(args));
						};
						
						eventType = 'change:'+propertyName;
						
						source.addEventListener(eventType, eventHandler);
						eventHandler();
						
						bindings.push([source, eventType, eventHandler]);
					}
					
					break;
				}
				
				case isNative:
				{
					var nativeAttr = split[1];
					
					switch (true)
					{
						case nativeAttr.indexOf('on') !== 0 && conbo.isFunction(element[nativeAttr]):
						{
							conbo.warn(attributeName+' is not a recognised attribute, did you mean cb-on'+nativeAttr+'?');
							break;
						}
						
						// If it's an event, add a listener
						case nativeAttr.indexOf('on') === 0:
						{
							if (!conbo.isFunction(source[propertyName]))
							{
								conbo.warn(propertyName+' is not a function and cannot be bound to DOM events');
								return this;
							}
							
							eventType = nativeAttr.substr(2);
							eventHandler = source[propertyName];
							
							element.addEventListener(eventType, eventHandler);
							bindings.push([element, eventType, eventHandler]);
							
							break;
						}
						
						// ... otherwise, bind to the native property
						default:
						{
							if (!(source instanceof conbo.EventDispatcher))
							{
								conbo.warn('Source is not EventDispatcher');
								return this;
							}
							
							eventHandler = function()
							{
								var value;
								
								value = parseFunction(source[propertyName]);
								value = conbo.isBoolean(element[nativeAttr]) ? !!value : value;
								
								element[nativeAttr] = value;
							};
						    
							eventType = 'change:'+propertyName;
							source.addEventListener(eventType, eventHandler);
							eventHandler();
							
							bindings.push([source, eventType, eventHandler]);
							
							var ep = new conbo.EventProxy(element);
							
							eventHandler = function()
			     			{
								BindingUtils__set.call(source, propertyName, element[nativeAttr]);
			     			};
							
			     			eventType = 'input change';
							ep.addEventListener(eventType, eventHandler);
							
							bindings.push([ep, eventType, eventHandler]);
							
							break;
						}
					}
					
					break;
				}
				
				default:
				{
					conbo.warn(attributeName+' is not recognised or does not exist on specified element');
					break;
				}
			}
			
			return bindings;
		},
		
		/**
		 * Applies the specified read-only Conbo or custom attribute to the specified element
		 * 
		 * @param 	{DOMElement}			element			DOM element to bind value to (two-way bind on input/form elements)
		 * @param 	{String}				attributeName	The attribute to bind as it appears in HTML, e.g. "cb-prop-name"
		 * @returns	{conbo.BindingUtils}	A reference to this object 
		 * 
		 * @example
		 * conbo.BindingUtils.applyAttribute(el, "my-custom-attr");
		 */
		applyAttribute: function(element, attributeName)
		{
			if (this.attributeExists(attributeName))
			{
				var camelCase = conbo.toCamelCase(attributeName),
					ns = attributeName.split('-')[0],
					attrFuncs = (ns == 'cb') ? BindingUtils__cbAttrs : BindingUtils__customAttrs,
					fn = attrFuncs[camelCase]
					;
				
				if (fn.readOnly)
				{
					fn.call(attrFuncs, element);
				}
				else
				{
					conbo.warn(attr+' attribute cannot be used without a value');
				}
				
				return this;
			}
			
			conbo.warn(attr+' attribute does not exist');
			
			return this;
		},
		
		/**
		 * Does the specified Conbo or custom attribute exist?
		 * @param 	{String}				attributeName - The attribute name as it appears in HTML, e.g. "cb-prop-name"
		 * @returns	{Boolean}
		 */
		attributeExists: function(attributeName)
		{
			var camelCase = conbo.toCamelCase(attributeName);
			return camelCase in BindingUtils__cbAttrs || camelCase in BindingUtils__customAttrs;
		},
		
		/**
		 * Bind everything within the DOM scope of a View to the specified 
		 * properties of EventDispatcher class instances (e.g. Hash or Model)
		 * 
		 * @param 	{conbo.View}		view		The View class controlling the element
		 * @returns	{conbo.BindingUtils}	A reference to this object 
		 */
		bindView: function(view)
		{
			if (!view)
			{
				throw new Error('view is undefined');
			}
			
			if (!!view.__bindings)
			{
				this.unbindView(view);
			}
			
			var options = {view:view},
				bindings = [],
				scope = this;
			
			if (!!view.subcontext) 
			{
				view.subcontext.addTo(options);
			}
			
			var ns = view.context && view.context.namespace;
			
			if (ns)
			{
				this.applyViews(view, ns, 'glimpse')
					.applyViews(view, ns, 'view')
					;
			}
			
			var ignored = [];
			
			view.querySelectorAll('[cb-repeat]').forEach(function(el)
			{
				ignored = ignored.concat(conbo.toArray(el.querySelectorAll('*')));
			});
			
			var elements = conbo.difference(view.querySelectorAll('*').concat([view.el]), ignored);
			
			elements.forEach(function(el, index)
			{
				var attrs = __ep(el).attributes;
				
				if (!conbo.keys(attrs).length) 
				{
					return;
				}
				
				var keys = conbo.keys(attrs);
				
				// Prevents Conbo trying to populate repeat templates 
				if (keys.indexOf('cbRepeat') != -1)
				{
					keys = ['cbRepeat'];
				}
				
				keys.forEach(function(key)
				{
					var type = conbo.toUnderscoreCase(key, '-');
					var typeSplit = type.split('-');
					
					if (typeSplit.length < 2 
						|| BindingUtils__registeredNamespaces.indexOf(typeSplit[0]) == -1 
						|| BindingUtils__isReservedAttr(type))
					{
						return;
					}
					
					var splits = attrs[key].split(',');
					
					if (!BindingUtils__cbAttrs.canHandleMultiple(type))
					{
						splits = [splits[0]];
					}
					
					var splitsLength = splits.length;
					
					for (var i=0; i<splitsLength; i++)
					{
						var parseFunction,
							d = splits[i];
						
						if (!d && !conbo.isString(d))
						{
							scope.applyAttribute(el, type);
							break;
						}
						
						var b = d.split('|'),
							v = b[0].split(':'),
							propertyName = v[0],
							param = v[1],
							split = BindingUtils__cleanPropertyName(propertyName).split('.'),
							property = split.pop(),
							model;
						
						try
						{
							parseFunction = !!b[1] ? eval('view.'+BindingUtils__cleanPropertyName(b[1])) : undefined;
							parseFunction = conbo.isFunction(parseFunction) ? parseFunction : undefined;
						}
						catch (e) {}
						
						try
						{
							model = !!split.length ? eval('view.'+split.join('.')) : view;
						}
						catch (e) {}
						
						if (!model) 
						{
							conbo.warn(propertyName+' is not defined in this View');
							return;
						}
						
						var opts = conbo.defineValues({propertyName:property}, options);
						var args = [model, property, el, type, parseFunction, opts, param];
						
						bindings = bindings.concat(scope.bindAttribute.apply(scope, args));
					}
					
					// Dispatch a `bind` event from the element at the end of the current call stack
					conbo.defer(function()
					{
						var customEvent;
						
						customEvent = document.createEvent('CustomEvent');
						customEvent.initCustomEvent('bind', false, false, {});					
						
						el.dispatchEvent(customEvent);
					});
				});
				
			});
			
			__definePrivateProperty(view, '__bindings', bindings);
			
			return this;
		},
		
		/**
		 * Removes all data binding from the specified View instance
		 * @param 	{conbo.View}	view
		 * @returns	{conbo.BindingUtils}	A reference to this object 
		 */
		unbindView: function(view)
		{
			if (!view)
			{
				throw new Error('view is undefined');
			}
			
			if (!view.__bindings || !view.__bindings.length)
			{
				return this;
			}
			
			var bindings = view.__bindings;
			
			while (bindings.length)
			{
				var binding = bindings.pop();
				
				try
				{
					binding[0].removeEventListener(binding[1], binding[2]);
				}
				catch (e) {}
			}
			
			delete view.__bindings;
			
			return this;
		},
		
		/**
		 * Applies View and Glimpse classes DOM elements based on their cb-view 
		 * attribute or tag name
		 * 
		 * @param	rootView	DOM element, View or Application class instance
		 * @param	namespace	The current namespace
		 * @param	type		View type, 'view' or 'glimpse' (default: 'view')
		 * @returns	{conbo.BindingUtils}	A reference to this object 
		 */
		applyViews: function(rootView, namespace, type)
		{
			type || (type = 'view');
			
			if (['view', 'glimpse'].indexOf(type) == -1)
			{
				throw new Error(type+' is not a valid type parameter for applyView');
			}
			
			var typeClass = conbo[type.charAt(0).toUpperCase()+type.slice(1)],
				scope = this
				;
			
			var rootEl = conbo.isElement(rootView) ? rootView : rootView.el;
			
			for (var className in namespace)
			{
				var classReference = scope.getClass(className, namespace);
				var isView = conbo.isClass(classReference, conbo.View);
				var isGlimpse = conbo.isClass(classReference, conbo.Glimpse) && !isView;
				
				if ((type == 'glimpse' && isGlimpse) || (type == 'view' && isView))
				{
					var tagName = conbo.toKebabCase(className);
					var nodes = conbo.toArray(rootEl.querySelectorAll(tagName+':not(.cb-'+type+'):not([cb-repeat]), [cb-'+type+'='+className+']:not(.cb-'+type+'):not([cb-repeat])'));
					
					nodes.forEach(function(el)
					{
						var ep = __ep(el);
						var closestView = ep.closest('.cb-view');
						var context = closestView ? closestView.cbView.subcontext : rootView.subcontext;
						
						new classReference({el:el, context:context});
					});
				}
			}
			
			return this;
		},
		
		/**
		 * Bind the property of one EventDispatcher class instance (e.g. Hash or View) to another
		 * 
		 * @param 	{conbo.EventDispatcher}	source						Class instance which extends conbo.EventDispatcher
		 * @param 	{String}			sourcePropertyName			Source property name
		 * @param 	{any}				destination					Object or class instance which extends conbo.EventDispatcher
		 * @param 	{String}			destinationPropertyName		Optional (default: sourcePropertyName)
		 * @param 	{Boolean}			twoWay						Optional (default: false)
		 * @returns	{conbo.BindingUtils}	A reference to this object 
		 */
		bindProperty: function(source, sourcePropertyName, destination, destinationPropertyName, twoWay)
		{
			if (!(source instanceof conbo.EventDispatcher))
			{
				throw new Error(sourcePropertyName+' source is not EventDispatcher');
			}
			
			var scope = this;
			
			destinationPropertyName || (destinationPropertyName = sourcePropertyName);
			
			BindingUtils__makeBindable(source, sourcePropertyName);
			
			source.addEventListener('change:'+sourcePropertyName, function(event)
			{
				if (!(destination instanceof conbo.EventDispatcher))
				{
					destination[destinationPropertyName] = event.value;
					return;
				}
				
				BindingUtils__set.call(destination, destinationPropertyName, event.value);
			});
			
			if (twoWay && destination instanceof conbo.EventDispatcher)
			{
				this.bindProperty(destination, destinationPropertyName, source, sourcePropertyName);
			}
			
			return this;
		},
		
		/**
		 * Call a setter function when the specified property of a EventDispatcher 
		 * class instance (e.g. Hash or Model) is changed
		 * 
		 * @param 	{conbo.EventDispatcher}	source				Class instance which extends conbo.EventDispatcher
		 * @param 	{String}			propertyName
		 * @param 	{Function}			setterFunction
		 * @returns	{conbo.BindingUtils}	A reference to this object 
		 */
		bindSetter: function(source, propertyName, setterFunction)
		{
			if (!(source instanceof conbo.EventDispatcher))
			{
				throw new Error('Source is not EventDispatcher');
			}
			
			if (!conbo.isFunction(setterFunction))
			{
				if (!setterFunction || !(propertyName in setterFunction))
				{
					throw new Error('Invalid setter function');
				}
				
				setterFunction = setterFunction[propertyName];
			}
			
			BindingUtils__makeBindable(source, propertyName);
			
			source.addEventListener('change:'+propertyName, function(event)
			{
				setterFunction(event.value);
			});
			
			return this;
		},
		
		/**
		 * Default parse function
		 * 
		 * @param	{*} 		value - The value to be parsed
		 * @returns	{function}
		 */
		defaultParseFunction: function(value)
		{
			return typeof(value) == 'undefined' ? '' : value;
		},
		
		/**
		 * Attempt to convert string into a conbo.Class in the specified namespace
		 * 
		 * @param 		{string} className - The name of the class
		 * @param 		{conbo.Namespace} namespace - The namespace containing the class
		 * @returns		{conbo.Class}
		 */
		getClass: function(className, namespace)
		{
			if (!className || !namespace) return;
			
			try
			{
				var classReference = namespace[className];
				
				if (conbo.isClass(classReference)) 
				{
					return classReference;
				}
			}
			catch (e) {}
		},
		
		/**
		 * Register a custom attribute handler
		 * 
		 * @param		{string}	name - camelCase version of the attribute name (must include a namespace prefix)
		 * @param		{function}	handler - function that will handle the data bound to the element
		 * @param 		{boolean}	readOnly - Whether or not the attribute is read-only (default: false)
		 * @param 		{boolean}	raw - Whether or not parameters should be passed to the handler as a raw String instead of a bound value (default: false)
		 * @returns		{conbo.BindingUtils}	A reference to this object 
		 * 
		 * @example 
		 * // HTML: <div my-font-name="myProperty"></div>
		 * conbo.BindingUtils.registerAttribute('myFontName', function(el, value, options, param)
		 * {
		 *		el.style.fontName = value;
		 * });
		 */
		registerAttribute: function(name, handler, readOnly, raw)
		{
			if (!conbo.isString(name) || !conbo.isFunction(handler))
			{
				conbo.warn("registerAttribute: both 'name' and 'handler' parameters are required");
				return this;
			}
			
			var split = conbo.toUnderscoreCase(name).split('_');
			
			if (split.length < 2)
			{
				conbo.warn("registerAttribute: "+name+" does not include a namespace, e.g. "+conbo.toCamelCase('my-'+name));
				return this;
			}
			
			var ns = split[0];
			
			if (BindingUtils__reservedNamespaces.indexOf(ns) != -1)
			{
				conbo.warn("registerAttribute: custom attributes cannot to use the "+ns+" namespace");
				return this;
			}
			
			BindingUtils__registeredNamespaces = conbo.union(BindingUtils__registeredNamespaces, [ns]);
			
			conbo.setValues(handler, 
			{
				readOnly: !!readOnly,
				raw: !!raw
			});
			
			BindingUtils__customAttrs[name] = handler;
			
			return this;
		},
		
		/**
		 * Register one or more custom attribute handlers 
		 * 
		 * @see			#registerAttribute
		 * @param 		{object}				handlers - Object containing one or more custom attribute handlers
		 * @param 		{boolean}				readOnly - Whether or not the attributes are read-only (default: false)
		 * @returns		{conbo.BindingUtils}	A reference to this object 
		 * 
		 * @example
		 * conbo.BindingUtils.registerAttributes({myFoo:myFooFunction, myBar:myBarFunction});
		 */
		registerAttributes: function(handlers, readOnly)
		{
			for (var a in handlers)
			{
				this.addAttribute(a, handlers[a], readOnly);
			}
			
			return this;
		},
		
		toString: function()
		{
			return 'conbo.BindingUtils';
		},
	});
	
})();
/**
 * Mutation Observer
 * 
 * Simplified mutation observer dispatches ADD and REMOVE events following 
 * changes in the DOM, compatible with IE9+ and all modern browsers
 * 
 * @class		conbo.MutationObserver
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options
 * @fires		conbo.ConboEvent#ADD
 * @fires		conbo.ConboEvent#REMOVE
 */
conbo.MutationObserver = conbo.EventDispatcher.extend(
/** @lends conbo.MutationObserver.prototype */
{
	initialize: function()
	{
		this.bindAll();
	},
	
	observe: function(el)
	{
		this.disconnect();
		
		if (!el) return;
		
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		
		// Modern browsers
		if (MutationObserver)
		{
			var mo = new MutationObserver(this.bind(function(mutations, observer)
			{
				var added = mutations[0].addedNodes;
				var removed = mutations[0].removedNodes;
				
				if (added.length)
				{
					this.__addHandler(conbo.toArray(added));
				}
			
				if (mutations[0].removedNodes.length)
				{
					this.__removeHandler(conbo.toArray(removed));
				}
			}));
			
			mo.observe(el, {childList:true, subtree:true});
			
			this.__mo = mo;
		}
		// IE9
		else
		{
			el.addEventListener('DOMNodeInserted', this.__addHandler);
			el.addEventListener('DOMNodeRemoved', this.__removeHandler);
			
			this.__el = el;
		}
		
		return this;
	},
	
	disconnect: function()
	{
		var mo = this.__mo;
		var el = this.__el;
		
		if (mo) 
		{
			mo.disconnect();
		}
		
		if (el) 
		{
			el.removeEventListener('DOMNodeInserted', this.__addHandler);
			el.removeEventListener('DOMNodeRemoved', this.__removeHandler);
		}
		
		return this;
	},
	
	/**
	 * @private
	 */
	__addHandler: function(event)
	{
		var nodes = conbo.isArray(event)
			? event
			: [event.target];
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD, {nodes:nodes}));
	},
	
	/**
	 * @private
	 */
	__removeHandler: function(event)
	{
		var nodes = conbo.isArray(event)
			? event
			: [event.target];
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE, {nodes:nodes}));
	}
});

(function()
{
	var Promise__removeEventListeners = function()
	{
		this.removeEventListener();
	};
	
	/**
	 * Promise
	 * 
	 * @class		conbo.Promise
	 * @augments	conbo.EventDispatcher
	 * @author 		Neil Rackett
	 * @param 		{object} options - Object containing initialisation options
	 * @fires		conbo.ConboEvent#RESULT
	 * @fires		conbo.ConboEvent#FAULT
	 */
	conbo.Promise = conbo.EventDispatcher.extend(
	/** @lends conbo.Promise.prototype */
	{
		initialize: function(options)
		{
			this.bindAll('dispatchResult', 'dispatchFault')
				.addEventListener('result fault', Promise__removeEventListeners, this, Number.NEGATIVE_INFINITY)
				;
		},
		
		/**
		 * Dispatch a result event using the specified result
		 * @param 	result
		 * @returns {conbo.Promise}
		 */
		dispatchResult: function(result)
		{
			this.dispatchEvent(new conbo.ConboEvent('result', {result:result}));
			return this;
		},
		
		/**
		 * Dispatch a fault event using the specified fault
		 * @param 	result
		 * @returns {conbo.Promise}
		 */
		dispatchFault: function(fault)
		{
			this.dispatchEvent(new conbo.ConboEvent('fault', {fault:fault}));
			return this;
		},
		
		/**
		 * Shorthand method for adding a result and fault event handlers
		 *  
		 * @param	{function}	resultHandler
		 * @param	{function}	faultHandler
		 * @param	{object}	scope
		 * @returns	{conbo.Promise}
		 */
		then: function(resultHandler, faultHandler, scope)
		{
			if (resultHandler) this.addEventListener('result', resultHandler, scope);
			if (faultHandler) this.addEventListener('fault', faultHandler, scope);
			
			return this;
		},
		
		/**
		 * The class name as a string
		 * @returns {String}
		 */
		toString: function()
		{
			return 'conbo.Promise';
		},
		
	});

})();

/**
 * Element Proxy
 * 
 * Wraps an Element to add cross browser or simplified functionality;
 * think of it as "jQuery nano"
 * 
 * @class		conbo.ElementProxy
 * @augments	conbo.EventProxy
 * @author 		Neil Rackett
 * @param 		{Element} el - Element to be proxied
 */
conbo.ElementProxy = conbo.EventProxy.extend(
/** @lends conbo.ElementProxy.prototype */
{
	/**
	 * Returns object containing the value of all attributes on a DOM element
	 * 
	 * @returns		{object}
	 * 
	 * @example
	 * ep.attributes; // results in something like {src:"foo/bar.jpg"}
	 */
	getAttributes: function()
	{
		var el = this.__obj;
		var a = {};
		
		if (el)
		{
			conbo.forEach(el.attributes, function(p)
			{
				a[conbo.toCamelCase(p.name)] = p.value;
			});
		}
		
		return a;
	},
	
	/**
	 * Sets the attributes on a DOM element from an Object, converting camelCase to kebab-case, if needed
	 * 
	 * @param 		{Element}	obj - Object containing the attributes to set
	 * @returns		{conbo.ElementProxy}
	 * 
	 * @example
	 * ep.setAttributes({foo:1, bar:"red"});
	 */
	setAttributes: function(obj)
	{
		var el = this.__obj;
		
		if (el && obj)
		{
			conbo.forEach(obj, function(value, name)
			{
				el.setAttribute(conbo.toKebabCase(name), value);
			});
		}
		
		return this;
	},
	
	/**
	 * @see #getAttributes
	 */
	get attributes()
	{
		return this.getAttributes();
	},
	
	/**
	 * @see #setAttributes
	 */
	set attributes(value)
	{
		return this.setAttributes(value);
	},
	
	/**
	 * Returns object containing the value of all cb-* attributes on a DOM element
	 * 
	 * @returns		{array}
	 * 
	 * @example
	 * ep.cbAttributes.view;
	 */
	get cbAttributes()
	{
		var el = this.__obj;
		var a = {};
		
		if (el)
		{
			conbo.forEach(el.attributes, function(p)
			{
				if (p.name.indexOf('cb-') === 0)
				{
					a[conbo.toCamelCase(p.name.substr(3))] = p.value;
				}
			});
		}
		
		return a;
	},
	
	/**
	 * Add the specified CSS class(es) to the element
	 *  
	 * @param 		{string}	className - One or more CSS class names, separated by spaces
	 * @returns		{conbo.ElementProxy}
	 */
	addClass: function(className)
	{
		var el = this.__obj;
		
		if (el && className)
		{
			// TODO Use classList when it's more widely supported
			var newClasses = className.trim().split(' ');
			var allClasses = (el.className || '').trim().split(' ').concat(newClasses);
			
			el.className = conbo.uniq(conbo.compact(allClasses)).join(' ');
		}
		
		return this;
	},
	
	/**
	 * Remove the specified CSS class(es) from the element
	 * 
	 * @param 		{string|function}		className - One or more CSS class names, separated by spaces, or a function extracts the classes to be removed from the existing className property
	 * @returns		{conbo.ElementProxy}
	 */
	removeClass: function(className)
	{
		var el = this.__obj;
		
		if (el && className)
		{
			if (conbo.isFunction(className))
			{
				className = className(el.className);
			}
			
			// TODO Use classList when it's more widely supported
			
			var allClasses = (el.className || '').trim().split(' ');
			var classesToRemove = className.trim().split(' ');
			
			allClasses = conbo.difference(allClasses, classesToRemove);
			
			el.className = conbo.uniq(conbo.compact(allClasses)).join(' ');
		}
		
		return this;
	},
	
	/**
	 * Is this element using the specified CSS class?
	 *  
	 * @param 		{string}	className - CSS class name
	 * @returns		{boolean}
	 */
	hasClass: function(className)
	{
		var el = this.__obj;
		
		if (el && className)
		{
			// TODO Use classList when it's more widely supported
			var allClasses = (el.className || '').trim().split(' ');
			return allClasses.indexOf(className) != -1;
		}
		
		return false;
	},
	
	/**
	 * Finds the closest parent element matching the specified selector
	 *  
	 * @param 		{string}	selector - Query selector
	 * @returns		{Element}
	 */
	closest: function(selector)
	{
		var el = this.__obj;
		
		if (el)
		{
			var matchesFn;
			
			['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some(function(fn) 
			{
				if (typeof document.body[fn] == 'function') 
				{
					matchesFn = fn;
					return true;
				}
				
				return false;
			});
			
			var parent;
			
			// traverse parents
			while (el)
			{
				parent = el.parentElement;
				
				if (parent && parent[matchesFn](selector)) 
				{
					return parent;
				}
				
				el = parent;
			}
		}
	},
	
});

/**
 * Interface class for data renderers, for example an item renderer for
 * use with the cb-repeat attribute
 * 
 * @augments	conbo
 * @author 		Neil Rackett
 */
conbo.IDataRenderer =
{
	data: undefined,
	index: -1,
	isLast: false,
	list: undefined
};

/**
 * Glimpse
 * 
 * A lightweight element wrapper that has no dependencies, no context and 
 * no data binding, but is able to apply a super-simple template.
 * 
 * It's invisible to View, so it's great for creating components, and you 
 * can bind data to it using the `cb-data` attribute to set the data 
 * property of your Glimpse
 * 
 * @class		conbo.Glimpse
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options
 */
conbo.Glimpse = conbo.EventDispatcher.extend(
/** @lends conbo.Glimpse.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 * @private
	 */
	__construct: function(options)
	{
		this.__setEl(options.el || document.createElement(this.tagName));
		
		if (options.context)
		{
			this.context = options.context;
		}
		
		if (this.template)
		{
			this.el.innerHTML = this.template;
		}
	},
	
	/**
	 * The default `tagName` is `div`
	 */
	get tagName()
	{
		return this.__tagName || 'div';
	},
	
	set tagName(value)
	{
		__definePrivateProperty(this, '__tagName', value);
	},
	
	/**
	 * The class's element
	 */
	get el()
	{
		return this.__el;
	},
	
	toString: function()
	{
		return 'conbo.Glimpse';
	},
	
	/**
	 * Set this View's element
	 * @private
	 */
	__setEl: function(el)
	{
		var attrs = conbo.setValues({}, this.attributes);
		
		if (this.id && !el.id) 
		{
			attrs.id = this.id;
		}
		
		el.className += ' cb-glimpse '+(this.className || '');
		el.cbGlimpse = this;
		
		for (var attr in attrs)
		{
			el.setAttribute(conbo.toKebabCase(attr), attrs[attr]);		
		}		
		
		if (this.style)
		{
			el.style = conbo.setValues(el.style, this.style);
		}
		
		__definePrivateProperty(this, '__el', el);
		
		return this;
	}
	
});

__denumerate(conbo.Glimpse.prototype);

var View__templateCache = {};

/**
 * View
 * 
 * Creating a conbo.View creates its initial element outside of the DOM,
 * if an existing element is not provided...
 * 
 * @class		conbo.View
 * @augments	conbo.Glimpse
 * @author 		Neil Rackett
 * @param 		{object}	options - Object containing optional initialisation options, including 'attributes', 'className', 'data', 'el', 'id', 'tagName', 'template', 'templateUrl'
 * @fires		conbo.ConboEvent#ADD
 * @fires		conbo.ConboEvent#DETACH
 * @fires		conbo.ConboEvent#REMOVE
 * @fires		conbo.ConboEvent#BIND
 * @fires		conbo.ConboEvent#UNBIND
 * @fires		conbo.ConboEvent#TEMPLATE_COMPLETE
 * @fires		conbo.ConboEvent#TEMPLATE_FAULT
 * @fires		conbo.ConboEvent#CREATION_COMPLETE
 */
conbo.View = conbo.Glimpse.extend(
/** @lends 		conbo.View.prototype */
{
	/**
	 * @member		{object}	attributes - Attributes to apply to the View's element
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{string}	className - CSS class name(s) to apply to the View's element
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{object}	data - Arbitrary data Object
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{string}	id - ID to apply to the View's element
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{string}	tagName - The tag name to use for the View's element (if no element specified)
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{string}	template - Template to apply to the View's element
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{string}	templateUrl - Template to load and apply to the View's element
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{boolean}	templateCacheEnabled - Whether or not the contents of templateUrl should be cached on first load for use with future instances of this View class (default: true)
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * @member		{boolean}	autoInitTemplate - Whether or not the template should automatically be loaded and applied, rather than waiting for the user to call initTemplate (default: true)
	 * @memberOf	conbo.View.prototype
	 */
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 * @private
	 */
	__construct: function(options)
	{
		options = conbo.clone(options) || {};
		
		if (options.className)
		{
			options.className += ' '+this.className;
		}
		
		var viewOptions = conbo.union
		(
			[
				'attributes',
				'className', 
				'data', 
				'id', 
				'style', 
				'tagName', 
				'template', 
				'templateUrl',
				'templateCacheEnabled',
				'autoInitTemplate',
			],
			
			// Adds interface properties
			conbo.intersection
			(
				conbo.variables(this, true), 
				conbo.variables(options)
			)
		);
		
		conbo.setValues(this, conbo.pick(options, viewOptions));
		conbo.makeBindable(this, ['currentState']);
		
		this.context = options.context;
		this.__setEl(options.el || document.createElement(this.tagName));
	},

	__postInitialize: function(options)
	{
		__definePrivateProperty(this, '__initialized', true);
		
		this.__content =  this.el.innerHTML;
		
		if (this.autoInitTemplate !== false)
		{
			this.initTemplate();
		}
	},
	
	/**
	 * This View's element
	 */
	get el()
	{
		return this.__el;
	},
	
	/**
	 * Has this view completed its life cycle phases?
	 */
	get initialized()
	{
		return !!this.__initialized;
	},
	
	/**
	 * Returns a reference to the parent View of this View, based on this 
	 * View element's position in the DOM
	 */
	get parent()
	{
		if (this.initialized)
		{
			return this.__getParent('.cb-view');
		}
	},
	
	/**
	 * Returns a reference to the parent Application of this View, based on
	 * this View element's position in the DOM
	 */
	get parentApp()
	{
		if (this.initialized)
		{
			return this.__getParent('.cb-app');
		}
	},
	
	/**
	 * Does this view have a template?
	 */
	get hasTemplate()
	{
		return !!(this.template || this.templateUrl);
	},
	
	/**
	 * The element into which HTML content should be placed; this is either the 
	 * first DOM element with a `cb-content` or the root element of this view
	 */
	get content()
	{
		return this.querySelector('[cb-content]');
	},
	
	/**
	 * Does this View support HTML content?
	 */
	get hasContent()
	{
		return !!this.content;
	},
	
	/**
	 * A View's body is the element to which content should be added:
	 * the View's content, if it exists, or the View's main element, if it doesn't
	 */
	get body()
	{
		return this.content || this.el;
	},
	
	/**
	 * The context that will automatically be applied to children
	 * when binding or appending Views inside of this View
	 */
	get subcontext()
	{
		return this.__subcontext || this.context;
	},
	
	set subcontext(value)
	{
		this.__subcontext = value;
	},
	
	/**
	 * Uses querySelector to find the first matching element contained within the
	 * current View's element, but not within the elements of child Views
	 * 
	 * @param	{string}	selector - The selector to use
	 * @param	{boolean}	deep - Include elements in child Views?
	 * @returns	{Element}	The first matching element
	 */
	querySelector: function(selector, deep)
	{
		return this.querySelectorAll(selector, deep)[0];
	},
	
	/**
	 * Uses querySelectorAll to find all matching elements contained within the
	 * current View's element, but not within the elements of child Views
	 * 
	 * @param	{string}	selector - The selector to use
	 * @param	{boolean}	deep - Include elements in child Views?
	 * @returns	{array}		All elements matching the selector
	 */
	querySelectorAll: function(selector, deep)
	{
		if (this.el)
		{
			var results = conbo.toArray(this.el.querySelectorAll(selector));
			
			if (!deep)
			{
				var views = this.el.querySelectorAll('.cb-view, [cb-view], [cb-app]');
				
				// Remove elements in child Views
				conbo.forEach(views, function(el)
				{
					var els = conbo.toArray(el.querySelectorAll(selector));
					results = conbo.difference(results, els.concat(el));
				});
			}
			
			return results;
		}
		
		return [];
	},
	
	/**
	 * Take the View's element element out of the DOM
	 */
	detach: function() 
	{
		var el = this.el;
		
		if (el.parentNode)
		{
			el.parentNode.removeChild(el);		
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.DETACH));
		}
		
		return this;
	},
	
	/**
	 * Remove and destroy this View by taking the element out of the DOM, 
	 * unbinding it, removing all event listeners and removing the View from 
	 * its Context.
	 * 
	 * You should use a REMOVE event handler to destroy any event listeners,
	 * timers or other code you may have added.
	 */
	remove: function()
	{
		this.unbindView()
			.removeEventListener()
			;
		
		if (this.data)
		{
			this.data = undefined;
		}
		
		if (this.context)
		{
			this.context
				.uninjectSingletons(this)
				.removeEventListener(undefined, undefined, this)
				;
			
			this.context = undefined;
		}
		
		this.detach()
			.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE))
			;
		
		return this;
	},
	
	/**
	 * Append this DOM element from one View class instance this class 
	 * instances DOM element
	 * 
	 * @param 		view
	 * @returns 	this
	 */
	appendView: function(view)
	{
		if (arguments.length > 1)
		{
			conbo.forEach(arguments, function(view, index, list) 
			{
				this.appendView(view);
			},
			this);
			
			return this;
		}
		
		if (!(view instanceof conbo.View))
		{
			throw new Error('Parameter must be instance of conbo.View class');
		}
	
		this.body.appendChild(view.el);
		
		return this;
	},
	
	/**
	 * Prepend this DOM element from one View class instance this class 
	 * instances DOM element
	 * 
	 * @param 		view
	 * @returns 	this
	 */
	prependView: function(view)
	{
		if (arguments.length > 1)
		{
			conbo.forEach(arguments, function(view, index, list) 
			{
				this.prependView(view);
			}, 
			this);
			
			return this;
		}
		
		if (!(view instanceof conbo.View))
		{
			throw new Error('Parameter must be instance of conbo.View class');
		}
		
		var firstChild = this.body.firstChild;
		
		firstChild
			? this.body.insertBefore(view.el, firstChild)
			: this.appendView(view);
		
		return this;
	},
	
	/**
	 * Automatically bind elements to properties of this View
	 * 
	 * @example	<div cb-bind="property|parseMethod" cb-hide="property">Hello!</div> 
	 * @returns	this
	 */
	bindView: function()
	{
		conbo.BindingUtils.bindView(this);
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.BIND));
		return this;
	},
	
	/**
	 * Unbind elements from class properties
	 * @returns	this
	 */
	unbindView: function() 
	{
		conbo.BindingUtils.unbindView(this);
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.UNBIND));
		return this;
	},
	
	/**
	 * Initialize the View's template, either by loading the templateUrl
	 * or using the contents of the template property, if either exist
	 */
	initTemplate: function()
	{
		var template = this.template;
		
		if (!!this.templateUrl)
		{
			this.loadTemplate();
		}
		else
		{
			if (conbo.isFunction(template))
			{
				template = template(this);
			}
			
			if (conbo.isString(template))
			{
				this.el.innerHTML = template;
			}
			
			this.__initView();
		}
		
		return this;
	},
	
	/**
	 * Load HTML template and use it to populate this View's element
	 * 
	 * @param 	{String}	url			A string containing the URL to which the request is sent
	 */
	loadTemplate: function(url)
	{
		url || (url = this.templateUrl);
		
		var el = this.body;
		
		this.unbindView();
		
		if (this.templateCacheEnabled !== false && View__templateCache[url])
		{
			el.innerHTML = View__templateCache[url];
			this.__initView();
			
			return this;
		}
		
		var resultHandler = function(event)
		{
			var result = event.result;
			
			if (this.templateCacheEnabled !== false)
			{
				View__templateCache[url] = result;
			}
			
			el.innerHTML = result;
			this.__initView();
		};
		
		var faultHandler = function(event)
		{
			el.innerHTML = '';
			
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.TEMPLATE_FAULT));
			this.__initView();
		};
		
		conbo
			.httpRequest({url:url, dataType:'text'})
			.then(resultHandler, faultHandler, this)
			;
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.View';
	},

	
	/* INTERNAL */
	
	/**
	 * Set this View's element
	 * @private
	 */
	__setEl: function(el)
	{
		if (!conbo.isElement(el))
		{
			conbo.error('Invalid element passed to View');
			return;
		}
		
		var attrs = conbo.setValues({}, this.attributes);
		
		if (this.id && !el.id) 
		{
			attrs.id = this.id;
		}
		
		if (this.style) 
		{
			conbo.setValues(el.style, this.style);
		}
		
		var ep = __ep(el);
		
		el.cbView = this;
		
		ep.addClass('cb-view')
			.addClass(this.className)
			.setAttributes(attrs)
			;
		
		__definePrivateProperty(this, '__el', el);
		
		return this;
	},
	
	/**
	 * Populate and render the View's HTML content
	 * @private
	 */
	__initView: function()
	{
		if (this.hasTemplate && this.hasContent)
		{
			this.content.innerHTML = this.__content;
		}
		
		delete this.__content;
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.TEMPLATE_COMPLETE))
			.bindView()
			;
		
		conbo.defer(function()
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CREATION_COMPLETE));
		}, this);
		
		return this;
	},
	
	__getParent: function(selector) 
	{
		var el = __ep(this.el).closest(selector);
	    if (el) return el.cbView;
	},
	
});

__denumerate(conbo.View.prototype);

/**
 * ItemRenderer
 * 
 * A conbo.View class that implements the conbo.IDataRenderer interface
 * 
 * @class		conbo.ItemRenderer
 * @augments	conbo.View
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options (see View)
 */
conbo.ItemRenderer = conbo.View.extend().implement(conbo.IDataRenderer);
/**
 * Application
 * 
 * Base application class for client-side applications
 * 
 * @class		conbo.Application
 * @augments	conbo.View
 * @author		Neil Rackett
 * @param 		{object} options - Object containing optional initialisation options, see View
 * @fires		conbo.ConboEvent#ADD
 * @fires		conbo.ConboEvent#DETACH
 * @fires		conbo.ConboEvent#REMOVE
 * @fires		conbo.ConboEvent#BIND
 * @fires		conbo.ConboEvent#UNBIND
 * @fires		conbo.ConboEvent#TEMPLATE_COMPLETE
 * @fires		conbo.ConboEvent#TEMPLATE_FAULT
 * @fires		conbo.ConboEvent#CREATION_COMPLETE
 */
conbo.Application = conbo.View.extend(
/** @lends conbo.Application.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 * @private
	 */
	__construct: function(options)
	{
		options = conbo.clone(options) || {};
		
		if (!(this.namespace instanceof conbo.Namespace))
		{
			throw new Error('Application namespace must be an instance of conbo.Namespace');
		}
		
		options.app = this;
		options.context = new this.contextClass(options);
		options.el || (options.el = this.__findAppElement());
		
		conbo.View.prototype.__construct.call(this, options);
	},
	
	/**
	 * Default context class to use
	 * You'll normally want to override this with your own
	 */
	get contextClass() 
	{
		return this.__contextClass || conbo.Context;
	},
	
	set contextClass(value)
	{
		this.__contextClass = value;
	},
	
	/**
	 * If true, the application will automatically apply Glimpse and View 
	 * classes to elements when they're added to the DOM 
	 */
	get observeEnabled()
	{
		return !!this.__mo;
	},
	
	set observeEnabled(value)
	{
		if (value == this.observeEnabled) return;
		
		var mo;
		
		if (value)
		{
			mo = new conbo.MutationObserver();
			mo.observe(this.el);
			
			mo.addEventListener(conbo.ConboEvent.ADD, function(event)
			{
				conbo.BindingUtils
					.applyViews(this, this.namespace)
					.applyViews(this, this.namespace, 'glimpse')
					;
			}, 
			this);
			
			this.__mo = mo;
		}
		else if (this.__mo)
		{
			mo = this.__mo;
			mo.removeEventListener();
			mo.disconnect();
			
			delete this.__mo;
		}
		
		this.dispatchChange('observeEnabled');
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.Application';
	},
	
	__setEl: function(element)
	{
		conbo.View.prototype.__setEl.call(this, element);
		__ep(this.el).addClass('cb-app');
		return this;
	},
	
	/**
	 * Find element with matching cb-app attribute, if it exists
	 * @private
	 */
	__findAppElement: function()
	{
		var $apps = $('[cb-app]');
		
		if (!$apps.length) return undefined;
		
		if (!this.namespace)
		{
			if ($apps.length)
			{
				conbo.warn('Application namespace not specified: unable to bind to cb-app element');
			}
			
			return undefined;
		}
		
		var appName;
		
		for (var a in this.namespace)
		{
			if (conbo.isClass(this.namespace[a])
				&& this instanceof this.namespace[a])
			{
				appName = a;
				break;
			}
		}
		
		if (!appName) return undefined;
		
		var selector = '[cb-app="'+appName+'"]';
		var el = $(selector)[0];
		
		return el || undefined;
	},
	
});

__denumerate(conbo.Application.prototype);

/**
 * conbo.Command
 * 
 * Base class for commands to be registered in your Context 
 * using mapCommand(...)
 * 
 * @class		conbo.Command
 * @augments	conbo.EventDispatcher
 * @author		Neil Rackett
 * @param 		{object} options - Object containing optional initialisation options, including 'context' (Context)
 */
conbo.Command = conbo.EventDispatcher.extend(
/** @lends conbo.Command.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	__construct: function(options)
	{
		this.context = options.context;
		this.event = options.event || {};
	},
	
	/**
	 * Initialiser included for consistency, but should probably never be used
	 */
	initialize: function() {},
	
	/**
	 * Execute: should be overridden
	 * 
	 * When a Command is called in response to an event registered with the
	 * Context, the class is instantiated, this method is called then the 
	 * class instance is destroyed
	 */
	execute: function() {},
	
	toString: function()
	{
		return 'conbo.Command';
	}
	
}).implement(conbo.IInjectable);
__denumerate(conbo.Command.prototype);

/**
 * HTTP Request
 * 
 * Sends data to and/or loads data from a URL; options object is roughly 
 * analogous to the jQuery.ajax() settings object, but also accepts additional
 * `resultClass` and `makeObjectsBindable` parameters
 * 
 * @see			http://api.jquery.com/jquery.ajax/
 * @memberof	conbo
 * @param 		{object} options - Object containing URL and other settings for the HTTP request
 * @returns		{conbo.Promise}
 */
conbo.httpRequest = function(options)
{
	if (!options)
	{
		throw new Error('httpRequest called without any options');
	}
	
	var promise = new conbo.Promise();
	var xhr = new window.XMLHttpRequest();
	var aborted;
	var url = options.url;
	var method = (options.method || options.type || "GET").toUpperCase();
	var data = options.data || options.body;
	var headers = options.headers || {};
	var timeoutTimer;
	var contentType = conbo.getValue(headers, "Content-Type", false) || options.contentType || conbo.CONTENT_TYPE_JSON;
	var dataType = options.dataType || 'json';
	var decodeFunction = options.decodeFunction || options.dataFilter;
	
	var getXml = function()
	{
		if (xhr.responseType === "document") 
		{
			return xhr.responseXML;
		}
		
		var firefoxBugTakenEffect = xhr.responseXML && xhr.responseXML.documentElement.nodeName === "parsererror";
		
		if (xhr.responseType === "" && !firefoxBugTakenEffect) 
		{
			return xhr.responseXML;
		}
	
		return null;
	};
	
	var getResult = function() 
	{
		// TODO Handle Chrome with requestType=blob throwing errors when testing access to responseText
		var result = xhr.response || xhr.responseText || getXml(xhr);
		
		if (conbo.isFunction(decodeFunction))
		{
			result = decodeFunction(result);
		}
		else
		{
			switch (dataType)
			{
				case 'script':
				{
					(function() { eval(result); }).call(options.scope || window);
					break;
				}
				
				case 'json':
				{
					try { result = JSON.parse(result); }
					catch (e) { result = undefined; }
					
					break;
				}
			}
		}
		
		var resultClass = options.resultClass;
		
		if (!resultClass && options.makeObjectsBindable)
		{
			switch (true)
			{
				case conbo.isArray(result):
					resultClass = conbo.List;
					break;
				
				case conbo.isObject(result):
					resultClass = conbo.Hash;
					break;
			}
		}
		
		if (resultClass)
		{
			result = new resultClass({source:result});
		}
		
		return result;
	};

	var getResponseHeaders = function()
	{
		var responseHeaders = xhr.getAllResponseHeaders();
		var newValue = {};
		
		responseHeaders.split('\r\n').forEach(function(header)
		{
			var splitIndex = header.indexOf(':');
			var propName = header.substr(0,splitIndex).trim();
			
			newValue[propName] = header.substr(splitIndex+1).trim();
		});
		
		return newValue;
	};
	
	var errorHandler = function() 
	{
		clearTimeout(timeoutTimer);
		
		var response = 
		{
			fault: getResult(),
			responseHeaders: getResponseHeaders(),
			status: xhr.status,
			method: method,
			url: url,
			xhr: xhr
		};
		
		promise.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.FAULT, response));
	};
	
	// will load the data & process the response in a special response object
	var loadHandler = function() 
	{
		if (aborted) return;
		
		clearTimeout(timeoutTimer);
		
		var status = (xhr.status === 1223 ? 204 : xhr.status);
		
		if (status === 0 || status >= 400)
		{
			errorHandler();
			return;
		}
		
		var response = 
		{
			result: getResult(),
			responseHeaders: getResponseHeaders(),
			status: status,
			method: method,
			url: url,
			xhr: xhr
		};
		
		promise.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.RESULT, response));
	}
	
	var readyStateChangeHandler = function() 
	{
		if (xhr.readyState === 4) 
		{
			conbo.defer(loadHandler);
		}
	};
	
	if (method !== "GET" && method !== "HEAD") 
	{
		conbo.getValue(headers, "Content-Type", false) || (headers["Content-Type"] = contentType);
		
		if (contentType == conbo.CONTENT_TYPE_JSON && conbo.isObject(data))
		{
			data = JSON.stringify(data);
		}
	}
	else if (method === 'GET' && conbo.isObject(data))
	{
		var query = conbo.toQueryString(data);
		if (query) url += '?'+query;
		data = undefined;
	}
	
	'onload' in xhr
		? xhr.onload = loadHandler // XHR2
		: xhr.onreadystatechange = readyStateChangeHandler; // XHR1 (should never be needed)
	
	xhr.onerror = errorHandler;
	xhr.onprogress = function() {}; // IE9 must have unique onprogress function
	xhr.onabort = function() { aborted = true; };
	xhr.ontimeout = errorHandler;
	
	xhr.open(method, url, true, options.username, options.password);
	xhr.withCredentials = !!options.withCredentials;
	
	// not setting timeout on using XHR because of old webkits not handling that correctly
	// both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
	if (options.timeout > 0) 
	{
		timeoutTimer = setTimeout(function()
		{
			if (aborted) return;
			aborted = true; // IE9 may still call readystatechange
			xhr.abort("timeout");
			errorHandler();
		}, 
		options.timeout);
	}
	
	for (var key in headers)
	{
		if (headers.hasOwnProperty(key))
		{
			xhr.setRequestHeader(key, headers[key]);
		}
	}

	if ("responseType" in options) 
	{
		xhr.responseType = options.responseType;
	}

	if (typeof options.beforeSend === "function") 
	{
		options.beforeSend(xhr);
	}
	
	// Microsoft Edge browser sends "undefined" when send is called with undefined value.
	// XMLHttpRequest spec says to pass null as data to indicate no data
	// See https://github.com/naugtur/xhr/issues/100.
	xhr.send(data || null);
	
	return promise;
};

/**
 * HTTP Service
 * 
 * Base class for HTTP data services, with default configuration designed 
 * for use with JSON REST APIs.
 * 
 * For XML data sources, you will need to override decodeFunction to parse 
 * response data, change the contentType and implement encodeFunction if 
 * you're using RPC.  
 * 
 * @class		conbo.HttpService
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing optional initialisation options, including 'rootUrl', 'contentType', 'dataType', 'headers', 'encodeFunction', 'decodeFunction', 'resultClass','makeObjectsBindable'
 * @fires		conbo.ConboEvent#RESULT
 * @fires		conbo.ConboEvent#FAULT
 */
conbo.HttpService = conbo.EventDispatcher.extend(
/** @lends conbo.HttpService.prototype */
{
	__construct: function(options)
	{
		options = conbo.setDefaults(options, 
		{
			contentType: conbo.CONTENT_TYPE_JSON
		});
		
		conbo.setValues(this, conbo.setDefaults(conbo.pick(options, 
		    'rootUrl', 
		    'contentType', 
		    'dataType', 
		    'headers', 
		    'encodeFunction', 
		    'decodeFunction', 
		    'resultClass',
		    'makeObjectsBindable'
		), {
			dataType: 'json'
		}));
		
		conbo.EventDispatcher.prototype.__construct.apply(this, arguments);
	},
	
	/**
	 * The root URL of the web service
	 */
	get rootUrl()
	{
		return this._rootUrl || '';
	},
	
	set rootUrl(value)
	{
		value = String(value);
		
		if (value && value.slice(-1) != '/')
		{
			value += '/';
		}
		
		this._rootUrl = value;
	},
	
	/**
	 * Call a method of the web service
	 * 
	 * @param	{String}	command - The name of the command
	 * @param	{Object}	data - Object containing the data to send to the web service
	 * @param	{String}	method - GET, POST, etc (default: GET)
	 * @param	{Class}		resultClass - Optional
	 * @returns	{conbo.Promise}
	 */
	call: function(command, data, method, resultClass)
	{
		data = conbo.clone(data || {});
		command = this.parseUrl(command, data);
		data = this.encodeFunction(data, method);
		
		var promise = conbo.httpRequest
		({
			data: data,
			type: method || 'GET',
			headers: this.headers,
			url: this.rootUrl+command,
			contentType: this.contentType || conbo.CONTENT_TYPE_JSON,
			dataType: this.dataType,
			dataFilter: this.decodeFunction,
			resultClass: resultClass || this.resultClass, 
			makeObjectsBindable: this.makeObjectsBindable
		});
		
		promise.then(this.dispatchEvent, this.dispatchEvent, this);
		
		return promise;
	},
	
	/**
	 * Add one or more remote commands as methods of this class instance
	 * @param	{String}	command - The name of the command
	 * @param	{String}	method - GET, POST, etc (default: GET)
	 * @param	{Class}		resultClass - Optional
	 */
	addCommand: function(command, method, resultClass)
	{
		if (conbo.isObject(command))
		{
			method = command.method;
			resultClass = command.resultClass;
			command = command.command;
		}
		
		this[conbo.toCamelCase(command)] = function(data)
		{
			return this.call(command, data, method, resultClass);
		};
		
		return this;
	},
	
	/**
	 * Add multiple commands as methods of this class instance
	 * @param	{Array}		commands
	 */
	addCommands: function(commands)
	{
		if (!conbo.isArray(commands))
		{
			return this;
		}
		
		commands.forEach(function(command)
		{
			this.addCommand(command);
		}, 
		this);
		
		return this;
	},
	
	/**
	 * Method that encodes data to be sent to the API
	 * 
	 * @param	{object}	data - Object containing the data to be sent to the API
	 * @param	{String}	method - GET, POST, etc (default: GET)
	 */
	encodeFunction: function(data, method)
	{
		return data;
	},
	
	/**
	 * Splice data into URL and remove spliced properties from data object
	 */
	parseUrl: function(url, data)
	{
		var parsedUrl = url,
			matches = parsedUrl.match(/:\b\w+\b/g);
		
		if (!!matches)
		{
			matches.forEach(function(key) 
			{
				key = key.substr(1);
				
				if (!(key in data))
				{
					throw new Error('Property "'+key+'" required but not found in data');
				}
			});
		}
			
		conbo.keys(data).forEach(function(key)
		{
			var regExp = new RegExp(':\\b'+key+'\\b', 'g');
			
			if (regExp.test(parsedUrl))
			{
				parsedUrl = parsedUrl.replace(regExp, data[key]);
				delete data[key];
			}
		});
		
		return parsedUrl;
	},
	
	toString: function()
	{
		return 'conbo.HttpService';
	}
	
})
.implement(conbo.IInjectable);

/**
 * ISyncable pseudo-interface
 * 
 * @augments	conbo
 * @author 		Neil Rackett
 */
conbo.ISyncable =
{
	load: conbo.notImplemented,
	save: conbo.notImplemented,
	destroy: conbo.notImplemented
};

/**
 * Remote Hash
 * Used for syncing remote data with a local Hash
 * 
 * @class		conbo.RemoteHash
 * @augments	conbo.Hash
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options, see Hash
 * @fires		conbo.ConboEvent#CHANGE
 * @fires		conbo.ConboEvent#RESULT
 * @fires		conbo.ConboEvent#FAULT
 */
conbo.RemoteHash = conbo.Hash.extend(
/** @lends conbo.RemoteHash.prototype */
{
	/**
	 * Constructor
	 * @param {Object}	options		Object containing `source` (initial properties), `rootUrl` and `command` parameters
	 */
	__construct: function(options)
	{
		options = conbo.defineDefaults(options, this.options);
		
		if (!!options.context) this.context = options.context;
		this.preinitialize(options);
		
		this._httpService = new conbo.HttpService(options);
		this._command = options.command;
		
		var resultHandler = function(event)
		{
			conbo.makeBindable(this, conbo.variables(event.result));
			conbo.setValues(this, event.result);
			
			this.dispatchEvent(event);
		};
		
		this._httpService
			.addEventListener(conbo.ConboEvent.RESULT, resultHandler, this)
			.addEventListener(conbo.ConboEvent.FAULT, this.dispatchEvent, this);
		
		__denumerate(this);
		
		conbo.Hash.prototype.__construct.apply(this, arguments);
	},
	
	load: function(data)
	{
		data = arguments.length ? data : this.toJSON();
		this._httpService.call(this._command, data, 'GET');
		return this;
	},
	
	save: function()
	{
		this._httpService.call(this._command, this.toJSON(), 'POST');
		return this;
	},
	
	destroy: function()
	{
		this._httpService.call(this._command, this.toJSON(), 'DELETE');
		return this;
	},
	
	toString: function()
	{
		return 'conbo.RemoteHash';
	}
	
}).implement(conbo.ISyncable, conbo.IPreinitialize);

__denumerate(conbo.HttpService.prototype);

/**
 * Remote List
 * Used for syncing remote array data with a local List
 * 
 * @class		conbo.RemoteList
 * @augments	conbo.List
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options, including HttpService options
 * @fires		conbo.ConboEvent#CHANGE
 * @fires		conbo.ConboEvent#ADD
 * @fires		conbo.ConboEvent#REMOVE
 * @fires		conbo.ConboEvent#RESULT
 * @fires		conbo.ConboEvent#FAULT
 */
conbo.RemoteList = conbo.List.extend(
/** @lends conbo.RemoteList.prototype */
{
	//itemClass: conbo.RemoteHash,
	
	/**
	 * Constructor
	 * @param {Object}	options		Object containing 'source' (Array, optional), 'rootUrl', 'command' and (optionally) 'itemClass' parameters
	 */
	__construct: function(options)
	{
		options = conbo.defineDefaults(options, this.options);
		
		this.context = options.context;
		
		this._httpService = new conbo.HttpService(options);
		this._command = options.command;
		
		var resultHandler = function(event)
		{
			this.source = event.result;
			this.dispatchEvent(event);
		};
		
		this._httpService
			.addEventListener(conbo.ConboEvent.RESULT, resultHandler, this)
			.addEventListener(conbo.ConboEvent.FAULT, this.dispatchEvent, this)
			;
		
		__denumerate(this);
		
		conbo.List.prototype.__construct.apply(this, arguments);
	},
	
	load: function()
	{
		this._httpService.call(this._command, this.toJSON(), 'GET');
		return this;
	},
	
	save: function()
	{
		this._httpService.call(this._command, this.toJSON(), 'POST');
		return this;
	},
	
	destroy: function()
	{
		// TODO
	},
	
	toString: function()
	{
		return 'conbo.RemoteList';
	}
	
}).implement(conbo.ISyncable, conbo.IPreinitialize);

__denumerate(conbo.HttpService.prototype);

/**
 * Default history manager used by Router, implemented using onhashchange 
 * event and hash-bang URL fragments
 * 
 * @author 		Neil Rackett
 * @fires		conbo.ConboEvent#CHANGE
 * @fires		conbo.ConboEvent#FAULT
 */
conbo.History = conbo.EventDispatcher.extend(
/** @lends conbo.History.prototype */
{
	__construct: function(options)
	{
		this.handlers = [];
		this.location = window.location;
		this.history = window.history;
		
		this.bindAll('__checkUrl');
	},
	
	start: function()
	{
		window.addEventListener('hashchange', this.__checkUrl);
		
		this.fragment = this.__getFragment();
		this.__loadUrl();
		
		return this;
	},
	
	stop: function()
	{
		window.removeEventListener('hashchange', this.__checkUrl);
		return this;
	},
	
	addRoute: function(route, callback)
	{
		this.handlers.unshift({route:route, callback:callback});
		return this;
	},
	
	/**
	 * The current path
	 * @returns	{string}
	 */
	getPath: function()
	{
		// Workaround for bug in Firefox where location.hash will always be decoded
		var match = this.location.href.match(/#!?(.*)$/);
		return match ? match[1] : '';
	},
	
	/**
	 * Set the current path
	 * 
	 * @param	{string}	path - The path
	 * @param	{}
	 */
	setPath: function(fragment, options)
	{
		options || (options = {});
		fragment = this.__getFragment(fragment);
		
		if (this.fragment === fragment) 
		{
			return;
		}
		
		var location = this.location;
		
		this.fragment = fragment;
		
		if (options.replace)
		{
			var href = location.href.replace(/(javascript:|#).*$/, '');
			location.replace(href + '#!/' + fragment);
		}
		else
		{
			location.hash = '#!/' + fragment;
		}
		
		if (options.trigger) 
		{
			this.__loadUrl(fragment);
		}
		
		return this;
	},
	
	/**
	 * @private
	 */
	__checkUrl: function(event)
	{
		var changed = this.__getFragment() !== this.fragment;
		
		if (changed)
		{
			this.__loadUrl();
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE));
		}
		
		return !changed;
	},
	
	/**
	 * Get the cross-browser normalized URL fragment, either from the URL, the hash, or the override.
	 * @private
	 */
	__getFragment: function(fragment)
	{
		return (fragment || this.getPath()).replace(/^#!|^[#\/]|\s+$/g, '');
	},
	
	/**
	 * Attempt to load the current URL fragment
	 * @private
	 * @returns 	{boolean}	Whether or not the path is a valid route
	 */
	__loadUrl: function(fragmentOverride)
	{
		var fragment = this.fragment = this.__getFragment(fragmentOverride);
		
		var matched = conbo.some(this.handlers, function(handler)
		{
			if (handler.route.test(fragment))
			{
				handler.callback(fragment);
				return true;
			}
		});
		
		if (!matched)
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.FAULT));
		}
		
		return matched;
	},
	
});

/**
 * Router
 * 
 * Routers map faux-URLs to actions, and fire events when routes are
 * matched. Creating a new one sets its `routes` hash, if not set statically.
 * 
 * Derived from the Backbone.js class of the same name
 * 
 * @class		conbo.Router
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options
 * @fires		conbo.ConboEvent#CHANGE
 * @fires		conbo.ConboEvent#FAULT
 * @fires		conbo.ConboEvent#ROUTE
 * @fires		conbo.ConboEvent#START
 * @fires		conbo.ConboEvent#STOP
 */
conbo.Router = conbo.EventDispatcher.extend(
/** @lends conbo.Router.prototype */
{
	/**
	 * @private
	 */
	__construct: function(options) 
	{
		if (options.routes) 
		{
			this.routes = options.routes;
		}
		
		this.historyClass = conbo.History;
		this.context = options.context;
	},
	
	/**
	 * Start the router
	 */
	start: function()
	{
		if (!this.__history)
		{
			this.__history = new this.historyClass();
			this.__bindRoutes();
			
			this.__history
				.addEventListener(conbo.ConboEvent.FAULT, this.dispatchEvent, this)
				.addEventListener(conbo.ConboEvent.CHANGE, this.dispatchEvent, this)
				.start()
				;
			
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.START));
		}
		
		return this;
	},
	
	/**
	 * Stop the router
	 */
	stop: function()
	{
		if (this.__history)
		{
			this.__history
				.removeEventListener()
				.stop()
				;
			
			delete this.__history;
			
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.STOP));
		}
		
		return this;
	},
	
	/**
	 * Adds a named route
	 * 
	 * @example
	 * 		this.addRoute('search/:query/p:num', 'search', function(query, num) {
	 * 			 ...
	 * 		});
	 */ 
	addRoute: function(route, name, callback) 
	{
		if (!conbo.isRegExp(route)) 
		{
			route = this.__routeToRegExp(route);
		}
		
		if (!callback) 
		{
			callback = this[name];
		}
		
		if (conbo.isFunction(name)) 
		{
			callback = name;
			name = '';
		}
		
		if (!callback) 
		{
			callback = this[name];
		}
		
		this.__history.addRoute(route, this.bind(function(path)
		{
			var args = this.__extractParameters(route, path);
			
			callback && callback.apply(this, args);
			
			var options = 
			{
				router:		this,
				route:		route,
				name:		name,
				parameters:	args,
				path:		path
			};
			
			this.dispatchEvent(new conbo.ConboEvent('route:'+name, options));
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ROUTE, options));
		}));
		
		return this;
	},
	
	/**
	 * Sets the current path, optionally replacing the current path or silently 
	 * without triggering a route event
	 * 
	 * @param	{string}	path - The path to navigate to
	 * @param	{object}	options - Object containing options: trigger (default: true) and replace (default: false)
	 */
	setPath: function(path, options) 
	{
		options = conbo.setDefaults({}, options, {trigger:true});
		
		this.__history.setPath(path, options);
		return this;
	},
	
	/**
	 * Get or set the current path using the default options
	 * @type	{string}
	 */
	get path()
	{
		return this.__history ? this.__history.getPath() : '';
	},
	
	set path(value)
	{
		return this.setPath(path, options);
	},
	
	toString: function()
	{
		return 'conbo.Router';
	},
	
	/**
	 * Bind all defined routes. We have to reverse the
	 * order of the routes here to support behavior where the most general
	 * routes can be defined at the bottom of the route map.
	 * 
	 * @private
	 */
	__bindRoutes: function() 
	{
		if (!this.routes) return;
		
		var route;
		var routes = conbo.keys(this.routes);
		
		while ((route = routes.pop()) != null)
		{
			this.addRoute(route, this.routes[route]);
		}
	},
	
	/**
	 * Convert a route string into a regular expression, suitable for matching
	 * against the current location hash.
	 * 
	 * @private
	 */
	__routeToRegExp: function(route) 
	{
		var rootStripper 	= /^\/+|\/+$/g;
		var optionalParam 	= /\((.*?)\)/g;
		var namedParam		= /(\(\?)?:\w+/g;
		var splatParam		= /\*\w+/g;
		var escapeRegExp	= /[\-{}\[\]+?.,\\\^$|#\s]/g;
		
		route = route
			.replace(rootStripper, '')
			.replace(escapeRegExp, '\\$&')
			.replace(optionalParam, '(?:$1)?')
			.replace(namedParam, function(match, optional)
			{
				return optional ? match : '([^\/]+)';
			})
			.replace(splatParam, '(.*?)');
		
		return new RegExp('^' + route + '$');
	},

	/**
	 * Given a route, and a URL fragment that it matches, return the array of
	 * extracted decoded parameters. Empty or unmatched parameters will be
	 * treated as `null` to normalize cross-browser behavior.
	 * 
	 * @private
	 */
	__extractParameters: function(route, fragment) 
	{
		var params = route.exec(fragment).slice(1);
		
		return conbo.map(params, function(param) 
		{
			if (param)
			{
				// Fix for Chrome's invalid URI error
				try { return decodeURIComponent(param); }
				catch (e) { return unescape(param); }
			}
			
			return null;
		});
	}
	
}).implement(conbo.IInjectable);

__denumerate(conbo.Router.prototype);


	conbo.ready(function()
	{
		conbo.info('%c'+conbo.toString(), 'font-weight:bold');
	});

	return conbo;
});
