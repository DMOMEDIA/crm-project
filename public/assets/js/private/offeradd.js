"use strict";

// Class definition
var KTWizardOfferAdd = function () {
	// Base elements
	var wizardEl;
	var formEl;
	var validator;
	var wizard;
	var slider_min = 0, slider_max = 0;
	var upload_info, dzUpload, oprocentowanie;

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

		// Change event
		wizard.on('change', function(wizard) {
			KTUtil.scrollTop();

			var offerType = $('input[name="offer_type"]:checked').val();

			if(wizard.getStep() == 3) {
				$('[name*="contract"]').each(function() { $(this).rules('add', { required: true, messages: { required: 'To pole jest wymagane.' } }); });
				$('[name*="inital_fee"]').each(function() { $(this).rules('add', { required: true, messages: { required: 'To pole jest wymagane.' } }); });
				$('[name*="leasing_install"]').each(function() { $(this).rules('add', { required: true, messages: { required: 'To pole jest wymagane.' } }); });
				$('[name*="repurchase"]').each(function() { $(this).rules('add', { required: true, messages: { required: 'To pole jest wymagane.' } }); });
				$('[name*="sum_fee"]').each(function() { $(this).rules('add', { required: true, messages: { required: 'To pole jest wymagane.' } }); });

				if($('input[name="offer_type"]:checked').val() == 'leasing') {
					$('#leasing_type_box').show();
					$('#rent_type_box').hide();
					$('#insurance_type_box').hide();
				} else if($('input[name="offer_type"]:checked').val() == 'rent') {
					$('#leasing_type_box').hide();
					$('#rent_type_box').show();
					$('#insurance_type_box').hide();
				} else {
					$('#leasing_type_box').hide();
					$('#rent_type_box').hide();
					$('#insurance_type_box').show();
				}

				$.ajax({
					url: '/rest/company/provision',
					method: 'POST',
					data: { id: $('#companiesRemote option:selected').val() },
					success: function(res) {
						if(offerType == 'leasing') oprocentowanie = parseFloat(res.provision_leasing)/100;
						else if(offerType == 'rent') oprocentowanie = parseFloat(res.provision_rent)/100;
					},
					error: function() { }
				});
			}

			if(wizard.getStep() == 5) {
				// { Podsumowanie }

				$('#attached_files').html('');

				dzUpload.files.forEach(function(element) {
					var extension = element.name.split('.');
					$('#attached_files').append('\<div class="kt-widget4__item">\
							<div class="kt-widget4__pic kt-widget4__pic--icon">\
								<img src="./assets/media/files/' + ext[extension[1]] + '.svg" alt="">\
							</div>\
							<a href="javascript:;" class="kt-widget4__title">' + element.name + '</a>\
						</div>\
					');
				});

				// Typ oferty
				if(offerType == 'rent') {
					$('#leasing_offer_type').hide();
					$('#rent_offer_type').show();
					$('#insurance_offer_type').hide();
					$('#offer_typeP').html('wynajem');
				}
				else if(offerType == 'insurance') {
					$('#leasing_offer_type').hide();
					$('#rent_offer_type').hide();
					$('#insurance_offer_type').show();
					$('#offer_typeP').html('ubezpieczenie');
				}
				else {
					$('#leasing_offer_type').show();
					$('#rent_offer_type').hide();
					$('#insurance_offer_type').hide();
					$('#offer_typeP').html('leasing');
				}
				// ================================== //

				$('#clientP').html($('#clientsRemote option:selected').text()); // Klient
				$('#companyP').html($('#companiesRemote option:selected').text()); // Firma

				// Typ - leasing
				if(offerType == 'leasing') {
					$('#item_type_lP').html($('select[name="item_type_l"] option:selected').text()); // Rodzaj pojazdu
					$('#brand_lP').html($('input[name="brand_l"]').val()); // Marka i model
					$('#condition_lP').html($('select[name="condition_l"] option:selected').text()); // Stan
					$('#pyear_lP').html($('input[name="pyear_l"]').val()); // Rok produkcji
					$('#netto_lP').html($('input[name="netto_l"]').val() + ' PLN'); // Wartość netto pojazdu
					$('#invoice_lP').html($('select[name="invoice_l"] option:selected').text()); // Faktura
					$('#acoc_rata_lP').html($('input[name="acoc_rata_l"]').val() + ' PLN');
					$('#acoc_company_lP').html($('input[name="acoc_company_l"]').val());
					$('#gap_rata_lP').html($('input[name="gap_rata_l"]').val() + ' PLN');
					$('#gap_okres_lP').html($('input[name="gap_okres_l"]').val());
					$('#gap_company_lP').html($('input[name="gap_company_l"]').val());
					$('#attentions_lP').html($('textarea[name="attentions_l"]').val());

					console.log($('textarea[name="attentions_l"]').val());

					// Warianty
					var contract = [], inital_fee = [], leasing_install = [], repurchase = [], sum_fee = [];
					$('input[name*="contract"]').each(function() { contract.push($(this).val()) });
					$('input[name*="inital"]').each(function() { inital_fee.push($(this).val()) });
					$('input[name*="leasing_install"]').each(function() { leasing_install.push($(this).val()) });
					$('input[name*="repurchase"]').each(function() { repurchase.push($(this).val()) });
					$('input[name*="sum_fee"]').each(function() { sum_fee.push($(this).val()) });

					$('#pull_variants').html('');

					for(var i = 0; i < contract.length; i++) {
						$('#pull_variants').append('<p class="kt-margin-b-0 kt-font-bold">Wariant ' + (i+1) + '</p><p class="kt-margin-b-0">Okres umowy: ' + contract[i] + ' miesięcy</p><p class="kt-margin-b-0">Opłata wstępna: ' + inital_fee[i] + ' PLN</p><p class="kt-margin-b-0">Rata leasingowa: ' + leasing_install[i] + ' PLN</p><p class="kt-margin-b-0">Wykup (%): ' + repurchase[i] + '%</p><p class="kt-margin-b-0">Suma opłat: ' + sum_fee[i] + ' PLN</p></br>');
					}

					var netto_val = parseFloat($('input[name="netto_l"]').val());
					var provision = (netto_val*oprocentowanie);
					provision = Math.round((provision - (provision*0.23))*100)/100; // opodatkowanie 23%
					provision = Math.round((provision*0.45)*100)/100; // 45% dla pośrednika
					$('#provision').html(provision + ' PLN');
				}

				// Typ - wypożyczenie
				if(offerType == 'rent') {
					$('#brand_rP').html($('input[name="brand_r"]').val()); // Marka i model
					$('#body_type_rP').html($('select[name="body_type_r"] option:selected').text()); // Nadwozie
					$('#fuel_type_rP').html($('select[name="fuel_type_r"] option:selected').text()); // Paliwo
					$('#gear_type_rP').html($('select[name="gear_type_r"] option:selected').text()); // Skrzynia biegów
					if(slider_min == slider_max) $('#month_install_rP').html(slider_min + ' PLN');
					else $('#month_install_rP').html(slider_min + ' PLN - ' + slider_max + ' PLN');
					$('#vehicle_val_rP').html($('input[name="vehicle_val_r"]').val() + ' PLN'); // Wartość pojazdu
					$('#rent_time_rP').html($('input[name="rent_time_r"]').val()); // Okres wynajmu
					$('#self_deposit_rP').html($('input[name="self_deposit_r"]').val() + ' PLN'); // Wpłata własna
					$('#km_limit_rP').html($('input[name="km_limit_r"]').val()); // Limit kilometrów
					$('#invoice_rP').html($('select[name="invoice_r"] option:selected').text());
					//if($('input[name="service_pack"]:checked')) $('#service_packP').html($('input[name="service_pack"]:checked').val());
					//if($('input[name="tire_pack"]:checked')) $('#tire_packP').html($('input[name="tire_pack"]:checked').val());
					//if($('input[name="insurance_pack"]:checked')) $('#insurance_packP').html($('input[name="insurance_pack"]:checked').val());
					$('#wykup_rP').html($('input[name="wykup_r"]').val());
					$('#reg_number_rP').html($('input[name="reg_number_r"]').val());
					if($('input[name="insurance_gap"]').val() == 0) $('#insurance_gapP').html('Nie');
					else $('#insurance_gapP').html('Tak');
					$('#acoc_rataP').html($('input[name="acoc_rata"]').val() + ' PLN');
					$('#acoc_companyP').html($('input[name="acoc_company"]').val());
					$('#attentions_rP').html($('textarea[name="attentions_r"]').val());

					var netto_val = parseFloat($('input[name="vehicle_val_r"]').val());
					var provision = (netto_val*oprocentowanie); // globalna prowizja 1.5%
					provision = Math.round((provision - (provision*0.23))*100)/100; // opodatkowanie 23%
					provision = Math.round((provision*0.45)*100)/100; // 45% dla pośrednika
					$('#provision').html(provision + ' PLN');
				}

				if(offerType == 'insurance') {
					$('#brand_iP').html($('input[name="brand_i"]').val()); // Marka i model
					$('#body_type_iP').html($('select[name="body_type_i"] option:selected').text()); // Nadwozie
					$('#version_iP').html($('input[name="version_i"]').val()); // Wersja pojazdu
					$('#pyear_iP').html($('input[name="pyear_i"]').val()); // Rok produkcji
					$('#km_val_iP').html($('input[name="km_val_i"]').val()); // Przebieg pojazdu
					$('#engine_cap_iP').html($('input[name="engine_cap_i"]').val()); // Pojemność
					$('#power_cap_iP').html($('input[name="power_cap_i"]').val()); // Moc
					$('#vin_numberP').html($('input[name="vin_number"]').val()); // Numer VIN
					$('#reg_numberP').html($('input[name="reg_number"]').val()); // Numer rejestracyjny
					$('#vehicle_val_iP').html($('input[name="vehicle_val_i"]').val() + ' PLN'); // Wartość netto
					$('#insurance_costP').html($('input[name="insurance_cost"]').val() + ' PLN'); // Koszt ubezp.

					var netto_val = parseFloat($('input[name="insurance_cost"]').val());
					var provision = Math.round((netto_val*0.06)*100)/100; // 6% dla pośrednika
					$('#provision').html(provision + ' PLN');
				}
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

		validator = formEl.validate({
			// Validate only visible fields
			ignore: ":hidden",

			// Validation rules
			rules: {
				//= Step 1
				offer_type: {
          required: true
				},
				//= Step 2
				client_id: {
					required: true
				},
				company_id: {
					required: true
				},
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
				reg_number_r: {
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
					required: 'To pole jest wymagane.',
					digits: 'To pole może zawierać jedynie cyfry.'
				},
				rent_time_r: {
					required: 'To pole jest wymagane.'
				},
				self_deposit_r: {
					required: 'To pole jest wymagane.',
					digits: 'To pole może zawierać jedynie cyfry.'
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

	var initSubmit = function() {
		var btn = formEl.find('[name="add-submit"]'),
		btn_mail = formEl.find('[name="addendsend-submit"]');

		$.fn.serializeObject = function(){
				var o = {};
				var a = this.serializeArray();
				$.each(a, function() {
						if (o[this.name] !== undefined) {
								if (!o[this.name].push) {
										o[this.name] = [o[this.name]];
								}
								o[this.name].push(this.value || '');
						} else {
								o[this.name] = this.value || '';
						}
				});
				return o;
		};

		btn_mail.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if(validator.form()) {
				KTApp.progress(btn_mail);
				btn_mail.attr('disabled', true);

				// Status oferty = Oczekująca
				formEl.find('[name="o_state"]').val('2');

				setTimeout(function() {
					if(dzUpload.files.length != 0) {
						$.ajax({
							url: '/rest/offer/insert',
							method: 'POST',
							data: formEl.serialize(),
							success: function(res) {
								//KTApp.unblock(formEl);
								if(res.status == 'success') {
									swal.fire({
										"title": "",
										"text": "Przesyłanie załączonych plików do systemu",
										onBeforeOpen: () => {
	    								swal.showLoading();
										},
										allowOutsideClick: false
									});

									// Send files to system
									setTimeout(function() {
										dzUpload.processQueue();
									}, 500);

									dzUpload.on("successmultiple", function(file, resp) {
										dzUpload.removeAllFiles();
										formEl.find('[name="o_path"]').val(res.param.offer_path);
										formEl.find('[name="o_id"]').val(res.param.offer_id);

										// Send email
										formEl.ajaxSubmit({
											url: '/rest/offer/sendmail',
											method: 'POST',
											clearForm: true,
											data: formEl.serialize(),
											success: function(response) {
												if(response.status == 'success') {
													KTApp.unprogress(btn_mail);
													btn_mail.attr('disabled', false);

													swal.fire({
														"title": "",
														"text": res.message,
														"type": "success",
														"confirmButtonClass": "btn btn-secondary"
													});

													wizard.goTo(1, true);
												} else {
													swal.fire({
														"title": "",
														"text": response.message,
														"type": response.status,
														"confirmButtonClass": "btn btn-secondary"
													});
												}
											},
											error: function(err) {
	              				KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś jest nie tak..', 'flaticon-warning-sign');
											}
										});
										/* KTApp.unprogress(btn);
										btn.attr('disabled', false);

										swal.fire({
											"title": "",
											"text": res.message,
											"type": "success",
											"confirmButtonClass": "btn btn-secondary"
										}); */
										// wizard.goTo(1, true);
									});

									dzUpload.on("sendingmultiple", function(file, xhr, formData) {
										formData.append('folder_path', res.param.offer_path);
									});
								} else {
									KTUtil.showNotifyAlert('danger', res.message, 'Coś jest nie tak..', 'flaticon-warning-sign');
									wizard.goTo(1, true);
								}
							},
	            error: function(err) {
	              KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś jest nie tak..', 'flaticon-warning-sign');
	            }
						});
					} else {
						KTApp.unprogress(btn_mail);
						btn_mail.attr('disabled', false);

						swal.fire({
							"title": "",
							"text": "Nie załączono dokumentów do oferty",
							"type": "error",
							"confirmButtonClass": "btn btn-secondary"
						});
					}
				}, 1000);
			}
		});

		btn.on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if (validator.form()) {
				// See: src\js\framework\base\app.js
				KTApp.progress(btn);
				btn.attr('disabled', true);
				//KTApp.block(formEl);

				// Status oferty = Niewysłana
				formEl.find('[name="o_state"]').val('1');

				// See: http://malsup.com/jquery/form/#ajaxSubmit
				setTimeout(function() {
					if(dzUpload.files.length != 0) {
						formEl.ajaxSubmit({
							url: '/rest/offer/insert',
							method: 'POST',
							data: formEl.serialize(),
							clearForm: true,
							success: function(res) {
								//KTApp.unblock(formEl);
								if(res.status == 'success') {
									swal.fire({
										"title": "",
										"text": "Przesyłanie załączonych plików do systemu",
										onBeforeOpen: () => {
	    								swal.showLoading();
										},
										allowOutsideClick: false
									});

									// Send files to system
									setTimeout(function() {
										dzUpload.processQueue();
									}, 500);

									dzUpload.on("successmultiple", function(file, res) {
										KTApp.unprogress(btn);
										btn.attr('disabled', false);

										swal.fire({
											"title": "",
											"text": res.message,
											"type": "success",
											"confirmButtonClass": "btn btn-secondary"
										});
										dzUpload.removeAllFiles();
										wizard.goTo(1, true);
									});

									dzUpload.on("sendingmultiple", function(file, xhr, formData) {
										formData.append('folder_path', res.param.offer_path);
									});
								} else {
									KTUtil.showNotifyAlert('danger', res.message, 'Coś jest nie tak..', 'flaticon-warning-sign');
									wizard.goTo(1, true);
								}
							},
	            error: function(err) {
	              KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś jest nie tak..', 'flaticon-warning-sign');
	            }
						});
					} else {
						KTApp.unprogress(btn);
						btn.attr('disabled', false);

						swal.fire({
							"title": "",
							"text": "Nie załączono dokumentów do oferty",
							"type": "error",
							"confirmButtonClass": "btn btn-secondary"
						});
					}
				}, 1000);
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
					for(var i = 0; i < res.length; i++) data.push({ id: res[i].id, text: res[i].fullname + ', ' + (res[i].company == 0 ? 'osoba fizyczna' : (res[i].company == 1 ? 'spółka' : 'firma')) });

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

		$('#month_installment').ionRangeSlider({
				type: "double",
				grid: true,
				min: 0,
				max: 5000,
				from: 1000,
				to: 2000,
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
	}


	var initDropzones = function () {
			// file type validation
		$('#kt_dropzone_offer').dropzone({
			url: '/rest/files/upload',
			autoProcessQueue: false,
			paramName: function() { return 'source_file[]' }, // The name that will be used to transfer the file
			maxFiles: 5,
			maxFilesize: 10, // MB
			addRemoveLinks: true,
			uploadMultiple: true,
			parallelUploads: 5,
			acceptedFiles: "application/pdf,.docx,.odt,.xls",
			init: function() {
				dzUpload = this;
			}
		});
	}

	return {
		// public functions
		init: function() {
			wizardEl = KTUtil.get('kt_offer_add');
			formEl = $('#kt_offer_form');

			initWizard();
			initValidation();
			initDropzones();
			initSubmit();
      initRemoteData();
      initRepeater();
		}
	};
}();

jQuery(document).ready(function() {
	KTWizardOfferAdd.init();
});
