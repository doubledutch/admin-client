@doubledutch/admin-client
======================

DoubleDutch client library for building admin pages for extensions within the CMS.

# Automated setup

The easiest way to get started is to install the [DoubleDutch command line tool](https://github.com/doubledutch/cli) and run `doubledutch init`.

See also [@doubledutch/firebase-connector](https://github.com/doubledutch/firebase-connector)
for an easy backend for your DoubleDutch extension.

# Usage

```jsx
import client from '@doubledutch/admin-client'

console.log(client.currentUser)

client.getToken().then(token => console.log(`${token} is a valid DoubleDutch CMS access token, usually used indirectly by other client libraries.`))

class App extends React.Component {
  render() {
    return (
      <div>
        <div>Hello {client.currentUser.firstName}</div>
      </div>
    )
  }
}
```

# Documentation

## `client.currentUser`

Provides information about the current attendee.

```javascript
{
  id: '24601',                            // DoubleDutch user ID (required)
  image: 'https://ddut.ch/image.jpg',     // Avatar image URL (optional)
  identifier: 'jean@valjean.com',         // Unique ID provided by event organizer (required)
  firstName: 'Jean',                      // Given name (required)
  lastName: 'Valjean',                    // Surname (required)
  title: 'Character',                     // Job title (optional)
  company: 'Les Misérables'               // Company attendee works for (optional)
}
```

## `client.getToken`

Returns a Promise which resolves to a valid CMS access token.  Normally used
indirectly by other client libraries to access the DoubleDutch platform.

```javascript
client.getToken().then(token => /* Use the token. */)
```

## `client.getAttendee(id)`

Returns a Promise which resolves to the attendee in the current event.

```javascript
client.getAttendee(42).then(attendee => console.log(attendee))
```

## `client.getAttendees(query)`

Returns a Promise which resolves to all the attendees in the current event, or
the top 200 filtered by a query string.

```javascript
client.getAttendees().then(attendees => console.log(attendees))
client.getAttendees('John').then(attendees => console.log(attendees))
```

## `client.getAttendeeGroups()`

Returns a Promise which resolves to all the attendee groups in the current event

```javascript
client.getAttendeeGroups().then(groups => console.log(groups))
```

## `client.getTiers()`

Returns a Promise which resolves to all the attendee groups in the current event,
for events with Content Visibility enabled.

```javascript
client.getTiers().then(tiers => console.log(tiers))
```

## `client.cmsRequest(method, relativeURL, bodyJSON)`

Returns a Promise which resolves to the parsed response body for a successful
CMS request for the current event.

```javascript
client.cmsRequest('GET', '/api/users').then(users => console.log(users))
```

## `client.navigateCms(relativeURL)`

Instructs the CMS to navigate to a relative url.

```javascript
client.cmsRequest('/api/users')
```
