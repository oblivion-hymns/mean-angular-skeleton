# mean-angular-skeleton
A MEAN skeleton application including Angular 6, Angular Material, and a basic routing setup.
Offers both JIT and AOT compilation. Includes some basic convenience functionality such as a versatile and
dynamic loading indicator.

## Prep
- `npm install` to install dependencies
- `sudo npm install -g supervisor` to install supervisor globally

## Instructions
- `npm start` to start the server
- `npm run build` to watch client-side files for changes
- `npm run build:prod` to make a full AOT build, then `npm start` as usual to start the server

Once both are running, you should not have to touch them unless there is a fatal error.

## Included packages
- Angular Material & all associated packages
- Supervisor (so you don't have to restart the server when you change files)
- Webpack
