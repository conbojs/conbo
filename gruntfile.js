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
					// conbo-lite.js
					
					"build/conbo-lite.js":
					[
					 	"src/conbo/header-lite.txt",
					 	"src/conbo/conbo.js",
					 	"src/conbo/utils/utils.js",
					 	"src/conbo/core/Class.js",
					 	"src/conbo/utils/Namespace.js",
						"src/conbo/events/Event.js",
						"src/conbo/events/ConboEvent.js",
						"src/conbo/events/EventDispatcher.js",
						"src/conbo/data/Hash.js",
						"src/conbo/data/LocalHash.js",
					 	"src/conbo/utils/Promise.js",
						"src/conbo/view/Glimpse.js",
						"src/conbo/footer.txt"
					],
					
					// conbo.js
					
					"build/conbo.js":
					[
						"src/conbo/header.txt",
					 	"src/conbo/conbo.js",
					 	"src/conbo/utils/utils.js",
					 	"src/conbo/utils/dom.js",
					 	"src/conbo/utils/css.js",
					 	"src/conbo/core/Class.js",
					 	"src/conbo/utils/Namespace.js",
					 	"src/conbo/core/IInjectable.js",
					 	"src/conbo/core/IPreinitialize.js",
						"src/conbo/events/Event.js",
						"src/conbo/events/ConboEvent.js",
						"src/conbo/events/EventDispatcher.js",
						"src/conbo/core/Context.js",
						"src/conbo/data/Hash.js",
						"src/conbo/data/LocalHash.js",
						"src/conbo/collections/List.js",
						"src/conbo/collections/LocalList.js",
						"src/conbo/utils/AttributeBindings.js",
						"src/conbo/utils/BindingUtils.js",
						"src/conbo/utils/MutationObserver.js",
					 	"src/conbo/utils/Promise.js",
					 	"src/conbo/view/IDataRenderer.js",
						"src/conbo/view/Glimpse.js",
						"src/conbo/view/View.js",
						"src/conbo/core/Application.js",
						"src/conbo/core/Command.js",
						"src/conbo/core/ServerApplication.js",
						"src/conbo/net/HttpService.js",
						"src/conbo/net/AsyncToken.js",
						"src/conbo/net/Responder.js",
						"src/conbo/net/ISyncable.js",
						"src/conbo/data/RemoteHash.js",
						"src/conbo/collections/RemoteList.js",
						"src/conbo/net/History.js",
						"src/conbo/net/Router.js",
						"src/conbo/footer.txt"
					]
				}
			}
		},
		
		uglify: 
		{
			options:
			{
				mangle:
				{
					screw_ie8: true,
					toplevel: true
				},
				
				compress:
				{
					screw_ie8: true,
					negate_iife: true
				}
			},
			
			lite: 
			{
				src: 'build/conbo-lite.js',
				dest: 'build/conbo-lite.min.js'
			},
			
			complete:
			{
				src: 'build/conbo.js',
				dest: 'build/conbo.min.js',
				mangle: true
			}
		},
		
		watch: 
		{
			js: 
			{
				files: ['src/conbo/**/*.js', 'src/conbo/*.txt'],
				tasks: ['concat','uglify']
			}
		}
		
	});
	
//	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	grunt.registerTask('default', ['concat','uglify']);
};
