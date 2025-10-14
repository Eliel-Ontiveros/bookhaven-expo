# Script para levantar el ecosistema BookHaven completo
# Frontend (Expo) + Backend (Next.js API)

Write-Host "🚀 Iniciando BookHaven - Frontend y Backend" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Blue

# Verificar que estamos en la carpeta correcta
$currentDir = Get-Location
Write-Host "📂 Directorio actual: $currentDir" -ForegroundColor Yellow

# Verificar que las carpetas existen
$backendPath = "bookhaven-back"
$frontendPath = "bookhaven-front"

if (-not (Test-Path $backendPath)) {
    Write-Host "❌ No se encuentra la carpeta del backend: $backendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ No se encuentra la carpeta del frontend: $frontendPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Carpetas encontradas" -ForegroundColor Green

# Función para ejecutar comandos en paralelo
function Start-BackgroundProcess {
    param(
        [string]$WorkingDirectory,
        [string]$Command,
        [string]$Arguments,
        [string]$Name
    )
    
    Write-Host "🔄 Iniciando $Name..." -ForegroundColor Cyan
    
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $Command
    $psi.Arguments = $Arguments
    $psi.WorkingDirectory = $WorkingDirectory
    $psi.UseShellExecute = $true
    $psi.CreateNoWindow = $false
    
    $process = [System.Diagnostics.Process]::Start($psi)
    return $process
}

# Levantar el backend
Write-Host "`n🔧 Iniciando Backend (Next.js API Server)..." -ForegroundColor Magenta
$backendProcess = Start-BackgroundProcess -WorkingDirectory $backendPath -Command "npm" -Arguments "run dev" -Name "Backend"

# Esperar un momento para que el backend se inicie
Write-Host "⏳ Esperando que el backend se inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Levantar el frontend
Write-Host "`n📱 Iniciando Frontend (Expo)..." -ForegroundColor Magenta
$frontendProcess = Start-BackgroundProcess -WorkingDirectory $frontendPath -Command "npx" -Arguments "expo start" -Name "Frontend"

Write-Host "`n✅ Ambos servidores iniciados!" -ForegroundColor Green
Write-Host "👀 Información de los procesos:" -ForegroundColor Blue
Write-Host "   📡 Backend PID: $($backendProcess.Id)" -ForegroundColor White
Write-Host "   📱 Frontend PID: $($frontendProcess.Id)" -ForegroundColor White

Write-Host "`n🌐 URLs disponibles:" -ForegroundColor Blue
Write-Host "   📡 Backend API: http://localhost:3000/api" -ForegroundColor White
Write-Host "   📱 Frontend: Se abrirá automáticamente en Expo" -ForegroundColor White

Write-Host "`n💡 Para detener los servidores:" -ForegroundColor Yellow
Write-Host "   Presiona Ctrl+C en cada terminal o cierra las ventanas" -ForegroundColor White

Write-Host "`n🔍 Puedes probar la API del backend visitando:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000/api" -ForegroundColor White

# Mantener el script activo
Write-Host "`n⌨️  Presiona cualquier tecla para salir..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Opcional: limpiar procesos al salir
try {
    if (-not $backendProcess.HasExited) {
        Write-Host "🛑 Cerrando backend..." -ForegroundColor Yellow
        $backendProcess.CloseMainWindow()
    }
    if (-not $frontendProcess.HasExited) {
        Write-Host "🛑 Cerrando frontend..." -ForegroundColor Yellow
        $frontendProcess.CloseMainWindow()
    }
} catch {
    Write-Host "⚠️  Los procesos pueden seguir ejecutándose. Ciérralos manualmente si es necesario." -ForegroundColor Yellow
}