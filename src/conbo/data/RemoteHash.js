/**
 * Remote Hash
 * Used for syncing remote data with a local Hash
 * @author Neil Rackett
 */
conbo.RemoteHash = conbo.Hash.extend
({
	/**
	 * Constructor
	 * @param {Object}	options		Object containing `source` (initial properties), `rootUrl` and `command` parameters
	 */
	constructor: function(options)
	{
		options = conbo.defaults({}, options, this.options);
		
		if (!!options.context) this.context = options.context;
		this.preinitialize(options);
		
		this._httpService = new conbo.HttpService(options);
		this._command = options.command;
		
		var resultHandler = function(event)
		{
			conbo.makeBindable(this, conbo.properties(event.result));
			conbo.setValues(this, event.result);
			
			this.dispatchEvent(event);
		};
		
		this._httpService
			.addEventListener('result', resultHandler, this)
			.addEventListener('fault', this.dispatchEvent, this);
		
		__denumerate(this);
		
		conbo.Hash.prototype.constructor.apply(this, arguments);
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
		this._httpService.call(this._command, this.toJSON(), 'DELETE');
		return this;
	},
	
	toString: function()
	{
		return 'conbo.RemoteHash';
	}
	
}).implement(conbo.ISyncable, conbo.IPreinitialize);

__denumerate(conbo.HttpService.prototype);
