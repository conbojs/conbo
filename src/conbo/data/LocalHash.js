/**
 * A persistent Hash that stores data in LocalStorage or Session
 * 
 * @class		LocalHash
 * @memberof	conbo
 * @augments	conbo.Hash
 * @author 		Neil Rackett
 * @param 		{Object} options - Object containing initialisation options, including 'name' (string), 'session' (Boolean) and 'source' (object) containing default values; see Hash for other options
 * @fires		conbo.ConboEvent#CHANGE
 */
conbo.LocalHash = conbo.Hash.extend(
/** @lends conbo.LocalHash.prototype */
{
	__construct: function(options)
	{
		var defaultName = 'ConboLocalHash';
		
		options = conbo.defineDefaults(options, {name:defaultName});
		
		var name = options.name;
		
		var storage = options.session
			? window.sessionStorage
			: window.localStorage;
		
		if (name == defaultName)
		{
			conbo.warn('No name specified for '+this.toString()+', using "'+defaultName+'"');
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
  		{scope:this, priority:1000});
		
		options.source = getLocal();
		
		conbo.Hash.prototype.__construct.call(this, options);
	},
	
	/**
	 * Immediately writes all data to local storage. If you don't use this method, 
	 * Conbo writes the data the next time it detects a change to a bindable property.
	 */
	flush: function()
	{
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE));
		return this;
	},
	
	toString: function()
	{
		return 'conbo.LocalHash';
	}
	
});

__denumerate(conbo.LocalHash.prototype);
