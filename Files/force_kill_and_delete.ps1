#Requires -RunAsAdministrator

$baseDir = "C:\Users\ehome\Desktop\Gordon portfolio risk project\Files"
$backendDir = Join-Path $baseDir "backend"
$toolsDir = Join-Path $baseDir "tools"
$handleExe = Join-Path $toolsDir "handle.exe"
$handleZip = Join-Path $toolsDir "Handle.zip"

# Create tools directory if it doesn't exist
if (-not (Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir
}

# Check if handle.exe exists, if not, download and extract it
if (-not (Test-Path $handleExe)) {
    Write-Host "handle.exe not found. Downloading from Microsoft Sysinternals..."
    $handleUrl = "https://download.sysinternals.com/files/Handle.zip"
    try {
        Invoke-WebRequest -Uri $handleUrl -OutFile $handleZip
        Expand-Archive -Path $handleZip -DestinationPath $toolsDir -Force
        # Sysinternals zips can have a folder inside, check for handle64.exe for 64-bit systems
        if(Test-Path (Join-Path $toolsDir "handle64.exe")) {
            Rename-Item (Join-Path $toolsDir "handle64.exe") "handle.exe"
        }
        Remove-Item $handleZip
        Write-Host "handle.exe downloaded and extracted successfully."
    } catch {
        Write-Host "Error downloading or extracting handle.exe. Please check your internet connection and try again."
        exit 1
    }
}

# Find and kill processes using the backend directory
Write-Host "Searching for processes with open handles in: $backendDir"
$handleOutput = . $handleExe -nobanner -p "" "$backendDir"

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
            # Process might have already been terminated
        }
    }

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

# Delete the original backend directory
Write-Host "Deleting original backend directory..."
Remove-Item -Path $backendDir -Recurse -Force
Write-Host "Original backend directory deleted successfully."

