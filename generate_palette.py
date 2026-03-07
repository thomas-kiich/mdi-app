import json
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Load the frequency data
with open('/home/ubuntu/mdi-app/client/src/lib/frequencyData.json', 'r') as f:
    data = json.load(f)

# Define a mapping from color names to hex codes based on the PDF description
# This is an approximation based on standard color names and the description
color_map = {
    "Blauviolett": "#8A2BE2",
    "Violett": "#EE82EE",
    "Violettblau": "#6A5ACD",
    "Dunkelblau": "#00008B",
    "Signalblau": "#003399",
    "Himmelblau": "#87CEEB",
    "Cyan": "#00FFFF",
    "Türkisgrün": "#40E0D0",
    "Smaragdgrün": "#50C878",
    "Laubgrün": "#4F7942",
    "Gelbgrün": "#9ACD32",
    "Zitronengelb": "#FFF700",
    "Signalgelb": "#FFCC00",
    "Goldgelb": "#FFD700",
    "Hellorange": "#FFA500",
    "Reinorange": "#FF8C00",
    "Leuchtorange": "#FF7F50",
    "Orangerot": "#FF4500",
    "Feuerrot": "#FF0000",
    "Signalrot": "#A52A2A",
    "Karminrot": "#960018",
    "Purpur": "#800080",
    "Tiefrot": "#8B0000",
    "Infrarotgrenze": "#4B0000"
}

# Update the data with hex codes
for item in data:
    item['hex'] = color_map.get(item['colorName'], "#000000")

# Save the updated data back to the JSON file
with open('/home/ubuntu/mdi-app/client/src/lib/frequencyData.json', 'w') as f:
    json.dump(data, f, indent=2)

# Visualize the palette
fig, ax = plt.subplots(figsize=(12, 8))
ax.set_xlim(0, 12)
ax.set_ylim(0, 8)
ax.axis('off')

for i, item in enumerate(data):
    row = i // 6
    col = i % 6
    rect = patches.Rectangle((col * 2, 6 - row * 2), 2, 2, linewidth=1, edgecolor='none', facecolor=item['hex'])
    ax.add_patch(rect)
    ax.text(col * 2 + 1, 6 - row * 2 + 1, f"{item['id']}\n{item['colorName']}\n{item['frequency']} Hz", 
            ha='center', va='center', fontsize=8, color='white' if i > 18 or i < 5 else 'black')

plt.title("MDI 24-Step Color Frequency Palette")
plt.savefig('/home/ubuntu/mdi-app/palette_preview.png')
print("Palette generated and saved to /home/ubuntu/mdi-app/palette_preview.png")
