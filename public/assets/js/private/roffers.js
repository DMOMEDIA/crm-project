"use strict";
// Class definition

var KTROfferListDatatable = function() {

	// variables
	var datatable, validator, formEl, f_path;
	var formCompanyList, formCompany_valid;

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
				pageSize: 10, // display 20 records per page
				serverPaging: true,
				serverFiltering: false,
				serverSorting: false,
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
				delay: 400,
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
						<a href="javascript:;" class="btn btn-sm btn-clean btn-icon btn-icon-md show_offer_data" data-id="' + row.id + '">\
							<i class="flaticon2-menu-1"></i>\
						</a>\
					';
				}
			}]
		});
	}

	var initValidation = function() {
		$('#wklad_l').inputmask({ 'alias': 'currency', rightAlign: false, digits: 2, prefix: '', clearMaskOnLostFocus: true });
		$('#wykup_l').inputmask({ 'alias': 'percentage', min:0, max:100, rightAlign: false });
		$('#netto_val').inputmask({ 'alias': 'currency', rightAlign: false, digits: 2, clearMaskOnLostFocus: true, min: 1, prefix: '' });
		$("#engine_cap_i").inputmask('99999 cm³', { placeholder: "" });
		$("#km_val_i").inputmask('9999999 km', { numericInput: true, placeholder: "" });
		$("#power_cap_i").inputmask('999 km', { numericInput: true, placeholder: "" });

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

				setTimeout(function() {
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
								formCompanyList.hide();
								$('#send_request_notify').show();
								$('#dropzone_form_roffer').show();

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

									if(res.type == 'leasing') {
										modalEl.find('#leasing_offer').show();
										modalEl.find('#rent_offer').hide();
										modalEl.find('#insurance_offer').hide();
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
									} else {
										modalEl.find('#leasing_offer').hide();
										modalEl.find('#rent_offer').hide();
										modalEl.find('#insurance_offer').show();

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
									modalEl.find('textarea[name="attentions"]').text(res.attentions);
									modalEl.find('textarea[name="other"]').text(res.other);

									/* ========================================
											@Information Podstrona 'Realizacja zapytania'
									========================================= */

									modalEl.find('#attached_files').html('');
									if(res.state == 2) {
										formCompanyList.hide();
										$('#send_request_notify').show();
										$('#dropzone_form_roffer').show();
									} else {
										formCompanyList.show();
										$('#send_request_notify').hide();
										$('#dropzone_form_roffer').hide();
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
															modalEl.find('#attached_files').append('\<div class="kt-widget4__item">\
																	<div class="kt-widget4__pic kt-widget4__pic--icon">\
																		<img src="./assets/media/files/' + ext[extension[1]] + '.svg" alt="">\
																	</div>\
																	<a href="javascript:;" class="kt-widget4__title">' + file + '</a>\
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
															modalEl.find('#attached_files').append('\<div class="kt-widget4__item">\
																	<div class="kt-widget4__pic kt-widget4__pic--icon">\
																		<img src="./assets/media/files/' + ext[extension[1]] + '.svg" alt="">\
																	</div>\
																	<a href="javascript:;" class="kt-widget4__title">' + file + '</a>\
																	<div class="kt-widget4__tools">\
																		<a href="javascript:;" data-path="' + f_path + '/' + file + '"  class="btn btn-clean btn-icon btn-sm download_file">\
																			<i class="flaticon2-download"></i>\
																		</a>\
																	</div>\
																</div>\
															');
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
	}

	// search
	var search = function() {
		$('#kt_form_status').on('change', function() {
			datatable.search($(this).val().toLowerCase(), 'state');
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

					var a = document.createElement('a');
			    var url = window.URL.createObjectURL(res);
			    a.href = url;
			    a.download = fileName;
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
			var path = 'roffers/' + $(this).attr('data-path');


			console.log('Path file: ' + path);
			$(this).parent().prev().addClass('kt-font-success');
			/* $.ajax({
				url: '/rest/file/download',
				method: 'POST',
				data: { path: path },
				xhrFields: {
					responseType: 'blob'
				},
				success: function(res, status, xhr) {
					var fileName = xhr.getResponseHeader('Content-Disposition').split("=")[1];
					fileName = fileName.replace(/\"/g, '');

					var a = document.createElement('a');
			    var url = window.URL.createObjectURL(res);
			    a.href = url;
			    a.download = fileName;
			    a.click();
			    window.URL.revokeObjectURL(url);
				},
				error: function(err) {
					KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Wystąpił błąd', 'flaticon-warning-sign');
				}
			}); */
		});
	}

	var initDropzone = function() {
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
								<a href="javascript:;" data-path="' + f_path + '/' + file + '"  class="btn btn-clean btn-icon btn-sm show_file">\
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
		},
	};
}();

// On document ready
KTUtil.ready(function() {
	KTROfferListDatatable.init();
});
