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
	itemClass: conbo.Hash,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(options) 
	{
		options || (options = {});
		
		this.addEventListener(conbo.ConboEvent.CHANGE, this.__changeHandler, this, 999);
		
		var listOptions = 
		[
			'itemClass'
		];
		
		conbo.setValues(this, conbo.pick(options, listOptions));
		
		if (options.source) 
		{
			this.source = [];
			this.push.apply(this, options.source);
		}
		
		this.context = options.context;
		
		// @deprecated
		this.get = this.getItemAt;
		this.set = this.setItemAt;
		
		this.initialize.apply(this, arguments);
		conbo.makeAllBindable(this, this.bindable);
	},
	
	get source()
	{
		if (!this._source)
		{
			this._source = [];
		}
		
		return this._source;
	},
	
	set source(value)
	{
		this._source = conbo.toArray(value);
		this.dispatchChange('source');
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
	 * Add a model to the end of the collection.
	 */
	push: function(item)
	{
		this.source.push.apply(this.source, this.__applyClass(conbo.toArray(arguments)));
		this.__handleChange(conbo.toArray(arguments));
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		this.dispatchChange('length');
		
		return this.length;
	},
	
	/**
	 * Remove a model from the end of the collection.
	 */
	pop: function()
	{
		if (!this.length) return;
		
		var item = this.source.pop();
		
		this.__handleChange(item, false);
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		this.dispatchChange('length');
		
		return item;
	},
	
	/**
	 * Add a model to the beginning of the collection.
	 */
	unshift: function(item) 
	{
		this.source.unshift(this.source, this.__applyClass(conbo.toArray(arguments)));
		this.__handleChange(conbo.toArray(arguments));
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		this.dispatchChange('length');
		
		return this.length;
	},
	
	/**
	 * Remove an item from the beginning of the collection.
	 */
	shift: function()
	{
		if (!this.length) return;
		
		var item;
		
		this.__handleChange(item = this.source.shift(), false);
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
		this.__handleChange(replaced, false);
		
		this.source[index] = model
		this.__handleChange(model);
		
		if (this.length > length)
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD));
			this.dispatchChange('length');
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
		var a = [];
		
		this.forEach(function(item)
		{
			if (conbo.isFunction(item.toJSON)) a.push(item.toJSON());
			else a.push(item);
		});
		
		return a;
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
	__handleChange: function(items, enabled)
	{
		var method = enabled === false ? 'removeEventListener' : 'addEventListener'
		
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
	
	__applyClass: function(item)
	{
		if (item instanceof Array)
		{
			for (var i=0; i<item.length; i++)
			{
				item[i] = this.__applyClass(item[i]);
			}
			
			return item;
		}
		
		if (conbo.isObject(item) && !conbo.instanceOf(item, conbo.Class))
		{
			item = new this.itemClass({source:item});
		}
		
		return item;
	}
	
}).implement(conbo.IInjectable);

// Underscore methods that we want to implement on the List.
var listMethods = 
[
	'forEach', 'map', 'reduce', 'reduceRight', 'find', 'filter',
	'reject', 'every', 'any', 'contains', 'invoke',
	'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
	'tail', 'drop', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf',
	'isEmpty', 'chain'
];

// Mix in each available Conbo utility method as a proxy
listMethods.forEach(function(method) 
{
	if (!(method in conbo)) return;
	
	conbo.List.prototype[method] = function() 
	{
		var args = [this.source].concat(conbo.toArray(arguments)),
			result = conbo[method].apply(conbo, args);
		
		return conbo.isArray(result)
			? new conbo.List({source:result})
			: result;
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

__denumerate(conbo.List.prototype);
