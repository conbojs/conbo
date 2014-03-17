/**
 * Attribute Bindings
 * 
 * Functions that can be used to bind DOM elements to properties of Bindable 
 * class instances to DOM elements via their attributes
 * 
 * @example		<div cb-hide="property">Hello!</div>
 * @author 		Neil Rackett
 */
conbo.AttributeBindings = conbo.Class.extend({},
{
	/**
	 * Makes an element visible
	 * 
	 * @param value
	 * @param el
	 */
	cbShow: function(value, el)
	{
		this.hide(!value, el);
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
		this.exclude(!value, el);
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
	cbClass: function(value, el, className)
	{
		if (!className)
		{
			console.warn('cb-class attributes must specify one or more CSS classes in the format cb-class="myProperty:className"');
			return;
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
	cbRepeat: function(values, el)
	{
		var a, 
			views = [], 
			$el = $(el), 
			$next;
		
		switch (true)
		{
			case values instanceof Array:
				a = values;
				break;
				
			case values instanceof conbo.Collection:
				a = values.toArray();
				break;
				
			default:
				a = [];
				break;
		}
				
		$el.removeClass('cb-exclude');
		$next = $el;
		
		while ($next = $next.next('.cb-repeat'))
		{
			$next.remove();
		}
		
		a.forEach(function(value)
		{
			var view = new conbo.View({model:value, el:$el.clone()});
			views.push(view.el);
		});
		
		$el.addClass('cb-exclude');
		$el.after(views);
	}
	
});