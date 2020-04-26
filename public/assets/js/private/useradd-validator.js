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
        var fullname = $("#firstname").val() + ' ' + $("#lastname").val(),
				psCity = $('#postcode').val() + ' ' + $('#city').val();
        $("#fullnameP").html(fullname);
        $("#emailP").html($("#email").val());
        $("#telephoneP").html($("#telephone").val());
				$("#addressP").html($("#address").val());
				$("#psCity").html(psCity);
				$("#voivodeshipP").html($("#voivodeship").val());
				$("#countryP").html($("#country").val());
				if($("#isCompany").is(':checked')) $("#isCompanyP").html("Tak");
				else $("#isCompanyP").html("Nie");

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
		$('[name="pesel"],[name="cregon"],[name="cnip"]').maxlength({
        warningClass: "kt-badge kt-badge--warning kt-badge--rounded kt-badge--inline",
        limitReachedClass: "kt-badge kt-badge--success kt-badge--rounded kt-badge--inline",
				appendToParent: true
    });

		$("#postcode").inputmask({
				"mask": "99-999",
				placeholder: "" // remove underscores from the input mask
		});

		$("#company_data").hide();

		$('#isCompany').on('change',function(e) {
			if($(this).is(':checked')) {
 				$('#company_data').show();
				modalEl.find('[name="cname"]').val('');
				modalEl.find('[name="cnip"]').val('');
				modalEl.find('[name="cregon"]').val('');
			}
			else $('#company_data').hide();
		});

		$('select[name="urole"]').on('change', function(e) {
			if($(this).val() == 'kierownik') {
				$('#partnerHide').show();
			} else {
				$('#partnerHide').hide();
			}
		});

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
				pesel: {
					required: true,
					digits: true,
					minlength: 11,
					maxlength: 11
				},
				cname: {
					required: true
				},
				cnip: {
					required: true,
					digits: true,
					minlength: 10,
					maxlength: 10
				},
				cregon: {
					digits: true,
					maxlength: 15
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
				address: {
					required: true
				},
				postcode: {
					required: true
				},
				city: {
					required: true
				},
				voivodeship: {
					required: true
				},
				country: {
					required: true
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
				pesel: {
					required: "To pole jest wymagane.",
					digits: "To pole może składać się jedynie z cyfr.",
					minlength: "Numer PESEL musi składać się z {0} cyfr.",
					maxlength: "Numer PESEL musi składać się z {0} cyfr."
				},
				cname: {
					required: "To pole jest wymagane."
				},
				cnip: {
					required: "To pole jest wymagane.",
					digits: "To pole może składać się jedynie z cyfr.",
					minlength: "Numer NIP musi składać się z {0} cyfr.",
					maxlength: "Numer NIP musi składać się z {0} cyfr."
				},
				cregon: {
					digits: "To pole może składać się jedynie z cyfr.",
					maxlength: "Numer REGON musi składać się z {0} cyfr."
				},
        pNumber: {
          required: 'To pole jest wymagane.',
          digits: 'Numer telefonu może zawierać tylko cyfry.',
          minlength: 'Numer telefonu musi składać się z minimalnie {0} cyfr.',
          maxlength: 'Numer telefonu musi składać się z maksymalnie {0} cyfr.'
        },
				address: {
					required: 'To pole jest wymagane.'
				},
				postcode: {
					required: 'To pole jest wymagane.'
				},
				city: {
					required: 'To pole jest wymagane.'
				},
				voivodeship: {
					required: 'To pole jest wymagane.'
				},
				country: {
					required: 'To pole jest wymagane.'
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
			e.stopPropagation();

			if (validator.form()) {
				// See: src\js\framework\base\app.js
				KTApp.progress(btn);
				btn.attr('disabled', true);
				//KTApp.block(formEl);

				// See: http://malsup.com/jquery/form/#ajaxSubmit
        setTimeout(function() {
          formEl.ajaxSubmit({
            url: '/rest/users/add',
            method: 'POST',
            data: formEl.serialize(),
            clearForm: false,
  					success: function(res) {
							KTApp.unprogress(btn);
							btn.attr('disabled', false);
  						//KTApp.unblock(formEl);
              if(res.status == 'success') {
                KTUtil.showNotifyAlert('success', res.message, 'Udało się!', 'flaticon2-checkmark');
								KTUtil.clearInputInForm(formEl);
                wizard.goTo(1, true);
								//
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
			$('#partnerHide').hide();

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
