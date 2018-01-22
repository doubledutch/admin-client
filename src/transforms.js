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
    twitter: user.TwitterUserName,
    linkedin: user.LinkedInId,
    facebook: user.FacebookUserId
  })
}

function deleteUndefinedKeys(obj) {
  Object.keys(obj).forEach(key => typeof obj[key] === 'undefined' && delete obj[key])
  return obj
}
