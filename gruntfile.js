module.exports = function (grunt) 
{
	grunt.initConfig
	({
		concat:
		{
			all:
			{
				files:
				{
					// Lite
					
					"temp/conbo-lite.tmp":
					[
					 	"src/conbo/utils/utils.js",
					 	"src/conbo/core/Class.js",
						"src/conbo/events/Event.js",
						"src/conbo/events/ConboEvent.js",
						"src/conbo/events/EventDispatcher.js",
						"src/conbo/data/Hash.js",
						"src/conbo/view/Glimpse.js"
					],
					
					"build/conbo-lite.js":
					[
						"src/conbo/header.txt",
						"temp/conbo-lite.tmp",
						"src/conbo/footer-lite.txt"
					],
					
					// Core
					
					"temp/conbo-core.tmp":
					[
					 	"src/conbo/utils/utils.js",
					 	"src/conbo/utils/dom.js",
					 	"src/conbo/utils/css.js",
					 	"src/conbo/core/Class.js",
					 	"src/conbo/core/IInjectable.js",
					 	"src/conbo/core/IPreinitialize.js",
						"src/conbo/events/Event.js",
						"src/conbo/events/ConboEvent.js",
						"src/conbo/events/EventDispatcher.js",
						"src/conbo/core/Context.js",
						"src/conbo/data/Hash.js",
						"src/conbo/collections/List.js",
						"src/conbo/utils/AttributeBindings.js",
						"src/conbo/utils/BindingUtils.js",
						"src/conbo/utils/toCamelCase.js",
					 	"src/conbo/view/IDataRenderer.js",
						"src/conbo/view/Glimpse.js",
						"src/conbo/view/View.js",
						"src/conbo/core/Application.js",
						"src/conbo/core/Command.js",
						"src/conbo/core/ServerApplication.js"
					],
					
					"temp/conbo-net.tmp":
					[
						// Conbo
						"src/conbo/net/HttpService.js",
						"src/conbo/net/AsyncToken.js",
						"src/conbo/net/Responder.js",
						"src/conbo/net/ISyncable.js",
						"src/conbo/collections/RemoteList.js",
						"src/conbo/data/RemoteHash.js",
						
						// Legacy
						"src/conbo/net/History.js",
						"src/conbo/net/Router.js",
					],
					
					"build/conbo-core.js":
					[
						"src/conbo/header.txt",
						"temp/conbo-core.tmp",
						"src/conbo/footer.txt"
					],
					
					"build/conbo.js":
					[
						"src/conbo/header.txt",
						"temp/conbo-core.tmp",
						"temp/conbo-net.tmp",
						"src/conbo/footer.txt"
					]
				}
			}
		},
		
		clean: ['temp'],
		
		uglify: 
		{
			lite: 
			{
				src: 'build/conbo-lite.js',
				dest: 'build/conbo-lite.min.js'
			},
			
			core: 
			{
				src: 'build/conbo-core.js',
				dest: 'build/conbo-core.min.js'
			},
			
			complete:
			{
				src: 'build/conbo.js',
				dest: 'build/conbo.min.js'
			}
		},
		
		watch: 
		{
			js: 
			{
				files: ['src/conbo/**/*.js', 'src/conbo/*.txt'],
				tasks: ['concat','clean','uglify']
			}
		}
		
	});
	
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	grunt.registerTask('default', ['concat','clean','uglify']);
};
