app.factory('SettingService', function () {
    
    function set(key, value) {
        localStorage.setItem(key, value);
    }

    function get(key, defaultValue) {
        return localStorage.getItem(key) || defaultValue;
    }

    return {
        set,
        get
    };
});