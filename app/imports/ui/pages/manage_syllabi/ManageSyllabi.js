import { Template } from 'meteor/templating';
import { Semesters } from '../../../api/databet_collections/Semesters.js';
import { Courses } from '../../../api/databet_collections/Courses.js';
import { OfferedCourses } from '../../../api/databet_collections/OfferedCourses.js';
import { Meteor } from 'meteor/meteor';
import {semesterid_to_semesterstring} from "../../../api/global_helpers/semesters";
import {get_current_username} from "../../../api/global_helpers/users_and_usernames";
import {UploadedFiles} from "../../../api/databet_collections/UploadedFiles";
import { Random } from 'meteor/random';
import {collection_dictionary} from "../../../startup/both/collection_dictionary";


Template.ManageSyllabi.onCreated(function() {
});

Template.ManageSyllabi.onRendered(function () {

  $('.ui.checkbox').checkbox();

});

Template.ManageSyllabi.helpers({

  "num_uploaded_compliant_syllabi": function() {
    const offered_courses = OfferedCourses.find({}).fetch();
    let count = 0;
    for (let i=0; i < offered_courses.length; i++) {
      let syllabus_id = offered_courses[i].syllabus;
      let compliant = offered_courses[i].syllabus_compliant;
      if (syllabus_id) {
        if (compliant === "yes") {
          count += 1;
        }
      }
    }
    return count;
  },

  "num_uploaded_non_compliant_syllabi": function() {
    const offered_courses = OfferedCourses.find({}).fetch();
    let count = 0;
    for (let i=0; i < offered_courses.length; i++) {
      let syllabus_id = offered_courses[i].syllabus;
      let compliant = offered_courses[i].syllabus_compliant;
      if (syllabus_id) {
        if (compliant === "no") {
          count += 1;
        }
      }
    }
    return count;
  },

  "num_uploaded_tbd_compliant_syllabi": function() {
    const offered_courses = OfferedCourses.find({}).fetch();
    let count = 0;
    for (let i=0; i < offered_courses.length; i++) {
      let syllabus_id = offered_courses[i].syllabus;
      let compliant = offered_courses[i].syllabus_compliant;
      if (syllabus_id) {
        if (compliant === "tbd") {
          count += 1;
        }
      }
    }
    return count;
  },

  "num_missing_syllabi": function() {
      const offered_courses = OfferedCourses.find({}).fetch();
      let count = 0;
      for (let i=0; i < offered_courses.length; i++) {
        let syllabus_id = offered_courses[i].syllabus;
        if (!(syllabus_id)) {
            count += 1;
        }
      }
      return count;
    },

  "listOfOfferedCourses": function() {

    return OfferedCourses.find({}).fetch().sort(function(a,b) {

      // First by semester
      let a_semester_order = Semesters.findOne({"_id":a.semester}).order;
      let b_semester_order = Semesters.findOne({"_id":b.semester}).order;
      if (a_semester_order < b_semester_order) {
        return 1;
      } else if (a_semester_order > b_semester_order) {
        return -1;
      }

      // Then by course
      let a_alpha = Courses.findOne({"_id":a.course}).alphanumeric;
      let b_alpha = Courses.findOne({"_id":b.course}).alphanumeric;
      if (a_alpha < b_alpha) {
        return -1;
      } else if (a_alpha > b_alpha) {
        return 1;
      }

      // Then by instructor
      let a_instructor = Meteor.users.findOne({"_id": a.instructor}).name;
      let b_instructor = Meteor.users.findOne({"_id": b.instructor}).name;
      if (a_instructor < b_instructor) {
        return 1;
      } else if (a_instructor > b_instructor) {
        return -1;
      }

      return 0;

    });
  },

  "get_offered_course_id": function() {
    return this._id;
  }

});


Template.OfferedCourseSyllabusRow.onCreated(function() {
  Template.instance().offered_course = OfferedCourses.findOne({"_id": Template.currentData().offered_course_id});

  Template.instance().previously_uploaded_syllabus = new ReactiveVar();
  Template.instance().previously_uploaded_syllabus.set(Template.instance().offered_course.syllabus);

  Template.instance().new_selected_syllabus_file = new ReactiveVar();
  Template.instance().new_selected_syllabus_file.set(null);


});

Template.OfferedCourseRow.onRendered(function() {
  $('.ui.checkbox').checkbox();
});


Template.OfferedCourseSyllabusRow.helpers({

  "semesterString": function () {

    let semester = Semesters.findOne({"_id": Template.instance().offered_course.semester});
    if (semester.session === "Spring") {
      return "Sp" + semester.year;
    } else if (semester.session === "Fall") {
      return "Fa" + semester.year;
    } else if (semester.session === "Summer") {
      return "Su" + semester.year;
    } else {
      return "???";
    }
  },

  "upload_path_selected": function () {
    return (Template.instance().new_selected_syllabus_file.get() !== null);
  },

  "courseAlpha": function () {
    let course = Courses.findOne({"_id": Template.instance().offered_course.course});
    return course.alphanumeric;
  },

  "courseInstructor": function () {
    return Meteor.users.findOne({"_id": Template.instance().offered_course.instructor}).name;
  },

  "get_syllabus_upload_context": function () {
    return {
      "my_name": name,
      "previously_uploaded_file": Template.instance().previously_uploaded_syllabus,
      "most_recently_selected_file_path": Template.instance().new_selected_syllabus_file
    };
  },

  "uploadedSyllabus": function() {
    return OfferedCourses.findOne({"_id":Template.instance().offered_course._id}).syllabus;
  },

  "my_id": function() {
    return Template.instance().offered_course._id;
  },

  "syllabus_compliant_yes": function() {
    let offered_course_id = Template.instance().offered_course._id;
    return (OfferedCourses.findOne({"_id": offered_course_id}).syllabus_compliant === "yes");
  },

  "syllabus_compliant_no": function() {
    let offered_course_id = Template.instance().offered_course._id;
    return (OfferedCourses.findOne({"_id": offered_course_id}).syllabus_compliant === "no");
  },

  "syllabus_compliant_tbd": function() {
    let offered_course_id = Template.instance().offered_course._id;
    return (OfferedCourses.findOne({"_id": offered_course_id}).syllabus_compliant === "tbd");
    },

    "row_color": function() {
      let offered_course_id = Template.instance().offered_course._id;

      if (OfferedCourses.findOne({"_id":Template.instance().offered_course._id}).syllabus) {

        if (OfferedCourses.findOne({"_id": offered_course_id}).syllabus_compliant === "no") {
          return "error";
        }
        if (OfferedCourses.findOne({"_id": offered_course_id}).syllabus_compliant === "tbd") {
          return "warning";
        }
        return "";
      } else {
        return "error";
      }
    }

});

Template.OfferedCourseSyllabusRow.events({

  "click .upload_syllabus": function (e) {

    // Removing an old file?
    if (Template.instance().offered_course.syllabus) {
      UploadedFiles.remove_document(Template.instance().offered_course.syllabus);
    }

    let fileObj = Template.instance().new_selected_syllabus_file.get();

    let new_file_id = Random.id(); // fake it as an id

    let semester_string = semesterid_to_semesterstring(Template.instance().offered_course.semester);
    semester_string = semester_string.replace(/ /g,'_');
    let course_alpha = Courses.findOne({"_id": Template.instance().offered_course.course}).alphanumeric;
    course_alpha = course_alpha.replace(/ /g,'_');
    let username =get_current_username();

    let prefix = "SYLLABUS:"+semester_string+":"+course_alpha+":"+username;
    UploadedFiles.insert_document(fileObj, new_file_id, prefix);

    // Update the offered course
    OfferedCourses.update_document(Template.instance().offered_course._id, {"syllabus": new_file_id, "syllabus_compliant": "tbd"});

    Template.instance().previously_uploaded_syllabus.set(new_file_id);
    Template.instance().new_selected_syllabus_file.set(null);
  },

  "change .compliant_yes": function(e) {
    // let target_id = e.currentTarget.id;
    // let tokens = target_id.split("_");
    // let id = tokens[tokens.length-1]
    let offered_course = Template.instance().offered_course;
    OfferedCourses.update_document(offered_course._id, {"syllabus_compliant": "yes"});
  },

  "change .compliant_no": function(e) {
    let offered_course = Template.instance().offered_course;
    OfferedCourses.update_document(offered_course._id, {"syllabus_compliant": "no"});
    },

  "change .compliant_tbd": function(e) {
    let offered_course = Template.instance().offered_course;
    OfferedCourses.update_document(offered_course._id, {"syllabus_compliant": "tbd"});
  }



});