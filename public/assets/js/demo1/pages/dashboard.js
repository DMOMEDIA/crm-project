"use strict";

// Class definition
var KTDashboard = function() {
	
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
            
            // demo loading
            var loading = new KTDialog({'type': 'loader', 'placement': 'top center', 'message': 'Ładowanie ...'});
            loading.show();

            setTimeout(function() {
                loading.hide();
            }, 3000);
        }
    };
}();

// Class initialization on page load
jQuery(document).ready(function() {
    KTDashboard.init();
});