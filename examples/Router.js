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
				'2(/:name)': 'ItalicView', 
				'*invalid': ''
			}
		}
	}
	
	class MyContext extends conbo.Context
	{
		initialize()
		{
			this.mapSingleton('router', MyRouter);
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
			this.template = '<i>See you later <span cb-text="name"></span>!</i>';
		}
	}
	
	class RouterExample extends conbo.Application
	{
		declarations()
		{
			this.contextClass = MyContext;
			this.namespace = ns;
			
			this.router = undefined;
		}
		
		initialize()
		{
			this.router
				.addEventListener('route', this.routeHandler, this)
				.start()
				;
		}
		
		routeHandler(event)
		{
			if (event.name)
			{
				this.content = new ns[event.name]().el;
				return;
			}
			
			console.log(this);
			
			this.content.innerHTML = "Click a link below to test the router!";
		}
	}
	
	return {
		RouterExample: RouterExample,
		BoldView: BoldView,
		ItalicView: ItalicView
	}
	
});
