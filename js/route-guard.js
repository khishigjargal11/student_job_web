class RouteGuard {
    static checkAuth() {
        if (!DataManager.isLoggedIn()) {
            window.location.href = 'Login.html';
            return false;
        }
        return true;
    }

    static requireStudentAuth() {
        const user = DataManager.getCurrentUser();
        if (!user || user.type !== 'student') {
            window.location.href = 'Login.html';
            return false;
        }
        return true;
    }

    static requireCompanyAuth() {
        const user = DataManager.getCurrentUser();
        if (!user || user.type !== 'company') {
            window.location.href = 'Login.html';
            return false;
        }
        return true;
    }
}

window.RouteGuard = RouteGuard;