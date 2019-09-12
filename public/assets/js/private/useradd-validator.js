"use strict";

// Class definition
var KTUserAdd = function () {
	// Base elements
	var wizardEl;
	var formEl;
	var validator;
	var wizard;
	var avatar;

	// Private functions
	var initWizard = function () {
		// Initialize form wizard
		wizard = new KTWizard('kt_user_add_user', {
			startStep: 1,
		});

		// Validation before going to next page
		wizard.on('beforeNext', function(wizardObj) {
			if (validator.form() !== true) {
				wizardObj.stop();  // don't go to the next step
			}
		})

		// Change event
		wizard.on('change', function(wizard) {
      if(wizard.getStep() == 2) {
        var identity = 'IDCRM-' + Math.random().toString().substr(2,6);
        $("#gen-identity").val(identity).prop('disabled',true);
      } else if(wizard.getStep() == 3) {
        var fullname = $("#firstname").val() + ' ' + $("#lastname").val();
        $("#fullnameP").html(fullname);
        $("#emailP").html($("#email").val());
        $("#telephoneP").html($("#telephone").val());

        $("#identityP").html($("#gen-identity").val());
        $("#roleP").html($("#roleL").val());

        $("#gen-identity").prop('disabled',false);
      }
		});
	}

  var passwordCopy = function () {
    $("#copy-password").click(function() {
      copyToClipboard($("#password").val());
      KTUtil.showNotifyAlert('success', 'Skopiowano do schowka');
    });

    function copyToClipboard(text) {
      var $temp = $("<input>");
      $("body").append($temp);
      $temp.val(text).select();
      document.execCommand("copy");
      $temp.remove();
    }
  }

  var togglePassword = function () {
    $("#show-password").click(function() {
      if($("#password").attr('type') === 'text') {
        $("#password").attr('type', 'password');
        $("#confirm-password").attr('type', 'password');
        $('span').find('.la.la-eye').toggleClass('la-eye la-eye-slash');
      } else {
        $("#password").attr('type', 'text');
        $("#confirm-password").attr('type', 'text');
        $('span').find('.la.la-eye-slash').toggleClass('la-eye-slash la-eye');
      }
    });

    $("#show-password,#copy-password,#refresh-password").hover(function() {
      $(this).css('cursor','pointer');
    }, function() {
      $(this).css('cursor','auto');
    });
  }

  var refreshPassword = function () {
    $('#refresh-password').pGenerator({
      'bind': 'click',
      'passwordElement': '#password',
      'displayElement': '#confirm-password',
      'passwordLength': 10,
      'uppercase': true,
      'lowercase': true,
      'numbers':   true,
      'specialChars': true,
      'additionalSpecialChars': [],
      'onPasswordGenerated': function(generatedPassword) { }
    });
  }

	var initValidation = function() {
		validator = formEl.validate({
			// Validate only visible fields
			ignore: ":hidden",

			// Validation rules
			rules: {
				// Step 1
				firstname: {
  				required: true
				},
				lastname: {
					required: true
				},
				email: {
					required: true,
          email: true
				},
				pNumber: {
					required: true,
          digits: true,
          minlength: 3,
          maxlength: 9
				},
        // Step 2
        urole: {
          required: true
        },
        password: {
          minlength: 8,
          pwcheck: true
        },
        confirm_password: {
          minlength: 8,
          equalTo: "#password"
        }
			},
      messages: {
        firstname: {
          required: 'To pole jest wymagane.'
        },
        lastname: {
          required: 'To pole jest wymagane.'
        },
        email: {
          required: 'To pole jest wymagane.',
          email: 'Wprowadź poprawny adres e-mail.'
        },
        pNumber: {
          required: 'To pole jest wymagane.',
          digits: 'Numer telefonu może zawierać tylko cyfry.',
          minlength: 'Numer telefonu musi składać się z minimalnie {0} cyfr.',
          maxlength: 'Numer telefonu musi składać się z maksymalnie {0} cyfr.'
        },
        password: {
          minlength: "Hasło musi składać się z minimum {0} znaków.",
          pwcheck: "Hasło musi posiadać:</br>- przynajmniej jedną wielką literę,</br>- minimum 8 znaków,</br>- jedną małą literę,</br>- jedną cyfrę,</br>- jeden znak symboliczny"
        },
        confirm_password: {
          minlength: "Hasło musi składać się z minimum {0} znaków.",
          equalTo: "Hasła muszą być takie same."
        },
        urole: {
          required: 'To pole jest wymagane.'
        }
      },

			// Display error
			invalidHandler: function(event, validator) {
				KTUtil.scrollTop();

        KTUtil.showNotifyAlert('danger', 'Uzupełnij wymagane pola', 'Wystąpił błąd', 'flaticon-warning-sign');
				/* swal.fire({
					"title": "",
					"text": "There are some errors in your submission. Please correct them.",
					"type": "error",
					"buttonStyling": false,
					"confirmButtonClass": "btn btn-brand btn-sm btn-bold"
				}); */
			},

			// Submit valid form
			submitHandler: function (form) {
        console.log('submitted');
			}
		});

    $.validator.addMethod("pwcheck", function(value) {
       return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!|~?\{\}\-.,\\/_+\(\)\:\]\[\;@#\$%\^&\*])(?=.{8,})/.test(value) // consists of only these
    });
	}

	var initSubmit = function() {
		var btn = formEl.find('[data-ktwizard-type="action-submit"]');

		btn.on('click', function(e) {
			e.preventDefault();

			if (validator.form()) {
				// See: src\js\framework\base\app.js
				KTApp.progress(btn);
				//KTApp.block(formEl);

				// See: http://malsup.com/jquery/form/#ajaxSubmit
        setTimeout(function() {
          formEl.ajaxSubmit({
            url: '/rest/users/add',
            method: 'POST',
            data: formEl.serialize(),
            clearForm: true,
  					success: function(res) {
  						KTApp.unprogress(btn);
  						//KTApp.unblock(formEl);
              if(res.status == 'success') {
                KTUtil.showNotifyAlert('success', res.message, 'Udało się!', 'flaticon2-checkmark');
                wizard.goTo(1, true);
              } else {
                KTUtil.showNotifyAlert('danger', res.message, 'Coś jest nie tak..', 'flaticon-warning-sign');
              }
            },
            error: function(err) {
              KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś jest nie tak..', 'flaticon-warning-sign');
            }
  				});
        }, 1000);
			}
		});
	}

	var initUserForm = function() {
		avatar = new KTAvatar('kt_user_add_avatar');
	}

	return {
		// public functions
		init: function() {
			formEl = $('#kt_user_add_form');

			initWizard();
			initValidation();
			initSubmit();
			initUserForm();
      togglePassword();
      refreshPassword();
      passwordCopy();
		}
	};
}();

jQuery(document).ready(function() {
	KTUserAdd.init();
});
