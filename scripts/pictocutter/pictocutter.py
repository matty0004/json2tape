from __future__ import print_function
from PIL import Image
import os, sys
import urllib.request


os.makedirs('scripts/pictocutter/picto_input', exist_ok=True)
os.makedirs('scripts/pictocutter/picto_output', exist_ok=True)
codename = (sys.argv[1:])[0]
os.mkdir("scripts/pictocutter/picto_output/" + codename )

urlpng = "http://jdnowweb-s.cdn.ubi.com/uat/release_tu2/20150928_1740/songs/" + codename + "/assets/web/pictos-sprite.png"
urlcss = "http://jdnowweb-s.cdn.ubi.com/uat/release_tu2/20150928_1740/songs/" + codename + "/assets/web/pictos-sprite.css"
urllib.request.urlretrieve(urlpng, "scripts/pictocutter/picto_input/pictos-sprite.png")
urllib.request.urlretrieve(urlcss, "scripts/pictocutter/picto_input/pictos-sprite.css")

pictosspritepng = Image.open(f'scripts/pictocutter/picto_input/pictos-sprite.png')

a = 7
b = 0
c = 0
d = 256

howmanypictos = (pictosspritepng.size[0] // 256)

for line in open(f'scripts/pictocutter/picto_input/pictos-sprite.css'):
    while ((line[(b - 1):b]) == "{") == False:
        b+=1
    if ((line[(b - 1):b]) == "{") == True:
        b-=1
        pictoname = (line[a:b])
        b = 0
        width, height = pictosspritepng.size # Get dimensions 
        left = c
        top = height - 256
        right = d
        bottom = 2 * height - 256
        cropped_example = pictosspritepng.crop((left, top, right, bottom))
        cropped_example.save("./scripts/pictocutter/picto_output/"+ codename + "/" + pictoname + ".png")
        c+=256
        d+=256
	
print("done")