/**
 * Example of how to use bind arrays and Collections using cb-repeat
 * attributes with Conbo.js
 * 
 * @author	Neil Rackett
 */
(function(undefined)
{
	'use strict'
	
	var app = {};
	
	app.MyContext = conbo.Context.extend
	({
		initialize: function()
		{
			var myCollection = new conbo.Collection([{name:'Tom'}, {name:'Dick'}, {name:'Sally'}]);
			
			this.mapSingleton('myCollection', myCollection);
		}
	});
	
	app.MyApp = conbo.Application.extend
	({
		contextClass: app.MyContext,
		
		myCollection: undefined,
		
		boysNames:
		[
			'Aaron','Abdul','Abdullah','Abel','Abraham','Abram','Abriel','Ace','Adam','Adan'
			,'Ade','Aden','Adnan','Adrian','Ahmad','Ahmed','Aidan','Aiden','Ainsley','Al'
			,'Alain','Alan','Alastair','Albert','Alberto','Albie','Alden','Aldo','Alec','Alejandro'
			,'Alen','Alesandro','Alex','Alexander','Alexis','Alfie','Alfonso','Alfred','Alfredo','Ali'
			,'Alistair','Allan','Allen','Alonzo','Aloysius','Alphonso','Alton','Alvin','Amari','Amir'
			,'Amit','Amos','Andre','Andreas','Andres','Andrew','Andy','Angel','Angelo','Angus'
			,'Anthony','Anton','Antonio','Antony','Aran','Archer','Archie','Ari','Arjun','Arlo'
			,'Arman','Armando','Arnold','Arrie','Art','Arthur','Arturo','Arwin','Asa','Asad'
			,'Ash','Asher','Ashley','Ashton','Asif','Aspen','Aston','Atticus','Aubrey','Audwin'
			,'August','Augustus','Austen','Austin','Avery','Axel','Ayaan','Ayden','Bailey','Barclay'
			,'Barnaby','Barney','Barry','Bart','Bartholomew','Basil','Bay','Baylor','Beau','Beck'
			,'Beckett','Bellamy','Ben','Benedict','Benjamin','Benji','Benjy','Bennett','Bennie','Benny'
			,'Benson','Bentley','Bernard','Bernardo','Bernie','Bert','Bertie','Bertram','Bevan','Bill'
			,'Billy','Bladen','Blain','Blaine','Blair','Blaise','Blake','Blaze','Bob','Bobby'
			,'Bodie','Boris','Boston','Boyd','Brad','Braden','Bradford','Bradley','Bradwin','Brady'
			,'Braeden','Bram','Branden','Brandon','Brantley','Braxton','Brayan','Brayden','Braydon','Brendan'
			,'Brenden','Brendon','Brennan','Brent','Bret','Brett','Brevyn','Brian','Brice','Brinley'
			,'Brock','Brodie','Brody','Brogan','Bronson','Bruce','Bruno','Bryan','Bryant','Bryce'
		],
		
		initialize: function()
		{
			this.proxyAll();
		},
		
		addItem: function(event)
		{
			var name = this.boysNames.shift();
			this.boysNames.push(name);
			
			this.myCollection.push({name:name});
		},
		
		removeItem: function(event)
		{
			this.myCollection.pop();
		}
	});
	
	new app.MyApp({namespace:app});
	
})();