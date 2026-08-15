var TOUR_DATE = '2027-09-14T19:00:00'; 
var TOUR_LABEL = 'До альбома'; 

window.initCountdown = function () { 
    var el = document.getElementById('countdown-text'); 
    var labelEl = document.getElementById('countdown-label'); 
    
    if (!el) return; 
    if (labelEl) labelEl.textContent = TOUR_LABEL; 
    
    var target = new Date(TOUR_DATE).getTime(); 
    
    function tick() { 
        var now = new Date().getTime(); 
        var diff = target - now; 
        
        // Если дата не распозналась или время вышло
        if (isNaN(diff) || diff <= 0) { 
            el.textContent = 'Альбом уже вышел! ♥'; 
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
        
        el.textContent = days + ' дней ' + pad(hours) + ' часов ' + pad(minutes) + ' минут ' + pad(seconds) + ' секунд'; 
    } 
    
    tick(); 
    window.mroCountdownInterval = setInterval(tick, 1000); 
};
