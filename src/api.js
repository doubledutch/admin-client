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

import { prettifyAttendee, prettifyAttendeeGroup, prettifySurvey, prettifyTier } from './transforms'

export default function api(client) {
  function isEmulated() { return client.region === 'none' }

  const apis = {
    getAttendee(id) {
      return isEmulated() ? emulatedApi.getAttendee(id)
        : client.cmsRequest('GET', `/api/users/${id}`).then(prettifyAttendee)
    },
    getAttendees(query) {
      const url = query == null
        ? '/api/users'
        : `/api/users?q=${query}&page=0&top=200`
      return isEmulated()
        ? emulatedApi.getAttendees(query)
        : client.cmsRequest('GET', url)
          .then(val => val.map(prettifyAttendee))
    },
    getSurveys() {
      return isEmulated() ? emulatedApi.getSurveys()
        : client.cmsRequest('GET', '/api/surveys').then(val => val.map(prettifySurvey))
    },
    getAttendeeGroups() {
      return isEmulated() ? emulatedApi.getAttendeeGroups()
        : client.cmsRequest('GET', '/api/usergroups').then(val => val.map(prettifyAttendeeGroup))
    },
    getTiers() {
      return isEmulated() ? emulatedApi.getTiers()
        : client.cmsRequest('GET', '/api/tiers').then(val => val.map(prettifyTier))
    },

    // Deprecated aliases for getAttendee(s)
    getUser: id => apis.getAttendee(id),
    getUsers: () => apis.getAttendees()
  }

  return apis
}

export const emulatedApi = {
  getAttendeeGroups() {
    return Promise.resolve(emulatedAttendeeGroups.map(prettifyAttendeeGroup))
  },
  getSurveys() {
    return Promise.resolve(emulatedSurveys.map(prettifySurvey))
  },
  getTiers() {
    return Promise.resolve(emulatedTiers.map(prettifyTier))
  },
  getAttendee(id) {
    id = id == null ? null : id.toString()
    if (emulatedAttendees[id]) return Promise.resolve(emulatedAttendees[id]).then(prettifyAttendee)
    return Promise.reject('Not Found')
  },
  getAttendees(query) {
    // Crude filter for emulator
    const attendees = Object.keys(emulatedAttendees).map(id => prettifyAttendee(emulatedAttendees[id]))
    return Promise.resolve(query
      ? attendees.filter(a => !!Object.values(a).find(v => (typeof v === 'string') && v.toLowerCase().includes(query.toLowerCase())))
      : attendees)
  }
}

const emulatedAttendeeGroups = [
  { Id: 68, Name: 'Engineering' },
  { Id: 79, Name: 'Marketing' }
]

const emulatedSurveys = [
  { Name:"Event Feedback", Description:"How was your experience?", TopicId:0, Items:[], Questions:[], Id:126108 }
]

const emulatedTiers = [
  { Id: 0, Name: 'Default', AttendeeCount: 42, ListItems: [{ItemCount: 400, TopicName: 'Agenda', TopicId: 456}] },
  { Id: 123, Name: 'VIP', AttendeeCount: 5, ListItems: [{ItemCount: 3, TopicName: 'Agenda', TopicId: 456}]}
]

const emulatedAttendees = {
  '24601': {
    Id: '24601',
    ImageUrl: 'https://images.amcnetworks.com/bbcamerica.com/wp-content/blogs.dir/55/files/2012/12/Hugh-Jackman-Les-Miserables.jpg',
    UserName: 'jean@valjean.com',
    EmailAddress: 'jean@valjean.com',
    UniqueIdentifier: 'jvj24601',
    FirstName: 'Jean',
    LastName: 'Valjean',
    Tier: 123,
    UserGroups: [68],
    Title: 'Character',
    Company: 'Les Misérables'
  },
  '1234': {
    Id: '1234',
    ImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Ebcosette.jpg',
    UserName: 'cosette@thenardier.hotel',
    EmailAddress: 'cosette@thenardier.hotel',
    UniqueIdentifier: 'cosette1862',
    FirstName: 'Cosette',
    LastName: 'Pontmercy',
    UserGroups: [68,79],
    Title: 'Character',
    Company: 'Les Misérables'
  },
  '5678': {
    Id: '5678',
    ImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Marius_sees_Cosette.jpg',
    UserName: 'marius@revolution.fr',
    EmailAddress: 'marius@revolution.fr',
    UniqueIdentifier: 'marius1862',
    FirstName: 'Marius',
    LastName: 'Pontmercy',
    Title: 'Character',
    Company: 'Les Misérables'
  }
}
