"use strict";
// Class definition

var KTOfferListDatatable = function() {

	// variables
	var datatable, formEl, validator, slider_min = 0, slider_max = 0, f_path,
	prov_validator, original_sum_perc = parseFloat(0), prov_form;

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
			},

			// layout definition
			layout: {
				scroll: false, // enable/disable datatable scroll both horizontal and vertical when needed.
				footer: false, // display/hide footer
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
				sortable: 'desc',
				template: function(row) {
					return moment(row.created_at).local().format('YYYY-MM-DD HH:mm');
				}
			}, {
				field: "client",
				title: "Klient",
				sortable: false,
				template: function(row) {
					return row.client.fullname;
				}
			}, {
				field: "company",
				title: "Firma",
				sortable: false,
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
						1: {'title': 'Niewysłana', 'class': 'kt-badge--dark'},
						2: {'title': 'Oczekująca', 'class': 'kt-badge--brand'},
						3: {'title': 'Anulowana', 'class': ' kt-badge--danger'},
						4: {'title': 'Zrealizowana', 'class': ' kt-badge--success'}
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
      datatable.search($(this).val().toLowerCase(), "state");
    });

		$("#kt_form_type").on("change", function() {
      datatable.search($(this).val().toLowerCase(), "offer_type");
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
									modalEl.find('#leasing_variants').html('');
									$('#your_provision').html('0.00');
									$('#partner_prov_box,#agent_prov_box,#employee_prov_box').hide();

									var date = moment(res.created_at).local().format('YYYY');

									var status = {
										1: {'title': 'Niewysłana', 'class': 'kt-badge--dark'},
										2: {'title': 'Oczekująca', 'class': 'kt-badge--brand'},
										3: {'title': 'Anulowana', 'class': ' kt-badge--danger'},
										4: {'title': 'Zrealizowana', 'class': ' kt-badge--success'}
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

									$.ajax({
										url: '/rest/offer/calc_prov',
										method: 'POST',
										data: {
											offer_id: res.id,
											type: res.offer_type
										},
										success: function(response) {
											if(response.partner_id) {
												if(response.provision) {
													var provision = parseFloat(response.provision);
													original_sum_perc = 0;

													$.ajax({
														url: '/rest/offer/get_provision',
														method: 'POST',
														data: {
															offer_id: res.id + '/' + res.offer_type
														},
														success: function(get_prov) {
															$('#your_prov_box').show();
															if(get_prov.your_prov) {
																$('#your_provision').html(parseFloat(get_prov.your_prov).toFixed(2));
															}
															else $('#your_provision').html('0.00');
														},
														error: function(err) { }
													})

													$('#provisions_element').show();
													if(response.message == 'partner_and_agent_found') {
														$('#partner_prov_box,#agent_prov_box,#employee_prov_box').show();
													} else if(response.message == 'user_is_partner') {
														$('#partner_prov_box').show();
													} else if(response.message == 'user_has_partner' && response.creator_role == 'posrednik') {
														$('#partner_prov_box,#agent_prov_box').show();
													} else {
														$('#partner_prov_box,#employee_prov_box').show();
													}

													if(response.prov_partner) {
														$('input[name="partner_prov"]').val(response.prov_partner);
														var a = Math.round((provision*(response.prov_partner.split(' ')[0]/100))*100)/100;
														$('#pay_partner_prov').html(a.toFixed(2));
														//
														$('#general_prov').html('0.00');
														original_sum_perc += parseFloat(response.prov_partner.split(' ')[0]);
													} else {
														$('#general_prov').html(provision.toFixed(2));
														$('input[name="partner_prov"]').val('');
														$('#pay_partner_prov').html('0.00');
													}

													if(response.prov_agent) {
														$('input[name="agent_prov"]').val(response.prov_agent);
														var a = Math.round((provision*(response.prov_agent.split(' ')[0]/100))*100)/100;
														$('#pay_agent_prov').html(a.toFixed(2));
														original_sum_perc += parseFloat(response.prov_agent.split(' ')[0]);
													} else {
														$('input[name="agent_prov"]').val('');
														$('#pay_agent_prov').html('0.00');
													}

													if(response.prov_employee) {
														$('input[name="employee_prov"]').val(response.prov_employee);
														var a = Math.round((provision*(response.prov_employee.split(' ')[0]/100))*100)/100;
														$('#pay_employee_prov').html(a.toFixed(2));
														original_sum_perc += parseFloat(response.prov_employee.split(' ')[0]);
													} else {
														$('input[name="employee_prov"]').val('');
														$('#pay_employee_prov').html('0.00');
													}

													$('#general_perc').html(response.percentage);

													prov_form.find('input[name="offer_id"]').val(res.id);
													prov_form.find('input[name="offer_type"]').val(res.offer_type);
													$('input[name="partner_prov"],input[name="agent_prov"],input[name="employee_prov"]').inputmask({ 'alias': 'percentage', min:0, max:100, rightAlign: false, digits: 2 });
													$('input[name="partner_prov"],input[name="agent_prov"],input[name="employee_prov"]').on('change', function(e) {
														var pzw = Math.round((provision*($(this).val().split(' ')[0]/100))*100)/100,
														sum_of_percentage = 0,
														prov_editable = provision;

														if($('input[name="partner_prov"]').val().length != 0) sum_of_percentage += parseFloat($('input[name="partner_prov"]').val().split(' ')[0]);
														if($('input[name="agent_prov"]').val().length != 0) sum_of_percentage += parseFloat($('input[name="agent_prov"]').val().split(' ')[0]);
														if($('input[name="employee_prov"]').val().length != 0) sum_of_percentage += parseFloat($('input[name="employee_prov"]').val().split(' ')[0]);

														original_sum_perc = sum_of_percentage;
														if(original_sum_perc != 100) {
															$('input[name="partner_prov"],input[name="agent_prov"],input[name="employee_prov"]').css('color', 'red');
														} else $('input[name="partner_prov"],input[name="agent_prov"],input[name="employee_prov"]').css('color', '#495057');
														if(sum_of_percentage > 100) sum_of_percentage = 100;

														var total_value = Math.round((provision*(sum_of_percentage/100))*100)/100;
														prov_editable = provision - total_value;

														$('#general_prov').html(prov_editable.toFixed(2));

														if($(this).attr('name') == 'partner_prov') $('#pay_partner_prov').html(pzw);
														else if($(this).attr('name') == 'agent_prov') $('#pay_agent_prov').html(pzw);
														else $('#pay_employee_prov').html(pzw);
													});
												}
											} else $('#your_prov_box,#provisions_element').hide();
										},
										error: function(err) { }
									});

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
										modalEl.find('input[name="acoc_rata_l"]').val(res.acoc_rata);
										modalEl.find('input[name="acoc_company_l"]').val(res.acoc_company);
										modalEl.find('input[name="gap_rata_l"]').val(res.gap_rata);
										modalEl.find('input[name="gap_company_l"]').val(res.gap_company);
										modalEl.find('input[name="gap_okres_l"]').val(res.gap_okres);
										modalEl.find('textarea[name="attentions_l"]').val(res.attentions);

										res.variants.forEach(function(item, index) {
											modalEl.find('#leasing_variants').append('\
												<div class="form-group row">\
													<input type="hidden" name="variant[' + index + '][id]" value="' + item.id + '" />\
												  <label class="col-xl-3 col-lg-3 col-form-label">Okres umowy (w miesiącach):</label>\
												  <div class="col-lg-9 col-xl-9">\
												    <input class="form-control" type="number" name="variant[' + index + '][contract]" placeholder="Okres umowy" value="' + item.okres + '" />\
												  </div>\
												</div>\
												<div class="form-group row">\
												  <label class="col-xl-3 col-lg-3 col-form-label">Wkład własny (%):</label>\
												  <div class="col-lg-9 col-xl-9">\
												    <input class="form-control" type="number" name="variant[' + index + '][inital]" placeholder="Wkład własny" value="' + item.wklad + '" />\
												  </div>\
												</div>\
												<div class="form-group row">\
												  <label class="col-xl-3 col-lg-3 col-form-label">Rata miesięczna:</label>\
												  <div class="col-lg-9 col-xl-9">\
												    <input class="form-control" type="number" name="variant[' + index + '][leasing_install]" placeholder="Rata miesięczna" value="' + item.leasing_install + '" />\
												  </div>\
												</div>\
												<div class="form-group row">\
												  <label class="col-xl-3 col-lg-3 col-form-label">Wykup (%):</label>\
												  <div class="col-lg-9 col-xl-9">\
												    <input class="form-control" type="number" name="variant[' + index + '][repurchase]" placeholder="Wykup" value="' + item.wykup + '" />\
												  </div>\
												</div><div class="kt-separator kt-separator--border-dashed kt-separator--space-lg kt-separator--portlet-fit">\</div>\
											');
										});

										$('[name*="contract"]').each(function() { $(this).rules('add', { required: true, messages: { required: 'To pole jest wymagane.' } }); });
										$('[name*="inital"]').each(function() { $(this).rules('add', { required: true, messages: { required: 'To pole jest wymagane.' } }); });
										$('[name*="leasing_install"]').each(function() { $(this).rules('add', { required: true, messages: { required: 'To pole jest wymagane.' } }); });
										$('[name*="repurchase"]').each(function() { $(this).rules('add', { required: true, messages: { required: 'To pole jest wymagane.' } }); });

										/* modalEl.find('input[name="vid"]').val(res.variants.id);
										modalEl.find('input[name="contract"]').val(res.variants.okres);
										modalEl.find('input[name="inital_fee"]').val(res.variants.wklad);
										modalEl.find('input[name="leasing_install"]').val(res.variants.leasing_install);
										modalEl.find('input[name="repurchase"]').val(res.variants.wykup);
										modalEl.find('input[name="sum_fee"]').val(res.variants.total_fees); */
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
										modalEl.find('input[name="wykup_r"]').val(res.wykup);
										modalEl.find('input[name="km_limit_r"]').val(res.limit);
										modalEl.find('input[name="reg_number_r"]').val(res.reg_number);
										modalEl.find('input[name="service_pack"]').prop('checked', res.service);
										modalEl.find('input[name="tire_pack"]').prop('checked', res.tire);
										modalEl.find('input[name="insurance_pack"]').prop('checked', res.insurance);
										modalEl.find('input[name="insurance_gap"][value="' + res.gap + '"]').prop('checked', true);
										modalEl.find('input[name="acoc_rata"]').val(res.acoc_rata);
										modalEl.find('input[name="acoc_company"]').val(res.acoc_company);
										modalEl.find('textarea[name="attentions_r"]').val(res.attentions);
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
											if(res.files) {
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
											}
										},
										error: function(err) {
											throw err;
										}
									});

									if(res.state == 1) {
										$('#send_offer_element').show();
										$('#send_offer_alert').show();
										$('#realize_offer_element').hide();
										$('#realize_offer_alert').hide();
										$('#isRealized_alert').hide();
										$('#isCanceled_alert').hide();
										formEl.find('input,select,textarea,button').not('button[data-dismiss="modal"]').prop('disabled', false);
									} else if(res.state == 2) {
										$('#send_offer_element').hide();
										$('#send_offer_alert').hide();
										$('#realize_offer_element').show();
										$('#realize_offer_alert').show();
										$('#isRealized_alert').hide();
										$('#isCanceled_alert').hide();
										formEl.find('input,select,textarea,button').not('button[data-dismiss="modal"]').prop('disabled', true);
										//
									} else if(res.state == 3) {
										$('#send_offer_element').hide();
										$('#send_offer_alert').hide();
										$('#realize_offer_element').show();
										$('#realize_offer_alert').hide();
										$('#isRealized_alert').hide();
										$('#isCanceled_alert').show();
										formEl.find('input,select,textarea,button').not('button[data-dismiss="modal"]').prop('disabled', true);
									} else {
										$('#send_offer_element').hide();
										$('#send_offer_alert').hide();
										$('#realize_offer_element').show();
										$('#realize_offer_alert').hide();
										$('#isRealized_alert').show();
										$('#isCanceled_alert').hide();
										formEl.find('input,select,textarea,button').not('button[data-dismiss="modal"]').prop('disabled', true);
									}

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
		$('#wykup_r').inputmask({ 'alias': 'percentage', min:0, max:100, rightAlign: false });
		$("#engine_cap_i").inputmask('99999 cm³', { placeholder: "" });
		$("#km_val_i").inputmask('9999999 km', { numericInput: true, placeholder: "" });
		$("#rent_time_r").inputmask('99 miesięcy');
		$("#gap_okres_l").inputmask('99 miesięcy');
		$("#km_limit_r").inputmask('999999 km', { numericInput: true, placeholder: "" });
		$("#power_cap_i").inputmask('999 km', { numericInput: true, placeholder: "" });

		$('#vin_number').maxlength({
        warningClass: "kt-badge kt-badge--warning kt-badge--rounded kt-badge--inline",
        limitReachedClass: "kt-badge kt-badge--success kt-badge--rounded kt-badge--inline",
				appendToParent: true
    });

		prov_validator = prov_form.validate({
			ignore: ":hidden",

			rules: {
				partner_prov: {
					required: true
				},
				agent_prov: {
					required: true
				},
				employee_prov: {
					required: true
				}
			},
			messages: {
				partner_prov: {
					required: "To pole jest wymagane."
				},
				agent_prov: {
					required: "To pole jest wymagane."
				},
				employee_prov: {
					required: "To pole jest wymagane."
				}
			}
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
				wykup_r: {
					required: true
				},
				km_limit_r: {
					required: true
				},
				reg_number_r: {
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
				wykup_r: {
					required: 'To pole jest wymagane.'
				},
				reg_number_r: {
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

	var initConfirmProvision = function() {
		var btn_confirm_prov = $('button[name="confirm_provision"]');

		btn_confirm_prov.on('click', function(e) {
			e.preventDefault();

			if(prov_validator.form()) {
				if(original_sum_perc == 100) {
					KTApp.progress(btn_confirm_prov);
					btn_confirm_prov.attr('disabled', true);

					setTimeout(function() {
						$.ajax({
							url: '/rest/offer/save_provision',
							method: 'POST',
							data: prov_form.serialize(),
							success: function(res) {
								if(res.status == 'success') {
									$('#your_provision').html(res.your_prov);
									swal.fire({
										title: 'Udało się',
										text: res.message,
										type: res.status,
										confirmButtonText: "Zamknij",
										confirmButtonClass: "btn btn-sm btn-bold btn-brand",
									});
								} else {
									swal.fire({
										title: 'Błąd',
										text: res.message,
										type: res.status,
										confirmButtonText: "Zamknij",
										confirmButtonClass: "btn btn-sm btn-bold btn-brand",
									});
								}
								KTApp.unprogress(btn_confirm_prov);
								btn_confirm_prov.attr('disabled', false);
							},
							error: function(err) {
								KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś jest nie tak..', 'flaticon-warning-sign');
								KTApp.unprogress(btn_confirm_prov);
								btn_confirm_prov.attr('disabled', false);
							}
						});
					}, 500);
				} else {
					swal.fire({
						title: 'Uwaga',
						text: 'Suma prowizji musi osiągać 100% wartości',
						type: 'warning',
						confirmButtonText: "Zamknij",
						confirmButtonClass: "btn btn-sm btn-bold btn-brand",
					});
				}
			}
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

	var initRealizeButtons = function() {
		var formSendOffer = $('#send_offer_element'),
		formRealizeOffer = $('#realize_offer_element');
		var btn_send = $('button[type="submit"]', formSendOffer),
		btn_realize = $('button[name="realize_offer_btn"]', formRealizeOffer),
		btn_cancel = $('button[name="cancel_offer_btn"]', formRealizeOffer);

		btn_send.on('click', function() {
			KTApp.progress(btn_send);
			btn_send.attr('disabled', true);

			setTimeout(function() {
				swal.fire({
					"title": "",
					"text": "Wysyłanie oferty do klienta",
					onBeforeOpen: () => {
						swal.showLoading();
					},
					allowOutsideClick: false
				});
				$.ajax({
					url: '/rest/offer/sendmail_onList',
					method: 'POST',
					data: {
						id: $('#idInput3').val(),
						offer_type: $('#typeInput3').val(),
						o_path: f_path
					},
					success: function(realize) {
						if(realize.status == 'success') {
							swal.fire({
								"title": "",
								"text": realize.message,
								"type": realize.status,
								"confirmButtonClass": "btn btn-secondary"
							});

							$('#send_offer_element').hide();
							$('#send_offer_alert').hide();
							$('#realize_offer_element').show();
							$('#realize_offer_alert').show();
							$('#isRealized_alert').hide();
							$('#isCanceled_alert').hide();
							formEl.find('input,select,textarea,button').not('button[data-dismiss="modal"]').prop('disabled', true);
							datatable.reload();
						} else {
							swal.fire({
								"title": "",
								"text": realize.message,
								"type": realize.status,
								"confirmButtonClass": "btn btn-secondary"
							});
						}

						KTApp.unprogress(btn_send);
						btn_send.attr('disabled', false);
					},
					error: function() {
						swal.fire({
							"title": "",
							"text": "Wystąpił błąd podczas połączenia z serwerem.",
							"type": "error",
							"confirmButtonClass": "btn btn-secondary"
						});
					}
				});
			}, 1000);
		});
		//

		btn_realize.on('click', function() {
			KTApp.progress(btn_realize);
			btn_realize.attr('disabled', true);

			setTimeout(function() {
				$.ajax({
					url: '/rest/offer/realize',
					method: 'POST',
					data: {
						id: $('#idInput3').val(),
						offer_type: $('#typeInput3').val()
					},
					success: function(realize) {
						if(realize.status == 'success') {
							swal.fire({
								"title": "",
								"text": realize.message,
								"type": realize.status,
								"confirmButtonClass": "btn btn-secondary"
							});

							$('#send_offer_element').hide();
							$('#send_offer_alert').hide();
							$('#realize_offer_element').show();
							$('#realize_offer_alert').hide();
							$('#isRealized_alert').show();
							$('#isCanceled_alert').hide();
							formEl.find('input,select,textarea,button').not('button[data-dismiss="modal"]').prop('disabled', true);
							datatable.reload();
						} else {
							swal.fire({
								"title": "",
								"text": realize.message,
								"type": realize.status,
								"confirmButtonClass": "btn btn-secondary"
							});
						}

						KTApp.unprogress(btn_realize);
						btn_realize.attr('disabled', false);
					},
					error: function() {
						swal.fire({
							"title": "",
							"text": "Wystąpił błąd podczas połączenia z serwerem.",
							"type": "error",
							"confirmButtonClass": "btn btn-secondary"
						});
					}
				});
			}, 1000);
		});

		btn_cancel.on('click', function() {
			KTApp.progress(btn_cancel);
			btn_cancel.attr('disabled', true);

			setTimeout(function() {
				$.ajax({
					url: '/rest/offer/cancel',
					method: 'POST',
					data: {
						id: $('#idInput3').val(),
						offer_type: $('#typeInput3').val()
					},
					success: function(realize) {
						if(realize.status == 'success') {
							swal.fire({
								"title": "",
								"text": realize.message,
								"type": realize.status,
								"confirmButtonClass": "btn btn-secondary"
							});

							$('#send_offer_element').hide();
							$('#send_offer_alert').hide();
							$('#realize_offer_element').show();
							$('#realize_offer_alert').hide();
							$('#isRealized_alert').hide();
							$('#isCanceled_alert').show();
							formEl.find('input,select,textarea,button').not('button[data-dismiss="modal"]').prop('disabled', true);
							datatable.reload();
						} else {
							swal.fire({
								"title": "",
								"text": realize.message,
								"type": realize.status,
								"confirmButtonClass": "btn btn-secondary"
							});
						}

						KTApp.unprogress(btn_cancel);
						btn_cancel.attr('disabled', false);
					},
					error: function() {
						swal.fire({
							"title": "",
							"text": "Wystąpił błąd podczas połączenia z serwerem.",
							"type": "error",
							"confirmButtonClass": "btn btn-secondary"
						});
					}
				});
			}, 1000);
		});
	};

	return {
		// public functions
		init: function() {
			formEl = $('#kt_offer_edit'),
			prov_form = $('#partner_prov_form');
			$('.kt-selectpicker').selectpicker({
				noneSelectedText : 'Nie wybrano'
			});

			init();
			initOfferData();
			initValidation();
			initUploadData();
			initChangeStatus();
			initFileButtons();
			initDropzone();
			selection();
			selectedDelete();
			initRealizeButtons();
			initConfirmProvision();
		},
	};
}();

// On document ready
KTUtil.ready(function() {
	KTOfferListDatatable.init();
});
