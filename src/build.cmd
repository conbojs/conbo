@echo off

REM Conbo.js

type ^
	"%~dp0conbo\core\Class.js" ^
	"%~dp0conbo\events\Event.js" ^
	"%~dp0conbo\events\ConboEvent.js" ^
	"%~dp0conbo\events\EventDispatcher.js" ^
	"%~dp0conbo\core\Bindable.js" ^
	"%~dp0conbo\core\Context.js" ^
	"%~dp0conbo\data\Map.js" ^
	"%~dp0conbo\utils\BindingUtils.js" ^
	"%~dp0conbo\view\View.js" ^
	"%~dp0conbo\core\Actor.js" ^
	"%~dp0conbo\core\Application.js" ^
	"%~dp0conbo\core\Command.js" ^
	"%~dp0conbo\core\ServerApplication.js" ^
	> "%~dp0..\build\conbo.core.tmp"

type ^
	"%~dp0conbo\data\Model.js" ^
	"%~dp0conbo\collections\Collection.js" ^
	"%~dp0conbo\net\History.js" ^
	"%~dp0conbo\net\Router.js" ^
	"%~dp0conbo\net\sync.js" ^
	> "%~dp0..\build\conbo.net.tmp"

type ^
	"%~dp0conbo\header.txt" ^
	"%~dp0..\build\conbo.core.tmp" ^
	"%~dp0conbo\footer.txt" ^
	> "%~dp0..\build\conbo.core.js"

type ^
	"%~dp0conbo\header.txt" ^
	"%~dp0..\build\conbo.core.tmp" ^
	"%~dp0..\build\conbo.net.tmp" ^
	"%~dp0conbo\footer.txt" ^
	> "%~dp0..\build\conbo.js"

ajaxmin ^
	 "%~dp0..\build\conbo.core.js" ^
	-out "%~dp0..\build\conbo.core.min.js" ^
	-clobber

ajaxmin ^
	 "%~dp0..\build\conbo.js" ^
	-out "%~dp0..\build\conbo.min.js" ^
	-clobber

del "%~dp0..\build\*.tmp" /q


echo.
echo Build complete!
