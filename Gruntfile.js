module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-bower-concat');

	grunt.initConfig({
	    pkg: grunt.file.readJSON('package.json'),
	    copy: {
		    files: {
		    	expand: true,
		    	cwd: 'src/',
		        src: ['**'],
		        dest: '_dist/'
		    },
		    'bootstrap-fonts': {
		    	expand: true,
		    	cwd: 'bower_components/metro-bootstrap/',
		    	src: ['fonts/**'],
		        dest: '_dist/'
		    }
	    },
	    watch: {
			src: {
			    files: ['src/**/*.js','src/**/*.html'],
			    tasks: ['dist'],
			    options: {
			      livereload: true,
			    },
			}
		},
		connect: {
		    server: {
		      options: {
		        port: 3000,
		        base: '_dist'
		      }
		    }
		},
		concat: {
			vendorjs: {
			    src: [
			    	'bower_components/angular/angular.js',
			    	'bower_components/angular-bootstrap/ui-bootstrap-tpls.js'],
			    dest: '_dist/vendor.js'
			},
			vendorcss: {
			    src: [
			    	'bower_components/bootstrap/dist/css/bootstrap.css',
			    	'bower_components/metro-bootstrap/css/metro-bootstrap.css'],
			    dest: '_dist/vendor.css'
			}

		},
		clean: ["_tmp", "_dist", "bower_components", "node_modules"]
	});
	grunt.registerTask('vendor-libs', ['copy:bootstrap-fonts','concat:vendorjs','concat:vendorcss'])
	grunt.registerTask('dist', ['vendor-libs', 'copy']);
	grunt.registerTask('default', ['dist', 'connect','watch']);

};
