/*
 * Utility methods
 * A modified subset of Underscore.js methods, plus loads of our own
 */

var _ = {};

(function() 
{
	// Establish the object that gets returned to break out of a loop iteration.
	var breaker = {};

	// Save bytes in the minified (but not gzipped) version:
	var
		ArrayProto = Array.prototype, 
		ObjProto = Object.prototype, 
		FuncProto = Function.prototype;

	// Create quick reference variables for speed access to core prototypes.
	var
		push			= ArrayProto.push,
		slice			= ArrayProto.slice,
		concat			= ArrayProto.concat,
		toString		= ObjProto.toString,
		hasOwnProperty	= ObjProto.hasOwnProperty;

	// All **ECMAScript 5** native function implementations that we hope to use
	// are declared here.
	var
		nativeForEach		= ArrayProto.forEach,
		nativeMap			= ArrayProto.map,
		nativeReduce		= ArrayProto.reduce,
		nativeReduceRight	= ArrayProto.reduceRight,
		nativeFilter		= ArrayProto.filter,
		nativeEvery			= ArrayProto.every,
		nativeSome			= ArrayProto.some,
		nativeIndexOf		= ArrayProto.indexOf,
		nativeLastIndexOf	= ArrayProto.lastIndexOf,
		nativeIsArray		= Array.isArray,
		nativeKeys			= Object.keys,
		nativeBind			= FuncProto.bind;

	// Collection Functions
	// --------------------

	// The cornerstone, an `each` implementation, aka `forEach`.
	// Handles objects with the built-in `forEach`, arrays, and raw objects.
	// Delegates to **ECMAScript 5**'s native `forEach` if available.
	var forEach = _.forEach = function(obj, iterator, context) {
		if (obj == null) return obj;
		if (nativeForEach && obj.forEach === nativeForEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, length = obj.length; i < length; i++) {
				if (iterator.call(context, obj[i], i, obj) === breaker) return;
			}
		} else {
			var keys = _.keys(obj);
			for (var i = 0, length = keys.length; i < length; i++) {
				if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
			}
		}
		return obj;
	};

	// Return the results of applying the iterator to each element.
	// Delegates to **ECMAScript 5**'s native `map` if available.
	_.map = function(obj, iterator, context) 
	{
		var results = [];
		
		if (obj == null) return results;
		if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
		
		forEach(obj, function(value, index, list) 
		{
			results.push(iterator.call(context, value, index, list));
		});
		
		return results;
	};
	
	// Return the first value which passes a truth test. Aliased as `detect`.
	_.find = function(obj, predicate, context) {
		var result;
		any(obj, function(value, index, list) {
			if (predicate.call(context, value, index, list)) {
				result = value;
				return true;
			}
		});
		return result;
	};

	// Return all the elements that pass a truth test.
	// Delegates to **ECMAScript 5**'s native `filter` if available.
	// Aliased as `select`.
	_.filter = function(obj, predicate, context) {
		var results = [];
		if (obj == null) return results;
		if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
		forEach(obj, function(value, index, list) {
			if (predicate.call(context, value, index, list)) results.push(value);
		});
		return results;
	};

	// Return all the elements for which a truth test fails.
	_.reject = function(obj, predicate, context) {
		return _.filter(obj, function(value, index, list) {
			return !predicate.call(context, value, index, list);
		}, context);
	};
	
	// Determine whether all of the elements match a truth test.
	// Delegates to **ECMAScript 5**'s native `every` if available.
	// Aliased as `all`.
	_.every = function(obj, predicate, context) {
		predicate || (predicate = _.identity);
		var result = true;
		if (obj == null) return result;
		if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
		forEach(obj, function(value, index, list) {
			if (!(result = result && predicate.call(context, value, index, list))) return breaker;
		});
		return !!result;
	};

	// Determine if at least one element in the object matches a truth test.
	// Delegates to **ECMAScript 5**'s native `some` if available.
	// Aliased as `any`.
	var any = _.any = function(obj, predicate, context) {
		predicate || (predicate = _.identity);
		var result = false;
		if (obj == null) return result;
		if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
		forEach(obj, function(value, index, list) {
			if (result || (result = predicate.call(context, value, index, list))) return breaker;
		});
		return !!result;
	};

	// Determine if the array or object contains a given value (using `===`).
	_.contains = function(obj, target) {
		if (obj == null) return false;
		if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
		return any(obj, function(value) {
			return value === target;
		});
	};

	// Invoke a method (with arguments) on every item in a collection.
	_.invoke = function(obj, method) 
	{
		var args = slice.call(arguments, 2);
		var isFunc = _.isFunction(method);
		return _.map(obj, function(value) {
			return (isFunc ? method : value[method]).apply(value, args);
		});
	};
	
	// Convenience version of a common use case of `map`: fetching a property.
	_.pluck = function(obj, key) {
		return _.map(obj, _.property(key));
	};

	// Return the maximum element or (element-based computation).
	// Can't optimize arrays of integers longer than 65,535 elements.
	// See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
	_.max = function(obj, iterator, context) {
		if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
			return Math.max.apply(Math, obj);
		}
		var result = -Infinity, lastComputed = -Infinity;
		forEach(obj, function(value, index, list) {
			var computed = iterator ? iterator.call(context, value, index, list) : value;
			if (computed > lastComputed) {
				result = value;
				lastComputed = computed;
			}
		});
		return result;
	};

	// Return the minimum element (or element-based computation).
	_.min = function(obj, iterator, context) {
		if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
			return Math.min.apply(Math, obj);
		}
		var result = Infinity, lastComputed = Infinity;
		forEach(obj, function(value, index, list) {
			var computed = iterator ? iterator.call(context, value, index, list) : value;
			if (computed < lastComputed) {
				result = value;
				lastComputed = computed;
			}
		});
		return result;
	};

	// Shuffle an array, using the modern version of the
	// [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	_.shuffle = function(obj) {
		var rand;
		var index = 0;
		var shuffled = [];
		forEach(obj, function(value) {
			rand = _.random(index++);
			shuffled[index - 1] = shuffled[rand];
			shuffled[rand] = value;
		});
		return shuffled;
	};

	// An internal function to generate lookup iterators.
	var lookupIterator = function(value) {
		if (value == null) return _.identity;
		if (_.isFunction(value)) return value;
		return _.property(value);
	};

	// Sort the object's values by a criterion produced by an iterator.
	_.sortBy = function(obj, iterator, context) {
		iterator = lookupIterator(iterator);
		return _.pluck(_.map(obj, function(value, index, list) {
			return {
				value: value,
				index: index,
				criteria: iterator.call(context, value, index, list)
			};
		}).sort(function(left, right) {
			var a = left.criteria;
			var b = right.criteria;
			if (a !== b) {
				if (a > b || a === void 0) return 1;
				if (a < b || b === void 0) return -1;
			}
			return left.index - right.index;
		}), 'value');
	};

	// Safely create a real, live array from anything iterable.
	_.toArray = function(obj) {
		if (!obj) return [];
		if (_.isArray(obj)) return slice.call(obj);
		if (obj.length === +obj.length) return _.map(obj, _.identity);
		return _.values(obj);
	};

	// Return the number of elements in an object.
	_.size = function(obj) {
		if (obj == null) return 0;
		return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
	};

	// Array Functions
	// ---------------

	// Get the last element of an array. Passing **n** will return the last N
	// values in the array. The **guard** check allows it to work with `_.map`.
	_.last = function(array, n, guard) {
		if (array == null) return void 0;
		if ((n == null) || guard) return array[array.length - 1];
		return slice.call(array, Math.max(array.length - n, 0));
	};

	// Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	// Especially useful on the arguments object. Passing an **n** will return
	// the rest N values in the array. The **guard**
	// check allows it to work with `_.map`.
	_.rest = function(array, n, guard) {
		return slice.call(array, (n == null) || guard ? 1 : n);
	};

	// Trim out all falsy values from an array.
	_.compact = function(array) {
		return _.filter(array, _.identity);
	};

	// Internal implementation of a recursive `flatten` function.
	var flatten = function(input, shallow, output) {
		if (shallow && _.every(input, _.isArray)) {
			return concat.apply(output, input);
		}
		forEach(input, function(value) {
			if (_.isArray(value) || _.isArguments(value)) {
				shallow ? push.apply(output, value) : flatten(value, shallow, output);
			} else {
				output.push(value);
			}
		});
		return output;
	};

	// Flatten out an array, either recursively (by default), or just one level.
	_.flatten = function(array, shallow) {
		return flatten(array, shallow, []);
	};

	// Return a version of the array that does not contain the specified value(s).
	_.without = function(array) {
		return _.difference(array, slice.call(arguments, 1));
	};

	// Split an array into two arrays: one whose elements all satisfy the given
	// predicate, and one whose elements all do not satisfy the predicate.
	_.partition = function(array, predicate) {
		var pass = [], fail = [];
		forEach(array, function(elem) {
			(predicate(elem) ? pass : fail).push(elem);
		});
		return [pass, fail];
	};

	// Produce a duplicate-free version of the array. If the array has already
	// been sorted, you have the option of using a faster algorithm.
	// Aliased as `unique`.
	_.uniq = function(array, isSorted, iterator, context) {
		if (_.isFunction(isSorted)) {
			context = iterator;
			iterator = isSorted;
			isSorted = false;
		}
		var initial = iterator ? _.map(array, iterator, context) : array;
		var results = [];
		var seen = [];
		forEach(initial, function(value, index) {
			if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
				seen.push(value);
				results.push(array[index]);
			}
		});
		return results;
	};

	// Produce an array that contains the union: each distinct element from all of
	// the passed-in arrays.
	_.union = function() {
		return _.uniq(_.flatten(arguments, true));
	};

	// Produce an array that contains every item shared between all the
	// passed-in arrays.
	_.intersection = function(array) {
		var rest = slice.call(arguments, 1);
		return _.filter(_.uniq(array), function(item) {
			return _.every(rest, function(other) {
				return _.contains(other, item);
			});
		});
	};

	// Take the difference between one array and a number of other arrays.
	// Only the elements present in just the first array will remain.
	_.difference = function(array) {
		var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
		return _.filter(array, function(value){ return !_.contains(rest, value); });
	};

	// Converts lists into objects. Pass either a single array of `[key, value]`
	// pairs, or two parallel arrays of the same length -- one of keys, and one of
	// the corresponding values.
	_.object = function(list, values) {
		if (list == null) return {};
		var result = {};
		for (var i = 0, length = list.length; i < length; i++) {
			if (values) {
				result[list[i]] = values[i];
			} else {
				result[list[i][0]] = list[i][1];
			}
		}
		return result;
	};

	// If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
	// we need this function. Return the position of the first occurrence of an
	// item in an array, or -1 if the item is not included in the array.
	// Delegates to **ECMAScript 5**'s native `indexOf` if available.
	// If the array is large and already in sort order, pass `true`
	// for **isSorted** to use binary search.
	_.indexOf = function(array, item, isSorted) {
		if (array == null) return -1;
		var i = 0, length = array.length;
		if (isSorted) {
			if (typeof isSorted == 'number') {
				i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
			} else {
				i = _.sortedIndex(array, item);
				return array[i] === item ? i : -1;
			}
		}
		if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
		for (; i < length; i++) if (array[i] === item) return i;
		return -1;
	};

	// Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
	_.lastIndexOf = function(array, item, from) {
		if (array == null) return -1;
		var hasIndex = from != null;
		if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
			return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
		}
		var i = (hasIndex ? from : array.length);
		while (i--) if (array[i] === item) return i;
		return -1;
	};
	
	// Generate an integer Array containing an arithmetic progression. A port of
	// the native Python `range()` function. See
	// [the Python documentation](http://docs.python.org/library/functions.html#range).
	_.range = function(start, stop, step) {
		if (arguments.length <= 1) {
			stop = start || 0;
			start = 0;
		}
		step = arguments[2] || 1;

		var length = Math.max(Math.ceil((stop - start) / step), 0);
		var idx = 0;
		var range = new Array(length);

		while(idx < length) {
			range[idx++] = start;
			start += step;
		}

		return range;
	};

	// Function (ahem) Functions
	// ------------------

	// Reusable constructor function for prototype setting.
	var ctor = function(){};

	// Create a function bound to a given object (assigning `this`, and arguments,
	// optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	// available.
	_.bind = function(func, context) {
		var args, bound;
		if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
		if (!_.isFunction(func)) throw new TypeError;
		args = slice.call(arguments, 2);
		return bound = function() {
			if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
			ctor.prototype = func.prototype;
			var self = new ctor;
			ctor.prototype = null;
			var result = func.apply(self, args.concat(slice.call(arguments)));
			if (Object(result) === result) return result;
			return self;
		};
	};

	// Partially apply a function by creating a version that has had some of its
	// arguments pre-filled, without changing its dynamic `this` context. _ acts
	// as a placeholder, allowing any combination of arguments to be pre-filled.
	_.partial = function(func) {
		var boundArgs = slice.call(arguments, 1);
		return function() {
			var position = 0;
			var args = boundArgs.slice();
			for (var i = 0, length = args.length; i < length; i++) {
				if (args[i] === _) args[i] = arguments[position++];
			}
			while (position < arguments.length) args.push(arguments[position++]);
			return func.apply(this, args);
		};
	};

	// Bind a number of an object's methods to that object. Remaining arguments
	// are the method names to be bound. Useful for ensuring that all callbacks
	// defined on an object belong to it.
	_.bindAll = function(obj, regExp)
	{
		var isRegExp = regExp instanceof RegExp,
			funcs = slice.call(arguments, 1);
		
		if (isRegExp || funcs.length === 0) 
		{
			funcs = _.functions(obj);
			if (isRegExp) funcs = _.filter(funcs, function(f) { return regExp.test(f); });
		}
		
		funcs.forEach(function(f)
		{
			obj[f] = _.bind(obj[f], obj); 
		});
		
		return obj;
	};

	// Delays a function for the given number of milliseconds, and then calls
	// it with the arguments supplied.
	_.delay = function(func, wait) {
		var args = slice.call(arguments, 2);
		return setTimeout(function(){ return func.apply(null, args); }, wait);
	};

	// Defers a function, scheduling it to run after the current call stack has
	// cleared.
	_.defer = function(func) {
		return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
	};

	// Returns a function that will be executed at most one time, no matter how
	// often you call it. Useful for lazy initialization.
	_.once = function(func) {
		var ran = false, memo;
		return function() {
			if (ran) return memo;
			ran = true;
			memo = func.apply(this, arguments);
			func = null;
			return memo;
		};
	};

	// Returns the first function passed as an argument to the second,
	// allowing you to adjust arguments, run code before and after, and
	// conditionally execute the original function.
	_.wrap = function(func, wrapper) {
		return _.partial(wrapper, func);
	};
	
	// Object Functions
	// ----------------

	// Retrieve the names of an object's properties.
	// Delegates to **ECMAScript 5**'s native `Object.keys`
	// Conbo.js: Extended to enable keys further up the prototype chain to be found too
	_.keys = function(obj, useForIn) 
	{
		if (!_.isObject(obj)) return [];
		
		if (nativeKeys && !useForIn)
		{
			return nativeKeys(obj);
		}
		
		var keys = [];
		
		for (var key in obj)
		{
			if (useForIn || _.has(obj, key)) keys.push(key);
		}
		
		return keys;
	};
	
	// Retrieve the values of an object's properties.
	// Conbo.js: Extended to enable keys further up the prototype chain to be found too
	_.values = function(obj, useForIn) 
	{
		var keys = _.keys(obj, useForIn);
		var length = keys.length;
		var values = new Array(length);
		
		for (var i = 0; i < length; i++)
		{
			values[i] = obj[keys[i]];
		}
		
		return values;
	};

	// Return a sorted list of the function names available on the object.
	_.functions = function(obj) {
		var names = [];
		for (var key in obj) {
			if (_.isFunction(obj[key])) names.push(key);
		}
		return names.sort();
	};

	// Extend a given object with all the properties in passed-in object(s).
	_.extend = function(obj) 
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

	// Return a copy of the object only containing the whitelisted properties.
	_.pick = function(obj) {
		var copy = {};
		var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
		forEach(keys, function(key) {
			if (key in obj)
			{
				conbo.cloneProperty(obj, key, copy);
			}
		});
		return copy;
	};
	
	 // Return a copy of the object without the blacklisted properties.
	_.omit = function(obj) {
		var copy = {};
		var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
		for (var key in obj) 
		{
			if (!_.contains(keys, key))
			{
				conbo.cloneProperty(obj, key, copy);
			}
		}
		return copy;
	};

	// Fill in a given object with default properties.
	_.defaults = function(obj) 
	{
		forEach(slice.call(arguments, 1), function(source) 
		{
			if (source) 
			{
				for (var propName in source) 
				{
					if (obj[propName] !== void 0) continue;
					conbo.cloneProperty(source, propName, obj);
				}
			}
		});
		return obj;
	};

	// Create a (shallow-cloned) duplicate of an object.
	_.clone = function(obj) 
	{
		if (!_.isObject(obj)) return obj;
		return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
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
				return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
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
		if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
														 _.isFunction(bCtor) && (bCtor instanceof bCtor))
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
				if (_.has(a, key)) {
					// Count the expected number of properties.
					size++;
					// Deep compare each member.
					if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
				}
			}
			// Ensure that both objects contain the same number of properties.
			if (result) {
				for (key in b) {
					if (_.has(b, key) && !(size--)) break;
				}
				result = !size;
			}
		}
		// Remove the first object from the stack of traversed objects.
		aStack.pop();
		bStack.pop();
		return result;
	};

	// Perform a deep comparison to check if two objects are equal.
	_.isEqual = function(a, b) {
		return eq(a, b, [], []);
	};

	// Is a given array, string, or object empty?
	// An "empty" object has no enumerable own-properties.
	_.isEmpty = function(obj) {
		if (obj == null) return true;
		if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
		for (var key in obj) if (_.has(obj, key)) return false;
		return true;
	};

	// Is a given value a DOM element?
	_.isElement = function(obj) {
		return !!(obj && obj.nodeType === 1);
	};

	// Is a given value an array?
	// Delegates to ECMA5's native Array.isArray
	_.isArray = nativeIsArray || function(obj) {
		return toString.call(obj) == '[object Array]';
	};

	// Is a given variable an object?
	_.isObject = function(obj) {
		return obj === Object(obj);
	};

	// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
	forEach(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
		_['is' + name] = function(obj) {
			return toString.call(obj) == '[object ' + name + ']';
		};
	});

	// Define a fallback version of the method in browsers (ahem, IE), where
	// there isn't any inspectable "Arguments" type.
	if (!_.isArguments(arguments)) {
		_.isArguments = function(obj) {
			return !!(obj && _.has(obj, 'callee'));
		};
	}
	
	// Optimize `isFunction` if appropriate.
	if (typeof (/./) !== 'function') {
		_.isFunction = function(obj) {
			return typeof obj === 'function';
		};
	}
	
	// Is a given object a finite number?
	_.isFinite = function(obj) {
		return isFinite(obj) && !isNaN(parseFloat(obj));
	};

	// Is the given value `NaN`? (NaN is the only number which does not equal itself).
	_.isNaN = function(obj) {
		return _.isNumber(obj) && obj != +obj;
	};

	// Is a given value a boolean?
	_.isBoolean = function(obj) {
		return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
	};

	// Is a given value equal to null?
	_.isNull = function(obj) {
		return obj === null;
	};

	// Is a given variable undefined?
	_.isUndefined = function(obj) {
		return obj === void 0;
	};

	// Shortcut function for checking if an object has a given property directly
	// on itself (in other words, not on a prototype).
	_.has = function(obj, key) {
		return hasOwnProperty.call(obj, key);
	};

	// Utility Functions
	// -----------------

	// Keep the identity function around for default iterators.
	_.identity = function(value) {
		return value;
	};
	
	_.property = function(key) {
		return function(obj) {
			return obj[key];
		};
	};

	// Returns a predicate for checking whether an object has a given set of `key:value` pairs.
	_.matches = function(attrs) {
		return function(obj) {
			if (obj === attrs) return true; //avoid comparing an object to itself.
			for (var key in attrs) {
				if (attrs[key] !== obj[key])
					return false;
			}
			return true;
		}
	};
	
	// Return a random integer between min and max (inclusive).
	_.random = function(min, max) {
		if (max == null) {
			max = min;
			min = 0;
		}
		return min + Math.floor(Math.random() * (max - min + 1));
	};

	// A (possibly faster) way to get the current timestamp as an integer.
	_.now = Date.now || function() { return new Date().getTime(); };

	// Generate a unique integer id (unique within the entire client session).
	// Useful for temporary DOM ids.
	var idCounter = 0;
	_.uniqueId = function(prefix) {
		var id = ++idCounter + '';
		return prefix ? prefix + id : id;
	};
	
	// Add Underscore functions to Conbo
	forEach(_.functions(_), function(name) 
	{
		conbo[name] = _[name];
	});
	
})();


/**
 * Is Conbo supported by the current browser?
 */
conbo.isSupported = !!Object.defineProperty && !!Object.getOwnPropertyDescriptor;

/**
 * Do nothing
 */
conbo.noop = function() {};

/**
 * Default function to assign to the methods of pseudo-interfaces
 * @example	IExample = { myMethod:conbo.notImplemented };
 */
conbo.notImplemented = function() 
{
	conbo.warn('Method not implemented');
};

/**
 * Convert dash-or_underscore separated words into camelCaseWords
 */
conbo.toCamelCase = function(string)
{
	return (string || '').replace(/([\W_])([a-z])/g, function (g) { return g[1].toUpperCase(); }).replace(/(\W+)/, '');
};

/**
 * Format a number using the selected number of decimals, using the 
 * provided decimal point, thousands separator 
 * 
 * Based on http://phpjs.org/functions/number_format/
 * 
 * @param 	number
 * @param 	decimals				default: 0
 * @param 	decimalPoint			default: '.'
 * @param 	thousandsSeparator	default: ','
 * @returns	String	Formatted number
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
}

/**
 * Format a number as a currency
 * 
 * @param number
 * @param symbol
 * @param suffixed
 * @param decimals
 * @param decimalPoint
 * @param thousandsSeparator
 */
conbo.formatCurrency = function(number, symbol, suffixed, decimals, decimalPoint, thousandsSeparator)
{
	var n = conbo.formatNumber(number, decimals, decimalPoint, thousandsSeparator);
	return suffixed ? n+symbol : symbol+n;
}

/**
 * Copies all of the enumerable values from one or more objects and sets
 * them to another.
 * 
 * Unlike conbo.extend, setValues only sets the values on the target 
 * object and does not destroy and redifine them
 * 
 * @param	{Object}	obj		Object to copy properties to
 * @example	conbo.setValues({id:1}, {get name() { return 'Arthur'; }}, {get age() { return 42; }});
 * 			=> {id:1, name:'Arthur', age:42}
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
 */
conbo.isClass = function(value)
{
	return !!value && typeof value == 'function' && value.prototype instanceof conbo.Class;
};

/**
 * Copies a property, including defined properties and accessors, 
 * from one object to another
 * 
 * @param	source			Source object
 * @param	sourceName		Name of the property on the source
 * @param	target			Target object
 * @param	targetName		Name of the property on the target (default: sourceName)
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
};

/**
 * Is the object an instance of the specified class(es) or implement the
 * specified pseudo-interface(s)?
 * 
 * @example						var b = conbo.instanceOf(obj, conbo.EventDispatcher);
 * @example						var b = conbo.instanceOf(obj, conbo.View, conbo.IInjectable);
 * @param	obj					The class instance
 * @param	classOrInterface	The Conbo class or pseudo-interface to compare against
 */
conbo.instanceOf = function(obj, classOrInterface)
{
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
 * Loads a CSS and apply it to the DOM
 * @param 	{String}	url		The CSS file's URL
 * @param 	{String}	media	The media attribute (defaults to 'all')
 */
conbo.loadCss = function(url, media)
{
	if (!('document' in window) || !!document.querySelector('[href="'+url+'"]'))
	{
		return this;
	}
	
	var link, head; 
		
		link = document.createElement('link');
		link.rel	= 'stylesheet';
		link.type = 'text/css';
		link.href = url;
		link.media = media || 'all';
		
	head = document.getElementsByTagName('head')[0];
	head.appendChild(link);
		
	return this;
};


/*
 * Property utilities
 */

/**
 * Return the names of all the enumerable properties on the specified object, 
 * i.e. all of the keys that aren't functions
 * 
 * @see		#keys
 * 
 * @param	obj			The object to list the properties of
 * @param	useForIn	Whether or not to include properties further up the prorotype chain
 */
conbo.properties = function(obj, useForIn)
{
	return conbo.difference(conbo.keys(obj, useForIn), conbo.functions(obj));
};

/**
 * Makes the specified properties of an object bindable; if no property 
 * names are passed, all enumarable properties will be made bindable
 * 
 * @see 	#makeAllBindable
 * 
 * @param	{String}		obj
 * @param	{Array}			propNames (optional)
 */
conbo.makeBindable = function(obj, propNames)
{
	propNames || (propNames = conbo.properties(obj));
	
	propNames.forEach(function(propName)
	{
		_defineProperty(obj, propName);
	});
	
	return this;
};

/**
 * Makes all existing properties of the specified object bindable, and 
 * optionally create additional bindable properties for each of the property 
 * names passed in the propNames array
 * 
 * @see 	#makeBindable
 * 
 * @param	{String}		obj
 * @param	{Array}			propNames (optional)
 * @param	{useForIn}		Whether or not to include properties further up the prototype chain
 */
conbo.makeAllBindable = function(obj, propNames, useForIn)
{
	propNames = conbo.uniq((propNames || []).concat(conbo.properties(obj, useForIn)));
	conbo.makeBindable(obj, propNames);
	
	return this;
};

/**
 * Is the specified property an accessor (with a getter and/or setter)?
 * @returns		Boolean
 */
conbo.isAccessor = function(obj, propName)
{
	var descriptor = Object.getOwnPropertyDescriptor(obj, propName);
	
	// TODO Should we check prototype too, using obj.__proto__ or Object.getPrototypeOf(obj)?
	
	return !!descriptor && (!!descriptor.set || !!descriptor.get);
}

/**
 * Is the specified property bindable?
 * @returns		Boolean
 */
conbo.isBindable = function(obj, propName)
{
	if (!conbo.isAccessor(obj, propName))
	{
		return false;
	}
	
	var descriptor = Object.getOwnPropertyDescriptor(obj, propName);
	return !!descriptor.set && descriptor.set.bindable;
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
			|| function(callback)
			{
				window.setTimeout(callback, 1000 / 60);
			};
	})();
}


/*
 * Logging
 */

/**
 * Enable logging?
 */
conbo.logEnabled = true;

/**
 * Logging
 */

var logMethods = ['log','warn','info','error'];

logMethods.forEach(function(method)
{
	conbo[method] = function()
	{
		if (!console || !conbo.logEnabled) return;
		console[method].apply(console, arguments);
	}
});

/*
 * Internal utility methods
 */

/**
 * Dispatch a property change event from the specified object
 */
var _dispatchChange = function(obj, propName, value)
{
	if (!(obj instanceof conbo.EventDispatcher)) return;
	
	var options = {property:propName, value:value};
	
	obj.dispatchEvent(new conbo.ConboEvent('change:'+propName, options));
	obj.dispatchEvent(new conbo.ConboEvent('change', options));
};

/**
 * Creates a property which can be bound to DOM elements and others
 * 
 * @param	(Object)	obj			The EventDispatcher object on which the property will be defined
 * @param	(String)	propName	The name of the property to be defined
 * @param	(*)			value		The initial value of the property (optional)
 * @param	(Function)	getter		The getter function (optional)
 * @param	(Function)	setter		The setter function (optional)
 * @param	(Boolean)	enumerable	Whether of not the property should be enumerable (optional, default: true)
 */
var _defineProperty = function(obj, propName, getter, setter, enumerable)
{
	if (conbo.isAccessor(obj, propName))
	{
		return this;
	}
	
	var value = obj[propName],
		nogs = !getter && !setter;
	
	enumerable = (enumerable !== false);
		
	if (nogs)
	{
		getter = function()
		{
			return value;
		};
	
		setter = function(newValue)
		{
			if (newValue === value) return;
			value = newValue;
			
			_dispatchChange(this, propName, value);
		};
	}
	else if (!!setter)
	{
		setter = conbo.wrap(setter, function(fn, newValue)
		{
			fn.call(this, newValue);
			_dispatchChange(this, propName, obj[propName]);
		});
		
		setter.bindable = true;
	}
	
	Object.defineProperty(obj, propName, {enumerable:enumerable, configurable:true, get:getter, set:setter});
	
	return this;
};

/**
 * Define property that can't be enumerated
 */
var _defineUnenumerableProperty = function(obj, propName, value)
{
	if (arguments.length == 2)
	{
		value = obj[propName];
	}
	
	Object.defineProperty(obj, propName, {enumerable:false, configurable:true, writable:true, value:value});
	return this;
};

/**
 * Convert enumerable properties of the specified object into non-enumerable ones
 */
var _denumerate = function(obj)
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
};
