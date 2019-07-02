/*
 * Router example for ConboJS
 * Demonstrates how to use basic routing in ConboJS using ES2015 and class import 
 * 
 * @author	Neil Rackett
 */

/**
 * Namespaces enable ConboJS binding, this example uses the default namespace, but you can speficy your own using conbo('my.namespace.here')
 */
let ns = conbo();

class MyRouter extends conbo.Router
{
	declarations()
	{
		// Route:Name pairs
		this.routes =
		{
			'bold/:name': 'BoldView',
			'italic(/:name)': 'ItalicView'
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
		this.template = '<b>Hello {{name}}!</b>';
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
		this.template = '<i>See you later, {{name}}!</i>';
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

		// Forces all class methods to be scoped to "this"
		this.bindAll();
	}
	
	creationComplete()
	{
		this.router
			.addEventListener(conbo.ConboEvent.FAULT, this.faultHandler, this) // Unrecognised route
			.addEventListener(conbo.ConboEvent.ROUTE, this.routeHandler, this) // Recognised route
			.start()
			;
	}
	
	routeHandler(event)
	{
		var options = {name:event.parameters[0]};
		
		this.content.innerHTML = '';
		this.content.appendChild(new ns[event.name](options).el);
	}
	
	faultHandler(event)
	{
		this.content.innerHTML = "I don't recognise that route, try another one from the list below!";
	}
}

// Import view classes to your namespace to enable auto instantiation
ns.import({ RouterExample, BoldView, ItalicView });
