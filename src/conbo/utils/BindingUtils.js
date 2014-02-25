/**
 * Binding utility class
 * 
 * Used to bind properties of Bindable class instances to DOM elements, 
 * other Bindable class instances or setter functions
 * 
 * @author Neil Rackett
 */
conbo.BindingUtils = conbo.Class.extend({},
{
	/**
	 * Bind a property of a Bindable class instance (e.g. Map or Model) 
	 * to a DOM element's value/content, using Conbo's best judgement to
	 * work out how the value should be bound to the element.
	 * 
	 * This method of binding also allows for the use of a parse function,
	 * which can be used to manipulate bound data in real time
	 * 
	 * @param source			Class instance which extends from conbo.Bindable (e.g. Hash or Model)
	 * @param property			Property name to bind
	 * @param element			DOM element to bind value to (two-way bind on input/form elements)
	 * @param parseFunction		Optional method used to parse values before outputting as HTML
	 */
	bindElement: function(source, propertyName, element, parseFunction)
	{
		if (!(source instanceof conbo.Bindable))
		{
			throw new Error('Source is not Bindable');
		}
		
		if (!element)
		{
			throw new Error('element is undefined');
		}
		
		parseFunction = parseFunction || function(value)
		{
			return typeof(value) == 'undefined' ? '' : String(value); 
		};
		
		$(element).each(function(index, el)
		{
			var $el = $(el);
			var tagName = $el[0].tagName;
			
			switch (tagName)
			{
				case 'INPUT':
				case 'SELECT':
				case 'TEXTAREA':
				{	
					var type = ($el.attr('type') || tagName).toLowerCase();
					
					switch (type)
					{
						case 'checkbox':
						{
							$el.prop('checked', !!source.get(propertyName));
							
							source.on('change:'+propertyName, function(event)
							{
								$el.prop('checked', !!event.value);
							});
							
							$el.on('input change', function(event)
							{	
								source.set(propertyName, $el.is(':checked'));
							});
							
							return;
						}
						
						case 'radio':
						{
							if ($el.val() == source.get(propertyName)) $el.prop('checked', true);
							
							source.on('change:'+propertyName, function(event)
							{
								if ($el.val() != event.value) return; 
								$el.prop('checked', true);
							});
							
							break;
						}
						
						default:
						{
							$el.val(source.get(propertyName));
						
							source.on('change:'+propertyName, function(event)
							{
								if ($el.val() == event.value) return;
								$el.val(event.value);
							});
							
							break;
						}
					}
					
					$el.on('input change', function(event)
					{	
						source.set(propertyName, $el.val() || $el.html());
					});
					
					break;
				}
				
				default:
				{
					$el.html(parseFunction(source.get(propertyName)));
					
					source.on('change:'+propertyName, function(event) 
					{
						var html = parseFunction(event.value);
						$el.html(html);
					});
					
					break;
				}
			}
			
		});
		
		return this;
	},
	
	/**
	 * Bind a DOM element to the property of a Bindable class instance,
	 * e.g. Hash or Model, using cb-* attributes to specify how the binding
	 * should be made.
	 * 
	 * Two way bindings will automatically be applied where the attribute name 
	 * matches a property on the target element, meaning your Bindable object 
	 * will automatically be updated when the property changes.
	 * 
	 * @param source			Class instance which extends from conbo.Bindable (e.g. Hash or Model)
	 * @param property			Property name to bind
	 * @param element			DOM element to bind value to (two-way bind on input/form elements)
	 * @param attributeName		The cb-* property to bind against in camelCase, e.g. "propName" for "cb-prop-name"
	 */
	bindAttribute: function(source, propertyName, element, attributeName)
	{
		if (!(source instanceof conbo.Bindable))
		{
			throw new Error('Source is not Bindable');
		}
		
		if (!element)
		{
			throw new Error('element is undefined');
		}
		
		var isConbo = conbo.AttributeBindings.hasOwnProperty(attributeName),
			isNative = element.hasOwnProperty(attributeName),
			updateAttribute;
		
		// If we have a bespoke handler for this attribute, use it
		if (isConbo)
		{
			updateAttribute = function()
			{
				conbo.AttributeBindings[attributeName](source.get(propertyName), element);
			}
			
			source.on('change:'+propertyName, updateAttribute);
			updateAttribute();
		}
		// ... otherwise, bind directly to the native property if there is one
		else if (isNative)
		{
			updateAttribute = function()
			{
				var value = _.isBoolean(element[attributeName])
					? !!source.get(propertyName)
					: source.get(propertyName);
				
				element[attributeName] = value;
			}
		             			
			source.on('change:'+propertyName, updateAttribute);
			updateAttribute();
		}
		
		// If it's a native property, add a reverse binding too
		if (isNative)
		{
			$(element).on('input change', function()
   			{
   				source.set(propertyName, element[attributeName]);
   			});
		}
		
		return this;
	},
	
	/**
	 * Bind everything within the DOM scope of a View to the specified 
	 * properties of Bindable class instances (e.g. Map or Model)
	 * 
	 * @param source			Class instance which extends from conbo.Bindable (e.g. Hash or Model)
	 * @param property			Property name to bind
	 * @param view				The View class controlling the element
	 */
	bindView: function(view)
	{
		if (!view)
			throw new Error('view is undefined');
		
		var nestedViews = view.$('.cb-view'),
			scope = this;
		
		/*
		 * Apply bindElement
		 */
		
		view.$('[cb-bind]').filter(function()
		{
			return !nestedViews.find(this).length;
		})
		.each(function(index, el)
		{
			var d = view.$(el).cbData().bind,
				b = d.split('|'),
				s = scope._cleanPropName(b[0]).split('.'),
				p = s.pop(),
				m,
				f;
			
			try
			{
				m = !!s.length ? eval('view.'+s.join('.')) : view;
			}
			catch (e) {}
			
			try
			{
				f = !!b[1] ? eval('view.'+scope._cleanPropName(b[1])) : undefined;
				f = _.isFunction(f) ? f : undefined;
			}
			catch (e) {}
			
			if (!m) throw new Error(b[0]+' is not defined in this View');
			if (!p) throw new Error('Unable to bind to undefined property');
			
			scope.bindElement(m, p, el, f);
		});
		
		/*
		 * Apply bindAttribute
		 */
		
		view.$('*').each(function(index, el)
		{
			if (nestedViews.find(el).length) return;
			
			var cbData = $(el).cbData();
			if (!cbData) return;
			
			var keys = _.keys(cbData);
			
			keys.forEach(function(key)
			{
				//if (availableAttributes.indexOf(key) == -1) return;
				
				var d = cbData[key],
					s = scope._cleanPropName(d).split('.'),
					p = s.pop(),
					m;
			
				try
				{
					m = !!s.length ? eval('view.'+s.join('.')) : view;
				}
				catch (e) {}
				
				if (!m) throw new Error(b[0]+' is not defined in this View');
				if (!p) throw new Error('Unable to bind to undefined property: '+p);
				
				scope.bindAttribute(m, p, el, key);
				
			}, view);
		});
	},
	
	/**
	 * Remove everything except alphanumberic and dots from Strings
	 * 
	 * @private
	 * @param 		value
	 * @returns		String
	 */
	_cleanPropName: function(value)
	{
		return (value || '').replace(/[^\w\.]/g, '');
	},
	
	/**
	 * Bind the property of one Bindable class instance (e.g. Map or Model) to another
	 * 
	 * @param source					Class instance which extends conbo.Bindable
	 * @param sourcePropertyName		String
	 * @param destination				Object or class instance which extends conbo.Bindable
	 * @param destinationPropertyName	String (default: sourcePropertyName)
	 * @param twoWay					Boolean (default: false)
	 */
	bindProperty: function(source, sourcePropertyName, destination, destinationPropertyName, twoWay)
	{
		if (!(source instanceof conbo.Bindable)) throw new Error('Source is not Bindable');
		
		destinationPropertyName || (destinationPropertyName = sourcePropertyName);
		
		source.on('change:'+sourcePropertyName, function(event)
		{
			if (!(destination instanceof conbo.Bindable))
			{
				destination[destinationPropertyName] = event.value;
				return;
			}
			
			destination.set(destinationPropertyName, event.value);
		});
		
		if (twoWay && destination instanceof conbo.Bindable)
		{
			this.bindProperty(destination, destinationPropertyName, source, sourcePropertyName);
		}
		
		return this;
	},
	
	/**
	 * Call a setter function when the specified property of a Bindable 
	 * class instance (e.g. Map or Model) is changed
	 * 
	 * @param source			Class instance which extends from conbo.Bindable
	 * @param propertyName
	 * @param setterFunction
	 */
	bindSetter: function(source, propertyName, setterFunction)
	{
		if (!(source instanceof conbo.Bindable)) throw new Error('Source is not Bindable');
		
		if (!_.isFunction(setterFunction))
		{
			if (!setterFunction || !_.has(setterFunction, propertyName)) throw new Error('Invalid setter function');
			setterFunction = setterFunction[propertyName];
		}
		
		source.on('change:'+propertyName, function(event)
		{
			setterFunction(event.value);
		});
		
		return this;
	},
	
	toString: function()
	{
		return 'conbo.BindingUtils';
	}
});
