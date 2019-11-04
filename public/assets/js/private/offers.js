"use strict";
// Class definition

var KTOfferListDatatable = function() {

	// variables
	var datatable;

	// init
	var init = function() {
		String.prototype.trunc = String.prototype.trunc ||
		function(n){
		    return (this.length > n) ? this.substr(0, n-1) + '&hellip;' : this;
		};

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
				field: "idOffer",
				title: "ID oferty",
				sortable: false,
				autoHide: false,
				width: 100,
				template: function(row) {
					var date = moment(row.created_at).local().format('YYYY');
					return '<a href="javascript:;" class="show_offer_data" data-id="' + row.id + '">00' + row.id + '/' + row.offer_type.charAt(0).toUpperCase() + '/' + date + '</a>';
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
					return '<span data-skin="dark" data-toggle="kt-tooltip" data-placement="bottom" title="' + row.company.fullname + '">' + row.company.fullname.trunc(15) + '</span>';
				}
			}, {
				field: "offer_type",
				title: "Typ oferty",
				template: function(row) {
					var output = null;
					if(row.offer_type == 'rent') output = 'wypożyczenie';
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
						0: {'title': 'Oczekująca', 'class': 'kt-badge--brand'},
						1: {'title': 'Anulowana', 'class': ' kt-badge--danger'},
						2: {'title': 'Zrealizowana', 'class': ' kt-badge--success'},
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
					url: '/rest/offer/get',
					method: 'POST',
					data: { id: id },
					success: function(res) {
						setTimeout(function() {
								KTApp.unblockPage();

								if(res.status == null) {
									modalEl.modal('show');

									var status = {
										0: {'title': 'Oczekująca', 'class': 'kt-font-brand'},
										1: {'title': 'Anulowana', 'class': ' kt-font-danger'},
										2: {'title': 'Zrealizowana', 'class': ' kt-font-success'},
									};
                }

                  // Twój stary
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
	KTOfferListDatatable.init();
});
