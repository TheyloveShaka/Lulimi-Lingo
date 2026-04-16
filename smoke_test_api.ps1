$ErrorActionPreference = 'Stop'
$base = 'http://localhost:5000/api'
$results = @()

function Add-Result {
    param($name, $ok, $details)
    $script:results += [pscustomobject]@{
        test    = $name
        pass    = $ok
        details = $details
    }
}

try {
    $r = Invoke-RestMethod -Method Get -Uri "$base/curriculum"
    Add-Result 'GET /api/curriculum' ($r.success -eq $true) ("classes=" + ($r.curriculum.classes.PSObject.Properties.Name -join ','))
}
catch {
    Add-Result 'GET /api/curriculum' $false $_.Exception.Message
}

try {
    $r = Invoke-RestMethod -Method Get -Uri "$base/curriculum/S1"
    Add-Result 'GET /api/curriculum/S1' ($r.success -eq $true) ("terms=" + ($r.data.terms.PSObject.Properties.Name -join ','))
}
catch {
    Add-Result 'GET /api/curriculum/S1' $false $_.Exception.Message
}

try {
    $r = Invoke-RestMethod -Method Get -Uri "$base/curriculum/S4/Term%201"
    Add-Result 'GET /api/curriculum/S4/Term 1' ($r.success -eq $true) ("resolvedTermFound=" + [bool]$r.data.term_name)
}
catch {
    Add-Result 'GET /api/curriculum/S4/Term 1' $false $_.Exception.Message
}

try {
    $r = Invoke-RestMethod -Method Get -Uri "$base/curriculum/S1/Term%201/S1T1M1"
    Add-Result 'GET /api/curriculum/S1/Term 1/S1T1M1' ($r.success -eq $true) ("milestone=" + $r.milestone.milestone_name)
}
catch {
    Add-Result 'GET /api/curriculum/S1/Term 1/S1T1M1' $false $_.Exception.Message
}

$lessonBody = @{ classLevel = 'S1'; term = 'Term 1'; milestoneId = 'S1T1M1'; topic = 'Alphabet and Sounds' } | ConvertTo-Json

try {
    $r1 = Invoke-RestMethod -Method Post -Uri "$base/content/lesson" -ContentType 'application/json' -Body $lessonBody
    Add-Result 'POST /api/content/lesson first call' ($r1.success -eq $true) ("cached=" + [bool]$r1.cached + '; provider=' + $r1.provider)
}
catch {
    Add-Result 'POST /api/content/lesson first call' $false $_.Exception.Message
}

try {
    $r2 = Invoke-RestMethod -Method Post -Uri "$base/content/lesson" -ContentType 'application/json' -Body $lessonBody
    Add-Result 'POST /api/content/lesson second call' ($r2.success -eq $true -and $r2.cached -eq $true) ("cached=" + [bool]$r2.cached + '; provider=' + $r2.provider)
}
catch {
    Add-Result 'POST /api/content/lesson second call' $false $_.Exception.Message
}

$quizBody = @{ classLevel = 'S1'; term = 'Term 1'; milestoneId = 'S1T1M1'; topic = 'Alphabet and Sounds'; questionCount = 6 } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Method Post -Uri "$base/content/quiz" -ContentType 'application/json' -Body $quizBody
    Add-Result 'POST /api/content/quiz' ($r.success -eq $true) ("cached=" + [bool]$r.cached + '; provider=' + $r.provider)
}
catch {
    Add-Result 'POST /api/content/quiz' $false $_.Exception.Message
}

$practiceBody = @{ classLevel = 'S1'; term = 'Term 1'; milestoneId = 'S1T1M1'; topic = 'Alphabet and Sounds'; scenarioCount = 3 } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Method Post -Uri "$base/content/practice" -ContentType 'application/json' -Body $practiceBody
    Add-Result 'POST /api/content/practice' ($r.success -eq $true) ("cached=" + [bool]$r.cached + '; provider=' + $r.provider)
}
catch {
    Add-Result 'POST /api/content/practice' $false $_.Exception.Message
}

$resourceBody = @{ classLevel = 'S2'; topic = 'Greetings'; resourceType = 'vocabulary_list' } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Method Post -Uri "$base/content/resource" -ContentType 'application/json' -Body $resourceBody
    Add-Result 'POST /api/content/resource' ($r.success -eq $true) ("cached=" + [bool]$r.cached + '; provider=' + $r.provider)
}
catch {
    Add-Result 'POST /api/content/resource' $false $_.Exception.Message
}

$results | ConvertTo-Json -Depth 6
