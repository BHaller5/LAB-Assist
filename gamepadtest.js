var haveEvents = 'GamepadEvent' in window
var haveWebkitEvents = 'WebKitGamepadEvent' in window
var controllers = {}
var rAF = window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.requestAnimationFrame

var btnsArr = []

function connecthandler(e) {
  addgamepad(e.gamepad)
}
function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad
  var div = document.createElement("div")
  div.setAttribute("id", "controller" + gamepad.index)

  //Create controller id title
  var title = document.createElement("h1")
  title.appendChild(document.createTextNode("gamepad: " + gamepad.id))
  div.appendChild(title)

  //Create Button Icons
  var btns = document.createElement("div"); btns.className = "buttons"
  for (var i = 0; i < gamepad.buttons.length; i++) { btns.appendChild(createButtonIcon(i)) }
  //Append Buttons to div
  div.appendChild(btns)
  btnsArr.push(btns)

  // Create Axis Meters
  var axes = document.createElement("div"); axes.className = "axes";
  for (i = 0; i < gamepad.axes.length; i++) { axes.appendChild(createAxisMeter(i)) }

  //Append Meters to div
  div.appendChild(axes)

  //Hide start message
  document.getElementById("start").style.display = "none"
  document.body.appendChild(div)
  rAF(updateStatus)
}

function disconnecthandler(e) {
  removegamepad(e.gamepad)
}

function removegamepad(gamepad) {
  var d = document.getElementById("controller" + gamepad.index)
  document.body.removeChild(d)
  delete controllers[gamepad.index]
}

function updateStatus() {
  scangamepads()
  /**
   * Controller Status Loop */
  for (j in controllers) {
    var controller = controllers[j]
    var d = document.getElementById("controller" + j)
    /**
     * Button Status Loop */
    var buttons = d.getElementsByClassName("button")
    for (var i = 0; i < controller.buttons.length; i++) {
      var b = buttons[i]
      var val = controller.buttons[i]
      var pressed = val == 1.0
      if (typeof (val) == "object") {
        pressed = val.pressed
        val = val.value
      }
      var pct = Math.round(val * 100) + "%"
      b.style.backgroundSize = pct + " " + pct
      if (pressed) {
        b.className = "button pressed"
      } else {
        b.className = "button"
      }
    }
    /**
     * Axis Status Loop */
    var axes = d.getElementsByClassName("axis")
    for (var i = 0; i < controller.axes.length; i++) {
      var a = axes[i]
      a.innerHTML = i + ": " + controller.axes[i].toFixed(4)
      a.setAttribute("value", controller.axes[i])
    }
  }
  rAF(updateStatus)
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [])
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (!(gamepads[i].index in controllers)) {
        addgamepad(gamepads[i])
      } else {
        controllers[gamepads[i].index] = gamepads[i]
      }
    }
  }
}
function createButtonIcon(ind, lbl) {
  var e = document.createElement("span")
  e.className = "button"
  //e.id = "b" + i
  e.innerHTML = nameButton(ind)
  // e.innerHTML = i
  return e
}
function createAxisMeter(ind) {
  var l = document.createElement("h3")
  l.textContent = nameAxis(ind)
  var e = document.createElement("meter")
  e.className = "axis"
  //e.id = "a" + i
  e.setAttribute("min", "-1")
  e.setAttribute("max", "1")
  e.setAttribute("value", "0")
  e.innerHTML = ind
  l.appendChild(e)
  // return e
  return l
}
/**
 * Names the button with the proper designation based on button notation selection
 * @param {*} i - the button id number
 */
function nameButton(i) {
  switch (Number.parseInt(window.dispBtnNoteType)) {

    case ButtonNotationType.StreetFighter:
      switch (i) {
        case 0: return "LK"
        case 1: return "MK"
        case 2: return "LP"
        case 3: return "MP"
        case 4: return "HP"
        case 5: return "HK"
        default:
          return i
      }

    case ButtonNotationType.GuiltyGear:
      {
        switch (i) {
          case 0: return "P"
          case 1: return "D"
          case 2: return "K"
          case 3: return "S"
          case 4: return "HS"
          case 5: return "SP"
        }
        break
      }
    case ButtonNotationType.SoulCalibur:
      {
        switch (i) {
          case 0: return "G"
          case 1: return "K"
          case 2: return "A"
          case 3: return "B"
          case 4: return "N/A"
          case 5: return "N/A"
        }
        break
      }
    case ButtonNotationType.Tekken:
      {
        switch (i) {
          case 0: return "LK"
          case 1: return "RK"
          case 2: return "LP"
          case 3: return "RP"
          case 4: return "N/A"
          case 5: return "N/A"
        }
        break
      }
    case ButtonNotationType.SNK:
      {
        switch (i) {
          case 0: return "B"
          case 1: return "D"
          case 2: return "A"
          case 3: return "C"
          case 4: return "N/A"
          case 5: return "N/A"
        }
        break
      }
    default:
      return i
  }
}
/**
 * Names the axis based on the axis id number
 * @param {*} i - the axis id number
 */
function nameAxis(i) {
  switch (i) {
    case 0:
      return "LS X"
    case 1:
      return "LS Y"
    case 2:
      return "RS X"
    case 3:
      return "RS Y"
    case 4:
      return "LT"
    case 5:
      return "RT"
    default:
      break
  }
}
/**
 * EVENTS
 */
if (haveEvents) {
  window.addEventListener("gamepadconnected", connecthandler)
  window.addEventListener("gamepaddisconnected", disconnecthandler)
} else if (haveWebkitEvents) {
  window.addEventListener("webkitgamepadconnected", connecthandler)
  window.addEventListener("webkitgamepaddisconnected", disconnecthandler)
} else {
  setInterval(scangamepads, 500)
}