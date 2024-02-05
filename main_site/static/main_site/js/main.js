$( document ).ready(function() {

    // Clear the wipe class after half a second
    setTimeout(function(){
        if(sessionStorage.getItem("play-intro") != null) {
            $('.color-wipe').addClass('d-none');
        }
        $('.color-wipe').removeClass('color-wipe-out');
    },500);

    // Check if we need to wipe away transition
    if(sessionStorage.getItem("wipe-out") == 'true'){
        color_wipe_out();
    }

    // Set Active page in the nav
    $('a.active').removeClass('active').removeAttr('aria-current');
    $('a[href="' + location.pathname + '"]').closest('a').addClass('active').attr('aria-current', 'page'); 

    
    setMinPageHeight();
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

    // Does the color wipe in when a tag is clicked
    $('.wipe-transition').click(function(e){
        e.preventDefault();
        color_wipe_in();

        setTimeout(h_direct, 500, this.href);
    });

    $('#play_intro').click(function(e){
        play_intro();
    });

});

// Page setup

// Set Color theme
localStorage.getItem("theme") ? $('html').attr('data-bs-theme', localStorage.getItem("theme") ) : $('html').attr('data-bs-theme', 'dark') 

// Set Color wipe height to 0 if there is no transition to avoid color flash
if(sessionStorage.getItem("wipe-out") != 'true'){
    $('.color-wipe').css('width', '0vw');
    $('.color-wipe').removeClass('color-wipe-out');
    $('.color-wipe').removeClass('color-wipe-in');
}

window.addEventListener('pageshow', (event) => {
    // If we go back a page
    if (event.persisted) {
        $('.color-wipe').css('width', '0vw');
        $('.color-wipe').removeClass('color-wipe-out');
        $('.color-wipe').removeClass('color-wipe-in');
    }
});

// On scroll
window.addEventListener('scroll', (event) => {
    placeThemePicker();
});

// On window.addEventListener('resize', (event) => {
window.addEventListener('resize', (event) => {
    placeThemePicker();
    setMinPageHeight();
});



// Check if we should play Intro
if(sessionStorage.getItem("play-intro") == null){
    play_intro();
}

// FUNCTIONS

function play_intro(){
    console.log("INTRO")
    // Anim setup
    $('.color-wipe').css('width', '100vw');
    $('.intro-box').removeClass('d-none');
    $('.color-wipe').removeClass('d-none');

    // Animate
    $('.intro-box').addClass('intro-animation');
    $('.color-wipe').addClass('wipe-out-intro');
    setTimeout(function(){
        $('.intro-box').removeClass('intro-animation');
        $('.intro-box').addClass('d-none');
        $('.color-wipe').css('width', '0vw');
        $('.color-wipe').removeClass('wipe-out-intro');

        // Don't show intro again this session
        sessionStorage.setItem('play-intro', 'false');
    },4000);
}

function color_wipe_out(){
    // Setup
    $('.color-wipe').css('width', '100vw');
    $('.color-wipe').removeClass('color-wipe-in');

    // Animate
    $('.color-wipe').addClass('color-wipe-out');

    // set wipeout to false
    sessionStorage.setItem('wipe-out', 'false')
}

function color_wipe_in(){
    // Setup
    $('.color-wipe').css('width', '0vw');
    $('.color-wipe').removeClass('color-wipe-out');
    $('.color-wipe').removeClass('d-none');

    // Animate
    $('.color-wipe').addClass('color-wipe-in');
 
    // Set Wipe out to true
    sessionStorage.setItem('wipe-out', 'true')
}

// Redirect to param
function h_direct(href){
    window.location.href = href;
}

function setMinPageHeight(){
    // Set min page height
    let min_height = window.innerHeight - $('footer').outerHeight(true) - $('.navbar').outerHeight(true);
    $('.body-wrapper').css("min-height", min_height + 'px' );
}

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