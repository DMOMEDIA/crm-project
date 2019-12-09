"use strict";
// Class definition

var KTCompanyListDatatable = function() {

	// variables
	var datatable;
	var formEl;
	var validator;

	// init
	var init = function() {
		// init the datatables. Learn more: https://keenthemes.com/metronic/?page=docs&section=datatable
		datatable = $('#kt_apps_company_list_datatable').KTDatatable({
			// datasource definition
			data: {
				type: 'remote',
				source: {
					read: {
						url: '/rest/company/list'
					},
				},
				pageSize: 10, // display 20 recordstper page
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
				field: "fullname",
				title: "Nazwa firmy",
        autoHide: false,
				width: 200,
				// callback function support for column rendering
				template: function(row) {
          return '<a href="javascript:;" class="show_company_data" title="' + row.fullname + '" data-id="' + row.id + '">' + row.fullname + '</a>';
        }
			}, {
				field: 'nip',
				title: 'NIP',
				template: function(row) {
					return row.nip;
				}
			}, {
				field: 'email',
				title: 'E-mail',
				template: function(row) {
					if(row.email == null) return "Nie określono";
					else return row.email;
				}
			}, {
				field: 'phone',
				title: 'Telefon',
				template: function(row) {
					if(row.phone == null) return "Nie określono";
					else return row.phone;
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
						<a href="javascript:;" class="btn btn-sm btn-clean btn-icon btn-icon-md show_company_data" data-id="' + row.id + '">\
							<i class="flaticon2-menu-1"></i>\
						</a>\
					';
				}
			}]
		});
	}

	var initValid = function() {
		$('#p_leasing').inputmask('9[9].9[9]', { placeholder: '0' });
	  $('#p_rent').inputmask('9[9].9[9]', { placeholder: '0' });

		$('#nipInput').maxlength({
        warningClass: "kt-badge kt-badge--warning kt-badge--rounded kt-badge--inline",
        limitReachedClass: "kt-badge kt-badge--success kt-badge--rounded kt-badge--inline",
				appendToParent: true
    });

		validator = formEl.validate({
			ignore: ':hidden',

			// Validation rules
			rules: {
				// Step 1
				companyName: {
  				required: true
				},
				nip: {
          required: true,
          digits: true,
          minlength: 10,
          maxlength: 10
				},
        email: {
					required: true,
          email: true
				},
				phone: {
					required: true,
					maxlength: 13
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
				firstname_k: {
					required: true
				},
				lastname_k: {
					required: true
				},
				email_k: {
					required: true,
					email: true
				},
				phone_k: {
					required: true,
					digits: true,
					maxlength: 13
				},
				provision_leasing: {
					required: true
				},
				provision_rent: {
					required: true
				}
			},
      messages: {
        companyName: {
          required: 'To pole jest wymagane.'
        },
        nip: {
          required: 'To pole jest wymagane.',
          digits: 'Numer NIP może zawierać jedynie cyfry.',
          minlength: 'Numer NIP musi składać się z {0} cyfr.',
          maxlength: 'Numer NIP musi składać się z {0} cyfr.'
        },
        email: {
          required: 'To pole jest wymagane.',
          email: 'Wprowadź poprawny adres e-mail.'
        },
        phone: {
          required: 'To pole jest wymagane.',
					maxlength: 'Numer telefonu może składać się z maksymalnie {0} cyfr.'
        },
        address: {
          required: 'To pole jest wymagane.'
        },
        postcode: {
          required: 'To pole jest wymagane.'
        },
        city: {
          required: 'To pole jest wymagane.'
        },
        voivodeship: {
          required: 'To pole jest wymagane.'
        },
				firstname_k: {
					required: 'To pole jest wymagane.'
				},
				lastname_k: {
					required: 'To pole jest wymagane.'
				},
				email_k: {
					required: 'To pole jest wymagane.',
					email: 'Wprowadź poprawny adres e-mail.'
				},
				phone_k: {
					required: 'To pole jest wymagane.',
					digits: 'Numer telefonu może zawierać tylko cyfry.',
					maxlength: 'Numer telefonu może składać się z maksymalnie {0} cyfr.'
				},
				provision_leasing: {
					required: 'To pole jest wymagane.'
				},
				provision_rent: {
					required: 'To pole jest wymagane.'
				}
      },
			// Display error
			invalidHandler: function(event, validator) {
				KTUtil.scrollTop();

				KTUtil.showNotifyAlert('danger', "Wypełnij wymagane pola i spróbuj ponownie.", 'Wystąpił błąd', 'flaticon-warning-sign');
			},

			// Submit valid form
			submitHandler: function (form) { }
		});
	}

	var initClientData = function() {
		datatable.on('kt-datatable--on-layout-updated', function(e) {
			var modalEl = $('#kt_fetch_company');

			$('.show_company_data').on('click', function() {
				var id = $(this).attr('data-id');

				KTUtil.clearInputInForm(formEl);

				KTApp.blockPage({ overlayColor: '#000000', type: 'v2', state: 'primary', message: 'Proszę czekać..' });

				$.ajax({
					url: '/rest/company/get',
					method: 'POST',
					data: { id: id },
					success: function(res) {
						setTimeout(function() {
								KTApp.unblockPage();

								if(res.status == null) {
                  modalEl.modal('show');

									modalEl.find('#modalTitle').html(res.fullname);

									$(formEl).find('input,select').each(function() {
										if(this.name == 'voivodeship')
											modalEl.find('select[name="voivodeship"] option[value="' + res.voivodeship + '"]').prop('selected', true);
										else {
											var nextVar = eval('res.' + this.name);
											modalEl.find('input[name="' + this.name + '"]').val(nextVar);
										}
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

	var submitData = function() {
		var btn = $('button[type="submit"]', formEl);

		// Submit personal form
		btn.on('click', function(e) {
			e.preventDefault();

			if(validator.form()) {
				KTApp.progress(btn);
				btn.attr('disabled', true);

				setTimeout(function() {
					formEl.ajaxSubmit({
						url: '/rest/company/edit',
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
	};

	// search
	var search = function() {
		$('#kt_form_status').on('change', function() {
			datatable.search($(this).val().toLowerCase(), 'Status');
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

			var userText = 'firmy';
			if(ids.length == 1) userText = 'firmę';

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
						/* $.ajax({
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
						}); */
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
			formEl = $('#kt_company_edit');

			init();
			initValid();
			initClientData();
			selection();
			selectedDelete();
			submitData();
			updateTotal();
		},
	};
}();

// On document ready
KTUtil.ready(function() {
	KTCompanyListDatatable.init();
});
