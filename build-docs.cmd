@echo off

rd /s /q docs\conbine
jsdoc ./lib/conbine.js README.md -c jsdoc.json -d ./docs/ -P package.json