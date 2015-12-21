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
	 * @param value
	 * @param el
	 */
	cbShow: function(value, el)
	{
		this.cbHide(!value, el);
	},
	
	/**
	 * Hides an element by making it invisible, but does not remove
	 * if from the layout of the page, meaning a blank space will remain
	 * 
	 * @param value
	 * @param el
	 */
	cbHide: function(value, el)
	{
		var $el = $(el);
		
		!!value
			? $el.addClass('cb-hide')
			: $el.removeClass('cb-hide');
	},
	
	/**
	 * Include an element on the screen and in the layout of the page
	 * 
	 * @param value
	 * @param el
	 */
	cbInclude: function(value, el)
	{
		this.cbExclude(!value, el);
	},
	
	/**
	 * Remove an element from the screen and prevent it having an effect
	 * on the layout of the page
	 * 
	 * @param value
	 * @param el
	 */
	cbExclude: function(value, el)
	{
		var $el = $(el);
		
		!!value
			? $el.addClass('cb-exclude')
			: $el.removeClass('cb-exclude');
	},
	
	/**
	 * The exact opposite of HTML's built-in `disabled` property
	 * 
	 * @param value
	 * @param el
	 */
	cbEnabled: function(value, el)
	{
		el.disabled = !value;
	},
	
	/**
	 * Inserts raw HTML into the element, which is rendered as HTML
	 * 
	 * @param value
	 * @param el
	 */
	cbHtml: function(value, el)
	{
		$(el).html(value);
	},
	
	/**
	 * Inserts text into the element so that it appears on screen exactly as
	 * it's written by converting special characters (<, >, &, etc) into HTML
	 * entities before rendering them, e.g. "8 < 10" becomes "8 &lt; 10", and
	 * line breaks into <br/>
	 * 
	 * @param value
	 * @param el
	 */
	cbText: function(value, el)
	{
		value = conbo.encodeEntities(value).replace(/\r?\n|\r/g, '<br/>');
		$(el).html(value);
	},
	
	/**
	 * Applies or removes a CSS class to or from the element based on the value
	 * of the bound property, e.g. cb-class="myProperty:class-name"
	 * 
	 * @param value
	 * @param el
	 */
	cbClass: function(value, el, options, className)
	{
		if (!className)
		{
			conbo.warn('cb-class attributes must specify one or more CSS classes in the format cb-class="myProperty:class-name"');
		}
		
		var $el = $(el);
		
		!!value
			? $el.addClass(className)
			: $el.removeClass(className);
	},
	
	/**
	 * Applies class(es) to the element based on the value contained in a variable. 
	 * Experimental.
	 * 
	 * @param value
	 * @param el
	 */
	cbClasses: function(value, el)
	{
		var $el = $(el);
		
		if (el.cbClasses)
		{
			$el.removeClass(el.cbClasses);
		}
		
		el.cbClasses = value;
		
		if (value)
		{
			$el.addClass(value);
		}
	},
	
	/**
	 * Apply styles from a variable
	 * 
	 * @param value
	 * @param el
	 */
	cbStyle: function(value, el, options, styleName)
	{
		if (!styleName)
		{
			conbo.warn('cb-style attributes must specify one or more styles in the format cb-style="myProperty:style-name"');
		}
		
		$(el).css(styleName, value);
	},
	
	/**
	 * Repeat the selected element
	 * 
	 * @param value
	 * @param el
	 */
	cbRepeat: function(values, el, options, itemRendererClassName)
	{
		var a, 
			args = conbo.toArray(arguments),
			$el = $(el),
			viewClass;
		
		options || (options = {});
		
		if (options.context && options.context.namespace)
		{
			viewClass = conbo.BindingUtils.getClass(itemRendererClassName, options.context.namespace);
		}
		
		viewClass || (viewClass = conbo.View);
		el.cbRepeat || (el.cbRepeat = {});
		
		elements = el.cbRepeat.elements || [];
		
		$el.removeClass('cb-exclude');
		
		if (el.cbRepeat.list != values && values instanceof conbo.List)
		{
			if (!!el.cbRepeat.list)
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
				a = values;
				break;
				
			default:
				a = [];
				break;
		}
		
		if (elements.length)
		{
			$(elements[0]).before($el);
		}
		
		while (elements.length)
		{
			$(elements.pop()).remove();
		}
		
		a.forEach(function(value, index)
		{
			if (conbo.isObject(value) && !(value instanceof conbo.Hash))
			{
				value = new conbo.Hash({source:value});
			}
			
			var $clone = $el.clone().removeAttr('cb-repeat');
			
			var viewOptions = 
			{
				data: value, 
				el: $clone, 
				index: index,
				isLast: index == a.length-1
			};
			
			var view = new viewClass(conbo.extend(viewOptions, options));
			
			view.$el.addClass('cb-repeat');
			
			elements.push(view.el);
		});
		
		$el.after(elements);
		el.cbRepeat.elements = elements;
		
		!!elements.length
			? $el.remove()
			: $el.addClass('cb-exclude');
	},
	
	/**
	 * When used with a standard DOM element, the properties of the element's
	 * `dataset` (it's `data-*` attributes) are set using the properties of the 
	 * object being bound to it; you'll need to use a polyfill for IE <= 10
	 * 
	 * When used with a Glimpse, the Glimpse's `data` property is set to
	 * the value of the bound property. 
	 * 
	 * @param value
	 * @param el
	 */
	cbData: function(value, el)
	{
		if (el.cbGlimpse)
		{
			el.cbGlimpse.data = value;
		}
		else if (conbo.isObject(value))
		{
			conbo.setValues(el.dataset, value);
		}
	},
	
	/**
	 * Only includes the specified element in the layout when the View's `currentState`
	 * matches one of the states listed in the attribute's value; multiple states should
	 * be separated by spaces
	 * 
	 * @example		cb-include-in="happy sad melancholy"
	 * 
	 * @param 		value
	 * @param 		el
	 * @param 		options
	 */
	cbIncludeIn: function(value, el, options)
	{
		var view = options.view;
		var states = value.split(' ');
		
		var stateChangeHandler = function()
		{
			this.cbInclude(states.indexOf(view.currentState) != -1, el);
		};
		
		view.addEventListener('change:currentState', stateChangeHandler, this);
		stateChangeHandler.call(this);
	},
	
	/**
	 * Removes the specified element from the layout when the View's `currentState`
	 * matches one of the states listed in the attribute's value; multiple states should
	 * be separated by spaces
	 * 
	 * @example		cb-exclude-from="confused frightened"
	 * 
	 * @param 		value
	 * @param 		el
	 * @param 		options
	 */
	cbExcludeFrom: function(value, el, options)
	{
		var view = options.view;
		var states = value.split(' ');
		
		var stateChangeHandler = function()
		{
			this.cbExclude(states.indexOf(view.currentState) != -1, el);
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
	 * @param 		value
	 * @param 		el
	 */
	cbRemove: function(value, el)
	{
		if (!!value)
		{
			var $el = $(el);
			
			// TODO Remove any bindings?
			
			$el.remove();
		}
	},
	
	/**
	 * The opposite of `cbRemove`
	 * 
	 * @param value
	 * @param el
	 */
	cbKeep: function(value, el)
	{
		this.cbRemove(!value, el);
	},
	
	/**
	 * Enables the use of cb-onbind attribute to handle the 'bind' event 
	 * dispatched by the element after it has been bound by Conbo
	 * 
	 * @param value
	 * @param el
	 */
	cbOnbind: function(handler, el)
	{
		el.addEventListener('bind', handler);
	},
	
	
	/*
	 * FORM HANDLING & VALIDATION
	 */
	
	/**
	 * Detects changes to the specified element and applies the CSS class
	 * cb-changed or cb-unchanged, depending on whether the contents have
	 * changed from their original value.
	 * 
	 * @param value
	 * @param el
	 */
	cbDetectChange: function(value, el)
	{
		var $el = $(el)
			, $form = $el.closest('form')
			, originalValue = $el.val() || $el.html()
			;
		
		var updateForm = function()
		{
			$form.removeClass('cb-changed cb-unchanged')
				.addClass($form.find('.cb-changed').length ? 'cb-changed' : 'cb-unchanged');
		};
		
		var changeHandler = function()
		{
			var changed = (($el.val() || $el.html()) != originalValue);
			
			$el.removeClass('cb-changed cb-unchanged')
				.addClass(changed ? 'cb-changed' : 'cb-unchanged')
				;
			
			updateForm();
		};
		
		$el.on('change input', changeHandler)
			.addClass('cb-unchanged')
			;
		
		updateForm();
	},
	
	/**
	 * Use a method or regex to validate a form element and apply a
	 * cb-valid or cb-invalid CSS class based on the outcome
	 * 
	 * @param value
	 * @param el
	 */
	cbValidate: function(validator, el)
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
		
		var $el = $(el)
			, $form = $el.closest('form')
			;
		
		var removeClass = function(regEx) 
		{
			return function (index, classes) 
			{
				return classes.split(/\s+/).filter(function (el)
				{
					return regEx.test(el); 
				})
				.join(' ');
			}
		}
		
		var validate = function()
		{
			// Form item
			
			var value = $el.val() || $el.html()
				, result = validateFunction(value) 
				, valid = (result === true)
				, classes = []
				;
			
			classes.push(valid ? 'cb-valid' : 'cb-invalid');
			
			if (conbo.isString(result))
			{
				classes.push('cb-invalid-'+result);
			}
			
			$el.removeClass('cb-valid cb-invalid')
				.removeClass(removeClass(/^cb-invalid-/))
				.addClass(classes.join(' '))
				;
			
			// Form
			
			if ($form.length)
			{
				$form.removeClass('cb-valid cb-invalid')
					.removeClass(removeClass(/^cb-invalid-/))
					;
				
				if (valid) 
				{
					valid = !$form.find('.cb-invalid').length;
					
					if (valid)
					{
						$form.find('[required]').each(function() 
						{
							var $el = $(this);
							
							if (!$.trim($el.val() || $el.html()))
							{
								valid = false;
								return false; 
							}
						});
					}
				}
				
				$form.addClass(valid ? 'cb-valid' : 'cb-invalid');
			}
			
		};
		
		$el.on('change input blur', validate);
	},
	
	/**
	 * Restricts text input to the specified characters
	 * 
	 * @param value
	 * @param el
	 */
	cbRestrict: function(value, el)
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
	 * @param value
	 * @param el
	 */
	cbMaxChars: function(value, el)
	{
		// TODO Restrict to text input fields?
		
		var $el = $(el);
		
		if (el.cbMaxChars)
		{
			el.removeEventListener('keypress', el.cbMaxChars);
		}
		
		el.cbMaxChars = function(event)
		{
			if (($el.val() || $el.html()).length >= value)
			{
				event.preventDefault();
			}
		};
		
		el.addEventListener('keypress', el.cbMaxChars);
	},
	
});

/**
 * Register a function to handle a cb-[name] attribute 
 * @memberOf	conbo
 * @returns		{boolean}	Whether or not the attribute handler was registered
 * 
 * @example 
 * // HTML: <div cb-append-value="myProperty"></div>
 * conbo.registerAttribute('appendValue', function(value, el, options, param)
 * {
 * 	el.innerHTML += value;
 * });
 */
conbo.registerAttribute = function(name, handler)
{
	if (!name || !conbo.isFunction(handler))
	{
		conbo.warn("registerAttribute: both a 'name' and 'handler' parameters are required");
		return false;
	}
	
	if (name in conbo.AttributeBindings && !conbo.AttributeBindings[name].custom)
	{
		conbo.warn("registerAttribute: you cannot override built-in attributes");
		return false;
	}
	
	name = 'cb'+name.substr(0,1).toUpperCase()+name.substr(1);
	conbo.AttributeBindings[name] = handler;
	conbo.AttributeBindings[name].custom = true;
	
	return true;
};
