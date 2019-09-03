"use strict";

// Class Definition
var KTLogin = function () {

	var login = $('#kt_login');

	var showErrorMsg = function (form, type, msg) {
		var alert = $('<div class="kt-alert kt-alert--outline alert alert-' + type + ' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"></button><span></span></div>');

		form.find('.alert').remove();
		alert.prependTo(form);
		//alert.animateClass('fadeIn animated');
		KTUtil.animateClass(alert[0], 'fadeIn animated');
		alert.find('span').html(msg);
	}

	// Private Functions

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

			btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

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
			handleSignInFormSubmit();
		}
	};
}();

// Class Initialization
jQuery(document).ready(function () {
	KTLogin.init();
});
