$( document ).ready(function() {

    setMinPageHeight();

});


function setMinPageHeight(){
    // Set min page height
    let min_height = window.innerHeight - $('.navbar').outerHeight(true);
    $('.body-wrapper').css("min-height", min_height + 'px' );
}