#!/bin/sh
cat templee.js | uglifyjs -o templee.min.js
echo 'Commit message: '
read commit
git commit -am "$commit" && git push origin master
