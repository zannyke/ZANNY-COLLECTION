from PIL import Image

def crop_transparent(image_path):
    img = Image.open(image_path).convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        img_cropped = img.crop(bbox)
        img_cropped.save(image_path)
        print("Cropped successfully to bbox:", bbox)
    else:
        print("No bounding box found (image might be completely empty).")

if __name__ == "__main__":
    crop_transparent("public/zanny_collection_icon.png")
