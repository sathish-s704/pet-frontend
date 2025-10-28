$files = @(
    "src\pages\MyReviews.jsx",
    "src\pages\AdminProducts.jsx",
    "src\pages\AdminIncome.jsx",
    "src\context\CartContext.jsx",
    "src\components\ReviewCard.jsx",
    "src\components\ProductReviews.jsx",
    "src\pages\ProductDetail.jsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        try {
            $content = Get-Content $file -Raw -ErrorAction Stop
            
            # Skip if file is empty or null
            if ([string]::IsNullOrEmpty($content)) {
                Write-Host "Skipping empty file: $file"
                continue
            }
            
            # Add api import if not present
            if ($content -notmatch "import api from '\.\.?/utils/api';") {
                $content = $content -replace "import axios from 'axios';", "import api from '../utils/api';"
            }
            
            # Replace axios calls
            $content = $content -replace "axios\.get\(`?/api/([^'`]+)'?(?:,\s*[^)]+)?\)", "api.get('/$1')"
            $content = $content -replace "axios\.post\(`?/api/([^'`]+)'?(?:,\s*([^,)]+))(?:,\s*[^)]+)?\)", "api.post('/$1', `$2)"
            $content = $content -replace "axios\.put\(`?/api/([^'`]+)'?(?:,\s*([^,)]+))(?:,\s*[^)]+)?\)", "api.put('/$1', `$2)"
            $content = $content -replace "axios\.delete\(`?/api/([^'`]+)'?(?:,\s*[^)]+)?\)", "api.delete('/$1')"
            
            Set-Content $file $content -Force -ErrorAction Stop
            Write-Host "Successfully updated: $file"
        }
        catch {
            Write-Host "Error processing file $file : $_"
        }
    }
    else {
        Write-Host "File not found: $file"
    }
}