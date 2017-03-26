/**
 * conbo.Hash
 * A Hash is a bindable object of associated keys and values
 * 
 * @class		conbo.Hash
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{object} options - Object containing optional initialisation options, including 'source' (object) containing initial values
 * @fires		conbo.ConboEvent#CHANGE
 */
conbo.Hash = conbo.EventDispatcher.extend(
/** @lends conbo.Hash.prototype */
{
	/**
	 * @deprecated 
	 * @member		{object}	_defaults - The default values to use if not all properties are set. 
	 * 										This property is now deprected, defaults should be set in declarations() 
	 * @memberOf	conbo.Hash.prototype
	 */
	
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 */
	__construct: function(options)
	{
		if (!!options.context) 
		{
			this.context = options.context;
		}
		
		conbo.setValues(this, conbo.setDefaults({}, options.source, this.toJSON(), this._defaults));
		delete this._defaults;
	},
	
	/**
	 * Returns a version of this object that can easily be converted into JSON
	 * @function
	 */
	toJSON: conbo.jsonify,
	
	toString: function()
	{
		return 'conbo.Hash';
	}
	
});

__denumerate(conbo.Hash.prototype);
