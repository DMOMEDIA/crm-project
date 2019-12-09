"use strict";

// Class definition
var KTDashboard = function() {
		var topbar_notify = $('#topbar_notifications_notify'),
		cnt_notify = $('#count_notify'),
		unread = 0,
		audioElement = null;

		// Sparkline Chart helper function
    var _initSparklineChart = function(src, label, data, color, border) {
        if (src.length == 0) {
            return;
        }

        var config = {
            type: 'line',
            data: {
                labels: label,
                datasets: [{
                    label: "",
                    borderColor: color,
                    borderWidth: border,

                    pointHoverRadius: 4,
                    pointHoverBorderWidth: 12,
                    pointBackgroundColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
                    pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
                    pointHoverBackgroundColor: KTApp.getStateColor('danger'),
                    pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.1).rgbString(),
                    fill: false,
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
                responsive: true,
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
							var percentage = ((today/last_day)*100).toFixed();
						} else {
							var percentage = ((today/last_day)*100).toFixed() - 100;
							$('#kt_chart_1_value').html(res.today_prov + ' PLN &nbsp;&nbsp; <i class="kt-font-success flaticon2-arrow-up">12%</i>');
						}

						reverse.forEach(function(element) {
							label.push(moment(element.created_at).local().format('DD-MM-YYYY'));
							values.push(element.value);
						});

						console.log(label);
						console.log(values);
						_initSparklineChart($('#kt_chart_quick_stats_1'), label, values, KTApp.getStateColor('brand'), 3);
					},
					error: function() { }
				});
		}

		function timeDifference(current, previous) {
			var msPerMinute = 60;
			var msPerHour = msPerMinute * 60;
			var msPerDay = msPerHour * 24;
			var msPerMonth = msPerDay * 30;
			var msPerYear = msPerDay * 365;

			var elapsed = current - previous;

			if (elapsed < msPerMinute) {
					elapsed = Math.round(elapsed);
					elapsed = elapsed.toString();
					if(elapsed == 1) return elapsed + ' sekundę temu';
					else if(elapsed > 1 && elapsed < 5) return elapsed + ' sekundy temu';
					else return elapsed + ' sekund temu';
			}

			else if (elapsed < msPerHour) {
					elapsed = Math.round(elapsed/msPerMinute);
					if(elapsed == 1) return elapsed + ' minutę temu';
					else if(elapsed > 1 && elapsed < 5) return elapsed + ' minuty temu';
					else return elapsed + ' minut temu';
			}

			else if (elapsed < msPerDay) {
					elapsed = Math.round(elapsed/msPerHour);
					if(elapsed == 1) return elapsed + ' godzinę temu';
					else if(elapsed > 1 && elapsed < 5) return elapsed + ' godziny temu';
					else return elapsed + ' godzin temu';
			}

			else if (elapsed < msPerMonth) {
					elapsed = Math.round(elapsed/msPerDay);
					if(elapsed == 1) return elapsed + ' dzień temu';
					else return elapsed + ' dni temu';
			}

			else if (elapsed < msPerYear) {
					elapsed = Math.round(elapsed/msPerMonth);
					if(elapsed == 1) return elapsed + ' miesiąc temu';
					else if(elapsed > 1 && elapsed < 5) return elapsed + ' miesiące temu';
					else return elapsed + ' miesięcy temu';
			}

			else {
					elapsed = Math.round(elapsed/msPerYear);
					if(elapsed == 1) return elapsed + ' rok temu';
					else if(elapsed > 1 && elapsed < 5) return elapsed + ' lata temu';
					else return elapsed + ' lat temu';
			}
		}

		var quickStats = function() {
			_initSparklineChart($('#kt_chart_quick_stats_2'), ["Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad"], [32, 16, 12, 4, 4, 18, 14], KTApp.getStateColor('danger'), 3);
		}

		var notificationSound = function() {
			audioElement = document.createElement('audio');
			audioElement.setAttribute('src', '/assets/media/misc/pull-out.mp3');
		}

		var updateNotifications = function() {
			setInterval(function() {
				$.ajax({
					url: '/rest/notifications',
					method: 'POST',
					success: function(res) {
						if(unread != res.unread) {
							unread = res.unread;
							audioElement.play();

							if(!$('#notification_button').hasClass('kt-pulse kt-pulse--brand'))
								$('#notification_button').addClass('kt-pulse kt-pulse--brand');
							$('#count_badge').html(res.unread);

							if(res.unread > 0 && res.unread < 5) cnt_notify.html(res.unread + ' nowe');
							else cnt_notify.html(res.unread + ' nowych');

							if(res.notifications != null) {
								topbar_notify.html('<div id="notifications_all" class="kt-notification kt-margin-t-10 kt-margin-b-10 kt-scroll" data-scroll="true" data-height="300" data-mobile-height="200" style="height: 200px; overflow: auto;"></div>');

								res.notifications.forEach(function(item) {
									var arrived = timeDifference(moment().unix(),moment(item.created_at).unix());

									topbar_notify.find('#notifications_all').append('\
										<a href="javascript:;" data-id="' + item.id + '" class="set_unread_notify kt-notification__item ' + (item.read == 1 ? '' : 'kt-notification__item--read') + '">\
			                <div class="kt-notification__item-icon">\
			                    <i class="' + item.icon_color + '"></i>\
			                </div>\
			                <div class="kt-notification__item-details">\
			                    <div class="kt-notification__item-title">' + item.notification + '</div>\
			                    <div class="kt-notification__item-time">' + arrived + '</div>\
			                </div>\
			            	</a>');
								});
							}
						}
					}
				});
			}, 5000);
		}

		var insertNotifications = function() {
			$.ajax({
				url: '/rest/notifications',
				method: 'POST',
				success: function(res) {
					if(res.unread != 0) {
						if(!$('#notification_button').hasClass('kt-pulse kt-pulse--brand'))
							$('#notification_button').addClass('kt-pulse kt-pulse--brand');
						$('#count_badge').html(res.unread);
						unread = res.unread;

						if(res.unread > 0 && res.unread < 5) cnt_notify.html(res.unread + ' nowe');
						else cnt_notify.html(res.unread + ' nowych');
					}

					if(res.notifications.length > 0) {
						topbar_notify.html('<div id="notifications_all" class="kt-notification kt-margin-t-10 kt-margin-b-10 kt-scroll" data-scroll="true" data-height="300" data-mobile-height="200" style="height: 200px; overflow: auto;"></div>');

						res.notifications.forEach(function(item) {
							var arrived = timeDifference(moment().unix(),moment(item.created_at).unix());

							topbar_notify.find('#notifications_all').append('\
								<a href="javascript:;" data-id="' + item.id + '" class="set_unread_notify kt-notification__item ' + (item.read == 1 ? '' : 'kt-notification__item--read') + '">\
	                <div class="kt-notification__item-icon">\
	                    <i class="' + item.icon_color + '"></i>\
	                </div>\
	                <div class="kt-notification__item-details">\
	                    <div class="kt-notification__item-title">' + item.notification + '</div>\
	                    <div class="kt-notification__item-time">' + arrived + '</div>\
	                </div>\
	            	</a>');
						});
					}
				}
			});
		}

		var setUnreadNotification = function() {
			$('#topbar_notifications_notify').on('click', '.set_unread_notify', function() {
				var this2 = $(this),
				id = this2.attr('data-id');
				if(!this2.hasClass('kt-notification__item--read')) {
					$.ajax({
						url: '/rest/notification/unread',
						method: 'POST',
						data: { id: id },
						success: function(res) {
							if(res.status == 'success') {
								this2.addClass('kt-notification__item--read');
								unread--;
								$('#count_badge').html(unread);

								if(unread > 0 && unread < 5) cnt_notify.html(unread + ' nowe');
								else cnt_notify.html(unread + ' nowych');

								if(unread == 0) $('#notification_button').removeClass('kt-pulse kt-pulse--brand');
							}
						}
					});
				}
			});
		}

		// Timeout user session
		var sessionTimeout = function() {
			$(document).idle({
			  onIdle: function(){
			    swal.fire({
						"title": "Twoja sesja wygasła",
						"text": "Wykryliśmy Twoją nieaktywność. Ze względów bezpieczeństwa zostałeś wylogowany, zaloguj się ponownie.",
						"type": "warning",
						"confirmButtonClass": "btn btn-secondary"
					}).then((isConfirm) => {
			        swal.fire({ "text": "Przekierowanie", "confirmButtonClass": "btn btn-secondary" });
			        window.location.href = "/logout";
					});

			    $(".swal-text").css("text-align", "center");
			  },
			  idle: 900000
			})
		}

    // Daterangepicker Init
    var daterangepickerInit = function() {
        if ($('#kt_dashboard_daterangepicker').length == 0) {
            return;
        }

        var picker = $('#kt_dashboard_daterangepicker');
        var date = moment();

        function cb(dateval, label) {
            var title = '';
            var range = '';

            if (dateval != null || label == 'Today') {
                title = 'Dzisiaj jest:';
                range = dateval.format('DD MMMM YYYY');
            }

            $('#kt_dashboard_daterangepicker_date').html(range);
            $('#kt_dashboard_daterangepicker_title').html(title);
        }

        picker.datepicker('setDate', 'today');

        cb(date, '');
	}

    return {
        // Init demos
        init: function() {
            // init daterangepicker
            daterangepickerInit();
						notificationSound();
						insertNotifications();
						updateNotifications();
						setUnreadNotification();
						sessionTimeout();
						quickStats();
						activeCharts();

            // demo loading
            var loading = new KTDialog({'type': 'loader', 'placement': 'top center', 'message': 'Ładowanie ...'});
            loading.show();

            setTimeout(function() {
                loading.hide();
            }, 2000);
        }
    };
}();

// Class initialization on page load
jQuery(document).ready(function() {
    KTDashboard.init();
});
