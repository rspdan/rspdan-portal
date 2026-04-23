# rspdan-portal/scripts/install_precommit.ps1
# Install the Gate 2 mojibake pre-commit hook
# Filed: 042326 by Trip | Canon: RELAY/STANDARD_RULE_UnicodeSafeFileOps_Stan_040426.md Amendment 2
# ASCII-only to avoid Windows PowerShell codepage parse issues.

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$sourceHook = Join-Path $repoRoot 'scripts\pre-commit-mojibake.sh'
$hooksDir = Join-Path $repoRoot '.git\hooks'
$destHook = Join-Path $hooksDir 'pre-commit'

Write-Host "Installing pre-commit mojibake hook..." -ForegroundColor Cyan
Write-Host "  Source: $sourceHook" -ForegroundColor Gray
Write-Host "  Dest:   $destHook" -ForegroundColor Gray

if (-not (Test-Path $sourceHook)) {
    Write-Host "ERROR: source hook not found at $sourceHook" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $hooksDir)) {
    Write-Host "ERROR: .git/hooks directory not found - is this a git repo?" -ForegroundColor Red
    exit 1
}

# If pre-commit already exists and is not ours, back it up
if (Test-Path $destHook) {
    $existing = Get-Content $destHook -Raw -ErrorAction SilentlyContinue
    if ($existing -and ($existing -notmatch 'Gate 2 mojibake defense')) {
        $backup = "$destHook.backup-$(Get-Date -Format 'MMddyy-HHmmss')"
        Copy-Item $destHook $backup
        Write-Host "  Existing hook backed up to: $backup" -ForegroundColor Yellow
    }
}

# Copy with LF line endings (required for shell scripts under git's msys-bash on Windows)
$content = [System.IO.File]::ReadAllText($sourceHook)
$content = $content -replace "`r`n", "`n"
[System.IO.File]::WriteAllText($destHook, $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "  Hook installed." -ForegroundColor Green
Write-Host ""
Write-Host "=== Gate 2 pre-commit hook ACTIVE ===" -ForegroundColor Green
Write-Host "Staged .astro and .md files will now be scanned for mojibake on every commit." -ForegroundColor Green
Write-Host "Bypass with --no-verify if needed. Repair with: python scripts\fix_mojibake.py" -ForegroundColor Gray
