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
	 * @param 		{conbo.Bindable}	source			Class instance which extends from conbo.Bindable (e.g. Hash or Model)
	 * @param 		{String} 			propertyName	Property name to bind
	 * @param 		{DOMElement} 		element			DOM element to bind value to (two-way bind on input/form elements)
	 * @param 		{Function}			parseFunction	Optional method used to parse values before outputting as HTML
	 * 
	 * @deprecated						Use bindAttribute
	 * @see								bindAttribute
	 * @returns		{this}
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
	 * @param 	{conbo.Bindable}	source			Class instance which extends from conbo.Bindable (e.g. Hash or Model)
	 * @param 	{String}			propertyName	Property name to bind
	 * @param 	{DOMElement}		element			DOM element to bind value to (two-way bind on input/form elements)
	 * @param 	{String}			attributeName	The cb-* property to bind against in camelCase, e.g. "propName" for "cb-prop-name"
	 * @param 	{Function} 			parseFunction	Optional method used to parse values before outputting as HTML
	 * 
	 * @returns	{this}
	 */
	bindAttribute: function(source, propertyName, element, attributeName, parseFunction)
	{
		if (this._isReservedAttribute(attributeName))
		{
			return this;
		}
		
		var isProperty = attributeName in conbo.AttributeBindings,
			isEvent = 'on'+attributeName in element,
			isNative = attributeName in element,
			updateAttribute;
		
		if (!isProperty && isEvent && !_.isFunction(source[propertyName]))
		{
			throw new Error('DOM events can only be bound to functions');
		}
		
		if (!isEvent && !(source instanceof conbo.Bindable))
		{
			throw new Error('Source is not Bindable');
		}
		
		if (!element)
		{
			throw new Error('element is undefined');
		}
		
		if (attributeName == "bind" || attributeName == "model")
		{
			this.bindElement(source, propertyName, element, parseFunction);
			return this;
		}
		
		parseFunction = parseFunction || function(value)
		{
			return value; 
		};
		
		switch (true)
		{
			// If we have a bespoke handler for this attribute, use it
			case isProperty:
			{
				updateAttribute = function()
				{
					conbo.AttributeBindings[attributeName](parseFunction(source.get(propertyName)), element);
				}
				
				source.on('change:'+propertyName, updateAttribute);
				updateAttribute();
				
				break;
			}
			
			// ... if it's an event, add a listener
			case isEvent:
			{
				$(element).on(attributeName.toLowerCase(), source[propertyName]);
				return this;
			}
			
			// ... otherwise, bind directly to the native property if there is one
			case isNative:
			{
				updateAttribute = function()
				{
					var value;
					
					value = parseFunction(source.get(propertyName));
					value = _.isBoolean(element[attributeName]) ? !!value : value;
					
					element[attributeName] = value;
				}
			    
				source.on('change:'+propertyName, updateAttribute);
				updateAttribute();
				
				break;
			}
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
	 * @param 	{conbo.View}		view		The View class controlling the element
	 * @returns	{this}
	 */
	bindView: function(view)
	{
		if (!view)
		{
			throw new Error('view is undefined');
		}
		
		var nestedViews = view.$('.cb-view, [cb-view]'),
			scope = this;
		
		view.$('*').filter(function()
		{
			return !nestedViews.find(this).length;
		})
		.each(function(index, el)
		{
			var cbData = $(el).cbData();
			if (!cbData) return;
			
			var keys = _.keys(cbData);
			
			keys.forEach(function(key)
			{
				var d = cbData[key],
					b = d.split('|'),
					s = scope.cleanPropertyName(b[0]).split('.'),
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
					f = !!b[1] ? eval('view.'+scope.cleanPropertyName(b[1])) : undefined;
					f = _.isFunction(f) ? f : undefined;
				}
				catch (e) {}
				
				if (!m) throw new Error(b[0]+' is not defined in this View');
				if (!p) throw new Error('Unable to bind to undefined property: '+p);
				
				scope.bindAttribute(m, p, el, key, f);
				
			}, view);
		});
	},
	
	/**
	 * Bind the property of one Bindable class instance (e.g. Map or Model) to another
	 * 
	 * @param 	{conbo.Bindable}	source						Class instance which extends conbo.Bindable
	 * @param 	{String}			sourcePropertyName			Source property name
	 * @param 	{any}				destination					Object or class instance which extends conbo.Bindable
	 * @param 	{String}			destinationPropertyName		Optional (default: sourcePropertyName)
	 * @param 	{Boolean}			twoWay						Optional (default: false)
	 * 
	 * @returns	{this}
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
	 * @param 	{conbo.Bindable}	source				Class instance which extends conbo.Bindable
	 * @param 	{String}			propertyName
	 * @param 	{Function}			setterFunction
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
	
	/**
	 * Remove everything except alphanumberic and dots from Strings
	 * 
	 * @private
	 * @param 		{String}	view		String value to clean
	 * @returns		{String}
	 */
	cleanPropertyName: function(value)
	{
		return (value || '').replace(/[^\w\.]/g, '');
	},
	
	toString: function()
	{
		return 'conbo.BindingUtils';
	},
	
	/**
	 * Reserved attributes
	 * @private
	 */
	_reservedAttributes: ['app', 'view'],
	
	/**
	 * Is the specified attribute reserved for another purpose?
	 * 
	 * @private
	 * @param 		{String}	value
	 * @returns		{Boolean}
	 */
	_isReservedAttribute: function(value)
	{
		this._reservedAttributes.indexOf(value) != -1;
	}
	
});
