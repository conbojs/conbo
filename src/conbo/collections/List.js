/**
 * List
 * 
 * A bindable Array wrapper that can be used as a lightweight alternative to 
 * conbo.Collection for collections that don't require web service connectivity.
 * 
 * Unlike Collection, List doesn't automatically convert added items into
 * Hash or Model, but does automatically detect if Bindable objects are added
 * to it and automatically watches them for changes
 */
conbo.List = conbo.EventDispatcher.extend
({
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(source, options) 
	{
		options || (options = {});
		
		this.bindAll('_redispatch');
		
		this.source = (source || []).slice();
		this.context = options.context;
		
		this.initialize.apply(this, arguments);
		conbo.bindProperties(this, this.bindable);
	},
	
	get source()
	{
		return this._source;
	},
	
	set source(value)
	{
		this._source = value || [];
	},
	
	/**
	 * The number of items in the List
	 */
	get length()
	{
		if (!this.source) return 0;
		return this.source.length;
	},
	
	/**
	 * The JSON representation of a Collection is an array of the
	 * models' attributes.
	 */
	toJSON: function() 
	{
		return this.source;
	},
	
	/**
	 * Add a model to the end of the collection.
	 */
	push: function(item)
	{
		this.length = this.source.push.apply(this.source, arguments);
		this._handleChange(conbo.toArray(arguments));
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		
		return this.length;
	},
	
	/**
	 * Remove a model from the end of the collection.
	 */
	pop: function()
	{
		if (!this.length) return;
		
		var item = this.source.pop();
		
		this._handleChange(item, false);
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		
		return item;
	},
	
	/**
	 * Add a model to the beginning of the collection.
	 */
	unshift: function(item) 
	{
		this._handleChange(conbo.toArray(arguments));
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		
		return this.length;
	},
	
	/**
	 * Remove an item from the beginning of the collection.
	 */
	shift: function()
	{
		if (!this.length) return;
		
		var item;
		
		this._handleChange(item = this.source.shift(), false);
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		
		return item;
	},
	
	/**
	 * Slice out a sub-array of items from the collection.
	 */
	slice: function(begin, length)
	{
		return this.source.slice(begin, length);
	},
	
	/**
	 * Splice out a sub-array of items from the collection.
	 */
	splice: function(begin, length)
	{
		var inserts = conbo.rest(arguments,2).length;
		
		var items = this.source.splice(begin, length, inserts);
		
		if (items.length) this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		if (inserts.length) this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		
		return items;
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
		this._handleChange(replaced, false);
		
		this.source[index] = model
		this._handleChange(model);
		
		if (this.length > length)
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		}
		
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE, {item:item}));
		
		return replaced;
	},
	
	/**
	 * Force the collection to re-sort itself. You don't need to call this under
	 * normal circumstances, as the set will maintain sort order as each item
	 * is added.
	 */
	sort: function(compareFunction) 
	{
		this.source.sort(compareFunction);
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.SORT));
		
		return this;
	},
	
	/**
	 * Create a new collection with an identical list of models as this one.
	 */
	clone: function() 
	{
		return new this.constructor(this.source);
	},

	toString: function()
	{
		return 'conbo.List';
	},
	
	/**
	 * Listen to the events of Bindable values so we can detect changes
	 * @param 	{any}		models
	 * @param 	{Boolean}	enabled
	 */
	_handleChange: function(items, enabled)
	{
		var method = enabled === false ? 'removeEventListener' : 'addEventListener'
		
		items = (conbo.isArray(items) ? items : [items]).slice();
		
		while (items.length)
		{
			var item = items.pop();
			
			if (item instanceof conbo.EventDispatcher)
			{
				item[method](conbo.ConboEvent.CHANGE, this._redispatch);
			}
		}
	},
	
	/**
	 * Passthrough event to bubble events dispatched by Bindable array elements 
	 */
	_redispatch: function(event)
	{
		this.dispatchEvent(event);
	}
	
}).implement(conbo.IInjectable);

// Underscore methods that we want to implement on the List.
var methods = 
[
	'forEach', 'map', 'collect', 'reduce', 'foldl',
	'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
	'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
	'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
	'tail', 'drop', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf',
	'isEmpty', 'chain'
];

// Mix in each available Underscore/Lo-Dash method as a proxy to `Collection#models`.
conbo.forEach(methods, function(method) 
{
	if (!(method in conbo)) return;
	
	conbo.List.prototype[method] = function() 
	{
		var args = [].slice.call(arguments);
		args.unshift(this.source);
		return conbo[method].apply(conbo, args);
	};
});

// Underscore methods that take a property name as an argument.
var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

// Use attributes instead of properties.
conbo.forEach(attributeMethods, function(method)
{
	if (!(method in conbo)) return;
	
	conbo.List.prototype[method] = function(value, context) 
	{
		var iterator = conbo.isFunction(value) ? value : function(item) 
		{
			return item.get(value);
		};
		
		return conbo[method](this.source, iterator, context);
	};
});

_denumerate(conbo.List.prototype);
