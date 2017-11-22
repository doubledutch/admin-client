// import this file before index.js in tests to mock the `window` and `XMLHttpRequest` objects.

let messageListener

global._window = {
  parent: {
    postMessage({type, payload}, origin) {
      expect(origin).toEqual('*')
      switch (type) {
        case 'access_token_unauthorized':
          messageListener({data: {type: 'access_token', payload: { accessToken: 'FAKE_TOKEN_2' } } })
          break
        case 'loaded':
          messageListener({data: {type: 'access_token', payload: { accessToken: 'FAKE_TOKEN' } } })
          messageListener({data: {type: 'application_id', payload: { applicationId: 'EVENT_ID' } } })
          messageListener({data: {type: 'cms_root', payload: { url: 'https://cms.doubledutch.me' } } })
          break
      }
    }
  },
  document: { location: 'https://other.doubledutch.me' },
  addEventListener(event, fn) {
    switch (event) {
      case 'message':
      messageListener = fn
        break
    }
  }
}

global._xmlHttpRequestSpy = {}
global._xmlHttpRequest = function() {
  this.open = (method, url, isAsync) => {
    const openParams = global._xmlHttpRequestSpy.openParams.shift()
    expect(method).toEqual(openParams.method)
    expect(url).toEqual(openParams.url)
    expect(isAsync).toEqual(true)
  }
  this.setRequestHeader = (header, value) => {
    switch (header) {
      case 'Authorization':
        expect(value).toEqual((global._xmlHttpRequestSpy.authorizations || ['Bearer FAKE_TOKEN']).shift())
        break
      case 'Content-Type':
        expect(value).toEqual('application/json')
        break;
    }
  }
  this.send = (body) => {
    expect(body).toEqual(global._xmlHttpRequestSpy.requestBody)
    const response = (global._xmlHttpRequestSpy.responseBodies || [null]).shift()
    this.onload.call({
      status: (global._xmlHttpRequestSpy.statuses || [200]).shift(),
      response: response ? JSON.stringify(response) : null
    })
  }
}
