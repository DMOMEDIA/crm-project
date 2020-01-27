exports.message = (type, argument) => {
  var selected = '';
  switch(type) {
    case 'no_permission': selected = { status: 'error', message: 'Nie posiadasz uprawnień do wykonania tej czynności.' }; break;
    case 'no_authorization': selected = { status: 'error', message: 'Brak autoryzacji do wykonania tej czynności.' }; break;
    case 'not_found_user_identity': selected = { status: 'error', message: 'Użytkownik o podanym identyfikatorze nie istnieje.' }; break;
    case 'not_found_client_identity': selected = { status: 'error', message: 'Klient o podanym identyfikatorze nie istnieje.' }; break;
    case 'password_not_changed': selected = { status: 'error', message: 'Nie udało się zmienić hasła, spróbuj ponownie później.' }; break;
    case 'current_pass_incorrect': selected = { status: 'error', message: 'Aktualne hasło jest niepoprawne.' }; break;
    case 'data_get_error': selected = { status: 'error', message: 'Wystąpił problem podczas wczytywania danych, spróbuj ponownie później.' }; break;
    case 'save_user_critical_err': selected = { status: 'error', message: 'Wystąpił błąd krytyczny przy zapisie danych (1).' }; break;
    case 'added_new_user': selected = { status: 'success', message: 'Dodano nowego użytkownika o identyfikatorze ' + argument }; break;
    case 'added_new_client': selected = { status: 'success', message: 'Pomyślnie dodano nowego klienta.' }; break;
    case 'identity_not_selected': selected = { status: 'error', message: 'Identyfikator nie został uwzględniony.' }; break;
    case 'success_delete_selected_offers': selected = { status: 'success', message: 'Pomyślnie usunięto ' + argument + ' ofert/y.' }; break;
    case 'err_selected_offers': selected = { status: 'error', message: 'Błąd podczas usuwania ofert, spróbuj ponownie.' }; break;
    case 'err_selected_users': selected = { status: 'error', message: 'Błąd podczas usuwania użytkowników, spróbuj ponownie.' }; break;
    case 'err_selected_clients': selected = { status: 'error', message: 'Błąd podczas usuwania klientów, spróbuj ponownie.' }; break;
    case 'success_delete_selected_users': selected = { status: 'success', message: 'Pomyślnie usunięto ' + argument + ' użytkowników.' }; break;
    case 'success_delete_selected_clients': selected = { status: 'success', message: 'Pomyślnie usunięto ' + argument + ' klientów.' }; break;
    case 'success_user_deleted': selected = { status: 'success', message: 'Użytkownik został pomyślnie usunięty.' }; break;
    case 'success_client_deleted': selected = { status: 'success', message: 'Klient został pomyślnie usunięty.' }; break;
    case 'success_change_password': selected = { status: 'success', message: 'Pomyślnie zmieniono hasło użytkownika.' }; break;
    case 'success_updated_user': selected = { status: 'success', message: 'Poprawnie zaktualizowano dane użytkownika.' }; break;
    case 'success_updated_client': selected = { status: 'success', message: 'Poprawnie zaktualizowano dane klienta.' }; break;
    case 'no_param': selected = { status: 'error', message: 'Niepoprawny lub brak parametru.' }; break;
    case 'not_found_roffer': selected = { status: 'error', message: 'Zapytanie ofertowe nie istnieje.' }; break;
    case 'no_notification': selected = { status: 'error', message: 'Brak nowych powiadomień.' }; break;
    case 'added_new_offer': selected = { status: 'success', message: 'Nowa oferta została pomyślnie dodana.', param: argument }; break;
    case 'company_added': selected = { status: 'success', message: 'Pomyślnie dodano nową firmę.' }; break;
    case 'offer_status_change': selected = { status: 'success', message: 'Status oferty został pomyślnie zmieniony.' }; break;
    case 'offer_data_change': selected = { status: 'success', message: 'Dane oferty zostały pomyślnie zmienione.' }; break;
    case 'file_deleted_success': selected = { status: 'success', message: 'Plik został pomyślnie usunięty.' }; break;
    case 'file_deleted_fail': selected = { status: 'error', message: 'Wystąpił błąd podczas usuwania pliku.' }; break;
    case 'not_found_offer': selected = { status: 'error', message: 'Oferta o podanym identyfikatorze nie istnieje.' }; break;
    case 'success_offer_deleted': selected = { status: 'success', message: 'Oferta została pomyślnie usunięta.' }; break;
    case 'success_company_data_change': selected = { status: 'success', message: 'Pomyślnie zaktualizowano dane o firmie.' }; break;
    case 'added_new_files': selected = { status: 'success', message: 'Pliki zostały pomyślnie przesłane.' }; break;
    case 'client_status_change': selected = { status: 'success', message: 'Status klienta został pomyślnie zmieniony.' }; break;
    case 'request_offer_data_change': selected = { status: 'success', message: 'Dane zapytania ofertowego zostały pomyślnie zmienione.' }; break;
    case 'error_global': selected = { status: 'error', message: 'Wystąpił nieoczekiwany błąd, spróbuj ponownie później.' }; break;
    case 'success_send_mail_to_company': selected = { status: 'success', message: 'Pomyślnie wysłano zapytanie ofertowe do firm.' }; break;
    case 'client_add_fail': selected = { status: 'error', message: 'Klient o podanym adresie e-mail już istnieje.' }; break;
    case 'success_roffer_delete': selected = { status: 'success', message: 'Zapytanie ofertowe zostało pomyślnie usunięte.' }; break;
    case 'err_selected_roffers': selected = { status: 'error', message: 'Błąd podczas usuwania zapytań ofertowych, spróbuj ponownie.' }; break;
    case 'success_roffer_selected_delete': selected = { status: 'success', message: 'Pomyślnie usunięto ' + argument + ' zapytań.'  }; break;
    case 'success_roffer_add': selected = { status: 'success', message: 'Pomyślnie dodano nowe zapytanie ofertowe.' }; break;
  }

  return selected;
}
