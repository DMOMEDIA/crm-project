"use strict";

var KTStatistics = function() {

  var datatable;

  var init = function() {

    datatable = $('#provision_datatable').KTDatatable({
			// datasource definition
			data: {
				type: 'remote',
				source: {
					read: {
						url: '/rest/users/list_prov',
            params: {
              dateFrom: moment().local().format('YYYY') + '-' + moment().local().format('MM') + '-01 00:00:00'
            },
            map: function(raw) {
              var dataSet = [];

              $.each(raw.data, function(i,v) {
                v.prov_normal = v.provisions.prov_normal;
                v.prov_forecast = v.provisions.prov_forecast;
                v.prov_canceled = v.provisions.prov_canceled;
                delete v['provisions'];

                dataSet.push(v);
              });

              return dataSet;
            }
					},
				},
        pageSize: 10,
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
				sortable: 'asc',
				width: 20,
				selector: {
					class: 'kt-checkbox--solid'
				},
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
									<div class="kt-badge kt-badge--xl kt-badge--dark">' + data.fullname.substring(0, 1) + '</div>\
								</div>\
								<div class="kt-user-card-v2__details">\
									<a href="javascript:;" class="kt-user-card-v2__name">' + data.fullname + '</a>\
									<span class="kt-user-card-v2__desc">' + urole + '</span>\
								</div>\
							</div>';
					return output;
				}
			}, {
				field: 'prov_forecast',
				title: 'Prowizja prognozowana',
				template: function(row) {
          var badge = 'danger';
          if(row.prov_forecast > 0) badge = 'success';

          var output = '<span style="margin-top:-2px;" class="kt-badge kt-badge--' + badge + ' kt-badge--dot kt-badge--xl"></span> ' + row.prov_forecast.toFixed(2) + ' zł';
					return '<span style="font-size:14px;">' + output + '</span>';
				},
			}, {
				field: 'prov_normal',
				title: 'Prowizja zdobyta',
				template: function(row) {
          var badge = 'danger';
          if(row.prov_normal > 0) badge = 'success';

          var output = '<span style="margin-top:-2px;" class="kt-badge kt-badge--' + badge + ' kt-badge--dot kt-badge--xl"></span> ' + row.prov_normal.toFixed(2) + ' zł';
					return '<span style="font-size:14px;">' + output + '</span>';
				}
			}, {
        field: 'prov_canceled',
        title: 'Prowizja utracona',
        template: function(row) {
          var badge = 'danger';
          if(row.prov_canceled > 0) badge = 'dark';

          var output = '<span style="margin-top:-2px;" class="kt-badge kt-badge--' + badge + ' kt-badge--dot kt-badge--xl"></span> ' + row.prov_canceled.toFixed(2) + ' zł';
					return '<span style="font-size:14px;">' + output + '</span>';
        },
      }]
		});

    $.ajax({
      url: '/rest/user/provisions',
      method: 'POST',
      success: function(res) {
        $('#provision_normal').html(res.prov_normal.toFixed(2) + ' zł');
        $('#provision_forecast').html(res.prov_forecast.toFixed(2) + ' zł');
        $('#provision_canceled').html(res.prov_canceled.toFixed(2) + ' zł');
      },
      error: function(err) {
        $('#provision_normal').html('Błąd poł.');
        $('#provision_forecast').html('Błąd poł.');
        $('#provision_canceled').html('Błąd poł.');
      }
    });

  }

  // wyszukiwanie / sortowanie
	var searchAndSort = function() {
    $('#generalSearch').on('change', function() {
			datatable.search($(this).val().toLowerCase(), 'fullname');
		});

		$('#kt_form_sort').on('change', function() {
      if($(this).val() == 'year') {
        datatable.setCustomParams({ dateFrom: moment().local().format('YYYY') + '-01-01 00:00:00' });
        datatable.reload();
      } else {
        datatable.setCustomParams({ dateFrom: moment().local().format('YYYY') + '-' + moment().local().format('MM') + '-01 00:00:00' });
        datatable.reload();
      }
		});
	}

  /* var donutChart = function() {
    // PIE CHART
    $.ajax({
      url: '/rest/stats/offers_count',
      method: 'POST',
      success: function(res) {
        new Morris.Donut({
            element: 'kt_donut_offers',
            data: res,
            colors: ['#34bfa3', '#ffb822', '#5d78ff'],
            resize: true
        });
      },
      error: function() {
        console.log('Wystąpił błąd podczas pobierania statystyk ofertowych.');
      }
    });
  } */

  return {
    init: function() {
      $('.kt-selectpicker').selectpicker({
        noneSelectedText : 'Nie wybrano'
      });

      init();
      searchAndSort();
      donutChart();
    }
  }
}();

jQuery(document).ready(function() {
  KTStatistics.init();
});
