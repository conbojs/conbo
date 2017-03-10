/**
 * Hello World example for ConboJS
 * Demonstrates how to create a new ConboJS Application
 * 
 * @author	Neil Rackett
 */

conbo('example', function()
{
	/**
	 * Namespaces enable ConboJS binding
	 */
	var ns = this;
	
	class MyRouter extends conbo.Router
	{
		declarations()
		{
			// Route:Name pairs
			this.routes =
			{
				'bold/:name': 'BoldView',
				'italic(/:name)': 'ItalicView', 
				'*invalid': ''
			}
		}
	}
	
	class MyContext extends conbo.Context
	{
		initialize()
		{
			this.mapSingleton('router', MyRouter, this.addTo());
		}
	}
	
	class BoldView extends conbo.View
	{
		declarations(options)
		{
			this.template = '<b>Hello <span cb-text="name"></span>!</b>';
		}
		
		initialize(options)
		{
			this.name = options.name || 'whoever you are';
		}
	}
	
	class ItalicView extends BoldView
	{
		declarations(options)
		{
			this.template = '<i>See you later, <span cb-text="name"></span>!</i>';
		}
	}
	
	class RouterExample extends conbo.Application
	{
		declarations()
		{
			this.contextClass = MyContext;
			this.namespace = ns;
			
			// Use undefined for property injection
			this.router = undefined;
		}
		
		initialize()
		{
			this.addEventListener('creationcomplete', this.creationCompleteHandler, this);
		}
		
		creationCompleteHandler(event)
		{
			this.router
				.addEventListener('route', this.routeHandler, this)
				.start()
				;
		}
		
		routeHandler(event)
		{
			this.content.innerHTML = '';
			
			if (event.name)
			{
				var options = {name:event.parameters[0]};
				this.content.appendChild(new ns[event.name](options).el);
				return;
			}
			
			this.content.innerHTML = "Click a link below to test the router!";
		}
	}
	
	// Appends the specified classes to the current namespace
	return {
		RouterExample: RouterExample,
		BoldView: BoldView,
		ItalicView: ItalicView
	}
	
});
