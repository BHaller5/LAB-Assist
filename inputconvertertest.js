var MovementNotationType = {
    Numeric: 1,
    Directional: 2,
    TruncatedDirectional: 3,
    Motional: 4,
    TruncatedMotional: 5
};
var ButtonNotationType = {
    Numeric: 1,
    StreetFighter: 2,
    SNK: 3,
    Netherrealm: 4,
    Tekken: 5,
    SoulCalibur: 6
};

var btnNoteTypeIn = ButtonNotationType.Numeric;
var btnNoteTypeOut = ButtonNotationType.Numeric;
var mvmtNoteTypeIn = MovementNotationType.Numeric;
var mvmtNoteTypeOut = MovementNotationType.Directional;

outStr = "";
inStr = "";
splitChar = ' ';

testInputs = ["236HP", "F D DF + MP", "lp, lp, Forward, lk, hp"];

var convInpStr = document.getElementById("convInpStr");
convInpStr.addEventListener("change", changeInput);
$(document).ready($("#convBtn").click(convertInput));
$(document).ready(initConverter);
var mvmtInElmt = document.getElementById("mvmtIn");
var mvmtOutElmt = document.getElementById("mvmtOut");
var btnInElmt = document.getElementById("btnIn");
var btnOutElmt = document.getElementById("btnOut");
mvmtInElmt.addEventListener("change", function () { ChangeEnum(mvmtInElmt, mvmtInElmt.value, mvmtNoteTypeIn); });
mvmtOutElmt.addEventListener("change", function () { ChangeEnum(mvmtOutElmt, mvmtOutElmt.value, mvmtNoteTypeOut); });
btnInElmt.addEventListener("change", function () { ChangeEnum(btnInElmt, btnInElmt.value, btnNoteTypeIn); });
btnOutElmt.addEventListener("change", function () { ChangeEnum(btnOutElmt, btnOutElmt.value, btnNoteTypeOut); });


function initConverter() {
    changeInput();
    mvmtInElmt.value = mvmtNoteTypeIn;
    mvmtOutElmt.value = mvmtNoteTypeOut;
    btnInElmt.value = btnNoteTypeIn;
    btnOutElmt.value = btnNoteTypeOut;
}
function changeInput() {
    var inStrArea = document.getElementById("convInpStr");
    inStr = inStrArea.value;
    console.log("changing");
}
function convertInput() {
    tempInStr = inStr;
    strTokes = tempInStr.split(splitChar);
    console.log("Token Cnt: " + strTokes.length + " | " + strTokes.toString());
    if (mvmtNoteTypeIn != mvmtNoteTypeOut) {
        ProcessInputs(strTokes);
    }
    else
        console.log("same notation type selected for input and output, please select 2 different notations");
    outStr = inStr;
    displayOutput();
}
function displayOutput() {
    console.log("converting : " + inStr + " ==> " + outStr);
    var outStrh3 = document.getElementById("outStrh3");
    if (outStrh3 != null)
        outStrh3.textContent = outStr;
}

function ProcessInputs(strArr) {
    str = "";
    for (var i in strArr) {
        ProcessToken(strArr[i]);
        str.concat(strArr[i]);
    }
    console.log(str);
}
function ProcessToken(tok) {
    var tok1;
    var tok2;
    console.log("   Proccing Token: " + tok);

    switch (mvmtNoteTypeIn) {
        case MovementNotationType.Numeric:
            tok1 = tok.split(/[A-Za-z]/)[0];
            // tok2 = tok.split(/[A-Za-z]/);
            break;
        case MovementNotationType.Directional:
            break;
        case MovementNotationType.TruncatedDirectional:
            break;
    }
    switch (btnNoteTypeIn) {
        case ButtonNotationType.Numeric:
            tok1 = tok.split(/[A-Za-z]/)[0];
            break;
        case ButtonNotationType.StreetFighter:
            break;
        case ButtonNotationType.SNK:
            break;
        case ButtonNotationType.Netherrealm:
            break;
        case ButtonNotationType.Tekken:
            break;
        case ButtonNotationType.SoulCalibur:
            break;
    }
    for (var t in tok) {
        ProcessCharacter(tok[t]);
    }
}
function ProcessMovementCharacter(ch) {

}
function ProcessButtonCharacter(ch) {

}
function ProcessCharacter(ch) {
    console.log("       Proccing Character: " + ch);
}


function ChangeEnum(e, v, m_v) {
    m_v.value = v;
    e.value = v;
    // console.log("Changed enum " + e.toString() + " to " + v.toString());
    console.log("Changed enum " + e.toString() + " to " + e.value.toString() + "||" + m_v);
}