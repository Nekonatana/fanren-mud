# ============================================================
# Fanren MUD v14 - GitHub One-Click Deploy Script (no git install needed)
# Creates repo + uploads all files via GitHub REST API directly
# ============================================================
# Usage:
#   1. Create Personal Access Token at:
#      https://github.com/settings/tokens/new?scopes=repo
#   2. Run deploy.bat (or this ps1 directly)
#   3. Paste token when prompted
# ============================================================

param(
    [string]$Token = "",
    [string]$RepoName = "fanren-mud",
    [string]$Description = "Fanren Xiuzhuan MUD v14 - PWA Cultivation Game"
)

$ErrorActionPreference = 'Stop'
$BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DeployDir = Join-Path $BaseDir 'deploy_pwa'

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Fanren MUD v14 - GitHub One-Click Deploy" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Get Token
if (-not $Token) {
    Write-Host "Need GitHub Personal Access Token (repo scope)" -ForegroundColor Yellow
    Write-Host "Create at: https://github.com/settings/tokens/new?scopes=repo" -ForegroundColor Gray
    Write-Host ""
    $Token = Read-Host "Paste your Token here"
    if (-not $Token) {
        Write-Host "[ERROR] Token cannot be empty" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path $DeployDir)) {
    Write-Host "[ERROR] deploy_pwa directory not found. Please build first." -ForegroundColor Red
    exit 1
}

# Verify Token & get username
Write-Host "Verifying Token..." -ForegroundColor Yellow
$headers = @{
    Authorization = "token $Token"
    Accept = "application/vnd.github+json"
    'X-GitHub-Api-Version' = '2022-11-28'
}
try {
    $userResp = Invoke-RestMethod -Uri 'https://api.github.com/user' -Headers $headers -Method Get
    $owner = $userResp.login
    Write-Host "  [OK] User: $owner" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Token verification failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Please re-check your token. Create a new one if needed:" -ForegroundColor Yellow
    Write-Host "  https://github.com/settings/tokens/new?scopes=repo" -ForegroundColor Yellow
    exit 1
}

# Create / verify repo
Write-Host ""
Write-Host "Creating/verifying repo: $RepoName..." -ForegroundColor Yellow
$repoBody = @{
    name = $RepoName
    description = $Description
    private = $false
    auto_init = $false
} | ConvertTo-Json

$repoCreated = $false
try {
    $repoResp = Invoke-RestMethod -Uri 'https://api.github.com/user/repos' -Headers $headers -Method Post -Body $repoBody -ContentType 'application/json'
    $repoUrl = $repoResp.html_url
    $pagesUrl = "https://$owner.github.io/$RepoName/"
    Write-Host "  [OK] Repo created: $repoUrl" -ForegroundColor Green
    $repoCreated = $true
} catch {
    # GitHub API 422 error response is JSON with detailed message
    $errMsg = $_.Exception.Message
    $errStatus = $_.Exception.Response.StatusCode.value__
    
    # Try to parse the error response body for more details
    $errDetail = ""
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errBody = $reader.ReadToEnd()
        if ($errBody) {
            $errJson = $errBody | ConvertFrom-Json
            if ($errJson.errors) {
                $errDetail = $errJson.errors -join "; "
            } elseif ($errJson.message) {
                $errDetail = $errJson.message
            }
        }
    } catch {}
    
    Write-Host "  GitHub API Error ($errStatus): $errDetail" -ForegroundColor Red
    Write-Host "  Details: $errMsg" -ForegroundColor Gray
    
    # Check if repo name already exists (422 status with name conflict)
    $nameConflict = $false
    if ($errStatus -eq 422 -or $errMsg -match 'already exists' -or $errDetail -match 'name' -or $errDetail -match 'already') {
        # Verify by trying to access the repo - if it exists, we can update it
        try {
            $checkResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$RepoName" -Headers $headers -Method Get
            Write-Host "  [INFO] Repo '$RepoName' already exists on your account" -ForegroundColor Yellow
            Write-Host "  [INFO] Will update existing repository instead" -ForegroundColor Yellow
            $repoUrl = $checkResp.html_url
            $pagesUrl = "https://$owner.github.io/$RepoName/"
            $nameConflict = $true
        } catch {
            # Repo doesn't exist but creation failed for another reason
            Write-Host ""
            Write-Host "  [ERROR] Cannot create repo '$RepoName'" -ForegroundColor Red
            Write-Host "  The repository name might be:" -ForegroundColor Red
            Write-Host "    - Already taken by another user" -ForegroundColor Yellow
            Write-Host "    - Contains invalid characters" -ForegroundColor Yellow
            Write-Host "    - Reserved by GitHub" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "  Suggestions:" -ForegroundColor Cyan
            Write-Host "    1. Use a unique name like: 'fanren-mud-v14-$owner'" -ForegroundColor White
            Write-Host "    2. Or: 'fanren-xiuzhuan-mud'" -ForegroundColor White
            Write-Host ""
            Write-Host "  To retry with a new name, run:" -ForegroundColor Cyan
            Write-Host "    .\deploy.bat -RepoName 'your-unique-name'" -ForegroundColor White
            Write-Host ""
            exit 1
        }
    }
    
    if (-not $nameConflict) {
        Write-Host "[ERROR] Failed to create repo: $errMsg" -ForegroundColor Red
        exit 1
    }
}

# Collect files to upload
Write-Host ""
Write-Host "Collecting files..." -ForegroundColor Yellow
$files = @()
Get-ChildItem $DeployDir -Recurse -File | ForEach-Object {
    $relPath = $_.FullName.Substring($DeployDir.Length + 1).Replace('\','/')
    $files += [PSCustomObject]@{ Path = $relPath; FullPath = $_.FullName }
}
Write-Host "  $($files.Count) files to upload" -ForegroundColor Green

# Upload via GitHub Contents API
$success = 0
$failed = 0
$apiBase = "https://api.github.com/repos/$owner/$RepoName/contents"

foreach ($file in $files) {
    $encodedPath = [Uri]::EscapeDataString($file.Path)
    $apiUrl = "$apiBase/$encodedPath"

    try {
        $bytes = [IO.File]::ReadAllBytes($file.FullPath)
        $b64 = [Convert]::ToBase64String($bytes)
        $body = @{
            message = "upload: $($file.Path)"
            content = $b64
        } | ConvertTo-Json

        # Check if file exists (get sha for update)
        $sha = $null
        try {
            $existResp = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
            $sha = $existResp.sha
            $body = @{
                message = "update: $($file.Path)"
                content = $b64
                sha = $sha
            } | ConvertTo-Json
        } catch {}

        Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Put -Body $body -ContentType 'application/json' | Out-Null
        $success++
        Write-Host ("  [OK] {0}" -f $file.Path) -ForegroundColor Green
    } catch {
        $failed++
        Write-Host ("  [FAIL] {0}: {1}" -f $file.Path, $_.Exception.Message) -ForegroundColor Red
    }

    # GitHub API rate limit: avoid hammering
    Start-Sleep -Milliseconds 300
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  Upload done: $success success / $failed failed" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Trigger GitHub Pages workflow automatically
Write-Host "Triggering GitHub Pages deployment workflow..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
$dispatchUrl = "https://api.github.com/repos/$owner/$RepoName/actions/workflows/deploy.yml/dispatches"
$dispatchBody = @{ ref = "main" } | ConvertTo-Json
$triggered = $false
try {
    Invoke-RestMethod -Uri $dispatchUrl -Headers $headers -Method Post -Body $dispatchBody -ContentType 'application/json' | Out-Null
    $triggered = $true
    Write-Host "  [OK] Workflow triggered on 'main' branch!" -ForegroundColor Green
} catch {
    # Try master branch
    $dispatchBody = @{ ref = "master" } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri $dispatchUrl -Headers $headers -Method Post -Body $dispatchBody -ContentType 'application/json' | Out-Null
        $triggered = $true
        Write-Host "  [OK] Workflow triggered on 'master' branch!" -ForegroundColor Green
    } catch {
        Write-Host "  [WARN] Could not auto-trigger workflow: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "  You may need to trigger it manually after setting up Pages." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Repo URL: $repoUrl" -ForegroundColor Green
Write-Host ""

if ($triggered) {
    Write-Host "GitHub Pages is now deploying! (Takes 1-2 min)" -ForegroundColor Green
} else {
    Write-Host "Next step - Set up GitHub Pages:" -ForegroundColor Yellow
    Write-Host "  1. Open $repoUrl"
    Write-Host "  2. Settings -> Pages"
    Write-Host "  3. Source: GitHub Actions"
    if (-not $triggered) {
        Write-Host "  4. If Actions page shows no workflow, run fix_workflow.bat" -ForegroundColor Yellow
    }
}
Write-Host ""
Write-Host "  PWA URL (open on mobile):" -ForegroundColor Green
Write-Host "  $pagesUrl" -ForegroundColor Green
Write-Host ""
Write-Host "  Mobile: open URL -> browser menu -> Add to Home Screen -> Play offline!" -ForegroundColor Yellow
Write-Host ""
