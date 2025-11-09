
#Requires -RunAsAdministrator
param(
    [string]$directory = "C:\Users\ehome\Desktop\Gordon portfolio risk project\Files\backend"
)

# Check if handle.exe is available in the PATH
$handlePath = Get-Command handle.exe -ErrorAction SilentlyContinue
if (-not $handlePath) {
    Write-Host "handle.exe from Sysinternals is required for this script to work."
    Write-Host "Please download it from the official Microsoft Sysinternals website:"
    Write-Host "https://learn.microsoft.com/en-us/sysinternals/downloads/handle"
    Write-Host "And place it in a directory that is in your system's PATH (e.g., C:\Windows\System32)."
    exit 1
}

Write-Host "Searching for processes with open handles in: $directory"

# Run handle.exe and capture the output. The -nobanner switch is used to suppress the banner.
# The output is redirected to a temporary file to handle potential encoding issues.
$tempFile = [System.IO.Path]::GetTempFileName()
handle.exe -nobanner "$directory" > $tempFile

$handleOutput = Get-Content $tempFile
Remove-Item $tempFile

# Parse the output to get the PIDs
$pids = $handleOutput | ForEach-Object {
    if ($_ -match '(?<processName>.+?)\s+pid:\s+(?<pid>\d+)\s+type:\s+File\s+(?<handleId>[A-Z0-9]+):\s+(?<filePath>.+)') {
        $matches.pid
    }
} | Get-Unique

if ($pids.Count -gt 0) {
    Write-Host "Found the following processes to kill:"
    $pids | ForEach-Object {
        try {
            $process = Get-Process -Id $_ -ErrorAction Stop
            Write-Host "- $($process.ProcessName) (PID: $_)"
        } catch {
            Write-Host "Could not get process information for PID: $_. It may have already been terminated."
        }
    }

    # Kill the processes
    $pids | ForEach-Object {
        Write-Host "Killing process with PID: $_"
        try {
            Stop-Process -Id $_ -Force -ErrorAction Stop
        } catch {
            Write-Host "Failed to kill process with PID: $_. It may have already been terminated or you may not have sufficient privileges."
        }
    }
    Write-Host "All identified processes have been terminated."
} else {
    Write-Host "No processes found with open handles in the specified directory."
}
