$files = @(
    "src\pages\Checkout.jsx",
    "src\pages\Profile.jsx",
    "src\pages\AdminOrders.jsx",
    "src\pages\AdminLogin.jsx",
    "src\pages\AdminDashboard.jsx",
    "src\pages\Login.jsx",
    "src\pages\ForgotPassword.jsx",
    "src\pages\Contact.jsx",
    "src\pages\AdminUsers.jsx",
    "src\pages\Register.jsx",
    "src\pages\VerifyOTP.jsx",
    "src\pages\ResetPassword.jsx"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # Add api import if not present
    if ($content -notmatch "import api from '../utils/api';") {
        $content = $content -replace "import axios from 'axios';", "import api from '../utils/api';"
    }
    
    # Replace axios calls
    $content = $content -replace "axios\.get\('/api/([^']+)'(?:,\s*[^)]+)?\)", "api.get('/$1')"
    $content = $content -replace "axios\.post\('/api/([^']+)'(?:,\s*([^,)]+))(?:,\s*[^)]+)?\)", "api.post('/$1', `$2)"
    $content = $content -replace "axios\.put\('/api/([^']+)'(?:,\s*([^,)]+))(?:,\s*[^)]+)?\)", "api.put('/$1', `$2)"
    $content = $content -replace "axios\.delete\('/api/([^']+)'(?:,\s*[^)]+)?\)", "api.delete('/$1')"
    
    $content | Set-Content $file -Force
}