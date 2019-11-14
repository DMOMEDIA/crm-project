"use strict";
// Class definition

var KTUserListDatatable = function() {

	// variables
	var datatable;
	var form_personal, form_login, form_password;
	var validator_personal, validator_login, validator_password;

	// init
	var init = function() {
		// init the datatables. Learn more: https://keenthemes.com/metronic/?page=docs&section=datatable
		datatable = $('#kt_apps_user_list_datatable').KTDatatable({
			// datasource definition
			data: {
				type: 'remote',
				source: {
					read: {
						url: '/rest/users/list'
					},
				},
				pageSize: 10, // display 20 records per page
				serverPaging: true,
				serverFiltering: true,
				serverSorting: true,
			},

			// layout definition
			layout: {
				scroll: false, // enable/disable datatable scroll both horizontal and vertical when needed.
				footer: false, // display/hide footer
			},

			// column sorting
			sortable: true,

			pagination: true,

			search: {
				input: $('#generalSearch'),
			},

			// columns definition
			columns: [{
				field: 'id',
				title: '#',
				sortable: false,
				width: 20,
				selector: {
					class: 'kt-checkbox--solid'
				},
				textAlign: 'center',
			}, {
				field: "efullname",
				title: "Pracownik",
				sortable: 'asc',
				width: 200,
				// callback function support for column rendering
				template: function(data, i) {
					var urole = data.role;
					if(urole == 'posrednik') urole = 'pośrednik';
					var output = '\
							<div class="kt-user-card-v2">\
								<div class="kt-user-card-v2__pic">\
									<div class="kt-badge kt-badge--xl kt-badge--success">' + data.fullname.substring(0, 1) + '</div>\
								</div>\
								<div class="kt-user-card-v2__details">\
									<a href="javascript:;" class="kt-user-card-v2__name show_user_data" data-id="' + data.id + '">' + data.fullname + '</a>\
									<span class="kt-user-card-v2__desc">' + urole + '</span>\
								</div>\
							</div>';
					return output;
				}
			}, {
				field: 'identity',
				title: 'Identyfikator',
				template: function(row) {
					return row.identity;
				}
			}, {
				field: 'email',
				title: 'E-mail',
				template: function(row) {
          if(row.email == null) return "Nie określono";
					else return row.email;
				},
			}, {
				field: 'telephone',
				title: 'Telefon',
				sortable: false,
				template: function(row) {
					if(row.telephone == null) return "Nie określono";
					else return row.telephone;
				},
			}, {
				field: "Actions",
				width: 80,
				title: "Akcje",
				sortable: false,
				autoHide: false,
				overflow: 'visible',
				template: function(row) {
				return '\
						<div id="dropdown" class="dropdown">\
							<a href="javascript:;" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown">\
								<i class="flaticon-more-1"></i>\
							</a>\
							<div class="dropdown-menu dropdown-menu-right">\
								<ul class="kt-nav">\
									<li class="kt-nav__item show_user_data" data-id="' + row.id + '">\
										<a href="javascript:;" class="kt-nav__link">\
											<i class="kt-nav__link-icon flaticon2-contract"></i>\
											<span class="kt-nav__link-text">Edytuj</span>\
										</a>\
									</li>\
									<li class="kt-nav__item delete_user" data-id="' + row.id + '">\
										<a href="javascript:;" class="kt-nav__link">\
											<i class="kt-nav__link-icon flaticon2-trash"></i>\
											<span class="kt-nav__link-text">Usuń</span>\
										</a>\
									</li>\
								</ul>\
							</div>\
						</div>\
					';
				}
			}]
		});
	}

	// validator
	var initValid = function() {
		validator_personal = form_personal.validate({
			ignore: ':hidden',

			rules: {
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
				}
			},
			messages: {
				firstname: {
					required: "To pole jest wymagane."
				},
				lastname: {
					required: "To pole jest wymagane."
				},
				email: {
					required: "To pole jest wymagane.",
					email: "Wprowadź poprawny adres e-mail."
				},
				address: {
					required: "To pole jest wymagane."
				},
				postcode: {
					required: "To pole jest wymagane."
				},
				city: {
					required: "To pole jest wymagane."
				},
				voivodeship: {
					required: "To pole jest wymagane."
				},
				country: {
					required: "To pole jest wymagane."
				},
			},
			// Display error
			invalidHandler: function(event, validator_personal) {
				KTUtil.scrollTop();

				KTUtil.showNotifyAlert('danger', "Wypełnij wymagane pola i spróbuj ponownie.", 'Wystąpił błąd', 'flaticon-warning-sign');
			},

			// Submit valid form
			submitHandler: function (form) { }
		});

		validator_login = form_login.validate({
			ignore: ':hidden',

			rules: {
				role: {
					required: true
				},
				identity: {
					required: true
				}
			},
			messages: {
				role: {
					required: "To pole jest wymagane."
				},
				identity: {
					required: "To pole jest wymagane."
				}
			},
			// Display error
			invalidHandler: function(event, validator_login) {
				KTUtil.scrollTop();

				KTUtil.showNotifyAlert('danger', "Wypełnij wymagane pola i spróbuj ponownie.", 'Wystąpił błąd', 'flaticon-warning-sign');
			},

			// Submit valid form
			submitHandler: function (form) { }
		});

		validator_password = form_password.validate({
			ignore: ':hidden',

			rules: {
				current_password: {
					required: true
				},
				new_password: {
					required: true,
					minlength: 8,
					pwcheck: true
				},
				confirm_password: {
					required: true,
					minlength: 8,
					equalTo: '#new_passwordInput'
				}
			},
			messages: {
				current_password: {
					required: "To pole jest wymagane."
				},
				new_password: {
					required: "To pole jest wymagane.",
          minlength: "Hasło musi składać się z minimum {0} znaków.",
					pwcheck: "Hasło musi posiadać:</br>- przynajmniej jedną wielką literę,</br>- minimum 8 znaków,</br>- jedną małą literę,</br>- jedną cyfrę,</br>- jeden znak symboliczny"
				},
				confirm_password: {
					required: "To pole jest wymagane.",
					minlength: "Hasło musi składać się z minimum {0} znaków.",
          equalTo: "Hasła muszą być takie same."
				}
			},

			invalidHandler: function(event, validator_password) {
				KTUtil.scrollTop();

				KTUtil.showNotifyAlert('danger', "Wypełnij wymagane pola i spróbuj ponownie.", 'Wystąpił błąd', 'flaticon-warning-sign');
			},

			// Submit valid form
			submitHandler: function (form) { }
		});

		$.validator.addMethod("pwcheck", function(value) {
       return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!|~?\{\}\-.,\\/_+\(\)\:\]\[\;@#\$%\^&\*])(?=.{8,})/.test(value) // consists of only these
    });
	}

	var submitData = function() {
		var modalEl = $('#kt_fetch_user');
		var btn_pers = $('button[type="submit"]', form_personal),
		btn_login = $('button[type="submit"]', form_login),
		btn_pass = $('button[type="submit"]', form_password);

		// Submit personal form
		btn_pers.on('click', function(e) {
			e.preventDefault();

			if(validator_personal.form()) {
				KTApp.progress(btn_pers);
				btn_pers.attr('disabled', true);

				setTimeout(function() {
					form_personal.ajaxSubmit({
						url: '/rest/users/modify',
						method: 'POST',
						data: form_personal.serialize(),
						success: function(res) {
							KTApp.unprogress(btn_pers);
							btn_pers.attr('disabled', false);

							if(res.status == 'success') {
								KTUtil.showNotifyAlert('success', res.message, 'Udało się!', 'flaticon2-checkmark');
								datatable.reload();
							} else {
								KTUtil.showNotifyAlert('danger', res.message, 'Wystąpił błąd', 'flaticon-warning-sign');
							}
						},
						error: function(err) {
							KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś jest nie tak..', 'flaticon-warning-sign');
						}
					});
				}, 1000);
			}
		});

		// Submit login form
		btn_login.on('click', function(e) {
			e.preventDefault();

			if(validator_login.form()) {
				KTApp.progress(btn_login);
				btn_login.attr('disabled', true);

				setTimeout(function() {
					form_login.ajaxSubmit({
						url: '/rest/users/modify',
						method: 'POST',
						data: form_login.serialize(),
						success: function(res) {
							KTApp.unprogress(btn_login);
							btn_login.attr('disabled', false);

							if(res.status == 'success') {
								KTUtil.showNotifyAlert('success', res.message, 'Udało się!', 'flaticon2-checkmark');
								datatable.reload();
							} else {
								KTUtil.showNotifyAlert('danger', res.message, 'Wystąpił błąd', 'flaticon-warning-sign');
							}
						},
						error: function(err) {
							KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś jest nie tak..', 'flaticon-warning-sign');
						}
					});
				}, 1000);
			}
		});

		// Submit password form
		btn_pass.on('click', function(e) {
			e.preventDefault();

			if(validator_password.form()) {
				KTApp.progress(btn_pass);
				btn_pass.attr('disabled', true);

				setTimeout(function() {
					form_password.ajaxSubmit({
						url: '/rest/users/changepwd',
						method: 'POST',
						data: form_password.serialize(),
						success: function(res) {
							KTApp.unprogress(btn_pass);
							btn_pass.attr('disabled', false);

							if(res.status == 'success') {
								KTUtil.showNotifyAlert('success', res.message, 'Udało się!', 'flaticon2-checkmark');
								datatable.reload();
							} else {
								KTUtil.showNotifyAlert('danger', res.message, 'Wystąpił błąd', 'flaticon-warning-sign');
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

	var togglePassword = function () {
		$("#show-password").click(function() {
			if($("#new_passwordInput").attr('type') === 'text') {
				$("#new_passwordInput").attr('type', 'password');
				$("#confirm_passwordInput").attr('type', 'password');
				$('span').find('.la.la-eye').toggleClass('la-eye la-eye-slash');
			} else {
				$("#new_passwordInput").attr('type', 'text');
				$("#confirm_passwordInput").attr('type', 'text');
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
			'passwordElement': '#new_passwordInput',
			'displayElement': '#confirm_passwordInput',
			'passwordLength': 10,
			'uppercase': true,
			'lowercase': true,
			'numbers':   true,
			'specialChars': true,
			'additionalSpecialChars': [],
			'onPasswordGenerated': function(generatedPassword) { }
		});
	}

	// search
	var search = function() {
		$('#kt_form_status').on('change', function() {
			datatable.search($(this).val().toLowerCase(), 'Status');
		});
	}

	var initUserData = function() {
		datatable.on('kt-datatable--on-layout-updated', function(e) {
			var modalEl = $('#kt_fetch_user');

			$("#postcodeInput").inputmask({
					"mask": "99-999",
					placeholder: "" // remove underscores from the input mask
			});

			$('.show_user_data').on('click', function() {
				var id = $(this).attr('data-id');

				KTUtil.clearInputInForm(form_personal);
				modalEl.find('select#remoteUser').html('<option></option>');

				$('#isCompanyInput').on('change',function(e) {
					if($(this).is(':checked')) modalEl.find('#addressAlert').show();
					else modalEl.find('#addressAlert').hide();
				});

				KTApp.blockPage({ overlayColor: '#000000', type: 'v2', state: 'primary', message: 'Proszę czekać..' });

				$.ajax({
					url: '/rest/user/show',
					method: 'POST',
					data: { id: id },
					success: function(res) {
						setTimeout(function() {
								KTApp.unblockPage();

								if(res.status == null) {
									modalEl.modal('show');

									var name = res.fullname.split(' ');
									modalEl.find('#modalTitle').html(res.fullname);
									modalEl.find('#idInput1').val(res.id);
									modalEl.find('#idInput2').val(res.id);
									modalEl.find('#idInput3').val(res.id);
									modalEl.find('#firstnameInput').val(name[0]);
									modalEl.find('#lastnameInput').val(name[1]);
									modalEl.find('#telephoneInput').val(res.telephone);
									modalEl.find('#emailInput').val(res.email);
									modalEl.find('#addressInput').val(res.address);
									modalEl.find('#postcodeInput').val(res.postcode);
									modalEl.find('#cityInput').val(res.city);
									modalEl.find('#voivodeshipInput option[value="' + res.voivodeship + '"]').prop('selected', true);
									modalEl.find('#current_passwordInput').val('');
									modalEl.find('#new_passwordInput').val('');
									modalEl.find('#confirm_passwordInput').val('');

									modalEl.find('#identityInput').val(res.identity);
									modalEl.find('#roleInput').val(res.role);

									if(res.company == 1) {
										modalEl.find('#isCompanyInput').prop('checked', true);
										modalEl.find('#addressAlert').show();
									} else {
										modalEl.find('#isCompanyInput').prop('checked', false);
										modalEl.find('#addressAlert').hide();
									}

									if(res.assigned_to != null) {
										$.ajax({
											url: '/rest/user/showlimited',
											method: 'POST',
											data: { id: res.assigned_to },
											success: function(response) {
												modalEl.find('select#remoteUser').html('<option value="' + response.id + '">' + response.fullname + ', ' + response.role + '</option>');
											},
											error: function(err) {}
										}).done(function(data) {
											remoteUser(res.role);
										});
									} else {
										remoteUser(res.role);
									}
								} else {
									return KTUtil.showNotifyAlert('danger', res.message, 'Wystąpił błąd', 'flaticon-warning-sign');
								}
						}, 1000);
					},
					error: function(err) {
						setTimeout(function() {
								KTApp.unblockPage();

								KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Wystąpił błąd', 'flaticon-warning-sign');
						}, 1000);
					}
				});
			});

			$('.delete_user').on('click', function() {
				var id = $(this).attr('data-id');

				swal.fire({
					html: "Jesteś pewny że chcesz usunąć tego użytkownika?",
					type: "info",

					confirmButtonText: "Usuń",
					confirmButtonClass: "btn btn-sm btn-bold btn-brand",

					showCancelButton: true,
					cancelButtonText: "Anuluj",
					cancelButtonClass: "btn btn-sm btn-bold btn-default"
				}).then(function(result) {
					if (result.value) {
						$.ajax({
							url: '/rest/user/delete',
							method: 'POST',
							data: { id: id },
							success: function(res) {
								if(res.status == 'success') {
									swal.fire({
										title: 'Usunięto',
										text: res.message,
										type: 'success',
										confirmButtonText: "Zamknij",
										confirmButtonClass: "btn btn-sm btn-bold btn-brand",
									});
									datatable.reload();
								} else {
									return KTUtil.showNotifyAlert('danger', res.message, 'Wystąpił błąd', 'flaticon-warning-sign');
								}
							},
							error: function(err) {
								KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Wystąpił błąd', 'flaticon-warning-sign');
							}
						});
					}
				});
			});
		});
	}

	var remoteUser = function(role) {
		var data = [];

		$.ajax({
			url: '/rest/users/namebyrole',
			method: 'GET',
			data: { role: role },
			success: function(res) {
				if(res.status == null) {
					for(var i = 0; i < res.length; i++) {
						data.push({ id: res[i].id, text: res[i].fullname + ', ' + res[i].role });
					}

					$('#remoteUser').select2({
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

	// selection
	var selection = function() {
		// init form controls
		//$('#kt_form_status, #kt_form_type').selectpicker();

		// event handler on check and uncheck on records
		datatable.on('kt-datatable--on-check kt-datatable--on-uncheck kt-datatable--on-layout-updated',	function(e) {
			var checkedNodes = datatable.rows('.kt-datatable__row--active').nodes(); // get selected records
			var count = checkedNodes.length; // selected records count

			$('#kt_subheader_group_selected_rows').html(count);

			if (count > 0) {
				$('#kt_subheader_search').addClass('kt-hidden');
				$('#kt_subheader_group_actions').removeClass('kt-hidden');
			} else {
				$('#kt_subheader_search').removeClass('kt-hidden');
				$('#kt_subheader_group_actions').addClass('kt-hidden');
			}
		});
	}

	// selected records delete
	var selectedDelete = function() {
		$('#kt_subheader_group_actions_delete_all').on('click', function() {
			// fetch selected IDs
			var ids = datatable.rows('.kt-datatable__row--active').nodes().find('.kt-checkbox--single > [type="checkbox"]').map(function(i, chk) {
				return $(chk).val();
			});

			var userText = 'użytkowników';
			if(ids.length == 1) userText = 'użytkownika';

			var data_send = [];
			$.each(ids, function(i, field) { data_send.push(field) });

			if (ids.length > 0) {
				swal.fire({
					text: "Jesteś pewny że chcesz usunąć " + ids.length + " " + userText + "?",
					type: 'info',

					confirmButtonText: "Usuń",
					confirmButtonClass: "btn btn-sm btn-bold btn-brand",

					showCancelButton: true,
					cancelButtonText: "Anuluj",
					cancelButtonClass: "btn btn-sm btn-bold btn-default"
				}).then(function(result) {
					if (result.value) {
						$.ajax({
							url: '/rest/user/sdelete',
							method: 'POST',
							data: { data: data_send },
							success: function(res) {
								if(res.status == 'success') {
									swal.fire({
										title: 'Usunięto',
										text: res.message,
										type: 'success',
										confirmButtonText: "Zamknij",
										confirmButtonClass: "btn btn-sm btn-bold btn-brand",
									});
									datatable.reload();
								} else {
									return KTUtil.showNotifyAlert('danger', res.message, 'Wystąpił błąd', 'flaticon-warning-sign');
								}
							},
							error: function(err) {
								KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Wystąpił błąd', 'flaticon-warning-sign');
							}
						});
					}
				});
			}
		});
	}

	var updateTotal = function() {
		datatable.on('kt-datatable--on-layout-updated', function () {
			//$('#kt_subheader_total').html(datatable.getTotalRows() + ' Total');
		});
	};

	return {
		// public functions
		init: function() {
			form_personal = $('#kt_user_edit_personal');
			form_login = $('#kt_user_edit_login');
			form_password = $('#kt_user_edit_password');

			init();
			initValid();
			submitData();
			initUserData();
			selection();
			selectedDelete();
			togglePassword();
      refreshPassword();
			updateTotal();
		},
	};
}();

// On document ready
KTUtil.ready(function() {
	KTUserListDatatable.init();
});
