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

import api from './api'

const win = (global && global._window) || window
const xmlHttpRequest = (global && global._xmlHttpRequest) || XMLHttpRequest

let accessToken, cmsRoot
let accessTokenResolves = []
let cmsRequests = []
const client = {
  cmsRequest,
  navigateCms,
  getCmsBaseUrl,
  getToken() {
    return new Promise((resolve, reject) => {
      if (accessToken) {
        resolve(accessToken)
      } else {
        accessTokenResolves.push(resolve)
      }
    })
  },
  // currentUser is only specified to make `client` similar to the one exposed
  // by `rn-client`, so that connecting with `firebase-connector` works.
  currentUser: { id: 'none' }
}
const apiFunctions = api(client)
Object.keys(apiFunctions).forEach(fnName => client[fnName] = apiFunctions[fnName])
export default client

if (win) {
  win.addEventListener('message', e => {
    if (e.data) {
      if (e.data.type === 'access_token') {
        accessToken = e.data.payload.accessToken
      } else if (e.data.type === 'application_id') {
        client.currentEvent = { id: e.data.payload.applicationId }
      } else if (e.data.type === 'cms_root') {
        cmsRoot = e.data.payload.url
        client.region = getRegion(cmsRoot)
      }
    }
    if (accessToken && client.currentEvent && cmsRoot) {
      accessTokenResolves.forEach(resolve => resolve(accessToken))
      accessTokenResolves = []
      cmsRequests.forEach(r => r())
      cmsRequests = []
    }
  }, false)
}

function postMessage(type, data) {
  if (win && win.parent && win.parent.postMessage) {
    win.parent.postMessage({
      type,
      payload: Object.assign({}, (data||{}), {src: win.document.location.toString()})
    }, '*')
  }
}
postMessage('loaded')

function getRegion(cmsRoot) {
  if (cmsRoot.indexOf("https://cms.doubledutch.me") === 0) return 'us'
  if (cmsRoot.indexOf("https://cms.eu.doubledutch.me") === 0) return 'eu'
  if (cmsRoot.indexOf("https://purple.cms.doubledutch.me") === 0) return 'purple'
  if (cmsRoot.indexOf("https://qa.cms.doubledutch.me") === 0) return 'qa'
  if (cmsRoot.indexOf("http://cms.local:") === 0 || cmsRoot.indexOf("http://localhost:") === 0) return 'local'
  return 'none'
}

function getCmsBaseUrl() {
  return cmsRoot;
}

function cmsRequest(method, relativeUrl, bodyJSON) {
  return new Promise((resolve, reject) => {
    if (accessToken && client.currentEvent && cmsRoot) {
      doRequest()
    } else {
      cmsRequests.push(doRequest)
    }

    // A simple usage of XMLHttpRequest provides browser compatibility and small footprint.
    function doRequest() {
      const resolvedRelativeUrl = relativeUrl.replace('{currentEventId}', client.currentEvent.id)

      if (client.region === 'none') {
        console.log(`Skipping HTTP request to actual CMS. ${method} ${resolvedRelativeUrl}`)
        resolve()
        return
      }

      const url = `${cmsRoot}${resolvedRelativeUrl}${resolvedRelativeUrl.indexOf('?') >= 0 ? '&':'?'}currentApplicationId=${client.currentEvent.id}`
      const request = new xmlHttpRequest()
      request.open(method, url, true)
      request.setRequestHeader('Authorization', `Bearer ${accessToken}`)
      request.onload = function() {
        if (this.status == 401) {
          accessToken = null
          cmsRequests.push(doRequest)
          postMessage('access_token_unauthorized')
          return
        }
        if (this.status >= 200 && this.status < 400) {
          if (!this.response) return resolve()
          let data
          try {
            data = JSON.parse(this.response)
          } catch (e) {
            throw new Error(`Could not parse JSON: ${this.response}`)
          }
          resolve(data)
        }
      }
      request.onerror = function() {
        throw new Error('connection error')
      }
      if (bodyJSON) {
        const body = JSON.stringify(bodyJSON)
        request.setRequestHeader('Content-Type', 'application/json')
        request.send(body)
      } else {
        request.send()
      }
    }
  })
}

function navigateCms(location) {
  if (location && (location.url || location.hash)) {
    postMessage('navigate', location);    
  } else {
    postMessage('navigate', { url : location });
  }
}
