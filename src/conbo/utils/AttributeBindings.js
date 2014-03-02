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
	show: function(value, el)
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
	hide: function(value, el)
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
	include: function(value, el)
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
	exclude: function(value, el)
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
	html: function(value, el)
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
	text: function(value, el)
	{
		if (!value) value = '';
		
		var textArea;
		
		textArea = document.createElement('textarea');
		textArea.innerHTML = value;
		
		$(el).html(textArea.innerHTML);
	}
	
});