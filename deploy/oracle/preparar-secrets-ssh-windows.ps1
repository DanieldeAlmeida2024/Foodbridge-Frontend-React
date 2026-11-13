# Windows PowerShell 5.1. Provisiona segredos SSH no REPOSITORIO frontend, sem exibir chaves.
[CmdletBinding()]
param(
    [string]$Repo = 'DanieldeAlmeida2024/Foodbridge-Frontend-React',
    [string]$EnvironmentName = 'oracle-production',
    [string]$HostIp = '163.176.133.210',
    [string]$SshUser = 'opc',
    [string]$PrivateKey = (Join-Path $HOME '.ssh\foodbridge-ci-rsa-test'),
    [string]$KnownHosts = (Join-Path $HOME '.ssh\known_hosts')
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Assert-Exit([string]$step) {
    if ($LASTEXITCODE -ne 0) { throw "Falhou: $step (exit $LASTEXITCODE)" }
}
if (-not (Get-Command gh.exe -ErrorAction SilentlyContinue)) { throw 'GitHub CLI indisponivel' }
foreach ($file in @($PrivateKey, $KnownHosts)) {
    if (-not (Test-Path -LiteralPath $file)) { throw "Arquivo local ausente: $file" }
}
$key = (Resolve-Path -LiteralPath $PrivateKey).ProviderPath
$known = (Resolve-Path -LiteralPath $KnownHosts).ProviderPath

# Fingerprint publica; nunca imprimir o material de chave.
$fpLines = @(& ssh-keygen.exe -lf $key -E sha256)
Assert-Exit 'fingerprint RSA'
if (($fpLines -join ' ') -notmatch 'SHA256:3zV6jlZeYgt19xz4h0KrumznEr3SNlyAEiolj\+XrmO8') {
    throw 'Fingerprint RSA nao coincide com a chave dedicada'
}
$entries = @(& ssh-keygen.exe -F $HostIp -f $known | Where-Object {
    $_ -match '^\S+\s+(ssh-ed25519|ssh-rsa|ecdsa-sha2-\S+)\s+\S+'
})
Assert-Exit 'host key pinada'
if ($entries.Count -lt 1) { throw 'Host key previamente validada ausente do known_hosts' }

# O BatchMode proibe interacao com passphrase, agente e senha.
$sshOptions = @(
    '-n', '-i', $key,
    '-o', 'BatchMode=yes',
    '-o', 'IdentityAgent=none',
    '-o', 'IdentitiesOnly=yes',
    '-o', 'StrictHostKeyChecking=yes',
    '-o', "UserKnownHostsFile=$known",
    '-o', 'ConnectTimeout=15',
    "$SshUser@$HostIp", 'echo SSH_RSA_OK'
)
& ssh.exe @sshOptions
Assert-Exit 'teste SSH local antes de secrets'

& gh.exe auth status
Assert-Exit 'GitHub CLI autenticado'
& gh.exe api -X PUT "repos/$Repo/environments/$EnvironmentName" --silent
Assert-Exit 'criar/conferir environment frontend'
& gh.exe variable set OCI_DEPLOY_ENABLED --body 'false' --repo $Repo
Assert-Exit 'gate deploy desligado'
& gh.exe variable set OCI_AUTO_DEPLOY_ENABLED --body 'false' --repo $Repo
Assert-Exit 'gate auto deploy desligado'
& gh.exe variable set OCI_SSH_HOST --body $HostIp --env $EnvironmentName --repo $Repo
Assert-Exit 'OCI_SSH_HOST'
& gh.exe variable set OCI_SSH_USER --body $SshUser --env $EnvironmentName --repo $Repo
Assert-Exit 'OCI_SSH_USER'

# GH CLI criptografa secrets localmente e recebe entrada padrao.
Get-Content -LiteralPath $key -Raw -Encoding ASCII |
    & gh.exe secret set OCI_SSH_PRIVATE_KEY --env $EnvironmentName --repo $Repo
Assert-Exit 'secret RSA'
($entries -join [Environment]::NewLine) |
    & gh.exe secret set OCI_SSH_KNOWN_HOSTS --env $EnvironmentName --repo $Repo
Assert-Exit 'secret known_hosts'
Write-Host 'FRONTEND_SSH_ENV_READY=YES'
Write-Host 'OCI_DEPLOY_ENABLED=false'
Write-Host 'OCI_AUTO_DEPLOY_ENABLED=false'
