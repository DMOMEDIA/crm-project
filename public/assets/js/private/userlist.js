"use strict";
// Class definition

var KTUserListDatatable = function() {

	// variables
	var datatable, clients_datatable;
	var form_personal, form_login, form_password, form_client;
	var validator_personal, validator_login, validator_password, validator_client;
	var modalEl, modalClient;
	var f_path;

	var modal_memory;

	var ext = {
		'odt': 'doc',
		'docx': 'doc',
		'doc': 'doc',
		'pdf': 'pdf',
		'css': 'css',
		'csv': 'csv',
		'html': 'html',
		'js': 'javascript',
		'jpg': 'jpg',
		'jpeg': 'jpg',
		'mp4': 'mp4',
		'xml': 'xml',
		'zip': 'zip',
		'rar': 'zip'
	};

	var initModalEvent = function() {
		clients_datatable.hide();

		function reloadTable() {
			var modalContent = modalEl.find('.datatable-in-modal');
			clients_datatable.spinnerCallback(true, modalContent);

			clients_datatable.reload();

			clients_datatable.on('kt-datatable--on-layout-updated', function() {
				clients_datatable.show();
				clients_datatable.spinnerCallback(false, modalContent);
				clients_datatable.redraw();
			});
		}
		modalEl.on('click', '#clients_table_show', function() {
			reloadTable();
		}).on('shown.bs.modal', function() {
			if($('#clients_table_show').hasClass('active')) {
				reloadTable();
			}
		}).on('hidden.bs.modal', function() {
			if(modal_memory == null) {
				$('#modal_datatable_clients').KTDatatable('destroy');
			}
		});

		modalEl.find('#kt_form_status_inTable').on('change', function() {
			clients_datatable.search($(this).val().toLowerCase(), 'state');
		});
		modalEl.find('#kt_form_status_inTable').selectpicker();
	}

	var subTableInit = function(e) {
		$('<div/>').attr('id', 'child_data_local_' + e.data.id).appendTo(e.detailCell).KTDatatable({
			data: {
				type: 'remote',
				source: {
					read: {
						url: '/rest/users/list',
						params: {
							id: e.data.id
						}
					},
				},
			},
			// layout definition
			layout: {
				scroll: true,
				height: 300,
				header: false,
				footer: false,
				// enable/disable datatable spinner.
				spinner: {
					type: 1,
					theme: 'default',
				},
			},

			toolbar: {
				items: {
					info: false
				}
			},

			sortable: false,

			// columns definition
			columns: [{
				field: 'id',
				title: '',
				sortable: 'false',
				width: 30,
				textAlign: 'center',
			}, {
				field: "fullname",
				title: "Pracownik",
				sortable: 'asc',
				width: 200,
				autoHide: false,
				// callback function support for column rendering
				template: function(data, i) {
					var urole = data.role;
					if(urole == 'posrednik') urole = 'pośrednik';
					var output = '\
							<div class="kt-user-card-v2">\
								<div class="kt-user-card-v2__pic">\
									<div class="kt-badge kt-badge--xl kt-badge--warning">' + data.fullname.substring(0, 1) + '</div>\
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
				autoHide: true,
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
			}],
		});
	};

	// init
	var init = function() {
		// init the datatables. Learn more: https://keenthemes.com/metronic/?page=docs&section=datatable
		datatable = $('.kt-datatable-initialize').KTDatatable({
			// datasource definition
			data: {
				type: 'remote',
				source: {
					read: {
						url: '/rest/users/list'
					},
				},
			},
			detail: {
				title: 'Lista pracowników podległych',
				content: subTableInit,
			},
			// layout definition
			layout: {
				scroll: false, // enable/disable datatable scroll both horizontal and vertical when needed.
				footer: false, // display/hide footer
			},

			// column sorting
			sortable: false,

			filterable: false,

			pagination: true,

			search: {
				input: $('#generalSearch'),
			},

			// columns definition
			columns: [{
				field: 'id',
				title: '',
				sortable: 'desc',
				width: 30,
				textAlign: 'center',
			}, {
				field: "fullname",
				title: "Pracownik",
				width: 200,
				autoHide: false,
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
				autoHide: true,
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
		$('[name="pesel"],[name="cregon"],[name="cnip"]').maxlength({
        warningClass: "kt-badge kt-badge--warning kt-badge--rounded kt-badge--inline",
        limitReachedClass: "kt-badge kt-badge--success kt-badge--rounded kt-badge--inline",
				appendToParent: true
    });

		validator_personal = form_personal.validate({
			ignore: ':hidden',

			rules: {
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
			datatable.search($(this).val().toLowerCase(), 'role');
		});
		$('#kt_form_status').selectpicker();
	}

	var initUserData = function() {
		$("#postcodeInput").inputmask({
				"mask": "99-999",
				placeholder: "" // remove underscores from the input mask
		});

		$(document).on('click', '.show_user_data', function() {
			var id = $(this).attr('data-id');

			KTUtil.clearInputInForm(form_personal);
			modalEl.find('select#remoteUser').html('<option></option>');

			$('#isCompanyInput').on('change',function(e) {
				if($(this).is(':checked')) {
					modalEl.find('#company_data').show();
					modalEl.find('[name="cname"]').val('');
					modalEl.find('[name="cnip"]').val('');
					modalEl.find('[name="cregon"]').val('');
				}
				else modalEl.find('#company_data').hide();
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
								modalEl.find('[name="pesel"]').val(res.pesel);
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
								modalEl.find('[name="country"]').val(res.country);
								modalEl.find('#current_passwordInput').val('');
								modalEl.find('#new_passwordInput').val('');
								modalEl.find('#confirm_passwordInput').val('');

								modalEl.find('#identityInput').val(res.identity);
								modalEl.find('#roleInput').val(res.role);

								$('#roleInput').on('change', function(e) {
									if($(this).val() == 'kierownik') {
										$('#partnerHide').show();
									} else {
										$('#partnerHide').hide();
									}
								});

								if(res.role == 'kierownik') modalEl.find('#partnerHide').show();
								else modalEl.find('#partnerHide').hide();

								if(res.company == 1) {
									modalEl.find('#isCompanyInput').prop('checked', true);
									modalEl.find('[name="cname"]').val(res.cname);
									modalEl.find('[name="cnip"]').val(res.cnip);
									if(res.cregon) modalEl.find('[name="cregon"]').val(res.cregon);
									modalEl.find('#company_data').show();
								} else {
									modalEl.find('#isCompanyInput').prop('checked', false);
									modalEl.find('#company_data').hide();
								}

								// Initialize client list
								clients_datatable = $('#modal_datatable_clients').KTDatatable({
									// datasource definition
									data: {
										type: 'remote',
										source: {
											read: {
												url: '/rest/clients/list',
												params: {
													id: res.id
												}
											},
										},
									},

									// layout definition
									layout: {
										scroll: true, // enable/disable datatable scroll both horizontal and vertical when needed.
										height: 400, // datatable's body's fixed height
										minHeight: 400,
										footer: false, // display/hide footer
									},

									// column sorting
									sortable: false,

									pagination: true,

									search: {
										input: $('#searchInTable'),
										delay: 400,
									},

									// columns definition
									columns: [{
										field: 'id',
										title: '#',
										sortable: 'desc',
										width: 20,
										type: 'number',
										selector: {
											class: 'kt-checkbox--solid'
										},
										textAlign: 'center',
									}, {
										field: "fullname",
										title: "Klient",
										width: 200,
										autoHide: false,
										// callback function support for column rendering
										template: function(data, i) {
											if(data.inferior) var inf = 'kt-badge--warning';
											else var inf = 'kt-badge--success';

											var output = '\
													<div class="kt-user-card-v2">\
														<div class="kt-user-card-v2__pic">\
															<div class="kt-badge kt-badge--xl ' + inf + '">' + data.fullname.substring(0, 1) + '</div>\
														</div>\
														<div class="kt-user-card-v2__details">\
															<a href="javascript:;" class="kt-user-card-v2__name show_client_data" data-id="' + data.id + '">' + data.fullname + '</a>\
														</div>\
													</div>';
											return output;
										}
									}, {
										field: 'email',
										title: 'E-mail',
										autoHide: true,
										template: function(row) {
											if(row.email == null) return "Nie określono";
											else return row.email;
										}
									}, {
										field: 'phone',
										title: 'Telefon',
										autoHide: true,
										template: function(row) {
											if(row.phone == null) return "Nie określono";
											else return row.phone;
										},
									}, {
										field: 'state',
										title: 'Status',
										autoHide: true,
										template: function(row) {
											var status = {
												1: {'title': 'Nieprzypisany', 'class': 'kt-badge--dark'},
												2: {'title': 'Niepełne dane', 'class': ' kt-badge--warning'},
												3: {'title': 'Niezweryfikowany', 'class': ' kt-badge--danger'},
												4: {'title': 'Zweryfikowany', 'class': ' kt-badge--success'},
											};
											return '<span class="kt-badge ' + status[row.state].class + ' kt-badge--inline kt-badge--pill">' + status[row.state].title + '</span>';
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
												<a href="javascript:;" class="btn btn-sm btn-clean btn-icon btn-icon-md show_client_data" data-id="' + row.id + '">\
													<i class="flaticon2-menu-1"></i>\
												</a>\
											';
										}
									}]
								});

								initModalEvent();

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

		$(document).on('click', '.delete_user', function() {
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
				$('#kt_subheader_group_actions').removeClass('kt-hidden');
			} else {
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

	var initValidClient = function() {
		$('#nipI,#nipI1,#nipI2').maxlength({
        warningClass: "kt-badge kt-badge--warning kt-badge--rounded kt-badge--inline",
        limitReachedClass: "kt-badge kt-badge--success kt-badge--rounded kt-badge--inline",
				appendToParent: true
    });

		validator_client = form_client.validate({
			ignore: ':hidden',

			rules: {
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
				corp_nip: {
					required: true,
					minlength: 10,
					maxlength: 10
				},
				company_nip: {
					required: true,
					minlength: 10,
					maxlength: 10
				},
				email: {
					required: true,
					email: true
				},
				data_processing: {
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
				corpName: {
					required: "To pole jest wymagane."
				},
				corp_type: {
					required: "To pole jest wymagane."
				},
				corp_regon: {
					digits: "Numer REGON może składać się tylko z cyfr.",
					maxlength: "Numer REGON może posiadać jedynie {0} cyfr."
				},
				companyName: {
					required: "To pole jest wymagane."
				},
				company_regon: {
					digits: "Numer REGON może składać się tylko z cyfr.",
					maxlength: "Numer REGON może posiadać jedynie {0} cyfr."
				},
				corp_nip: {
					required: "To pole jest wymagane.",
					minlength: "Numer NIP musi składać się z 10 cyfr.",
					maxlength: "Numer NIP musi składać się z 10 cyfr."
				},
				company_nip: {
					required: "To pole jest wymagane.",
					minlength: "Numer NIP musi składać się z 10 cyfr.",
					maxlength: "Numer NIP musi składać się z 10 cyfr."
				},
				email: {
					required: "To pole jest wymagane.",
					email: "Wprowadź poprawny adres e-mail."
				},
				data_processing: {
					required: "To pole jest wymagane."
				}
			},
			// Display error
			invalidHandler: function(event, validator_client) {
				KTUtil.scrollTop();

				KTUtil.showNotifyAlert('danger', "Wypełnij wymagane pola i spróbuj ponownie.", 'Wystąpił błąd', 'flaticon-warning-sign');
			},

			// Submit valid form
			submitHandler: function (form) { }
		});
	}

	var initClientData = function() {
		$(document).on('click', '.show_client_data', function() {
			var id = $(this).attr('data-id');

			modalClient.find('select#company_type option[value=""]').prop('selected', true);
			modalClient.find('select#remoteEmployeer').html('<option></option>');
			KTUtil.clearInputInForm(form_client);

			KTApp.blockPage({ overlayColor: '#000000', type: 'v2', state: 'primary', message: 'Proszę czekać..' });

			$.ajax({
				url: '/rest/client/show',
				method: 'POST',
				data: { id: id },
				success: function(res) {
					setTimeout(function() {
							KTApp.unblockPage();

							if(res.status == null) {
								modal_memory = true;
								modalEl.modal('hide');
								modalClient.modal('show');
								modalClient.css('overflow','scroll');
								modalClient.find('#modalTitle_client').html(res.fullname);
								modalClient.find('#idInput1_client').val(res.id);
								modalClient.find('#idInput3_client').val(res.id);
								modalClient.find('#attached_files').html('');

								var type = res.company, name = res.fullname.split(' ');

								// 2 - Firma
								// 1 - Spółka
								// 0 - Osoba prywatna

								$('input[name="client_type"]').filter('[value="' + res.company + '"]').prop('checked', true);


								if(res.company == 0) {
									modalClient.find('#company_user').hide();
									modalClient.find('#private_user').show();
									modalClient.find('#corp_user').hide();
									modalClient.find('input[name="firstname"]').val(name[0]);
									modalClient.find('input[name="lastname"]').val(name[1]);
									modalClient.find('input[name="priv_nip"]').val(res.nip);
								} else if(res.company == 1) {
									modalClient.find('#company_user').hide();
									modalClient.find('#private_user').hide();
									modalClient.find('#corp_user').show();
									modalClient.find('input[name="corpName"]').val(res.fullname);
									modalClient.find('select[name="corp_type"] option[value="' + res.company_type + '"]').prop('selected', true);
									modalClient.find('input[name="corp_regon"]').val(res.regon);
									modalClient.find('input[name="corp_nip"]').val(res.nip);
								} else {
									modalClient.find('#company_user').show();
									modalClient.find('#private_user').hide();
									modalClient.find('#corp_user').hide();
									modalClient.find('input[name="companyName"]').val(res.fullname);
									modalClient.find('input[name="company_regon"]').val(res.regon);
									modalClient.find('input[name="company_nip"]').val(res.nip);
								}

								modalClient.find('input[name="pNumber"]').val(res.phone);
								modalClient.find('input[name="email"]').val(res.email);
								modalClient.find('input[name="data_processing"]').prop('checked', res.data_process);
								modalClient.find('input[name="data_marketing"]').prop('checked', res.marketing);
								modalClient.find('select[name="change_status"] option[value="' + res.state + '"]').prop('selected', true);

								f_path = 'client_' + res.id + '_' + moment(res.created_at).local().format('YYYY');
								$.ajax({
									url: '/rest/files/get',
									method: 'POST',
									data: { folder_path: 'clients/' + f_path },
									success: function(res) {
										if(res.files) {
											if(res.files.length != 0) {
												res.files.forEach(file => {
													var extension = file.split('.');
													modalClient.find('#attached_files').append('\<div class="kt-widget4__item">\
															<div class="kt-widget4__pic kt-widget4__pic--icon">\
																<img src="./assets/media/files/' + ext[extension[1]] + '.svg" alt="">\
															</div>\
															<a href="javascript:;" class="kt-widget4__title">' + file + '</a>\
															<div class="kt-widget4__tools">\
																<a href="javascript:;" data-path="' + f_path + '/' + file + '"  class="btn btn-clean btn-icon btn-sm download_file">\
																	<i class="flaticon2-download"></i>\
																</a>\
																<a href="javascript:;" data-path="' + f_path + '/' + file + '" class="btn btn-clean btn-icon btn-sm remove_file">\
																	<i class="flaticon2-delete"></i>\
																</a>\
															</div>\
														</div>\
													');
												});
											}
										}
									},
									error: function(err) {
										throw err;
									}
								});

								if(res.user_id != null) {
									$.ajax({
										url: '/rest/user/showlimited',
										method: 'POST',
										data: { id: res.user_id },
										success: function(response) {
											modalClient.find('select#remoteEmployeer').html('<option value="' + response.id + '">' + response.fullname + ', ' + response.role + '</option>');
										},
										error: function(err) {}
									}).done(function(data) {
										remoteEmploy();
									});
								} else {
									remoteEmploy();
								}

								// Zmiana typu konta
								$('input[name="client_type"]').on('change', function(e) {
									KTUtil.clearInputInForm(form_client);
									if($('input[name="client_type"]:checked').val() == 0) {
										modalClient.find('#private_user').show();
										modalClient.find('#corp_user').hide();
										modalClient.find('#company_user').hide();
									} else if($('input[name="client_type"]:checked').val() == 1) {
										modalClient.find('#private_user').hide();
										modalClient.find('#corp_user').show();
										modalClient.find('#company_user').hide();
									} else {
										modalClient.find('#private_user').hide();
										modalClient.find('#corp_user').hide();
										modalClient.find('#company_user').show();
									}
								});

								modalClient.on('hidden.bs.modal', function() {
									modalEl.modal('show');
									modal_memory = null;
								});
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

		$(document).on('click', '.delete_client', function() {
			var id = $(this).attr('data-id');

			swal.fire({
				html: "Jesteś pewny że chcesz usunąć tego klienta i wszystkie jego oferty?",
				type: "info",

				confirmButtonText: "Usuń",
				confirmButtonClass: "btn btn-sm btn-bold btn-brand",

				showCancelButton: true,
				cancelButtonText: "Anuluj",
				cancelButtonClass: "btn btn-sm btn-bold btn-default"
			}).then(function(result) {
				if (result.value) {
					$.ajax({
						url: '/rest/client/delete',
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
								clients_datatable.reload();
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
	}

	var initFileButtons = function() {
		$(document).on('click', '.download_file', function() {
			var path = 'clients/' + $(this).attr('data-path');

			$.ajax({
				url: '/rest/file/download',
				method: 'POST',
				data: { path: path },
				xhrFields: {
					responseType: 'blob'
				},
				success: function(res, status, xhr) {
					var fileName = xhr.getResponseHeader('Content-Disposition').split("=")[1];
					fileName = fileName.replace(/\"/g, '');
					fileName = fileName.split(';');

					var a = document.createElement('a');
			    var url = window.URL.createObjectURL(res);
			    a.href = url;
			    a.download = fileName[0];
			    a.click();
			    window.URL.revokeObjectURL(url);
				},
				error: function(err) {
					KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Wystąpił błąd', 'flaticon-warning-sign');
				}
			});
		});

		/**
			@Information Wydarzenie usuwające wybrany plik z systemu
		**/

		$(document).on('click', '.remove_file', function() {
			var path = 'clients/' + $(this).attr('data-path'),
			element = $(this);

			swal.fire({
				text: "Jesteś pewny że chcesz usunąć ten plik?",
				type: 'info',

				confirmButtonText: "Usuń",
				confirmButtonClass: "btn btn-sm btn-bold btn-brand",

				showCancelButton: true,
				cancelButtonText: "Anuluj",
				cancelButtonClass: "btn btn-sm btn-bold btn-default"
			}).then(function(result) {
				if(result.value) {
					$.ajax({
						url: '/rest/file/delete',
						method: 'POST',
						data: { path: path },
						success: function(res) {
							if(res.status == 'success') {
								swal.fire({
									title: 'Usunięto',
									text: res.message,
									type: res.status,
									confirmButtonText: "Zamknij",
									confirmButtonClass: "btn btn-sm btn-bold btn-brand",
								});
								element.parents('.kt-widget4__item').remove();
							} else {
								swal.fire({
									title: 'Błąd',
									text: res.message,
									type: res.status,
									confirmButtonText: "Zamknij",
									confirmButtonClass: "btn btn-sm btn-bold btn-brand",
								});
							}
						},
						error: function(err) {
							KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Wystąpił błąd', 'flaticon-warning-sign');
						}
					});
				}
			});
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

	var submitClientData = function() {
		var btn_pers = $('button[type="submit"]', form_client);

		// Submit personal form
		btn_pers.on('click', function(e) {
			e.preventDefault();

			if(validator_client.form()) {
				KTApp.progress(btn_pers);
				btn_pers.attr('disabled', true);

				setTimeout(function() {
					form_client.ajaxSubmit({
						url: '/rest/clients/modify',
						method: 'POST',
						data: form_client.serialize(),
						success: function(res) {
							KTApp.unprogress(btn_pers);
							btn_pers.attr('disabled', false);

							if(res.status == 'success') {
								KTUtil.showNotifyAlert('success', res.message, 'Udało się!', 'flaticon2-checkmark');
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
	};

	var initDropzone = function() {
		$('#kt_dropzone_client_files').dropzone({
			url: '/rest/files/upload/client',
			autoProcessQueue: true,
			paramName: function() { return 'source_file[]' }, // The name that will be used to transfer the file
			maxFiles: 5,
			maxFilesize: 10, // MB
			addRemoveLinks: true,
			uploadMultiple: true,
			parallelUploads: 5,
			acceptedFiles: "application/pdf,.docx,.odt,.xls",
			init: function() {
				var dzUpload = this;

				this.on("success", function(file, res) {
					var extension = file.name.split('.');
					$('#attached_files').append('\<div class="kt-widget4__item">\
							<div class="kt-widget4__pic kt-widget4__pic--icon">\
								<img src="./assets/media/files/' + ext[extension[1]] + '.svg" alt="">\
							</div>\
							<a href="javascript:;" class="kt-widget4__title">' + file.name + '</a>\
							<div class="kt-widget4__tools">\
								<a href="javascript:;" data-path="' + f_path + '/' + file.name + '"  class="btn btn-clean btn-icon btn-sm download_file">\
									<i class="flaticon2-download"></i>\
								</a>\
								<a href="javascript:;" data-path="' + f_path + '/' + file.name + '" class="btn btn-clean btn-icon btn-sm remove_file">\
									<i class="flaticon2-delete"></i>\
								</a>\
							</div>\
						</div>\
					');

					swal.fire({
						"title": "",
						"text": res.message,
						"type": "success",
						"confirmButtonClass": "btn btn-secondary"
					});
					dzUpload.removeAllFiles();
				});

				this.on("sendingmultiple", function(file, xhr, formData) {
					formData.append('folder_path', f_path);
				});
			}
		});
	};

	var initChangeStatus = function() {
		var form_status = $('#form_change_status'),
		btn = $('button[type="submit"]', form_status);

		btn.on('click', function(e) {
			e.preventDefault();

			KTApp.progress(btn);
			btn.attr('disabled', true);

			setTimeout(function() {
				form_status.ajaxSubmit({
					url: '/rest/client/status',
					method: 'POST',
					data: form_status.serialize(),
					success: function(res) {
						KTApp.unprogress(btn);
						btn.attr('disabled', false);

						if(res.status == 'success') {
							KTUtil.showNotifyAlert('success', res.message, 'Udało się!', 'flaticon2-checkmark');
						} else {
							KTUtil.showNotifyAlert('danger', res.message, 'Wystąpił błąd', 'flaticon-warning-sign');
						}
					},
					error: function(err) {
						KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś jest nie tak..', 'flaticon-warning-sign');
					}
				});
			}, 1000);
		});
	}

	var passwordReset = function() {
		$('#btnPasswordReset').on('click', function(e) {
			swal.fire({
				html: "Jesteś pewny że chcesz zresetować hasło tego użytkownika?",
				type: "info",

				confirmButtonText: "Resetuj",
				confirmButtonClass: "btn btn-sm btn-bold btn-danger",

				showCancelButton: true,
				cancelButtonText: "Anuluj",
				cancelButtonClass: "btn btn-sm btn-bold btn-default"
			}).then(function(result) {
				if (result.value) {
					$.ajax({
						url: '/rest/user/resetpwd',
						method: 'POST',
						data: form_password.serialize(),
						success: function(res) {

							swal.fire({
								"title": "",
								"text": res.message,
								"type": res.status,
								"confirmButtonClass": "btn btn-secondary"
							});
						},
						error: function(err) {
								KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś jest nie tak..', 'flaticon-warning-sign');
						}
					});
				}
			});
		});
	};

	return {
		// public functions
		init: function() {
			form_personal = $('#kt_user_edit_personal');
			form_login = $('#kt_user_edit_login');
			form_password = $('#kt_user_edit_password');
			form_client = $('#kt_client_edit_personal');
			modalEl = $('#kt_fetch_user');
			modalClient = $('#kt_fetch_client');

			init();
			initValid();
			submitData();
			initUserData();
			selection();
			selectedDelete();
			togglePassword();
      refreshPassword();
			initValidClient();
			initClientData();
			initDropzone();
			initFileButtons();
			remoteEmploy();
			submitClientData();
			initChangeStatus();
			updateTotal();
			passwordReset();
			search();
		},
	};
}();

// On document ready
KTUtil.ready(function() {
	KTUserListDatatable.init();
});
