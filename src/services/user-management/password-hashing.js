import crypto from 'crypto';
import Promise from 'bluebird';

// Add Promise returning funtions to crypto lib
Promise.promisifyAll(crypto);

// These constants can change without breaking existing hashes that are stored somewhere
const SALT_BYTES = 24;
const HASH_BYTES = 24;
const PBKDF2_ITERATIONS = 1000;
const DIGEST = 'sha1';

// These constants can NOT be changed
const DIGEST_IDX = 0;
const ITERATION_IDX = 1;
const SALT_IDX = 2;
const HASH_IDX = 3;

/**
 * Do a length-constant time comparison between two node Buffers.
 */
function slowEquals(a, b) {
  let diff = a.length ^ b.length;
	for (let i = 0; i < a.length && i < b.length; i++) {
		diff |= a[i] ^ b[i];
	}
	return diff === 0;
}

/**
 * Creates a salted PBKDF2 password hash for the specified password. Returns a
 * Promise that resolves to a string with the hashed password.
 */
export function createHashAsync(password) {
  // Generate a random salt
  let saltPromise = crypto.randomBytesAsync(SALT_BYTES);

  // Hash the password
  let hashPromise = saltPromise.then(saltBuffer => {
    return crypto.pbkdf2Async(password, saltBuffer, PBKDF2_ITERATIONS, HASH_BYTES, DIGEST);
  });

  return Promise.join(saltPromise, hashPromise, (saltBuffer, hashBuffer) => {
    // Concat salt and hash as base64 encoded strings into final result
    return `${DIGEST}:${PBKDF2_ITERATIONS}:${saltBuffer.toString('base64')}:${hashBuffer.toString('base64')}`;
  });
};

/**
 * Validates the given password against a hash that is known to be good. Returns
 * a Promise that resolves to true/false indicating whether the password is valid.
 */
export function validatePasswordAsync(password, goodHash) {
  // Take the good hash and split into its parts
  let hashPartsPromise = Promise.try(() => {
    let hashParts = goodHash.split(':');
    if (hashParts.length !== 4) 
      throw new Error('Invalid good hash');
    return hashParts;
  });

  // Hash the password provided
  let hashPromise = hashPartsPromise.then(hashParts => {
    let digest = hashParts[DIGEST_IDX];
    let iterations = parseInt(hashParts[ITERATION_IDX]);
    let salt = new Buffer(hashParts[SALT_IDX], 'base64');
    let hash = new Buffer(hashParts[HASH_IDX], 'base64');
    return crypto.pbkdf2Async(password, salt, iterations, hash.length, digest);
  });

  // Compare the password hash to the known good hash
  return Promise.join(hashPartsPromise, hashPromise, (hashParts, hashBuffer) => {
    let goodHashBuffer = new Buffer(hashParts[HASH_IDX], 'base64');
    return slowEquals(goodHashBuffer, hashBuffer);
  });
};