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
      title: 'Dashboard - CRM System',
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

// {STOP} Strony po zalogowaniu
