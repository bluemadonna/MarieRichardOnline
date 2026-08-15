// меняем TOUR_DATE
var TOUR_DATE = '2027-09-15T19:00:00'; 
var TOUR_LABEL = 'до нового тура'; 

window.initCountdown = function () { 
    var el = document.getElementById('countdown-text'); 
    var labelEl = document.getElementById('countdown-label'); 
    if (!el) return; 
    if (labelEl) labelEl.textContent = TOUR_LABEL; 

    var target = new Date(TOUR_DATE).getTime(); 

    // Исправленная функция склонения слов
    function pluralize(number, titles) {
        var cases =;
        return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    }

    function tick() { 
        var now = new Date().getTime(); 
        var diff = target - now; 

        if (isNaN(diff) || diff <= 0) { 
            el.textContent = 'Тур уже начался! ♥'; 
            clearInterval(window.mroCountdownInterval); 
            return; 
        } 

        var days = Math.floor(diff / (1000 * 60 * 60 * 24)); 
        var hours = Math.floor((diff / (1000 * 60 * 60)) % 24); 
        var minutes = Math.floor((diff / (1000 * 60)) % 60); 
        var seconds = Math.floor((diff / 1000) % 60); 

        function pad(n) { 
            return String(n).padStart(2, '0'); 
        } 

        var dText = pluralize(days, ['день', 'дня', 'дней']);
        var hText = pluralize(hours, ['час', 'часа', 'часов']);
        var mText = pluralize(minutes, ['минута', 'минуты', 'минут']);
        var sText = pluralize(seconds, ['секунда', 'секунды', 'секунд']);

        el.textContent = days + ' ' + dText + ' ' + 
                         pad(hours) + ' ' + hText + ' ' + 
                         pad(minutes) + ' ' + mText + ' ' + 
                         pad(seconds) + ' ' + sText; 
    } 

    tick(); 
    window.mroCountdownInterval = setInterval(tick, 1000); 
};
