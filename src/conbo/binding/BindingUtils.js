(function()
{
	var BindingUtils__cbAttrs = new conbo.AttributeBindings();
	var BindingUtils__customAttrs = {};
	var BindingUtils__reservedAttrs = ['cb-app', 'cb-view', 'cb-glimpse', 'cb-content'];
	var BindingUtils__reservedNamespaces = ['cb', 'data', 'aria'];
	var BindingUtils__registeredNamespaces = ['cb'];
	
	/**
	 * Set the value of a property, ensuring Numbers are types correctly
	 * 
	 * @private
	 * @param 	propertyName
	 * @param 	value
	 * @example	BindingUtils__set.call(target, 'n', 123);
	 * @returns	this
	 */
	var BindingUtils__set = function(propertyName, value)
	{
		if (this[propertyName] === value)
		{
			return this;
		}
		
		// Ensure numbers are returned as Number not String
		if (value && conbo.isString(value) && !isNaN(value))
		{
			value = parseFloat(value);
			if (isNaN(value)) value = '';
		}
		
		this[propertyName] = value;
		
		return this;
	};
	
	/**
	 * Is the specified attribute reserved for another purpose?
	 * 
	 * @private
	 * @param 		{String}	value
	 * @returns		{Boolean}
	 */
	var BindingUtils__isReservedAttr = function(value)
	{
		return BindingUtils__reservedAttrs.indexOf(value) != -1;
	};
	
	/**
	 * Attempt to make a property bindable if it isn't already
	 * 
	 * @private
	 * @param 		{String}	value
	 * @returns		{Boolean}
	 */
	var BindingUtils__makeBindable = function(source, propertyName)
	{
		if (!conbo.isAccessor(source, propertyName))
		{
			if (source instanceof conbo.EventDispatcher)
			{
				conbo.makeBindable(source, [propertyName]);
			}
			else
			{
				conbo.warn('It will not be possible to detect changes to "'+propertyName+'" because "'+source.toString()+'" is not an EventDispatcher');
			}
		}
	}
	
	/**
	 * Remove everything except alphanumeric, dot, space and underscore 
	 * characters from Strings
	 * 
	 * @private
	 * @param 		{String}	value - String value to clean
	 * @returns		{String}
	 */
	var BindingUtils__cleanPropertyName = function(value)
	{
		return (value || '').trim().replace(/[^\w\._\s]/g, '');
	};
	
	/**
	 * Binding utility class
	 * 
	 * Used to bind properties of EventDispatcher class instances to DOM elements, 
	 * other EventDispatcher class instances or setter functions
	 * 
	 * @class		conbo.BindingUtils
	 * @augments	conbo.Class
	 * @author 		Neil Rackett
	 */
	conbo.BindingUtils = conbo.Class.extend({},
	/** @lends conbo.BindingUtils */
	{
		/**
		 * Bind a property of a EventDispatcher class instance (e.g. Hash or View) 
		 * to a DOM element's value/content, using Conbo's best judgement to
		 * work out how the value should be bound to the element.
		 * 
		 * This method of binding also allows for the use of a parse function,
		 * which can be used to manipulate bound data in real time
		 * 
		 * @param 		{conbo.EventDispatcher}	source			Class instance which extends from conbo.EventDispatcher
		 * @param 		{String} 				propertyName	Property name to bind
		 * @param 		{DOMElement} 			el				DOM element to bind value to (two-way bind on input/form elements)
		 * @param 		{Function}				parseFunction	Optional method used to parse values before outputting as HTML
		 * 
		 * @returns		{Array}									Array of bindings
		 */
		bindElement: function(source, propertyName, el, parseFunction)
		{
			var isEventDispatcher = source instanceof conbo.EventDispatcher;
			
			if (!el)
			{
				throw new Error('el is undefined');
			}
			
			BindingUtils__makeBindable(source, propertyName);
			
			var scope = this;
			var bindings = [];
			var eventType;
			var eventHandler;
			
			parseFunction || (parseFunction = this.defaultParseFunction);
			
			var ep = new conbo.EventProxy(el);
			var tagName = el.tagName;
			
			switch (tagName)
			{
				case 'INPUT':
				case 'SELECT':
				case 'TEXTAREA':
				{	
					var type = (el.type || tagName).toLowerCase();
					
					switch (type)
					{
						case 'checkbox':
						{
							el.checked = !!source[propertyName];
							
							if (isEventDispatcher)
							{
								eventType = 'change:'+propertyName;
								
								eventHandler = function(event)
								{
									el.checked = !!event.value;
								};
								
								source.addEventListener(eventType, eventHandler);
								bindings.push([source, eventType, eventHandler]);
							}
							
							eventType = 'input change';
							
							eventHandler = function(event)
							{
								BindingUtils__set.call(source, propertyName, el.checked);
							};
							
							ep.addEventListener(eventType, eventHandler);
							bindings.push([ep, eventType, eventHandler]);
							
							return;
						}
						
						case 'radio':
						{
							if (el.value == source[propertyName]) 
							{
								el.checked = true;
							}
							
							if (isEventDispatcher)
							{
								eventType = 'change:'+propertyName;
								
								eventHandler = function(event)
								{
									if (event.value == null) event.value = '';
									if (el.value != event.value) return; 
									
									el.checked = true;
								};
								
								source.addEventListener(eventType, eventHandler);
								bindings.push([source, eventType, eventHandler]);
							}
							
							break;
						}
						
						default:
						{
							var setVal = function() 
							{
								el.value = source[propertyName]; 
							};
							
							// Resolves issue with cb-repeat inside <select>
							if (type == 'select') conbo.defer(setVal);
							else setVal();
							
							if (isEventDispatcher)
							{
								eventType = 'change:'+propertyName;
								
								eventHandler = function(event)
								{
									if (event.value == null) event.value = '';
									if (el.value == event.value) return;
									
									el.value = event.value;
								};
								
								source.addEventListener(eventType, eventHandler);
								bindings.push([source, eventType, eventHandler]);
							}
							
							break;
						}
					}
					
					eventType = 'input change';
					
					eventHandler = function(event)
					{
						BindingUtils__set.call(source, propertyName, el.value === undefined ? el.innerHTML : el.value);
					};
					
					ep.addEventListener(eventType, eventHandler);
					bindings.push([ep, eventType, eventHandler]);
					
					break;
				}
				
				default:
				{
					el.innerHTML = parseFunction(source[propertyName]);
					
					if (isEventDispatcher)
					{
						eventType = 'change:'+propertyName;
						
						eventHandler = function(event) 
						{
							var html = parseFunction(event.value);
							el.innerHTML = html;
						};
						
						source.addEventListener(eventType, eventHandler);
						bindings.push([source, eventType, eventHandler]);
					}
					
					break;
				}
			}
			
			return bindings;
		},
		
		/**
		 * Unbinds the specified property of a bindable class from the specified DOM element
		 * 
		 *  @param	el		DOM element
		 *  @param	view	View class
		 */
		unbindElement: function(source, propertyName, element)
		{
			// TODO Implement unbindElement
		},
		
		/**
		 * Bind a DOM element to the property of a EventDispatcher class instance,
		 * e.g. Hash or Model, using cb-* attributes to specify how the binding
		 * should be made.
		 * 
		 * Two way bindings will automatically be applied where the attribute name 
		 * matches a property on the target element, meaning your EventDispatcher object 
		 * will automatically be updated when the property changes.
		 * 
		 * @param 	{conbo.EventDispatcher}	source			Class instance which extends from conbo.EventDispatcher (e.g. Hash or Model)
		 * @param 	{String}				propertyName	Property name to bind
		 * @param 	{DOMElement}			element			DOM element to bind value to (two-way bind on input/form elements)
		 * @param 	{String}				attributeName	The attribute to bind as it appears in HTML, e.g. "cb-prop-name"
		 * @param 	{Function} 				parseFunction	Method used to parse values before outputting as HTML (optional)
		 * @param	{Object}				options			Options related to this attribute binding (optional)
		 * 
		 * @returns	{Array}					Array of bindings
		 */
		bindAttribute: function(source, propertyName, element, attributeName, parseFunction, options)
		{
			var bindings = [];
			
			if (BindingUtils__isReservedAttr(attributeName))
			{
				return bindings;
			}
			
			if (!element)
			{
				throw new Error('element is undefined');
			}
			
			var split = attributeName.split('-'),
				hasNs = split.length > 1
				;
			
			if (!hasNs)
			{
				return bindings;
			}
			
			if (attributeName == "cb-bind")
			{
				return this.bindElement(source, propertyName, element, parseFunction);
			}
			
			BindingUtils__makeBindable(source, propertyName);
			
			var scope = this,
				eventType,
				eventHandler,
				args = conbo.toArray(arguments).slice(5),
				camelCase = conbo.toCamelCase(attributeName),
				ns = split[0],
				isConboNs = (ns == 'cb'),
				isConbo = isConboNs && camelCase in BindingUtils__cbAttrs,
				isCustom = !isConbo && camelCase in BindingUtils__customAttrs,
				isNative = isConboNs && split.length == 2 && split[1] in element,
				attrFuncs = BindingUtils__cbAttrs
				;
			
			parseFunction || (parseFunction = this.defaultParseFunction);
			
			switch (true)
			{
				// If we have a bespoke handler for this attribute, use it
				case isCustom:
					attrFuncs = BindingUtils__customAttrs;
				
				case isConbo:
				{
					if (!(source instanceof conbo.EventDispatcher))
					{
						conbo.warn('Source is not EventDispatcher');
						return this;
					}
					
					var fn = attrFuncs[camelCase];
					
					if (fn.raw)
					{
						fn.apply(attrFuncs, [element, propertyName].concat(args));
					}
					else
					{
						eventHandler = function(event)
						{
							fn.apply(attrFuncs, [element, parseFunction(source[propertyName])].concat(args));
						};
						
						eventType = 'change:'+propertyName;
						
						source.addEventListener(eventType, eventHandler);
						eventHandler();
						
						bindings.push([source, eventType, eventHandler]);
					}
					
					break;
				}
				
				case isNative:
				{
					var nativeAttr = split[1];
					
					switch (true)
					{
						case nativeAttr.indexOf('on') !== 0 && conbo.isFunction(element[nativeAttr]):
						{
							conbo.warn(attributeName+' is not a recognised attribute, did you mean cb-on'+nativeAttr+'?');
							break;
						}
						
						// If it's an event, add a listener
						case nativeAttr.indexOf('on') === 0:
						{
							if (!conbo.isFunction(source[propertyName]))
							{
								conbo.warn(propertyName+' is not a function and cannot be bound to DOM events');
								return this;
							}
							
							eventType = nativeAttr.substr(2);
							eventHandler = source[propertyName];
							
							element.addEventListener(eventType, eventHandler);
							bindings.push([element, eventType, eventHandler]);
							
							break;
						}
						
						// ... otherwise, bind to the native property
						default:
						{
							if (!(source instanceof conbo.EventDispatcher))
							{
								conbo.warn('Source is not EventDispatcher');
								return this;
							}
							
							eventHandler = function()
							{
								var value;
								
								value = parseFunction(source[propertyName]);
								value = conbo.isBoolean(element[nativeAttr]) ? !!value : value;
								
								element[nativeAttr] = value;
							};
						    
							eventType = 'change:'+propertyName;
							source.addEventListener(eventType, eventHandler);
							eventHandler();
							
							bindings.push([source, eventType, eventHandler]);
							
							var ep = new conbo.EventProxy(element);
							
							eventHandler = function()
			     			{
								BindingUtils__set.call(source, propertyName, element[nativeAttr]);
			     			};
							
			     			eventType = 'input change';
							ep.addEventListener(eventType, eventHandler);
							
							bindings.push([ep, eventType, eventHandler]);
							
							break;
						}
					}
					
					break;
				}
				
				default:
				{
					conbo.warn(attributeName+' is not recognised or does not exist on specified element');
					break;
				}
			}
			
			return bindings;
		},
		
		/**
		 * Applies the specified read-only Conbo or custom attribute to the specified element
		 * 
		 * @param 	{DOMElement}			element			DOM element to bind value to (two-way bind on input/form elements)
		 * @param 	{String}				attributeName	The attribute to bind as it appears in HTML, e.g. "cb-prop-name"
		 * @returns	{conbo.BindingUtils}	A reference to this object 
		 * 
		 * @example
		 * conbo.BindingUtils.applyAttribute(el, "my-custom-attr");
		 */
		applyAttribute: function(element, attributeName)
		{
			if (this.attributeExists(attributeName))
			{
				var camelCase = conbo.toCamelCase(attributeName),
					ns = attributeName.split('-')[0],
					attrFuncs = (ns == 'cb') ? BindingUtils__cbAttrs : BindingUtils__customAttrs,
					fn = attrFuncs[camelCase]
					;
				
				if (fn.readOnly)
				{
					fn.call(attrFuncs, element);
				}
				else
				{
					conbo.warn(attr+' attribute cannot be used without a value');
				}
				
				return this;
			}
			
			conbo.warn(attr+' attribute does not exist');
			
			return this;
		},
		
		/**
		 * Does the specified Conbo or custom attribute exist?
		 * @param 	{String}				attributeName - The attribute name as it appears in HTML, e.g. "cb-prop-name"
		 * @returns	{Boolean}
		 */
		attributeExists: function(attributeName)
		{
			var camelCase = conbo.toCamelCase(attributeName);
			return camelCase in BindingUtils__cbAttrs || camelCase in BindingUtils__customAttrs;
		},
		
		/**
		 * Bind everything within the DOM scope of a View to the specified 
		 * properties of EventDispatcher class instances (e.g. Hash or Model)
		 * 
		 * @param 	{conbo.View}		view		The View class controlling the element
		 * @returns	{conbo.BindingUtils}	A reference to this object 
		 */
		bindView: function(view)
		{
			if (!view)
			{
				throw new Error('view is undefined');
			}
			
			if (!!view.__bindings)
			{
				this.unbindView(view);
			}
			
			var options = {view:view},
				bindings = [],
				scope = this;
			
			if (!!view.subcontext) 
			{
				view.subcontext.addTo(options);
			}
			
			var ns = view.context && view.context.namespace;
			
			if (ns)
			{
				this.applyViews(view, ns, 'glimpse')
					.applyViews(view, ns, 'view')
					;
			}
			
			var ignored = [];
			
			view.querySelectorAll('[cb-repeat]').forEach(function(el)
			{
				ignored = ignored.concat(conbo.toArray(el.querySelectorAll('*')));
			});
			
			var elements = conbo.difference(view.querySelectorAll('*').concat([view.el]), ignored);
			
			elements.forEach(function(el, index)
			{
				var attrs = __ep(el).getAttributes();
				
				if (!conbo.keys(attrs).length) 
				{
					return;
				}
				
				var keys = conbo.keys(attrs);
				
				// Prevents Conbo trying to populate repeat templates 
				if (keys.indexOf('cbRepeat') != -1)
				{
					keys = ['cbRepeat'];
				}
				
				keys.forEach(function(key)
				{
					var type = conbo.toUnderscoreCase(key, '-');
					var typeSplit = type.split('-');
					
					if (typeSplit.length < 2 
						|| BindingUtils__registeredNamespaces.indexOf(typeSplit[0]) == -1 
						|| BindingUtils__isReservedAttr(type))
					{
						return;
					}
					
					var splits = attrs[key].split(',');
					
					if (!BindingUtils__cbAttrs.canHandleMultiple(type))
					{
						splits = [splits[0]];
					}
					
					var splitsLength = splits.length;
					
					for (var i=0; i<splitsLength; i++)
					{
						var parseFunction,
							d = splits[i];
						
						if (!d && !conbo.isString(d))
						{
							scope.applyAttribute(el, type);
							break;
						}
						
						var b = d.split('|'),
							v = b[0].split(':'),
							propertyName = v[0],
							param = v[1],
							split = BindingUtils__cleanPropertyName(propertyName).split('.'),
							property = split.pop(),
							model;
						
						try
						{
							parseFunction = !!b[1] ? eval('view.'+BindingUtils__cleanPropertyName(b[1])) : undefined;
							parseFunction = conbo.isFunction(parseFunction) ? parseFunction : undefined;
						}
						catch (e) {}
						
						try
						{
							model = !!split.length ? eval('view.'+split.join('.')) : view;
						}
						catch (e) {}
						
						if (!model) 
						{
							conbo.warn(propertyName+' is not defined in this View');
							return;
						}
						
						var opts = conbo.defineValues({propertyName:property}, options);
						var args = [model, property, el, type, parseFunction, opts, param];
						
						bindings = bindings.concat(scope.bindAttribute.apply(scope, args));
					}
					
					// Dispatch a `bind` event from the element at the end of the current call stack
					conbo.defer(function()
					{
						var customEvent;
						
						customEvent = document.createEvent('CustomEvent');
						customEvent.initCustomEvent('bind', false, false, {});					
						
						el.dispatchEvent(customEvent);
					});
				});
				
			});
			
			__definePrivateProperty(view, '__bindings', bindings);
			
			return this;
		},
		
		/**
		 * Removes all data binding from the specified View instance
		 * @param 	{conbo.View}	view
		 * @returns	{conbo.BindingUtils}	A reference to this object 
		 */
		unbindView: function(view)
		{
			if (!view)
			{
				throw new Error('view is undefined');
			}
			
			if (!view.__bindings || !view.__bindings.length)
			{
				return this;
			}
			
			var bindings = view.__bindings;
			
			while (bindings.length)
			{
				var binding = bindings.pop();
				
				try
				{
					binding[0].removeEventListener(binding[1], binding[2]);
				}
				catch (e) {}
			}
			
			delete view.__bindings;
			
			return this;
		},
		
		/**
		 * Applies View and Glimpse classes DOM elements based on their cb-view 
		 * attribute or tag name
		 * 
		 * @param	rootView	DOM element, View or Application class instance
		 * @param	namespace	The current namespace
		 * @param	type		View type, 'view' or 'glimpse' (default: 'view')
		 * @returns	{conbo.BindingUtils}	A reference to this object 
		 */
		applyViews: function(rootView, namespace, type)
		{
			type || (type = 'view');
			
			if (['view', 'glimpse'].indexOf(type) == -1)
			{
				throw new Error(type+' is not a valid type parameter for applyView');
			}
			
			var typeClass = conbo[type.charAt(0).toUpperCase()+type.slice(1)],
				scope = this
				;
			
			var rootEl = conbo.isElement(rootView) ? rootView : rootView.el;
			
			for (var className in namespace)
			{
				var classReference = scope.getClass(className, namespace);
				var isView = conbo.isClass(classReference, conbo.View);
				var isGlimpse = conbo.isClass(classReference, conbo.Glimpse) && !isView;
				
				if ((type == 'glimpse' && isGlimpse) || (type == 'view' && isView))
				{
					var tagName = conbo.toKebabCase(className);
					var nodes = conbo.toArray(rootEl.querySelectorAll(tagName+':not(.cb-'+type+'), [cb-'+type+'='+className+']:not(.cb-'+type+')'));
					
					nodes.forEach(function(el)
					{
						var ep = __ep(el);
						var closestView = ep.closest('.cb-view');
						var context = closestView ? closestView.cbView.subcontext : rootView.subcontext;
						
						new classReference({el:el, context:context});
					});
				}
			}
			
			return this;
		},
		
		/**
		 * Bind the property of one EventDispatcher class instance (e.g. Hash or View) to another
		 * 
		 * @param 	{conbo.EventDispatcher}	source						Class instance which extends conbo.EventDispatcher
		 * @param 	{String}			sourcePropertyName			Source property name
		 * @param 	{any}				destination					Object or class instance which extends conbo.EventDispatcher
		 * @param 	{String}			destinationPropertyName		Optional (default: sourcePropertyName)
		 * @param 	{Boolean}			twoWay						Optional (default: false)
		 * @returns	{conbo.BindingUtils}	A reference to this object 
		 */
		bindProperty: function(source, sourcePropertyName, destination, destinationPropertyName, twoWay)
		{
			if (!(source instanceof conbo.EventDispatcher))
			{
				throw new Error(sourcePropertyName+' source is not EventDispatcher');
			}
			
			var scope = this;
			
			destinationPropertyName || (destinationPropertyName = sourcePropertyName);
			
			BindingUtils__makeBindable(source, sourcePropertyName);
			
			source.addEventListener('change:'+sourcePropertyName, function(event)
			{
				if (!(destination instanceof conbo.EventDispatcher))
				{
					destination[destinationPropertyName] = event.value;
					return;
				}
				
				BindingUtils__set.call(destination, destinationPropertyName, event.value);
			});
			
			if (twoWay && destination instanceof conbo.EventDispatcher)
			{
				this.bindProperty(destination, destinationPropertyName, source, sourcePropertyName);
			}
			
			return this;
		},
		
		/**
		 * Call a setter function when the specified property of a EventDispatcher 
		 * class instance (e.g. Hash or Model) is changed
		 * 
		 * @param 	{conbo.EventDispatcher}	source				Class instance which extends conbo.EventDispatcher
		 * @param 	{String}			propertyName
		 * @param 	{Function}			setterFunction
		 * @returns	{conbo.BindingUtils}	A reference to this object 
		 */
		bindSetter: function(source, propertyName, setterFunction)
		{
			if (!(source instanceof conbo.EventDispatcher))
			{
				throw new Error('Source is not EventDispatcher');
			}
			
			if (!conbo.isFunction(setterFunction))
			{
				if (!setterFunction || !(propertyName in setterFunction))
				{
					throw new Error('Invalid setter function');
				}
				
				setterFunction = setterFunction[propertyName];
			}
			
			BindingUtils__makeBindable(source, propertyName);
			
			source.addEventListener('change:'+propertyName, function(event)
			{
				setterFunction(event.value);
			});
			
			return this;
		},
		
		/**
		 * Default parse function
		 * 
		 * @param	{*} 		value - The value to be parsed
		 * @returns	{function}
		 */
		defaultParseFunction: function(value)
		{
			return typeof(value) == 'undefined' ? '' : value;
		},
		
		/**
		 * Attempt to convert string into a conbo.Class in the specified namespace
		 * 
		 * @param 		{string} className - The name of the class
		 * @param 		{conbo.Namespace} namespace - The namespace containing the class
		 * @returns		{conbo.Class}
		 */
		getClass: function(className, namespace)
		{
			if (!className || !namespace) return;
			
			try
			{
				var classReference = namespace[className];
				
				if (conbo.isClass(classReference)) 
				{
					return classReference;
				}
			}
			catch (e) {}
		},
		
		/**
		 * Register a custom attribute handler
		 * 
		 * @param		{string}	name - camelCase version of the attribute name (must include a namespace prefix)
		 * @param		{function}	handler - function that will handle the data bound to the element
		 * @param 		{boolean}	readOnly - Whether or not the attribute is read-only (default: false)
		 * @param 		{boolean}	raw - Whether or not parameters should be passed to the handler as a raw String instead of a bound value (default: false)
		 * @returns		{conbo.BindingUtils}	A reference to this object 
		 * 
		 * @example 
		 * // HTML: <div my-font-name="myProperty"></div>
		 * conbo.BindingUtils.registerAttribute('myFontName', function(el, value, options, param)
		 * {
		 *		el.style.fontName = value;
		 * });
		 */
		registerAttribute: function(name, handler, readOnly, raw)
		{
			if (!conbo.isString(name) || !conbo.isFunction(handler))
			{
				conbo.warn("registerAttribute: both 'name' and 'handler' parameters are required");
				return this;
			}
			
			var split = conbo.toUnderscoreCase(name).split('_');
			
			if (split.length < 2)
			{
				conbo.warn("registerAttribute: "+name+" does not include a namespace, e.g. "+conbo.toCamelCase('my-'+name));
				return this;
			}
			
			var ns = split[0];
			
			if (BindingUtils__reservedNamespaces.indexOf(ns) != -1)
			{
				conbo.warn("registerAttribute: custom attributes cannot to use the "+ns+" namespace");
				return this;
			}
			
			BindingUtils__registeredNamespaces = conbo.union(BindingUtils__registeredNamespaces, [ns]);
			
			conbo.setValues(handler, 
			{
				readOnly: !!readOnly,
				raw: !!raw
			});
			
			BindingUtils__customAttrs[name] = handler;
			
			return this;
		},
		
		/**
		 * Register one or more custom attribute handlers 
		 * 
		 * @see			#registerAttribute
		 * @param 		{object}				handlers - Object containing one or more custom attribute handlers
		 * @param 		{boolean}				readOnly - Whether or not the attributes are read-only (default: false)
		 * @returns		{conbo.BindingUtils}	A reference to this object 
		 * 
		 * @example
		 * conbo.BindingUtils.registerAttributes({myFoo:myFooFunction, myBar:myBarFunction});
		 */
		registerAttributes: function(handlers, readOnly)
		{
			for (var a in handlers)
			{
				this.addAttribute(a, handlers[a], readOnly);
			}
			
			return this;
		},
		
		toString: function()
		{
			return 'conbo.BindingUtils';
		},
	});
	
})();