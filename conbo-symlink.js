/*
 * Adds a 'conbo' symlink to node_modules folder for compatibility with ConboJS libraries
 * @author	Neil Rackett
 */

const fs = require('fs');

fs.symlink(__dirname, `${__dirname}/../conbo`, 'dir', error =>
{
	error
		? console.warn(`WARNING: Unable to create conbo symlink: ${error.message}`)
		: console.log('conbo symlink created')
		;
});
