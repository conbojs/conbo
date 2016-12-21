/**
 * Remote List
 * Used for syncing remote array data with a local List
 * 
 * @class		conbo.RemoteList
 * @augments	conbo.List
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing initialisation options, including HttpService options
 */
conbo.RemoteList = conbo.List.extend(
/** @lends conbo.RemoteList.prototype */
{
	//itemClass: conbo.RemoteHash,
	
	/**
	 * Constructor
	 * @param {Object}	options		Object containing 'source' (Array, optional), 'rootUrl', 'command' and (optionally) 'itemClass' parameters
	 */
	__construct: function(options)
	{
		options = conbo.defineDefaults(options, this.options);
		
		this.context = options.context;
		
		this._httpService = new conbo.HttpService(options);
		this._command = options.command;
		
		var resultHandler = function(event)
		{
			this.source = event.result;
			this.dispatchEvent(event);
		};
		
		this._httpService
			.addEventListener('result', resultHandler, this)
			.addEventListener('fault', this.dispatchEvent, this)
			;
		
		__denumerate(this);
		
		conbo.List.prototype.__construct.apply(this, arguments);
	},
	
	load: function()
	{
		this._httpService.call(this._command, this.toJSON(), 'GET');
		return this;
	},
	
	save: function()
	{
		this._httpService.call(this._command, this.toJSON(), 'POST');
		return this;
	},
	
	destroy: function()
	{
		// TODO
	},
	
	toString: function()
	{
		return 'conbo.RemoteList';
	}
	
}).implement(conbo.ISyncable, conbo.IPreinitialize);

__denumerate(conbo.HttpService.prototype);
