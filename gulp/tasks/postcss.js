'use strict';

import path from 'path';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss'
import gulpif from 'gulp-if';
import gulp from 'gulp';
import postCssImport from 'postcss-import';
import { plugins, args, config, taskTarget, browserSync } from '../utils';

let dirs = config.directories;
let entries = config.entries;
let dest = path.join(taskTarget, dirs.styles.replace(/^_/, ''));
const purgecss = require('@fullhuman/postcss-purgecss')({

  // Specify the paths to all of the template files in your project 
  content: [
    '../../src/_layouts/*.nunjucks',
    // './src/**/*.html',
    // './src/**/*.vue',
    // './src/**/*.jsx',
    // etc.
  ],

  // Include any special characters you're using in this regular expression
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
})
var postCssPlugins = [
  postCssImport({
    path: [
      path.join(dirs.source, dirs.styles),
      path.join(dirs.source, dirs.modules)
    ]
  }),
  tailwindcss(),
  autoprefixer(),
  purgecss
];

// PostCSS compilation
gulp.task('postcss', () => {
  return gulp
    .src(entries.css, { cwd: path.join(dirs.source, dirs.styles) })
    .pipe(plugins.plumber())
    .pipe(gulpif(!args.production, plugins.sourcemaps.init({ loadMaps: true })))
    .pipe(plugins.postcss(postCssPlugins))
    .on('error', function(err) {
      plugins.util.log(err);
    })
    .pipe(
      plugins.rename(function(path) {
        // Remove 'source' directory as well as prefixed folder underscores
        // Ex: 'src/_styles' --> '/styles'
        path.dirname = path.dirname.replace(dirs.source, '').replace('_', '');
      })
    )
    .pipe(gulpif(args.production, plugins.cssnano({ rebase: false })))
    .pipe(gulpif(!args.production, plugins.sourcemaps.write('./')))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.stream({ match: '**/*.css' }));
});
