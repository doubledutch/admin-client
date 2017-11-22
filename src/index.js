let accessToken, cmsRoot
let accessTokenResolves = []
let cmsRequests = []
const client = {
  cmsRequest,
  getToken() {
    return new Promise((resolve, reject) => {
      if (accessToken) {
        resolve(accessToken)
      } else {
        accessTokenResolves.push(resolve)
      }
    })
  },
  currentUser: { id: 'none' }
}
export default client

if (window) {
  window.addEventListener('message', e => {
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

function postMessage(type) {
  if (window && window.parent && window.parent.postMessage) {
    window.parent.postMessage({
      type,
      payload: { src: document.location.toString() }
    }, '*')
  }
}
postMessage('loaded')

function getRegion(cmsRoot) {
  return cmsRoot.indexOf("https://cms.doubledutch.me") === 0
  ? "us"
  : cmsRoot.indexOf("https://cms.eu.doubledutch.me") === 0
      ? "eu"
      : cmsRoot.indexOf("https://purple.cms.doubledutch.me") === 0
          ? "purple"
          : cmsRoot.indexOf("https://qa.cms.doubledutch.me") === 0
              ? "qa"
              : "none";

}

function cmsRequest(method, relativeUrl, bodyJSON) {
  return new Promise((resolve, reject) => {
    if (accessToken && client.currentEvent && cmsRoot) {
      doRequest()
    } else {
      cmsRequests.push(doRequest)
    }

    function doRequest() {
      const url = `${cmsRoot}${relativeUrl}${relativeUrl.indexOf('?') >= 0 ? '&':'?'}currentApplicationId=${client.currentEvent.id}`
      const request = new XMLHttpRequest()
      request.open(method, url, true)
      request.setRequestHeader('Authorization', `Bearer ${accessToken}`)
      request.onload = function() {
        if (this.status == 401) {
          accessToken = null
          postMessage('access_token_unauthorized')
          cmsRequests.push(doRequest)
          return
        }
        if (this.status >= 200 && this.status < 400) {
          if (!this.response) resolve()
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
        request.setRequestHeader('Content-Length', body.length)
        request.send(body)
      } else {
        request.send()
      }        
    }
  })
}
