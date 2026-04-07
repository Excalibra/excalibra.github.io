import os
import re

# Define folder path
folder_path = r'C:\Users\exc\Documents\GitHub\excalibra.github.io\src\data\blog'  # Change to your folder path
print(f"Opening folder: {folder_path}")

# Define regex pattern for GitHub image links, matching both markdown image syntax and plain URLs
github_image_pattern = r'!\[.*?\]\(https://excalibra.github.io/picx-images-hosting[^\s\)]+|https://excalibra.github.io/picx-images-hosting[^\s\)]+'

# Define CDN base URL
cdn_base_url = 'https://cdn.jsdelivr.net/gh/excalibra/picx-images-hosting@master/'

# Traverse all Markdown files in the folder
for root, dirs, files in os.walk(folder_path):
    for file in files:
        if file.endswith('.md'):  # Only process Markdown files
            file_path = os.path.join(root, file)
            print(f"Processing file: {file_path}")

            # Read file content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Find all GitHub image links and replace with CDN links
            def replace_github_image_url(match):
                original_url = match.group(0)
                print(f"Found URL: {original_url}")  # Print found GitHub image link

                # Extract the URL part, removing other parts from the ![]() syntax
                try:
                    url = re.search(r'https://excalibra.github.io/picx-images-hosting[^\s\)]+', original_url).group(0)
                    print(f"Extracted URL: {url}")  # Print extracted URL

                    # Build CDN URL
                    cdn_url = cdn_base_url + url.split('excalibra.github.io/picx-images-hosting/')[1]
                    return original_url.replace(url, cdn_url)
                except Exception as e:
                    print(f"Error while processing URL: {original_url}, {e}")
                    return original_url  # If error occurs, keep original URL

            # Replace links
            updated_content = re.sub(github_image_pattern, replace_github_image_url, content)

            # If content changed, save updated content
            if updated_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(updated_content)
                print(f"Updated: {file_path}")
            else:
                print(f"No changes for: {file_path}")
