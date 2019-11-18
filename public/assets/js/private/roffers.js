"use strict";
// Class definition

var KTROfferListDatatable = function() {

	// variables
	var datatable;

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
						0: {'title': 'Nowe', 'class': 'kt-badge--warning'},
						1: {'title': 'Oczekujące', 'class': ' kt-badge--dark'},
						2: {'title': 'Zrealizowane', 'class': ' kt-badge--success'},
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

	var initOfferData = function() {
		datatable.on('kt-datatable--on-layout-updated', function(e) {
			var modalEl = $('#kt_fetch_offer');

			$('.show_offer_data').on('click', function() {
				var id = $(this).attr('data-id');

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
										0: {'title': 'Nowe', 'class': 'kt-font-warning'},
										1: {'title': 'Oczekujące', 'class': ' kt-font-dark'},
										2: {'title': 'Zrealizowane', 'class': ' kt-font-success'},
									};

									var date = moment(res.created_at).local().format('YYYY');
									modalEl.find('#modalTitle').html('00' + res.id + '/' + date);

									if(res.type == 'leasing') modalEl.find('#leasing_options').show();
									else modalEl.find('#leasing_options').hide();

									if(res.client_info.company == 0) {
										modalEl.find('#private_user').show();
										modalEl.find('#company_user').hide();
									} else {
										modalEl.find('#private_user').hide();
										modalEl.find('#company_user').show();
									}

									modalEl.find('#fullnameInput').html(res.client_info.fullname);
									modalEl.find('#companyInput').html(res.client_info.fullname);
									modalEl.find('#nipInput').html(res.client_info.nip);
									modalEl.find('#emailInput').html(res.client_info.email);
									modalEl.find('#phoneInput').html(res.client_info.phone);
									//
									modalEl.find('#idInput').html('00' + res.id + '/' + date);
									modalEl.find('#statusInput').html(status[res.state].title);
									modalEl.find('#typeInput').html(res.type);
									modalEl.find('#dateInput').html(moment(res.created_at).local().format('YYYY-MM-DD HH:mm'));
									modalEl.find('#nameofferInput').html(res.name);
									modalEl.find('#pyearInput').html(res.pyear);
									modalEl.find('#nettoInput').html(res.netto + ' PLN');
									modalEl.find('#instalmentsInput').html(res.instalments);
									modalEl.find('#cbInput').html(res.contribution + ' PLN');
									modalEl.find('#rvInput').html(res.red_value + '%');
									if(res.attentions != null) modalEl.find('#attentInput').html(res.attentions);
									else modalEl.find('#attentInput').html('Brak');
									if(res.other != null) modalEl.find('#otherInput').html(res.other);
									else modalEl.find('#otherInput').html('Brak');
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

	return {
		// public functions
		init: function() {

			init();
			initOfferData();
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
