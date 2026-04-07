import os
from datetime import datetime
import sys
import pytz

# Get command line argument, default to 'undefined'
file_name = sys.argv[1] if len(sys.argv) > 1 else 'undefined'

# Get current date and time (with timezone)
timezone = pytz.timezone('America/New_York')  # Set timezone to your local time (e.g., America/New_York)
current_date = datetime.now(timezone)

# Get year, month, day, hour, minute, second
year = current_date.year
month = str(current_date.month).zfill(2)  # Ensure month is two digits
day = str(current_date.day).zfill(2)    # Ensure day is two digits
hour = str(current_date.hour).zfill(2)  # Ensure hour is two digits
minute = str(current_date.minute).zfill(2)  # Ensure minute is two digits
second = str(current_date.second).zfill(2)  # Ensure second is two digits

# Generate unique slug (yearmmddhhss)
slug = f"{year}{month}{day}{hour}{minute}{second}"
file_name_prefix = f"{year}-{month}-{day}"

# Set folder path
folder_path = os.path.join('src', 'data', 'blog', f"_{year}", f"_{year}-{month}")

# Create folder if it doesn't exist
os.makedirs(folder_path, exist_ok=True)

# Set file path, including timestamp-based slug
file_path = os.path.join(folder_path, f"{file_name_prefix}-{file_name}.mdx")

# Set pubDatetime format with timezone offset
pub_datetime_str = current_date.strftime(f"{year}-{month}-{day} {hour}:{minute}:{second}-05:00")  # -05:00 for US Eastern

# Create post content
content = f"""---
title: "{file_name}"
pubDatetime: {pub_datetime_str}
description: ""  
tags: []  
slug: "{slug}"  
---

Post content goes here...
"""

# Write to file
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Post created at {file_path}")
