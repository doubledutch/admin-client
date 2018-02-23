import { prettifyAttendee, prettifyTier } from './transforms'

export default function api(client) {
  function isEmulated() { return client.region === 'none' }

  return {
    getTiers() {
      return isEmulated() ? emulatedApi.getTiers()
        : client.cmsRequest('GET', '/api/tiers').then(val => val.map(prettifyTier))
    },
    getUser(userId) {
      return isEmulated() ? emulatedApi.getUser(userId)
        : client.cmsRequest('GET', `/api/users/${userId}`).then(prettifyAttendee)
    },
    getUsers() {
      return isEmulated() ? emulatedApi.getUsers()
        : client.cmsRequest('GET', '/api/users').then(val => val.map(prettifyAttendee))
    }
  }
}

export const emulatedApi = {
  getTiers() {
    return Promise.resolve(emulatedTiers.map(prettifyTier))
  },
  getUser(userId) {
    userId = userId == null ? null : userId.toString()
    if (emulatedUsers[userId]) return Promise.resolve(emulatedUsers[userId]).then(prettifyAttendee)
    return Promise.reject('Not Found')
  },
  getUsers() {
    return Promise.resolve(Object.keys(emulatedUsers).map(id => prettifyAttendee(emulatedUsers[id])))
  }
}

const emulatedUsers = {
  '24601': {
    Id: '24601',
    ImageUrl: 'https://images.amcnetworks.com/bbcamerica.com/wp-content/blogs.dir/55/files/2012/12/Hugh-Jackman-Les-Miserables.jpg',
    UserName: 'jean@valjean.com',
    EmailAddress: 'jean@valjean.com',
    UniqueIdentifier: 'jvj24601',
    FirstName: 'Jean',
    LastName: 'Valjean',
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
