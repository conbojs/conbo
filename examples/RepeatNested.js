/**
 * Example of how to use cb-repeat to display nested arrays
 * using ConboJS
 * 
 * @author	Neil Rackett
 */
conbo('conbo', function(undefined)
{
	'use strict'
	
	var ns = this;
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		
		myList:
		[
			{
				label: 'Boys names',
				names: ['Aaron','Abdul','Abdullah','Abel','Abraham','Abram','Abriel','Ace','Adam','Adan']
			},
			{
				label: 'Girls names',
				names: ['Kalea','Kaleigh','Kali','Kalia','Kamala','Kamryn','Kara','Karen','Kari','Karin']
			}
		]
	});
	
});