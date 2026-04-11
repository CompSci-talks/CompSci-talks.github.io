
$apiKey = "AIzaSyBq_V-h82VJQIlMSsf-MBqqKQAs5KsQ1iY"
$baseUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$apiKey"
$password = "TestPassword123!"

$users = @(
    "admin@compsci.test",
    "user@compsci.test",
    "participant1@compsci.test",
    "participant2@compsci.test",
    "participant3@compsci.test"
)

foreach ($email in $users) {
    Write-Host "Registering user: $email..."
    $body = @{
        email             = $email
        password          = $password
        returnSecureToken = $true
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Method Post -Uri $baseUrl -Body $body -ContentType "application/json"
        Write-Host "Successfully registered $email (UID: $($response.localId))"
    }
    catch {
        $errorDetails = $_.Exception.Message
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorDetails = $reader.ReadToEnd()
        }
        Write-Host "Failed to register $($email): $errorDetails"
    }
}
