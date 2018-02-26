// https://raw.githubusercontent.com/infotechinc/password-based-key-derivation-in-browser/master/pbkdf2.js

// Password Based Key Derivation with Web Cryptography API
//
// Copyright (c) 2015 Info Tech, Inc.
// Provided under the MIT license.
// See LICENSE file for details.


const subtleCrypto = window.crypto.subtle

const HEADER_DELIMITER = '================'
const RANDOM_SALT = 'Q^^j(kolegtjqK=6lx1IXc%kxZJk6CDU';

async function deriveKey (password) {
  const iterations = 1000;
  // First, create a PBKDF2 'key' containing the password
  const baseKey = await subtleCrypto.importKey(
    'raw',
    stringToArrayBuffer(password),
    {'name': 'PBKDF2'},
    false,
    ['deriveKey']
  )
  // Derive a key from the password
  return await subtleCrypto.deriveKey({
      'name': 'PBKDF2',
      'salt': stringToArrayBuffer(RANDOM_SALT),
      'iterations': iterations,
      'hash': 'SHA-256'
    },
    baseKey,
    {'name': 'AES-CBC', 'length': 128},
    true,
    ['encrypt', 'decrypt']
  )
}

async function encrypt (plaintext, password) {
  const key = await deriveKey(password)
  const iv = window.crypto.getRandomValues(new Uint8Array(16))
  const encryptedData = await subtleCrypto.encrypt(
    {
      name: "AES-CBC",
      iv,
    },
    key, //from generateKey or importKey above
    stringToArrayBuffer(plaintext) //ArrayBuffer of data you want to encrypt
  )

  return [
    arrayBufferToHexString(iv),
    HEADER_DELIMITER,
    arrayBufferToHexString(encryptedData)
  ].join('\n')
}

async function decrypt (data, password) {
  const key = await deriveKey(password)
  const parts = data.split(HEADER_DELIMITER).map(p => p.trim())
  const iv = hexStringToArrayBuffer(parts[0])
  const message = hexStringToArrayBuffer(parts[1])
  console.log(iv.length, message.length)
  const decryptedData = await subtleCrypto.decrypt(
    {
      name: "AES-CBC",
      iv,
    },
    key, //from generateKey or importKey above
    message //ArrayBuffer of data you want to encrypt
  )
  return arrayBufferToString(decryptedData)
}

// Utility functions
function stringToArrayBuffer(string) {
    const encoder = new TextEncoder('utf-8');
    return encoder.encode(string);
}

function arrayBufferToString(buffer) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
}

function arrayBufferToHexString(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var hexString = "";
    var nextHexByte;

    for (var i=0; i<byteArray.byteLength; i++) {
        nextHexByte = byteArray[i].toString(16);  // Integer to base 16
        if (nextHexByte.length < 2) {
            nextHexByte = "0" + nextHexByte;     // Otherwise 10 becomes just a instead of 0a
        }
        hexString += nextHexByte;
    }
    return hexString;
}

// from https://gist.github.com/tauzen/3d18825ae41ff3fc8981
function hexStringToArrayBuffer(str) {
  if (!str) {
    return new Uint8Array();
  }

  var a = [];
  for (var i = 0, len = str.length; i < len; i+=2) {
    a.push(parseInt(str.substr(i,2),16));
  }

  return new Uint8Array(a);
}

export {encrypt, decrypt}
