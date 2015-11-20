/**
 * Example of how to use bind arrays and Collections using cb-repeat
 * attributes with Conbo.js
 * 
 * @author	Neil Rackett
 */
conbo('conbo', function(undefined)
{
	'use strict'
	
	var ns = this;
	
	ns.MyContext = conbo.Context.extend
	({
		initialize: function()
		{
			this.mapSingleton('myList', new conbo.List([{name:'Tom'}, {name:'Dick'}, {name:'Sally'}]));
		}
	});
	
	/**
	 * Very simple item renderer example that simply applies a CSS class
	 * (the cb-repeat item renderer parameter is optional)
	 */
	ns.MyItemRenderer = conbo.View.extend
	({
		className: 'item-renderer',
	}),
	
	ns.MyApp = conbo.Application.extend
	({
		namespace: ns,
		contextClass: ns.MyContext,
		
		myList: undefined,
		
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
		],
		
		girlsNames:
		[
			'Kalea','Kaleigh','Kali','Kalia','Kamala','Kamryn','Kara','Karen','Kari','Karin'
			,'Karina','Karissa','Karla','Karlee','Karly','Karolina','Karyn','Kasey','Kassandra','Kassidy'
			,'Kassie','Kat','Katara','Katarina','Kate','Katelyn','Katelynn','Katerina','Katharine','Katherine'
			,'Kathleen','Kathryn','Kathy','Katia','Katie','Katlyn','Katrina','Katy','Katya','Kay'
			,'Kaya','Kaye','Kayla','Kaylee','Kayleigh','Kayley','Kaylie','Kaylin','Keeley','Keely'
			,'Keira','Keisha','Kelis','Kelley','Kelli','Kellie','Kelly','Kelsey','Kelsie','Kendall'
			,'Kendra','Kennedy','Kenzie','Keri','Kerian','Kerri','Kerry','Kiana','Kiara','Kiera'
			,'Kierra','Kiersten','Kiki','Kiley','Kim','Kimberlee','Kimberley','Kimberly','Kimbriella','Kimmy'
			,'Kinley','Kinsey','Kinsley','Kira','Kirsten','Kirstin','Kirsty','Kiswa','Kitty','Kizzy'
			,'Kora','Kourtney','Kris','Krista','Kristen','Kristi','Kristie','Kristin','Kristina','Kristine'
			,'Kristy','Krystal','Kyla','Kylee','Kyleigh','Kylie','Kyra','Lacey','Lacie','Lacy'
			,'Ladonna','Laila','Lakyn','Lala','Lana','Laney','Lara','Larissa','Latoya','Laura'
			,'Laurel','Lauren','Lauri','Laurie','Lauryn','Lavana','Lavender','Lavinia','Layla','Lea'
			,'Leah','Leandra','Leann','Leanna','Leanne','Lee','Leela','Leena','Leia','Leigh'
			,'Leila','Leilani','Lela','Lena','Lenore','Leona','Leonie','Leora','Lesa','Lesley'
		],
		
		initialize: function()
		{
			this.bindAll();
		},
		
		addItem: function(event)
		{
			var array = (Math.random() > 0.5) ? this.boysNames : this.girlsNames,
				index = Math.floor(Math.random()*array.length),
				name = array[index];
			
			this.myList.push({name:name});
		},
		
		removeItem: function(event)
		{
			this.myList.pop();
		}
	});
	
	/**
	 * ns.initDom automatically scans the DOM for cb-app declarations and
	 * instantiates the appropriate Application instance from the specified
	 * namespace
	 */
	ns.initDom();
	
});