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

import {translate as t, setLocales, useStrings} from '../src'

const strings = {
  "": {
    "greet": "Hello, ${name}",
    "age": "${years} years old"
  },
  "de": {
    "greet": "Hallo, ${name}"
  },
  "de-DE": {
    "greet": "Guten Tag, ${name}"
  }
}

test('translation uses specific language-region, if available', () => {
  setLocales([{language: 'de', region: 'DE'}])
  useStrings(strings)
  expect(t('greet', {name: 'Adam'})).toEqual('Guten Tag, Adam')
})

test('numberic variables are replaced', () => {
  useStrings(strings)
  expect(t('age', {years: 0})).toEqual('0 years old')
  expect(t('age', {years: 2})).toEqual('2 years old')
})

test('translation uses language, if specific region unavailable', () => {
  setLocales(["de-CH"])
  useStrings(strings)
  expect(t('greet', {name: 'Adam'})).toEqual('Hallo, Adam')
})

test('translation falls back to default, if specific language and language-region unavailable', () => {
  setLocales(["es-ES"])
  useStrings(strings)
  expect(t('greet', {name: 'Adam'})).toEqual('Hello, Adam')
})

test('translation returns empty string for nonexistent keys', () => {
  setLocales(["de-DE"])
  useStrings(strings)
  expect(t('not_found__warning_expected', {name: 'Adam'})).toEqual('')
})

test('translation respects ordered locale preference, where region-specific is higher than language', () => {
  setLocales(["fr-FR", "fr", "de-DE", "de"])
  useStrings(strings)
  expect(t('greet', {name: 'Adam'})).toEqual('Guten Tag, Adam')
})

test('translation respects ordered locale preference, where language is higher than region-specific', () => {
  setLocales(["fr", "fr-FR", "de", "de-DE"])
  useStrings(strings)
  expect(t('greet', {name: 'Adam'})).toEqual('Hallo, Adam')
})

test('setLocales accepts "de-DE" string', () => {
  setLocales(['de-DE'])
  useStrings(strings)
  expect(t('greet', {name: 'Adam'})).toEqual('Guten Tag, Adam')
})

test('setLocales accepts "de_DE" string', () => {
  setLocales(['de_DE'])
  useStrings(strings)
  expect(t('greet', {name: 'Adam'})).toEqual('Guten Tag, Adam')
})
