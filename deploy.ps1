# =============================================================
#  NEXUS MEDIA EMPIRE — One-Click Deploy Script
#  Run this once after creating your GitHub repo:
#  .\deploy.ps1 -GithubUsername YOUR_USERNAME
# =============================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$GithubUsername = ""
)

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  NEXUS MEDIA EMPIRE - DEPLOY" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# --- Step 1: Check GitHub username
if (-not $GithubUsername) {
    $GithubUsername = Read-Host "Enter your GitHub username"
}

$RepoName = "nexus-media-empire"
$RemoteUrl = "https://github.com/$GithubUsername/$RepoName.git"

Write-Host "Target: $RemoteUrl" -ForegroundColor Yellow
Write-Host ""

# --- Step 2: Set git remote
$existingRemote = git remote get-url origin 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[1/4] Adding GitHub remote..." -ForegroundColor Green
    git remote add origin $RemoteUrl
} else {
    Write-Host "[1/4] Updating GitHub remote..." -ForegroundColor Green
    git remote set-url origin $RemoteUrl
}

# --- Step 3: Push to GitHub
Write-Host "[2/4] Pushing to GitHub..." -ForegroundColor Green
git push -u origin master

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Push failed. Make sure you:" -ForegroundColor Red
    Write-Host "  1. Created the repo at github.com/new (name: $RepoName, private, no README)" -ForegroundColor Red
    Write-Host "  2. Are logged into GitHub in your browser" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/4] Code pushed to GitHub!" -ForegroundColor Green
Write-Host ""

# --- Step 4: Open Vercel
Write-Host "[4/4] Opening Vercel deploy page..." -ForegroundColor Green
Start-Process "https://vercel.com/new/clone?repository-url=https://github.com/$GithubUsername/$RepoName"

Write-Host ""
Write-Host "=======================================" -ForegroundColor Green
Write-Host "  NEXT STEPS ON VERCEL:" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Select the '$RepoName' repo" -ForegroundColor White
Write-Host "2. Framework will auto-detect as Next.js" -ForegroundColor White
Write-Host "3. Add these Environment Variables:" -ForegroundColor White
Write-Host ""
Write-Host "   OPENAI_API_KEY          = sk-proj-..." -ForegroundColor Yellow
Write-Host "   CRON_SECRET             = (any random string)" -ForegroundColor Yellow
Write-Host "   AUTH_SECRET             = (generate in Settings panel)" -ForegroundColor Yellow
Write-Host "   ADMIN_EMAIL             = admin@yourdomain.com" -ForegroundColor Yellow
Write-Host "   ADMIN_PASSWORD_HASH     = (generate in Settings panel)" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_SITE_URL    = https://$RepoName.vercel.app" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Click Deploy" -ForegroundColor White
Write-Host "5. After deploy: visit YOUR_DOMAIN/api/telegram/setup" -ForegroundColor White
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Your empire is launching! " -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
