/**
 * Attribute Bindings
 * 
 * Functions that can be used to bind DOM elements to properties of Bindable 
 * class instances to DOM elements via their attributes.
 * 
 * @class		AttributeBindings
 * @memberof	conbo
 * @augments	conbo.Class
 * @author 		Neil Rackett
 */
conbo.AttributeBindings = conbo.Class.extend(
/** @lends conbo.AttributeBindings.prototype */
{
	initialize: function()
	{
		// Methods that can accept multiple parameters
		
		this.cbAria.multiple = true;
		this.cbClass.multiple = true;
		this.cbStyle.multiple = true;
		
		// Methods that require raw attribute data instead of bound property values
		
		this.cbIncludeIn.raw = true;
		this.cbExcludeFrom.raw = true;
		this.cbRef.raw = true;

		// Methods that don't require any parameters

		this.cbDetectChange.readOnly = true;
	},
	
	/**
	 * Can the given attribute be bound to multiple properties at the same time?
	 * @param 	{string}	attribute
	 * @returns {Boolean}
	 */
	canHandleMultiple: function(attribute)
	{
		var f = conbo.toCamelCase(attribute);
		return (f in this) && this[f].multiple;
	},
	
	/**
	 * Makes an element visible
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-show="propertyName"></div>
	 */
	cbShow: function(el, value)
	{
		this.cbHide(el, conbo.isEmpty(value));
	},
	
	/**
	 * Hides an element by making it invisible, but does not remove
	 * if from the layout of the page, meaning a blank space will remain
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-hide="propertyName"></div>
	 */
	cbHide: function(el, value)
	{
		!conbo.isEmpty(value)
			? el.classList.add('cb-hide')
			: el.classList.remove('cb-hide');
	},
	
	/**
	 * Include an element on the screen and in the layout of the page
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-include="propertyName"></div>
	 */
	cbInclude: function(el, value)
	{
		this.cbExclude(el, conbo.isEmpty(value));
	},
	
	/**
	 * Remove an element from the screen and prevent it having an effect
	 * on the layout of the page
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-exclude="propertyName"></div>
	 */
	cbExclude: function(el, value)
	{
		!conbo.isEmpty(value)
			? el.classList.add('cb-exclude')
			: el.classList.remove('cb-exclude')
			;
	},
	
	/**
	 * The exact opposite of HTML's built-in `disabled` property
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-enabled="propertyName"></div>
	 */
	cbEnabled: function(el, value)
	{
		el.disabled = !value;
	},
	
	/**
	 * Inserts raw HTML into the element, which is rendered as HTML
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-html="propertyName"></div>
	 */
	cbHtml: function(el, value)
	{
		el.innerHTML = value;
	},
	
	/**
	 * Inserts text into the element so that it appears on screen exactly as
	 * it's written by converting special characters (<, >, &, etc) into HTML
	 * entities before rendering them, e.g. "8 < 10" becomes "8 &lt; 10", and
	 * line breaks into <br/>
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-text="propertyName"></div>
	 */
	cbText: function(el, value)
	{
		value = conbo.encodeEntities(value).replace(/\r?\n|\r/g, '<br/>');
		el.innerHTML = value;
	},
	
	/**
	 * Applies or removes a CSS class on an element based on the value
	 * of the bound property, where cb-class="myProperty:class-name" will apply
	 * the class "class-name" when "myProperty" is a truthy value, or 
	 * cb-class="myProperty" will apply the class "myProperty" when "myProperty"
	 * is a truthy value
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-class="propertyName"></div>
	 * <div cb-class="propertyName:my-class-name"></div>
	 */
	cbClass: function(el, value, options, className)
	{
		className || (className = options.propertyName);
		
		!conbo.isEmpty(value)
			? __ep(el).addClass(className)
			: __ep(el).removeClass(className)
			;
	},
	
	/**
	 * Applies class(es) to the element based on the value contained in a variable. 
	 * Experimental.
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-classes="propertyName"></div>
	 */
	cbClasses: function(el, value)
	{
		if (el.cbClasses)
		{
			__ep(el).removeClass(el.cbClasses);
		}
		
		el.cbClasses = value;
		
		if (value)
		{
			__ep(el).addClass(value);
		}
	},
	
	/**
	 * Apply styles from a variable
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @param 		{Object} 		options - Options relating to this binding
	 * @param 		{string} 		styleName - The name of the style to bind
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-="propertyName:font-weight"></div>
	 */
	cbStyle: function(el, value, options, styleName)
	{
		if (!styleName)
		{
			conbo.warn('cb-style attributes must specify one or more styles in the format cb-style="myProperty:style-name"');
		}
		
		styleName = conbo.toCamelCase(styleName);
		el.style[styleName] = value;
	},
	
	/**
	 * Repeats the element once for each item of the specified list or Array,
	 * applying the specified Glimpse or View class to the element and passing
	 * each value to the item renderer as a "data" property.
	 * 
	 * The optional item renderer class can be specified by following the 
	 * property name with a colon and the class name or by using the tag name.
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @param 		{Object} 		options - Options relating to this binding
	 * @param 		{string} 		itemRendererClassName - The name of the class to apply to each item rendered
	 * @returns		{void}
	 * 
	 * @example
	 * <li cb-repeat="people" cb-html="data.firstName"></li>
	 * <li cb-repeat="people:PersonItemRenderer">{{data.firstName}}</li>
	 * <person-item-renderer cb-repeat="people"></person-item-renderer>
	 */
	cbRepeat: function(el, values, options, itemRendererClassName)
	{
		var a; 
		var args = conbo.toArray(arguments);
		var viewClass;
		var ep = __ep(el);

		options || (options = {});
		
		if (options.context && options.context.namespace)
		{
			itemRendererClassName || (itemRendererClassName = conbo.toCamelCase(el.tagName, true));
			viewClass = conbo.bindingUtils.getClass(itemRendererClassName, options.context.namespace);
		}
		
		viewClass || (viewClass = conbo.ItemRenderer);
		el.cbRepeat || (el.cbRepeat = {});
		
		var elements = el.cbRepeat.elements || [];
		var placeholder;

		if (el.cbRepeat.placeholder)
		{
			placeholder = el.cbRepeat.placeholder;
		}
		else
		{
			placeholder = document.createComment(conbo.bindingUtils.removeAttributeAfterBinding ? '' : 'cb-repeat');
			el.parentNode.insertBefore(placeholder, el);
			el.parentNode.removeChild(el);
		}
		
		if (el.cbRepeat.list != values && values instanceof conbo.List)
		{
			var changeTimeout;

			if (el.cbRepeat.list)
			{
				el.cbRepeat.list.removeEventListener('change', el.cbRepeat.changeHandler, {scope:this});
			}
			
			var applyChange = function(event)
			{
				event.property === 'length'
					? options.view.dispatchChange(options.propertyName)
					: this.cbRepeat.apply(this, args)
					;
			};

			// TODO Optimise this
			el.cbRepeat.changeHandler = function(event)
			{
				// Ensure a single when multiple changes
				clearTimeout(changeTimeout);
				changeTimeout = setTimeout(applyChange, 0, event);
			};
			
			values.addEventListener('change', el.cbRepeat.changeHandler, {scope:this});

			el.cbRepeat.list = values;
		}
		
		switch (true)
		{
			case values instanceof Array:
			case values instanceof conbo.List:
			{
				a = values;
				break;
			}
			
			default:
			{
				// To support element lists, etc
				a = conbo.isIterable(values)
					? conbo.toArray(values)
					: [];
				break;
			}
		}
		
		while (elements.length)
		{
			var rEl = elements.pop();
			var rView = rEl.cbView || rEl.cbGlimpse;
			
			if (rView) rView.remove();
			else rEl.parentNode.removeChild(rEl);
		}
		
		// Switched from forEach loop to resolve issues using "new Array(n)"
		// see: http://stackoverflow.com/questions/23460301/foreach-on-array-of-undefined-created-by-array-constructor
		for (var index=0,length=a.length; index<length; ++index)
		{
			var value = a[index];
			var clone = el.cloneNode(true);
			
			// Wraps non-iterable objects to make them bindable
			if (conbo.isObject(value) && !conbo.isIterable(value) && !(value instanceof conbo.Hash))
			{
				value = new conbo.Hash({source:value});
			}
			
			clone.removeAttribute('cb-repeat');
			
			var viewOptions = 
			{
				data: value, 
				el: clone, 
				index: index,
				isLast: index == a.length-1,
				list: a,
				className: 'cb-repeat'
			};
			
			var view = new viewClass(conbo.assign(viewOptions, options));
			
			elements.push(view.el);
		};
		
		var fragment = document.createDocumentFragment();
		
		elements.forEach(function(el)
		{
			fragment.appendChild(el);
		});
	
		placeholder.parentNode.insertBefore(fragment, placeholder);
		
		el.cbRepeat.elements = elements;
		el.cbRepeat.placeholder = placeholder;
	},
	
	/**
	 * Sets the properties of the element's dataset (it's `data-*` attributes)
	 * using the properties of the object being bound to it. Non-Object values 
	 * will be disregarded. You'll need to use a polyfill for IE <= 10.
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-dataset="propertyName"></div>
	 */
	cbDataset: function(el, value)
	{
		if (conbo.isObject(value))
		{
			conbo.assign(el.dataset, value);
		}
	},
	
	/**
	 * When used with a standard DOM element, the properties of the element's
	 * `dataset` (it's `data-*` attributes) are set using the properties of the 
	 * object being bound to it; you'll need to use a polyfill for IE <= 10
	 * 
	 * When used with a Glimpse, the Glimpse's `data` property is set to
	 * the value of the bound property. 
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-data="propertyName"></div>
	 */
	cbData: function(el, value)
	{
		if (el.cbGlimpse)
		{
			el.cbGlimpse.data = value;
		}
		else
		{
			this.cbDataset(el, value);
		}
	},
	
	/**
	 * Only includes the specified element in the layout when the View's `currentState`
	 * matches one of the states listed in the attribute's value; multiple states should
	 * be separated by spaces
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @param 		{Object} 		options - Options relating to this binding
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-include-in="happy sad elated"></div>
	 */
	cbIncludeIn: function(el, value, options)
	{
		var view = options.view;
		var states = value.split(' ');
		
		var stateChangeHandler = (function()
		{
			this.cbInclude(el, states.indexOf(view.currentState) != -1);
		}).bind(this);
		
		view.addEventListener('change:currentState', stateChangeHandler, {scope:this});
		stateChangeHandler.call(this);
	},
	
	/**
	 * Removes the specified element from the layout when the View's `currentState`
	 * matches one of the states listed in the attribute's value; multiple states should
	 * be separated by spaces
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @param 		{Object} 		options - Options relating to this binding
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-exclude-from="confused frightened"></div>
	 */
	cbExcludeFrom: function(el, value, options)
	{
		var view = options.view;
		var states = value.split(' ');
		
		var stateChangeHandler = function()
		{
			this.cbExclude(el, states.indexOf(view.currentState) != -1);
		};
		
		view.addEventListener('change:currentState', stateChangeHandler, {scope:this});
		stateChangeHandler.call(this);
	},
	
	/**
	 * Completely removes an element from the DOM based on a bound property value, 
	 * primarily intended to facilitate graceful degredation and removal of desktop 
	 * features in mobile environments.
	 * 
	 * @example		cb-remove="isMobile"
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-remove="propertyName"></div>
	 */
	cbRemove: function(el, value)
	{
		if (!conbo.isEmpty(value))
		{
			// TODO Remove binding, etc?
			el.parentNode.removeChild(el);
		}
	},
	
	/**
	 * The opposite of `cbRemove`
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-keep="propertyName"></div>
	 */
	cbKeep: function(el, value)
	{
		this.cbRemove(el, !value);
	},
	
	/**
	 * Enables the use of cb-onbind attribute to handle the 'bind' event 
	 * dispatched by the element after it has been bound by Conbo
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-onbind="functionName"></div>
	 */
	cbOnbind: function(el, handler)
	{
		el.addEventListener('bind', handler);
	},
	
	/**
	 * Uses JavaScript to open an anchor's HREF so that the link will open in
	 * an iOS WebView instead of Safari
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-jshref="propertyName"></div>
	 */
	cbJshref: function(el)
	{
		if (el.tagName == 'A')
		{
			el.onclick = function(event)
			{
				window.location = el.href;
				event.preventDefault();
				return false;
			};
		}
	},
	
	/*
	 * FORM HANDLING & VALIDATION
	 */
	
	/**
	 * Detects changes to the specified element and applies the CSS class
	 * cb-changed or cb-unchanged to the parent form, depending on whether
	 * the contents have changed from their original value.
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-detect-change></div>
	 */
	cbDetectChange: function(el)
	{
		var ep = __ep(el); 
		var form = ep.closest('form');
		var fp = __ep(form);
		var originalValue = el.value || el.innerHTML;
		
		var updateForm = function()
		{
			fp.removeClass('cb-changed cb-unchanged')
				.addClass(form.querySelector('.cb-changed') ? 'cb-changed' : 'cb-unchanged');
		};
		
		var changeHandler = function()
		{
			var changed = (el.value || el.innerHTML) != originalValue;
			
			ep.removeClass('cb-changed cb-unchanged')
				.addClass(changed ? 'cb-changed' : 'cb-unchanged')
				;
			
			updateForm();
		};
		
		ep.addEventListener('change input', changeHandler)
			.addClass('cb-unchanged')
			;
		
		updateForm();
	},
	
	/**
	 * Use a method or regex to validate a form element and apply a
	 * cb-valid or cb-invalid CSS class based on the outcome
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{Function} 		validator - The function referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-validate="functionName"></div>
	 */
	cbValidate: function(el, validator)
	{
		var validateFunction;
		
		switch (true)
		{
			case conbo.isFunction(validator):
			{
				validateFunction = validator;
				break;
			}
			
			case conbo.isString(validator):
			{
				validator = new RegExp(validator);
			}
			
			case conbo.isRegExp(validator):
			{
				validateFunction = function(value)
				{
					return validator.test(value);
				};
				
				break;
			}
		}
		
		if (!conbo.isFunction(validateFunction))
		{
			conbo.warn(validator+' cannot be used with cb-validate');
			return;
		}
		
		var ep = __ep(el);
		var form = ep.closest('form');
		
		var getClasses = function(regEx) 
		{
			return function (classes) 
			{
				return classes.split(/\s+/).filter(function(el)
				{
					return regEx.test(el); 
				})
				.join(' ');
			};
		};
		
		var validate = function()
		{
			// Form item
			
			var value = el.value || el.innerHTML
				, result = validateFunction(value) 
				, valid = (result === true)
				, classes = []
				;
			
			classes.push(valid ? 'cb-valid' : 'cb-invalid');
			
			if (conbo.isString(result))
			{
				classes.push('cb-invalid-'+result);
			}
			
			ep.removeClass('cb-valid cb-invalid')
				.removeClass(getClasses(/^cb-invalid-/))
				.addClass(classes.join(' '))
				;
			
			// Form
			
			if (form)
			{
				var fp = __ep(form);
				
				fp.removeClass('cb-valid cb-invalid')
					.removeClass(getClasses(/^cb-invalid-/))
					;
				
				if (valid) 
				{
					valid = !form.querySelector('.cb-invalid');
					
					if (valid)
					{
						conbo.toArray(form.querySelectorAll('[required]')).forEach(function(rEl) 
						{
							if (!String(rEl.value || rEl.innerHTML).trim())
							{
								valid = false;
								return false; 
							}
						});
					}
				}
				
				fp.addClass(valid ? 'cb-valid' : 'cb-invalid');
			}
			
		};
		
		ep.addEventListener('change input blur', validate);
	},
	
	/**
	 * Restricts text input to the specified characters
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{string} 		value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-restrict="propertyName"></div>
	 */
	cbRestrict: function(el, value)
	{
		// TODO Restrict to text input fields?
		
		if (el.cbRestrict)
		{
			el.removeEventListener('keypress', el.cbRestrict);
		}
		
		el.cbRestrict = function(event)
		{
			if (event.ctrlKey)
			{
				return;
			}
			
			var code = event.keyCode || event.which;
			var char = event.key || String.fromCharCode(code);
			var regExp = value;
				
			if (!conbo.isRegExp(regExp))
			{
				regExp = new RegExp('['+regExp+']', 'g');
			}
			
			if (!char.match(regExp))
			{
				event.preventDefault();
			}
		};
		
		el.addEventListener('keypress', el.cbRestrict);
	},
	
	/**
	 * Limits the number of characters that can be entered into
	 * input and other form fields
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{string} 		value - The value referenced by the attribute
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-max-chars="propertyName"></div>
	 */
	cbMaxChars: function(el, value)
	{
		// TODO Restrict to text input fields?
		
		if (el.cbMaxChars)
		{
			el.removeEventListener('keypress', el.cbMaxChars);
		}
		
		el.cbMaxChars = function(event)
		{
			if ((el.value || el.innerHTML).length >= value)
			{
				event.preventDefault();
			}
		};
		
		el.addEventListener('keypress', el.cbMaxChars);
	},
	
	/**
	 * Sets the aria accessibility attributes on an element based on the value
	 * of the bound property, e.g. cb-aria="myProperty:label" to set aria-label 
	 * to the value of myProperty
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{*} 			value - The value referenced by the attribute
	 * @param 		{*} 			options
	 * @param 		{string} 		ariaName - The name of the aria value to set (without the aria- prefix)
	 * @returns		{void}
	 * 
	 * @example
	 * <div cb-class="ariaLabel:label"></div>
	 */
	cbAria: function(el, value, options, ariaName)
	{
		if (!ariaName)
		{
			conbo.warn('cb-aria attributes must specify one or more name in the format cb-class="myProperty:aria-name"');
		}
		
		el.setAttribute('aria-'+ariaName, value);
	},

	/**
	 * Enables you to detect and handle a long press (500ms) on an element
	 * 
	 * @param 		{HTMLElement}	el - DOM element to which the attribute applies
	 * @param 		{Function} 		handler - The method that will handle long presses
	 * 
	 * @example
	 * <button cb-onlongpress="myLongPressHandler">Hold me!</button>
	 */
	cbOnlongpress: function(el, handler)
	{
		var isLongPress = false;
		var pressTimer;
		
		var cancel = function(event)
		{
			if (pressTimer) 
			{
				clearTimeout(pressTimer);
				pressTimer = 0;
			}
		};
		
		var click = function(event)
		{
			if (pressTimer) 
			{
				clearTimeout(pressTimer);
				pressTimer = 0;
			}
			
			if (isLongPress) return false;
		};
		
		var start = function(event)
		{
			if (event.type === 'click' && event.button !== 0)
			{
				return;
			}
			
			isLongPress = false;
			
			pressTimer = setTimeout(function() 
			{
				isLongPress = true;
				handler(new MouseEvent('longpress', event));
			}, 500);
			
			return false;
		};
		
		el.addEventListener('mousedown', start);
		el.addEventListener('touchstart', start);
		el.addEventListener('click', click);
		el.addEventListener('mouseout', cancel);
		el.addEventListener('touchend', cancel);
		el.addEventListener('touchleave', cancel);
		el.addEventListener('touchcancel', cancel);
	},
	
	/**
	 * Sets the value of the specified property of the View instance to a reference
	 * to the element with this attribute set
	 * 
	 * @param {HTMLElement} el 			HTML Element
	 * @param {String} 		value 		Name of the property to set as a reference to the element
	 * @param {*} 			options 
	 */
	cbRef: function(el, value, options)
	{
		options.view[value] = el;
	},

});
