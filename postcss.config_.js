module.exports = function(context) {
  /**
   * context comes from what you pass
   * into `gulp-postcss`, omitting detailing here
   * since `gulp` is an implementation detail
   */
  let { options } = context;
  const purgecss = require('@fullhuman/postcss-purgecss')({

    // Specify the paths to all of the template files in your project 
    content: [
      './src/**/*.html',
      './src/**/*.vue',
      './src/**/*.jsx',
      // etc.
    ],

    // Include any special characters you're using in this regular expression
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
  })

  let plugins = [
    require('postcss-import')({
      path: ['node_modules'],
    }),
    require('postcss-cssnext')({
      browsers: ['last 2 versions']
    }),
    require('tailwindcss')('./tailwind.config.js'),
    //purgecss,
  ];

  return {
    plugins,
  };
};