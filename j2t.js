/**
 * 
 * JSON 2 TAPE - Created on April 21, 2021 9:30PM
 * 
 * Bluestar is a Ubisoft engine that is used for Just Dance Now.
 * You can convert Bluestar (JDN) formatted JSONs to UbiArt (TAPE) format with this tool.
 * 
 * Created by yunyl under Just Dance Alliance.
 * Please credit us in your work if you are going to use this tool.
 * 
 */

// NOTE: I will update this script everytime I got time for it.
// It is messy and most comments are missing. You can contribute with your knowledge.


// -- Modules
// Required and used modules

    // Global
    const fs = require("fs"),
          fse = require("fs-extra"),
          axios = require("axios"),
          chalk = require('chalk'),
          inquirer = require("inquirer"),
          spawn = require("child_process").spawn;

    // Local
    const BasicFunc = require("./scripts/basicFunc.js")

// --


// Welcome message
console.log(
    `\nWelcome to ${chalk.bold("JSON 2 TAPE")} by yunyl! Convert your Bluestar JSONs to UbiArt Tape format.`,
)

// An array of questions to ask to the user.
let cliInput = [{
    type: "list",
    message: "Please select an option below.",
    name: "options",
    choices: [{
          name: "Use local map files",
          value: "local",
        },
        {
          name: "Download map from JDNowWeb",
          value: "jdnow",
        },
    ]
}]

// Execute the prompt input's and call __init__
inquirer.prompt(cliInput).then(responses => {
    
    switch(responses.options) {

        // If JDNOW downloading was chosen, we download the files from JDNOWWEB.
        case "jdnow":
                inquirer.prompt({
                type: "input",
                name: "mapName",
                message: `Please enter the mapName you would like to download.`
            }).then(answer => {

                BasicFunc.debugLog(
                    `\n[INFO] Your input files will be overwritten!`,
                    "yellow"
                )

                let MapName = answer.mapName.trim(),
                    BaseUrl = `http://jdnowweb-s.cdn.ubi.com/uat/release_tu2/20150928_1740/songs/${MapName}`,
                    Assets = [{
                            path: `/${MapName}.json`,
                            filename: "input.json"
                        }, {
                            path: `/data/moves/${MapName}_moves0.json`,
                            filename: "input_moves0.json"
                        }, {
                            path: `/data/moves/${MapName}_moves1.json`,
                            filename: "input_moves1.json"
                        }, {
                            path: `/data/moves/${MapName}_moves2.json`,
                            filename: "input_moves2.json"
                        }, {
                            path: `/data/moves/${MapName}_moves3.json`,
                            filename: "input_moves3.json"
                    }]

                    // We have to check if mapName has a folder in JDNOWWEB and then proceed.
                    axios({
                        method: "HEAD",
                        url: BaseUrl + "/"
                    })
                    .then(response => {})
                    .catch(error => {
                        BasicFunc.debugLog(
                            `[WARNING!] An error occured. Are you sure ${MapName} is an existing mapName? Exiting...`,
                            "red"
                        )
                        process.exit(1)
                    })

                    Promise.all(Assets.map((asset) => {
                        return axios({
                            method: "GET",
                            url: BaseUrl + asset.path
                        })
                        .then(response => {
                            BasicFunc.debugLog(
                                `[DOWNLOADED] Successfully saved ${asset.path}`
                            )
                            fs.writeFileSync(
                                `./${asset.filename}`,
                                response.data
                            )
                        })
                        .catch(error => {

                            // If any moves file threw an error while downloading, we write it empty.
                            if (asset.path.includes("moves")) {

                                fs.writeFileSync(
                                    `./${asset.filename}`,
                                    JSON.stringify([])
                                )

                            }

                            else if (!asset.path.includes("moves")) {
                                BasicFunc.debugLog(
                                    `[WARNING!] An error occured while trying to download ${asset.path}`,
                                    "red"
                                )
                            }
                                
                        })
                    }))
                    .then(() => {
                        console.log(`${chalk.bold("\nStarting converting process...")}`)
                        init()
                    })
                    
            })
            
            break;
        
        // If local was selected, we call init() directly.
        case "local":
            init()
            break;
    }


})

// -- Init
// Main function where everything happens.
function init() {

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
                CoachCount = mainJson.NumCoach ? BasicFunc.getRealNumCoach(mainJson.NumCoach) : 1,
                Artist = mainJson.Artist || "Placeholder Artist",
                Title = mainJson.Title || "Placeholder Title",
                Difficulty = mainJson.Difficulty || 1,
                AudioPreview = mainJson.AudioPreview || {}
                Beats = mainJson.beats ? mainJson.beats : [],
                Pictos = mainJson.pictos || [],
                Lyrics = mainJson.lyrics || [],
                BeatsMap24 = []

            if (Beats.length > 5 && Beats[0] !== 0) {
                let firstBeat = Beats[0],
                    nextBeats = Beats.slice(0, 5)
                for (let i = 0; i < 5; i++) Beats.splice(i, 0, nextBeats[i] - firstBeat);
            }
            for (var i = 0; i < Beats.length; i++) BeatsMap24.push(i * 24)
            

    // --

    // -- Functions
    // Required and used functions

    /**
     * getSetting reads J2T settings and returns values.
     * @param {String} settingName 
     * @returns {*}
     */
    function getSetting(settingName) {
        return j2tSettings[settingName.split("_")[0]][settingName]
    }

    /**
     * writeToFolder writes output data to output folder depending on type.
     * @param {*} json JSON file to write
     * @param {String} type Type of file, dtape, ktape, musictrack...
     * @param {Boolean} minifyJSON Minify the JSONs
     */
    function writeToFolder(json, type, minifyJSON = getSetting("default_minifyJSONs")) {
        let path;
        switch(type) {
            case "songdesc":
                path = `${getSetting("default_outputFolder")}/${MapName}/songdesc.tpl.ckd`
                break;
            case "dtape":
                if (!json.Clips || json.Clips.length == 0)
                    BasicFunc.debugLog(
                        `[INFO] Your DTAPE output is empty. Are you sure you are not missing anything?`,
                        "yellow"
                    )
                path = `${getSetting("default_outputFolder")}/${MapName}/${MapName.toLowerCase()}_tml_dance.dtape.ckd`
                break;
            case "ktape":
                if (!json.Clips || json.Clips.length == 0)
                    BasicFunc.debugLog(
                        `[INFO] Your KTAPE output is empty. Are you sure you are not missing anything?`,
                        "yellow"
                    )
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

    /**
     * randomId generates a random number between two ranges.
     * @param {Number} min minimum value
     * @param {Number} max maximum value
     * @returns {Number}
     */
    function randomId(min = 1000000000, max = 4000000000) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    /**
     * ubiArtTime everpolarates given millisecond/second time.
     * @param {Number} Time MS time
     * @param {Boolean} parse Parse float
     * @returns {Number}
     */
    function ubiArtTime(Time, parse = false) {
        var linear = require('everpolate').linear
        return parse ? parseInt(linear(Time, Beats, BeatsMap24)[0]) : linear(Time, Beats, BeatsMap24)[0]
    }

    // --
    
    // We delete the MapNames folder from output folder if it already exists.
    if (fs.existsSync(
        `${getSetting("default_outputFolder")}/${MapName}/`
    )) fs.rmdirSync(`${getSetting("default_outputFolder")}/${MapName}/`, { recursive: true });

    // We create the MapNames folder in the output folder for the new files.
    if (!fs.existsSync(
        `${getSetting("default_outputFolder")}/${MapName}/`
    )) fs.mkdirSync(`${getSetting("default_outputFolder")}/${MapName}/`, { recursive: true })


    console.log(
       `\n---- ${chalk.cyan("mapName:")} ${MapName} ---- ${chalk.cyan("coachCount:")} ${CoachCount} ----\n`
    )

    
    // -- Input checker
    // We check if user's input data is missing or empty and show warning messages.
    if (!Beats || Beats.length < 1) {
        BasicFunc.debugLog(
            `[WARNING!] Your Bluestar Beats are empty. They are required.`,
            "red"
        )
        process.exit(1)
    }
    if (!Pictos || Pictos.length < 1) {
        BasicFunc.debugLog(
            `[INFO] Your Bluestar Pictos are empty.`,
            "yellow"
        )
    }
    if (!Lyrics || Lyrics.length < 1) {
        BasicFunc.debugLog(
            `[INFO] Your Bluestar Lyrics are empty.`,
            "yellow"
        )
    }
    // --


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
                    Artist: Artist || "Unknown Artist", // Song Artist
                    DancerName: "Unknown Dancer" || mainJson.DancerName, // DancerName is unknown and probably left-over/unused feature from JD14.
                    Title: Title || "Unknown Title", // Song Title
                    Credits: mainJson.Credits || getSetting("default_Credits"), // Credits, I think we all know what this is.
                    PhoneImages: BasicFunc.generatePhoneImages(MapName,CoachCount), // PhoneImages is for setting the path of song assets for the phone controller.
                    NumCoach: CoachCount, // NumCoach is the amount of coaches in the song.
                    MainCoach: -1, // MainCoach is probably used for setting the main coach, this is why first coach is 0 and not 1.
                    Difficulty: BasicFunc.getRealDifficulty(Difficulty), // Difficulty is for song's difficulty. Mostly used in JD14, JD19 and above.
                    SweatDifficulty: BasicFunc.getRealDifficulty(Difficulty) + 1 || mainJson.SweatDifficulty, // SweatDifficulty is the difficulty for sweat mode, I think + 1 can be a solution, this could be fixed.
                    backgroundType: mainJson.BackgroundType || 0, // BackgroundType is used in JD14-15, not used in JD16 and above.
                    LyricsType: mainJson.LyricsType || 0, // LyricsType is used for displaying lyrics as karaoke or normal. 0 is normal, 1 is karaoke
                    Tags: ["main"], // Tags are used for categorizing, including/excluding songs. The "main" tag is used as default.
                    Status: mainJson.Status || 3, // Status is for setting the current status of the song. It's for setting the song to be normal, locked or mojo unlock only.
                    LocaleID: mainJson.LocaleID || 4294967295, // LocaleId is used for setting customTypeName for local songs, which is basically Alternate or Extreme title. The reason why it checks the mainJson is because some songs such as OnMyMind got localeID in JDN JSON.
                    MojoValue: mainJson.MojoValue || 0, // MojoValue is not known, even if it is, I doubt it would work.
                    CountInProgression: 1 || mainJson.CountInProgression, // CountInProgression is unknown.
                    DefaultColors: BasicFunc.getRealDefaultColors(mainJson.DefaultColors,mainJson.lyricsColor), // DefaultColors is used for displaying menu colors. 1A and 1B are big colors while 2A and 2B are banner colors. A colors are usually lighter and B colors are darker.
                    Paths: {
                        Avatars: null,
                        AsyncPlayers:null
                    },
                    VideoPreviewPath: "" // VideoPreviewPath was used in Just Dance 2019 demo, not used and not required.
                }
            ]
        }
        BasicFunc.debugLog(
            `[JD_SongDescTemplate] Created song description successfully.`
        )
        writeToFolder(JD_SongDescTemplate, "songdesc")
        return true;
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
                            volume: 1
                        },
                        path: `world/${getSetting("dtape_mapsFolderType")}/${MapName.toLowerCase()}/audio/${MapName.toLowerCase()}.${getSetting("musictrack_audioFormat")}`,
                        url: `jmcs://jd-contents/${MapName}/${MapName}.ogg`
                    }
                }
            ]
        }
        BasicFunc.debugLog(
            `[MusicTrackComponent_Template] Created MusicTrack component successfully.`
        )
        writeToFolder(MusicTrackComponent_Template, "musictrack")
        return true;    
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
                TrackId: randomId(),
                IsActive: 1,
                StartTime: ubiArtTime(move.time, true),
                Duration: ubiArtTime(move.duration, true),
                ClassifierPath: `world/${getSetting("dtape_mapsFolderType")}/${MapName.toLowerCase()}/timeline/moves/${move.name}.msm`,
                GoldMove: move.goldMove ? 1 : 0,
                CoachId: move.moveId,
                MoveType: 0,
                Color: [0x1,0.5,0.5,0.500001],
                MotionPlatformSpecifics: {
                    X360: {
                        __class: "MotionPlatformSpecific",
                        ScoreScale: 1.4,
                        ScoreSmoothing: 0,
                        ScoringMode: 0
                    },
                    ORBIS: {
                        __class: "MotionPlatformSpecific",
                        ScoreScale: 1.3,
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
                TrackId: randomId(),
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
        // Sadly, we can't "guess" GoldEffectClip times so we take all GoldMove: 1
        // MoveClips and add 24 to their time for their GoldEffectClip.
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

        BasicFunc.debugLog(
            `[Tape] Created Dance Tape (DTAPE) successfully.`
        )
        writeToFolder(Tape, "dtape")
        return true;

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
                TrackId: randomId(),
                IsActive: 1,
                StartTime: ubiArtTime(lyric.time, true),
                Duration: ubiArtTime(lyric.duration, true),
                Pitch: 7.000001,
                Lyrics: lyric.text,
                IsEndOfLine: lyric.isLineEnding ? 1 : 0,
                ContentType: 0,
                StartTimeTolerance: 4,
                EndTimeTolerance: 4,
                SemitoneTolerance: 5
            }
            Tape.Clips.push(KaraokeClip)
        })

        BasicFunc.debugLog(
            `[Tape] Created Karaoke Tape (KTAPE) successfully.`
        )
        writeToFolder(Tape, "ktape")
        return true;
    }

    function msmsUtility() {

        // We check if downloading MSMs is enabled.
        if (getSetting("default_downloadMsms") && getSetting("default_downloadMsms") === true) {


            // Create the classifiers folder.
            let msmFolder = `${getSetting("default_outputFolder")}/${MapName}/classifiers`
            fs.mkdirSync(msmFolder, { recursive:true })


            // Loop through all MSM names and download them.
            Promise.all(Moves.map((move) => {
                let msmName = move.name

                if (!fs.existsSync(msmFolder + "/" + msmName + ".msm")) {
                    axios({
                        method: "GET",
                        responseType: "arraybuffer",
                        url: `https://jdnowweb-s.cdn.ubi.com/uat/release_tu2/20150928_1740/songs/${MapName}/data/classifiers/${msmName}.msm`
                    })
                    .then(response => {
                        fs.writeFileSync(msmFolder + "/" + msmName + ".msm", Buffer.from(response.data))
                    })
                    .catch(error => {})
                }
            }))
            .then(() => {
                BasicFunc.debugLog(
                    `[msmsUtility] Successfully downloaded all Movespace (MSM) classifiers.`
                )
            })


        }
    }

    function pictosUtility() {

        // We check if splitting pictos is enabled and the map has a picto-sprite first and then continue.
        if (getSetting("default_splitPictos") && getSetting("default_splitPictos") === true) {
            axios({
                method: "HEAD",
                url: `https://jdnowweb-s.cdn.ubi.com/uat/release_tu2/20150928_1740/songs/${MapName}/assets/web/pictos-sprite.png`
            })
            .then(response => {

                // Since NJS is a shit way to deal with images, we use Python and PIL library.
                // We call pictocutter.py made by pashtet with the MapName as an argument.
                const pictocutter = spawn('python', ["./scripts/pictocutter/pictocutter.py", MapName]);

                // If everything was successfull, do stuff.
                pictocutter.stdout.on("data", function(data) {

                    // Move the pictos folder from picto_output and delete the folders.

                    let source = `./scripts/pictocutter/picto_output/${MapName}/`,
                        dest = `${getSetting("default_outputFolder")}/${MapName}/pictos/`


                    /**
                     * PLEASE UPDATE THIS PART!
                     * This part is messy, please update it.
                     * tag:UPDATE
                     */
                    fs.mkdirSync(dest, { recursive:true }) // We create our destination if it does not exist.
                    fse.moveSync(source, dest, {overwrite:true}) // We move the picto_output folder to our output folder.

                    // We delete our output and input folders.
                    fs.rmdirSync(`./scripts/pictocutter/picto_input/`, {
                        recursive: true
                    }) 
                    fs.rmdirSync(`./scripts/pictocutter/picto_output/`, {
                        recursive: true
                    }) 

                    BasicFunc.debugLog(
                        `[pictosUtility] Pictos were cut successfully.`
                    )
                    return true;

                });

                // If the script threw an issue, console log it.
                pictocutter.stderr.on("data", (data) => {

                    BasicFunc.debugLog(
                        `[pictosUtility] An error occured with the picto cutter script.`,
                        "red"
                    )
                    console.log(`The error was \n${data.toString()}`)
                    process.exit(1)
                    

                });

            })
            .catch(error => {})
        }
    }
    Promise.all([
        songdescUtility(), 
        musicTrackUtility(), 
        dtapeUtility(),
        ktapeUtility(),
        msmsUtility(),
        pictosUtility()
    ])
    .then(() => {
        console.log("")
        BasicFunc.debugLog(
            `[DONE!] The files were successfully converted. Wait for pictos to cut if they are enabled. Please credit yunyl in your work!`
        )
    })
}
// --