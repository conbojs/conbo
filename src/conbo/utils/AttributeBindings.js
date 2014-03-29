/**
 * Attribute Bindings
 * 
 * Functions that can be used to bind DOM elements to properties of Bindable 
 * class instances to DOM elements via their attributes
 * 
 * @example		<div cb-hide="property">Hello!</div>
 * @author 		Neil Rackett
 */
conbo.AttributeBindings = conbo.Class.extend
({
	initialize: function()
	{
		this.cbClass.multiple = true;
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
	 * entities before rendering them, e.g. "8 < 10" -> "8 &lt; 10"
	 * 
	 * @param value
	 * @param el
	 */
	cbText: function(value, el)
	{
		if (!value) value = '';
		
		var textArea;
		
		textArea = document.createElement('textarea');
		textArea.innerHTML = value;
		
		$(el).html(textArea.innerHTML);
	},
	
	/**
	 * Applies or removes a CSS class to or from the element based on the value
	 * of the bound property, e.g. cb-css-my-class="myValue" will apply the 
	 * "my-class" CSS class to the element when "myValue" equates to true.
	 * 
	 * @param value
	 * @param el
	 */
	cbClass: function(value, el, options, className)
	{
		if (!className)
		{
			throw new Error('cb-class attributes must specify one or more CSS classes in the format cb-class="myProperty;class-name"');
		}
		
		var $el = $(el);
		
		!!value
			? $el.addClass(className)
			: $el.removeClass(className);
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
			args = _.toArray(arguments),
			$el = $(el),
			viewClass;
		
		if (options && options.context && options.context.app)
		{
			viewClass = options.context.app.getClass(itemRendererClassName);
		}
		
		viewClass || (viewClass = conbo.View);
		el.cbData || (el.cbData = {});
		
		elements = el.cbData.elements || [];
		
		$el.removeClass('cb-exclude');
		
		if (el.cbData.list != values && values instanceof conbo.List)
		{
			if (!!el.cbData.list)
			{
				el.cbData.list.off('add remove change', el.cbData.changeHandler);
			}
			
			el.cbData.changeHandler = this.proxy(function(event)
			{
				this.cbRepeat.apply(this, args);
			});
			
			values.on('add remove change', el.cbData.changeHandler);
			el.cbData.list = values;
		}
		
		switch (true)
		{
			case values instanceof Array:
				a = values;
				break;
				
			case values instanceof conbo.List:
				a = values.toArray();
				break;
				
			default:
				a = [];
				break;
		}
		
		if (!!elements.length)
		{
			$(elements[0]).before($el);
		}
		
		while (elements.length)
		{
			$(elements.pop()).remove();
		}
		
		a.forEach(function(value)
		{
			if (!(value instanceof conbo.Hash))
			{
				value = new conbo.Hash(value);
			}
			
			var $clone = $el.clone().removeAttr('cb-repeat'),
				view = new viewClass(_.extend({model:value, el:$clone}, options));
			
			view.$el.addClass('cb-repeat');
			
			elements.push(view.el);
		});
		
		$el.after(elements);
		el.cbData.elements = elements;
		
		!!elements.length
			? $el.remove()
			: $el.addClass('cb-exclude');
	}
	
});