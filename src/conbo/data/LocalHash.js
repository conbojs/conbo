/**
 * A persistent Hash that stores data in LocalStorage or Session
 * 
 * @class		conbo.LocalHash
 * @augments	conbo.Hash
 * @author 		Neil Rackett
 */
conbo.LocalHash = conbo.Hash.extend(
/** @lends conbo.LocalHash.prototype */
{
	constructor: function(options)
	{
		var defaultName = 'ConboLocalHash';
		
		options = conbo.defaults(options || {}, {name:defaultName});
		
		var name = options.name;
		
		var storage = options.session
			? window.sessionStorage
			: window.localStorage;
		
		if (name == defaultName)
		{
			conbo.warn('No name specified for '+this.toString+', using "'+defaultName+'"');
		}
		
		var getLocal = function()
		{
			return name in storage 
				? JSON.parse(storage.getItem(name) || '{}')
				: options.source || {};
		};
		
		// Sync with LocalStorage
		this.addEventListener(conbo.ConboEvent.CHANGE, function(event)
  		{
  			storage.setItem(name, JSON.stringify(this.toJSON()));
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
