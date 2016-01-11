const DB = require('./db');

exports.getExpertiseById = function getExpertiseById(expertise_id) {
  return DB.queries.expertise_by_id(expertise_id);
};

exports.getExpertiseForAll = function getExpertiseForAll(expertise_id) {
  return DB.queries.expertise_for_all(expertise_id);
};

exports.getBocouper = function getBocouper(slackname) {
  return DB.queries.expertise_by_bocouper(slackname);
};

exports.updateExpertise = function updateExpertise(slackname, expertise_id, experience_rating, interest_rating, notes) {
  return DB.queries.update_expertise.apply(null, [
    slackname,
    expertise_id,
    experience_rating,
    interest_rating,
    notes
  ]);
};
