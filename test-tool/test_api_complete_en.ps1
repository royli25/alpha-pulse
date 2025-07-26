<<<<<<< HEAD
# Complete API Test Script
Write-Host "=== Flask API Complete Test ===" -ForegroundColor Green

# 1. Cache Statistics Test
Write-Host "`n1. Cache Statistics Test..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "http://localhost:5000/api/cache/stats" -Method GET
Write-Host "Total files: $($stats.total_files), Active: $($stats.active_files), Expired: $($stats.expired_files)"

# 2. First Request Test (No Cache)
Write-Host "`n2. First Request Test..." -ForegroundColor Yellow
$body1 = @{
    prompt = "JPMorgan Chase stock analysis today"
    template = "stock_analyzer"
} | ConvertTo-Json

$response1 = Invoke-RestMethod -Uri "http://localhost:5000/api/search" -Method POST -Body $body1 -ContentType "application/json"
Write-Host "First Response:"
Write-Host "Stock: $($response1.asset)"
Write-Host "Signal: $($response1.type)"
Write-Host "Confidence: $($response1.confidence)"
Write-Host "Cached: $($response1._cached)"

# 3. Cache Hit Test
Write-Host "`n3. Cache Hit Test..." -ForegroundColor Yellow
$response2 = Invoke-RestMethod -Uri "http://localhost:5000/api/search" -Method POST -Body $body1 -ContentType "application/json"
Write-Host "Cache response: $($response2._cached)"

# 4. Force Refresh Test
Write-Host "`n4. Force Refresh Test..." -ForegroundColor Yellow
$body3 = @{
    prompt = "AAPL Apple stock analysis today"
    template = "stock_analyzer"
    force_refresh = $true
} | ConvertTo-Json

$response3 = Invoke-RestMethod -Uri "http://localhost:5000/api/search" -Method POST -Body $body3 -ContentType "application/json"
Write-Host "Force refresh response: $($response3._cached)"

# 5. Different Stock Test
Write-Host "`n5. Different Stock Test..." -ForegroundColor Yellow
$body4 = @{
    prompt = "BABA Alibaba Group stock analysis"
    template = "stock_analyzer"
} | ConvertTo-Json

$response4 = Invoke-RestMethod -Uri "http://localhost:5000/api/search" -Method POST -Body $body4 -ContentType "application/json"
Write-Host "BABA signal: $($response4.type)"

# 6. Custom System Prompt Test
Write-Host "`n6. Custom System Prompt Test..." -ForegroundColor Yellow
$body5 = @{
    prompt = "Analyze NVDA stock"
    system_prompt = "You are a stock analyst, please return analysis results in JSON format"
} | ConvertTo-Json

$response5 = Invoke-RestMethod -Uri "http://localhost:5000/api/search" -Method POST -Body $body5 -ContentType "application/json"
Write-Host "Custom prompt response: $($response5 | ConvertTo-Json -Depth 5)"

# 7. Error Handling Test
Write-Host "`n7. Error Handling Test..." -ForegroundColor Yellow
try {
    $body6 = @{} | ConvertTo-Json
    $response6 = Invoke-RestMethod -Uri "http://localhost:5000/api/search" -Method POST -Body $body6 -ContentType "application/json"
} catch {
    Write-Host "Error handling normal: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Final Cache Status
Write-Host "`n8. Final Cache Status..." -ForegroundColor Yellow
$finalStats = Invoke-RestMethod -Uri "http://localhost:5000/api/cache/stats" -Method GET
Write-Host "Final cache: $($finalStats | ConvertTo-Json)"

=======
# Complete API Test Script
Write-Host "=== Flask API Complete Test ===" -ForegroundColor Green

# 1. Cache Statistics Test
Write-Host "`n1. Cache Statistics Test..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "http://localhost:5000/api/cache/stats" -Method GET
Write-Host "Total files: $($stats.total_files), Active: $($stats.active_files), Expired: $($stats.expired_files)"

# 2. First Request Test (No Cache)
Write-Host "`n2. First Request Test..." -ForegroundColor Yellow
$body1 = @{
    prompt = "JPMorgan Chase stock analysis today"
    template = "stock_analyzer"
} | ConvertTo-Json

$response1 = Invoke-RestMethod -Uri "http://localhost:5000/api/search" -Method POST -Body $body1 -ContentType "application/json"
Write-Host "First Response:"
Write-Host "Stock: $($response1.asset)"
Write-Host "Signal: $($response1.type)"
Write-Host "Confidence: $($response1.confidence)"
Write-Host "Cached: $($response1._cached)"

# 3. Cache Hit Test
Write-Host "`n3. Cache Hit Test..." -ForegroundColor Yellow
$response2 = Invoke-RestMethod -Uri "http://localhost:5000/api/search" -Method POST -Body $body1 -ContentType "application/json"
Write-Host "Cache response: $($response2._cached)"

# 4. Force Refresh Test
Write-Host "`n4. Force Refresh Test..." -ForegroundColor Yellow
$body3 = @{
    prompt = "AAPL Apple stock analysis today"
    template = "stock_analyzer"
    force_refresh = $true
} | ConvertTo-Json

$response3 = Invoke-RestMethod -Uri "http://localhost:5000/api/search" -Method POST -Body $body3 -ContentType "application/json"
Write-Host "Force refresh response: $($response3._cached)"

# 5. Different Stock Test
Write-Host "`n5. Different Stock Test..." -ForegroundColor Yellow
$body4 = @{
    prompt = "BABA Alibaba Group stock analysis"
    template = "stock_analyzer"
} | ConvertTo-Json

$response4 = Invoke-RestMethod -Uri "http://localhost:5000/api/search" -Method POST -Body $body4 -ContentType "application/json"
Write-Host "BABA signal: $($response4.type)"

# 6. Custom System Prompt Test
Write-Host "`n6. Custom System Prompt Test..." -ForegroundColor Yellow
$body5 = @{
    prompt = "Analyze NVDA stock"
    system_prompt = "You are a stock analyst, please return analysis results in JSON format"
} | ConvertTo-Json

$response5 = Invoke-RestMethod -Uri "http://localhost:5000/api/search" -Method POST -Body $body5 -ContentType "application/json"
Write-Host "Custom prompt response: $($response5 | ConvertTo-Json -Depth 5)"

# 7. Error Handling Test
Write-Host "`n7. Error Handling Test..." -ForegroundColor Yellow
try {
    $body6 = @{} | ConvertTo-Json
    $response6 = Invoke-RestMethod -Uri "http://localhost:5000/api/search" -Method POST -Body $body6 -ContentType "application/json"
} catch {
    Write-Host "Error handling normal: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Final Cache Status
Write-Host "`n8. Final Cache Status..." -ForegroundColor Yellow
$finalStats = Invoke-RestMethod -Uri "http://localhost:5000/api/cache/stats" -Method GET
Write-Host "Final cache: $($finalStats | ConvertTo-Json)"

>>>>>>> 00da180a62cd73f62e5aa760a2cbb98ee360ac3e
Write-Host "`n=== Test Complete ===" -ForegroundColor Green