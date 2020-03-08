"use strict";

var KTDashboardCharts = function() {

  var datatable;

  var init = function() {

    datatable = $('#provision_datatable').KTDatatable({
			// datasource definition
			data: {
				type: 'remote',
				source: {
					read: {
						url: '/rest/users/list_prov'
					},
				}
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
				field: 'prov_normal',
				title: 'Prowizja',
				template: function(row) {
          var badge = 'danger';
          if(row.provisions.prov_normal > 0) badge = 'success';

          var output = '<span style="margin-top:-2px;" class="kt-badge kt-badge--' + badge + ' kt-badge--dot kt-badge--xl"></span> ' + row.provisions.prov_normal.toFixed(2) + ' zł';
					return '<span style="font-size:14px;">' + output + '</span>';
				}
			}, {
				field: 'prov_forecast',
				title: 'Prowizja prognozowana',
				template: function(row) {
          var badge = 'danger';
          if(row.provisions.prov_forecast > 0) badge = 'success';

          var output = '<span style="margin-top:-2px;" class="kt-badge kt-badge--' + badge + ' kt-badge--dot kt-badge--xl"></span> ' + row.provisions.prov_forecast.toFixed(2) + ' zł';
					return '<span style="font-size:14px;">' + output + '</span>';
				},
			}, {
        field: 'sells',
        title: 'Sprzedaż',
        template: function(row) {
          return '<span style="font-size:14px;"><span style="margin-top:-2px;" class="kt-badge kt-badge--danger kt-badge--dot kt-badge--xl"></span> 0 zł</span>';
        },
      }]
		});
  }

  // Sparkline Chart helper function
  var _initSparklineChart = function(src, label, data, color, border) {
    if (src.length == 0) {
        return;
    }

    var ctx = document.getElementById("kt_chart_quick_stats_1").getContext("2d");

    var gradient = ctx.createLinearGradient(20, 0, 0, 240);
    gradient.addColorStop(0, Chart.helpers.color('#00c5dc').alpha(0.7).rgbString());
    gradient.addColorStop(1, Chart.helpers.color('#f2feff').alpha(0).rgbString());

    var config = {
        type: 'line',
        data: {
            labels: label,
            datasets: [{
                label: "",
                borderColor: color,
                borderWidth: border,
                backgroundColor: gradient,

                pointHoverRadius: 4,
                pointHoverBorderWidth: 12,
                pointBackgroundColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
                pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
                pointHoverBackgroundColor: KTApp.getStateColor('danger'),
                pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.1).rgbString(),
                fill: true,
                data: data,
            }]
        },
        options: {
            title: {
                display: false,
            },
            tooltips: {
                enabled: true,
                intersect: false,
                mode: 'nearest',
                xPadding: 10,
                yPadding: 10,
                caretPadding: 10
            },
            legend: {
                display: false,
                labels: {
                    usePointStyle: true
                }
            },
            responsive: false,
            maintainAspectRatio: true,
            hover: {
                mode: 'index'
            },
            scales: {
                xAxes: [{
                    display: false,
                    gridLines: false,
                    scaleLabel: {
                        display: false,
                        labelString: 'Desc'
                    }
                }],
                yAxes: [{
                    display: false,
                    gridLines: false,
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },

            elements: {
                point: {
                    radius: 4,
                    borderWidth: 12
                },
            },

            layout: {
                padding: {
                    left: 0,
                    right: 10,
                    top: 5,
                    bottom: 0
                }
            }
        }
    };

    return new Chart(src, config);
  }

	var activeCharts = function() {
			// PIE CHART
			$.ajax({
				url: '/rest/stats/offers_count',
				method: 'POST',
				success: function(res) {
					new Morris.Donut({
							element: 'kt_donut_offers',
							data: res,
							colors: ['#593ae1', '#6e4ff5', '#9077fb'],
							resize: true
					});
				},
				error: function() {
					console.log('Wystąpił błąd podczas pobierania statystyk ofertowych.');
				}
			});

			$.ajax({
				url: '/rest/stats/prov_forecast',
				method: 'POST',
				success: function(res) {
					var label = [], values = [];

					var reverse = res.values.reverse();

					var last_day = parseFloat(reverse[reverse.length-1].value),
					today = parseFloat(res.today_prov);

					if(last_day > today) {
						var percentage = 100 - ((today/last_day)*100).toFixed();
						$('#kt_chart_1_value').html(res.today_prov + ' PLN&nbsp;&nbsp;<i class="kt-font-danger flaticon2-arrow-down">' + percentage + '%</i>');
					} else if(last_day != 0 && last_day < today) {
						var percentage = ((today/last_day)*100).toFixed() - 100;
						$('#kt_chart_1_value').html(res.today_prov + ' PLN&nbsp;&nbsp;<i class="kt-font-success flaticon2-arrow-up">' + percentage + '%</i>');
          } else if(last_day == today) {
            $('#kt_chart_1_value').html(res.today_prov + ' PLN&nbsp;&nbsp;<i class="kt-font-brand flaticon2-line">0%</i>');
          } else if(last_day == 0) {
						$('#kt_chart_1_value').html(res.today_prov + ' PLN&nbsp;&nbsp;<i class="kt-font-success flaticon2-arrow-up">--%</i>');
          }

					reverse.forEach(function(element) {
						label.push(moment(element.created_at).local().format('DD-MM-YYYY'));
						values.push(parseFloat(element.value).toFixed(2));
					});

					_initSparklineChart($('#kt_chart_quick_stats_1'), label, values, KTApp.getStateColor('success'), 3);
				},
				error: function() { }
			});

			$.ajax({
				url: '/rest/stats/counts',
				method: 'POST',
				success: function(res) {
					$('#client_count').html(res.client_count);
					$('#roffer_count').html(res.roffer_count);
				},
				error: function() { }
			});
	}

  return {
    init: function() {
      init();
      activeCharts();
    }
  }
}();

jQuery(document).ready(function() {
  KTDashboardCharts.init();
});
