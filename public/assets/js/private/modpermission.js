"use strict";

var KTModPermission = function () {

  var uploadDataPerm = function () {

    $('#role_select').on('change', function() {
      updateData(this.value);
    });

    $('.form-perm-modify').on('submit', function (e) {
      e.preventDefault();
      var form = $(this);

      $('#button-save').addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
      setTimeout(function () {
        saveData(form);
      }, 1000);
    });


    var saveData = function($form) {

      var values = {}, array = [];
      $.each($form.serializeArray(), function(i, field) {
        if(field.name == 'role') {
          values[field.name] = field.value;
          if(field.value == 'administrator') array.push('crm.permissions.modify');
        } else {
          if(field.value == 'on') array.push(field.name);
        }
      });
      values['permissions'] = array;
      console.log(values);

      $('#button-save').removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

      $.ajax({
        url: '/rest/permissions/modify',
        method: 'POST',
        data: values,
        success: function(res) {
          if(res.status == 'success') KTUtil.showNotifyAlert('success', res.message, 'Udało się!', 'flaticon2-checkmark');
          else KTUtil.showNotifyAlert('danger', res.message, 'Coś poszło nie tak..', 'flaticon-warning-sign');
        },
        error: function(err) {
          KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś poszło nie tak..', 'flaticon-warning-sign');
        }
      });
    };

    var updateData = function(value) {
      $.ajax({
        url: '/rest/permissions',
        type: 'GET',
        data: {
          role: value
        },
        success: function(res) {
          if(res.status == 'error')
            return KTUtil.showNotifyAlert('danger', res.message, 'Coś poszło nie tak..', 'flaticon-warning-sign');

          if($('#show_table_perm').hasClass('kt-hidden')) {
            KTApp.blockPage({
                overlayColor: '#000000',
                type: 'v2',
                state: 'primary',
                message: 'Ładowanie danych..'
            });

            setTimeout(function() {
                $('#show_table_perm').removeClass('kt-hidden');
                KTApp.unblockPage();
            }, 1000);
          }

          $('#role_form').val($('#role_select').val());

          // Unlock inputs
          $(':submit[name="saveperm"]').prop('disabled', false);
          $(':checkbox').prop('disabled', false);
          $('#red-communicate').addClass('kt-hidden');

          if(value == 'administrator') {
            $(':checkbox[name="crm.permissions.modify"]').prop('disabled', true);
            $('#red-communicate').removeClass('kt-hidden');
          }

          // Clear checkboxes
          $(':checkbox').prop('checked', false);

          $.each(res, function(i, value) {
            $(':checkbox[name="' + value + '"]').prop('checked', true);
          });
        },
        error: function(err) {
          KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Coś poszło nie tak..', 'flaticon-warning-sign');
        }
      });
    }

    if($('#role_select').val() != null) {
      updateData($('#role_select').val());
    }
  };

  // Public Functions
  return {
    init: function () {
      uploadDataPerm();
    }
  };
}();

// Class Initialization
jQuery(document).ready(function () {
	KTModPermission.init();
});
