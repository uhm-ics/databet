import { Template } from 'meteor/templating';
import { Curricula } from '../../../../api/databet_collections/Curricula';
import { Courses } from '../../../../api/databet_collections/Courses';
import { StudentOutcomes } from '../../../../api/databet_collections/StudentOutcomes';
import { PerformanceIndicators } from '../../../../api/databet_collections/PerformanceIndicators';
import { CurriculumMappings } from '../../../../api/databet_collections/CurriculumMappings';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';


Template.AddCurriculum.onRendered(function () {
  $('.ui.radio.checkbox').checkbox();
});

Template.AddCurriculum.onCreated(function () {

  this.missing_description = new ReactiveVar();
  this.missing_curriculum = new ReactiveVar();
  this.already_exists = new ReactiveVar();
  this.cloning = new ReactiveVar();

  Template.instance().missing_description.set(false);
  Template.instance().missing_curriculum.set(false);
  Template.instance().already_exists.set(false);
  Template.instance().cloning.set(false);

});

Template.AddCurriculum.events({

  'click .cancel': function (e) {
    e.preventDefault();
    Template.currentData().set_to_false_when_done.set(false);
    return false;
  },

  'change #curriculum_select': function (e) {
    if ($('#curriculum_select').val() != "") {
      Template.instance().missing_curriculum.set(false);
    }
  },

  'keydown #description': function (e) {
    Template.instance().already_exists.set(false);
    Template.instance().missing_description.set(false);
  },

  'click #dontCloneButton': function (e) {
    Template.instance().missing_curriculum.set(false);
    Template.instance().cloning.set(false);
  },

  'click #cloneButton': function (e) {
    Template.instance().cloning.set(true);
  },


  'click .submit': function (e) {
    e.preventDefault();

    var description = $('#description').val();
    var clone = $('#clone').is(":checked");
    var cloned_curriculum = null;
    var allGood = true;
    if (!description || (description.length < 5)) {
      Template.instance().missing_description.set(true);
      allGood = false;
    }
    if (clone) {
      cloned_curriculum = $('#curriculum_select').val();
      if (!cloned_curriculum || cloned_curriculum == "") {
        Template.instance().missing_curriculum.set(true);
        allGood = false;
      }
    }

    if (Curricula.findOne({"description": description})) {
      Template.instance().already_exists.set(true);
      allGood = false;
    }

    if (!allGood) {
      return false;
    }

    var new_curriculum = {
      "_id": Random.id(),
      "description": description,
      "date_created": new Date(),
      "locked": false
    };

    Curricula.insert_document(new_curriculum);

    if (Template.instance().cloning.get()) {
      clone_curriculum(cloned_curriculum, new_curriculum._id);
    }

    Template.currentData().set_to_false_when_done.set(false);

    return false;
  }
});


function clone_curriculum(sourceCurriculumId, destCurriculumId) {
  var i, j;

  var course_cloning_map = {};

  // Clone courses
  var to_clone_courses = Courses.find({"curriculum": sourceCurriculumId}).fetch();
  for (i = 0; i < to_clone_courses.length; i++) {
    var cloned_course = {
      "_id": Random.id(),
      "alphanumeric": to_clone_courses[i].alphanumeric,
      "title": to_clone_courses[i].title,
      "curriculum": destCurriculumId
    };
    Courses.insert_document(cloned_course);
    course_cloning_map[to_clone_courses[i]._id] = cloned_course._id;
  }

  var pi_cloning_map = [];

  // Clone outcomes (and performance indicators)
  var to_clone_outcomes = StudentOutcomes.find({"curriculum": sourceCurriculumId}).fetch();
  for (i = 0; i < to_clone_outcomes.length; i++) {
    var cloned_outcome = {
      "_id": Random.id(),
      "description": to_clone_outcomes[i].description,
      "curriculum": destCurriculumId,
      "order": to_clone_outcomes[i].order,
      "critical": to_clone_outcomes[i].critical,
    };

    StudentOutcomes.insert_document(cloned_outcome);
    // Clone performance indicators
    var to_clone_pis = PerformanceIndicators.find({"student_outcome": to_clone_outcomes[i]._id}).fetch();
    for (j = 0; j < to_clone_pis.length; j++) {
      var cloned_pi = {
        "_id": Random.id(),
        "student_outcome": cloned_outcome._id,
        "description": to_clone_pis[j].description,
        "order": to_clone_pis[j].order
      };
      PerformanceIndicators.insert_document(cloned_pi);
      pi_cloning_map[to_clone_pis[j]._id] = cloned_pi._id;
    }
  }

  // Clone Curriculum Mappings
  var to_clone_mappings = CurriculumMappings.find({"curriculum": sourceCurriculumId}).fetch();
  for (i = 0; i < to_clone_mappings.length; i++) {
    var cloned_mapping = {
      "curriculum": destCurriculumId,
      "level": to_clone_mappings[i].level,
      "course": course_cloning_map[to_clone_mappings[i].course],
      "performance_indicator": pi_cloning_map[to_clone_mappings[i].performance_indicator]
    };
    CurriculumMappings.insert_document(cloned_mapping);
  }

}

Template.AddCurriculum.helpers({

  missing_description: function () {
    return Template.instance().missing_description.get();
  },

  missing_curriculum: function () {
    return Template.instance().missing_curriculum.get();
  },

  already_exists: function () {
    return Template.instance().already_exists.get();
  },

  cloning: function () {
    return Template.instance().cloning.get();
  },

  curricula: function () {
    return Curricula.find({}).fetch();
  },

  atLeastOneCurriculum: function () {
    return (Curricula.findOne({}) != null);
  }

});
