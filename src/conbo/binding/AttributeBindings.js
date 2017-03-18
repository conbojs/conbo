/**
 * Attribute Bindings
 * 
 * Functions that can be used to bind DOM elements to properties of Bindable 
 * class instances to DOM elements via their attributes.
 * 
 * @class		conbo.AttributeBindings
 * @augments	conbo.Class
 * @author 		Neil Rackett
 */
conbo.AttributeBindings = conbo.Class.extend(
/** @lends conbo.AttributeBindings.prototype */
{
	initialize: function()
	{
		// Methods that can accept multiple parameters
		
		this.cbClass.multiple = true;
		this.cbStyle.multiple = true;
		
		// Methods that require raw attribute data instead of bound property values
		
		this.cbIncludeIn.raw = true;
		this.cbExcludeFrom.raw = true;
	},
	
	/**
	 * Can the given attribute be bound to multiple properties at the same time?
	 * @param 	{String}	attribute
	 * @returns {Boolean}
	 */
	canHandleMultiple: function(attribute)
	{
		var f = conbo.toCamelCase(attribute);
		
		return (f in this)
			? !!this[f].multiple
			: false;
	},
	
	/**
	 * Makes an element visible
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-show="propertyName"></div>
	 */
	cbShow: function(el, value)
	{
		this.cbHide(el, !value);
	},
	
	/**
	 * Hides an element by making it invisible, but does not remove
	 * if from the layout of the page, meaning a blank space will remain
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-hide="propertyName"></div>
	 */
	cbHide: function(el, value)
	{
		var ep = __ep(el);
		
		!!value
			? ep.addClass('cb-hide')
			: ep.removeClass('cb-hide');
	},
	
	/**
	 * Include an element on the screen and in the layout of the page
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-include="propertyName"></div>
	 */
	cbInclude: function(el, value)
	{
		this.cbExclude(el, !value);
	},
	
	/**
	 * Remove an element from the screen and prevent it having an effect
	 * on the layout of the page
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-exclude="propertyName"></div>
	 */
	cbExclude: function(el, value)
	{
		var ep = __ep(el);
		
		!!value
			? ep.addClass('cb-exclude')
			: ep.removeClass('cb-exclude');
	},
	
	/**
	 * The exact opposite of HTML's built-in `disabled` property
	 * 
	 * @param 		el
	 * @param 		value
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
	 * @param 		el
	 * @param 		value
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
	 * @param 		el
	 * @param 		value
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
	 * Applies or removes a CSS class to or from the element based on the value
	 * of the bound property, e.g. cb-class="myProperty:class-name"
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-class="propertyName:my-class-name"></div>
	 */
	cbClass: function(el, value, options, className)
	{
		if (!className)
		{
			conbo.warn('cb-class attributes must specify one or more CSS classes in the format cb-class="myProperty:class-name"');
		}
		
		!!value
			? __ep(el).addClass(className)
			: __ep(el).removeClass(className)
			;
	},
	
	/**
	 * Applies class(es) to the element based on the value contained in a variable. 
	 * Experimental.
	 * 
	 * @param 		el
	 * @param 		value
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
	 * @param 		el
	 * @param 		value
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
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <li cb-repeat="people" cb-hml="data.firstName"></li>
	 * <li cb-repeat="people:PersonItemRenderer" cb-hml="data.firstName"></li>
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
			viewClass = conbo.BindingUtils.getClass(itemRendererClassName, options.context.namespace);
		}
		
		viewClass || (viewClass = conbo.ItemRenderer);
		el.cbRepeat || (el.cbRepeat = {});
		
		var elements = el.cbRepeat.elements || [];
		
		ep.removeClass('cb-exclude');
		
		if (el.cbRepeat.list != values && values instanceof conbo.List)
		{
			if (el.cbRepeat.list)
			{
				el.cbRepeat.list.removeEventListener('change', el.cbRepeat.changeHandler);
			}
			
			el.cbRepeat.changeHandler = this.bind(function(event)
			{
				this.cbRepeat.apply(this, args);
			});
			
			values.addEventListener('change', el.cbRepeat.changeHandler);
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
		
		// Ensure the original element is re-inserted into the DOM before proceeding
		if (elements.length && elements[0].parentNode)
		{
			elements[0].parentNode.insertBefore(el, elements[0]);
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
			
			if (conbo.isObject(value) && !(value instanceof conbo.Hash))
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
			
			var view = new viewClass(conbo.setValues(viewOptions, options));
			
			elements.push(view.el);
		};
		
		var fragment = document.createDocumentFragment();
		
		elements.forEach(function(el)
		{
			fragment.appendChild(el);
		});
		
		el.parentNode.insertBefore(fragment, el);
		el.cbRepeat.elements = elements;
		
		elements.length
			? el.parentNode.removeChild(el)
			: el.className += ' cb-exclude'
			;
	},
	
	/**
	 * Sets the properties of the element's dataset (it's `data-*` attributes)
	 * using the properties of the object being bound to it. Non-Object values 
	 * will be disregarded. You'll need to use a polyfill for IE <= 10.
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-dataset="propertyName"></div>
	 */
	cbDataset: function(el, value)
	{
		if (conbo.isObject(value))
		{
			conbo.setValues(el.dataset, value);
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
	 * @param 		el
	 * @param 		value
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
	 * @param 		el
	 * @param 		value
	 * @param 		options
	 * 
	 * @example
	 * <div cb-include-in="happy sad elated"></div>
	 */
	cbIncludeIn: function(el, value, options)
	{
		var view = options.view;
		var states = value.split(' ');
		
		var stateChangeHandler = this.bind(function()
		{
			this.cbInclude(el, states.indexOf(view.currentState) != -1);
		});
		
		view.addEventListener('change:currentState', stateChangeHandler, this);
		stateChangeHandler.call(this);
	},
	
	/**
	 * Removes the specified element from the layout when the View's `currentState`
	 * matches one of the states listed in the attribute's value; multiple states should
	 * be separated by spaces
	 * 
	 * @param 		el
	 * @param 		value
	 * @param 		options
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
		
		view.addEventListener('change:currentState', stateChangeHandler, this);
		stateChangeHandler.call(this);
	},
	
	/**
	 * Completely removes an element from the DOM based on a bound property value, 
	 * primarily intended to facilitate graceful degredation and removal of desktop 
	 * features in mobile environments.
	 * 
	 * @example		cb-remove="isMobile"
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-remove="propertyName"></div>
	 */
	cbRemove: function(el, value)
	{
		if (!!value)
		{
			// TODO Remove binding, etc?
			el.parentNode.removeChild(el);
		}
	},
	
	/**
	 * The opposite of `cbRemove`
	 * 
	 * @param 		el
	 * @param 		value
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
	 * @param 		el
	 * @param 		value
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
	 * @param el
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
	 * cb-changed or cb-unchanged, depending on whether the contents have
	 * changed from their original value.
	 * 
	 * @param 		el
	 * @param 		value
	 * 
	 * @example
	 * <div cb-detect-change></div>
	 */
	cbDetectChange: function(el, value)
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
	 * @param 		el
	 * @param 		value
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
		
		var removeClass = function(regEx) 
		{
			return function (classes) 
			{
				return classes.split(/\s+/).filter(function (el)
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
				.removeClass(removeClass(/^cb-invalid-/))
				.addClass(classes.join(' '))
				;
			
			// Form
			
			if (form)
			{
				var fp = __ep(form);
				
				fp.removeClass('cb-valid cb-invalid')
					.removeClass(removeClass(/^cb-invalid-/))
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
	 * @param 		el
	 * @param 		value
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
	 * @param 		el
	 * @param 		value
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
	
});
