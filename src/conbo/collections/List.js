/**
 * List
 * 
 * Light(er) weight alternative to conbo.Collection for collections
 * that don't require web service connectivity.
 * 
 * Provides a standard collection class for our sets of models, ordered
 * or unordered. If a `comparator` is specified, the Collection will maintain
 * its models in sort order, as they're added and removed.
 */
conbo.Collection = conbo.EventDispatcher.extend
({
	/**
	 * The default model for a collection is just a conbo.Model.
	 * This should be overridden in most cases.
	 */
	model: conbo.Model,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(models, options) 
	{
		options || (options = {});
		
		if (options.model) this.model = options.model;
		if (options.comparator !== undefined) this.comparator = options.comparator;
		
		this._reset();
		this._inject(options);
		
		if (models) 
		{
			this.reset(models, _.extend({silent: true}, options));
		}
		
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
	toJSON: function(options) 
	{
		return this.map(function(model){ return model.toJSON(options); });
	},
	
	/**
	 * Add a model, or list of models to the set.
	 */
	add: function(models, options)
	{
		return this.set(models, _.defaults(options || {}, {add: true, merge: false, remove: false}));
	},

	/**
	 * Remove a model, or a list of models from the set.
	 */
	remove: function(models, options)
	{
		models = _.isArray(models) ? models.slice() : [models];
		options || (options = {});
		
		var i, l, index, model;
		
		for (i = 0, l = models.length; i < l; i++) 
		{
			model = this.get(models[i]);
			
			if (!model) 
			{
				continue;
			}
			
			delete this._byId[model.id];
			delete this._byId[model.cid];
			
			index = this.indexOf(model);
			
			this.models.splice(index, 1);
			this.length--;
			
			if (!options.silent) 
			{
				options.index = index;
						
				this.trigger(new conbo.ConboEvent(conbo.ConboEvent.REMOVE,
				{
					model: model,
					collection: this,
					options: options
				}));
			}
			
			this._removeReference(model);
		}
		
		return this;
	},
	
	/**
	 * Update a collection by `set`-ing a new list of models, adding new ones,
	 * removing models that are no longer present, and merging models that
	 * already exist in the collection, as necessary. Similar to Model#set,
	 * the core operation for updating the data contained by the collection.
	 */
	set: function(models, options) 
	{
		options = _.defaults(options || {}, {add: true, remove: true, merge: true});
		
		if (options.parse) models = this.parse(models, options);
		if (!_.isArray(models)) models = models ? [models] : [];
		
		var i, l, model, existing, sort = false;
		var at = options.at;
		var sortable = this.comparator && (at == null) && options.sort !== false;
		var sortAttr = _.isString(this.comparator) ? this.comparator : null;
		var toAdd = [], toRemove = [], modelMap = {};

		// Turn bare objects into model references, and prevent invalid models
		// from being added.
		for (i=0, l=models.length; i<l; i++) 
		{
			if (!(model = this._prepareModel(models[i], options))) continue;

			// If a duplicate is found, prevent it from being added and
			// optionally merge it into the existing model.
			if (existing = this.get(model)) 
			{
				if (options.remove) 
				{
					modelMap[existing.cid] = true;
				}
				
				if (options.merge) 
				{
					existing.set(model.attributes, options);
					if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
				}

			} 
			// This is a new model, push it to the `toAdd` list.
			else if (options.add) 
			{
				toAdd.push(model);

				// Listen to added models' events, and index models for lookup by
				// `id` and by `cid`.
				model.on('all', this._onModelEvent, this);
				
				this._byId[model.cid] = model;
				
				if (model.id != null) 
				{
					this._byId[model.id] = model;
				}
			}
		}

		// Remove nonexistent models if appropriate.
		if (options.remove) 
		{
			for (i = 0, l = this.length; i < l; ++i) 
			{
				if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
			}
			
			if (toRemove.length) 
			{
				this.remove(toRemove, options);
			}
		}

		// See if sorting is needed, update `length` and splice in new models.
		if (toAdd.length) 
		{
			if (sortable) sort = true;
			
			this.length += toAdd.length;
			
			if (at != null) 
			{
				[].splice.apply(this.models, [at, 0].concat(toAdd));
			}
			else 
			{
				[].push.apply(this.models, toAdd);
			}
		}
		
		// Silently sort the collection if appropriate.
		if (sort) this.sort({silent: true});

		if (options.silent) return this;

		// Trigger `add` events.
		for (i=0, l=toAdd.length; i<l; i++) 
		{
			var model = toAdd[i];
			
			model.trigger(new conbo.ConboEvent(conbo.ConboEvent.ADD, 
			{
				model:model, 
				collection:this, 
				options:options
			}));
		}
		
		// Trigger `sort` if the collection was sorted.
		if (sort)
		{
			this.trigger(new conbo.ConboEvent(conbo.ConboEvent.SORT, 
   			{
   				collection:this, 
   				options:options
   			}));
		}
		
		return this;
	},

	/**
	 * When you have more items than you want to add or remove individually,
	 * you can reset the entire set with a new list of models, without firing
	 * any `add` or `remove` events. Fires `reset` when finished.
	 */
	reset: function(models, options) 
	{
		options || (options = {});
		
		for (var i = 0, l = this.models.length; i < l; i++) 
		{
			this._removeReference(this.models[i]);
		}
		
		options.previousModels = this.models;
		
		this._reset();
		this.add(models, _.extend({silent: true}, options));
				
		if (!options.silent) 
		{
			this.trigger(new conbo.ConboEvent(conbo.ConboEvent.RESET,
			{
				collection: this,
				options: options
			}));
		}
		
		return this;
	},
	
	/**
	 * Add a model to the end of the collection.
	 */
	push: function(model, options)
	{
		model = this._prepareModel(model, options);
		this.add(model, _.extend({at: this.length}, options));
		return model;
	},
	
	/**
	 * Remove a model from the end of the collection.
	 */
	pop: function(options)
	{
		var model = this.at(this.length - 1);
		this.remove(model, options);
		return model;
	},

	/**
	 * Add a model to the beginning of the collection.
	 */
	unshift: function(model, options) 
	{
		model = this._prepareModel(model, options);
		this.add(model, _.extend({at: 0}, options));
		return model;
	},

	/**
	 * Remove a model from the beginning of the collection.
	 */
	shift: function(options) 
	{
		var model = this.at(0);
		this.remove(model, options);
		return model;
	},
	
	/**
	 * Slice out a sub-array of models from the collection.
	 */
	slice: function(begin, end) 
	{
		return this.models.slice(begin, end);
	},

	/**
	 * Get a model from the set by id.
	 */
	get: function(obj) 
	{
		if (obj == null) return undefined;
		this._idAttr || (this._idAttr = this.model.prototype.idAttribute);
		return this._byId[obj.id || obj.cid || obj[this._idAttr] || obj];
	},

	/**
	 * Get the model at the given index.
	 */
	at: function(index) 
	{
		return this.models[index];
	},
	
	/**
	 * Return models with matching attributes. Useful for simple cases of `filter`.
	 */
	where: function(attrs, first) 
	{
		if (_.isEmpty(attrs)) return first ? undefined : [];
		
		return this[first ? 'find' : 'filter'](function(model) 
		{
			for (var key in attrs) 
			{
				if (attrs[key] !== model.get(key)) return false;
			}
			
			return true;
		});
	},

	/**
	 * Return the first model with matching attributes. Useful for simple cases
	 * of `find`.
	 */
	findWhere: function(attrs) 
	{
		return this.where(attrs, true);
	},
		
	/**
	 * Force the collection to re-sort itself. You don't need to call this under
	 * normal circumstances, as the set will maintain sort order as each item
	 * is added.
	 */
	sort: function(options) 
	{
		if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
		options || (options = {});
		
		// Run sort based on type of `comparator`.
		if (_.isString(this.comparator) || this.comparator.length === 1) 
		{
			this.models = this.sortBy(this.comparator, this);
		}
		else 
		{
			this.models.sort(_.bind(this.comparator, this));
		}

		if (!options.silent) 
		{
			this.trigger(new conbo.ConboEvent(conbo.ConboEvent.SORT,
			{
				collection: this,
				options: options
			}));
		}
		
		return this;
	},

	/**
	 * Figure out the smallest index at which a model should be inserted so as
	 * to maintain order.
	 */
	sortedIndex: function(model, value, context) 
	{
		value || (value = this.comparator);
		
		var iterator = _.isFunction(value) ? value : function(model) 
		{
			return model.get(value);
		};
		
		return _.sortedIndex(this.models, model, iterator, context);
	},

	/**
	 * Pluck an attribute from each model in the collection.
	 */
	pluck: function(attr)
	{
		return _.invoke(this.models, 'get', attr);
	},
	
	/**
	 * Create a new instance of a model in this collection. Add the model to the
	 * collection immediately
	 */
	create: function(model, options) 
	{
		options = options ? _.clone(options) : {};
		
		if (!(model = this._prepareModel(model, options))) return false;
		this.add(model, options);
		return model;
	},
	
	/**
	 * Create a new collection with an identical list of models as this one.
	 */
	clone: function() 
	{
		return new this.constructor(this.models);
	},

	/**
	 * Private method to reset all internal state. Called when the collection
	 * is first initialized or reset.
	 */
	_reset: function() 
	{
		this.length = 0;
		this.models = [];
		this._byId	= {};
	},
	
	/**
	 * Prepare a hash of attributes (or other model) to be added to this
	 * collection.
	 */
	_prepareModel: function(attrs, options) 
	{
		if (attrs instanceof conbo.Model) 
		{
			if (!attrs.collection) attrs.collection = this;
			return attrs;
		}
		
		options || (options = {});
		options.collection = this;
		
		var model = new this.model(attrs, options);
		
		if (!model._validate(attrs, options)) 
		{
			this.trigger(new conbo.ConboEvent(conbo.ConboEvent.INVALID,
			{
				collection:	this,
				attrs:		attrs,
				options:	options
			}));
			
			return false;
		}
		
		return model;
	},

	/**
	 * Internal method called every time a model in the set fires an event.
	 * Sets need to update their indexes when models change ids. All other
	 * events simply proxy through. "add" and "remove" events that originate
	 * in other collections are ignored.
	 * 
	 * @example		_onModelEvent: function(event, model, collection, options) 
	 */
	_onModelEvent: function(event)
	{
		if ((event.type == conbo.ConboEvent.ADD 
			|| event.type == conbo.ConboEvent.REMOVE) && event.collection != this)
		{
			return;
		}
		
		var model = event.model;
		
		if (event.type == conbo.ConboEvent.DESTROY) 
		{
			this.remove(model, event.options);
		}
		
		if (model && event.type == 'change:' + model.idAttribute) 
		{
			delete this._byId[event.model.previous(model.idAttribute)];
			
			if (model.id != null) 
			{
				this._byId[model.id] = model;
			}
		}
		
		this.trigger(event);
	},

	toString: function()
	{
		return 'conbo.List';
	}
});

// Underscore methods that we want to implement on the Collection.
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
	
	conbo.Collection.prototype[method] = function() 
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
	
	conbo.Collection.prototype[method] = function(value, context) 
	{
		var iterator = _.isFunction(value) ? value : function(model) 
		{
			return model.get(value);
		};
		
		return _[method](this.models, iterator, context);
	};
});
