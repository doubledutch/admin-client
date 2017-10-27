let accessToken, cmsRoot
let accessTokenResolves = []

const client = {
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
      }
    }
    if (accessToken && client.currentEvent && cmsRoot) {
      accessTokenResolves.forEach(resolve => resolve(accessToken))
      accessTokenResolves = []
    }
  }, false)  
}

if (window && window.parent && window.parent.postMessage) {
  window.parent.postMessage({
    type: 'loaded',
    payload: { src: document.location.toString() }
  }, '*')
}
