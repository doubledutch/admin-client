export function prettifyAttendee(user) {
  if (!user) return null
  const id = user.UserId || user.Id
  return deleteUndefinedKeys({
    id: id && `${id}`,
    identifier: user.UserIdentifierId,
    firstName: user.FirstName,
    lastName: user.LastName,
    title: user.Title,
    company: user.Company,
    email: user.EmailAddress,
    username: user.UserName,
    image: user.ImageUrl,
    userGroupIds: user.UserGroups || [],
    tierId: user.Tier || 0,
    twitter: user.TwitterUserName,
    linkedin: user.LinkedInId,
    facebook: user.FacebookUserId
  })
}

export function prettifyAttendeeGroup(group) {
  if (!group) return null
  return {
    id: group.Id,
    name: group.Name
  }
}

export function prettifyTier(tier) {
  if (!tier) return null
  return {
    id: tier.Id,
    name: tier.Name,
    attendeeCount: tier.AttendeeCount,
    lists: tier.ListItems.map(x => ({itemCount: x.ItemCount, name: x.TopicName, id: x.TopicId}))
  }
}

function deleteUndefinedKeys(obj) {
  Object.keys(obj).forEach(key => typeof obj[key] === 'undefined' && delete obj[key])
  return obj
}
