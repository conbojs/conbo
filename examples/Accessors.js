/**
 * Binding example for Conbo.js
 * 
 * @author	Neil Rackett
 */
conbo('ns', this, conbo, function(window, conbo, undefined)
{
	'use strict'
	
	var ns = this;
	
	ns.MyApp = conbo.Application.extend
	({
		/**
		 * You can set the namespace here to enable
		 * views to be automatically applied to HTML
		 */
		namespace: ns,
		
		/**
		 * You can use the get/set syntax with the dispatchChange method
		 * to create bindable accessors
		 */
		get name()
		{
			return this._name;
		},
		
		set name(value)
		{
			this._name = value;
			this.dispatchChange('name');
		},
		
		/**
		 * Entry point
		 */
		initialize: function()
		{
			this.name = 'Conbo';
		},
		
		toString: function()
		{
			return 'ns.MyApp';
		}
	});
	
	/**
	 * When instantiated an Application without specifying an element, it will
	 * automatically seek out the first DOM element with a matching cp-app
	 * attribute
	 */
	window.app = new ns.MyApp();
	
});