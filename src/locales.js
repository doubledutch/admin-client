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

function getLocaleStrings() {
  const navigator = window.navigator || {}
  return navigator.languages || [navigator.language || 'en-US']
}

let localeStrings = []
try {
  localeStrings = getLocaleStrings()
} catch (e) { /* Best effort */ }

export function parseLocale(localeString) {
  if (localeString && localeString.split) {
    const split = localeString.replace(/\-/g,'_').split('_')
    return { language: split[0] || '', region: split[1] || '' }  
  } else {
    return { language: '', region: '' }
  }
}

export const locales = localeStrings.map(parseLocale)
