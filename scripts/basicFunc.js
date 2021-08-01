/**
 * BasicFunc
 * This is a module script that helps J2T. 
 */

const hexRgb = require('hex-rgb'),
      chalk = require("chalk")

/**
 * parseJsonp is a JSON parser for Bluestar format JSONs.
 * This was taken from Just Dance Now source code.
 * https://jdnowweb-s.cdn.ubi.com/prod/main/20210719_1009/web/js/utils.js - Line 179
 * @param {*} jsonpString JSON to format
 * @returns {*}
 */
function parseJsonp(jsonpString) {

    const JSONP_PREFIX = /^[^(]*?\(/,
          JSONP_SUFFIX = /\)[^)]*?$/;

    if (JSONP_PREFIX.test(jsonpString) && JSONP_SUFFIX.test(jsonpString)) {
        var prefix = jsonpString.match(JSONP_PREFIX)[0];
        var suffix = jsonpString.match(JSONP_SUFFIX)[0];
        return JSON.parse(jsonpString.substring(prefix.length, jsonpString.length - suffix.length));
    }
    else return JSON.parse(jsonpString)
};

/**
 * shuffleArray randomizes/shuffles given array.
 * @param {Array} Arr 
 * @returns {Array}
 */
function shuffleArray(Arr) {
    return shuffled = Arr
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}

/**
 * generatePhoneImages loops CoachCount times to generate phoneImages object for song description.
 * @param {String} mapName 
 * @param {Number} coachCount 
 * @returns {Object}
 */
function generatePhoneImages(mapName,coachCount) {
    let phoneimages = {
        cover: `world/maps/${mapName.toLowerCase()}/menuart/textures/${mapName.toLowerCase()}_cover_phone.jpg`
    }
    for(let i = 0; i < coachCount; i++) {
        phoneimages[`coach${i + 1}`] = `world/maps/${mapName.toLowerCase()}/menuart/textures/${mapName.toLowerCase()}_coach_${i + 1}_phone.png`;
    }
    return phoneimages
}

/**
 * getRealNumCoach converts string CoachCount (Solo, Duet, Trio...) to numbered CoachCount.
 * @param {Number} CoachCount 
 * @returns {Number}
 */
function getRealNumCoach(CoachCount) {
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

/**
 * getRealDifficulty converts string difficulties (Easy, Hard, Medium...) to numbered difficulties.
 * @param {String} Difficulty 
 * @returns {Number}
 */
function getRealDifficulty(Difficulty = "Easy") {
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

/**
 * getRealDefaultColors converts Bluestar DefaultColors object and LyricsColor key to UbiArt formatted RGB colors.
 * It converts HEX color to RGB and divides each RGB value with 255.
 * @param {Object} DefaultColors 
 * @param {String} lyricsColor 
 * @returns {Object}
 */
function getRealDefaultColors(DefaultColors = {}, lyricsColor = "ffffff") {
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
	try {
		return {
			"songcolor_1a": DefaultColors["songColor_1A"] ? hexToUbi(DefaultColors["songColor_1A"]) : [1, 0.266667, 0.266667, 0.266667], // Main 1A color, usually lighter.
			"songcolor_1b": DefaultColors["songColor_1b"] ? hexToUbi(DefaultColors["songColor_1B"]) : [1, 0.066667, 0.066667, 0.066667], // Main 2B color, usually darker.
			"songcolor_2a": DefaultColors["songColor_2a"] ? hexToUbi(DefaultColors["songColor_2A"]) : [1, 0.666667, 0.666667, 0.666667], // Banner 1A color, usually lighter.
			"songcolor_2b": DefaultColors["songColor_2b"] ? hexToUbi(DefaultColors["songColor_2B"]) : [1, 0.466667, 0.466667, 0.466667], // Banner 2B color, usually darker.
			"lyrics": lyricsColor ? hexToUbi(lyricsColor) : [1,1,1,1], // Lyrics color
			"theme": [1, 1, 1, 1] // #FFFFFF as default.
		}
	}
	catch(error) {
		return {
			"songcolor_1a": [1, 0.266667, 0.266667, 0.266667], // Main 1A color, usually lighter.
			"songcolor_1b":[1, 0.066667, 0.066667, 0.066667], // Main 2B color, usually darker.
			"songcolor_2a": [1, 0.666667, 0.666667, 0.666667], // Banner 1A color, usually lighter.
			"songcolor_2b": [1, 0.466667, 0.466667, 0.466667], // Banner 2B color, usually darker.
			"lyrics": [1, 1, 1, 1], // Lyrics color
			"theme": [1, 1, 1, 1] // #FFFFFF as default.
		}
	}
}

/**
 * debugLog is for logging prettier console messages with chalk package.
 * @param {String} msg Message to log. Must start with [] - EX: "[HELLO] Welcome, hello!""
 * @param {String} color List of colors can be found on https://www.npmjs.com/package/chalk
 */
function debugLog(msg, color = "green") {
    console.log(`${chalk[color](msg.match(/\[(.*?)\]/)[0])} ${msg.split("]")[1].substr(1)}`)
}

/**
 * getPreviewData is for detecting and returning the correct Bluestar AudioPreview data.
 * Some maps have coverflow while some has prelobby. This will help with automatically detecting stuff.
 * @param {Object} AudioPreview
 * @returns {Object}
 */
function getPreviewData(AudioPreview = {
        coverflow: {
            startbeat: 0,
			endbeat: 30
        },
        prelobby: {
            startbeat: 0,
			endbeat: 30
        }
    }) {
    let finalData = {
        previewEntry: 0,
        previewLoopStart: 10,
		previewLoopEnd: 30
    }

	if (AudioPreview.prelobby && AudioPreview.prelobby.startbeat) {
		finalData.previewEntry = AudioPreview.prelobby.startbeat
	}
	
	if (AudioPreview.coverflow && AudioPreview.coverflow.startbeat) {
		finalData.previewEntry = AudioPreview.coverflow.startbeat
	}
	
	if (AudioPreview.coverflow && AudioPreview.coverflow.startbeat) {
		finalData.previewLoopStart = AudioPreview.coverflow.startbeat
	}
	
	if (AudioPreview.prelobby && AudioPreview.prelobby.startbeat) {
		finalData.previewLoopStart = AudioPreview.prelobby.startbeat
	}
	
	if (AudioPreview.prelobby && AudioPreview.prelobby.endbeat) {
		finalData.previewLoopEnd = AudioPreview.prelobby.endbeat
	}
	
	if (AudioPreview.coverflow && AudioPreview.coverflow.endbeat) {
		finalData.previewLoopEnd = AudioPreview.coverflow.endbeat
	}
	
	
    return finalData
}

module.exports = {
    parseJsonp,
    shuffleArray,
    generatePhoneImages,
    getRealNumCoach,
    getRealDifficulty,
    getRealDefaultColors,
    debugLog,
    getPreviewData
}