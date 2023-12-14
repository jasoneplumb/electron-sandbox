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
***********************************************************/// render.js
// File: ./render.js
/* jshint esversion: 6, node: true, -W033, -W014 */// Missing semicolon, Permissive line breaks

// https://www.electronjs.org/docs/latest/tutorial/process-model
// This render process uses an application specific API (window.ipc) 
// to send/receive messages to/from the main process using channels specified in preload.js.
// This file is included by index.html directly.
console.log('Loading render.js')

let shown = false
window.ipc.receive('changeShape', (obj) => {
  console.log('render received a (changeShape) message from main (' 
    + obj.contentWidth + 'x' + obj.contentHeight + 'px)')
  const SPLIT = 0.5
  const PAD = 28
  const SCALED_WIDTH  = Math.round(obj.contentWidth  * obj.osScaleFactor)
  const SCALED_HEIGHT = Math.round(obj.contentHeight * obj.osScaleFactor * (1-SPLIT))
  const TABLE_HEIGHT  = Math.round(obj.contentHeight * obj.osScaleFactor * SPLIT) - PAD
  document.body.innerHTML = ''
    + '<canvas id="canvas" width=' + SCALED_WIDTH + ' height=' + SCALED_HEIGHT + '></canvas>'
    + '<div class="table" id="data_table" style="height:' + TABLE_HEIGHT + 'px"></div>'
    + '<div id="status_bar" style="margin-left:4px">width = ' + Math.round(obj.contentWidth) + '</div>'
  if (!shown) {
    window.ipc.send('show')
    console.log('render sent (show) message to main')
    shown = true
  }
})
