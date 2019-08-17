@echo off

rd /s /q docs\conbo
jsdoc ./lib/conbo.js README.md -c jsdoc.json -d ./docs/ -P package.json