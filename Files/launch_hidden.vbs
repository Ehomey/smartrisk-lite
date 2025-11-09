Set WshShell = CreateObject("WScript.Shell")
WshShell.Run """" & CreateObject("Scripting.FileSystemObject").GetAbsolutePathName("dev.bat") & """", 0, False
