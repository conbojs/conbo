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
	 * Bind a property of a Bindable class instance (e.g. Hash or Model) 
	 * to a DOM element's value/content, using Conbo's best judgement to
	 * work out how the value should be bound to the element.
	 * 
	 * This method of binding also allows for the use of a parse function,
	 * which can be used to manipulate bound data in real time
	 * 
	 * @param 		{conbo.Bindable}	source				Class instance which extends from conbo.Bindable (e.g. Hash or Model)
	 * @param 		{String} 			propertyName		Property name to bind
	 * @param 		{DOMElement} 		element				DOM element to bind value to (two-way bind on input/form elements)
	 * @param 		{Function}			parseFunction		Optional method used to parse values before outputting as HTML
	 * 
	 * @deprecated						Use bindAttribute
	 * @see								bindAttribute
	 * @returns		{Array}									Array of bindings
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
		
		var bindings = [],
			eventType,
			eventHandler;
		
		parseFunction || (parseFunction = this.defaultParseFunction);
		
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
							
							eventType = 'change:'+propertyName;
							
							eventHandler = function(event)
							{
								$el.prop('checked', !!event.value);
							};
							
							source.on(eventType, eventHandler);
							bindings.push([source, eventType, eventHandler]);
							
							eventType = 'input change';
							
							eventHandler = function(event)
							{	
								source.set(propertyName, $el.is(':checked'));
							};
							
							$el.on(eventType, eventHandler);
							bindings.push([$el, eventType, eventHandler]);
							
							return;
						}
						
						case 'radio':
						{
							if ($el.val() == source.get(propertyName)) $el.prop('checked', true);
							
							eventType = 'change:'+propertyName;
							
							eventHandler = function(event)
							{
								if ($el.val() != event.value) return; 
								$el.prop('checked', true);
							};
							
							source.on(eventType, eventHandler);
							bindings.push([source, eventType, eventHandler]);
							
							break;
						}
						
						default:
						{
							$el.val(source.get(propertyName));
						
							eventType = 'change:'+propertyName;
							
							eventHandler = function(event)
							{
								if ($el.val() == event.value) return;
								$el.val(event.value);
							};
							
							source.on(eventType, eventHandler);
							bindings.push([source, eventType, eventHandler]);
							
							break;
						}
					}
					
					eventType = 'input change';
					
					eventHandler = function(event)
					{	
						source.set(propertyName, $el.val() || $el.html());
					};
					
					$el.on(eventType, eventHandler);
					bindings.push([$el, eventType, eventHandler]);
					
					break;
				}
				
				default:
				{
					$el.html(parseFunction(source.get(propertyName)));
					
					eventType = 'change:'+propertyName;
					
					eventHandler = function(event) 
					{
						var html = parseFunction(event.value);
						$el.html(html);
					};
					
					source.on(eventType, eventHandler);
					bindings.push([source, eventType, eventHandler]);
					
					break;
				}
			}
			
		});
		
		return bindings;
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
	 * @returns	{Array}								Array of bindings
	 */
	bindAttribute: function(source, propertyName, element, attributeName, parseFunction)
	{
		if (this._isReservedAttribute(attributeName))
		{
			return [];
		}
		
		if (!element)
		{
			throw new Error('element is undefined');
		}
		
		if (attributeName == "bind" || attributeName == "model")
		{
			return this.bindElement(source, propertyName, element, parseFunction);
		}
		
		var bindings = [],
			isConbo = false,
			isNative = false,
			eventType,
			eventHandler;
		
		var split = attributeName.replace(/([A-Z])/g, ' $1').toLowerCase().split(' ');
		
		switch (true)
		{
			case split[0] == 'attr':
			{
				attributeName = attributeName.substr(4);
				isNative = attributeName in element;
				break;
			}
			
			default:
			{
				isConbo = attributeName in conbo.AttributeBindings;
				isNative = !isConbo && attributeName in element;
			}
		}
		
		parseFunction || (parseFunction = this.defaultParseFunction);
		
		switch (true)
		{
			// If we have a bespoke handler for this attribute, use it
			case isConbo:
			{
				if (!(source instanceof conbo.Bindable))
				{
					throw new Error('Source is not Bindable');
				}
				
				eventHandler = function()
				{
					conbo.AttributeBindings[attributeName](parseFunction(source.get(propertyName)), element);
				}
				
				eventType = 'change:'+propertyName;
				
				source.on(eventType, eventHandler);
				eventHandler();
				
				bindings.push([source, eventType, eventHandler]);
				
				break;
			}
			
			case isNative:
			{
				switch (true)
				{
					case !attributeName.indexOf('on') == 0 && _.isFunction(element[attributeName]):
						console.warn('cb-'+attributeName+' is not a recognised attribute, did you mean cb-on'+attributeName+'?');
						break;
						
					// If it's an event, add a listener
					case attributeName.indexOf('on') == 0:
					{
						if (!_.isFunction(source[propertyName]))
						{
							throw new Error('DOM events can only be bound to functions');
						}
						
						$(element).on(attributeName.substr(2), source[propertyName]);
						return this;
					}
					
					// ... otherwise, bind to the native property
					default:
					{
						if (!(source instanceof conbo.Bindable))
						{
							throw new Error('Source is not Bindable');
						}
						
						eventHandler = function()
						{
							var value;
							
							value = parseFunction(source.get(propertyName));
							value = _.isBoolean(element[attributeName]) ? !!value : value;
							
							element[attributeName] = value;
						}
					    
						eventType = 'change:'+propertyName;
						source.on(eventType, eventHandler);
						eventHandler();
						
						bindings.push([source, eventType, eventHandler]);
						
						var $el = $(element);
						
						eventHandler = function()
		     			{
		     				source.set(propertyName, element[attributeName]);
		     			};
						
		     			eventType = 'input change';
						$el.on(eventType, eventHandler);
						
						bindings.push([$el, eventType, updateSource]);
						
						break;
					}
				}
				
				break;
			}
			
			default:
			{
				console.warn('cb-'+attributeName+' is not recognised or does not exist on specified element');
				break;
			}
		}
		
		return bindings;
	},
	
	/**
	 * Bind everything within the DOM scope of a View to the specified 
	 * properties of Bindable class instances (e.g. Hash or Model)
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
		
		if (!!view._bindings)
		{
			this.unbindView(view);
		}
		
		var bindings = [],
			nestedViews = view.$('.cb-view, [cb-view]'),
			scope = this;
		
		view.$('*').add(view.$el).filter(function()
		{
			return !nestedViews.find(this).length;
		})
		.each(function(index, el)
		{
			var cbData = $(el).cbData();
			
			if (!cbData) 
			{
				return;
			}
			
			var keys = _.keys(cbData);
			
			keys.forEach(function(key)
			{
				if (scope._isReservedAttribute(key))
				{
					return;
				}
				
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
				
				bindings = bindings.concat(scope.bindAttribute(m, p, el, key, f));
			});
		});
		
		view._bindings = bindings;
		
		return this;
	},
	
	/**
	 * Removes all data binding from the specified View instance
	 * @param 	{conbo.View}	view
	 * @return	{this}
	 */
	unbindView: function(view)
	{
		if (!view)
		{
			throw new Error('view is undefined');
		}
		
		if (!view._bindings || !view._bindings.length)
		{
			return this;
		}
		
		var bindings = view._bindings;
		
		while (bindings.length)
		{
			var binding = bindings.pop();
			
			switch (true)
			{
				case binding[0] instanceof $:
				case binding[0] instanceof conbo.EventDispatcher:
				{
					binding[0].off(binding[1], binding[2]);
					break;
				}
				
				default:
				{
					binding[0].removeEventListener(binding[1], binding[2]);
					break;
				}
			}
		}
		
		delete view._bindings;
		
		return this;
	},
	
	/**
	 * Bind the property of one Bindable class instance (e.g. Hash or Model) to another
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
	 * class instance (e.g. Hash or Model) is changed
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
			if (!setterFunction || !(propertyName in setterFunction))
			{
				throw new Error('Invalid setter function');
			}
			
			setterFunction = setterFunction[propertyName];
		}
		
		source.on('change:'+propertyName, function(event)
		{
			setterFunction(event.value);
		});
		
		return this;
	},
	
	/**
	 * Default parse function
	 * 
	 * @param	value
	 * @returns	{any}
	 */
	defaultParseFunction: function(value)
	{
		return typeof(value) == 'undefined' ? '' : value;
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
		return this._reservedAttributes.indexOf(value) != -1;
	}
	
});
