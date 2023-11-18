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
// preload.js
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
/* jshint esversion: 6, node: true, -W033, -W014 */// Missing semicolon, Permissive line breaks

console.log('Loading preload.js')

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ipc', {
  // Send to the main process
  send: (channel, data) => {
    const validChannels = [
      '<tbd>',
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  // Receive from the main process
  receive: (channel, func) => {
    const validChannels = [
      'newContentBounds',
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args)) // strip event as it includes `sender` 
    }
  }
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }
  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
    console.log( type + ' ' + process.versions[type] )
  }
})
