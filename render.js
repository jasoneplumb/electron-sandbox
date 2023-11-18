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
/* jshint esversion:6, node:true, -W033, -W014 */// 033 Missing semicolon, 014 Permissive line breaks

// https://www.electronjs.org/docs/latest/tutorial/process-model
// This render process uses a custom (window.ipc) API to send/receive messages to/from 
// the main process using channels specified in preload.js.
// This file is included by index.html directly.
console.log('Loading render.js')

window.ipc.receive('newContentBounds', (obj) => {
  console.log(obj.contentWidth + 'x' + obj.contentHeight + 'px')
  const SPLIT = 0.25
  const PAD = 24
  let FACTOR = 1.24
  if (obj.osVersion.includes('Windows 10')) FACTOR = 1.315
  document.body.innerHTML = ''
    + '<canvas id="canvas" width=' + obj.contentWidth * FACTOR / obj.scaleFactor
    + ' height=' + (obj.contentHeight*(1-SPLIT)) * FACTOR / obj.scaleFactor + '></canvas>'
    + '<div class="table" id="data_table" style="height:' + ((obj.contentHeight * SPLIT) * FACTOR / obj.scaleFactor - PAD) + 'px"></div>'
    + '<div id="status_bar" style="margin-left:' + PAD/5 + 'px">' 
    + obj.contentWidth + 'x' + obj.contentHeight + 'px' + ', scaleFactor: ' + obj.scaleFactor
    + '</div>'
})
