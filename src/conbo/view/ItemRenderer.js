/**
 * ItemRenderer
 * 
 * A conbo.View class that implements the conbo.IDataRenderer interface
 * 
 * @class		ItemRenderer
 * @memberof	conbo
 * @augments	conbo.View
 * @augments	conbo.IDataRenderer
 * @param 		{Object} [options] - Object containing initialisation options
 * @see			conbo.View
 * @author 		Neil Rackett
 */
conbo.ItemRenderer = conbo.View.extend().implement(conbo.IDataRenderer);

/**
 * Data to be rendered
 * @member		{*}			data
 * @memberof	conbo.ItemRenderer.prototype
 */

 /**
 * Index of the current item
 * @member		{number}	index
 * @memberof	conbo.ItemRenderer.prototype
 */

/**
 * Is this the last item in the list?
 * @member		{boolean}	isLast
 * @memberof	conbo.ItemRenderer.prototype
 */

/**
 * The list containing the data for this item
 * @member		{(conbo.List|Array)}	list
 * @memberof	conbo.ItemRenderer.prototype
 */
