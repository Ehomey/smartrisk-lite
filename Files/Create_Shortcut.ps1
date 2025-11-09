$TargetFile = "$PSScriptRoot\START_SmartRisk.bat"
$ShortcutFile = "$PSScriptRoot\SmartRisk Lite.lnk"
$IconFile = "$PSScriptRoot\SmartRisk_Lite_Icon.ico"

$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutFile)
$Shortcut.TargetPath = $TargetFile
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.IconLocation = $IconFile
$Shortcut.Description = "Start SmartRisk Lite Portfolio Analyzer"
$Shortcut.Save()

Write-Host "Shortcut created: SmartRisk Lite.lnk"
Write-Host "You can now double-click it to start the app!"
