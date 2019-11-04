"use strict";

// Class definition
var KTWizardOfferAdd = function () {
	// Base elements
	var wizardEl;
	var formEl;
	var validator;
	var wizard;

	// Private functions
	var initWizard = function () {
		// Initialize form wizard
		wizard = new KTWizard('kt_offer_add', {
			startStep: 1
		});

		// Validation before going to next page
		wizard.on('beforeNext', function(wizardObj) {
			if (validator.form() !== true) {
				wizardObj.stop();  // don't go to the next step
			}
		});

		wizard.on('beforePrev', function(wizardObj) {
			if (validator.form() !== true) {
				wizardObj.stop();  // don't go to the next step
			}
		});

		// Change event
		wizard.on('change', function(wizard) {

		});
	}

	var initValidation = function() {
    $("#pyear").inputmask('9999');
    $("#price_netto").inputmask('999.999.999,99 PLN', { numericInput: true });

		validator = formEl.validate({
			// Validate only visible fields
			ignore: ":hidden",

			// Validation rules
			rules: {
				//= Step 1
				offer_type: {
          required: true
        },
				postcode: {
					required: true
				},
				city: {
					required: true
				},
				state: {
					required: true
				},
				country: {
					required: true
				},

				//= Step 2
				company_id: {
					required: true
				},
				client_id: {
					required: true
				},
				width: {
					required: true
				},
				height: {
					required: true
				},
				length: {
					required: true
				},

				//= Step 3
				delivery: {
					required: true
				},
				packaging: {
					required: true
				},
				preferreddelivery: {
					required: true
				},

				//= Step 4
				locaddress1: {
					required: true
				},
				locpostcode: {
					required: true
				},
				loccity: {
					required: true
				},
				locstate: {
					required: true
				},
				loccountry: {
					required: true
				},
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
		var btn = formEl.find('[data-ktwizard-type="action-submit"]');

		btn.on('click', function(e) {
			e.preventDefault();

			if (validator.form()) {
				// See: src\js\framework\base\app.js
				KTApp.progress(btn);
				//KTApp.block(formEl);

				// See: http://malsup.com/jquery/form/#ajaxSubmit
				formEl.ajaxSubmit({
					success: function() {
						KTApp.unprogress(btn);
						//KTApp.unblock(formEl);

						swal.fire({
							"title": "",
							"text": "The application has been successfully submitted!",
							"type": "success",
							"confirmButtonClass": "btn btn-secondary"
						});
					}
				});
			}
		});
	}

  var initRemoteData = function() {
		var data = [], data2 = [];

		$.ajax({
			url: '/rest/client/remotelist',
			method: 'GET',
			data: {},
			success: function(res) {
				if(res.status == null) {
					for(var i = 0; i < res.length; i++) data.push({ id: res[i].id, text: res[i].fullname + ', ' + (res[i].company == 0 ? 'osoba fizyczna' : 'spółka') });

					$('#clientsRemote').select2({
						placeholder: "Wybierz klienta",
						width: '100%',
						data: data
					});
				}
			},
			error: function(err) {
				console.log('Błąd wczytywania');
			}
		});

    $.ajax({
			url: '/rest/company/remotelist',
			method: 'GET',
			data: {},
			success: function(res) {
				if(res.status == null) {
					for(var i = 0; i < res.length; i++) data2.push({ id: res[i].id, text: res[i].fullname });

					$('#companiesRemote').select2({
						placeholder: "Wybierz firmę",
						width: '100%',
						data: data2
					});
				}
			},
			error: function(err) {
				console.log('Błąd wczytywania');
			}
		});
	}

  var initRepeater = function() {
    $('#leasing_variants').repeater({
        initEmpty: false,
        defaultValues: {
            'text-input': 'foo'
        },
        show: function () {
            $(this).slideDown();
        },
        hide: function (deleteElement) {
            $(this).slideUp(deleteElement);
        },
        isFirstItemUndeletable: true
    });
}

	return {
		// public functions
		init: function() {
			wizardEl = KTUtil.get('kt_offer_add');
			formEl = $('#kt_offer_form');

			initWizard();
			initValidation();
			initSubmit();
      initRemoteData();
      initRepeater();
		}
	};
}();

jQuery(document).ready(function() {
	KTWizardOfferAdd.init();
});
