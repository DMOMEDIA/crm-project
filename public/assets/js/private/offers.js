"use strict";
// Class definition

var KTOfferListDatatable = function() {

	// variables
	var datatable, formEl, validator, slider_min = 0, slider_max = 0, f_path;

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
		datatable = $('#kt_apps_offerlist').KTDatatable({
			// datasource definition
			data: {
				type: 'remote',
				source: {
					read: {
						url: '/rest/offerlist'
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
				field: "idOffer",
				title: "ID oferty",
				sortable: false,
				autoHide: false,
				width: 100,
				template: function(row) {
					var date = moment(row.created_at).local().format('YYYY');
					return '<a href="javascript:;" class="show_offer_data" data-id="' + row.id + '" data-type="' + row.offer_type + '">00' + row.id + '/' + row.offer_type.charAt(0).toUpperCase() + '/' + date + '</a>';
				}
			}, {
				field: "created_at",
				title: "Data utworzenia",
				sortable: false,
				template: function(row) {
					return moment(row.created_at).local().format('YYYY-MM-DD HH:mm');
				}
			}, {
				field: "client",
				title: "Klient",
				template: function(row) {
					return row.client.fullname;
				}
			}, {
				field: "company",
				title: "Firma",
				template: function(row) {
					return '<span data-skin="dark" data-toggle="kt-tooltip" data-placement="bottom" title="' + row.company.fullname + '">' + row.company.fullname + '</span>';
				}
			}, {
				field: "offer_type",
				title: "Typ oferty",
				template: function(row) {
					var output = null;
					if(row.offer_type == 'rent') output = 'wynajem';
					else if(row.offer_type == 'insurance') output = 'ubezpieczenie';
					else output = 'leasing';
					return '<span class="kt-badge kt-badge--dark kt-badge--inline kt-badge--pill">' + output + '</span>';
				}
			}, {
				field: 'state',
				title: 'Status',
				autoHide: false,
				template: function(row) {
					var status = {
						0: {'title': 'Niewysłana', 'class': 'kt-badge--dark'},
						1: {'title': 'Oczekująca', 'class': 'kt-badge--brand'},
						2: {'title': 'Anulowana', 'class': ' kt-badge--danger'},
						3: {'title': 'Zrealizowana', 'class': ' kt-badge--success'}
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
						<a href="javascript:;" class="btn btn-sm btn-clean btn-icon btn-icon-md show_offer_data" data-id="' + row.id + '" data-type="' + row.offer_type + '">\
							<i class="flaticon2-menu-1"></i>\
						</a>\
					';
				}
			}]
		}),
		$("#kt_form_status").on("change", function() {
      datatable.search($(this).val().toLowerCase(), "Status")
    });
	}

	var initOfferData = function() {
		datatable.on('kt-datatable--on-layout-updated', function(e) {
			var modalEl = $('#kt_fetch_offer');

			$('.show_offer_data').on('click', function() {
				var id = $(this).attr('data-id'),
				type = $(this).attr('data-type');

				KTUtil.clearInputInForm(formEl);
				modalEl.find('select[name="condition_l"] option[value="nowy"]').prop('selected', true);

				KTApp.blockPage({ overlayColor: '#000000', type: 'v2', state: 'primary', message: 'Proszę czekać..' });

				$.ajax({
					url: '/rest/offer/get',
					method: 'POST',
					data: { id: id, type: type },
					success: function(res) {
						setTimeout(function() {
								KTApp.unblockPage();

								if(res.status == null) {
									modalEl.modal('show');
									modalEl.find('#attached_files').html('');

									var date = moment(res.created_at).local().format('YYYY');
									var status = {
										0: {'title': 'Niewysłana', 'class': 'kt-badge--dark'},
										1: {'title': 'Oczekująca', 'class': 'kt-badge--brand'},
										2: {'title': 'Anulowana', 'class': ' kt-badge--danger'},
										3: {'title': 'Zrealizowana', 'class': ' kt-badge--success'}
									};
									var offer_type = {
										'rent': 'wynajem',
										'insurance': 'ubezpieczenie',
										'leasing': 'leasing'
									};

									modalEl.find('select[name="change_type"] option[value="' + res.state + '"]').prop('selected', true);

									//
									modalEl.find('#idInput1').val(res.id);
									modalEl.find('#idInput3').val(res.id);
									modalEl.find('#typeInput1').val(res.offer_type);
									modalEl.find('#typeInput3').val(res.offer_type);
                	modalEl.find('#modalTitle').html('00' + res.id + '/' + res.offer_type.charAt(0).toUpperCase() + '/' + date + ' - Klient: ' + res.client.fullname);
									modalEl.find('#offer_status').addClass(status[res.state].class).html(status[res.state].title);
									modalEl.find('#offer_date').html(moment(res.created_at).local().format('YYYY-MM-DD HH:mm'));

									if(res.client.company == 0) {
										modalEl.find('#private_user').show();
										modalEl.find('#company_user').hide();
									} else {
										modalEl.find('#private_user').hide();
										modalEl.find('#company_user').show();
									}

									modalEl.find('#client_fullname').html(res.client.fullname);
									modalEl.find('#client_company').html(res.client.fullname);
									modalEl.find('#client_nip').html(res.client.nip);
									modalEl.find('#client_email').html(res.client.email);
									modalEl.find('#client_phone').html(res.client.phone);
									//
									modalEl.find('#company_name').html(res.company.fullname);
									modalEl.find('#company_nip').html(res.company.nip);
									modalEl.find('#company_address').html(res.company.address);
									modalEl.find('#company_address_cd').html(res.company.postcode + ' ' + res.company.city);
									modalEl.find('#company_voivodeship').html(res.company.voivodeship);
									modalEl.find('#company_email').html(res.company.email);
									modalEl.find('#company_phone').html(res.company.phone);

									if(res.offer_type == 'leasing') {
										$('#leasing_type_box').show();
										$('#rent_type_box').hide();
										$('#insurance_type_box').hide();
										//
										modalEl.find('select[name="item_type_l"] option[value="' + res.item_type + '"]').prop('selected', true);
										modalEl.find('input[name="brand_l"]').val(res.name);
										modalEl.find('select[name="condition_l"] option[value="' + res.condition + '"]').prop('selected', true);
										modalEl.find('input[name="pyear_l"]').val(res.production_year);
										modalEl.find('input[name="netto_l"]').val(res.netto);
										modalEl.find('select[name="invoice_l"] option[value="' + res.invoice + '"]').prop('selected', true);

										modalEl.find('input[name="vid"]').val(res.variants.id);
										modalEl.find('input[name="contract"]').val(res.variants.okres);
										modalEl.find('input[name="inital_fee"]').val(res.variants.wklad);
										modalEl.find('input[name="leasing_install"]').val(res.variants.leasing_install);
										modalEl.find('input[name="repurchase"]').val(res.variants.wykup);
										modalEl.find('input[name="sum_fee"]').val(res.variants.total_fees);
									} else if(res.offer_type == 'rent') {
										$('#leasing_type_box').hide();
										$('#rent_type_box').show();
										$('#insurance_type_box').hide();
										//
										var value_installment = res.rata.split(';');
										modalEl.find('input[name="brand_r"]').val(res.marka_model);
										modalEl.find('select[name="body_type_r"] option[value="' + res.typ + '"]').prop('selected', true);
										modalEl.find('select[name="fuel_type_r"] option[value="' + res.fuel_type + '"]').prop('selected', true);
										modalEl.find('select[name="gear_type_r"] option[value="' + res.gear_type + '"]').prop('selected', true);
										$('#month_installment').ionRangeSlider({
												type: "double",
												grid: true,
												min: 0,
												max: 5000,
												from: value_installment[0],
												to: value_installment[1],
												postfix: " PLN",
												onStart: function(data) {
													slider_min = data.from;
													slider_max = data.to;
												},
												onFinish: function(data) {
													slider_min = data.from;
													slider_max = data.to;
												}
										});
										modalEl.find('input[name="vehicle_val_r"]').val(res.netto);
										modalEl.find('input[name="rent_time_r"]').val(res.okres);
										modalEl.find('input[name="self_deposit_r"]').val(res.wplata);
										modalEl.find('input[name="km_limit_r"]').val(res.limit);
										modalEl.find('select[name="invoice_r"] option[value="' + res.invoice + '"]').prop('selected', true);
									} else {
										$('#leasing_type_box').hide();
										$('#rent_type_box').hide();
										$('#insurance_type_box').show();
										//
										modalEl.find('input[name="brand_i"]').val(res.marka_model);
										modalEl.find('input[name="version_i"]').val(res.wersja);
										modalEl.find('select[name="body_type_i"] option[value="' + res.typ + '"]').prop('selected', true);
										modalEl.find('input[name="pyear_i"]').val(res.rok_produkcji);
										modalEl.find('input[name="km_val_i"]').val(res.przebieg);
										modalEl.find('input[name="vehicle_val_i"]').val(res.netto);
										modalEl.find('input[name="insurance_cost"]').val(res.insurance_cost);
										modalEl.find('input[name="engine_cap_i"]').val(res.pojemnosc);
										modalEl.find('input[name="power_cap_i"]').val(res.moc);
										modalEl.find('input[name="vin_number"]').val(res.vin_number);
										modalEl.find('input[name="reg_number"]').val(res.reg_number);
									}

									f_path = 'offer_' + res.id + '_' + res.offer_type.charAt(0).toUpperCase() + '_' + moment(res.created_at).local().format('YYYY');
									$.ajax({
										url: '/rest/files/get',
										method: 'POST',
										data: { folder_path: 'offer/' + f_path },
										success: function(res) {
											if(res.files.length != 0) {
												res.files.forEach(file => {
													var extension = file.split('.');
													modalEl.find('#attached_files').append('\<div class="kt-widget4__item">\
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
										},
										error: function(err) {
											throw err;
										}
									});

									// Hide modal event
									$('#kt_fetch_offer').on('hidden.bs.modal', function (e) {
										modalEl.find('#offer_status').removeClass(status[res.state].class);
									});
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

	var initFileButtons = function() {
		$(document).on('click', '.download_file', function() {
			var path = 'offer/' + $(this).attr('data-path');

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
			var path = 'offer/' + $(this).attr('data-path'),
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

	var initValidation = function() {
    $("#pyear_l").inputmask('9999');
		$("#pyear_i").inputmask('9999');
		$("#engine_cap_i").inputmask('99999 cm³', { placeholder: "" });
		$("#km_val_i").inputmask('9999999 km', { numericInput: true, placeholder: "" });
		$("#rent_time_r").inputmask('99 miesięcy');
		$("#km_limit_r").inputmask('999999 km', { numericInput: true, placeholder: "" });
		$("#power_cap_i").inputmask('999 km', { numericInput: true, placeholder: "" });

		$('#vin_number').maxlength({
        warningClass: "kt-badge kt-badge--warning kt-badge--rounded kt-badge--inline",
        limitReachedClass: "kt-badge kt-badge--success kt-badge--rounded kt-badge--inline",
				appendToParent: true
    });

		validator = formEl.validate({
			// Validate only visible fields
			ignore: ":hidden",

			// Validation rules
			rules: {
				//= Step 3
				// Typ - leasing
				item_type_l: {
					required: true
				},
				brand_l: {
					required: true
				},
				condition_l: {
					required: true
				},
				pyear_l: {
					required: true
				},
				netto_l: {
					required: true
				},
				invoice_l: {
					required: true
				},
				// Typ - Wypożyczenie
				brand_r: {
					required: true
				},
				body_type_r: {
					required: true
				},
				fuel_type_r: {
					required: true
				},
				gear_type_r: {
					required: true
				},
				vehicle_val_r: {
					required: true
				},
				rent_time_r: {
					required: true
				},
				self_deposit_r: {
					required: true
				},
				km_limit_r: {
					required: true
				},
				invoice_r: {
					required: true
				},
				// Typ - ubezpieczenie
				brand_i: {
					required: true
				},
				body_type_i: {
					required: true
				},
				pyear_i: {
					required: true,
					digits: true,
					minlength: 4,
					maxlength: 4
				},
				km_val_i: {
					required: true
				},
				engine_cap_i: {
					required: true
				},
				power_cap_i: {
					required: true
				},
				vin_number: {
					required: true,
					minlength: 17,
					maxlength: 17
				},
				reg_number: {
					required: true
				},
				vehicle_val_i: {
					required: true
				},
				insurance_cost: {
					required: true
				}
			},
			messages: {
				client_id: {
					required: 'To pole jest wymagane.'
				},
				company_id: {
					required: 'To pole jest wymagane.'
				},
				item_type_l: {
					required: 'To pole jest wymagane.'
				},
				brand_l: {
					required: 'To pole jest wymagane.'
				},
				condition_l: {
					required: 'To pole jest wymagane.'
				},
				pyear_l: {
					required: 'To pole jest wymagane.'
				},
				netto_l: {
					required: 'To pole jest wymagane.'
				},
				invoice_l: {
					required: 'To pole jest wymagane.'
				},
				brand_r: {
					required: 'To pole jest wymagane.'
				},
				body_type_r: {
					required: 'To pole jest wymagane.'
				},
				fuel_type_r: {
					required: 'To pole jest wymagane.'
				},
				gear_type_r: {
					required: 'To pole jest wymagane.'
				},
				vehicle_val_r: {
					required: 'To pole jest wymagane.'
				},
				rent_time_r: {
					required: 'To pole jest wymagane.'
				},
				self_deposit_r: {
					required: 'To pole jest wymagane.'
				},
				km_limit_r: {
					required: 'To pole jest wymagane.'
				},
				invoice_r: {
					required: 'To pole jest wymagane.'
				},
				brand_i: {
					required: 'To pole jest wymagane.'
				},
				body_type_i: {
					required: 'To pole jest wymagane.'
				},
				pyear_i: {
					required: 'To pole jest wymagane.',
					digits: 'To pole może zawierać jedynie cyfry.',
					minlength: 'To pole musi składać się z {0} cyfr.',
					maxlength: 'To pole musi składać się z {0} cyfr.'
				},
				km_val_i: {
					required: 'To pole jest wymagane.'
				},
				engine_cap_i: {
					required: 'To pole jest wymagane.'
				},
				power_cap_i: {
					required: 'To pole jest wymagane.'
				},
				vin_number: {
					required: 'To pole jest wymagane.',
					minlength: 'Numer VIN musi składać się z {0} znaków.',
					maxlength: 'Numer VIN musi składać się z {0} znaków.'
				},
				reg_number: {
					required: 'To pole jest wymagane.'
				},
				vehicle_val_i: {
					required: 'To pole jest wymagane.'
				},
				insurance_cost: {
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

	var initChangeStatus = function() {
		var form_status = $('#form_change_status'),
		btn = $('button[type="submit"]', form_status);

		btn.on('click', function(e) {
			e.preventDefault();

			KTApp.progress(btn);
			btn.attr('disabled', true);

			setTimeout(function() {
				form_status.ajaxSubmit({
					url: '/rest/offer/status',
					method: 'POST',
					data: form_status.serialize(),
					success: function(res) {
						KTApp.unprogress(btn);
						btn.attr('disabled', false);

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
		});
	}

	var initUploadData = function() {
		var modalEl = $('#kt_fetch_user'),
		btn = $('button[type="submit"]', formEl);
		
		btn.on('click', function(e) {
			e.preventDefault();

			if(validator.form()) {
				KTApp.progress(btn);
				btn.attr('disabled', true);

				setTimeout(function() {
					formEl.ajaxSubmit({
						url: '/rest/offer/data',
						method: 'POST',
						data: formEl.serialize(),
						success: function(res) {
							KTApp.unprogress(btn);
							btn.attr('disabled', false);

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

	var initRepeater = function() {
    $('#leasing_variants').repeater({
        initEmpty: false,
        defaultValues: {
            'text-input': 'foo'
        },
        show: function () {
            $(this).slideDown();
						$('[name*="contract"]').each(function() { $(this).rules('add', { required: true, messages: { required: 'To pole jest wymagane.' } }); });
						$('[name*="inital_fee"]').each(function() { $(this).rules('add', { required: true, messages: { required: 'To pole jest wymagane.' } }); });
						$('[name*="leasing_install"]').each(function() { $(this).rules('add', { required: true, messages: { required: 'To pole jest wymagane.' } }); });
						$('[name*="repurchase"]').each(function() { $(this).rules('add', { required: true, messages: { required: 'To pole jest wymagane.' } }); });
						$('[name*="sum_fee"]').each(function() { $(this).rules('add', { required: true, messages: { required: 'To pole jest wymagane.' } }); });
        },
        hide: function (deleteElement) {
            $(this).slideUp(deleteElement);
        },
        isFirstItemUndeletable: true
    });
	}

	var initDropzone = function() {
		$('#kt_dropzone_offer').dropzone({
			url: '/rest/files/upload',
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

	var updateTotal = function() {
		datatable.on('kt-datatable--on-layout-updated', function () {
			//$('#kt_subheader_total').html(datatable.getTotalRows() + ' Total');
		});
	};


		// selected records delete
		var selectedDelete = function() {
			$('#kt_subheader_group_actions_delete_all').on('click', function() {
				// fetch selected IDs
				var ids = datatable.rows('.kt-datatable__row--active').nodes().find('.kt-checkbox--single > [type="checkbox"]').map(function(i, chk) {
					return $(chk).val();
				});

				var rowData = datatable.rows('.kt-datatable__row--active').nodes().find('td[data-field="offer_type"]').map(function(i, chk) {
					return $(chk).text();
				});

				var elements = [];
				for(var i = 0; i <= ids.length-1; i++) {
					elements.push({ id: ids[i], type: rowData[i] });
				}

				console.log(elements);

				var userText = 'ofert/y';
				if(ids.length == 1) userText = 'ofertę';

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
								url: '/rest/offer/sdelete',
								method: 'POST',
								data: { data: elements },
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

	return {
		// public functions
		init: function() {
			formEl = $('#kt_offer_edit');

			init();
			initOfferData();
			initValidation();
			initUploadData();
			initChangeStatus();
			initFileButtons();
			initDropzone();
			selection();
			selectedDelete();
		},
	};
}();

// On document ready
KTUtil.ready(function() {
	KTOfferListDatatable.init();
});
