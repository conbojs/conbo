/**
 * Example of how to use cb-* binding attributes with Conbo.js
 * @author	Neil Rackett
 */
(function()
{
	var app = {};
	
	/**
	 * Switch conbo.Hash for conbo.Model if you need web services
	 */
	app.MyModel = conbo.Hash.extend
	({
		defaults: 
		{
			selected: true
		}
	});
	
	app.MyContext = conbo.Context.extend
	({
		/**
		 * Entry point
		 */
		initialize: function()
		{
			this.mapSingleton('myModel', app.MyModel);
		}
	});
	
	app.MyView = conbo.View.extend
	({
		tagName: 'div',
		
		/**
		 * Properties with a value of undefined that have been mapped to 
		 * singletons in the context are automatically injected
		 */
		myModel: undefined,
		
		myValue: "I love binding!",
		
		render: function()
		{
			var html =
				'<label><input type="checkbox" cb-checked="myModel.selected" cb-value="myValue"> Tick the box to toggle text visibility</label>'+
				'<h1 cb-hide="myModel.selected">Not selected :-(</h1>'+
				'<h1 cb-show="myModel.selected">SELECTED! :-)</h1>';
			
			this.html(html);
			return this;
		}
	
	});
	
	app.MyApp = conbo.Application.extend
	({
		/**
		 * Application will automatically use an instance of this class as 
		 * the application's context (event bus); uses vanilla conbo.Context
		 * if not specified
		 */
		contextClass: app.MyContext,
		
		/**
		 * Entry point
		 */
		initialize: function()
		{
			this.appendView(new app.MyView(this.context().addTo()));
		}
	});
	
	new app.MyApp({el:document.body});
	
})();