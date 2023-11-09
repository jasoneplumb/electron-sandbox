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
// This main process uses a custom (window.ipc) API to send/receive messages to/from 
// the render process using channels specified in preload.js.
// This file loads the render process code indirectly from index.html 

const electron = require('electron')
const path = require('path')

let windowBounds = {x: 0, y: 0, width: 600, height: 400}
let display = undefined 
let window = undefined 

electron.app.allowRenderProcessReuse = false
electron.app.on('window-all-closed', () => electron.app.quit())
electron.app.on('before-quit', () => {})
electron.app.whenReady().then(() => {
  display = electron.screen.getDisplayNearestPoint({x: windowBounds.x + windowBounds.width/2, y: windowBounds.y + windowBounds.height/2})
  window = new electron.BrowserWindow({
    x: windowBounds.x, 
    y: windowBounds.y, 
    width: windowBounds.width, 
    height: windowBounds.height,

    frame: true,
    autoHideMenuBar: false, 
    webPreferences: {
      webSecurity: true,
      allowEval: false, 
      contextIsolation: true,
      enableRemoteModule: false, 
      preload: path.join(__dirname, 'preload.js'),
    },  
    show: true, 
  })
  function displayChanged(newBounds) {
    let result = false
    let newCenter = {x: newBounds.x + newBounds.width/2, y: newBounds.y + newBounds.height/2}
    let current = electron.screen.getDisplayNearestPoint(newCenter)
    if (current.id !== display.id) {
      display = current
      result = true
    } 
    return result
  }

  // Load the window contents
  window.webContents.on('did-finish-load', () => {
    let priorContentHeight = 0
    function handleResize(scaleFactor = display.scaleFactor) {
      let contentHeight = window.getContentBounds().height * scaleFactor
      if (contentHeight != priorContentHeight) {
        console.log('contentHeight: ' + contentHeight + 'px' + ', scaleFactor: ' + scaleFactor)
        priorContentHeight = contentHeight
        window.webContents.send('height', contentHeight)
      }
    }
    handleResize() // call it once to see the first appearance
    electron.screen.on('display-metrics-changed', (event, changedDisplay, changedMetrics) => {
      if (changedDisplay.id == display.id && changedMetrics.includes('scaleFactor')) {
        handleResize(changedDisplay.scaleFactor)
      }
    })
    window.on('resize', () => { displayChanged( window.getBounds() ); handleResize() })
    window.on('move', () => { if (displayChanged( window.getBounds() )) handleResize() })
  })
  window.loadFile('./index.html')
})
