from PIL import Image, ImageDraw
import sys

def remove_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # Floodfill the 4 corners to remove the outermost white background, leaving the inner white sticker stroke intact
    ImageDraw.floodfill(img, xy=(0, 0), value=(255, 255, 255, 0), thresh=45)
    ImageDraw.floodfill(img, xy=(img.width - 1, 0), value=(255, 255, 255, 0), thresh=45)
    ImageDraw.floodfill(img, xy=(0, img.height - 1), value=(255, 255, 255, 0), thresh=45)
    ImageDraw.floodfill(img, xy=(img.width - 1, img.height - 1), value=(255, 255, 255, 0), thresh=45)
    
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_background(sys.argv[1], sys.argv[2])
