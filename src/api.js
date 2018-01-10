import { prettifyAttendee } from './transforms'

export default function api(client) {
  function isEmulated() { return client.region === 'none' }

  return {
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
  }
}
