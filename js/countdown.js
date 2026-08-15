// меняем TOUR_DATE
var TOUR_DATE = '2027-09-15T19:00:00'; 
var TOUR_LABEL = 'до нового тура'; 

window.initCountdown = function () { 
    var el = document.getElementById('countdown-text'); 
    var labelEl = document.getElementById('countdown-label'); 
    if (!el) return; 
    if (labelEl) labelEl.textContent = TOUR_LABEL; 

    var target = new Date(TOUR_DATE).getTime(); 


    function pluralize(number, titles) {
        var n1 = number % 10;
        var n100 = number % 100;
        
        if (n100 >= 11 && n100 <= 19) {
            return titles[2]; // дней, часов, минут, секунд
        }
        if (n1 == 1) {
            return titles[0]; // день, час, минута, секунда
        }
        if (n1 >= 2 && n1 <= 4) {
            return titles[1]; // дня, часа, минуты, секунды
        }
        return titles[2]; // дней, часов, минут, секунд
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
