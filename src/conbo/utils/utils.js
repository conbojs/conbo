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
			funcs = conbo.filter(conbo.getFunctionNames(obj), function(func)
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
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain
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
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain
	 * @param		{boolean}	includeAccessors - Whether or not to include accessors that contain functions (default: false)
	 * @returns		{array}
	 */
	conbo.functions = function(obj, deep, includeAccessors)
	{
		return conbo.filter(conbo.keys(obj, deep).sort(), function(name) 
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
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain
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
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain
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
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain
	 * @returns		{array}
	 */
	conbo.getPropertyNames = function(obj, deep)
	{
		if (!obj) return [];
		
		if (deep)
		{
			var names = [];
			do { names = names.concat(conbo.difference(names, Object.getOwnPropertyNames(obj))); }
			while (obj = Object.getPrototypeOf(obj));
			return names;
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
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain
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
	 * @param		{boolean}	deep - Retrieve keys from further up the prototype chain
	 * @returns		{array}
	 */
	conbo.getVariableNames = function(obj, deep)
	{
		return conbo.difference(conbo.getPropertyNames(obj, deep), conbo.getFunctionNames(obj));
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
	 * Retrieve the values of an object's properties, optionally including
	 * values further up the prototype chain
	 * 
	 * @memberof	conbo
	 * @param		{object}	obj - Object to get values from
	 * @param		{boolean}	deep - Whether or not to include prototype keys 
	 */
	conbo.values = function(obj, deep) 
	{
		var keys = deep ? conbo.keys(obj) : conbo.getPropertyNames(obj);
		var length = keys.length;
		var values = new Array(length);
		
		for (var i = 0; i < length; i++)
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
	 * @param 		{String}	url		The JavaScript file's URL
	 * @returns		conbo.Promise
	 */
	conbo.loadScript = function(url)
	{
		return conbo.httpRequest
		({
			url: url,
			dataType: "script"
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
		propNames || (propNames = conbo.getVariableNames(obj));
		
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
		propNames = conbo.uniq((propNames || []).concat(conbo.getVariableNames(obj)));
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
	 * @param	{object}	obj	- The Object to encode
	 * @returns	{string}	The URL encoded string 
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
	 * @param	{object}	obj - The object containing the property
	 * @param	{string}	propName - The property name
	 * @param	{boolean}	caseSensitive - Whether to search for a case-insensitive match (default: true)
	 * @returns	{*}			The value of the specified property
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
	 * conbo.log('Blah!');
	 * conbo.warn('Warning!');
	 * conbo.info('Information!'); 
	 * conbo.error('Error!');
	 * // Result: Nothing will be displayed in the console
	 */
	conbo.logEnabled = true;
	
	/**
	 * @member		{function}	log - Add a log message to the console
	 * @memberOf	conbo
	 */
	
	/**
	 * @member		{function}	warn - Add a warning message to the console
	 * @memberOf	conbo
	 */
	
	/**
	 * @member		{function}	info - Add information to the console
	 * @memberOf	conbo
	 */
	
	/**
	 * @member		{function}	error - Add an error log message to the console
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
