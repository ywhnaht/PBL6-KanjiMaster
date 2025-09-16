# ===== CONFIG =====
# Thay đổi theo thông tin của bạn
$LocalMysqlDump = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe"
$LocalDbUser   = "root"
$LocalDbName   = "KanjiMaster"

$DockerContainer = "mysql-db"
$DockerDbUser    = "root"
$DockerDbPass    = "huyho2004"   # Password root trong container
$DockerDbName    = "KanjiMaster"

$DumpFile = "local_dump.sql"

# ===== EXPORT từ MySQL local =====
Write-Host "👉 Export database $LocalDbName từ MySQL local..."
& "$LocalMysqlDump" -u $LocalDbUser -p --databases $LocalDbName > $DumpFile
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Export thất bại!"
    exit 1
}

# ===== IMPORT vào MySQL Docker =====
Write-Host "👉 Import vào MySQL Docker container: $DockerContainer..."
$passArg = "-p$DockerDbPass"
Get-Content $DumpFile | docker exec -i $DockerContainer mysql -u $DockerDbUser $passArg $DockerDbName
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Import thất bại!"
    exit 1
}

Write-Host "✅ Hoàn tất: $LocalDbName đã migrate vào Docker ($DockerContainer)."
