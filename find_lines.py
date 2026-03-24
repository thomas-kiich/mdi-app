from PIL import Image
import numpy as np

# Load the image
img_path = "/home/ubuntu/mdi-app/client/public/menschskizze.png"
try:
    img = Image.open(img_path).convert('RGB')
    data = np.array(img)
    height, width, _ = data.shape
    
    print(f"Image loaded: {width}x{height}")
    
    # We are looking for the grey wave lines on the right side of the image.
    # The image is roughly white background. Let's look at a vertical slice on the right side.
    # Let's say x = width - 100 (100 pixels from the right edge)
    
    x_slice = width - 50
    
    # Let's find rows where the color is not pure white
    # Grey lines will have some non-white pixels.
    
    print(f"Scanning vertical slice at x={x_slice}...")
    
    lines_found = []
    in_line = False
    line_start = 0
    
    for y in range(height):
        r, g, b = data[y, x_slice]
        
        # Check if it's "greyish" and not pure white
        # White is typically 255,255,255. Let's say anything where r,g,b < 240 is part of a line
        if r < 240 and g < 240 and b < 240:
            if not in_line:
                in_line = True
                line_start = y
        else:
            if in_line:
                in_line = False
                line_end = y - 1
                center_y = (line_start + line_end) // 2
                lines_found.append((line_start, line_end, center_y))
                
    print(f"Found {len(lines_found)} potential lines:")
    for i, (start, end, center) in enumerate(lines_found):
        print(f"Line {i+1}: Y={start} to {end} (Center: {center})")
        
    # Since the SVG is rendered at a different scale/viewBox, we need to map these coordinates.
    # The SVG viewBox is "0 0 400 800", and the image is set to "object-contain" within a 400x800 container.
    # Let's calculate the scaling factor and offset for object-contain.
    
    container_w, container_h = 400, 800
    
    img_ratio = width / height
    container_ratio = container_w / container_h
    
    if img_ratio > container_ratio:
        # Image is wider, so it fits to width, with empty space top/bottom
        scale = container_w / width
        rendered_h = height * scale
        offset_y = (container_h - rendered_h) / 2
        print(f"\nScaling mode: Fit to width (Scale: {scale:.4f}, Offset Y: {offset_y:.1f})")
    else:
        # Image is taller, so it fits to height, with empty space left/right
        scale = container_h / height
        rendered_w = width * scale
        offset_x = (container_w - rendered_w) / 2
        offset_y = 0
        print(f"\nScaling mode: Fit to height (Scale: {scale:.4f}, Offset X: {offset_x:.1f})")
        
    print("\nMapped Coordinates for SVG viewBox (0 0 400 800):")
    for i, (start, end, center) in enumerate(lines_found):
        svg_y = (center * scale) + offset_y
        print(f"Line {i+1} (Center Y={center}) -> SVG Y = {svg_y:.1f}")

except Exception as e:
    print(f"Error: {e}")
