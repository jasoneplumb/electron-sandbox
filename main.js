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
// https://www.electronjs.org/docs/latest/tutorial/process-model
// This main process uses a application specific API to send/receive messages  
// to/from the render process using channels specified in preload.js.
// This file loads the render process code indirectly from index.html 

console.log('Loading main.js')

const electron = require('electron')
const path = require('path')

let gDisplay = undefined
let gWindow = undefined

electron.app.on('window-all-closed', () => electron.app.quit())
electron.app.whenReady().then(() => {
  gDisplay = electron.screen.getPrimaryDisplay()
  gWindow = new electron.BrowserWindow({
    fullscreenable: false, // Ensure the title bar is always visible
    minHeight: 100, 
    show: true, 
    webPreferences: { preload: path.join(__dirname, 'preload.js') }, 
  })
  gWindow.maximize()
  gWindow.webContents.on('did-finish-load', () => {
    let priorHeight = 0
    let priorWidth = 0
    let priorDisplayScale = 0
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
        const DISPLAY_SCALE = gDisplay.scaleFactor
        const BOUNDS = gWindow.getContentBounds()
        const HEIGHT = BOUNDS.height
        const WIDTH = BOUNDS.width
        if (DISPLAY_SCALE != priorDisplayScale || HEIGHT != priorHeight || WIDTH != priorWidth) {
          priorHeight = HEIGHT
          priorWidth = WIDTH
          let obj = {
            "height": HEIGHT,
            "width": WIDTH, 
            "displayScale": DISPLAY_SCALE, 
          }
          gWindow.webContents.send('changeShape', obj)
          gWindow.webContents.setZoomFactor(1/DISPLAY_SCALE)
          console.log('changeShape (' + WIDTH + ', ' + HEIGHT + ', ' + DISPLAY_SCALE + ')')
        }
      }, 750)

      debouncedHandleResize()
    }
    electron.screen.on('display-metrics-changed', (event, display, metrics) => {
      if (display.id == gDisplay.id && metrics.includes('scaleFactor')) resize()
    })
    gWindow.on('resize', resize )
    resize() // call it explicitly once
  })

  let devToolsVisible = 0
  function toggleDevTools(webContents) {
    devToolsVisible ^= 1
    if (devToolsVisible) webContents.openDevTools()
    else webContents.closeDevTools()
  }
  // Create a menu template
  const template = [
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          enabled: false, 
          click: () => {},
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          enabled: false, 
          click: () => {},
        },
        {
          label: 'Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+i',
          enabled: true, 
          click: () => {
            if (gWindow)  {
              toggleDevTools(gWindow.webContents)
            }
          },
        },
      ],
    },
  ];
  const menu = electron.Menu.buildFromTemplate(template);
  electron.Menu.setApplicationMenu(menu);
  
  gWindow.loadFile('./index.html')
})
