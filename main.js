/***********************************************************
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
***********************************************************/
// File: ./main.js
/* jshint esversion:6, node:true, -W033, -W014 */// 033 Missing semicolon, 014 Permissive line breaks
'use strict'
// https://www.electronjs.org/docs/latest/tutorial/process-model
// This main process uses a application specific API to send/receive messages  
// to/from the render process using channels specified in preload.js.
// This file loads the render process code indirectly from index.html 

const electron = require('electron')
const path = require('path')
const os = require('os')

let gWindowBounds = {x: 65, y: 40, width: 650, height: 400}
let gDisplay = undefined // the display which contains a majority of the application window
let gWindow = undefined // the application window itself

electron.app.allowRenderProcessReuse = false
electron.app.on('window-all-closed', () => electron.app.quit())
electron.app.on('before-quit', () => {})
electron.app.whenReady().then(() => {
  gDisplay = electron.screen.getDisplayNearestPoint({x: gWindowBounds.x + gWindowBounds.width/2, y: gWindowBounds.y + gWindowBounds.height/2})
  gWindow= new electron.BrowserWindow({
    x: gWindowBounds.x, 
    y: gWindowBounds.y, 
    width: gWindowBounds.width, 
    height: gWindowBounds.height,
    fullscreenable: false, // ensure title bar (version info) is always visible
    fullscreen: false, 
    frame: true,
    autoHideMenuBar: false, 
    webPreferences: {
      webSecurity: true,
      allowEval: false, 
      contextIsolation: true,
      enableRemoteModule: false, 
      preload: path.join(__dirname, 'preload.js'),
      zoomFactor: 1, 
    },  
    show: false, 
  })

  // Setup the handler and load the window contents

  gWindow.webContents.on('did-finish-load', () => {
    // setup the show window handler (see 'show: false,' above)...
    function handleShow(event, obj) { 
      console.log('main received (show) message from render')
      gWindow.show() 
    }
    // ...to call the window show() function when the render sends a 'show' message
    electron.ipcMain.on('show', handleShow)

    let priorContentHeight = 0
    let priorContentWidth = 0
    const BUILD_NUMBER = os.release().replace('10.0.', '')
    function resize() { 
      let bounds = gWindow.getBounds()
      let center = {x: bounds.x + bounds.width/2, y: bounds.y + bounds.height/2}
      let display = electron.screen.getDisplayNearestPoint(center)
      if (display.id !== gDisplay.id) gDisplay = display

      function debounce(func, max_period_ms) {
        var timeout
        return function() {
          clearTimeout(timeout)
          timeout = setTimeout(function() {
            timeout = null
            func.apply(this, arguments)
          }, max_period_ms)
        }
      }
      var debouncedHandleResize = debounce(() => {
        const SCALE_FACTOR = gDisplay.scaleFactor
        const BOUNDS = gWindow.getContentBounds()
        const HEIGHT = Math.round(BOUNDS.height * SCALE_FACTOR)
        const WIDTH = Math.round(BOUNDS.width * SCALE_FACTOR)
        if (HEIGHT != priorContentHeight || WIDTH != priorContentWidth) {
          priorContentHeight = HEIGHT
          priorContentWidth = WIDTH
          let obj = {
            "buildNumber": BUILD_NUMBER, 
            "contentHeight": HEIGHT,
            "contentWidth": WIDTH, 
            "scaleFactor": SCALE_FACTOR, 
          }
          gWindow.webContents.send('changeShape', obj)
          console.log('main sent a (changeShape) message to render: ' + 
            WIDTH + 'x' + HEIGHT + 'px' + ', scaleFactor: ' + SCALE_FACTOR)
        }
      }, 750)
      // To limit the (IPC) call rate,
      // this handler calls debounceHandleResize instead.
      debouncedHandleResize()
    }
    electron.screen.on('display-metrics-changed', (event, display, metrics) => {
      if (display.id == gDisplay.id && metrics.includes('scaleFactor')) resize()
    })
    gWindow.on('resize', resize )
    resize() // call it explicitly once
  })

  gWindow.loadFile('./index.html')
})
