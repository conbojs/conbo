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
					"temp/conbo.core.tmp":
					[
					 	"src/conbo/utils/native.js",
					 	"src/conbo/utils/underscore.js",
					 	"src/conbo/utils/jquery.js",
					 	"src/conbo/utils/css.js",
					 	"src/conbo/core/Class.js",
					 	"src/conbo/core/Injectable.js",
						"src/conbo/events/Event.js",
						"src/conbo/events/ConboEvent.js",
						"src/conbo/events/EventDispatcher.js",
						"src/conbo/core/Bindable.js",
						"src/conbo/core/Context.js",
						"src/conbo/data/Hash.js",
						"src/conbo/utils/AttributeBindings.js",
						"src/conbo/utils/BindingUtils.js",
						"src/conbo/utils/toCamelCase.js",
						"src/conbo/view/View.js",
						"src/conbo/core/Application.js",
						"src/conbo/core/Command.js",
						"src/conbo/core/ServerApplication.js"
					],
					
					"temp/conbo.net.tmp":
					[
						"src/conbo/data/Model.js",
						"src/conbo/collections/Collection.js",
						"src/conbo/net/History.js",
						"src/conbo/net/Router.js",
						"src/conbo/net/sync.js"
					],
					
					"build/conbo.core.js":
					[
						"src/conbo/header.txt",
						"temp/conbo.core.tmp",
						"src/conbo/footer.txt"
					],
					
					"build/conbo.js":
					[
						"src/conbo/header.txt",
						"temp/conbo.core.tmp",
						"temp/conbo.net.tmp",
						"src/conbo/footer.txt"
					]
				}
			}
		},
		
		clean: ['temp'],
	
		uglify: 
		{
			core: 
			{
				src: 'build/conbo.core.js',
				dest: 'build/conbo.core.min.js'
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
