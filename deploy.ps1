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
    auto_init = $true  # Must be true to allow Contents API to work
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

# Upload via Git Trees API (more reliable for batch upload)
$success = 0
$failed = 0

# First, get the default branch's latest commit SHA for the base tree
Write-Host "  Getting base branch info..." -ForegroundColor Gray
try {
    $branchResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$RepoName/git/ref/heads/main" -Headers $headers -Method Get
    $baseTreeSha = $branchResp.object.sha
    Write-Host "  Base commit SHA: $baseTreeSha" -ForegroundColor Gray
} catch {
    # Try master branch
    try {
        $branchResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$RepoName/git/ref/heads/master" -Headers $headers -Method Get
        $baseTreeSha = $branchResp.object.sha
        Write-Host "  Base commit SHA (master): $baseTreeSha" -ForegroundColor Gray
    } catch {
        Write-Host "[ERROR] Cannot find main/master branch" -ForegroundColor Red
        Write-Host "  The repo may be empty. Please create it with auto_init = true first." -ForegroundColor Yellow
        exit 1
    }
}

# Collect all files and create blobs
$blobResults = @()
foreach ($file in $files) {
    $bytes = [IO.File]::ReadAllBytes($file.FullPath)
    $b64 = [Convert]::ToBase64String($bytes)
    
    # Create a blob for each file
    try {
        $blobBody = @{
            content = $b64
            encoding = "base64"
        } | ConvertTo-Json
        $blobResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$RepoName/git/blobs" -Headers $headers -Method Post -Body $blobBody -ContentType 'application/json'
        $blobResults += [PSCustomObject]@{ 
            Path = $file.Path 
            BlobSha = $blobResp.sha 
        }
        Start-Sleep -Milliseconds 100
    } catch {
        Write-Host ("  [WARN] Cannot create blob for {0}: {1}" -f $file.Path, $_.Exception.Message) -ForegroundColor Yellow
    }
}

Write-Host "  Created $($blobResults.Count) file blobs" -ForegroundColor Green

# Create a new tree with all files
$treeItems = @()
foreach ($blob in $blobResults) {
    $treeItems += @{
        path = $blob.Path.Replace('\', '/')
        mode = "100644"
        type = "blob"
        sha = $blob.BlobSha
    }
}

$treeBody = @{
    base_tree = $branchResp.object.sha
    tree = $treeItems
} | ConvertTo-Json -Depth 10

try {
    $treeResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$RepoName/git/trees" -Headers $headers -Method Post -Body $treeBody -ContentType 'application/json'
    $newTreeSha = $treeResp.sha
    Write-Host "  Created tree: $newTreeSha" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Cannot create tree: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create a commit with the new tree
$commitBody = @{
    message = "Upload: $($blobResults.Count) files to $RepoName"
    tree = $newTreeSha
    parents = @($branchResp.object.sha)
} | ConvertTo-Json

try {
    $commitResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$RepoName/git/commits" -Headers $headers -Method Post -Body $commitBody -ContentType 'application/json'
    $newCommitSha = $commitResp.sha
    Write-Host "  Created commit: $newCommitSha" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Cannot create commit: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Update the branch reference to point to the new commit
$updateBody = @{
    ref = "refs/heads/main"
    sha = $newCommitSha
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$RepoName/git/refs/heads/main" -Headers $headers -Method Patch -Body $updateBody -ContentType 'application/json' | Out-Null
    Write-Host "  [OK] Branch updated!" -ForegroundColor Green
    $success = $blobResults.Count
    $failed = $files.Count - $success
} catch {
    # Try updating master branch
    $updateBodyMaster = @{
        ref = "refs/heads/master"
        sha = $newCommitSha
    } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$RepoName/git/refs/heads/master" -Headers $headers -Method Patch -Body $updateBodyMaster -ContentType 'application/json' | Out-Null
        Write-Host "  [OK] Branch updated (master)!" -ForegroundColor Green
        $success = $blobResults.Count
        $failed = $files.Count - $success
    } catch {
        Write-Host "[ERROR] Cannot update branch: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
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
