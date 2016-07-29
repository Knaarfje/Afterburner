app.factory('UtilityService', function() {
    function pad(n) {
        return (n < 10) ? ("0" + n) : n;
    };

    function sum(items) {
        let i = 0;
        for (let x in items) i += items[x];
        return i;
    };

    return {
        pad,
        sum
    }
})