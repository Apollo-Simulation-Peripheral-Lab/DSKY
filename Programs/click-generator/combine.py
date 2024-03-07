import os
from itertools import permutations
from pydub import AudioSegment
import random

def generate_combinations(input_list, max_length=None, num_orderings=5):
    orderings = []
    
    for _ in range(num_orderings):
        ordering = random.sample(input_list, len(input_list))
        if max_length is not None and len(ordering) > max_length:
            ordering = ordering[:max_length]
        orderings.append(ordering)
    
    return orderings

# Path to the folder containing individual click sounds
clicks_folder = "individual/"
# Get all the filenames of click sounds in the folder
clicks = [os.path.join(clicks_folder, file) for file in os.listdir(clicks_folder)]

print("Clicks found in folder:")
print(clicks)

# Maximum number of combinations per amount of clicks
max_combinations_per_length = 5
max_length = 11

# Generate combinations of clicks
all_combinations = generate_combinations(clicks, max_length, max_combinations_per_length)

# Load the noise MP3 file
noise_file = "noise.mp3"
noise = AudioSegment.from_file(noise_file)

# Output folder for the combined files
output_folder = "output/"

# Combine combinations into MP3 files
for i in range(max_length):
    combinations = generate_combinations(clicks, i + 1, max_combinations_per_length)
    for j,combination in enumerate(combinations):
        output_filename = f'clicks{i+1}_{j}.mp3'
        output_path = os.path.join(output_folder, output_filename)
        combined_sound = None
        for click in combination:
            print(f"Processing click: {click}")
            click_sound = AudioSegment.from_file(click)
            # Apply fade in and fade out effects
            if combined_sound is None:
                combined_sound = noise + click_sound
            else:   
                combined_sound += noise + click_sound

        combined_sound = combined_sound + noise
        combined_sound = combined_sound.fade_in(30).fade_out(30)
        combined_sound.export(output_path, format='mp3')
        print(f'Combined {len(combination)} clicks into {output_filename}')
