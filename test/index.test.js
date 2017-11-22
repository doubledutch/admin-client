import windowShim from './windowShim'
import client from '../src/index'

beforeEach(() => {
  global._xmlHttpRequestSpy = {}
})

test('client can getToken()', async () => {
  const token = await client.getToken()
  expect(token).toEqual('FAKE_TOKEN')
})

const getConfigParams = {method: 'GET', url: 'https://cms.doubledutch.me/api/config?currentApplicationId=EVENT_ID'}

test('CMS API request resolves to response', async () => {
  global._xmlHttpRequestSpy.openParams = [getConfigParams]
  global._xmlHttpRequestSpy.responseBodies = [{ some: 'config' }]

  const responseBody = await client.cmsRequest('GET', '/api/config')
  expect(responseBody).toEqual({some: 'config'})

  expect(global._xmlHttpRequestSpy.openParams).toHaveLength(0)
})

test('token is refreshed when CMS API returns 401, and CMS API call is retried', async() => {
  global._xmlHttpRequestSpy.openParams = [getConfigParams, getConfigParams]
  global._xmlHttpRequestSpy.statuses = [401, 200] // First mock CMS call gives 401; second succeeds after refresh
  global._xmlHttpRequestSpy.authorizations = ['Bearer FAKE_TOKEN', 'Bearer FAKE_TOKEN_2'] // expect the refreshed token on the second API call
  global._xmlHttpRequestSpy.responseBodies = [null, { some: 'config'}] // First mock call fails; second succeeds after refresh

  const responseBody = await client.cmsRequest('GET', '/api/config')
  expect(responseBody).toEqual({some: 'config'})

  // All expected calls XMLHttpRequest calls have been made.
  expect(global._xmlHttpRequestSpy.openParams).toHaveLength(0)
  expect(global._xmlHttpRequestSpy.statuses).toHaveLength(0)
  expect(global._xmlHttpRequestSpy.authorizations).toHaveLength(0)
  expect(global._xmlHttpRequestSpy.responseBodies).toHaveLength(0)
})
