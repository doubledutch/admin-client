#!/usr/bin/env node
/*
 * Copyright 2018 DoubleDutch, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const http = require('http')
const net = require('net')

const iframedPort = process.argv[2] || '3000'

getPort(3001).catch(() => getPort(0)).then(port => {
  console.log(`Launching emulator at http://localhost:${port}/ wrapping localhost:${iframedPort} in an iframe.`)
  console.log(`Open in a browser to  ^^^^^^^^^^^^^^^^^^^^^^ to view this site in an emulator for admin-client.`)
  console.log(`If your site is not running on port ${iframedPort}, rerun this script with the target port as the only parameter.`)
  console.log(`Press ctrl-C to quit.`)
  http.createServer((req, res) => {
    res.writeHead(200)
    res.write(`
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { height:100%; width:100%; margin:0; font-family:sans-serif; }
      iframe { height: calc(100% - 30px); width:100%; border:none; }
      #header { height: 30px; background-color: #009acd; text-align:center; line-height:30px; color: white; }
    </style>
    <script>
      window.addEventListener("message", function(e) {
        if (e.data.type === 'loaded') {
          const target = document.getElementById('admin').contentWindow
          target.postMessage({type: 'access_token', payload: {accessToken:'fake-access-token'}}, '*')
          target.postMessage({type: 'application_id', payload: {applicationId:'sample-event-id'}}, '*')
          target.postMessage({type: 'cms_root', payload: {url:'http://fake.localhost'}}, '*')
        }
      }, false)
    </script>
  </head>
  <body>
    <div id="header">👇 Below is your admin page, injected with an emulated token 🚂</div>
    <iframe id="admin" src="http://localhost:${iframedPort}" />
  </body>
  </html>`)
  }).listen(port)
})

function getPort(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.unref()
    server.on('error', reject)

    server.listen({port}, () => {
      const port = server.address().port
      server.close(() => {
        resolve(port)
      })
    })
  })
}