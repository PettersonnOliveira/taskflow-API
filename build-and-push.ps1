# Build and Push TaskFlow API to Docker Hub
# Execute este script no PowerShell na raiz do projeto

Write-Host "=== TaskFlow API - Build and Push to Docker Hub ===" -ForegroundColor Green

# Configuration
$IMAGE_NAME = "devpetter/taskflow-api"
$IMAGE_TAG = "latest"

# Step 1: Clean and package
Write-Host "`nStep 1: Building JAR with Maven..." -ForegroundColor Yellow
.\mvnw.cmd clean package -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "Maven build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Maven build successful!" -ForegroundColor Green

# Step 2: Build Docker image
Write-Host "`nStep 2: Building Docker image..." -ForegroundColor Yellow
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Docker build successful!" -ForegroundColor Green

# Step 3: Push to Docker Hub
Write-Host "`nStep 3: Pushing image to Docker Hub..." -ForegroundColor Yellow
docker push ${IMAGE_NAME}:${IMAGE_TAG}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Docker push successful!" -ForegroundColor Green

Write-Host "`n=== Build and Push completed successfully! ===" -ForegroundColor Green
Write-Host "Image: ${IMAGE_NAME}:${IMAGE_TAG}" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. SSH into your VM and open the deployment directory." -ForegroundColor White
Write-Host "2. Create the taskflow_db database in the existing MySQL container if needed." -ForegroundColor White
Write-Host "3. Deploy: See DEPLOY-VM-EXISTING.md" -ForegroundColor White
