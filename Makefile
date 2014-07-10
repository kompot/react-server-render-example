pwd := $(shell pwd)
node_path := ${pwd}/node_modules
bin_path := ${node_path}/.bin

clean:
	@rm -f dev/*.bundle.js dev/*.css dev/*.bundle.js.map

prod_style:
	# compiling production styles
	@${bin_path}/stylus -u nib -u autoprefixer-stylus --compress --import src/styles/helpers -o dev src/styles/app.styl

dev_style:
	# compiling development styles
	@${bin_path}/stylus -u nib -u autoprefixer-stylus --import src/styles/helpers -o dev src/styles/app.styl

dev_bundle:
	# building development bundle
	@NODE_ENV=development ${bin_path}/webpack -d --hide-modules --progress -c

prod_bundle:
	# building production bundle
	@NODE_ENV=production ${bin_path}/webpack --hide-modules --optimize-minimize --optimize-occurence-order --optimize-dedupe

dev_server: clean dev_style dev_bundle
	# starting dev server
	@-NODE_ENV=development node --harmony src/js/server/server.js

dev: clean
	@NODE_ENV=development ${bin_path}/supervisor -i tests -e js,jsx,styl -x make dev_server

prod: clean prod_style prod_bundle
	# starting prod server
	@NODE_ENV=production node --harmony src/js/server/server.js

lint:
	# checking javascripts
	@${bin_path}/jsxhint src/js/*.js src/js/views/*.jsx src/js/components/*.jsx src/js/actions/*.js src/js/utils/*.js

test:
	# runing mocha tests on selenium
	@${bin_path}/mocha -t 100000 -R spec -r chai --compilers coffee:coffee-script/register

.PHONY: test
