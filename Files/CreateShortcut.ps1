$root = Get-Location
$png  = Join-Path $root "SmartRisk_Lite_Icon.png"
$ico  = Join-Path $root "SmartRisk_Lite_Icon.ico"
# build .ico if missing
if (!(Test-Path $ico) -and (Test-Path $png)) {
  python tools\png_to_ico.py | Out-Null
}
$WScriptShell = New-Object -ComObject WScript.Shell
$shortcutPath = Join-Path $root "SmartRisk Start.lnk"
$shortcut = $WScriptShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments  = "`"$($root)\launch_hidden.vbs`""
$shortcut.WorkingDirectory = "$root"
if (Test-Path $ico) { $shortcut.IconLocation = $ico } else { $shortcut.IconLocation = "$env:WINDIR\System32\shell32.dll,167" }
$shortcut.Description = "Start SmartRisk Lite (backend + frontend)"
$shortcut.Save()
Write-Host "Created: $shortcutPath"
