# Portal setup entry point. The shared installer preserves active legacy hooks.
# ASCII-only for Windows PowerShell compatibility.
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot '.git'))) {
    [Console]::Error.WriteLine('Hook installation could not run: no .git metadata exists at the portal script root.')
    exit 2
}
$gitApplication = Get-Command -Name git -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -eq $gitApplication) {
    [Console]::Error.WriteLine('Hook installation could not run: Git is unavailable.')
    exit 2
}
try {
    $gitRoot = & $gitApplication.Source -C $repoRoot rev-parse --show-toplevel
    if ($LASTEXITCODE -ne 0) { throw 'Git could not identify this checkout.' }
    $discoveredRoot = (Resolve-Path -LiteralPath $gitRoot).Path
    $comparison = [StringComparison]::Ordinal
    if ([Environment]::OSVersion.Platform -eq [PlatformID]::Win32NT) {
        $comparison = [StringComparison]::OrdinalIgnoreCase
    }
    if (-not [String]::Equals($repoRoot, $discoveredRoot, $comparison)) {
        throw 'Git resolved a different checkout from the portal script location.'
    }
} catch {
    [Console]::Error.WriteLine("Hook installation could not verify this checkout: $($_.Exception.Message)")
    exit 2
}
$installer = Join-Path $PSScriptRoot 'crew-identity\install_identity_hooks.py'
if (-not (Test-Path -LiteralPath $installer -PathType Leaf)) {
    [Console]::Error.WriteLine("Hook installation could not run: bundled installer is missing at $installer")
    exit 2
}

$candidates = @(
    @{ Name = 'python3'; Prefix = @() },
    @{ Name = 'python'; Prefix = @() },
    @{ Name = 'py'; Prefix = @('-3') }
)
$pythonExecutable = $null
$pythonPrefix = @()
foreach ($candidate in $candidates) {
    $application = Get-Command -Name $candidate.Name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -eq $application) { continue }
    $probeArguments = @($candidate.Prefix) + @('-c', 'import sys; sys.exit(0 if sys.version_info[0] >= 3 else 1)')
    try {
        & $application.Source @probeArguments > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            $pythonExecutable = $application.Source
            $pythonPrefix = @($candidate.Prefix)
            break
        }
    } catch {
        # A missing launcher or Store stub is not a working interpreter.
    }
}

if ($null -eq $pythonExecutable) {
    [Console]::Error.WriteLine('Hook installation could not run: no working Python 3 interpreter was found (python3, python, py -3).')
    exit 2
}

$installerArguments = @($pythonPrefix) + @($installer, '--repo', $repoRoot)
try {
    & $pythonExecutable @installerArguments
    $installerStatus = $LASTEXITCODE
} catch {
    [Console]::Error.WriteLine("Hook installation could not run: $($_.Exception.Message)")
    exit 2
}
if ($null -eq $installerStatus) {
    [Console]::Error.WriteLine('Hook installation could not run: installer returned no exit status.')
    exit 2
}
exit $installerStatus
