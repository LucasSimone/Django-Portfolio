$( document ).ready(function() {

    $('a[href="' + location.pathname + '"]').closest('a').addClass('active').attr('aria-current', 'page'); 

    placeThemePicker();
    

    // CLICKS

    // Changes the site color mode
    $('.theme-picker').click(function(e){
        if($('html').attr('data-bs-theme') == 'dark') {
            $('html').attr('data-bs-theme', 'light');
            localStorage.setItem("theme", "light");
        } else {
            $('html').attr('data-bs-theme', 'dark');
            localStorage.setItem("theme", "dark");
        }
    });

});


// Set Color theme
localStorage.getItem("theme") ? $('html').attr('data-bs-theme', localStorage.getItem("theme") ) : $('html').attr('data-bs-theme', 'dark') 

// On scroll
window.addEventListener('scroll', (event) => {
    placeThemePicker();
});

// On window.addEventListener('resize', (event) => {
window.addEventListener('resize', (event) => {
    placeThemePicker();
});


function placeThemePicker(){
    if( isElementInViewport($('.page-bottom')) && window.innerWidth > 345){
        $('.theme-picker').css('margin-bottom', $('.page-bottom').outerHeight(true))
    }else{
        $('.theme-picker').css('margin', '20px')
    }
}

function isElementInViewport (el) {

    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    let half = rect.bottom - rect.top;
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom - half <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}