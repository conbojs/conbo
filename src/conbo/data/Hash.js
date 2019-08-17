/**
 * conbo.Hash
 * A Hash is a bindable object of associated keys and values
 * 
 * @class		Hash
 * @memberof	conbo
 * @augments	conbo.EventDispatcher
 * @author 		Neil Rackett
 * @param 		{Object} options - Object containing optional initialisation options, including 'source' (object) containing initial values
 * @fires		conbo.ConboEvent#CHANGE
 */
conbo.Hash = conbo.EventDispatcher.extend(
/** @lends conbo.Hash.prototype */
{
	/**
	 * Constructor: DO NOT override! (Use initialize instead)
	 * @param options
	 * @private
	 */
	__construct: function(options)
	{
		// If this Hash has an external source, ensure it's kept up-to-date
		if (options.source)
		{
			var changeHandler = function(event)
			{
				options.source[event.property] = event.value;
			};

			this.addEventListener('change', changeHandler, {scope:this});
		}

		conbo.assign(this, conbo.setDefaults({}, options.source, this._defaults));
		delete this._defaults;
	},
	
	/**
	 * Returns a version of this object that can easily be converted into JSON
	 * @function
	 * @returns	{Object}
	 */
	toJSON: conbo.jsonify,
	
	toString: function()
	{
		return 'conbo.Hash';
	}
	
});

__denumerate(conbo.Hash.prototype);
