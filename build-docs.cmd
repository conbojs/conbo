@echo off

del docs\conbine /s /q /f
jsdoc ./lib/conbine.js README.md -c jsdoc.json -d ./docs/ -P package.json