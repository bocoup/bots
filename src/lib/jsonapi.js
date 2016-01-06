/**
 * JSON-API parsing utilities
 */
const R = require('ramda');
const bPromise = require('bluebird');
const request = require('request');
const accessToken = require('../../config').creds;

exports.fetch = fetch;
exports.parse = parse;


/**
 * Make a request a JSON API endpoint
 *
 * @param {object} options
 *   An options object valid for the request library
 * @returns {Promise}
 *   The API response.
 */
function fetch (options) {
  options.headers = {
    'Content-Type': 'application/vnd.api+json',
    Accept: 'application/vnd.api+json'
  };
  options.json = true;
  options.qs = options.qs || {}
  options.qs.access_token = accessToken['bocoup-api-token'];
  return new bPromise(function (resolve, reject) {
    request(options, function(error, response, body) {
      if (response.statusCode === 200) {
        return resolve(body);
      }
      reject(body);
    });
  });
}

/**
 * Parse a JSON api response, linking the "included" data.
 *
 * @param {object} input
 *   A JSON-API compatible object.
 * @returns {object}
 *   A JSON-API response with relationships linked.
 */
function parse (input) {
  const relate = _relater.bind(null, input.included||[]);
  if (input.errors) {
    return input;
  }
  return {
    data: _isSingle(input.data) ? relate(input.data) : R.map(relate, input.data)
  };
};

function _isSingle (input) { return !Array.isArray(input); };
function _linkRelated (included, entry) {
  const result = R.find(R.allPass([
    R.propEq('type', entry.type),
    R.propEq('id', entry.id)
  ]), included);
  return result ? result : entry;
}
function _relater (included, entry) {
  var relationships = entry.relationships;
  if (relationships) {
    relationships = R.map(function (relation) {
      if (relation.data) {
        if (_isSingle(relation.data)) {
          relation.data = _linkRelated(included, relation.data);
        } else {
          relation.data = R.map(function (relEntry) {
            return _linkRelated(included, relEntry);
          }, relation.data);
        }
      }
      return relation;
    }, relationships);
  }
  return entry;
}
