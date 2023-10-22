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
