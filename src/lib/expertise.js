const DB = require('./db');

exports.getExpertiseById = getExpertiseById;
exports.getExpertiseForAll = getExpertiseForAll
exports.getBocouper = getBocouper;
exports.updateExpertise = updateExpertise;

function getExpertiseById(expertise_id) {
  return DB.raw([
    'SELECT',
    '  e.name AS "Expertise",',
    '  et.name AS "Type",',
    '  ea.name AS "Area"',
    'FROM expertise e',
    'INNER JOIN expertise_area ea ON ea.id=e.expertise_area_id',
    'INNER JOIN expertise_type et ON et.id=e.expertise_type_id',
    'WHERE e.id=?'
  ].join('\n'), [expertise_id]);
}

function getExpertiseForAll(expertise_id) {
  return DB.raw([
    'WITH latest_expertise_log AS (',
    '  SELECT employee_id, expertise_id, MAX(created_at) AS latest',
    '  FROM employee_expertise',
    '  WHERE expertise_id=?',
    '  GROUP BY employee_id, expertise_id',
    ')',
    'SELECT',
    '  e.first AS "First Name",',
    '  e.last AS "Last Name",',
    '  ee.interest_rating AS "Interest",',
    '  ee.experience_rating AS "Experience",',
    '  ee.created_at AS "Last Updated"',
    'FROM latest_expertise_log lel',
    'INNER JOIN employee_expertise ee ON',
    '  ee.employee_id=lel.employee_id AND',
    '  ee.expertise_id=lel.expertise_id AND',
    '  created_at=lel.latest',
    'INNER JOIN employee e ON e.id=ee.employee_id',
    'ORDER BY ee.experience_rating DESC, ee.interest_rating DESC, e.last, e.first'
  ].join('\n'), [expertise_id]);
}

function getBocouper(slackname) {
  return DB.raw([
    'WITH latest_expertise_log AS (',
    '  SELECT ee.employee_id, ee.expertise_id, MAX(ee.created_at) AS latest',
    '  FROM employee_expertise ee',
    '  INNER JOIN employee e ON e.id=ee.employee_id',
    '  WHERE e.slack=?',
    '  GROUP BY employee_id, expertise_id',
    ')',
    'SELECT',
    '  e.first AS "First Name",',
    '  e.last AS "Last Name",',
    '  exp.name AS "Expertise",',
    '  et.name AS "Type",',
    '  ea.name AS "Area",',
    '  ee.interest_rating AS "Interest",',
    '  ee.experience_rating AS "Experience",',
    '  ee.created_at AS "Last Updated"',
    'FROM latest_expertise_log lel',
    'INNER JOIN employee_expertise ee ON',
    '  ee.employee_id=lel.employee_id AND',
    '  ee.expertise_id=lel.expertise_id AND',
    '  created_at=lel.latest',
    'INNER JOIN employee e ON e.id=ee.employee_id',
    'INNER JOIN expertise exp ON exp.id=ee.expertise_id',
    'INNER JOIN expertise_area ea ON ea.id=exp.expertise_area_id',
    'INNER JOIN expertise_type et ON et.id=exp.expertise_type_id',
    'ORDER BY e.last, e.first, et.name, exp.name, ea.name'
  ].join('\n'), [slackname]);
}


function updateExpertise(/*<args>*/) {
  /*
  return DB('employee_expertise').insert({
    employee_id: '<integer>'
    experience_rating: '<1-3>'
    interest_rating: '<1-3>'
    notes: '<text>'
  });
  */
}
