# Navigate to downloads folder
cd "C:\Users\YOUR_USERNAME\Downloads"
$counter = 1
$prefix = "image"  # Change this to your preferred prefix

# Get all image files and rename them sequentially with timestamp
Get-ChildItem -File | Where-Object { $_.Extension -match '\.png|\.webp|\.jpg|\.jpeg' } | ForEach-Object {
    $timestamp = Get-Date -Format "yyyyMMddHHmm"
    $newName = "$prefix-$timestamp-$counter.png" 
    $newFilePath = Join-Path $_.DirectoryName $newName
    Rename-Item $_.FullName -NewName $newFilePath
    $counter++  
}
