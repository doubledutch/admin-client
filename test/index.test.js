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

import windowShim from './windowShim'
import client from '../src/index'

beforeEach(() => {
  global._xmlHttpRequestSpy = {}
  global._window.parent.postMessage({type: 'loaded'}, '*')
})

test('client can getToken()', async () => {
  const token = await client.getToken()
  expect(token).toEqual('FAKE_TOKEN')
})

const getConfigParams = {method: 'GET', url: 'https://cms.doubledutch.me/api/config?currentApplicationId=EVENT_ID'}

test('client can navigate to relative url', async () => {
  global._window.location = '/starting/place';
  client.navigateCms('/some/place')
  expect(global._window.location).toEqual('/some/place')
})

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

test('client can getUsers()', async () => {
  global._xmlHttpRequestSpy.openParams = [{method: 'GET', url: 'https://cms.doubledutch.me/api/users?currentApplicationId=EVENT_ID'}]
  global._xmlHttpRequestSpy.responseBodies = [[{ Id: '1234', FirstName: 'Adam', LastName: 'Liechty', EmailAddress: 'adam@doubledutch.me' }]]

  const responseBody = await client.getUsers()
  expect(responseBody).toEqual([{id: '1234', email: 'adam@doubledutch.me', firstName: 'Adam', lastName: 'Liechty', userGroupIds: [], tierId: 0}])

  expect(global._xmlHttpRequestSpy.openParams).toHaveLength(0)
})

test('client can getAttendees()', async () => {
  global._xmlHttpRequestSpy.openParams = [{method: 'GET', url: 'https://cms.doubledutch.me/api/users?currentApplicationId=EVENT_ID'}]
  global._xmlHttpRequestSpy.responseBodies = [[{ Id: '1234', FirstName: 'Adam', LastName: 'Liechty', EmailAddress: 'adam@doubledutch.me', Tier: 42 }]]

  const responseBody = await client.getAttendees()
  expect(responseBody).toEqual([{id: '1234', email: 'adam@doubledutch.me', firstName: 'Adam', lastName: 'Liechty', userGroupIds: [], tierId: 42}])

  expect(global._xmlHttpRequestSpy.openParams).toHaveLength(0)
})

test('client can getAttendees(query)', async () => {
  global._xmlHttpRequestSpy.openParams = [{method: 'GET', url: 'https://cms.doubledutch.me/api/users?q=MY_QUERY&page=0&top=200&currentApplicationId=EVENT_ID'}]
  global._xmlHttpRequestSpy.responseBodies = [[{ Id: '1234', FirstName: 'Adam', LastName: 'Liechty', EmailAddress: 'adam@doubledutch.me' }]]

  const responseBody = await client.getAttendees('MY_QUERY')
  expect(responseBody).toEqual([{id: '1234', email: 'adam@doubledutch.me', firstName: 'Adam', lastName: 'Liechty', userGroupIds: [], tierId: 0}])

  expect(global._xmlHttpRequestSpy.openParams).toHaveLength(0)
})

test('emulated client can getAttendees(query)', async () => {
  client.region = 'none'
  const responseBody = await client.getAttendees('pont')
  expect(responseBody).toEqual([
    {id: '1234', email: 'cosette@thenardier.hotel', username: 'cosette@thenardier.hotel', company: 'Les Misérables', title: 'Character', firstName: 'Cosette', lastName: 'Pontmercy', tierId: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Ebcosette.jpg', userGroupIds: [68,79]},
    {id: '5678', email: 'marius@revolution.fr', username: 'marius@revolution.fr', company: 'Les Misérables', title: 'Character', firstName: 'Marius', lastName: 'Pontmercy', tierId: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Marius_sees_Cosette.jpg', userGroupIds: []}
  ])
})

test('client can getSurveys()', async () => {
  global._xmlHttpRequestSpy.openParams = [{method: 'GET', url: 'https://cms.doubledutch.me/api/surveys?currentApplicationId=EVENT_ID'}]
  global._xmlHttpRequestSpy.responseBodies = [[
    { Name:"Event Feedback", Description:"How was your experience?", TopicId:0, Items:[], Questions:[], Id:126108 }
  ]]

  const responseBody = await client.getSurveys()
  expect(responseBody).toEqual([
    {id: 126108, name: 'Event Feedback', description: 'How was your experience?', listId: null, itemIds: []}
  ])

  expect(global._xmlHttpRequestSpy.openParams).toHaveLength(0)
})

test('client can getTiers()', async () => {
  global._xmlHttpRequestSpy.openParams = [{method: 'GET', url: 'https://cms.doubledutch.me/api/tiers?currentApplicationId=EVENT_ID'}]
  global._xmlHttpRequestSpy.responseBodies = [[
    { Id: 0, Name: 'Default', AttendeeCount: 42, ListItems: [{ItemCount: 400, TopicName: 'Agenda', TopicId: 456}] },
    { Id: 123, Name: 'VIP', AttendeeCount: 5, ListItems: [{ItemCount: 3, TopicName: 'Agenda', TopicId: 456}]}
  ]]

  const responseBody = await client.getTiers()
  expect(responseBody).toEqual([
    {id: 0, name: 'Default', attendeeCount: 42, lists: [{id: 456, name: 'Agenda', itemCount: 400}]},
    {id: 123, name: 'VIP', attendeeCount: 5, lists: [{id: 456, name: 'Agenda', itemCount: 3}]}
  ])

  expect(global._xmlHttpRequestSpy.openParams).toHaveLength(0)
})

test('client can getAttendeeGroups()', async () => {
  global._xmlHttpRequestSpy.openParams = [{method: 'GET', url: 'https://cms.doubledutch.me/api/usergroups?currentApplicationId=EVENT_ID'}]
  global._xmlHttpRequestSpy.responseBodies = [[{ Id: 68, Name: 'Engineering' }, { Id: 79, Name: 'Marketing' }]]

  const responseBody = await client.getAttendeeGroups()
  expect(responseBody).toEqual([
    {id: 68, name: 'Engineering'},
    {id: 79, name: 'Marketing'}
  ])

  expect(global._xmlHttpRequestSpy.openParams).toHaveLength(0)
})