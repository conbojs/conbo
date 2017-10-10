/**
 * Interface class for data renderers, for example an item renderer for
 * use with the cb-repeat attribute
 * 
 * @member		{object}	IDataRenderer
 * @memberof	conbo
 * @author 		Neil Rackett
 */
conbo.IDataRenderer =
{
	/**
	 * Data to be rendered
	 * @type	{*}
	 */
	data: undefined,
	
	/**
	 * Index of the current item
	 * @type	{number}
	 */
	index: -1,
	
	/**
	 * Is this the last item in the list?
	 * @type	{boolean}
	 */
	isLast: false,
	
	/**
	 * The list containing the data for this item
	 * @type	{(conbo.List|Array)}
	 */
	list: undefined
};
