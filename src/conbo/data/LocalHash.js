/**
 * Hash that stores data in LocalStorage
 */
conbo.LocalHash = conbo.Hash.extend
({
	constructor: function(options)
	{
		options = conbo.defaults(options || {}, {name:'ConboLocalHash'});
		
		var name = options.name;
		var localStorage = window.localStorage;
		
		var getLocal = function()
		{
			return name in localStorage 
				? JSON.parse(localStorage.getItem(name) || '{}')
				: options.source || {};
		};
		
		// Sync with LocalStorage
		this.addEventListener(conbo.ConboEvent.CHANGE, function(event)
  		{
  			localStorage.setItem(name, JSON.stringify(this.toJSON()));
  		}, 
  		this, 1000);
		
		options.source = getLocal();
		
		conbo.Hash.prototype.constructor.call(this, options);		
	},
	
	toString: function()
	{
		return 'conbo.LocalHash';
	}
	
});

__denumerate(conbo.LocalHash.prototype);
