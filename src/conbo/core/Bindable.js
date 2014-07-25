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
	 * @param 	attributes
	 * @param 	value
	 * @param 	options
	 * @example	instance.set('n', 123);
	 * @example	instance.set({n:123, s:'abc'});
	 * @returns	this
	 */
	set: function(attributes, value, options)
	{
		if (conbo.isObject(attributes))
		{
			conbo.each(attributes, function(value, key) { this.set(key, value, options); }, this);
			return this;
		}
		
		var a = conbo.result(this, '_attributes'),
			changed = false;
		
		options || (options = {silent:false});
		
		if (options.unset)
		{
			changed = (attributes in a);
			delete a[attributes];
		}
		else if (conbo.isFunction(a[attributes]))
		{
			if (a[attributes]() !== value)
			{
				a[attributes](value);
				changed = true;
			}
		}
		else if (a[attributes] != value)
		{
			a[attributes] = value;
			changed = true;
		}
		
		if (changed && !options.silent)
		{
			var options = {attribute:attributes, value:value, options:options};
			
			this.dispatchEvent(new conbo.ConboEvent('change:'+attributes, options));
			this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE, options));
		}
		
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
	 * @returns	Object
	 */
	_attributes: function()
	{
		return this;
	}
});
