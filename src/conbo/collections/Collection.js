/**
 * Collection
 *
 * Provides a standard collection class for our sets of models, ordered
 * or unordered. If a `comparator` is specified, the Collection will maintain
 * its models in sort order, as they're added and removed.
 * 
 * Derived from the Backbone.js class of the same name
 */
conbo.Collection = conbo.List.extend
({
	/**
	 * The default model class for a collection is conbo.Model.
	 * This should be overridden in most cases.
	 */
	modelClass: conbo.Model,
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	constructor: function(models, options) 
	{
		options || (options = {});
		
		if (options.url) this.url = options.url;
		if (options.comparator !== undefined) this.comparator = options.comparator;
		
		// options.model and this.model are deprecated, but included for backward compatibility
		if (options.modelClass || options.model || this.model)
		{
			this.modelClass = options.modelClass || options.model || this.model;
		}
		
		this._reset();
		this._inject(options);
		
		if (models) 
		{
			this.reset(models, conbo.extend({silent: true}, options));
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
	 * Proxy `conbo.sync` by default.
	 */
	sync: function() 
	{
		return conbo.sync.apply(this, arguments);
	},

	/**
	 * Add a model, or list of models to the set.
	 */
	add: function(models, options)
	{
		return this.set(models, conbo.defaults(options || {}, {add:true, merge:false, remove:false}));
	},

	/**
	 * Remove a model, or a list of models from the set.
	 */
	remove: function(models, options)
	{
		models = conbo.isArray(models) ? models.slice() : [models];
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
			
			this._models.splice(index, 1);
			this.length--;
			
			if (!options.silent) 
			{
				options.index = index;
						
				this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.REMOVE,
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
		options = conbo.defaults(options || {}, {add: true, remove: true, merge: true});
		
		if (options.parse) models = this.parse(models, options);
		if (!conbo.isArray(models)) models = models ? [models] : [];
		
		var i, l, model, existing, sort = false;
		var at = options.at;
		var sortable = this.comparator && (at == null) && options.sort !== false;
		var sortAttr = conbo.isString(this.comparator) ? this.comparator : null;
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
				model.addEventListener('all', this._onModelEvent, this);
				
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
				if (!modelMap[(model = this._models[i]).cid]) toRemove.push(model);
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
				[].splice.apply(this._models, [at, 0].concat(toAdd));
			}
			else 
			{
				[].push.apply(this._models, toAdd);
			}
		}
		
		// Silently sort the collection if appropriate.
		if (sort) this.sort({silent: true});

		if (options.silent) return this;

		// Trigger `add` events.
		for (i=0, l=toAdd.length; i<l; i++) 
		{
			var model = toAdd[i];
			
			model.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.ADD, 
			{
				model:model, 
				collection:this, 
				options:options
			}));
		}
		
		// Trigger `sort` if the collection was sorted.
		if (sort)
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.SORT, 
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
		
		for (var i = 0, l = this._models.length; i < l; i++) 
		{
			this._removeReference(this._models[i]);
		}
		
		options.previousModels = this._models;
		
		this._reset();
		this.add(models, conbo.extend({silent: true}, options));
				
		if (!options.silent) 
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.RESET,
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
		this.add(model, conbo.extend({at: this.length}, options));
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
		this.add(model, conbo.extend({at: 0}, options));
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
		return this._models.slice(begin, end);
	},
	
	/**
	 * Get a model from the set by id.
	 */
	get: function(obj) 
	{
		if (obj == null) return undefined;
		this._idAttr || (this._idAttr = this.modelClass.prototype.idAttribute);
		return this._byId[obj.id || obj.cid || obj[this._idAttr] || obj];
	},

	/**
	 * Get the model at the given index.
	 */
	at: function(index) 
	{
		return this._models[index];
	},

	/**
	 * Return models with matching attributes. Useful for simple cases of `filter`.
	 */
	where: function(attrs, first) 
	{
		if (conbo.isEmpty(attrs)) return first ? undefined : [];
		
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
		if (conbo.isString(this.comparator) || this.comparator.length === 1) 
		{
			this._models = this.sortBy(this.comparator, this);
		}
		else 
		{
			this._models.sort(conbo.bind(this.comparator, this));
		}

		if (!options.silent) 
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.SORT,
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
		
		var iterator = conbo.isFunction(value) ? value : function(model) 
		{
			return model.get(value);
		};
		
		return conbo.sortedIndex(this._models, model, iterator, context);
	},

	/**
	 * Pluck an attribute from each model in the collection.
	 */
	pluck: function(attr)
	{
		return conbo.invoke(this._models, 'get', attr);
	},

	/**
	 * Fetch the default set of models for this collection, resetting the
	 * collection when they arrive. If `reset: true` is passed, the response
	 * data will be passed through the `reset` method instead of `set`.
	 */
	fetch: function(options) 
	{
		options = options ? conbo.clone(options) : {};
		
		if (options.parse === undefined) options.parse = true;
		
		var success = options.success;
		var collection = this;
		
		options.success = function(resp)
		{
			var method = options.reset ? 'reset' : 'set';
			
			collection[method](resp, options);
			
			if (success)
			{
				success(collection, resp, options);
			}
			
			collection.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.SYNC,
			{
				collection:	collection,
				response:	resp,
				options:	options
			}));
		};
		
		wrapError(this, options);
		
		return this.sync('read', this, options);
	},
		
	/**
	 * Create a new instance of a model in this collection. Add the model to the
	 * collection immediately, unless `wait: true` is passed, in which case we
	 * wait for the server to agree.
	 */
	create: function(model, options) 
	{
		options = options ? conbo.clone(options) : {};
		
		if (!(model = this._prepareModel(model, options))) return false;
		if (!options.wait) this.add(model, options);
		
		var collection = this;
		var success = options.success;
		
		options.success = function(resp) 
		{
			if (options.wait) collection.add(model, options);
			if (success) success(model, resp, options);
		};
		
		model.save(null, options);
		
		return model;
	},
		
	/**
	 * parse converts a response into a list of models to be added to the
	 * collection. The default implementation is just to pass it through.
	 */
	parse: function(resp, options) 
	{
		return resp;
	},

	/**
	 * Create a new collection with an identical list of models as this one.
	 */
	clone: function() 
	{
		return new this.constructor(this._models);
	},
	
	// List methods that aren't available on Collection
	
	splice: function()
	{
		throw new Error('splice is not available on conbo.Collection');
	},
	
	/**
	 * Private method to reset all internal state. Called when the collection
	 * is first initialized or reset.
	 */
	_reset: function() 
	{
		this.length = 0;
		this._models = [];
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
		
		var model = new this.modelClass(attrs, options);
		
		if (!model._validate(attrs, options)) 
		{
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.INVALID,
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
	 * Internal method to sever a model's ties to a collection.
	 */
	_removeReference: function(model) {
		if (this === model.collection) delete model.collection;
		model.removeEventListener('all', this._onModelEvent, this);
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
		
		this.dispatchEvent(event);
	},

	toString: function()
	{
		return 'conbo.Collection';
	}
});
