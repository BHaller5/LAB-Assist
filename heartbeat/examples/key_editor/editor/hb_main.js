// satisfy jslint
// window.onload = e_OnLoad();
// function e_OnLoad() {
window.onload = function () {

    'use strict';
    edtrHTML = EditorHTML();

    enableGUI(false);
    addAssetsToSequencer(sequencer);
    sequencer.addAssetPack({
        url: '../../../assets/examples/asset_pack_basic.json'
    },
        init
    );
    // e_OnLoad();
};
function e_OnLoad() {
    'use strict';
    edtrHTML = EditorHTML();

    enableGUI(false);
    addAssetsToSequencer(sequencer);
    sequencer.addAssetPack({
        url: '../../../assets/examples/asset_pack_basic.json'
    },
        init
    );
}


function EditorHTML() {
    btn_Play = document.getElementById('play'),
        btn_Stop = document.getElementById('stop'),
        btn_Prev = document.getElementById('prev'),
        btn_Next = document.getElementById('next'),
        btn_Last = document.getElementById('last'),
        btn_First = document.getElementById('first'),
        btn_AddPart = document.getElementById('add-part'),
        txt_KeyRangeStart = document.getElementById('key-range-start'),
        txt_KeyRangeEnd = document.getElementById('key-range-end'),

        sldr_barsPerPage = document.getElementById('scale-slider'),
        lbl_sldr_barsPerPage = document.getElementById('scale-label'),

        div_Controls = document.getElementById('controls'),
        div_BarsBeats = document.getElementById('time-bars-beats'),
        div_Seconds = document.getElementById('time-seconds'),
        div_MouseX = document.getElementById('mouse-x'),
        div_MouseY = document.getElementById('mouse-y'),
        div_PageNumbers = document.getElementById('page-numbers'),
        div_Editor = document.getElementById('editor'),
        div_Score = document.getElementById('score'),
        div_BarLines = document.getElementById('bar-lines'),
        div_BeatLines = document.getElementById('tick-lines'),
        div_SixteenthLines = document.getElementById('sub-tick-lines'),
        div_PitchLines = document.getElementById('pitch-lines'),
        div_Notes = document.getElementById('notes'),
        div_Parts = document.getElementById('parts'),
        div_Playhead = document.getElementById('playhead'),
        selectSnap = document.getElementById('snap'),
        divs_AllNotes = {}, // stores references to all divs that represent a midi note
        divs_AllParts = {}, // stores references to all divs that represent a midi part
        allNotes = {}, // stores references to all midi notes
        allParts = {}, // stores references to all midi parts
        gridHoriMargin = 24,
        gridVertMargin = 24;
}
var
    btn_Stop,
    btn_Prev,
    btn_Next,
    btn_Last,
    btn_First,
    btn_AddPart,
    txt_KeyRangeStart,
    txt_KeyRangeEnd,

    sldr_barsPerPage,
    lbl_sldr_barsPerPage,

    div_Controls,
    div_BarsBeats,
    div_Seconds,

    div_MouseX,
    mouseX,
    mouseBarPos,

    div_MouseY,
    mouseY,
    mousePitchPos,

    div_PageNumbers,
    div_Editor,
    div_Score,
    div_BarLines,
    div_BeatLines,
    div_SixteenthLines,
    div_PitchLines,
    div_Notes,
    div_Parts,
    div_Playhead,
    divs_AllNotes,
    divs_AllParts,
    selectSnap,
    allNotes,
    allParts,
    gridHoriMargin,
    gridVertMargin;

var currNote,
    currPart,
    flattenTracksToSingleTrack = true;

var testMethod = 1,
    edtrHTML,
    midiFile,
    keyEditor,
    song,
    track,
    instruments,
    div_MidiFileList,
    midiFileList,
    audCntxt,
    padShell;
var
    sequencer = window.sequencer,
    console = window.console,
    alert = window.alert,
    requestAnimationFrame = window.requestAnimationFrame;


function init() {
    var c = div_Controls.getBoundingClientRect().height,
        w = window.innerWidth - (gridHoriMargin * 2),
        h = window.innerHeight - (c * 2),
        events,
        event,
        timeEvents = [],
        /**
         * Uncomment one to test different tracks, will add listing function soon
         */
        midiFileName =
            // 'Blank Test';
            // 'Fantasie Impromptu';
            // 'Queen - Bohemian Rhapsody';
            // 'minute_waltz';
            'Thing';
    // 'Fail';

    div_Editor.style.width = w + 'px';
    div_Editor.style.height = h + 'px';

    // midiFile = sequencer.getMidiFile(midiFileName);
    // song = initSong(song, midiFile, track);
    var midiFile = sequencer.getMidiFile(midiFileName);
    if (!midiFile) {
        console.error("MIDI file name string invalid, defaulting to blank score...");
        midiFile = sequencer.getMidiFiles()[0];
    }
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
    instruments = sequencer.getInstruments();
    //|------------------------------------------------------------------------------------------|

    /**
    * Compacts all song tracks onto single track, set to monitor, and set instrument to piano
    */
    if (flattenTracksToSingleTrack)
        flattenTracks(song);

    //#region Context Menu Events
    initContextEvents();
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
    //set editor element values to editor defaults
    setElementValue(txt_KeyRangeStart, keyEditor.lowestNote);
    setElementValue(txt_KeyRangeEnd, keyEditor.highestNote);
    setSliderValues(sldr_barsPerPage, keyEditor.barsPerPage, 1, 32, 1);

    initInputEvents();

    /**
     * Check for working Audio Context, and if not, create one and resume it when user mouses over window
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
    render();
}
function initContextEvents() {
    song.addEventListener('play', function () { setElementValue(btn_Play, 'pause'); });
    song.addEventListener('pause', function () { setElementValue(btn_Play, 'play'); });
    song.addEventListener('stop', function () { setElementValue(btn_Play, 'play'); });
}
function initInputEvents() {
    /**
     * Text
     */
    txt_KeyRangeStart.addEventListener('change', function (e) {
        keyEditor.setNoteRange(txt_KeyRangeStart.value, keyEditor.highestNote);
        // keyEditor.lowestNote = txt_KeyRangeStart.value;
        song.update();
        draw();
    });
    txt_KeyRangeEnd.addEventListener('change', function (e) {
        keyEditor.setNoteRange(keyEditor.lowestNote, txt_KeyRangeEnd.value);
        // keyEditor.highestNote = txt_KeyRangeEnd.value;
        song.update();
        draw();
    });
    // listen for scale and draw events, a scale event is fired when you change the number of bars per page
    // a draw event is fired when you change the size of the viewport by resizing the browser window
    keyEditor.addEventListener('scale draw', function () { draw(); });

    // listen for scroll events, the score automatically follows the song positon during playback: as soon as
    // the playhead moves off the right side of the screen, a scroll event is fired
    keyEditor.addEventListener('scroll', function (data) { div_Editor.scrollLeft = data.x; });
    /**
     * EXPERIMENTAL - Add note when double clicked
     */
    div_Score.addEventListener('dblclick', function (e) {
        var className = e.target.className;
        /**
         * if double clicking a note
         * */
        if (className.indexOf('note') !== -1) {
            currNote = allNotes[e.target.id];
            currPart = currNote.part;
            return;
        }
        /** 
         * if double clicking a blank section of a part
         * */
        else if (className.indexOf('part') !== -1) {
            currPart = allParts[e.target.id];
            currPart.addEvents(addNewNoteAtMouse());
            song.update();
            // draw();
            return;
        }
        /**
        * if double clicking grid but current part is selected
        * */
        // else if (currPart) {
        //     currPart.addEvents(addNewNoteAtMouse());
        //     song.update();
        //     // draw();
        //     return;
        // }
        /**
        *if double clicking empty grid space
        * */
        else {
            // currPart = sequencer.createPart();
            // var events = createNewNoteAtMouse();
            // currPart.addEvents(events);
            // song.tracks[0].addPartAt(currPart, ['ticks', keyEditor.getTicksAt(mouseX)]);
            // song.update();
            currNote = null;
            currPart = null;
            // addRandomPartAtPlayhead();
            addRandomPartAtMouse();
            return;
        }
    });
    // you can set the playhead at any position by clicking on the score
    /**
     * OR - if element clicked on is a part or note, it sets the current note / part to that element
     */
    div_Score.addEventListener('mousedown', function (e) {
        var className = e.target.className;
        if (className.indexOf('note') !== -1) {
            currNote = allNotes[e.target.id];
            currPart = currNote.part;
            return;
        }
        else if (className.indexOf('part') !== -1) {
            currPart = allParts[e.target.id];
            return;
        }
        else {
            keyEditor.setPlayheadToX(e.pageX);
        }
        // you could also use:
        //song.setPlayhead('ticks', keyEditor.xToTicks(e.pageX));
    });
    /**
     * AUDIO CONTEXT CHECKER EVENT
     */
    div_Editor.addEventListener('click', function (e) {
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
    div_Editor.addEventListener('scroll', function () { keyEditor.updateScroll(div_Editor.scrollLeft, div_Editor.scrollTop); }, false);
    /**
     * Score Mouse Movement Tracker
     */
    div_Score.addEventListener(
        'mousemove',
        function (e) {
            e.preventDefault();
            var x = e.pageX,
                y = e.pageY,
                pos = keyEditor.getPositionAt(x),
                part = keyEditor.selectedPart,
                note = keyEditor.selectedNote;

            // show the song position and pitch of the current mouse position; handy for debugging
            mouseX = x;
            mouseY = y;
            mouseBarPos = pos.barsAsString;
            div_MouseX.innerHTML = 'x ' + mouseBarPos;
            mousePitchPos = keyEditor.getPitchAt(y).number;
            div_MouseY.innerHTML = 'y ' + mousePitchPos;

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
    /**
     * Grid
     */
    selectSnap.addEventListener('change', function () { keyEditor.setSnapX(selectSnap.options[selectSnap.selectedIndex].value); }, false);
    /**
     * Buttons
     */
    btn_Play.addEventListener('click', function () { song.pause(); });
    btn_Stop.addEventListener('click', function () { song.stop(); });
    btn_Next.addEventListener('click', function () { keyEditor.scroll('>'); });
    btn_Prev.addEventListener('click', function () { keyEditor.scroll('<'); });
    btn_First.addEventListener('click', function () { keyEditor.scroll('<<'); });
    btn_Last.addEventListener('click', function () { keyEditor.scroll('>>'); });

    btn_AddPart.addEventListener('click', function () { addRandomPartAtPlayhead(); });
    /**
     * Sliders
     */
    sldr_barsPerPage.addEventListener(
        'change',
        function (e) {
            var bpp = parseFloat(e.target.value);
            lbl_sldr_barsPerPage.innerHTML = '#bars ' + bpp;
            keyEditor.setBarsPerPage(bpp);
        },
        false
    );
    /**
     * Keyboard Shortcuts
     */
    window.addEventListener("keydown", function (e) {
        if (e.keyCode == 32) {
            song.pause();
        }
    });
}
function setElementValue(elmt, val) {
    elmt.value = val;
}
function setSliderValues(elmt, val, min, max, step) {
    elmt.min = min;
    elmt.max = max;
    elmt.step = step;
    elmt.value = val;
}

//#region [rgba(60, 60, 120 ,0.15)] Draw Functions
function draw() {
    //Initialize all Grid HTML elements to blank
    allNotes = {};
    allParts = {};
    divs_AllNotes = {};
    divs_AllParts = {};
    div_Parts.innerHTML = '';
    div_Notes.innerHTML = '';
    div_PitchLines.innerHTML = '';
    div_BarLines.innerHTML = '';
    div_BeatLines.innerHTML = '';
    div_SixteenthLines.innerHTML = '';

    keyEditor.horizontalLine.reset();
    keyEditor.verticalLine.reset();
    keyEditor.noteIterator.reset();
    keyEditor.partIterator.reset();

    div_Score.style.width = keyEditor.width + 'px';

    while (keyEditor.horizontalLine.hasNext('chromatic')) { drawHorizontalLine(keyEditor.horizontalLine.next('chromatic')); }
    while (keyEditor.verticalLine.hasNext('sixteenth')) { drawVerticalLine(keyEditor.verticalLine.next('sixteenth')); }
    while (keyEditor.noteIterator.hasNext()) { drawNote(keyEditor.noteIterator.next()); }
    while (keyEditor.partIterator.hasNext()) { drawPart(keyEditor.partIterator.next()); }
}

function drawHorizontalLine(data) {
    var tmp_div_HLine = document.createElement('div'),
        pitchHeight = keyEditor.pitchHeight;

    if (data.note.blackKey === true) {
        tmp_div_HLine.className = 'pitch-line black-key';
    } else {
        tmp_div_HLine.className = 'pitch-line';
    }
    tmp_div_HLine.id = data.note.fullName;
    tmp_div_HLine.style.height = pitchHeight + 'px';
    tmp_div_HLine.style.top = data.y + 'px';
    tmp_div_HLine.y = data.y;
    div_PitchLines.appendChild(tmp_div_HLine);
}

function drawVerticalLine(data) {
    var type = data.type,
        tmp_div_VLine = document.createElement('div');

    tmp_div_VLine.id = data.position.barsAsString;
    tmp_div_VLine.className = data.type + '-line';
    tmp_div_VLine.style.left = data.x + 'px';
    tmp_div_VLine.style.width = '5px'; // if you make the width too small, the background image of sometimes disappears
    tmp_div_VLine.x = data.x;

    switch (type) {
        case 'bar': div_BarLines.appendChild(tmp_div_VLine); break;
        case 'beat': div_BeatLines.appendChild(tmp_div_VLine); break;
        case 'sixteenth': div_SixteenthLines.appendChild(tmp_div_VLine); break;
    }
}
function render() {
    var snapshot = keyEditor.getSnapshot('key-editor'),
        tmp_div_Note,
        tmp_div_Part;

    div_Playhead.style.left = keyEditor.getPlayheadX() - 10 + 'px';
    div_PageNumbers.innerHTML =
        'page ' + keyEditor.currentPage + ' of ' + keyEditor.numPages;

    div_BarsBeats.innerHTML = song.barsAsString;
    div_Seconds.innerHTML = song.timeAsString;

    snapshot.notes.removed.forEach(function (note) {
        divs_AllNotes[note.id].removeEventListener('mousedown', e_Note_lMouDown);
        div_Notes.removeChild(document.getElementById(note.id));
    });

    snapshot.notes.new.forEach(function (note) { drawNote(note); });
    snapshot.notes.recorded.forEach(function (note) { drawNote(note); });
    snapshot.notes.recording.forEach(function (note) { updateElement(divs_AllNotes[note.id], note.bbox); });
    // events.changed, notes.changed, parts.changed contain elements that have been moved or transposed
    snapshot.notes.changed.forEach(function (note) { updateElement(divs_AllNotes[note.id], note.bbox, 0); });

    // stateChanged arrays contain elements that have become active or inactive
    snapshot.notes.stateChanged.forEach(function (note) {
        tmp_div_Note = document.getElementById(note.id);
        if (note.part.mute === false) {
            if (note.mute !== true) {
                if (note.active) {
                    tmp_div_Note.className = 'note note-active';
                } else if (note.active === false) {
                    tmp_div_Note.className = 'note';
                }
            }
        }
    });

    snapshot.parts.removed.forEach(function (part) {
        divs_AllParts[part.id].removeEventListener('mousedown', e_Part_lMouDown);
        div_Parts.removeChild(document.getElementById(part.id));
    });

    snapshot.parts.new.forEach(function (part) {
        drawPart(part);
    });

    // events.changed, notes.changed, parts.changed contain elements that have been moved or transposed
    snapshot.parts.changed.forEach(function (part) {
        updateElement(divs_AllParts[part.id], part.bbox, 0);
    });

    // stateChanged arrays contain elements that have become active or inactive
    snapshot.parts.stateChanged.forEach(function (part) {
        tmp_div_Part = document.getElementById(part.id);
        if (part.mute !== true) {
            if (part.active) {
                tmp_div_Part.className = 'part part-active';
            } else if (part.active === false) {
                tmp_div_Part.className = 'part';
            }
        }
    });

    if (snapshot.hasNewBars) {
        // set the new width of the score
        div_Score.style.width = snapshot.newWidth + 'px';

        // clear the horizontal lines because the lines have to be drawn longer
        div_PitchLines.innerHTML = '';

        // reset the index of the iterator because we're starting from 0 again
        keyEditor.horizontalLine.reset();
        while (keyEditor.horizontalLine.hasNext('chromatic')) { drawHorizontalLine(keyEditor.horizontalLine.next('chromatic')); }

        // the index of the vertical line iterator has already been set to the right index by the key editor
        // so only the extra barlines will be drawn
        while (keyEditor.verticalLine.hasNext('sixteenth')) { drawVerticalLine(keyEditor.verticalLine.next('sixteenth')); }
    }
    requestAnimationFrame(render);
}

function drawNote(note) {
    var bbox = note.bbox,
        div_Note = document.createElement('div');

    div_Note.id = note.id;
    div_Note.className = 'note';
    updateElement(div_Note, bbox, 0);

    // store note and div
    allNotes[note.id] = note;
    divs_AllNotes[note.id] = div_Note;
    div_Note.addEventListener('mousedown', e_Note_lMouDown, false);
    div_Notes.appendChild(div_Note);
}

function drawPart(part) {
    var bbox = part.bbox,
        div_Part = document.createElement('div');

    div_Part.id = part.id;
    div_Part.className = 'part';
    div_Part.style.left = bbox.left + 'px';
    div_Part.style.top = bbox.top + 'px';
    div_Part.style.width = bbox.width - 1 + 'px';
    div_Part.style.height = bbox.height - 1 + 'px';

    // store part and div
    allParts[part.id] = part;
    divs_AllParts[part.id] = div_Part;
    div_Part.addEventListener('mousedown', e_Part_lMouDown, false);
    div_Parts.appendChild(div_Part);
}
//Fits element within its bounding box
function updateElement(element, bbox) {
    element.style.left = bbox.x + 'px';
    element.style.top = bbox.y + 'px';
    element.style.width = bbox.width + 'px';
    element.style.height = bbox.height + 'px';
}
function resize() {
    var c = div_Controls.getBoundingClientRect().height,
        w = window.innerWidth,
        h = window.innerHeight - c;

    // tell the key editor that the viewport has canged, necessary for auto scroll during playback
    keyEditor.setViewport(w, h);
    div_Editor.style.width = w + 'px';
    div_Editor.style.height = h + 'px';
}
//#endregion
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


//#region [rgba(0,100,0,0.2)] Grid Element Event Functions
function e_Part_lMouDown(e) {
    var part = allParts[e.target.id];
    if (e.ctrlKey) {
        keyEditor.removePart(part);
    } else {
        keyEditor.startMovePart(part, e.pageX, e.pageY);
        document.addEventListener('mouseup', e_Part_lMouUp, false);
    }
}

function e_Part_lMouUp() {
    keyEditor.stopMovePart();
    document.removeEventListener('mouseup', e_Part_lMouUp);
}

function e_Note_lMouDown(e) {
    var note = allNotes[e.target.id];
    if (e.ctrlKey) {
        keyEditor.removeNote(note);
    } else {
        keyEditor.startMoveNote(note, e.pageX, e.pageY);
        document.addEventListener('mouseup', e_Note_lMouUp, false);
    }
}

function e_Note_lMouUp() {
    keyEditor.stopMoveNote();
    document.removeEventListener('mouseup', e_Note_lMouUp);
}
function e_Grid_lMouDown() {
}
function e_Grid_lMouUp() {

}
//#endregion

//#region [ rgba(200, 200, 200, 0.1) ] Random Generation Functions
function getRandom(min, max, round) {
    var r = Math.random() * (max - min) + min;
    if (round === true) {
        return Math.round(r);
    } else {
        return r;
    }
}
function addRandomPartAtPlayhead() {
    var i,
        startPositions = [0, 60, 90, 120, 180],
        tmp_ticks = 0, //startPositions[getRandom(0, 4, true)],
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

        events.push(sequencer.createMidiEvent(tmp_ticks, sequencer.NOTE_ON, pitch, velocity));
        tmp_ticks += noteLength;
        events.push(sequencer.createMidiEvent(tmp_ticks, sequencer.NOTE_OFF, pitch, 0));
        tmp_ticks += noteLength;
    }
    tmp_ticks = keyEditor.getTicksAt(keyEditor.getPlayheadX());

    part.addEvents(events);
    if (!track) track = song.tracks[0];
    track.addPartAt(part, ['ticks', tmp_ticks]);
    song.update();
}
//#endregion
function addRandomPartAtMouse() {
    keyEditor.setPlayheadToX(mouseX);
    var i,
        tmp_ticks = 0, //startPositions[getRandom(0, 4, true)],
        numNotes = 3,
        spread = 1,
        basePitch = keyEditor.getPitchAt(mouseY).number,
        part = sequencer.createPart(),
        events = [],
        noteLength = song.ppq / 2,
        pitch,
        velocity;

    for (i = 0; i < numNotes; i++) {
        pitch = basePitch + getRandom(-spread, spread, true);
        // pitch = keyEditor.getPitchAt(mouseY);
        velocity = getRandom(50, 127, true);

        events.push(sequencer.createMidiEvent(tmp_ticks, sequencer.NOTE_ON, pitch, velocity));
        tmp_ticks += noteLength;
        events.push(sequencer.createMidiEvent(tmp_ticks, sequencer.NOTE_OFF, pitch, 0));
        tmp_ticks += noteLength;
    }
    // ticks = keyEditor.getTicksAt(keyEditor.getPlayheadX());
    tmp_ticks = keyEditor.getTicksAt(keyEditor.getPlayheadX());
    // ticks = keyEditor.getTicksAt(mouseX);

    part.addEvents(events);
    if (!track) track = song.tracks[0];
    track.addPartAt(part, ['ticks', tmp_ticks]);
    song.update();
}



/**
 * EXPERIMENTAL
 */
function createNewNoteAtMouse() {
    var pitch = keyEditor.getPitchAt(mouseY),
        velocity = 127,
        events = [],
        noteLength = song.ppq / 2;
    // ticks = keyEditor.getTicksAt(mouseX);
    var tmp_ticks = 0,
        tmp_noteOn,
        tmp_noteOff,
        tmp_note;
    tmp_note = sequencer.createNote(pitch.number);
    tmp_noteOn = sequencer.createMidiEvent(tmp_ticks, sequencer.NOTE_ON, pitch, velocity);
    tmp_ticks += noteLength;
    tmp_noteOff = sequencer.createMidiEvent(tmp_ticks, sequencer.NOTE_OFF, pitch, 0);
    events.push(tmp_noteOn, tmp_noteOff);
    tmp_ticks = keyEditor.getTicksAt(mouseX);
    console.log('added new note: \n ' +
        'id: ' + pitch.number + '\n' +
        'pitch: ' + pitch.number + '\n' +
        'at ticks: ' + tmp_ticks + '\n' +
        'velocity: ' + velocity + '\n' +
        'length: ' + noteLength + '\n'
    );

    return events;
}
function addNewNoteAtMouse() {
    var pitch = keyEditor.getPitchAt(mouseY),
        velocity = 127,
        events = [],
        noteLength = song.ppq / 2;
    ticks = keyEditor.getTicksAt(mouseX);

    events.push(
        sequencer.createMidiEvent(ticks, sequencer.NOTE_ON, pitch, velocity)
    );
    ticks += noteLength;
    events.push(
        sequencer.createMidiEvent(ticks, sequencer.NOTE_OFF, pitch, 0)
    );
    ticks = keyEditor.getTicksAt(mouseX);
    console.log('added new note: \n ' +
        'pitch: ' + pitch.number + '\n' +
        'at ticks: ' + ticks + '\n' +
        'velocity: ' + velocity + '\n' +
        'length: ' + noteLength + '\n'
    );

    return events;
}
function flattenTracks(song) {
    song.tracks.forEach(
        function (track) {
            track.setInstrument('piano');
            track.monitor = true;
            track.setMidiInput('all');
        }
    );
}