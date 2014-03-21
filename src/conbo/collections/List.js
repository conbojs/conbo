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
	constructor: function(models, options) 
	{
		options || (options = {});
		
		this.proxyAll('_redispatch');
		
		this.length = 0;
		this.models = (models || []).slice();
		
		this._inject(options);
		
		this.initialize.apply(this, arguments);
	},
	
	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	initialize: function(){},
	
	/**
	 * The JSON representation of a Collection is an array of the
	 * models' attributes.
	 */
	toJSON: function() 
	{
		return this;
	},
	
	/**
	 * Add a model to the end of the collection.
	 */
	push: function(model)
	{
		this.length = this.models.push.apply(this.models, arguments);
		this._handleChange(_.toArray(arguments));
		this.trigger(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		
		return this.length;
	},
	
	/**
	 * Remove a model from the end of the collection.
	 */
	pop: function(options)
	{
		if (!this.length) return;
		
		var model = this.models.pop();
		
		this._handleChange(model, false);
		this.length = this.models.length;
		this.trigger(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		
		return model;
	},
	
	/**
	 * Add a model to the beginning of the collection.
	 */
	unshift: function(model) 
	{
		this.length = this.models.unshift.apply(this.models, arguments);
		this._handleChange(_.toArray(arguments));
		this.trigger(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		
		return this.length;
	},
	
	/**
	 * Remove a model from the beginning of the collection.
	 */
	shift: function()
	{
		if (!this.length) return;
		
		var model;
		
		this._handleChange(model = this.models.shift(), false);
		this.length = this.models.length;
		this.trigger(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		
		return model;
	},
	
	/**
	 * Slice out a sub-array of models from the collection.
	 */
	slice: function(begin, length)
	{
		return this.models.slice(begin, length);
	},
	
	/**
	 * Splice out a sub-array of models from the collection.
	 */
	splice: function(begin, length)
	{
		var inserts = _.rest(arguments,2).length;
		
		var models = this.models.splice(begin, length, inserts);
		this.length = this.models.length;
		
		if (models.length) this.trigger(new conbo.ConboEvent(conbo.ConboEvent.REMOVE));
		if (inserts.length) this.trigger(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		
		return models;
	},
	
	/**
	 * Get a model from the List if it exists, otherwise undefined
	 */
	get: function(obj) 
	{
		if (obj == undefined || this.models.indexOf(obj) == -1) 
		{
			return undefined;
		}
		
		return obj;
	},

	/**
	 * Get the model at the given index, similar to array[index]
	 */
	at: function(index) 
	{
		return this.models[index];
	},
	
	/**
	 * Replaces the item at the specified index with the one specified,
	 * similar to array[index] = value;
	 */
	replace: function(index, model)
	{
		var replaced = this.models[index];
		this._handleChange(replaced, false);
		
		this.models[index] = model
		this._handleChange(model);
		
		if (this.models.length > this.length)
		{
			this.length = this.models.length;
			this.trigger(new conbo.ConboEvent(conbo.ConboEvent.ADD));
		}
		
		this.trigger(new conbo.ConboEvent(conbo.ConboEvent.CHANGE));
		
		return replaced;
	},
	
	/**
	 * Force the collection to re-sort itself. You don't need to call this under
	 * normal circumstances, as the set will maintain sort order as each item
	 * is added.
	 */
	sort: function(compareFunction) 
	{
		this.models.sort(compareFunction);
		this.trigger(new conbo.ConboEvent(conbo.ConboEvent.SORT));
		
		return this;
	},
	
	/**
	 * Create a new collection with an identical list of models as this one.
	 */
	clone: function() 
	{
		return new this.constructor(this.models);
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
	_handleChange: function(models, enabled)
	{
		var method = enabled === false ? 'off' : 'on'
		
		models = (_.isArray(models) ? models : [models]).slice();
		
		while (models.length)
		{
			var model = models.pop();
			
			if (model instanceof conbo.Bindable)
			{
				model[method](conbo.ConboEvent.CHANGE, this._redispatch);
			}
		}
	},
	
	/**
	 * Passthrough event to bubble events dispatched by Bindable array elements 
	 */
	_redispatch: function(event)
	{
		this.trigger(event);
	}
});

// Underscore methods that we want to implement on the List.
var methods = 
[
	'forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
	'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
	'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
	'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
	'tail', 'drop', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf',
	'isEmpty', 'chain'
];

// Mix in each available Underscore/Lo-Dash method as a proxy to `Collection#models`.
_.each(methods, function(method) 
{
	if (!(method in _)) return;
	
	conbo.List.prototype[method] = function() 
	{
		var args = [].slice.call(arguments);
		args.unshift(this.models);
		return _[method].apply(_, args);
	};
});

// Underscore methods that take a property name as an argument.
var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

// Use attributes instead of properties.
_.each(attributeMethods, function(method)
{
	if (!(method in _)) return;
	
	conbo.List.prototype[method] = function(value, context) 
	{
		var iterator = _.isFunction(value) ? value : function(model) 
		{
			return model.get(value);
		};
		
		return _[method](this.models, iterator, context);
	};
});
