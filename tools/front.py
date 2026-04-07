import os
import frontmatter
from datetime import datetime

# Update heroImage field URLs
def update_hero_image_url(hero_image_url):
    if 'excalibra.github.io' in hero_image_url:
        return hero_image_url.replace('https://excalibra.github.io', 'https://cdn.jsdelivr.net/gh/excalibra')
    return hero_image_url

# Update front-matter
def update_front_matter(file_path):
    # Read file content
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Parse front-matter
    post = frontmatter.loads(content)

    # Get original date, convert to slug format you need
    if 'date' in post:
        # Ensure post['date'] is a datetime object
        if isinstance(post['date'], str):
            try:
                post['date'] = datetime.strptime(post['date'], '%Y-%m-%d %H:%M:%S')  # If string, convert to datetime
            except ValueError:
                post['date'] = datetime.now()  # If format is incorrect, use current time as default

        # Generate slug directly from post['date'], without extra formatting
        slug = post['date'].strftime('%Y%m%d%H%M%S')  # Format as year-month-day-hour-minute-second
        publish_date = post['date'].strftime('%Y-%m-%d')  # Keep original date format
    else:
        # If no original date, use current date to generate slug
        slug = datetime.now().strftime('%Y%m%d%H%M%S')
        publish_date = post.get('publishDate', datetime.now().strftime('%Y-%m-%d'))  # Keep original publishDate or default

    # Get description, ensure it's a string and strip whitespace
    description = post.get('description', '')
    description = description.strip() if description else ''  # Clean description

    # If description is empty, force write "" to ensure field exists
    if description == '':
        description = '"This article has no specific description. Readers are encouraged to summarize based on the content."'

    # Get tags, ensure it's a list
    tags = post.get('tags', [])
    if not isinstance(tags, list):
        tags = []  # Ensure tags is a list

    # Handle heroImage field
    cover = post.get('cover', '')
    hero_image = {}
    if cover:
        hero_image['src'] = update_hero_image_url(cover)
        # hero_image['inferSize'] = True
        hero_image['width'] = 1200
        hero_image['height'] = 630
    else:
        hero_image = None  # If no cover, remove heroImage field

    # Create new front-matter data
    new_front_matter = {
        'title': post.get('title', 'Untitled'),
        'categories': post.get('categories', ''),
        'tags': tags,
        'pubDatetime': publish_date,  # Keep original date or use default
        'slug': f'"{slug}"',
        'description': description,  # Ensure description is a valid string
    }

    # Only add heroImage field if it exists
    if hero_image:
        new_front_matter['heroImage'] = hero_image

    # Format as new front-matter
    new_front_matter_str = '---\n' + '\n'.join([f"{key}: {value}" for key, value in new_front_matter.items()]) + '\n---\n'

    # Update file content, preserve original article content, replace front-matter
    new_content = new_front_matter_str + content.split('---\n')[2]

    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(new_content)
    print(f"Updated: {file_path}")

# Traverse all files in the folder
def process_folder(root_folder):
    for subdir, dirs, files in os.walk(root_folder):
        for file in files:
            if file.endswith(".md"):
                file_path = os.path.join(subdir, file)
                update_front_matter(file_path)

# Execute conversion - UPDATE THIS PATH TO YOUR POSTS FOLDER
process_folder('C:/Users/exc/Pictures/_posts')  # Change this to your actual posts folder path
