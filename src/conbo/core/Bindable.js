/**
 * Bindable
 * 
 * Base class for anything that you want to be able to use as a data provider for HTML,
 * e.g. as part of a View, or otherwise be able to track property changes on
 * 
 * By default, classes extending Bindable will trigger 'change:[name]' and 
 * 'change' events when a property that flagged as bindable using the bindable('name') 
 * method is changed or is changed via the set('name', value) method.
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
	 * @param	(String)	propName
	 */
	bindable: function(propName)
	{
		var propNames = arguments.length > 0
			? conbo.toArray(arguments)
			: conbo.keys(this);
		
		propNames.forEach(function(propName)
		{
			if (conbo.isDefinedProperty(this, propName)) return;
			
			var value = this[propName];
			
			conbo.defineProperty
			(
				this, 
				propName,
				
				function()
				{
					return value;
				},
				
				function(newValue) 
				{
					if (value === newValue) return;
					value = newValue;
  					this.dispatchChangeEvent(propName, {attribute:propName, model:this, value:value});
				}
			);
			
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
		return this[attribute];
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
	set: function(attribute, value)
	{
		if (conbo.isObject(attribute))
		{
			conbo.each(attribute, function(value, key) { this.set(key, value); }, this);
			return this;
		}
		
		// We're assuming defined values will dispatch their own change events
		if (this[attribute] === value || conbo.isDefinedProperty(this, attribute))
		{
			return this;
		}
		
		this[attribute] = value;
		this.dispatchChangeEvent(attribute, {attribute:attribute, value:value});
		
		return this;
	},
	
	/**
	 * Delete a property and dispatch a change:[propertyName] event
	 * @param 	value
	 * @returns	this
	 */
	unset: function(attribute)
	{
		delete this[attribute];
		this.dispatchChangeEvent(attribute)
		return this;
	},
	
	dispatchChangeEvent: function(attribute, options)
	{
		options || (options = {attribute:attribute, value:this.get('attribute'), options:{}});
		
		this.dispatchEvent(new conbo.ConboEvent('change:'+attribute, options));
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE, options));
	},
	
	toString: function()
	{
		return 'conbo.Bindable';
	}
});

conbo.denumerate(conbo.Bindable.prototype);
