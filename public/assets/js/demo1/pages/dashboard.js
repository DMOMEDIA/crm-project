"use strict";

// Class definition
var KTDashboard = function() {
		var topbar_notify = $('#topbar_notifications_notify'),
		cnt_notify = $('#count_notify'),
		unread = 0,
		audioElement = null,
		app_version = '1.8.1.5 beta',
		app_update = '2020-08-24 00:00:00';

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

					if($('h3.kt-subheader__title').html() == 'Pulpit nawigacyjny') {
						if(unread > 0) {
							if(unread == 1) var string = 'Masz ' + unread + ' nieodczytane powiadomienie.';
							if(unread >= 2 && unread <= 4) var string = 'Masz ' + unread + ' nieodczytane powiadomienia.';
							if(unread >= 5) var string = 'Masz ' + unread + ' nieodczytanych powiadomień.';

							KTUtil.showNotifyAlert('warning', string, 'Powiadomienia', 'flaticon-alert');
							audioElement.play();
						}

						if(moment(app_update).unix() > moment().unix())
							KTUtil.showNotifyAlert('success', 'Aplikacja została zaktualizowana do najnowszej wersji.</br>Sprawdź <a href="/dashboard/system"><b>historię zmian</b></a>.', 'Aktualizacja ' + app_version, 'flaticon-download');
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
