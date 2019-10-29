// HTMLEditorGrid = function () {
function HTMLEditorGrid() {
    this.btnPlay = document.getElementById('play'),
        this.btnStop = document.getElementById('stop'),
        this.btnPrev = document.getElementById('prev'),
        this.btnNext = document.getElementById('next'),
        this.btnLast = document.getElementById('last'),
        this.btnFirst = document.getElementById('first'),
        this.btnAddPart = document.getElementById('add_part'),
        //#endregion
        this.txtKeyRangeStart = document.getElementById('key-range-start'),
        this.txtKeyRangeEnd = document.getElementById('key-range-end'),
        this.sliderScale = document.getElementById('scale-slider'),
        this.lblSliderScale = document.getElementById('scale-label'),
        this.divControls = document.getElementById('controls'),
        this.divBarsBeats = document.getElementById('time-bars-beats'),
        this.divSeconds = document.getElementById('time-seconds'),
        this.divMouseX = document.getElementById('mouse-x'),
        this.divMouseY = document.getElementById('mouse-y'),
        this.divPageNumbers = document.getElementById('page-numbers'),
        this.divEditor = document.getElementById('editor'),
        this.divScore = document.getElementById('score'),
        this.divBarLines = document.getElementById('bar-lines'),
        this.divBeatLines = document.getElementById('tick-lines'),
        this.divSixteenthLines = document.getElementById('sub-tick-lines'),
        this.divPitchLines = document.getElementById('pitch-lines'),
        this.divNotes = document.getElementById('notes'),
        this.divParts = document.getElementById('parts'),
        this.divPlayhead = document.getElementById('playhead'),
        this.selectSnap = document.getElementById('snap'),
        this.divsAllNotes = {}, // stores references to all divs that represent a midi note
        this.divsAllParts = {}, // stores references to all divs that represent a midi part
        this.allNotes = {}, // stores references to all midi notes
        this.allParts = {}; // stores references to all midi parts
}

window.onload = function () {
    'use strict';

    var testMethod = 1,
        // satisfy jslint
        sequencer = window.sequencer,
        console = window.console,
        alert = window.alert,
        requestAnimationFrame = window.requestAnimationFrame,
        //#region Button Elements
        btnPlay = document.getElementById('play'),
        btnStop = document.getElementById('stop'),
        btnPrev = document.getElementById('prev'),
        btnNext = document.getElementById('next'),
        btnLast = document.getElementById('last'),
        btnFirst = document.getElementById('first'),
        btnAddPart = document.getElementById('add_part'),
        //#endregion
        txtKeyRangeStart = document.getElementById('key-range-start'),
        txtKeyRangeEnd = document.getElementById('key-range-end'),
        sliderScale = document.getElementById('scale-slider'),
        lblSliderScale = document.getElementById('scale-label'),
        divControls = document.getElementById('controls'),
        divBarsBeats = document.getElementById('time-bars-beats'),
        divSeconds = document.getElementById('time-seconds'),
        divMouseX = document.getElementById('mouse-x'),
        divMouseY = document.getElementById('mouse-y'),
        divPageNumbers = document.getElementById('page-numbers'),
        divEditor = document.getElementById('editor'),
        divScore = document.getElementById('score'),
        divBarLines = document.getElementById('bar-lines'),
        divBeatLines = document.getElementById('tick-lines'),
        divSixteenthLines = document.getElementById('sub-tick-lines'),
        divPitchLines = document.getElementById('pitch-lines'),
        divNotes = document.getElementById('notes'),
        divParts = document.getElementById('parts'),
        divPlayhead = document.getElementById('playhead'),
        selectSnap = document.getElementById('snap'),
        divsAllNotes = {}, // stores references to all divs that represent a midi note
        divsAllParts = {}, // stores references to all divs that represent a midi part
        allNotes = {}, // stores references to all midi notes
        allParts = {}, // stores references to all midi parts

        htmlEditorGrid = HTMLEditorGrid(),
        gridHoriMargin = 24,
        gridVertMargin = 24,

        keyEditor,
        song,
        track,
        divMidiFileList,
        midiFileList,
        audCntxt,
        padShell;
    testEditorGrid();

    function enableGUI(flag) {
        var elements = document.querySelectorAll('input, select'),
            i,
            element,
            maxi = elements.length;

        for (i = 0; i < maxi; i++) {
            element = elements[i];
            element.disabled = !flag;
        }
    }

    function testEditorGrid() {
        htmlEditorGrid;
    }

    function render() {
        var snapshot = keyEditor.getSnapshot('key-editor'),
            divNote,
            divPart;

        divPlayhead.style.left = keyEditor.getPlayheadX() - 10 + 'px';
        divPageNumbers.innerHTML =
            'page ' + keyEditor.currentPage + ' of ' + keyEditor.numPages;

        divBarsBeats.innerHTML = song.barsAsString;
        divSeconds.innerHTML = song.timeAsString;

        snapshot.notes.removed.forEach(function (note) {
            divsAllNotes[note.id].removeEventListener('mousedown', lMouDown_Note);
            divNotes.removeChild(document.getElementById(note.id));
        });

        snapshot.notes.new.forEach(function (note) {
            drawNote(note);
        });

        snapshot.notes.recorded.forEach(function (note) {
            drawNote(note);
        });

        snapshot.notes.recording.forEach(function (note) {
            updateElement(divsAllNotes[note.id], note.bbox);
        });

        // events.changed, notes.changed, parts.changed contain elements that have been moved or transposed
        snapshot.notes.changed.forEach(function (note) {
            updateElement(divsAllNotes[note.id], note.bbox, 0);
        });

        // stateChanged arrays contain elements that have become active or inactive
        snapshot.notes.stateChanged.forEach(function (note) {
            divNote = document.getElementById(note.id);
            if (note.part.mute === false) {
                if (note.mute !== true) {
                    if (note.active) {
                        divNote.className = 'note note-active';
                    } else if (note.active === false) {
                        divNote.className = 'note';
                    }
                }
            }
        });

        snapshot.parts.removed.forEach(function (part) {
            divsAllParts[part.id].removeEventListener('mousedown', lMouDown_Part);
            divParts.removeChild(document.getElementById(part.id));
        });

        snapshot.parts.new.forEach(function (part) {
            drawPart(part);
        });

        // events.changed, notes.changed, parts.changed contain elements that have been moved or transposed
        snapshot.parts.changed.forEach(function (part) {
            updateElement(divsAllParts[part.id], part.bbox, 0);
        });

        // stateChanged arrays contain elements that have become active or inactive
        snapshot.parts.stateChanged.forEach(function (part) {
            divPart = document.getElementById(part.id);
            if (part.mute !== true) {
                if (part.active) {
                    divPart.className = 'part part-active';
                } else if (part.active === false) {
                    divPart.className = 'part';
                }
            }
        });

        if (snapshot.hasNewBars) {
            // set the new width of the score
            divScore.style.width = snapshot.newWidth + 'px';

            // clear the horizontal lines because the lines have to be drawn longer
            divPitchLines.innerHTML = '';

            // reset the index of the iterator because we're starting from 0 again
            keyEditor.horizontalLine.reset();
            while (keyEditor.horizontalLine.hasNext('chromatic')) {
                drawHorizontalLine(keyEditor.horizontalLine.next('chromatic'));
            }

            // the index of the vertical line iterator has already been set to the right index by the key editor
            // so only the extra barlines will be drawn
            while (keyEditor.verticalLine.hasNext('sixteenth')) {
                drawVerticalLine(keyEditor.verticalLine.next('sixteenth'));
            }
        }
        requestAnimationFrame(render);
    }

    function resize() {
        var c = divControls.getBoundingClientRect().height,
            w = window.innerWidth,
            h = window.innerHeight - c;

        // tell the key editor that the viewport has canged, necessary for auto scroll during playback
        keyEditor.setViewport(w, h);
        divEditor.style.width = w + 'px';
        divEditor.style.height = h + 'px';
    }

    //#region [rgba(60, 60, 90 ,0.3)] Draw Functions
    function draw() {
        //Initialize all Grid HTML elements to blank
        allNotes = {};
        allParts = {};
        divsAllNotes = {};
        divsAllParts = {};
        divParts.innerHTML = '';
        divNotes.innerHTML = '';
        divPitchLines.innerHTML = '';
        divBarLines.innerHTML = '';
        divBeatLines.innerHTML = '';
        divSixteenthLines.innerHTML = '';

        keyEditor.horizontalLine.reset();
        keyEditor.verticalLine.reset();
        keyEditor.noteIterator.reset();
        keyEditor.partIterator.reset();

        divScore.style.width = keyEditor.width + 'px';

        while (keyEditor.horizontalLine.hasNext('chromatic')) {
            drawHorizontalLine(keyEditor.horizontalLine.next('chromatic'));
        }

        while (keyEditor.verticalLine.hasNext('sixteenth')) {
            drawVerticalLine(keyEditor.verticalLine.next('sixteenth'));
        }

        while (keyEditor.noteIterator.hasNext()) {
            drawNote(keyEditor.noteIterator.next());
        }

        while (keyEditor.partIterator.hasNext()) {
            drawPart(keyEditor.partIterator.next());
        }
    }

    function drawHorizontalLine(data) {
        var divLine = document.createElement('div'),
            pitchHeight = keyEditor.pitchHeight;

        if (data.note.blackKey === true) {
            divLine.className = 'pitch-line black-key';
        } else {
            divLine.className = 'pitch-line';
        }
        divLine.id = data.note.fullName;
        divLine.style.height = pitchHeight + 'px';
        divLine.style.top = data.y + 'px';
        divLine.y = data.y;
        divPitchLines.appendChild(divLine);
    }

    function drawVerticalLine(data) {
        var type = data.type,
            divLine = document.createElement('div');

        divLine.id = data.position.barsAsString;
        divLine.className = data.type + '-line';
        divLine.style.left = data.x + 'px';
        divLine.style.width = '5px'; // if you make the width too small, the background image of sometimes disappears
        divLine.x = data.x;

        switch (type) {
            case 'bar':
                divBarLines.appendChild(divLine);
                break;
            case 'beat':
                divBeatLines.appendChild(divLine);
                break;
            case 'sixteenth':
                divSixteenthLines.appendChild(divLine);
                break;
        }
    }

    function drawNote(note) {
        var bbox = note.bbox,
            divNote = document.createElement('div');

        divNote.id = note.id;
        divNote.className = 'note';
        //divNote.style.backgroundColor = 'rgb(' + 0 + ',' + 127 + ',' + (note.velocity * 2) + ')';
        updateElement(divNote, bbox, 0);

        // store note and div
        allNotes[note.id] = note;
        divsAllNotes[note.id] = divNote;
        divNote.addEventListener('mousedown', lMouDown_Note, false);
        divNotes.appendChild(divNote);
    }

    function drawPart(part) {
        var bbox = part.bbox,
            divPart = document.createElement('div');

        divPart.id = part.id;
        divPart.className = 'part';
        divPart.style.left = bbox.left + 'px';
        divPart.style.top = bbox.top + 'px';
        divPart.style.width = bbox.width - 1 + 'px';
        divPart.style.height = bbox.height - 1 + 'px';

        // store part and div
        allParts[part.id] = part;
        divsAllParts[part.id] = divPart;
        divPart.addEventListener('mousedown', lMouDown_Part, false);
        divParts.appendChild(divPart);
    }
    //Fits element within its bounding box
    function updateElement(element, bbox) {
        
    }

    function updateElement(element, bbox) {
        element.style.left = bbox.x + 'px';
        element.style.top = bbox.y + 'px';
        element.style.width = bbox.width + 'px';
        element.style.height = bbox.height + 'px';
    }
    //#endregion



    //#region [rgba(0,100,0,0.2)] Part Event Functions
    function lMouDown_Part(e) {
        var part = allParts[e.target.id];
        if (e.ctrlKey) {
            keyEditor.removePart(part);
        } else {
            keyEditor.startMovePart(part, e.pageX, e.pageY);
            document.addEventListener('mouseup', lMouUp_Part, false);
        }
    }

    function lMouUp_Part() {
        keyEditor.stopMovePart();
        document.removeEventListener('mouseup', lMouUp_Part);
    }

    function addRandomPartAtPlayhead() {
        var i,
            startPositions = [0, 60, 90, 120, 180],
            ticks = 0, //startPositions[getRandom(0, 4, true)],
            numNotes = getRandom(4, 8, true),
            spread = 5,
            basePitch = getRandom(
                keyEditor.lowestNote + spread,
                keyEditor.highestNote - spread,
                true
            ),
            part = sequencer.createPart(),
            events = [],
            noteLength = song.ppq / 2,
            pitch,
            velocity;

        for (i = 0; i < numNotes; i++) {
            pitch = basePitch + getRandom(-spread, spread, true);
            velocity = getRandom(50, 127, true);
            events.push(
                sequencer.createMidiEvent(ticks, sequencer.NOTE_ON, pitch, velocity)
            );
            ticks += noteLength;
            events.push(
                sequencer.createMidiEvent(ticks, sequencer.NOTE_OFF, pitch, 0)
            );
            ticks += noteLength;
        }
        ticks = keyEditor.getTicksAt(keyEditor.getPlayheadX());
        // ticks = getRandom(0, song.durationTicks / 2, true);

        part.addEvents(events);
        if (!track) track = song.tracks[0];
        track.addPartAt(part, ['ticks', ticks]);
        song.update();
    }
    //#endregion

    //#region [rgba(0,0,100,0.2)] Note Event Functions
    function lMouDown_Note(e) {
        var note = allNotes[e.target.id];
        if (e.ctrlKey) {
            keyEditor.removeNote(note);
        } else {
            keyEditor.startMoveNote(note, e.pageX, e.pageY);
            document.addEventListener('mouseup', lMouUp_Note, false);
        }
    }

    function lMouUp_Note() {
        keyEditor.stopMoveNote();
        document.removeEventListener('mouseup', lMouUp_Note);
    }
    //#endregion

    function init() {
        var c = divControls.getBoundingClientRect().height,
            w = window.innerWidth - (gridHoriMargin * 2),
            h = window.innerHeight - (c * 2),
            events,
            event,
            part,
            timeEvents = [],
            /**
             * Uncomment one to test different tracks, will add listing function soon
             */
            midiFileName =
            'Blank Test';
        // 'Fantasie Impromptu';
        // 'Queen - Bohemian Rhapsody';
        // 'minute_waltz';
        // 'Thing';

        divEditor.style.width = w + 'px';
        divEditor.style.height = h + 'px';

        var midiFile = sequencer.getMidiFile(midiFileName);
        if (!midiFile) {
            midiFile = sequencer.getMidiFiles()[0];
        }
        // timeEvents.push(sequencer.createMidiEvent(0, sequencer.TIME_SIGNATURE, 6, 8));
        // timeEvents.push(sequencer.createMidiEvent(960 * 3, sequencer.TIME_SIGNATURE, 4, 4));
        switch (testMethod) {
            case 1:
                // method 1: create a song directly from the midi file, this way the midi file is treated as a config object
                midiFile.useMetronome = true;
                song = sequencer.createSong(midiFile);
                track = song.track;
                break;

            case 2:
                // method 2: copy over some parts of the midi to a config object
                song = sequencer.createSong({
                    bpm: 80, // original tempo is 125 bpm
                    nominator: midiFile.nominator,
                    denominator: midiFile.denominator,
                    timeEvents: midiFile.timeEvents,
                    tracks: midiFile.tracks,
                    useMetronome: true
                });
                track = song.track;
                break;
            case 3:
                //method 3: just add base midiFile to a song, and continue
                song = sequencer.createSong(midiFile, false);
        }
        // part = sequencer.createPart();
        // part.addEvents(events);
        /**
         *
         *
         *
         */

        song.tracks.forEach(
            /**
             * Compacts all song tracks onto single track, set to monitor, and set instrument to piano
             */
            function (track) {
                track.setInstrument('piano');
                track.monitor = true;
                track.setMidiInput('all');
            }
        );

        //#region Context Menu Events
        // song.addEventListener('play', setElementValue(btnPlay, 'pause'));
        song.addEventListener('play', function () {
            btnPlay.value = 'pause';
        });

        // song.addEventListener('pause', setElementValue(btnPlay, 'pause'));
        song.addEventListener('pause', function () {
            btnPlay.value = 'play';
        });

        // song.addEventListener('stop', setElementValue(btnPlay, 'play'));
        song.addEventListener('stop', function () {
            btnPlay.value = 'play';
        });
        //#endregion

        /**
         *
         * This is where KeyEditor is Made!!!
         */
        keyEditor = sequencer.createKeyEditor(song, {
            keyListener: true,
            viewportHeight: h,
            viewportWidth: w,
            lowestNote: 21,
            highestNote: 108,
            barsPerPage: 16
        });
        txtKeyRangeStart.value = keyEditor.lowestNote;
        txtKeyRangeEnd.value = keyEditor.highestNote;

        sliderScale.min = 1; // minimal 1 bar per page
        sliderScale.max = 64; // maximal 64 bars per page
        sliderScale.value = 16; // currently set to 16 bars per page
        sliderScale.step = 1;

        txtKeyRangeStart.addEventListener('change', function (e) {
            // keyEditor.setNoteRange(txtKeyRangeStart.value, keyEditor.highestNote);
            keyEditor.lowestNote = txtKeyRangeStart.value;
            draw();
        });
        txtKeyRangeEnd.addEventListener('change', function (e) {
            // keyEditor.setNoteRange(keyEditor.lowestNote, txtKeyRangeEnd.value);
            keyEditor.highestNote = txtKeyRangeEnd.value;
            draw();
        });
        // listen for scale and draw events, a scale event is fired when you change the number of bars per page
        // a draw event is fired when you change the size of the viewport by resizing the browser window
        keyEditor.addEventListener('scale draw', function () {
            draw();
        });

        // listen for scroll events, the score automatically follows the song positon during playback: as soon as
        // the playhead moves off the right side of the screen, a scroll event is fired
        keyEditor.addEventListener('scroll', function (data) {
            divEditor.scrollLeft = data.x;
        });

        // you can set the playhead at any position by clicking on the score
        divScore.addEventListener('mousedown', function (e) {
            var className = e.target.className;
            if (
                className.indexOf('part') !== -1 ||
                className.indexOf('note') !== -1
            ) {
                return;
            }
            keyEditor.setPlayheadToX(e.pageX);
            // you could also use:
            //song.setPlayhead('ticks', keyEditor.xToTicks(e.pageX));
        });

        divEditor.addEventListener('click', function (e) {
            if (!audCntxt) {
                audCntxt = new AudioContext();
                audCntxt.resume();
                if (window.AudioContext && window.AudioContext != audCntxt) {
                    window.AudioContext = audCntxt;
                    console.log('hitting the context startup');
                }
            }
        });
        // if you scroll the score by hand you must inform the key editor. necessary for calculating
        // the song position by x coordinate and the pitch by y coordinate
        divEditor.addEventListener(
            'scroll',
            function () {
                keyEditor.updateScroll(divEditor.scrollLeft, divEditor.scrollTop);
            },
            false
        );

        divScore.addEventListener(
            'mousemove',
            function (e) {
                e.preventDefault();
                var x = e.pageX,
                    y = e.pageY,
                    pos = keyEditor.getPositionAt(x),
                    part = keyEditor.selectedPart,
                    note = keyEditor.selectedNote;

                // show the song position and pitch of the current mouse position; handy for debugging
                divMouseX.innerHTML = 'x ' + pos.barsAsString;
                divMouseY.innerHTML = 'y ' + keyEditor.getPitchAt(y).number;

                // move part or note if selected
                if (part !== undefined) {
                    keyEditor.movePart(x, y);
                }
                if (note !== undefined) {
                    keyEditor.moveNote(x, y);
                }
            },
            false
        );

        selectSnap.addEventListener(
            'change',
            function () {
                keyEditor.setSnapX(selectSnap.options[selectSnap.selectedIndex].value);
            },
            false
        );

        //#region [rgba(100, 100, 50, 0.3)] Playback Button Event Listeners
        btnPlay.addEventListener('click', function () {
            song.pause();
        });

        btnStop.addEventListener('click', function () {
            song.stop();
        });

        btnNext.addEventListener('click', function () {
            keyEditor.scroll('>');
        });

        btnPrev.addEventListener('click', function () {
            keyEditor.scroll('<');
        });

        btnFirst.addEventListener('click', function () {
            keyEditor.scroll('<<');
        });

        btnLast.addEventListener('click', function () {
            keyEditor.scroll('>>');
        });
        //#endregion
        btnAddPart.addEventListener('click', function () {
            addRandomPartAtPlayhead();
        });

        sliderScale.addEventListener(
            'change',
            function (e) {
                var bpp = parseFloat(e.target.value);
                lblSliderScale.innerHTML = '#bars ' + bpp;
                keyEditor.setBarsPerPage(bpp);
            },
            false
        );
        /**
         * Check for working context, and if not, create one and resume it when user mouses over window
         */
        window.addEventListener('mouseover', function (e) {
            if (!window.AudioContext) {
                console.log('hitting the context startup');
            }
            if (!audCntxt) {
                audCntxt = new AudioContext();
                audCntxt.resume();
            }
        });
        window.addEventListener('resize', resize, false);

        enableGUI(true);

        selectSnap.selectedIndex = 3;
        event = document.createEvent('HTMLEvents');
        event.initEvent('change', false, false);
        selectSnap.dispatchEvent(event);

        draw();
        // addPart();
        render();
    }

    enableGUI(false);
    this.addAssetsToSequencer(sequencer);
    sequencer.addAssetPack({
            url: '../../../assets/examples/asset_pack_basic.json'
        },
        init
    );
    // divMidiFileList = doFileSelect();
    // // if (divMidiFileList) {
    //     divMidiFileList.addEventListener('mouseover', this.updateFileSelect(divMidiFileList));
    // }
};




function addAssetsToSequencer(seq) {
    seq.addMidiFile({
        url: '../../../assets/midi/minute_waltz.mid'
    });
    seq.addMidiFile({
        url: '../../../assets/midi/chpn_op66.mid'
    });
    seq.addMidiFile({
        url: '../../../assets/midi/Queen - Bohemian Rhapsody.mid'
    });
    seq.addMidiFile({
        url: '../../../assets/midi/test.mid'
    });
}
//#region [ rgba(255, 255, 255, 0.1) ] Random Functions
function getRandom(min, max, round) {
    var r = Math.random() * (max - min) + min;
    if (round === true) {
        return Math.round(r);
    } else {
        return r;
    }
}
//#endregion

// function doFileSelect() {
//     if (!midiFileList) {
//         midiFileList = document.createElement('select');
//         midiFileList.id = 'midi-select';
//     }
//     var files = sequencer.getMidiFiles();
//     files.forEach(e => {
//         var option = document.createElement('option');
//         option.value = e.name;
//         option.innerHTML = e.name;
//         midiFileList.append(option);
//     });
//     var divList = document.getElementById('midi-file-select');
//     divList.append(midiFileList);
//     return divList;
//     // }
//     // return null;
// }
// function updateFileSelect(divList) {
//     var files = sequencer.getMidiFiles();
//     files.forEach(e => {
//         var option = document.createElement('option');
//         option.value = e.name;
//         option.innerHTML = e.name;
//         midiFileList.append(option);
//     });
// }