#!/bin/sh
cat templee.js | uglifyjs -m -c -o templee.min.js
echo 'Commit message: '
read commit
git commit -am "$commit" && git push origin master
