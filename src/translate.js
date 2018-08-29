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

import {locales, parseLocale} from './locales'

let s = {}
export function useStrings(localeToStrings) {
  s = localeToStrings
}

let localeKeys
setLocales(locales)
export function setLocales(locales) {
  locales = locales.map(locale => locale.length
    ? parseLocale(locale)
    : {language: locale.language || '', region: locale.region || ''})

  // Expand the locale preferences into an ordered set of locales to use
  // in translations
  localeKeys = unique(x => x, [
    // First take each locale as specified
    ...locales.map(loc => loc.language && loc.region ? `${loc.language}-${loc.region}` : (loc.language||'')),

    // Then, fall back to language-only versions of each locale
    ...locales.map(loc => loc.language || null),

    // Finally, use the default strings
    ''
  ].filter(x => x !== null))
}

export default function translate(key, params) {
  const template = localeKeys.reduce((template, localeKey) => {
    if (template) return template // Take first matching template (corresponds to highest locale preference).
    return templateFrom(s[localeKey], key)
  }, null)
  if (!template) {
    console.warn(`Missing i18n string '${key}'`)
    return ''
  }
  return replace(template, params)
}

function templateFrom(strings, key) {
  if (!strings) return null
  return strings[key]
}

const replaceRegex = /\$\{([a-zA-Z0-9_]+)\}/g
function replace(template, params = {}) {
  if (!template) return ''
  return template.replace(replaceRegex, (match, key, offset, string) => {
    const val = params[key]
    if (val === undefined) console.warn(`Param '${key}' not supplied for i18n for string: ${string}`)
    return val || ''
  })
}

function unique(identityFn, array) {
  const alreadySeenKeys = {}
  return array.filter(x => {
    const key = identityFn(x)
    if (alreadySeenKeys[key]) return false
    alreadySeenKeys[key] = true
    return true
  })
}
