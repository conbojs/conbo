conbo.LocalList = conbo.List.extend
({
	constructor: function(options)
	{
		var defaultName = 'ConboLocalList';
		
		options = conbo.defaults(options || {}, {name:defaultName});
		
		var name = options.name;
		var localStorage = window.localStorage;
		
		if (name == defaultName)
		{
			conbo.warn('No name specified for '+this.toString+', using "'+defaultName+'"');
		}
		
		var getLocal = function()
		{
			return name in localStorage
				? JSON.parse(localStorage.getItem(name) || '[]')
				: options.source || [];
		};
		
		// Sync with LocalStorage
		this.addEventListener(conbo.ConboEvent.CHANGE, function(event)
		{
  			localStorage.setItem(name, JSON.stringify(this.toJSON()));
		}, 
		this, 1000);
		
		options.source = getLocal();
		
		conbo.List.prototype.constructor.call(this, options);
	},
	
	toString: function()
	{
		return 'conbo.LocalList';
	}
	
});

__denumerate(conbo.LocalList.prototype);
