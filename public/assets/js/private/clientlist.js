"use strict";
// Class definition

var KTClientListDatatable = function() {

	// variables
	var datatable;
	var form_personal;
	var validator_personal;
	var f_path;

	var ext = {
		'odt': 'doc',
		'docx': 'doc',
		'doc': 'doc',
		'pdf': 'pdf',
		'css': 'css',
		'csv': 'csv',
		'html': 'html',
		'js': 'javascript',
		'jpg': 'jpg',
		'jpeg': 'jpg',
		'mp4': 'mp4',
		'xml': 'xml',
		'zip': 'zip',
		'rar': 'zip'
	};

	// init
	var init = function() {
		// init the datatables. Learn more: https://keenthemes.com/metronic/?page=docs&section=datatable
		datatable = $('#kt_apps_client_list_datatable').KTDatatable({
			// datasource definition
			data: {
				type: 'remote',
				source: {
					read: {
						url: '/rest/clients/list'
					},
				},
				pageSize: 10, // display 20 records per page
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
				field: "eclientname",
				title: "Klient",
				width: 200,
				// callback function support for column rendering
				template: function(data, i) {
					var output = '\
							<div class="kt-user-card-v2">\
								<div class="kt-user-card-v2__pic">\
									<div class="kt-badge kt-badge--xl kt-badge--success">' + data.fullname.substring(0, 1) + '</div>\
								</div>\
								<div class="kt-user-card-v2__details">\
									<a href="javascript:;" class="kt-user-card-v2__name show_client_data" data-id="' + data.id + '">' + data.fullname + '</a>\
								</div>\
							</div>';
					return output;
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
				field: 'status',
				title: 'Status',
				autoHide: false,
				template: function(row) {
					var status = {
						0: {'title': 'Nieprzypisany', 'class': 'kt-badge--dark'},
						1: {'title': 'Niepełne dane', 'class': ' kt-badge--warning'},
						2: {'title': 'Niezweryfikowany', 'class': ' kt-badge--danger'},
						3: {'title': 'Zweryfikowany', 'class': ' kt-badge--success'},
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
						<a href="javascript:;" class="btn btn-sm btn-clean btn-icon btn-icon-md show_client_data" data-id="' + row.id + '">\
							<i class="flaticon2-menu-1"></i>\
						</a>\
					';
				}
			}]
		});
	}

	var initValid = function() {
		$('#nipInput').maxlength({
        warningClass: "kt-badge kt-badge--warning kt-badge--rounded kt-badge--inline",
        limitReachedClass: "kt-badge kt-badge--success kt-badge--rounded kt-badge--inline",
				appendToParent: true
    });

		validator_personal = form_personal.validate({
			ignore: ':hidden',

			rules: {
				firstname: {
					required: true
				},
				lastname: {
					required: true
				},
				fullname: {
					required: true
				},
				companyname: {
					required: true
				},
				company_type: {
					required: true
				},
				nip: {
					required: true,
					minlength: 10,
					maxlength: 10
				},
				email: {
					required: true,
					email: true
				}
			},
			messages: {
				firstname: {
					required: "To pole jest wymagane."
				},
				lastname: {
					required: "To pole jest wymagane."
				},
				fullname: {
					required: "To pole jest wymagane."
				},
				companyname: {
					required: "To pole jest wymagane."
				},
				company_type: {
					required: "To pole jest wymagane."
				},
				nip: {
					required: "To pole jest wymagane.",
					minlength: "Numer NIP musi składać się z 10 cyfr.",
					maxlength: "Numer NIP musi składać się z 10 cyfr."
				},
				email: {
					required: "To pole jest wymagane.",
					email: "Wprowadź poprawny adres e-mail."
				}
			},
			// Display error
			invalidHandler: function(event, validator_personal) {
				KTUtil.scrollTop();

				KTUtil.showNotifyAlert('danger', "Wypełnij wymagane pola i spróbuj ponownie.", 'Wystąpił błąd', 'flaticon-warning-sign');
			},

			// Submit valid form
			submitHandler: function (form) { }
		});
	}

	var initClientData = function() {
		datatable.on('kt-datatable--on-layout-updated', function(e) {
			var modalEl = $('#kt_fetch_client');

			$('.show_client_data').on('click', function() {
				var id = $(this).attr('data-id');

				modalEl.find('select#company_type option[value=""]').prop('selected', true);
				modalEl.find('select#remoteEmployeer').html('<option></option>');
				KTUtil.clearInputInForm(form_personal);

				KTApp.blockPage({ overlayColor: '#000000', type: 'v2', state: 'primary', message: 'Proszę czekać..' });

				$.ajax({
					url: '/rest/client/show',
					method: 'POST',
					data: { id: id },
					success: function(res) {
						setTimeout(function() {
								KTApp.unblockPage();

								if(res.status == null) {
									modalEl.modal('show');
									modalEl.find('#modalTitle').html(res.fullname);
									modalEl.find('#idInput1').val(res.id);
									modalEl.find('#idInput3').val(res.id);
									modalEl.find('#attached_files').html('');

									var type = res.company, name = res.fullname.split(' ');

									// 1 - Firma
									// 0 - Osoba prywatna

									var acctype = $('input[type="radio"][name="client_type"]');
									acctype.filter('[value="' + type + '"]').prop('checked', true);

									if(type == 0) {
										modalEl.find('#company_user').hide();
										modalEl.find('#private_user').show();
										modalEl.find('#firstnameInput').val(name[0]).attr('hidden', false);
										modalEl.find('#lastnameInput').val(name[1]).attr('hidden', false);
										modalEl.find('#fullnameInput').attr('hidden', true);
									} else {
										modalEl.find('#company_user').show();
										modalEl.find('#private_user').hide();
										modalEl.find('#fullnameInput').val(res.fullname).attr('hidden', false);
										modalEl.find('#firstnameInput').attr('hidden', true);
										modalEl.find('#lastnameInput').attr('hidden', true);
									}

									modalEl.find('select[name="change_status"] option[value="' + res.state + '"]').prop('selected', true);
									modalEl.find('select#company_type option[value="' + res.company_type + '"]').prop('selected', true);
									modalEl.find('#nipInput').val(res.nip);
									modalEl.find('#telephoneInput').val(res.phone);
									modalEl.find('#emailInput').val(res.email);

									f_path = 'client_' + res.id + '_' + moment(res.created_at).local().format('YYYY');
									$.ajax({
										url: '/rest/files/get',
										method: 'POST',
										data: { folder_path: 'clients/' + f_path },
										success: function(res) {
											if(res.files) {
												if(res.files.length != 0) {
													res.files.forEach(file => {
														var extension = file.split('.');
														modalEl.find('#attached_files').append('\<div class="kt-widget4__item">\
																<div class="kt-widget4__pic kt-widget4__pic--icon">\
																	<img src="./assets/media/files/' + ext[extension[1]] + '.svg" alt="">\
																</div>\
																<a href="javascript:;" class="kt-widget4__title">' + file + '</a>\
																<div class="kt-widget4__tools">\
																	<a href="javascript:;" data-path="' + f_path + '/' + file + '"  class="btn btn-clean btn-icon btn-sm download_file">\
																		<i class="flaticon2-download"></i>\
																	</a>\
																	<a href="javascript:;" data-path="' + f_path + '/' + file + '" class="btn btn-clean btn-icon btn-sm remove_file">\
																		<i class="flaticon2-delete"></i>\
																	</a>\
																</div>\
															</div>\
														');
													});
												}
											}
										},
										error: function(err) {
											throw err;
										}
									});

									if(res.user_id != null) {
										$.ajax({
											url: '/rest/user/showlimited',
											method: 'POST',
											data: { id: res.user_id },
											success: function(response) {
												modalEl.find('select#remoteEmployeer').html('<option value="' + response.id + '">' + response.fullname + ', ' + response.role + '</option>');
											},
											error: function(err) {}
										}).done(function(data) {
											remoteEmploy();
										});
									} else {
										remoteEmploy();
									}

									// Zmiana typu konta
									acctype.on('change', function(e) {
										KTApp.block(form_personal, {
												overlayColor: '#000000',
												type: 'v2',
												state: 'primary',
												message: 'Proszę czekać...'
										});

										setTimeout(function() {
												KTUtil.clearInputInForm(form_personal);
												if(type == 0) {
													type = 1;
													modalEl.find('#private_user').hide();
													modalEl.find('#company_user').show();
													modalEl.find('#firstnameInput').attr('hidden', true);
													modalEl.find('#lastnameInput').attr('hidden', true);
													modalEl.find('#fullnameInput').attr('hidden', false);
												} else {
													type = 0;
													modalEl.find('#private_user').show();
													modalEl.find('#company_user').hide();
													modalEl.find('#firstnameInput').attr('hidden', false);
													modalEl.find('#lastnameInput').attr('hidden', false);
													modalEl.find('#fullnameInput').attr('hidden', true);
												}
												KTApp.unblock(form_personal);
										}, 500);
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

			$('.delete_user').on('click', function() {
				var id = $(this).attr('data-id');

				swal.fire({
					html: "Jesteś pewny że chcesz usunąć tego użytkownika?",
					type: "info",

					confirmButtonText: "Usuń",
					confirmButtonClass: "btn btn-sm btn-bold btn-brand",

					showCancelButton: true,
					cancelButtonText: "Anuluj",
					cancelButtonClass: "btn btn-sm btn-bold btn-default"
				}).then(function(result) {
					if (result.value) {
						$.ajax({
							url: '/rest/user/delete',
							method: 'POST',
							data: { id: id },
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
			});
		});
	}

	var initFileButtons = function() {
		$(document).on('click', '.download_file', function() {
			var path = 'clients/' + $(this).attr('data-path');

			$.ajax({
				url: '/rest/file/download',
				method: 'POST',
				data: { path: path },
				xhrFields: {
					responseType: 'blob'
				},
				success: function(res, status, xhr) {
					var fileName = xhr.getResponseHeader('Content-Disposition').split("=")[1];
					fileName = fileName.replace(/\"/g, '');

					var a = document.createElement('a');
			    var url = window.URL.createObjectURL(res);
			    a.href = url;
			    a.download = fileName;
			    a.click();
			    window.URL.revokeObjectURL(url);
				},
				error: function(err) {
					KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Wystąpił błąd', 'flaticon-warning-sign');
				}
			});
		});

		/**
			@Information Wydarzenie usuwające wybrany plik z systemu
		**/

		$(document).on('click', '.remove_file', function() {
			var path = 'clients/' + $(this).attr('data-path'),
			element = $(this);

			swal.fire({
				text: "Jesteś pewny że chcesz usunąć ten plik?",
				type: 'info',

				confirmButtonText: "Usuń",
				confirmButtonClass: "btn btn-sm btn-bold btn-brand",

				showCancelButton: true,
				cancelButtonText: "Anuluj",
				cancelButtonClass: "btn btn-sm btn-bold btn-default"
			}).then(function(result) {
				if(result.value) {
					$.ajax({
						url: '/rest/file/delete',
						method: 'POST',
						data: { path: path },
						success: function(res) {
							if(res.status == 'success') {
								swal.fire({
									title: 'Usunięto',
									text: res.message,
									type: res.status,
									confirmButtonText: "Zamknij",
									confirmButtonClass: "btn btn-sm btn-bold btn-brand",
								});
								element.parents('.kt-widget4__item').remove();
							} else {
								swal.fire({
									title: 'Błąd',
									text: res.message,
									type: res.status,
									confirmButtonText: "Zamknij",
									confirmButtonClass: "btn btn-sm btn-bold btn-brand",
								});
							}
						},
						error: function(err) {
							KTUtil.showNotifyAlert('danger', 'Wystąpił błąd podczas połączenia z serwerem.', 'Wystąpił błąd', 'flaticon-warning-sign');
						}
					});
				}
			});
		});
	}

	var remoteEmploy = function() {
		var data = [];

		$.ajax({
			url: '/rest/users/name',
			method: 'GET',
			data: {},
			success: function(res) {
				if(res.status == null) {
					for(var i = 0; i < res.length; i++) data.push({ id: res[i].id, text: res[i].fullname + ', ' + res[i].role });

					$('#remoteEmployeer').select2({
						placeholder: "Wybierz pracownika",
						width: '100%',
						data: data
					});
				}
			},
			error: function(err) {
				console.log('Błąd wczytywania');
			}
		});
	}

	var submitData = function() {
		var btn_pers = $('button[type="submit"]', form_personal);

		// Submit personal form
		btn_pers.on('click', function(e) {
			e.preventDefault();

			if(validator_personal.form()) {
				KTApp.progress(btn_pers);
				btn_pers.attr('disabled', true);

				setTimeout(function() {
					form_personal.ajaxSubmit({
						url: '/rest/clients/modify',
						method: 'POST',
						data: form_personal.serialize(),
						success: function(res) {
							KTApp.unprogress(btn_pers);
							btn_pers.attr('disabled', false);

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

			var userText = 'użytkowników';
			if(ids.length == 1) userText = 'użytkownika';

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

	var initDropzone = function() {
		$('#kt_dropzone_client_files').dropzone({
			url: '/rest/files/upload/client',
			autoProcessQueue: true,
			paramName: function() { return 'source_file[]' }, // The name that will be used to transfer the file
			maxFiles: 5,
			maxFilesize: 10, // MB
			addRemoveLinks: true,
			uploadMultiple: true,
			parallelUploads: 5,
			acceptedFiles: "application/pdf,.docx,.odt,.xls",
			init: function() {
				var dzUpload = this;

				this.on("success", function(file, res) {
					var extension = file.name.split('.');
					$('#attached_files').append('\<div class="kt-widget4__item">\
							<div class="kt-widget4__pic kt-widget4__pic--icon">\
								<img src="./assets/media/files/' + ext[extension[1]] + '.svg" alt="">\
							</div>\
							<a href="javascript:;" class="kt-widget4__title">' + file.name + '</a>\
							<div class="kt-widget4__tools">\
								<a href="javascript:;" data-path="' + f_path + '/' + file.name + '"  class="btn btn-clean btn-icon btn-sm download_file">\
									<i class="flaticon2-download"></i>\
								</a>\
								<a href="javascript:;" data-path="' + f_path + '/' + file.name + '" class="btn btn-clean btn-icon btn-sm remove_file">\
									<i class="flaticon2-delete"></i>\
								</a>\
							</div>\
						</div>\
					');

					swal.fire({
						"title": "",
						"text": res.message,
						"type": "success",
						"confirmButtonClass": "btn btn-secondary"
					});
					dzUpload.removeAllFiles();
				});

				this.on("sendingmultiple", function(file, xhr, formData) {
					formData.append('folder_path', f_path);
				});
			}
		});
	};

	var updateTotal = function() {
		datatable.on('kt-datatable--on-layout-updated', function () {
			//$('#kt_subheader_total').html(datatable.getTotalRows() + ' Total');
		});
	};

	var initChangeStatus = function() {
		var form_status = $('#form_change_status'),
		btn = $('button[type="submit"]', form_status);

		btn.on('click', function(e) {
			e.preventDefault();

			KTApp.progress(btn);
			btn.attr('disabled', true);

			setTimeout(function() {
				form_status.ajaxSubmit({
					url: '/rest/client/status',
					method: 'POST',
					data: form_status.serialize(),
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
		});
	}

	return {
		// public functions
		init: function() {
			form_personal = $('#kt_client_edit_personal');

			init();
			initValid();
			initClientData();
			submitData();
			selection();
			selectedDelete();
			initDropzone();
			initFileButtons();
			initChangeStatus();
			updateTotal();
		},
	};
}();

// On document ready
KTUtil.ready(function() {
	KTClientListDatatable.init();
});
