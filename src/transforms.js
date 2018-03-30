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
    tierId: user.Tier || 'default',
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

export function prettifySurvey(s) {
  if (!s) return null
  return deleteUndefinedKeys({
    id: s.Id,
    name: s.Name,
    description: s.Description,
    listId: s.TopicId || null,
    itemIds: s.Items.map(x => x.value)
  })
}

export function prettifyTier(tier) {
  if (!tier) return null
  return {
    id: tier.Id || 'default',
    name: tier.Name,
    attendeeCount: tier.AttendeeCount,
    lists: tier.ListItems.map(x => ({itemCount: x.ItemCount, name: x.TopicName, id: x.TopicId}))
  }
}

function deleteUndefinedKeys(obj) {
  Object.keys(obj).forEach(key => typeof obj[key] === 'undefined' && delete obj[key])
  return obj
}
