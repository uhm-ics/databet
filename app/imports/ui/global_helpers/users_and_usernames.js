/* Wrappers around the get/set global helpers */
import { get_global, set_global } from '../../ui/global_helpers/set_get_globals';
import { _ } from 'meteor/underscore';

export var get_current_user = function () {
  //console.log("Meteor.user=", Meteor.users.findOne({_id: get_global("currentUserId")}));
  return get_global("currentUserId");
};

export var get_current_username = function () {
  var userId = get_global("currentUserId");
  return userid_to_username(userId);
};

export var set_current_user = function (id) {
  set_global("currentUserId", id);
};


export var userid_to_username = function (userId) {
  var user = Meteor.users.findOne({_id: userId});

  // CAS user
  if (user && user.services && ("cas" in user.services)) {
    return user.services.cas.id;
  }

  // Preset user
  if (user && user.services && ("password" in user.services) &&
    (user.emails) && (user.emails[0])) {
    return user.emails[0].address;
  }

  return "unknownuser";
};

var username_to_userid = function (username) {

  var all_users = Meteor.users.find().fetch();
  var userId = null;
  var name = username;

  _.forEach(all_users, function (doc) {
    if (doc.services && ("cas" in doc.services) && (doc.services.cas.id == name)) {
      userId = doc._id;
    } else if (doc.services && ("password" in doc.services) && (doc.emails) && (doc.emails[0]) &&
      (doc.emails[0].address == name)) {
      userId = doc._id;
    }
  });
  return userId;  // Could return null
};


// Global helpers

Template.registerHelper('get_current_user', function () {
  return get_current_user();
});

Template.registerHelper('set_current_user', function (id) {
  return set_current_user(id);
});

Template.registerHelper('get_current_username', function () {
  return get_current_username();
});
