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
// https://www.electronjs.org/docs/latest/tutorial/process-model
'use strict'
/* jshint esversion:6, node:true, -W033, -W014 */// 033 Missing semicolon, 014 Permissive line breaks

const electron = require('electron')

let windowBounds = {x: 0, y: 0, width: 600, height: 400}
electron.app.whenReady().then(() => {
  let windowDisplay = electron.screen.getDisplayNearestPoint({x: windowBounds.x + windowBounds.width/2, y: windowBounds.y + windowBounds.height/2})
  const window = new electron.BrowserWindow({
    show: false, 
    frame: true, // show the window frame (e.g. title bar, boarders)
    x: windowBounds.x, 
    y: windowBounds.y, 
    width: windowBounds.width, 
    height: windowBounds.height, 
    nodeIntegration: true, 
    contextIsolation: true, // protect against prototype pollution
    show: false, 
    autoHideMenuBar: false, 
  })
  function DisplayChanged(newBounds) {
    const newCenter = {x: newBounds.x + newBounds.width/2, y: newBounds.y + newBounds.height/2}
    const display = electron.screen.getDisplayNearestPoint(newCenter)
    if (display.id !== windowDisplay.id) {
      windowDisplay = display
      window.zoomFactor = 1 / windowDisplay.scaleFactor
      return true
    }
    return false
  }
  let priorHeight = 0
  function handleResize() {
    const height = window.getContentBounds().height * windowDisplay.scaleFactor
    if (height != priorHeight) {
      console.log('Window content height changed to ' + height + 'px')
      priorHeight = height
    }
  }
  window.on('resize', () => { DisplayChanged( window.getBounds() ); handleResize() })
  window.on('move', () => { if (DisplayChanged( window.getBounds() )) handleResize() })
  window.on('maximize', () => handleResize())
  window.on('unmaximize', () => handleResize())
  window.once('ready-to-show', () => {
    window.show()
  })  
  handleResize()
  window.loadURL('https://electronjs.org')
})
