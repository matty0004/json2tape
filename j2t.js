// JSON 2 TAPE - by yunyl (1.0.0)
// This file/project was created on April 21, 2021 9:30PM.


// -- Modules
// Required and used modules

// Global
const fs = require("fs"),
      axios = require("axios"),
      spawn = require('child_process').spawn

// Local
const BasicFunc = require("./scripts/basicFunc")
// --

// -- Files
// Required files to read
const readFile = (...modules) => modules.map(module => BasicFunc.parseJsonp(fs.readFileSync(module).toString()));
let [
    mainJson, 
    moves0, 
    moves1, 
    moves2, 
    moves3,
    j2tSettings
] = readFile("./input.json", "./input_moves0.json", "./input_moves1.json","./input_moves2.json","./input_moves3.json","./j2t_settings.json")
// --

// -- Init
// Main function where everything happens.
function init() {

    // -- Variables

        // Input files

            // Combine all moves files into one and append moveId key.
            const Moves = [moves0, moves1, moves2, moves3].flatMap(
                (moves, moveId) => moves.map(move => ({
                    ...move,
                    moveId,
                }))
            )

        // Song data
        
            let MapName = mainJson.MapName,
                CoachCount = BasicFunc.getRealNumCoach(mainJson.NumCoach) || 1,
                Artist = mainJson.Artist || "Placeholder Artist",
                Title = mainJson.Title || "Placeholder Title",
                AudioPreview = mainJson.AudioPreview || {}
                Beats = mainJson.beats || [],
                Pictos = mainJson.pictos || [],
                Lyrics = mainJson.lyrics || [],
                BeatsMap24 = []

            if (Beats[0] !== 0) {
                let firstBeat = Beats[0],
                    nextBeats = Beats.slice(0, 5)
                for (let i = 0; i < 5; i++) Beats.splice(i, 0, nextBeats[i] - firstBeat);
            }
            for (var i = 0; i < Beats.length; i++) BeatsMap24.push(i * 24)
            

    // --



    // -- Markers
    // Create and set marker timings for the song.
    // let markers = BasicFunc.getMarkers(mainJson["beats"])
    // --

    // -- Functions
    // Required and used functions
    // getSetting is used for receiving and returning the requested setting from the settings JSON.
    function getSetting(settingName) {
        return j2tSettings[settingName.split("_")[0]][settingName]
    }

    // writeToFolder is used for writing file to map's folder.
    function writeToFolder(json, type, minifyJSON = getSetting("default_minifyJSONs")) {
        let path;
        switch(type) {
            case "songdesc":
                path = `${getSetting("default_outputFolder")}/${MapName}/songdesc.tpl.ckd`
                break;
            case "dtape":
                path = `${getSetting("default_outputFolder")}/${MapName}/${MapName.toLowerCase()}_tml_dance.dtape.ckd`
                break;
            case "ktape":
                path = `${getSetting("default_outputFolder")}/${MapName}/${MapName.toLowerCase()}_tml_karaoke.ktape.ckd`
                break;
            case "musictrack":
                path = `${getSetting("default_outputFolder")}/${MapName}/${MapName.toLowerCase()}_musictrack.tpl.ckd`
                break;
        }
        fs.writeFileSync(
            path, 
            minifyJSON ? JSON.stringify(json) : JSON.stringify(json, null, 2)
        )
    }

    // randomId returns a random Id for dTape, kTape
    function randomId(min = 1000000000, max = 4000000000) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    // ubiArtTime interpolates given time format.
    function ubiArtTime(Time, parse = false) {
        var linear = require('everpolate').linear
        return parse ? parseInt(linear(Time, Beats, BeatsMap24)[0]) : linear(Time, Beats, BeatsMap24)[0]
    }
    // --

    // Create output_folder/mapName if it does not exist.
    if (!fs.existsSync(`${getSetting("default_outputFolder")}/${MapName}/`, {  recursive: true	})) fs.mkdirSync(`${getSetting("default_outputFolder")}/${MapName}/`)

    // -- SONGDESC
    // Create song description file, used for keeping song title, artist, coachCount and such.
    function songdescUtility() {
        let JD_SongDescTemplate = {
            // -- CLASS = Actor_Template
            __class: "Actor_Template",
            // -- UbiArt FrameWork configuration
            WIP: 0,
            LOWUPDATE: 0,
            UPDATE_LAYER: 0,
            PROCEDURAL: 0,
            STARTPAUSED: 0,
            FORCEISENVIRONMENT: 0,
            // -- 
            COMPONENTS: [{
                    __class: "JD_SongDescTemplate",
                    MapName: MapName, // MapName
                    JDVersion: mainJson.JDVersion || getSetting("default_JDVersion"), // JDVersion is for setting the version of the game you are adding this song to.
                    OriginalJDVersion: mainJson.OriginalJDVersion || getSetting("default_OriginalJDVersion"), // OriginalJDVersion is used for displaying which version this song is from.
                    Artist: mainJson.Artist || "Unknown Artist", // Song Artist
                    DancerName: "Unknown Dancer" || mainJson.DancerName, // DancerName is unknown and probably left-over/unused feature from JD14.
                    Title: mainJson.Title || "Unknown Title", // Song Title
                    Credits: mainJson.Credits || getSetting("default_Credits"), // Credits, I think we all know what this is.
                    PhoneImages: BasicFunc.generatePhoneImages(MapName,CoachCount), // PhoneImages is for setting the path of song assets for the phone controller.
                    NumCoach: CoachCount, // NumCoach is the amount of coaches in the song.
                    MainCoach: -1, // MainCoach is probably used for setting the main coach, this is why first coach is 0 and not 1.
                    Difficulty: BasicFunc.getRealDifficulty(mainJson.Difficulty), // Difficulty is for song's difficulty. Mostly used in JD14, JD19 and above.
                    SweatDifficulty: BasicFunc.getRealDifficulty(mainJson.Difficulty) + 1 || mainJson.SweatDifficulty, // SweatDifficulty is the difficulty for sweat mode, I think + 1 can be a solution, this could be fixed.
                    backgroundType: mainJson.BackgroundType || 0, // BackgroundType is used in JD14-15, not used in JD16 and above.
                    LyricsType: mainJson.LyricsType || 0, // LyricsType is used for displaying lyrics as karaoke or normal. 0 is normal, 1 is karaoke
                    Tags: ["main"], // Tags are used for categorizing, including/excluding songs. The "main" tag is used as default.
                    Status: mainJson.Status || 3, // Status is for setting the current status of the song. It's for setting the song to be normal, locked or mojo unlock only.
                    LocaleID: mainJson.LocaleID || 4294967295, // LocaleId is used for setting customTypeName for local songs, which is basically Alternate or Extreme title. The reason why it checks the mainJson is because some songs such as OnMyMind got localeID in JDN JSON.
                    MojoValue: mainJson.MojoValue || 0, // MojoValue is not known, even if it is, I doubt it would work.
                    CountInProgression: 1 || mainJson.CountInProgression, // CountInProgression is unknown.
                    DefaultColors: BasicFunc.getRealDefaultColors(mainJson.DefaultColors,mainJson.lyricsColor), // DefaultColors is used for displaying menu colors. 1A and 1B are big colors while 2A and 2B are banner colors. A colors are usually lighter and B colors are darker.
                    VideoPreviewPath: "" // VideoPreviewPath was used in Just Dance 2019 demo, not used and not required.
                }
            ]
        }
        writeToFolder(JD_SongDescTemplate, "songdesc")
        return

    }


    // -- MUSICTRACK
    // Create musictrack for configuring when the song should end and what it's beats (bpm) should be.
    function musicTrackUtility() {
        let MusicTrackComponent_Template = {
            __class: "Actor_Template",
            WIP: 0,
            LOWUPDATE: 0,
            UPDATE_LAYER: 0,
            PROCEDURAL: 0,
            STARTPAUSED: 0,
            FORCEISENVIRONMENT: 0,
            COMPONENTS: [{
                    __class: "MusicTrackComponent_Template",
                    trackData: {
                        __class: "MusicTrackData",
                        structure: {
                            __class: "MusicTrackStructure",
                            markers: multiplyBeats = Beats.map(beat => { return beat * 48 }),
                            signatures: [{
                                __class: "MusicSignature",
                                marker: 0,
                                beats: 4
                            }],
                            startBeat: 0,
                            endBeat: Beats.length,
                            videoStartTime: 0,
							// We use getPreviewData function and give it the AudioPreview obj 
							// and beats and it returns us an object with the preview data we need.
                            previewEntry: BasicFunc.getPreviewData(mainJson["AudioPreview"], mainJson["beats"]).previewEntry,
                            previewLoopStart: BasicFunc.getPreviewData(mainJson["AudioPreview"], mainJson["beats"]).previewLoopStart,
                            previewLoopEnd: BasicFunc.getPreviewData(mainJson["AudioPreview"], mainJson["beats"]).previewLoopEnd,
                            volume: 0
                        },
                        path: `world/${getSetting("dtape_mapsFolderType")}/${MapName.toLowerCase()}/audio/${MapName.toLowerCase()}.${getSetting("musictrack_audioFormat")}`,
                        url: `jmcs://jd-contents/${MapName}/${MapName}.ogg`
                    }
                }
            ]
        }    
        writeToFolder(MusicTrackComponent_Template, "musictrack")
        return    
    }


    // -- DTAPE
    // Create dance tape file that contains move, picto and goldeffect timing.
    function dtapeUtility() {
        let Tape = {
            __class: "Tape",
            Clips: [],
            TapeClock: 0,
            TapeBarCount: 1,
            FreeResourcesAfterPlay: 0,
            MapName: MapName
        }

        // -- MotionClip
        Moves.forEach(move => {
            let MotionClip = {
                __class: "MotionClip",
                Id: randomId(),
                TrackId: 0,
                IsActive: 1,
                StartTime: ubiArtTime(move.time, true),
                Duration: ubiArtTime(move.duration, true),
                ClassifierPath: `world/${getSetting("dtape_mapsFolderType")}/${MapName.toLowerCase()}/timeline/moves/${move.name}.msm`,
                GoldMove: move.goldMove ? 1 : 0,
                CoachId: move.moveId,
                MoveType: 0,
                Color: [1, 0.500000, 0.500000, 0.500001],
                MotionPlatformSpecifics: {
                    X360: {
                        __class: "MotionPlatformSpecific",
                        ScoreScale: 1,
                        ScoreSmoothing: 0,
                        ScoringMode: 0
                    },
                    ORBIS: {
                        __class: "MotionPlatformSpecific",
                        ScoreScale: 1,
                        ScoreSmoothing: 0,
                        ScoringMode: 0
                    },
                    DURANGO: {
                        __class: "MotionPlatformSpecific",
                        ScoreScale: 1.2,
                        ScoreSmoothing: 0,
                        ScoringMode: 0
                    }
                }
            }
            Tape.Clips.push(MotionClip)
        })
        // --

        // -- PictogramClip
        Pictos.forEach(picto => {
            let PictogramClip = {
                __class: "PictogramClip",
                Id: randomId(),
                TrackId: 0,
                IsActive: 1,
                StartTime: ubiArtTime(picto.time, true),
                Duration: ubiArtTime(picto.duration, true),
                PictoPath: `world/${getSetting("dtape_mapsFolderType")}/${MapName.toLowerCase()}/timeline/pictos/${picto.name}.${getSetting("dtape_pictoFormat")}`,
                MontagePath: getSetting("dtape_useMontagePath") 
                            ? `world/${getSetting("dtape_mapsFolderType")}/${MapName.toLowerCase()}/timeline/pictos/montage.png` 
                            : "",
                AtlIndex: 4294967295,
                CoachCount: 4294967295
            }
            Tape.Clips.push(PictogramClip)
        })
        // --

        // -- GoldEffectClip
        Tape.Clips.forEach((Clip, i) => {
            if (Clip["__class"] === "MotionClip" && Clip["GoldMove"] && Clip["GoldMove"] == 1) {
                let GoldEffectClip = {
                    __class: "GoldEffectClip",
                    Id: randomId(),
                    TrackId: randomId(),
                    IsActive: 1,
                    StartTime: Clip["StartTime"] + 24,
                    Duration: 24,
                    EffectType: 0
                }
                Tape.Clips.push(GoldEffectClip)
            }
        })
        // --

        writeToFolder(Tape, "dtape")
        return

    }


    // -- KTAPE
    // Create karaoke tape file that contains lyrics, their timing and duration.
    function ktapeUtility() {
        let Tape = {
            __class: "Tape",
            Clips: [],
            TapeClock: 0,
            TapeBarCount: 1,
            FreeResourcesAfterPlay: 0,
            MapName: MapName
        }
        Lyrics.forEach(lyric => {
            let KaraokeClip = {
                __class: "KaraokeClip",
                Id: randomId(),
                TrackId: 0,
                IsActive: 1,
                StartTime: ubiArtTime(lyric.time, true),
                Duration: ubiArtTime(lyric.duration, true),
                Pitch: 7.000001,
                Lyrics: lyric.text,
                IsEndOfLine: 0,
                ContentType: 0,
                StartTimeTolerance: 4,
                EndTimeTolerance: 4,
                SemitoneTolerance: 5
            }
            Tape.Clips.push(KaraokeClip)
        })
        writeToFolder(Tape, "ktape")
    }
    songdescUtility()
    dtapeUtility()
    ktapeUtility()
    musicTrackUtility()
}
// --


init() // Execute init to start the converting process.