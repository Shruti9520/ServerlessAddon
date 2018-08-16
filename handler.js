'use strict';

const fs = require("fs");
const path = require("path");
const tinycolor = require("tinycolor2");
const mkdirp = require('mkdirp');
const requireContext = require('require-context');
const zipdir = require('zip-dir');
const FolderZip = require('folder-zip');

const makeTinycolor = colorIn => {
    const color = { ...colorIn };
    if ("s" in color) {
      color.s = Math.floor(color.s) / 100.0;
    }
    if ("a" in color) {
      if (color.a > 1.0) {
        color.a = Math.floor(color.a) / 100.0;
      }
      color.a = Math.ceil(color.a * 100) / 100.0;
    }
    return tinycolor(color);
  };

const colorToCSS = colorIn => makeTinycolor(colorIn).toRgbString();

exports.addOn = (event, context, callback) => {
    
    const defaultTheme = JSON.parse(event.body);
    //defining a demo theme
    const theme = {
    properties: {
        additional_backgrounds_alignment: ["top"],
        additional_backgrounds_tiling: ["repeat"],
        additional_images_tiling: ["repeat"],
        additional_images_alignment: ["top"]
       },
       colors: {
       }
     }
      //iterates over each object of the preset theme's color.
      Object.keys(defaultTheme.colors).forEach(key => {
        theme.colors[key] = colorToCSS(defaultTheme.colors[key]);
      });

      if (!defaultTheme.colors.hasOwnProperty("tab_loading")) {
        theme.colors.tab_loading = colorToCSS(defaultTheme.colors.tab_line);
      }
      console.log('Event body');
      console.log(event.body);

      const themeFileContents = 'export const theme =' + JSON.stringify(theme);

      console.log('Theme file');
      console.log(themeFileContents);

      const manifestObj = {
       "description": "stand alone add-on",
       "manifest_version": 2,
       "name": "add-on",
       "icons": {
         "48": "./../../images/icon.svg"
        },
       "permissions": ["theme","activeTab"],
       "background": {
        "scripts": ["theme.js","background.js"]
      },
      "version": "2.0",
      "applications": {
        "gecko": {
          "strict_min_version": "55.0a2"
        }
      }
    }
      const manifestFileContents = JSON.stringify(manifestObj);

      console.log('manifest file');
      console.log(manifestFileContents);

      const backgroundFileContents = fs.readFileSync('backgroundTemp.js', "utf8");
      
      console.log('background file');
      console.log(backgroundFileContents);

       console.log('Creating a new directory using mkdirp');
      //Creating new directory for each preset theme
      mkdirp('/tmp', function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log('directory created');
          console.log('Writing theme.js file');

      fs.writeFileSync('/tmp' + '/theme.js', themeFileContents, "utf8", function(err) {
        if(err) {
          console.log('Error in creating theme.js');
          console.log(err);
        } else {
          console.log('File written');
        }
      });
      //creating and writing contents of manifest.json
      console.log('Writing manifest.json file');
      fs.writeFileSync('/tmp' + '/manifest.json', manifestFileContents, "utf8", function(err) {
        if(err) {
          console.log('Error in creating manifest.json');
          console.log(err);
        } else {
          console.log('File written');
        }
      });
      //creating and writing contents of background.js
      console.log('Writing background.js file');
      fs.writeFileSync('/tmp' + '/background.js', backgroundFileContents, "utf8", function(err) {
        if(err) {
          console.log('Error in creating background.js');
          console.log(err);
        } else {
          console.log('File written');
        }
      });
        }
        });

      /*zipdir('/tmp', { saveTo: '/tmp.zip' }, function (err, buffer) {
                if(err) {
                  console.log('Error in zip')
                  console.log(err);
                } else {
                  console.log('Zip created')
                  console.log(buffer);
                }
         });*/
         const res= {};
         var options = {
          excludeParentFolder: true, //Default : false. if true, the content will be zipped excluding parent folder.
        };
         var zip = new FolderZip();
         zip.zipFolder('/tmp', options, function(){
               zip.writeToFile('themeDir.zip');
               console.log('Zipped folder created');
          });
          zip.writeToResponse(res, 'themeDir.zip');
          console.log(res);
          callback(null, res);
};

