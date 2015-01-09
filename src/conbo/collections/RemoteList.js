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
	 * @param {Array}	source
	 * @param {Object}	options		Object containing 'rootUrl', 'command' and (optionally) 'itemClass' parameters
	 */
	constructor: function(source, options)
	{
		options = conbo.defaults({}, options, this.options);
		
		this.bindAll('_resultHandler');
		
		this._httpService = new conbo.HttpService(options);
		this._command = options.command;
		
		this._httpService
			.addEventListener('result', this._resultHandler, this)
			.addEventListener('fault', this.dispatchEvent, this)
			.resultClass = this.constructor;
		
		_denumerate(this);
		
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
	},
	
	_resultHandler: function(event)
	{
		this.source = event.result.toJSON();
		this.dispatchEvent(event);
	}
	
}).implement(conbo.ISyncable);

_denumerate(conbo.HttpService.prototype);
