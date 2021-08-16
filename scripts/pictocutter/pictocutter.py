import sys, os, urllib.request
from PIL import Image
from io import BytesIO

def PictoCutter(MapName = (sys.argv[1:])[0], CoachCount = (sys.argv[1:])[1], ResizeAgain=True):
    os.makedirs("scripts/pictocutter/picto_output/" + MapName, exist_ok=True)
    
    css = urllib.request.urlopen("https://jdnowweb-s.cdn.ubi.com/uat/release_tu2/20150928_1740/songs/" + MapName + "/assets/web/pictos-sprite.css").read().decode("utf8").split("\n")
    atlas = Image.open(BytesIO(urllib.request.urlopen("https://jdnowweb-s.cdn.ubi.com/uat/release_tu2/20150928_1740/songs/" + MapName + "/assets/web/pictos-sprite.png").read()))
    
    if int(CoachCount) > 1:
        y1 = 40
        x1 = 217
    else:
        y1 = 0
        x1 = 256
    x = 256
    y = 0
    for picto in css:
        PictoName = picto.split("-")
        PictoName = PictoName[1].split("{")
        PictoName = PictoName[0]
        picto = atlas.crop((y,y1,x,x1))
        y = y + 256
        x = x + 256
        if (int(CoachCount) > 1) and ResizeAgain:
            picto = picto.resize((256,  256))
        picto.save("./scripts/pictocutter/picto_output/"+ MapName + "/" + PictoName + ".png")
    print("done")

PictoCutter()