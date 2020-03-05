"use strict";

// Class Definition
var KTLogin = function () {

	var login = $('#kt_login'), form_recovery, recovery_validator;

	var showErrorMsg = function (form, type, msg) {
		var alert = $('<div class="kt-alert kt-alert--outline alert alert-' + type + ' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"></button><span></span></div>');

		form.find('.alert').remove();
		alert.prependTo(form);
		//alert.animateClass('fadeIn animated');
		KTUtil.animateClass(alert[0], 'fadeIn animated');
		alert.find('span').html(msg);
	}

	// Private Functions

	var initValidation = function() {
		recovery_validator = form_recovery.validate({
			ignore: ':hidden',

			rules: {
				email: {
					required: true,
					email: true
				}
			},
			messages: {
				email: {
					required: 'To pole jest wymagane.',
					email: 'Musisz podać poprawny adres e-mail.'
				}
			}
		});
	}

	var recoveryPassword = function() {
		$('#send_newpassword').on('click', function(e) {
			e.preventDefault();

			var btn = $(this);

			if(recovery_validator.form()) {
				KTApp.progress(btn);
				btn.attr('disabled', true);
				form_recovery.ajaxSubmit({
					url: '/rest/user/recovery_pwd',
					method: 'POST',
					data: form_recovery.serialize(),
					clearForm: true,
					success: function(res) {
						KTApp.unprogress(btn);
						btn.attr('disabled', false);

						if(res.status == 'success') {
							swal.fire({
								text: res.message,
								type: res.status,
								confirmButtonText: "Zamknij",
								confirmButtonClass: "btn btn-sm btn-bold btn-brand",
							});
						} else {
							swal.fire({
								text: res.message,
								type: res.status,
								confirmButtonText: "Zamknij",
								confirmButtonClass: "btn btn-sm btn-bold btn-brand",
							});
						}
					},
					error: function(err) {
            KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś jest nie tak..', 'flaticon-warning-sign');
					}
				});
			}
		});
	}

	var handleSignInFormSubmit = function () {
		$('#signin_submit').click(function (e) {
			e.preventDefault();
			var btn = $(this);
			var form = $('.kt-form');

			form.validate({
				rules: {
					identity: {
						required: true
					},
					password: {
						required: true
					}
				},
				messages: {
					identity: {
						required: "To pole jest wymagane."
					},
					password: {
						required: "To pole jest wymagane."
					}
				}
			});

			if (!form.valid()) {
				return;
			}

			KTApp.progress(btn);
			btn.attr('disabled', true);

			form.submit();
			/* form.ajaxSubmit({
				url: '/',
				method: 'POST',
				data: form.serialize(),
				xhrFields: {
       		withCredentials: true
    		},
				success: function (response, status, xhr, $form) {
					// similate 2s delay
					setTimeout(function () {
						btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
						if(response.status == 'error')
							showErrorMsg(form, 'danger', response.message);
						console.log(response);
					}, 2000);
				},
				error: function(error) {
					showErrorMsg(form, 'danger', 'Próba nawiązania połączenia z serwerem została przerwana.');
				}
			}); */
		});
	}

	// Public Functions
	return {
		// public functions
		init: function () {
			form_recovery = $('#recovery_pass_form');

			handleSignInFormSubmit();
			initValidation();
			recoveryPassword();
		}
	};
}();

// Class Initialization
jQuery(document).ready(function () {
	KTLogin.init();
});
