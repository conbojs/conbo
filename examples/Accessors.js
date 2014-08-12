/**
 * Binding example for Conbo.js
 * 
 * @author	Neil Rackett
 */
(function(window, undefined)
{
	var ns = {};
	
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
	
	window.app = new ns.MyApp();
	
})(this);