/**
 * Hello World example for ConboJS
 * Demonstrates how to create a new ConboJS Application
 * 
 * @author	Neil Rackett
 */
conbo('ns', conbo, function(conbo)
{
	var ns = this;
	
	ns.MyApp = conbo.Application.extend
	({
		get namespace()
		{
			return ns;
		},
		
		declarations: function(options)
		{
			this.now = Date.now();
			this.template = '<pre cb-html="status"></pre>';
			this.status = "1. declarations() called after 0ms\n";
		},
		
		preinitialize: function(options)
		{
			var timer = Date.now() - this.now;
			this.status += "2. preinitialize() called after "+timer+"ms\n";
		},
		
		initialize: function(options)
		{
			var timer = Date.now() - this.now;
			this.status += "3. initialize() called after "+timer+"ms\n";
			this.addEventListener(conbo.ConboEvent.CREATION_COMPLETE, this.creationComplete, this);
		},
		
		creationComplete: function(event)
		{
			var timer = Date.now() - this.now;
			this.status += "4. "+event.type+" event received after "+timer+"ms\n";
		}
		
	});
	
});
