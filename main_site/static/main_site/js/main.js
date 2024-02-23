$( document ).ready(function() {

    // Set Active page in the nav
    $('a.active').removeClass('active').removeAttr('aria-current');
    $('a[href="' + location.pathname + '"]').closest('a').addClass('active').attr('aria-current', 'page'); 

    
    setMinPageHeight();


});

// Page setup

// On window.addEventListener('resize', (event) => {
window.addEventListener('resize', (event) => {
    setMinPageHeight();
});

// FUNCTIONS

function setMinPageHeight(){
    // Set min page height
    let min_height = window.innerHeight - $('footer').outerHeight(true) - $('.navbar').outerHeight(true);
    $('.body-wrapper').css("min-height", min_height + 'px' );
}