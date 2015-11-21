/**
 * Hash that stores data in LocalStorage
 */
conbo.LocalHash = conbo.Hash.extend
({
	constructor: function(defaults, options)
	{
		conbo.defaults(options || {}, {name:'ConboLocalHash'});
		
		var name = options.name;
		
		var getLocal = function()
		{
			return JSON.parse(window.localStorage[name] || '{}');
		};
		
		this.defaults = conbo.defaults(this, getLocal(), defaults, this.defaults);
		
		// Sync with LocalStorage
		this.addEventListener(conbo.ConboEvent.CHANGE, function(event)
  		{
			var local = getLocal();
  			local[event.property] = event.value;
  			window.localStorage[name] = JSON.stringify(local);
  		}, 
  		this);
		
		conbo.Hash.prototype.constructor(defaults, options);		
	},
	
	toString: function()
	{
		return 'conbo.LocalHash';
	}
	
});