"use strict";
// Class definition

var KTReport = function () {
    var form_element, validator;
    // Private functions
    var report_dropzone = function () {
        // file type validation
        $('#kt_dropzone_report').dropzone({
            url: "https://keenthemes.com/scripts/void.php", // Set the url for your upload script location
            paramName: "file", // The name that will be used to transfer the file
            maxFiles: 10,
            maxFilesize: 10, // MB
            addRemoveLinks: true,
            acceptedFiles: "image/*",
            accept: function(file, done) {
                if (file.name == "justinbieber.jpg") {
                    done("Naha, you don't.");
                } else {
                    done();
                }
            }
        });
    }

    // validator
  	var initValid = function() {
  		validator = form_element.validate({
  			ignore: ':hidden',

  			rules: {
  				fullname: {
  					required: true
  				},
  				identity: {
  					required: true
  				},
  				email: {
  					required: true,
  					email: true
  				},
          priority: {
            required: true
          },
          reportdesc: {
            required: true
          }
  			},
  			messages: {
  				fullname: {
  					required: "To pole jest wymagane."
  				},
          identity: {
            required: "To pole jest wymagane."
          },
  				priority: {
  					required: "To pole jest wymagane."
  				},
  				email: {
  					required: "To pole jest wymagane.",
  					email: "Wprowadź poprawny adres e-mail."
  				},
          reportdesc: {
  					required: "To pole jest wymagane."
  				}
  			},
  			// Display error
  			invalidHandler: function(event, validator) {
  				KTUtil.showNotifyAlert('danger', "Wypełnij wymagane pola i spróbuj ponownie.", 'Wystąpił błąd', 'flaticon-warning-sign');
  			},

  			// Submit valid form
  			submitHandler: function (form) { }
  		});
    }

    return {
        // public functions
        init: function() {
          form_element = $('#app_error');

          report_dropzone();
          initValid();
        }
    };
}();

KTUtil.ready(function() {
    KTReport.init();
});
