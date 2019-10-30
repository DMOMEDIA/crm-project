"use strict";

// Class definition
var KTClientAdd = function () {
	// Base elements
	var wizardEl;
	var formEl;
	var validator;
	var wizard;
	var avatar;

	// Private functions
	var initWizard = function () {
    $('#nipI').maxlength({
        warningClass: "kt-badge kt-badge--warning kt-badge--rounded kt-badge--inline",
        limitReachedClass: "kt-badge kt-badge--success kt-badge--rounded kt-badge--inline",
				appendToParent: true
    });

    $('#peselI').maxlength({
        warningClass: "kt-badge kt-badge--warning kt-badge--rounded kt-badge--inline",
        limitReachedClass: "kt-badge kt-badge--success kt-badge--rounded kt-badge--inline",
				appendToParent: true
    });

		// Initialize form wizard
		wizard = new KTWizard('kt_client_add_client', {
			startStep: 1,
		});

		// Validation before going to next page
		wizard.on('beforeNext', function(wizardObj) {
			if (validator.form() !== true) {
				wizardObj.stop();  // don't go to the next step
			}
		})

    var acctype = $('input[type="radio"][name="client_type"]');

    $('#company_client').hide();
    acctype.on('change', function(e) {
      var val = $('input[type="radio"][name="client_type"]:checked');

      if(val.val() == 0) {
        $('#private_client').show();
        $('#company_client').hide();
      } else {
        $('#private_client').hide();
        $('#company_client').show();
      }
    });

		// Change event
		wizard.on('change', function(wizard) {
      if(wizard.getStep() == 3) {
        if($('input[type="radio"][name="client_type"]:checked').val() == 0) {
          $("#peselHide").show();
          $("#nipHide").hide();
          var fullname = $("#firstnameI").val() + ' ' + $("#lastnameI").val();
          $("#client_typeP").html($('input[type="radio"][name="client_type"]:checked').data('name'));
          $("#fullnameP").html(fullname);
          $("#peselP").html($("#peselI").val());
          $("#emailP").html($("#emailI").val());
          $("#phoneP").html($("#phoneI").val());

          $("#employeeP").html($("#remoteEmployeer option:selected").text());
        } else {
          $("#peselHide").hide();
          $("#nipHide").show();
          $("#fullnameP").html($("#companyNameI").val());
          $("#client_typeP").html($('input[type="radio"][name="client_type"]:checked').data('name'));
          $("#nipP").html($("#nipI").val());
          $("#emailP").html($("#emailI").val());
          $("#phoneP").html($("#phoneI").val());

          $("#employeeP").html($("#remoteEmployeer option:selected").text());
        }
      }
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
        companyName: {
          required: true
        },
        pesel: {
          required: true,
          digits: true,
          minlength: 11,
          maxlength: 11
        },
        nip: {
          required: true,
          digits: true,
          minlength: 10,
          maxlength: 10
        },
				email: {
					required: true,
          email: true
				},
				phone: {
					required: true,
          digits: true,
          minlength: 3,
          maxlength: 9
				},
        // Step 2
        param: {
          required: true
        }
			},
      messages: {
        firstname: {
          required: 'To pole jest wymagane.'
        },
        lastname: {
          required: 'To pole jest wymagane.'
        },
        companyName: {
          required: 'To pole jest wymagane.'
        },
        pesel: {
          required: 'To pole jest wymagane.',
          digits: 'Numer PESEL może zawierać jedynie cyfry.',
          minlength: 'Numer PESEL musi składać się z {0} cyfr.',
          maxlength: 'Numer PESEL musi składać się z {0} cyfr.'
        },
        nip: {
          required: 'To pole jest wymagane.',
          digits: 'Numer NIP może zawierać jedynie cyfry.',
          minlength: 'Numer NIP musi składać się z {0} cyfr.',
          maxlength: 'Numer NIP musi składać się z {0} cyfr.'
        },
        email: {
          required: 'To pole jest wymagane.',
          email: 'Wprowadź poprawny adres e-mail.'
        },
        phone: {
          required: 'To pole jest wymagane.',
          digits: 'Numer telefonu może zawierać tylko cyfry.',
          minlength: 'Numer telefonu musi składać się z minimalnie {0} cyfr.',
          maxlength: 'Numer telefonu musi składać się z maksymalnie {0} cyfr.'
        },
        param: {
          required: 'To pole jest wymagane.'
        }
      },

			// Display error
			invalidHandler: function(event, validator) {
				KTUtil.scrollTop();

        KTUtil.showNotifyAlert('danger', 'Uzupełnij wymagane pola', 'Wystąpił błąd', 'flaticon-warning-sign');
			},

			// Submit valid form
			submitHandler: function (form) { }
		});
	}

  var remoteEmploy = function() {
		var data = [];

		$.ajax({
			url: '/rest/users/name',
			method: 'GET',
			data: {},
			success: function(res) {
				if(res.status == null) {
					for(var i = 0; i < res.length; i++) data.push({ id: res[i].id, text: res[i].fullname + ', ' + res[i].role });

					$('#remoteEmployeer').select2({
						placeholder: "Wybierz pracownika",
						width: '100%',
						data: data
					});
				}
			},
			error: function(err) {
				console.log('Błąd wczytywania');
			}
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

        setTimeout(function() {
          formEl.ajaxSubmit({
            url: '/rest/clients/add',
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
								wizard.goTo(1, true);
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

	return {
		// public functions
		init: function() {
			formEl = $('#kt_form_personal');

			initWizard();
			initValidation();
      remoteEmploy();
			initSubmit();
		}
	};
}();

jQuery(document).ready(function() {
	KTClientAdd.init();
});
