"use strict";
// Class definition

var KTROfferListDatatable = function() {

	// variables
	var datatable, validator, formEl, f_path, dz_upload;
	var formCompanyList, formCompany_valid, provision_validator, provisionsForm;

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

	// init
	var init = function() {

		// init the datatables. Learn more: https://keenthemes.com/metronic/?page=docs&section=datatable
		datatable = $('#kt_apps_offer_list_datatable').KTDatatable({
			// datasource definition
			data: {
				type: 'remote',
				source: {
					read: {
						url: '/rest/roffer/list'
					},
				},
				pageSize: 10 // display 20 records per page
			},

			// layout definition
			layout: {
				scroll: false, // enable/disable datatable scroll both horizontal and vertical when needed.
				footer: false, // display/hide footer
				icons: {
					sort: {
						asc: '',
						desc: ''
					}
				}
			},

			// column sorting
			sortable: false,

			pagination: true,

			search: {
				input: $('#generalSearch'),
				delay: 400,
			},

			// columns definition
			columns: [{
				field: 'id',
				title: '#',
				sortable: 'desc',
				width: 20,
				selector: {
					class: 'kt-checkbox--solid'
				},
				textAlign: 'center',
			}, {
				field: "idZlecenia",
				title: "ID zlecenia",
				sortable: false,
				autoHide: false,
				width: 100,
				template: function(row) {
					var date = moment(row.created_at).local().format('YYYY');
					return '<a href="javascript:;" class="show_offer_data" data-id="' + row.id + '">00' + row.id + '/' + date + '</a>';
				}
			}, {
				field: "created_at",
				title: "Data dostarczenia",
				sortable: false,
				template: function(row) {
					return moment(row.created_at).local().format('YYYY-MM-DD HH:mm');
				}
			}, {
				field: "fullname",
				title: "Klient",
				width: 200,
				template: function(row) {
					return row.client_info.fullname;
				}
			}, {
				field: "phone",
				title: "Telefon",
				template: function(row) {
					return row.client_info.phone;
				}
			}, {
				field: 'state',
				title: 'Status',
				autoHide: false,
				template: function(row) {
					var status = {
						1: {'title': 'Nowe', 'class': 'kt-badge--brand'},
						2: {'title': 'Oczekujące', 'class': ' kt-badge--dark'},
						3: {'title': 'Zrealizowane', 'class': ' kt-badge--success'},
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
							<div id="dropdown" class="dropdown">\
								<a href="javascript:;" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown">\
									<i class="flaticon2-menu-1"></i>\
								</a>\
								<div class="dropdown-menu dropdown-menu-right">\
									<ul class="kt-nav">\
										<li class="kt-nav__item show_offer_data" data-id="' + row.id + '">\
											<a href="javascript:;" class="kt-nav__link">\
												<i class="kt-nav__link-icon flaticon2-contract"></i>\
												<span class="kt-nav__link-text">Edytuj</span>\
											</a>\
										</li>\
										<li class="kt-nav__item delete_roffer" data-id="' + row.id + '">\
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

	var initValidation = function() {
		//$('#wklad_l').inputmask({ 'alias': 'currency', rightAlign: false, digits: 2, prefix: '', clearMaskOnLostFocus: true });
		$('#wykup_l').inputmask({ 'alias': 'percentage', min:0, max:100, rightAlign: false });
		$('#wklad_l').inputmask({ 'alias': 'percentage', min:0, max:100, rightAlign: false });
		//$('#wklad_r').inputmask({ 'alias': 'currency', rightAlign: false, digits: 2, prefix: '', clearMaskOnLostFocus: true });
		$('#wykup_r').inputmask({ 'alias': 'percentage', min:0, max:100, rightAlign: false });
		$('#wklad_r').inputmask({ 'alias': 'percentage', min:0, max:100, rightAlign: false });
		$('#netto_val').inputmask({ 'alias': 'currency', rightAlign: false, digits: 2, clearMaskOnLostFocus: true, min: 1, prefix: '' });
		$("#engine_cap_i").inputmask('99999 cm³', { placeholder: "" });
		$("#km_val_i").inputmask('9999999 km', { numericInput: true, placeholder: "" });
		$("#power_cap_i").inputmask('999 km', { numericInput: true, placeholder: "" });
		$('input[name="percentage_partner"]').inputmask({ alias: 'percentage', min:0, max:100 , rightAlign: false, digits: 2 });
		$('input[name="percentage_gap"]').inputmask({ alias: 'percentage', min:0, max:100 , rightAlign: false, digits: 2 });
		$('input[name="percentage_acoc"]').inputmask({ alias: 'percentage', min:0, max:100 , rightAlign: false, digits: 2 });

		provision_validator = $('#provisions_form').validate({
			ignore: ":hidden",

			rules: {
				percentage_partner: {
					required: false
				},
				percentage_gap: {
					required: true
				},
				percentage_acoc: {
					required: true
				}
			},
			// Display error
			invalidHandler: function(event, validator) { },

			// Submit valid form
			submitHandler: function (form) { }
		});

		validator = formEl.validate({
			// Validate only visible fields
			ignore: ":hidden",

			// Validation rules
			rules: {
				nameItem: {
					required: true
				},
				pyear_l: {
					required: true
				},
				leasing_installment: {
					required: true
				},
				wklad_l: {
					required: true
				},
				wykup_l: {
					required: true
				},
				netto: {
					required: true
				},
				brand_r: {
					required: true
				},
				body_type_r: {
					required: true
				},
				fuel_type_r: {
					required: true
				},
				rent_installment: {
					required: true
				},
				wklad_r: {
					required: true
				},
				wykup_r: {
					required: true
				},
				brand_i: {
					required: true
				},
				pyear_i: {
					required: true
				},
				engine_cap_i: {
					required: true
				},
				power_cap_i: {
					required: true
				},
				vin_number: {
					required: true
				},
				reg_number: {
					required: true
				},
				km_val_i: {
					required: true
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

	var initValidationCompany = function() {

		formCompany_valid = formCompanyList.validate({
			// Validate only visible fields
			ignore: ":hidden",

			// Validation rules
			rules: {
				company_list: {
					required: true
				}
			},

			// Display error
			invalidHandler: function(event, validator) { },

			// Submit valid form
			submitHandler: function (form) { }
		});
	}

	/* var initSendOfferCompanies = function() {
		var btn = $('button[type="submit"]', formCompanyList);

		btn.on('click', function(e) {
			e.preventDefault();

			if(formCompany_valid.form()) {
				KTApp.progress(btn);
				btn.attr('disabled', true);

				// Serialize data array
				var dataArray = formEl.serializeArray(), dataObj = {};
				$(dataArray).each(function(i, field)	{
				  dataObj[field.name] = field.value;
				});

				setTimeout(function() {
					swal.fire({
						"title": "",
						"text": "Wysyłanie wiadomości..",
						onBeforeOpen: () => {
							swal.showLoading();
						},
						allowOutsideClick: false
					});

					formCompanyList.ajaxSubmit({
						url: '/rest/roffer/sendMail',
						method: 'POST',
						data: {
							mails: $('#company_list').val(),
							data: dataObj
						},
						success: function(res) {
							KTApp.unprogress(btn);
							btn.attr('disabled', false);

							if(res.status == 'success') {
								$('#send_request_notify').show();
								$('#dropzone_form_roffer').show();
								$('#realize_roffer').prop('disabled', false).text('Zrealizuj zapytanie');
								$('#summary_element').show();

								swal.fire({
									"title": "",
									"text": res.message,
									"type": res.status,
									"confirmButtonClass": "btn btn-secondary"
								});
								datatable.reload();
							} else {
								KTUtil.showNotifyAlert('danger', res.message, 'Wystąpił błąd', 'flaticon-warning-sign');
							}
						},
						error: function(err) {
							KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś jest nie tak..', 'flaticon-warning-sign');
						}
					});
				},1000);
			}
		});
	}; */

	var initSendOfferCompanies = function() {
		var btn = $('button[type="submit"]', formCompanyList);

		btn.on('click', function(e) {
			e.preventDefault();

			if(formCompany_valid.form()) {
				KTApp.progress(btn);
				btn.attr('disabled', true);

				// Serialize data array
				var dataArray = formEl.serializeArray(), dataObj = {};
				$(dataArray).each(function(i, field)	{
				  dataObj[field.name] = field.value;
				});

				if(dz_upload.files.length != 0) {
					swal.fire({
						"title": "",
						"text": "Przesyłanie załączonych plików..",
						onBeforeOpen: () => {
							swal.showLoading();
						},
						allowOutsideClick: false
					});

					// Send files to system
					setTimeout(function() {
						dz_upload.processQueue();
					}, 500);

					dz_upload.on("successmultiple", function(file, resp) {
						dz_upload.removeAllFiles();

						setTimeout(function() {
							swal.fire({
								"title": "",
								"text": "Wysyłanie wiadomości..",
								onBeforeOpen: () => {
									swal.showLoading();
								},
								allowOutsideClick: false
							});

							formCompanyList.ajaxSubmit({
								url: '/rest/roffer/sendMail',
								method: 'POST',
								data: {
									mails: $('#company_list').val(),
									data: dataObj,
									path: f_path
								},
								success: function(res) {
									KTApp.unprogress(btn);
									btn.attr('disabled', false);

									if(res.status == 'success') {
										initCompanySentList(dataObj.id);
										//
										$('#send_request_notify').show();
										$('#dropzone_form_roffer').show();
										$('#realize_roffer').prop('disabled', false).text('Zrealizuj zapytanie');
										$('#summary_element').show();
										formEl.find('input,select,textarea,button').not('button[data-dismiss="modal"],#realize_roffer,[type=hidden]').prop('disabled', true);
										$('#provisions_form').find('input').prop('disabled',false);

										swal.fire({
											"title": "",
											"text": res.message,
											"type": res.status,
											"confirmButtonClass": "btn btn-secondary"
										});
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
					});

					dz_upload.on("sendingmultiple", function(file, xhr, formData) {
						formData.append('folder_path', f_path);
					});

				} else {
					setTimeout(function() {
						swal.fire({
							"title": "",
							"text": "Wysyłanie wiadomości..",
							onBeforeOpen: () => {
								swal.showLoading();
							},
							allowOutsideClick: false
						});

						formCompanyList.ajaxSubmit({
							url: '/rest/roffer/sendMail',
							method: 'POST',
							data: {
								mails: $('#company_list').val(),
								data: dataObj,
								path: null
							},
							success: function(res) {
								KTApp.unprogress(btn);
								btn.attr('disabled', false);

								if(res.status == 'success') {
									initCompanySentList(dataObj.id);
									//
									$('#send_request_notify').show();
									$('#dropzone_form_roffer').show();
									$('#realize_roffer').prop('disabled', false).text('Zrealizuj zapytanie');
									$('#summary_element').show();

									swal.fire({
										"title": "",
										"text": res.message,
										"type": res.status,
										"confirmButtonClass": "btn btn-secondary"
									});
									datatable.reload();
								} else {
									swal.fire({
										"title": "",
										"text": res.message,
										"type": res.status,
										"confirmButtonClass": "btn btn-secondary"
									});
								}
							},
							error: function(err) {
								KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś jest nie tak..', 'flaticon-warning-sign');
							}
						});
					},1000);
				}
			}
		});
	};

	jQuery.extend(jQuery.validator.messages, {
			required: "To pole jest wymagane.",
			remote: "",
			email: "",
			url: "",
			date: "",
			dateISO: "",
			number: "",
			digits: "To pole może zawierać jedynie cyfry.",
			creditcard: "",
			equalTo: ""
	});

	var initSubmitData = function() {
		var modalEl = $('#kt_fetch_offer'),
		btn = $('button[type="submit"]', formEl);

		btn.on('click', function(e) {
			e.preventDefault();

			if(validator.form()) {
				KTApp.progress(btn);
				btn.attr('disabled', true);

				setTimeout(function() {
					formEl.ajaxSubmit({
						url: '/rest/roffer/update',
						method: 'POST',
						data: formEl.serialize(),
						success: function(res) {
							KTApp.unprogress(btn);
							btn.attr('disabled', false);

							if(res.status == 'success') {
								swal.fire({
									"title": "",
									"text": res.message,
									"type": res.status,
									"confirmButtonClass": "btn btn-secondary"
								});
								datatable.reload();
							} else {
								KTUtil.showNotifyAlert('danger', res.message, 'Wystąpił błąd', 'flaticon-warning-sign');
							}
						},
						error: function(err) {
							KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś jest nie tak..', 'flaticon-warning-sign');
						}
					});
				},1000);
			}
		});
	};

	var initOfferData = function() {
		datatable.on('kt-datatable--on-layout-updated', function(e) {
			var modalEl = $('#kt_fetch_offer');

			$('.show_offer_data').on('click', function() {
				var id = $(this).attr('data-id');

				KTUtil.clearInputInForm(formEl);

				KTApp.blockPage({ overlayColor: '#000000', type: 'v2', state: 'primary', message: 'Proszę czekać..' });

				$.ajax({
					url: '/rest/roffer/get',
					method: 'POST',
					data: { id: id },
					success: function(res) {
						setTimeout(function() {
								KTApp.unblockPage();

								if(res.client_info.user_id) {
									if(res.status == null) {
										modalEl.modal('show');

										var status = {
											1: {'title': 'Nowe', 'class': 'kt-font-brand'},
											2: {'title': 'Oczekujące', 'class': ' kt-font-dark'},
											3: {'title': 'Zrealizowane', 'class': ' kt-font-success'},
										};

										var type_corp = {
											0: {'title': 'akcyjna'},
											1: {'title': 'komandytowa'},
											2: {'title': 'z ograniczoną odpowiedzialnością'}
										};

										var roffer_type = {
											'leasing': 'leasing',
											'rent': 'wynajem',
											'insurance': 'ubezpieczenie'
										};

										var date = moment(res.created_at).local().format('YYYY');
										modalEl.find('#modalTitle').html('00' + res.id + '/' + date);
										modalEl.find('#idInput').val(res.id);
										modalEl.find('#typeInput').val(res.type);

										modalEl.find('#roffer_id').html('00' + res.id + '/' + date);
										modalEl.find('#roffer_status').html(status[res.state].title).addClass(status[res.state].class);
										modalEl.find('#roffer_type').html(roffer_type[res.type]);
										modalEl.find('#roffer_date_created').html(moment(res.created_at).local().format('YYYY-MM-DD HH:mm'));
										if(res.client_info.company == 0) {
											modalEl.find('#private_user').show();
											modalEl.find('#corp_user').hide();
											modalEl.find('#company_user').hide();
											//
											modalEl.find('#fullname').html(res.client_info.fullname);
										} else if(res.client_info.company == 1) {
											modalEl.find('#private_user').hide();
											modalEl.find('#corp_user').show();
											modalEl.find('#company_user').hide();
											//
											modalEl.find('#corp_name').html(res.client_info.fullname);
											modalEl.find('#corp_type').html(type_corp[res.client_info.company_type].title);
											modalEl.find('#corp_regon').html(res.client_info.regon);
										} else {
											modalEl.find('#private_user').hide();
											modalEl.find('#corp_user').hide();
											modalEl.find('#company_user').show();
											//
											modalEl.find('#company_name').html(res.client_info.fullname);
											modalEl.find('#company_regon').html(res.client_info.regon);
										}
										modalEl.find('#nip_user').html(res.client_info.nip);
										modalEl.find('#email_user').html(res.client_info.email);
										modalEl.find('#phone_user').html(res.client_info.phone);

										modalEl.find('input[name="percentage_partner"]').val(res.percentage_partner);

										if(res.type == 'leasing') {
											modalEl.find('#leasing_offer').show();
											modalEl.find('#rent_offer').hide();
											modalEl.find('#insurance_offer').hide();
											// Show provs
											modalEl.find('#provision_gapHide').show();
											modalEl.find('#provision_acocHide').show();

											if(res.percentage_acoc == null) {
												modalEl.find('#provision_acocInputHide').hide();
												modalEl.find('input[name="percentage_acoc"]').val('');
												$('input[name="exists_acoc"]').filter('[value="0"]').prop('checked', true);
											} else {
												modalEl.find('#provision_acocInputHide').show();
												modalEl.find('input[name="percentage_acoc"]').val(res.percentage_acoc);
												$('input[name="exists_acoc"]').filter('[value="1"]').prop('checked', true);
											}

											if(res.percentage_gap == null) {
												modalEl.find('#provision_gapInputHide').hide();
												modalEl.find('input[name="percentage_gap"]').val('');
												$('input[name="exists_gap"]').filter('[value="0"]').prop('checked', true);
											} else {
												modalEl.find('#provision_gapInputHide').show();
												modalEl.find('input[name="percentage_gap"]').val(res.percentage_gap);
												$('input[name="exists_gap"]').filter('[value="1"]').prop('checked', true);
											}

											$('input[name="exists_gap"]').on('change', function(e) {
												if($(this).val() == '1') modalEl.find('#provision_gapInputHide').show();
												else {
													 modalEl.find('#provision_gapInputHide').hide();
													 modalEl.find('input[name="percentage_gap"]').val('');
												}
											});

											$('input[name="exists_acoc"]').on('change', function(e) {
												if($(this).val() == '1') modalEl.find('#provision_acocInputHide').show();
												else {
													 modalEl.find('#provision_acocInputHide').hide();
													 modalEl.find('input[name="percentage_acoc"]').val('');
												}
											});
											//
											modalEl.find('input[name="nameItem"]').val(res.name);
											modalEl.find('select[name="pyear_l"] option[value="' + res.pyear + '"]').prop('selected', true);
											modalEl.find('select[name="leasing_installment"] option[value="' + res.instalments + '"]').prop('selected', true);
											modalEl.find('input[name="wklad_l"]').val(res.contribution);
											modalEl.find('input[name="wykup_l"]').val(res.red_value);
										} else if(res.type == 'rent') {
											modalEl.find('#leasing_offer').hide();
											modalEl.find('#rent_offer').show();
											modalEl.find('#insurance_offer').hide();
											//
											modalEl.find('#provision_gapHide').hide();
											modalEl.find('#provision_acocHide').show();

											if(res.percentage_acoc == null) {
												modalEl.find('#provision_acocInputHide').hide();
												modalEl.find('input[name="percentage_acoc"]').val('');
												$('input[name="exists_acoc"]').filter('[value="0"]').prop('checked', true);
											} else {
												modalEl.find('#provision_acocInputHide').show();
												$('input[name="exists_acoc"]').filter('[value="1"]').prop('checked', true);
												modalEl.find('input[name="percentage_acoc"]').val(res.percentage_acoc);
											}

											$('input[name="exists_acoc"]').on('change', function(e) {
												if($(this).val() == '1') modalEl.find('#provision_acocInputHide').show();
												else {
													 modalEl.find('#provision_acocInputHide').hide();
													 modalEl.find('input[name="percentage_acoc"]').val('');
												}
											});
											//
											modalEl.find('input[name="brand_r"]').val(res.name);
											var value_installment = res.installment_val.split(';');
											$('#month_installment').ionRangeSlider({
												type: "double",
												grid: true,
												min: 100,
												max: 5000,
												from: value_installment[0],
												to: value_installment[1],
												postfix: " PLN"
											});
											modalEl.find('select[name="body_type_r"] option[value="' + res.body_type + '"]').prop('selected', true);
											modalEl.find('select[name="fuel_type_r"] option[value="' + res.fuel_type + '"]').prop('selected', true);
											modalEl.find('select[name="rent_installment"] option[value="' + res.instalments + '"]').prop('selected', true);
											modalEl.find('input[name="wklad_r"]').val(res.contribution);
											modalEl.find('input[name="wykup_r"]').val(res.red_value);
											modalEl.find('input[name="service_pack"]').prop('checked', res.service);
											modalEl.find('input[name="tire_pack"]').prop('checked', res.tire);
											modalEl.find('input[name="insurance_pack"]').prop('checked', res.insurance);
										} else {
											modalEl.find('#leasing_offer').hide();
											modalEl.find('#rent_offer').hide();
											modalEl.find('#insurance_offer').show();
											//
											modalEl.find('#provision_gapHide').hide();
											modalEl.find('#provision_acocHide').hide();
											//
											modalEl.find('input[name="brand_i"]').val(res.name);
											modalEl.find('select[name="pyear_i"] option[value="' + res.pyear + '"]').prop('selected', true);
											modalEl.find('input[name="engine_cap_i"]').val(res.engine_cap);
											modalEl.find('input[name="power_cap_i"]').val(res.power_cap);
											modalEl.find('input[name="vin_number"]').val(res.vin);
											modalEl.find('input[name="reg_number"]').val(res.reg_number);
											modalEl.find('input[name="km_val_i"]').val(res.km_value);
										}
										modalEl.find('input[name="netto"]').val(res.netto);
										modalEl.find('textarea[name="attentions"]').val(res.attentions);
										modalEl.find('textarea[name="other"]').val(res.other);

										$('#list_of_companies').html('');
										initCompanySentList(res.id);

										/* ========================================
												@Information Podstrona 'Realizacja zapytania'
										========================================= */

										modalEl.find('#attached_files').html('');
										if(res.state == 3) {
											$('#send_request_notify').hide();
											$('#is_realized_notify').show();
											$('#dropzone_form_roffer').show();
											$('#summary_element').show();
											$('#realize_roffer').prop('disabled', true).text('Zapytanie zrealizowane');
											//
											formEl.find('input,select,textarea,button').not('button[data-dismiss="modal"],#realize_roffer,[type=hidden]').prop('disabled', true);
											$('#provisions_form').find('input').prop('disabled',true);
										} else if(res.state == 2) {
											$('#is_realized_notify').hide();
											$('#send_request_notify').show();
											$('#dropzone_form_roffer').show();
											$('#realize_roffer').prop('disabled', false).text('Zrealizuj zapytanie');
											$('#summary_element').show();
											formEl.find('input,select,textarea,button').not('button[data-dismiss="modal"],#realize_roffer,[type=hidden]').prop('disabled', true);
											$('#provisions_form').find('input').prop('disabled',false);
										} else {
											$('#send_request_notify').hide();
											$('#is_realized_notify').hide();
											$('#dropzone_form_roffer').hide();
											$('#summary_element').hide();
											$('#realize_roffer').prop('disabled', false).text('Zrealizuj zapytanie');
											formEl.find('input,select,textarea,button').not('button[data-dismiss="modal"],#realize_roffer,[type=hidden]').prop('disabled', false);
											$('#provisions_form').find('input').prop('disabled',false);
										}

										if(userDataRole == 'administrator') {
											$.ajax({
												url: '/rest/company/list',
												method: 'POST',
												success: function(response) {
													if(response.success == null) {
														response.forEach(function(element) {
															modalEl.find('#company_list').append('<option value="' + element.email + '">' + element.fullname + '</option>');
														});

														$('#company_list').selectpicker('refresh');
													}
												},
												error: function(err) { }
											});
										}

										/* ========================================
												@Information Załadowanie plików
										========================================= */
										f_path = 'roffer_' + res.id + '_' + moment(res.created_at).local().format('YYYY');
										$.ajax({
											url: '/rest/files/get',
											method: 'POST',
											data: { folder_path: 'roffers/' + f_path },
											success: function(res) {
												if(res.files) {
													if(res.files.length != 0) {
														res.files.forEach(file => {
															var extension = file.split('.');
															if(userDataRole == 'administrator') {
																if(file.indexOf('-verified') !== -1) {
																	var green_class = 'kt-font-success';
																} else var green_class = '';
																modalEl.find('#attached_files').append('\<div class="kt-widget4__item">\
																		<div class="kt-widget4__pic kt-widget4__pic--icon">\
																			<img src="./assets/media/files/' + ext[extension[1]] + '.svg" alt="">\
																		</div>\
																		<a href="javascript:;" class="kt-widget4__title ' + green_class + '">' + file + '</a>\
																		<div class="kt-widget4__tools">\
																			<a href="javascript:;" data-path="' + f_path + '/' + file + '"  class="btn btn-clean btn-icon btn-sm show_file">\
																				<i class="flaticon2-accept"></i>\
																			</a>\
																			<a href="javascript:;" data-path="' + f_path + '/' + file + '"  class="btn btn-clean btn-icon btn-sm download_file">\
																				<i class="flaticon2-download"></i>\
																			</a>\
																			<a href="javascript:;" data-path="' + f_path + '/' + file + '" class="btn btn-clean btn-icon btn-sm remove_file">\
																				<i class="flaticon2-delete"></i>\
																			</a>\
																		</div>\
																	</div>\
																');
															} else {
																if(file.indexOf('-verified') !== -1) {
																	modalEl.find('#attached_files').append('\<div class="kt-widget4__item">\
																			<div class="kt-widget4__pic kt-widget4__pic--icon">\
																				<img src="./assets/media/files/' + ext[extension[1]] + '.svg" alt="">\
																			</div>\
																			<a href="javascript:;" class="kt-widget4__title kt-font-success">' + file + '</a>\
																			<div class="kt-widget4__tools">\
																				<a href="javascript:;" data-path="' + f_path + '/' + file + '"  class="btn btn-clean btn-icon btn-sm download_file">\
																					<i class="flaticon2-download"></i>\
																				</a>\
																			</div>\
																		</div>\
																	');
																}
															}
														});
													}
												}
											},
											error: function(err) {
												throw err;
											}
										});

										modalEl.on('hidden.bs.modal', function() {
											modalEl.find('#roffer_status').removeClass(status[res.state].class);
											modalEl.find('#company_list').html('');
										});
								} else {
									return KTUtil.showNotifyAlert('danger', res.message, 'Wystąpił błąd', 'flaticon-warning-sign');
								}
							} else {
								return KTUtil.showNotifyAlert('danger', 'Konto klienta nie zostało przypisane do pracownika.', 'Wystąpił błąd', 'flaticon-warning-sign');
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
		});

		$(document).on('click', '.delete_roffer', function() {
			var id = $(this).attr('data-id');

			swal.fire({
				html: "Jesteś pewny że chcesz usunąć to zapytanie ofertowe?",
				type: "info",

				confirmButtonText: "Usuń",
				confirmButtonClass: "btn btn-sm btn-bold btn-brand",

				showCancelButton: true,
				cancelButtonText: "Anuluj",
				cancelButtonClass: "btn btn-sm btn-bold btn-default"
			}).then(function(result) {
				if (result.value) {
					$.ajax({
						url: '/rest/roffer/delete',
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

	var initProvisionForm = function() {
		var button = $('button[type="submit"]', provisionsForm);

		button.on('click', function() {
			if(provision_validator.form()) {
				KTApp.progress(button);
				button.attr('disabled', true);
				setTimeout(function() {
					$.ajax({
						url: '/rest/roffer/done',
						method: 'POST',
						data: provisionsForm.serialize() + '&roffer_id=' + $('#idInput').val(),
						success: function(realize) {
							//
							if(realize.status == 'success') {
								$('#is_realized_notify').show();
								$('#provisions_form').find('input').prop('disabled',true);
								$('#send_request_notify').hide();
								swal.fire({
									"title": "",
									"text": realize.message,
									"type": realize.status,
									"confirmButtonClass": "btn btn-secondary"
								});
								$('#summary_element').show();
								KTApp.unprogress(button);
								button.prop('disabled', true).text('Zapytanie zrealizowane');
								datatable.reload();
							} else {
								swal.fire({
									"title": "",
									"text": realize.message,
									"type": realize.status,
									"confirmButtonClass": "btn btn-secondary"
								});
								KTApp.unprogress(button);
								button.attr('disabled', false);
							}
						},
						error: function(err) {
							KTApp.unprogress(button);
							button.attr('disabled', false);
							KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Wystąpił błąd', 'flaticon-warning-sign');
						}
					});
				}, 1000);
			}
		});
	}

	// search
	var search = function() {
		var local_storage = JSON.parse(localStorage.getItem('kt_apps_offer_list_datatable-1-meta'));
		if(local_storage.sort.field == 'created_at' && local_storage.sort.sort == 'desc')
			$('#kt_form_sort option[value=""]').prop('selected', true);
		else if(local_storage.sort.field == 'created_at' && local_storage.sort.sort == 'asc')
			$('#kt_form_sort option[value="1"]').prop('selected', true);
		else $('#kt_form_sort option[value="2"]').prop('selected', true);

		$('.kt-selectpicker').selectpicker('refresh');

		$('#kt_form_status').on('change', function() {
			datatable.search($(this).val().toLowerCase(), 'state');
		});

		$('#kt_form_sort').on('change', function() {
			if($(this).val() == '') datatable.sort('created_at', 'desc');
			else if($(this).val() == '1') datatable.sort('created_at', 'asc');
			else datatable.sort('fullname', 'desc');
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

			var userText = 'zapytania';
			if(ids.length == 1) userText = 'zapytanie';

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
							url: '/rest/roffer/sdelete',
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

	var initFileButtons = function() {
		$(document).on('click', '.download_file', function() {
			var path = 'roffers/' + $(this).attr('data-path');

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
			var path = 'roffers/' + $(this).attr('data-path'),
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

		$(document).on('click', '.show_file', function() {
			var element = $(this);
			var splited_path = element.attr('data-path').split('/');
			var path = 'roffers/' + element.attr('data-path');

			$.ajax({
				url: '/rest/file/rename',
				method: 'POST',
				data: { path: path },
				success: function(res) {
					if(res.status == 'success') {
						if(res.verified) {
							element.parent().prev().addClass('kt-font-success').html(res.fname);
							element.attr('data-path', splited_path[0] + '/' + res.fname);
						} else {
							element.parent().prev().removeClass('kt-font-success').html(res.fname);
							element.attr('data-path', splited_path[0] + '/' + res.fname);
						}
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
				error: function(err) { }
			});
		});
	}

	var initCompanySentList = function(id) {
		$.ajax({
			url: '/rest/company/getsentlist',
			method: 'POST',
			data: {
				id: id
			},
			success: function(res) {
				if(res.length != 0) {
					$('#loc_box').show();
					$('#list_of_companies').html(res.toString());
				} else {
					$('#loc_box').hide();
					$('#list_of_companies').html('Nie wysłano');
				}
			},
			error: function(err) { }
		});
	}

	var initDropzone = function() {
		var id = '#kt_dropzone_more_files';
		var previewNode = $(id + ' .dropzone-item');
		previewNode.id = "";
		var previewTemplate = previewNode.parent('.dropzone-items').html();
		previewNode.remove();

		$('#kt_dropzone_more_files').dropzone({
			url: '/rest/files/upload/mfiles',
			autoProcessQueue: false,
			paramName: function() { return 'source_file[]' }, // The name that will be used to transfer the file
			previewTemplate: previewTemplate,
			maxFiles: 5,
			maxFilesize: 5, // MB
			uploadMultiple: true,
			parallelUploads: 5,
			previewsContainer: id + ' .dropzone-items',
			clickable: id + ' .dropzone-select',
			acceptedFiles: "application/pdf,.docx,.odt,.xls,.jpg,.png,.jpeg",
			init: function() {
				dz_upload = this;

				this.on("addedfile", function(file) {
					$(document).find(id + ' .dropzone-item').css('display', '');
				});

				this.on("removedfile", function(file) {
					if(dz_upload.files.length < 1) {
						$(document).find(id + ' .dropzone-item').css('display', 'none');
					}
				});
			}
		});

		$('#kt_dropzone_request_offer').dropzone({
			url: '/rest/files/upload/roffer',
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
								<a href="javascript:;" data-path="' + f_path + '/' + file.name + '"  class="btn btn-clean btn-icon btn-sm show_file">\
									<i class="flaticon2-accept"></i>\
								</a>\
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
						"text": "Pliki zostały pomyślnie przesłane.",
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

	return {
		// public functions
		init: function() {
			formEl = $('#kt_roffer_edit');
			formCompanyList = $('#send_request_offer');
			provisionsForm = $('#provisions_form');
			$('.kt-selectpicker').selectpicker({
				noneSelectedText : 'Nie wybrano'
			});

			init();
			initOfferData();
			initValidation();
			initValidationCompany();
			initSubmitData();
			initSendOfferCompanies();
			initFileButtons();
			initDropzone();
			selection();
			selectedDelete();
			updateTotal();
			search();
		},
	};
}();

// On document ready
KTUtil.ready(function() {
	KTROfferListDatatable.init();
});
