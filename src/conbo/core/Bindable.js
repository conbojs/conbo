/**
 * Bindable
 * 
 * Base class for anything that you want to be able to use as a data provider for HTML,
 * e.g. as part of a View, or otherwise be able to track property changes on
 * 
 * By default, classes extending Bindable will trigger 'change:[property name]' and 
 * 'change' events when a property (including jQuery-style accessors) is changed
 * via the set(...) method
 * 
 * @author		Neil Rackett
 */
conbo.Bindable = conbo.EventDispatcher.extend
({
	/**
	 * Create one or more property on this object that can be bound
	 * without using the get or set methods; if no property names are
	 * passed, all existing properties will be made bindable
	 * 
	 * TODO Resolve double change event when using set(propName) syntax
	 * 
	 * @param	(String)	propName
	 */
	bindable: function(propName)
	{
		var a = conbo.result(this, '_attributes');
		
		var propNames = arguments.length > 0
			? conbo.toArray(arguments)
			: conbo.keys(a);
		
		propNames.forEach(function(propName)
		{
			var aName = a == this
				? '__'+propName
				: propName;
			
			var currentValue = a[propName];
			
			conbo.defineProperty
			(
				this, 
				propName,
				
				function()
				{
					return a[aName];
				},
				
				function(value) 
				{
					if (a[aName] == value) return;
					
					var options = {attribute:propName, model:this, value:value};
					
					a[aName] = value;
					this.dispatchEvent(new conbo.ConboEvent('change:'+propName, options));
					this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE, options));
				}
			);
			
			a[aName] = currentValue;
			
		}, this);
		
		return this;
	},
	
	/**
	 * Get the value of a property
	 * @param	attribute
	 * @example	instance.get('n');
	 * @returns
	 */
	get: function(attribute)
	{
		var a = conbo.result(this, '_attributes');
		return conbo.result(a, attribute);
	},
	
	/**
	 * Set the value of one or more property and dispatch a change:[propertyName] event
	 * 
	 * Event handlers, in line with conbo.Model change:[propertyName] handlers, 
	 * should be in the format handler(source, value) {...}
	 * 
	 * @param 	attribute
	 * @param 	value
	 * @param 	options
	 * @example	instance.set('n', 123);
	 * @example	instance.set({n:123, s:'abc'});
	 * @returns	this
	 */
	set: function(attribute, value, options)
	{
		if (conbo.isObject(attribute))
		{
			conbo.each(attribute, function(value, key) { this.set(key, value, options); }, this);
			return this;
		}
		
		var a = conbo.result(this, '_attributes'),
			changed = false;
		
		options || (options = {});
		
		var changeHandler = function(event)
		{
			if (event.attribute == attribute)
			{
				changed = false;
			}
		};
		
		// Prevents change events being fired twice when setting bindable properties
		this.addEventListener('change:'+attribute, changeHandler);
		
		if (options.unset)
		{
			changed = (attribute in a);
			delete a[attribute];
		}
//		else if (conbo.isFunction(a[attribute]))
//		{
//			if (a[attribute]() !== value)
//			{
//				a[attribute](value);
//				changed = true;
//			}
//		}
		else if (a[attribute] != value)
		{
			changed = true;
			a[attribute] = value;
		}
		
		if (changed && !options.silent)
		{
			var options = {attribute:attribute, value:value, options:options};
			
			this.dispatchEvent(new conbo.ConboEvent('change:'+attribute, options));
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE, options));
		}
		
		this.removeEventListener('change:'+attribute, changeHandler);
		
		return this;
	},
	
	/**
	 * Delete a property and dispatch a change:[propertyName] event
	 * @param 	value
	 * @returns	this
	 */
	unset: function(value, options)
	{
		options = conbo.defaults({unset:true}, options);
		return this.set(value, undefined, options);
	},
	
	toString: function()
	{
		return 'conbo.Bindable';
	},
	
	/**
	 * The object containing the properties you can get/set,
	 * which defaults to this
	 * 
	 * @private
	 * @returns	Object
	 */
	_attributes: function()
	{
		return this;
	}
});
