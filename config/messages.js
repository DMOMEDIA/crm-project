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
    case 'err_selected_users': selected = { status: 'error', message: 'Błąd podczas usuwania użytkowników, spróbuj ponownie.' }; break;
    case 'success_delete_selected_users': selected = { status: 'success', message: 'Pomyślnie usunięto ' + argument + ' użytkowników.' }; break;
    case 'success_user_deleted': selected = { status: 'success', message: 'Użytkownik został pomyślnie usunięty.' }; break;
    case 'success_change_password': selected = { status: 'success', message: 'Pomyślnie zmieniono hasło użytkownika.' }; break;
    case 'success_updated_user': selected = { status: 'success', message: 'Poprawnie zaktualizowano dane użytkownika.' }; break;
    case 'success_updated_client': selected = { status: 'success', message: 'Poprawnie zaktualizowano dane klienta.' }; break;
    case 'no_param': selected = { status: 'error', message: 'Niepoprawny lub brak parametru.' }; break;
    case 'not_found_roffer': selected = { status: 'error', message: 'Zapytanie ofertowe nie istnieje.' }; break;
    case 'no_notification': selected = { status: 'error', message: 'Brak nowych powiadomień.' }; break;
    case 'added_new_offer': selected = { status: 'success', message: 'Nowa oferta została pomyślnie dodana.' }; break;
    case 'company_added': selected = { status: 'success', message: 'Pomyślnie dodano nową firmę.' }; break;
  }

  return selected;
}
