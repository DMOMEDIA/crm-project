"use strict";

// Class definition
var KTRequestOfferAdd = function () {

  var formEl, validator;

  var global_implements = function() {
    var input = $('input[name="offer_type"]');

    input.on('change', function() {
      if($(this).is(':checked'))
        var checked = $(this).val();

      if(checked == 'leasing') {
        $('#leasing_offer').show();
        $('#insurance_offer').hide();
        $('#rent_offer').hide();
      } else if(checked == 'rent') {
        $('#leasing_offer').hide();
        $('#insurance_offer').hide();
        $('#rent_offer').show();
      } else {
        $('#leasing_offer').hide();
        $('#insurance_offer').show();
        $('#rent_offer').hide();
      }
    });

    $('#month_installment').ionRangeSlider({
      type: "double",
      grid: true,
      min: 100,
      max: 5000,
      from: 1000,
      to: 4000,
      postfix: " PLN"
    });
  };

  var initSubmit = function() {
    var btn = $('button[type="submit"]', formEl);

    btn.on('click', function(e) {
      e.preventDefault();

      if(validator.form()) {
        KTApp.progress(btn);

        setTimeout(function() {
          formEl.ajaxSubmit({
            url: '/rest/roffer/add_system',
            method: 'POST',
            data: formEl.serialize(),
            clearForm: false,
  					success: function(res) {
  						KTApp.unprogress(btn);
  						//KTApp.unblock(formEl);
              if(res.status == 'success') {
                swal.fire({
                  title: 'Udało się',
                  text: res.message,
                  type: res.status,
                  confirmButtonText: "Zamknij",
                  confirmButtonClass: "btn btn-sm btn-bold btn-brand",
                });
								KTUtil.clearInputInForm(formEl);
                $('input[type="checkbox"]').prop('checked', false);
                $('select#clientsRemote').html('<option></option>');
              } else {
                KTUtil.showNotifyAlert('danger', res.message, 'Coś jest nie tak..', 'flaticon-warning-sign');
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

  var initValidation = function() {
    //$('#wklad_l').inputmask({ 'alias': 'currency', rightAlign: false, digits: 2, prefix: '', clearMaskOnLostFocus: true });
    $('#wykup_l').inputmask({ 'alias': 'percentage', min:0, max:100, rightAlign: false });
    $('#wklad_l').inputmask({ 'alias': 'percentage', min:0, max:100, rightAlign: false });
    //$('#wklad_r').inputmask({ 'alias': 'currency', rightAlign: false, digits: 2, prefix: '', clearMaskOnLostFocus: true });
    $('#wykup_r').inputmask({ 'alias': 'percentage', min:0, max:100, rightAlign: false });
    $('#wklad_r').inputmask({ 'alias': 'percentage', min:0, max:100, rightAlign: false });
    $('#netto_val').inputmask({ 'alias': 'currency', rightAlign: false, digits: 2, clearMaskOnLostFocus: true, min: 1, prefix: '' });
    $("#engine_cap_i").inputmask('99999 cm³', { placeholder: "" });
    $("#km_val_i").inputmask('9999999 km', { numericInput: true, placeholder: "" });
    $("#power_cap_i").inputmask('999 km', { numericInput: true, placeholder: "" });

    validator = formEl.validate({
      // Validate only visible fields
      ignore: ":hidden",

      // Validation rules
      rules: {
        client_id: {
          required: true
        },
        nameItem: {
          required: true
        },
        pyear_l: {
          required: true
        },
        leasing_installment: {
          required: true
        },
        wklad_l: {
          required: true
        },
        wykup_l: {
          required: true
        },
        netto: {
          required: true
        },
        brand_r: {
          required: true
        },
        body_type_r: {
          required: true
        },
        fuel_type_r: {
          required: true
        },
        rent_installment: {
          required: true
        },
        wklad_r: {
          required: true
        },
        wykup_r: {
          required: true
        },
        brand_i: {
          required: true
        },
        pyear_i: {
          required: true
        },
        engine_cap_i: {
          required: true
        },
        power_cap_i: {
          required: true
        },
        vin_number: {
          required: true
        },
        reg_number: {
          required: true
        },
        km_val_i: {
          required: true
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
  };

  var initRemoteData = function() {
    var data = [];

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
  };

  jQuery.extend(jQuery.validator.messages, {
			required: "To pole jest wymagane.",
			remote: "",
			email: "",
			url: "",
			date: "",
			dateISO: "",
			number: "",
			digits: "To pole może zawierać jedynie cyfry.",
			creditcard: "",
			equalTo: ""
	});

  return {
    init: function() {
      formEl = $('#kt_form_roffer');

      global_implements();
      initSubmit();
      initValidation();
      initRemoteData();
    }
  };
}();

jQuery(document).ready(function() {
	KTRequestOfferAdd.init();
});
