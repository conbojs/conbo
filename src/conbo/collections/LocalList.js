/**
 * LocalList is a persistent List class that is saved into LocalStorage
 * or SessionStorage
 * 
 * @class		LocalList
 * @memberof	conbo
 * @augments	conbo.List
 * @author 		Neil Rackett
 * @param 		{Object} options - Object containing initialisation options, including 'name' (String), 'session' (Boolean) and 'source' (Array) of default options
 * @fires		conbo.ConboEvent#CHANGE
 * @fires		conbo.ConboEvent#ADD
 * @fires		conbo.ConboEvent#REMOVE
 */
conbo.LocalList = conbo.List.extend(
/** @lends conbo.LocalList.prototype */
{
	__construct: function(options)
	{
		var defaultName = 'ConboLocalList';
		
		options = conbo.defineDefaults(options, this.options, {name:defaultName});
		
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
				? JSON.parse(storage.getItem(name) || '[]')
				: options.source || [];
		};
		
		// Sync with LocalStorage
		this.addEventListener(conbo.ConboEvent.CHANGE, function(event)
		{
  			storage.setItem(name, JSON.stringify(this));
		}, 
		this, 1000);
		
		options.source = getLocal();
		
		conbo.List.prototype.__construct.call(this, options);
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
		return 'conbo.LocalList';
	}
	
});

__denumerate(conbo.LocalList.prototype);
