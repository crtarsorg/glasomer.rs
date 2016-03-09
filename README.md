## What Is This?
A quiz to assess who you should vote for in Serbian elections.

## Prerequisites
1. [Nodejs](https://nodejs.org/en/). Watch out for [this issue](https://github.com/nodejs/node-v0.x-archive/issues/3911) when trying to run Bower later where you will have to create a symlink: sudo ln -s /usr/bin/nodejs /usr/bin/node
2. [npm] (https://www.npmjs.com/). In Ubuntu: sudo apt-get install npm
3. [Grunt](http://gruntjs.com/). In Ubuntu: sudo npm install -g bower
4. [Bower](http://bower.io/). In Ubuntu: sudo npm install -g grunt-cli

## Why Do We Need Nodejs?
There's a dependency for it with Bower. Because of this, it is tempting to just ditch bower and manage our front-end libraries with npm as well.

## Get Started
1. In your Terminal, cd into the project's directory. Run "npm install". 
2. Run "bower update" and "grunt init".
2. Start a simple server: e.g. python -m SimpleHTTPServer 8000
3. In your browser, go to http://localhost:8000/
4. Voila.

## Adding New Dependencies
Manage front-end dependencies with bower.json and the "bower update" command.
Manage other dependencies in package.json and with the "npm install" command.

## Build the App
The project uses grunt as the task manager to build the app.
Run "grunt init" to initialize the app from scratch.
Just run "grunt" to update it.

## Updating Template and Javascript Files
Any changes inside the 'app' folders will require the default "grunt" command to be executed.

## The Stack
- [Backbone](http://backbonejs.org/)
- [Handlerbars](http://handlebarsjs.com/)
- [Bower](http://bower.io/)
- [Grunt](http://gruntjs.com/)
