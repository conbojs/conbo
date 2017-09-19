@echo off

del docs\conbo /s /q
jsdoc ./lib/conbo.js README.md -c jsdoc.json -d ./docs/ -P package.json