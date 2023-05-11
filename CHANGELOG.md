# Version 1.2.4 #

New Markers functionality replaced the old code browser.

Warning: Use of Async/Await in scripts will cause Nova to become unstable and hang.

Other minor fixes...

# Version 1.2.3 #

The code browser was completely removed. 

I recommend [Dennis Advance PHP Language](https://github.com/dennisosaj/advancedphp.novaextension) extension which addressed limitations in Nova's builtin language.

I also sent Nova recommendations to improve JS Tree-Sitter language. If interested I can share my JS language extension.


# Version 1.2.2 #

The code browser was removed due to errors in Nova 10.5/6. The functionality was converted to Markers.

PS: Im working on alternative Tree-Sitter Languages for PHP, JS and CSS/SASS.


# Version 1.2.1 #

Addressing issue in Nova 10.5/6 where parsing symbols during save would cause script to timeout.

Open Tabs was moved to the root of the TreeView.

## Version 1.2

Major rewrite of internals. Ported more of my Atom's extensions.

### To-Dos ###

Automatically detects tasks created in Gulp, Grunt, Builder configuration files...

Port **Builder** capabilities, so we can easily build fancier tasks without the need of external tools like Grunt...

Add more languages to the symbol parser.

Allow to change name of project without having to manually edit the projects.js file.

Allow to remove a project without having to manually edit the projects.js file.



## Version 1.1

Minor fixes and corrections to readme.

## Version 1.0

Initial release

