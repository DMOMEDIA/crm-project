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

    $('input[name="client_type"]').on('change', function(e) {
      var val = $('input[name="client_type"]:checked');
      if(val.val() == 0) {
        $('#private_client').show();
				$('#corp_client').hide();
        $('#company_client').hide();
      } else if(val.val() == 1) {
				$('#private_client').hide();
				$('#corp_client').show();
        $('#company_client').hide();
      } else {
				$('#private_client').hide();
				$('#corp_client').hide();
        $('#company_client').show();
			}
    });

		// Change event
		wizard.on('change', function(wizard) {
      if(wizard.getStep() == 3) {
        $("#client_typeP").html($('input[name="client_type"]:checked').data('name'));

        if($('input[name="client_type"]:checked').val() == 0) {
					$('#p_client').show();
					$('#c_client').hide();
					$('#co_client').hide();
					//
          var fullname = $('input[name="firstname"]').val() + ' ' + $('input[name="lastname"]').val();
          $("#fullnameP").html(fullname);
        } else if($('input[name="client_type"]:checked').val() == 1) {
					$('#p_client').hide();
					$('#cp_client').show();
					$('#co_client').hide();
					//
          $('#corpNameP').html($('input[name="corpName"]').val());
					$('#corp_typeP').html($('select[name="corp_type"] option:selected').text());
					$('#corp_regonP').html($('input[name="corp_regon"]').val());
        } else {
					$("#p_client").hide();
					$("#cp_client").hide();
					$("#co_client").show();
					//
          $('#companyNameP').html($('input[name="companyName"]').val());
					$('#company_regonP').html($('input[name="company_regon"]').val());
				}
				$('#nipP').html($('input[name="nip"]').val());
				$('#emailP').html($('input[name="email"]').val());
				$('#phoneP').html($('input[name="phone"]').val());
				if($('input[name="data_processing"]:checked').val() == 1)
					$('#data_processP').html('TAK');
				else $('#data_processP').html('NIE');
				if($('input[name="data_marketing"]:checked').val() == 1)
					$('#marketingP').html('TAK');
				else $('#marketingP').html('NIE');

				$("#employeeP").html($("#remoteEmployeer option:selected").text());
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
        corpName: {
          required: true
        },
				corp_type: {
					required: true
				},
				corp_regon: {
					digits: true,
					maxlength: 15
				},
				companyName: {
					required: true
				},
				company_regon: {
					digits: true,
					maxlength: 15
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
				data_processing: {
					required: true
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
				corpName: {
          required: 'To pole jest wymagane.'
        },
				corp_type: {
					required: 'To pole jest wymagane.'
				},
				corp_regon: {
					digits: 'Numer REGON może zawierać jedynie cyfry.',
					maxlength: 'Numer REGON może składać się jedynie z {0} cyfr.'
				},
				companyName: {
					required: 'To pole jest wymagane.'
				},
				company_regon: {
					digits: 'Numer REGON może zawierać jedynie cyfry.',
					maxlength: 'Numer REGON może składać się jedynie z {0} cyfr.'
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
				data_processing: {
					required: 'To pole jest wymagane.'
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
