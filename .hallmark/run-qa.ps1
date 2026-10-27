$ErrorActionPreference = 'Stop'
Push-Location (Split-Path -Parent $PSScriptRoot)
try {
    & .\ttrpg_tracker\app\.venv\Scripts\python.exe -X utf8 -m unittest discover -s ttrpg_tracker/app/tests -v
    if ($LASTEXITCODE -ne 0) { throw 'Backend regression tests failed' }
    & node .hallmark/qa.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Browser regression checks failed' }
    & node .hallmark/stability-qa.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Stability checks failed' }
    & node .hallmark/owner-gm-qa.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Tracker owner checks failed' }
}
finally {
    Pop-Location
}
