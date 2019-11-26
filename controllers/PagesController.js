// {START} System uwierzytelniania i autoryzacji

exports.login = (req, res) => {
  if(!req.isAuthenticated()) {
    res.render('login', {
      formMessage: req.flash('message')
    });
  } else {
    res.redirect('/dashboard');
  }
};

exports.logout = (req, res) => {
  if(req.isAuthenticated()) {
    req.logout();
    req.session.expireSession = null;
    // **
    // Tutaj wprowadzić trzeba komunikat flash o poprawnym wylogowaniu.
    // Najprawodpodobniej skorzystamy z izi.Toast
    // **
  }
  res.redirect('/');
};

// {STOP} System uwierzytelniania i autoryzacji

// {START} Strony po zalogowaniu

// Dashboard
exports.dashboard = (req, res) => {
  if(req.isAuthenticated()) {
    res.render('dashboard', {
      title: 'Pulpit nawigacyjny',
      pageName: 'dashboard',
      formMessage: req.flash('success')
    });
  } else res.redirect('/');
};

// Podstrona modyfikacji uprawnień
exports.permissionPage = (req, res) => {
  if(!req.isAuthenticated()) return res.redirect('/dashboard');
  if(!res.locals.userPermissions.includes('crm.permissions.modify')) return res.redirect('/dashboard');

  res.render('permissions', {
    title: 'Zarządzanie uprawnieniami - CRM System',
    pageName: 'permissions'
  });
};

// Podstrona dodawania pracowników
exports.useradd = (req, res) => {
  if(!req.isAuthenticated()) return res.redirect('/dashboard');
  if(!res.locals.userPermissions.includes('crm.employees.add')) return res.redirect('/dashboard');

  res.render('useradd', {
    title: 'Dodawanie pracownika - CRM System',
    pageName: 'useradd'
  });
};

exports.userlist = (req, res) => {
  if(!req.isAuthenticated()) return res.redirect('/dashboard');
  if(!res.locals.userPermissions.includes('crm.employees.show')) return res.redirect('/dashboard');

  res.render('userlist', {
    title: 'Lista pracowników - CRM System',
    pageName: 'userlist'
  });
};

exports.clientlist = (req, res) => {
  if(!req.isAuthenticated()) return res.redirect('/dashboard');
  if(!res.locals.userPermissions.includes('crm.clients.show')) return res.redirect('/dashboard');

  res.render('clientlist', {
    title: 'Lista klientów',
    pageName: 'clientlist'
  })
};

exports.clientadd = (req, res) => {
  if(!req.isAuthenticated()) return res.redirect('/dashboard');
  if(!res.locals.userPermissions.includes('crm.clients.add')) return res.redirect('/dashboard');

  res.render('clientadd', {
    title: 'Dodawanie nowego klienta',
    pageName: 'clientadd'
  })
};

exports.userProfile = (req, res) => {
  if(!req.isAuthenticated()) return res.redirect('/dashboard');
  if(!res.locals.userPermissions.includes('crm.profile.show')) return res.redirect('/dashboard');

  res.render('profile', {
    title: 'Mój profil - ' + res.locals.userData.fullname,
    pageName: 'userprofile'
  });
};

exports.docs = (req, res) => {
  if(!req.isAuthenticated()) return res.redirect('/dashboard');
  res.render('documentation', {
    title: 'Pełna dokumentacja systemu CRM',
    pageName: 'documentation'
  });
};

exports.report = (req, res) => {
  if(!req.isAuthenticated()) return res.redirect('/dashboard');
  res.render('report', {
    title: 'Zgłoś błąd w aplikacji',
    pageName: 'report'
  });
};

exports.roffers = (req, res) => {
  if(!req.isAuthenticated()) return res.redirect('/dashboard');
  if(!res.locals.userPermissions.includes('crm.roffers.show')) return res.redirect('/dashboard');

  res.render('roffers', {
    title: 'Zapytania ofertowe Twoich klientów',
    pageName: 'rofferlist'
  });
};

exports.offers = (req, res) => {
  if(!req.isAuthenticated()) return res.redirect('/dashboard');
  if(!res.locals.userPermissions.includes('crm.offers.show')) return res.redirect('/dashboard');

  res.render('offers', {
    title: 'Lista ofert',
    pageName: 'offerlist'
  });
};

exports.offerAdd = (req, res) => {
  if(!req.isAuthenticated()) return res.redirect('/dashboard');
  if(!res.locals.userPermissions.includes('crm.offers.add')) return res.redirect('/dashboard');

  res.render('offeradd', {
    title: 'Dodaj nową ofertę',
    pageName: 'offeradd'
  });
};

exports.companylist = (req, res) => {
  if(!req.isAuthenticated()) return res.redirect('/dashboard');
  if(!res.locals.userPermissions.includes('crm.companies.show')) return res.redirect('/dashboard');

  res.render('companies', {
    title: 'Lista firm',
    pageName: 'companylist'
  });
};

exports.companyadd = (req, res) => {
  if(!req.isAuthenticated()) return res.redirect('/dashboard');
  if(!res.locals.userPermissions.includes('crm.companies.add')) return res.redirect('/dashboard');

  res.render('companyadd', {
    title: 'Dodaj firmę',
    pageName: 'companyadd'
  });
};

exports.statistics = (req, res) => {
  if(!req.isAuthenticated()) return res.redirect('/dashboard');

  res.render('statistics', {
    title: 'Statystyki globalne',
    pageName: 'statistics'
  });
};

// {STOP} Strony po zalogowaniu
