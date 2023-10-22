// main.js
// https://www.electronjs.org/docs/latest/tutorial/process-model
/* jshint esversion:8, node:true, -W033, -W014 */// 033 Missing semicolon, 014 Permissive line breaks
'use strict'
const electron = require('electron')
electron.app.whenReady().then(() => {
  const win = new electron.BrowserWindow({ 
    nodeIntegration: true, 
    contextIsolation: true, // protect against prototype pollution
    show: false, 
  })
  win.once('ready-to-show', () => {
    win.show()
    win.focus()
  })  
  win.loadURL('https://electronjs.org')
})
