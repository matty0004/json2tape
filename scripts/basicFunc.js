const hexRgb = require('hex-rgb');

var JSONP_PREFIX = /^[^(]*?\(/;
var JSONP_SUFFIX = /\)[^)]*?$/;
// parseJsonp is used for parsing newer JDNOW JSONs into read-able format.
exports.parseJsonp = function (jsonpString) {
    if (JSONP_PREFIX.test(jsonpString) && JSONP_SUFFIX.test(jsonpString)) {
        var prefix = jsonpString.match(JSONP_PREFIX)[0];
        var suffix = jsonpString.match(JSONP_SUFFIX)[0];
        return JSON.parse(jsonpString.substring(prefix.length, jsonpString.length - suffix.length));
    }
    else return JSON.parse(jsonpString)
};

// shuffleArray can shuffle/randomize given array.
exports.shuffleArray = function(array) {
    return shuffled = array
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}

// generatePhoneImages is used for generating PhoneImages object for song description.
exports.generatePhoneImages = function(mapName,coachCount) {
    let phoneimages = {
        cover: `world/maps/${mapName.toLowerCase()}/menuart/textures/${mapName.toLowerCase()}_cover_phone.jpg`
    }
    for(let i = 0; i < coachCount; i++) {
        phoneimages[`coach${i + 1}`] = `world/maps/${mapName.toLowerCase()}/menuart/textures/${mapName.toLowerCase()}_coach_${i + 1}_phone.png`;
    }
    return phoneimages
}

// getRealNumCoach is used for returning the right numCoach. Some JDN JSONs got NumCoach as "Solo" or "Quatro" instead of an integer.
exports.getRealNumCoach = function(CoachCount) {
    // CoachCount is already an integer so return it back.
    if (!isNaN(CoachCount)) return CoachCount
    else { // If coachCount is not a number, process it
        let numbersObject = {
            "solo": 1,
            "duet": 2,
            "trio": 3,
            "quatro": 4,
            "dance crew": 4
        }
        return numbersObject[CoachCount.toLowerCase()]
    }
}

// getRealDifficulty is used for returning the right Difficulty. Some JDN JSONs got Difficulty as "Easy" or "Hard" instead of an integer.
exports.getRealDifficulty = function(Difficulty) {
    // Difficulty is already an integer so return it back.
    if (!isNaN(Difficulty)) return Difficulty
    else { // If Difficulty is not a number, process it
        let numbersObject = {
            "easy": 1,
            "normal": 2,
            "hard": 3,
            "extreme": 4
        }
        return numbersObject[Difficulty.toLowerCase()]
    }
}

// getRealDifficulty is used for converting JDN colors to UbiArt RGB for songdescription.
exports.getRealDefaultColors = function(DefaultColors,lyricsColor) {
    function hexToUbi(color) {
        if (color.toLowerCase().includes("0xff")) {
            let json = hexRgb(color.substring(4))
            let red = json.red / 255
            let green = json.green / 255
            let blue = json.blue / 255
            return [1, Number(red.toFixed(6)), Number(green.toFixed(6)), Number(blue.toFixed(6))]
        }
        else if (color.toLowerCase().includes("#") || !color.toLowerCase().includes("0xff")) {
            let json = hexRgb(color)
            let red = json.red / 255
            let green = json.green / 255
            let blue = json.blue / 255
            return [1, Number(red.toFixed(6)), Number(green.toFixed(6)), Number(blue.toFixed(6))]
        }
        return
    }
    return {
        "songcolor_1a": DefaultColors["songColor_1A"] ? hexToUbi(DefaultColors["songColor_1A"]) : [1,1,1,1], // Main 1A color, usually lighter.
        "songcolor_1b": DefaultColors["songColor_1b"] ? hexToUbi(DefaultColors["songColor_1B"]) : [1,1,1,1], // Main 2B color, usually darker.
        "songcolor_2a": DefaultColors["songColor_2a"] ? hexToUbi(DefaultColors["songColor_2A"]) : [1,1,1,1], // Banner 1A color, usually lighter.
        "songcolor_2b": DefaultColors["songColor_2b"] ? hexToUbi(DefaultColors["songColor_2B"]) : [1,1,1,1], // Banner 2B color, usually darker.
        "lyrics": lyricsColor ? hexToUbi(lyricsColor) : [1,1,1,1], // Lyrics color
        "theme": [1, 1, 1, 1] // #FFFFFF as default.
    }
}

exports.musictrackExtras = function() {
    return {
    signatures: [{
            __class: "MusicSignature",
            marker: 1,
            beats: 3
        }, {
            __class: "MusicSignature",
            marker: 4,
            beats: 4
        }, {
            __class: "MusicSignature",
            marker: 194,
            beats: 3
        }, {
            __class: "MusicSignature",
            marker: 197,
            beats: 4
        }
    ],
    sections: [{
        __class: "MusicSection",
        marker: 1,
        sectionType: 6,
        comment: ""
    }, {
        __class: "MusicSection",
        marker: 19,
        sectionType: 1,
        comment: ""
    }, {
        __class: "MusicSection",
        marker: 52,
        sectionType: 7,
        comment: ""
    }, {
        __class: "MusicSection",
        marker: 68,
        sectionType: 3,
        comment: ""
    }, {
        __class: "MusicSection",
        marker: 84,
        sectionType: 7,
        comment: ""
    }, {
        __class: "MusicSection",
        marker: 100,
        sectionType: 1,
        comment: ""
    }, {
        __class: "MusicSection",
        marker: 132,
        sectionType: 7,
        comment: ""
    }, {
        __class: "MusicSection",
        marker: 148,
        sectionType: 3,
        comment: ""
    }, {
        __class: "MusicSection",
        marker: 164,
        sectionType: 7,
        comment: ""
    }, {
        __class: "MusicSection",
        marker: 190,
        sectionType: 3,
        comment: ""
    }, {
        __class: "MusicSection",
        marker: 196,
        sectionType: 2,
        comment: ""
    }, {
        __class: "MusicSection",
        marker: 194,
        sectionType: 6,
        comment: ""
    }, {
        __class: "MusicSection",
        marker: 259,
        sectionType: 3,
        comment: ""
    }, {
        __class: "MusicSection",
        marker: 195,
        sectionType: 7,
        comment: ""
    }, {
        __class: "MusicSection",
        marker: 291,
        sectionType: 7,
        comment: ""
    }] 
    }
}

exports.getPreviewData = function(AudioPreview,beats) {
    return {
        previewEntry: AudioPreview["coverflow"]["startbeat"] || AudioPreview["prelobby"]["startbeat"] || 0,
        previewLoopStart: AudioPreview["coverflow"]["startbeat"] || AudioPreview["prelobby"]["startbeat"] || 0,
        previewLoopEnd: AudioPreview["coverflow"]["endbeat"] || AudioPreview["prelobby"]["endbeat"] || (AudioPreview["coverflow"]["startbeat"] || AudioPreview["prelobby"]["startbeat"]) + 30 
    }

}