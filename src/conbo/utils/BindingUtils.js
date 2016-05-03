var BindingUtils__cbAttrs = new conbo.AttributeBindings()
	, BindingUtils__customAttrs = {}
	, BindingUtils__reservedAttrs = ['cb-app', 'cb-view', 'cb-glimpse', 'cb-content']
	, BindingUtils__reservedNamespaces = ['cb', 'data', 'aria']
	, BindingUtils__registeredNamespaces = ['cb']
	;

/**
 * Set the value of one or more property and dispatch a change:[propertyName] event
 * 
 * Event handlers, in line with conbo.Model change:[propertyName] handlers, 
 * should be in the format handler(source, value) {...}
 * 
 * @private
 * @param 	attribute
 * @param 	value
 * @param 	options
 * @example	BindingUtils.__set.call(target, 'n', 123);
 * @example	BindingUtils.__set.call(target, {n:123, s:'abc'});
 * @returns	this
 */
var BindingUtils__set = function(propName, value)
{
	if (this[propName] === value)
	{
		return this;
	}
	
	// Ensure numbers are returned as Number not String
	if (value && conbo.isString(value) && !isNaN(value))
	{
		value = parseFloat(value);
		if (isNaN(value)) value = '';
	}
	
	this[propName] = value;
	
	// We're assuming accessors will dispatch their own change events
	if (!conbo.isAccessor(this, propName))
	{
		__dispatchChange(this, propName);
	}
	
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
	 * Bind a property of a EventDispatcher class instance (e.g. Hash or Model) 
	 * to a DOM element's value/content, using Conbo's best judgement to
	 * work out how the value should be bound to the element.
	 * 
	 * This method of binding also allows for the use of a parse function,
	 * which can be used to manipulate bound data in real time
	 * 
	 * @param 		{conbo.EventDispatcher}	source				Class instance which extends from conbo.EventDispatcher (e.g. Hash or Model)
	 * @param 		{String} 				propName			Property name to bind
	 * @param 		{DOMElement} 			element				DOM element to bind value to (two-way bind on input/form elements)
	 * @param 		{Function}				parseFunction		Optional method used to parse values before outputting as HTML
	 * 
	 * @returns		{Array}										Array of bindings
	 */
	bindElement: function(source, propName, element, parseFunction)
	{
		if (!(source instanceof conbo.EventDispatcher))
		{
			throw new Error('Source is not EventDispatcher');
		}
		
		if (!element)
		{
			throw new Error('element is undefined');
		}
		
		if (!conbo.isBindable(source, propName))
		{
			conbo.warn('It may not be possible to detect changes to "'+propName+'" on class "'+source.toString()+'" because the property is not bindable');
		}
		
		var scope = this,
			bindings = [],
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
							$el.prop('checked', !!source[propName]);
							
							eventType = 'change:'+propName;
							
							eventHandler = function(event)
							{
								$el.prop('checked', !!event.value);
							};
							
							source.addEventListener(eventType, eventHandler);
							bindings.push([source, eventType, eventHandler]);
							
							eventType = 'input change';
							
							eventHandler = function(event)
							{
								BindingUtils__set.call(source, propName, $el.is(':checked'));
							};
							
							$el.on(eventType, eventHandler);
							bindings.push([$el, eventType, eventHandler]);
							
							return;
						}
						
						case 'radio':
						{
							if ($el.val() == source[propName]) $el.prop('checked', true);
							
							eventType = 'change:'+propName;
							
							eventHandler = function(event)
							{
								if (event.value == null) event.value = '';
								if ($el.val() != event.value) return; 
								
								$el.prop('checked', true);
							};
							
							source.addEventListener(eventType, eventHandler);
							bindings.push([source, eventType, eventHandler]);
							
							break;
						}
						
						default:
						{
							var setVal = function() 
							{
								$el.val(source[propName]); 
							};
							
							// Resolves issue with cb-repeat inside <select>
							if (type == 'select') conbo.defer(setVal);
							else setVal();
							
							eventType = 'change:'+propName;
							
							eventHandler = function(event)
							{
								if (event.value == null) event.value = '';
								if ($el.val() == event.value) return;
								
								$el.val(event.value);
							};
							
							source.addEventListener(eventType, eventHandler);
							bindings.push([source, eventType, eventHandler]);
							
							break;
						}
					}
					
					eventType = 'input change';
					
					eventHandler = function(event)
					{	
						BindingUtils__set.call(source, propName, $el.val() === undefined ? $el.html() : $el.val());
					};
					
					$el.on(eventType, eventHandler);
					bindings.push([$el, eventType, eventHandler]);
					
					break;
				}
				
				default:
				{
					$el.html(parseFunction(source[propName]));
					
					eventType = 'change:'+propName;
					
					eventHandler = function(event) 
					{
						var html = parseFunction(event.value);
						$el.html(html);
					};
					
					source.addEventListener(eventType, eventHandler);
					bindings.push([source, eventType, eventHandler]);
					
					break;
				}
			}
			
		});
		
		return bindings;
	},
	
	/**
	 * Unbinds the specified property of a bindable class from the specified DOM element
	 * 
	 *  @param	el		DOM element
	 *  @param	view	View class
	 */
	unbindElement: function(source, propName, element)
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
		
		//attributeName = conbo.toUnderscoreCase(attributeName, '-');
		
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
						
						$(element).on(nativeAttr.substr(2), source[propertyName]);
						return this;
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
						
						var $el = $(element);
						
						eventHandler = function()
		     			{
							BindingUtils__set.call(source, propertyName, element[nativeAttr]);
		     			};
						
		     			eventType = 'input change';
						$el.on(eventType, eventHandler);
						
						bindings.push([$el, eventType, eventHandler]);
						
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
	 * @returns	{this}
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
			$ignored = view.$('[cb-repeat]'),
			scope = this;
		
		if (!!view.subcontext) 
		{
			view.subcontext.addTo(options);
		}
		
		if (view.context && view.context.namespace)
		{
			this.applyViews(view, view.context.namespace, 'glimpse');
		}
		
		view.$('*').add(view.el).filter(function()
		{
			if (this == view.el) return true;
			if ($ignored.find(this).length) return false;
			return true;
		})
		.each(function(index, el)
		{
			var $el = $(el);
			var attrs = $el.attrs();
			
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
				type = conbo.toUnderscoreCase(key, '-');
				
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
						split = scope.cleanPropertyName(propertyName).split('.'),
						property = split.pop(),
						model;
					
					try
					{
						parseFunction = !!b[1] ? eval('view.'+scope.cleanPropertyName(b[1])) : undefined;
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
		
		__defineUnenumerableProperty(view, '__bindings', bindings);
		
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
				switch (true)
				{
					case binding[0] instanceof $:
					{
						binding[0].off(binding[1], binding[2]);
						break;
					}
					
					case binding[0] instanceof conbo.EventDispatcher:
					case !!binding[0] && !!binding[0].removeEventListener:
					{
						binding[0].removeEventListener(binding[1], binding[2]);
						break;
					}
					
					default:
					{
						// Looks like the object's been deleted!
						break;
					}
				}
			}
			catch (e) 
			{
				// TODO ?
			}
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
	 */
	applyViews: function(rootView, namespace, type)
	{
		var validTypes = ['view', 'glimpse'];
		type || (type = 'view');
		
		if (validTypes.indexOf(type) == -1)
		{
			throw new Error(type+' is not a valid type parameter for applyView');
		}
		
		var typeClass = conbo[type.charAt(0).toUpperCase()+type.slice(1)],
			scope = this
			;
		
		var $rootEl = rootView instanceof conbo.View
			? rootView.$el
			: $(rootView)
			;
		
		// Detects tags with cb-* attributes and custom tag names 
		$rootEl.find('*').not('.cb-view, .cb-glimpse').each(function(index, el)
		{
			var $el = $(el),
				className = $el.cbAttrs()[type] || conbo.toCamelCase(el.tagName, true),
				classReference = scope.getClass(className, namespace)
				;
			
			if (classReference 
				&& conbo.isClass(classReference, typeClass))
			{
				if ((type == 'glimpse' && conbo.isClass(classReference, conbo.Glimpse))
					|| (type == 'view' && conbo.isClass(classReference, conbo.View)))
				{
					// Gets the Context of the "closest" parent View
					var closestView = $el.closest('.cb-view')[0];
						context = closestView ? closestView.cbView.subcontext : rootView.subcontext;
					
					new classReference({el:el, context:context});
				}
			}
		});
		
		return this;
	},
	
	/**
	 * Bind the property of one EventDispatcher class instance (e.g. Hash or Model) to another
	 * 
	 * @param 	{conbo.EventDispatcher}	source						Class instance which extends conbo.EventDispatcher
	 * @param 	{String}			sourcePropertyName			Source property name
	 * @param 	{any}				destination					Object or class instance which extends conbo.EventDispatcher
	 * @param 	{String}			destinationPropertyName		Optional (default: sourcePropertyName)
	 * @param 	{Boolean}			twoWay						Optional (default: false)
	 * 
	 * @returns	{this}
	 */
	bindProperty: function(source, sourcePropertyName, destination, destinationPropertyName, twoWay)
	{
		if (!(source instanceof conbo.EventDispatcher))
		{
			throw new Error(sourcePropertyName+' source is not EventDispatcher');
		}
		
		var scope = this;
		
		destinationPropertyName || (destinationPropertyName = sourcePropertyName);
		
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
		
		source.addEventListener('change:'+propertyName, function(event)
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
	 * Remove everything except alphanumberic, dots and underscores from Strings
	 * 
	 * @private
	 * @param 		{String}	view		String value to clean
	 * @returns		{String}
	 */
	cleanPropertyName: function(value)
	{
		return (value || '').replace(/[^\w\._]/g, '');
	},
	
	/**
	 * Attempt to convert string into a conbo.Class in the specified namespace
	 * 
	 * @param 		name
	 * @returns		Class
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
	 * @returns 	{this}		BindingUtils
	 * 
	 * @example 
	 * // HTML: <div my-font-name="myProperty"></div>
	 * conbo.BindingUtils.registerAttribute('myFontName', function(el, value, options, param)
	 * {
	 * 	$(el).css('font-name', value);
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
	 * @returns 	{conbo.BindingUtils}	BindingUtils
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
