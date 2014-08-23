/**
 * Remote List
 * Used for syncing remote array data with a local List
 * @author Neil Rackett
 */
conbo.RemoteList = conbo.List.extend
({
	itemClass: conbo.RemoteHash,
	
	/**
	 * Constructor
	 * @param {Array}	source
	 * @param {Object}	options		Object containing 'rootUrl', 'command' and (optionally) 'itemClass' parameters
	 */
	constructor: function(source, options)
	{
		options || (options = {});
		
		this.bindAll('_resultHandler');
		
		this._httpService = new conbo.HttpService(options);
		this._command = options.command;
		
		this._httpService
			.addEventListener('result', this._resultHandler)
			.addEventListener('fault', this.bind(this.dispatchEvent))
			.resultClass = this.itemClass;
		
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
		this._httpService.call(this._command, this.toJSON(), 'PUT');
		return this;
	},
	
	toString: function()
	{
		return 'conbo.RemoteList';
	},
	
	_resultHandler: function(event)
	{
		this.source = event.result.source;
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE));
	}
	
}).implement(conbo.ISyncable);

_denumerate(conbo.HttpService.prototype);
