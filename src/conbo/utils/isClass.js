/**
 * isClass utility method
 */
conbo.isClass = function(value)
{
	return !!value && value.prototype instanceof conbo.Class;
};
