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
		 * Methods prefixed with get_ and set_ will automatically be converted 
		 * into bindable properties when the class is instantiated.
		 * 
		 * If there is only a get_ method, the property will be read-write
		 */
		get_name: function()
		{
			return this._name;
		},
		
		set_name: function(value)
		{
			this._name = value;
		},
		
		/**
		 * If there is only a get_ method, the property will be read-only
		 */
		get_numChildren: function()
		{
			return this.$el.children().length;
		},
		
		/**
		 * And if there is only a set_ method, the property will be write-only
		 */
		set_someValue: function(value)
		{
			this._someValue = value;
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