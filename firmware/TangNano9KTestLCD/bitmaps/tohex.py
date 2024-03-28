import sys
from PIL import Image

def rgb_to_hex(pixel):
    return '{:02x}\n{:02x}\n{:02x}\n'.format(*pixel)

def image_to_hex(image_path, hex_file_path):
    with Image.open(image_path) as img:
        width, height = img.size
        pixels = list(img.getdata())

        with open(hex_file_path, 'w') as hex_file:
            for pixel in pixels:
                hex_pixel = rgb_to_hex(pixel)
                hex_file.write(hex_pixel)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <input_image_path> <output_hex_file_path>")
        sys.exit(1)
    
    input_image_path = sys.argv[1]
    output_hex_file_path = sys.argv[2]
    
    image_to_hex(input_image_path, output_hex_file_path)
    print("Hex file generated successfully.")