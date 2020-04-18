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
	},

	// Web Storage API

	// /**
	//  * The read-only length property returns the number of data items stored in this Hash
	//  */
	// TODO Can we implement length without messing up JSON values?
	// get length()
	// {
	// 	return conbo.keys(this.toJSON()).length;
	// },

	/**
	 * [Web Storage API] When passed a number n, this method will return the name of the nth key in the Hash
	 * @param {number} index
	 */
	key: function(index)
	{
		var keys = conbo.keys(this.toJSON()).sort();
		return keys[index];
	},
	
	/**
	 * [Web Storage API] When passed a key name, will return that key's value
	 * @param {string} keyName
	 */
	getItem: function(keyName)
	{
		return this[keyName];
	},
	
	/**
	 * [Web Storage API] When passed a key name and value, will add that key to the Hash, or update that key's value if it already exists
	 * @param {string} keyName
	 * @param {*} keyValue
	 */
	setItem: function(keyName, keyValue)
	{
		if (!conbo.isAccessor(this, keyName))
		{
			conbo.makeBindable(this, keyName);
		}

		this[keyName] = keyValue;
	},

	/**
	 * [Web Storage API] When passed a key name, will remove that key from the Hash (or set it to undefined if it cannot be deleted)
	 * @param {string} keyName
	 */
	removeItem: function(keyName)
	{
		if (!(keyName in this)) return;

		if (!(delete this[keyName]))
		{
			this.setItem(keyName, undefined);
		}
	},

	/**
	 * [Web Storage API] When invoked, will empty all keys out of the Hash (or set them to undefined if they cannot be deleted)
	 */
	clear: function()
	{
		var keys = conbo.keys(this.toJSON());

		for (var keyName in keys)
		{
			this.removeItem(keyName);
		}
	},

});

__denumerate(conbo.Hash.prototype);
