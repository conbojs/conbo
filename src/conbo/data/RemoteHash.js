/**
 * Remote Hash
 * Used for syncing remote data with a local Hash
 * @author Neil Rackett
 */
conbo.RemoteHash = conbo.Hash.extend
({
	/**
	 * Constructor
	 * @param {Object}	source		Object containing initial properties
	 * @param {Object}	options		Object containing 'rootUrl' and 'command' parameters
	 */
	constructor: function(source, options)
	{
		options || (options = {});
		
		this.bindAll('_resultHandler');
		
		this._httpService = new conbo.HttpService(options);
		this._command = options.command;
		
		this._httpService
			.addEventListener('result', this._resultHandler)
			.addEventListener('fault', this.bind(this.dispatchEvent));
		
		_denumerate(this);
		
		conbo.Hash.prototype.constructor.apply(this, arguments);
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
		return 'conbo.RemoteHash';
	},
	
	_resultHandler: function(event)
	{
		conbo.extend(this, event.result);
		this.dispatchEvent(new conbo.ConboEvent(conbo.ConboEvent.CHANGE));
	}
	
}).implement(conbo.ISyncable);

_denumerate(conbo.HttpService.prototype);
