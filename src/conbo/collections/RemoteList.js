/**
 * Remote List
 * Used for syncing remote array data with a local List
 * @author Neil Rackett
 */
conbo.RemoteList = conbo.List.extend
({
	//itemClass: conbo.RemoteHash,
	
	/**
	 * Constructor
	 * @param {Object}	options		Object containing 'source' (Array, optional), 'rootUrl', 'command' and (optionally) 'itemClass' parameters
	 */
	constructor: function(options)
	{
		options = conbo.defaults({}, options, this.options);
		
		this.context = options.context;
		this.preinitialize(source, options);
		
		this._httpService = new conbo.HttpService(options);
		this._command = options.command;
		
		var resultHandler = function(event)
		{
			this.source = event.result.toJSON();
			this.dispatchEvent(event);
		};
		
		this._httpService
			.addEventListener('result', resultHandler, this)
			.addEventListener('fault', this.dispatchEvent, this)
			.resultClass = this.constructor;
		
		__denumerate(this);
		
		conbo.List.prototype.constructor.apply(this, arguments);
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
