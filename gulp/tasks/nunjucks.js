'use strict';

import fs from 'fs';
import path from 'path';
import foldero from 'foldero';
import nunjucks from 'gulp-nunjucks-html';
import yaml from 'js-yaml';
import gulp from 'gulp';
import { plugins, args, config, taskTarget, browserSync } from '../utils';

let dirs = config.directories;
let dest = path.join(taskTarget);
let dataPath = path.join(dirs.source, dirs.data);

// Nunjucks template compile
gulp.task('nunjucks', () => {
  let siteData = {};
  if (fs.existsSync(dataPath)) {
    // Convert directory to JS Object
    siteData = foldero(dataPath, {
      recurse: true,
      whitelist: '(.*/)*.+.(json|ya?ml)$',
      loader: function loadAsString(file) {
        let json = {};
        try {
          if (path.extname(file).match(/^.ya?ml$/)) {
            json = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
          } else {
            json = JSON.parse(fs.readFileSync(file, 'utf8'));
          }
        } catch (e) {
          plugins.util.log(`Error Parsing DATA file: ${file}`);
          plugins.util.log('==== Details Below ====');
          plugins.util.log(e);
        }
        return json;
      }
    });
  }

  // Add --debug option to your gulp task to view
  // what data is being loaded into your templates
  if (args.debug) {
    plugins.util.log('==== DEBUG: site.data being injected to templates ====');
    plugins.util.log(siteData);
    plugins.util.log('\n==== DEBUG: package.json config being injected to templates ====');
    plugins.util.log(config);
  }

  return (
    gulp
      // Ignore underscore prefix folders/files (ex. _custom-layout.nunjucks)
      .src(['**/*.nunjucks', '!{**/_*,**/_*/**}'], { cwd: dirs.source })
      .pipe(plugins.changed(dest))
      .pipe(plugins.plumber())
      .pipe(
        plugins.data({
          config: config,
          debug: !args.production,
          site: {
            data: siteData
          }
        })
      )
      .pipe(
        nunjucks({
          searchPaths: [path.join(dirs.source)],
          ext: '.html'
        }).on('error', function(err) {
          plugins.util.log(err);
        })
      )
      .on('error', function(err) {
        plugins.util.log(err);
      })
      .pipe(
        plugins.htmlmin({
          collapseBooleanAttributes: true,
          conservativeCollapse: true,
          removeCommentsFromCDATA: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true
        })
      )
      .pipe(gulp.dest(dest))
      .on('end', browserSync.reload)
  );
});
