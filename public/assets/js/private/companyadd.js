"use strict";

// Class definition
var KTCompanyAdd = function () {
	// Base elements
	var formEl;
	var validator;

	var initValidation = function() {
		$('#p_leasing').inputmask('9[9].9[9]', { placeholder: '0' });
	  $('#p_rent').inputmask('9[9].9[9]', { placeholder: '0' });

    $('#nipInput').maxlength({
        warningClass: "kt-badge kt-badge--warning kt-badge--rounded kt-badge--inline",
        limitReachedClass: "kt-badge kt-badge--success kt-badge--rounded kt-badge--inline",
				appendToParent: true
    });

		validator = formEl.validate({
			// Validate only visible fields
			ignore: ":hidden",

			// Validation rules
			rules: {
				// Step 1
				companyName: {
  				required: true
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
					maxlength: 13
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
				firstname_k: {
					required: true
				},
				lastname_k: {
					required: true
				},
				email_k: {
					required: true,
					email: true
				},
				phone_k: {
					required: true,
					digits: true,
					maxlength: 13
				},
				provision_leasing: {
					required: true
				},
				provision_rent: {
					required: true
				}
			},
      messages: {
        companyName: {
          required: 'To pole jest wymagane.'
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
					maxlength: 'Numer telefonu może składać się z maksymalnie {0} cyfr.'
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
				firstname_k: {
					required: 'To pole jest wymagane.'
				},
				lastname_k: {
					required: 'To pole jest wymagane.'
				},
				email_k: {
					required: 'To pole jest wymagane.',
					email: 'Wprowadź poprawny adres e-mail.'
				},
				phone_k: {
					required: 'To pole jest wymagane.',
					digits: 'Numer telefonu może zawierać tylko cyfry.',
					maxlength: 'Numer telefonu może składać się z maksymalnie {0} cyfr.'
				},
				provision_leasing: {
					required: 'To pole jest wymagane.'
				},
				provision_rent: {
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

	var initSubmit = function() {
		var btn = formEl.find('[name="save_company"]');

		btn.on('click', function(e) {
			e.preventDefault();

			if (validator.form()) {
				// See: src\js\framework\base\app.js
				KTApp.progress(btn);
				btn.attr('disabled', true);
				//KTApp.block(formEl);

        setTimeout(function() {
          formEl.ajaxSubmit({
            url: '/rest/company/add',
            method: 'POST',
            data: formEl.serialize(),
            clearForm: true,
  					success: function(res) {
  						KTApp.unprogress(btn);
							btn.attr('disabled', false);
  						//KTApp.unblock(formEl);
              if(res.status == 'success') {
                KTUtil.showNotifyAlert('success', res.message, 'Udało się!', 'flaticon2-checkmark');
                KTUtil.scrollTop();
              } else {
                KTUtil.showNotifyAlert('danger', res.message, 'Coś jest nie tak..', 'flaticon-warning-sign');
								KTUtil.scrollTop();
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
			formEl = $('#kt_form_company');

			initValidation();
			initSubmit();
		}
	};
}();

jQuery(document).ready(function() {
	KTCompanyAdd.init();
});
