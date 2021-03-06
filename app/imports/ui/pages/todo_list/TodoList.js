import { OfferedCourses } from '../../../api/databet_collections/OfferedCourses';
import { Courses } from '../../../api/databet_collections/Courses';
import { Semesters } from '../../../api/databet_collections/Semesters';
import { AssessmentItems } from '../../../api/databet_collections/AssessmentItems';
import { _ } from 'meteor/underscore';
import { get_current_user } from '../../../api/global_helpers/users_and_usernames';
import { Meteor } from 'meteor/meteor';

Template.TodoList.onCreated(function () {
  // Use this.subscribe inside onCreated callback
  this.subscribe("Meteor.users");
  this.subscribe("Semesters");
  this.subscribe("Curricula");
  // this.subscribe("StudentOutcomes");
  // this.subscribe("PerformanceIndicators");
  this.subscribe("Courses");
  // this.subscribe("CurriculumMappings");
  this.subscribe("OfferedCourses");
  this.subscribe("AssessmentItems");
  // this.subscribe("UploadedFiles");

});


Template.TodoList.helpers({

  "listOfOfferedCourses": function () {
    var offered_courses = OfferedCourses.find({"instructor": get_current_user(), "archived": false, "toassess": true}).fetch();

    offered_courses.sort(function (a, b) {
      var semester_order_a = Semesters.findOne({"_id": a.semester}).order;
      var semester_order_b = Semesters.findOne({"_id": b.semester}).order;

      if (semester_order_a < semester_order_b) {
        return 1;
      } else if (semester_order_a > semester_order_b) {
        return -1;
      } else {
        var course_a = Courses.findOne({"_id": a.course}).alphanumeric;
        var course_b = Courses.findOne({"_id": b.course}).alphanumeric;
        if (course_a < course_b) {
          return 1;
        } else {
          return -1;
        }
      }
    });

    return offered_courses;
  },

  "atLeastOneOfferedCourse": function () {
    return (OfferedCourses.find({"instructor": get_current_user(), "archived": false}).count() > 0);
  },


});

Template.OfferedCourseRow.onRendered(function () {
  $('.buttonpopup')
    .popup();
});

//noinspection JSUnusedLocalSymbols
Template.OfferedCourseRow.events({

  "click .archive_course": function (e) {
	  OfferedCourses.update_document(this._id, {"archived": true});
  }

});

//noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols,JSUnusedLocalSymbols
Template.OfferedCourseRow.helpers({

  "semester_string": function (e) {
    var semester_id = this.semester;
    var semester = Semesters.findOne({"_id": semester_id});
    return semester.session + " " + semester.year;
  },

  "course_alphanumeric": function (e) {
    var course_id = this.course;
    var course = Courses.findOne({"_id": course_id});
    return course.alphanumeric;
  },

  "num_assessment_items": function (e) {
    return AssessmentItems.find({"offered_course": this._id}).count();
  },

  "is_there_at_least_one_assessment_item": function (e) {
    return AssessmentItems.find({"offered_course": this._id}).count() > 0;
  },

  "popup_info": function (e) {
    var assessment_items = AssessmentItems.find({"offered_course": this._id}).fetch();
    return _.pluck(assessment_items, "assessment_type");
  }

});
