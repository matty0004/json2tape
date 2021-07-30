# JSON 2 TAPE

Bluestar is a Ubisoft engine that is used for Just Dance Now.
You can convert Bluestar (JDN) formatted JSONs to UbiArt (TAPE) format with this tool.
 
Created by yunyl under Just Dance Alliance.
Please credit us in your work if you are going to use this tool.

## Features
- Cut pictos automatically and rename them. (Duet, Trio and Quatro pictos require to be cropped)
- Download map files from Just Dance Now archive and convert them.
- Customize the script's behaviour from it's settings.

## Requirements
J2T requires [Node.js](https://nodejs.org/) v14+ to run.

If you want to use auto picto splitter, you need [Python](https://python.org).
 - Once you install Python, open CMD and type this `pip install Pillow` to install the image library.

If you don't, you can change `default_splitPictos` from settings to false.

## How to use?
1. Download the source code above and extract it to a folder.
2. Open CMD/CLI in the folder and type `npm i` to install all required packages.
3. Once it's done run `run.bat` and choose one of the options. 
    You can either:
    - Use local files - import your own JSON files
    - Download map files from Just Dance Now archives

4. When it's done, your files will be ready in output/mapName folder!

## Settings
J2T comes with a configuration JSON that you can edit to change the script's behaviours.
```
{
    # DTAPE configuration
    "dtape": {
        "dtape_shuffle": true, # Randomize DTAPE, not sort by Clip type
        "dtape_mapsFolderType": "maps", # ClassifierPath maps folder type, maps or jd2015
        "dtape_motionFormat": "msm", # ClassifierPath extension type
        "dtape_pictoFormat": "png", # PictogramPath extension type, png or tga
        "dtape_useMontagePath": false # If you want to use montage.png.ckd
    },
    # KTAPE configuration
    "ktape": {
        "ktape_shuffle": true # Randomize KTAPE, not sort by time.
    },
    # Musictrack configuration
    "musictrack": {
        "musictrack_audioFormat": "wav" # Audio path extension, can be wav or ogg.
    },
    # Default configuration
    "default": {
        "default_splitPictos": true, # If you want to split pictos.
        "default_minifyJSONs": false, # Minify all JSON files in output folder.
        "default_outputFolder": "./output", # Output folder name, must start with ./
        "default_JDVersion": 2017, # Song description JD Version.
        "default_OriginalJDVersion": 2017, # Song description JD Original Version.
        "default_Credits": "All rights of the producer and other rightholders to the recorded work reserved. Unless otherwise authorized, the duplication, rental, loan, exchange or use of this video game for public performance, broadcasting and online distribution to the public are prohibited." # Default credits.
    }
}
```

## TO-DO
1. Somehow fix picto splitter console log after the end message...

## Credits
- PASHTET for picto cutter script
- Diogo for letting me know about Tape time format.
- Mitchy for help.

# License
This project uses [Polyform Strict](https://polyformproject.org/licenses/strict/1.0.0) license.
