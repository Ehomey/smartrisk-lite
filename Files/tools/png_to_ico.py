from PIL import Image
import os
root = os.path.dirname(os.path.dirname(__file__))
png = os.path.join(root, "SmartRisk_Lite_Icon.png")
ico = os.path.join(root, "SmartRisk_Lite_Icon.ico")
if os.path.exists(png):
    img = Image.open(png).convert("RGBA")
    img.save(ico, sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])
    print("ICO written:", ico)
else:
    print("PNG not found:", png)
