$( document ).ready(function() {

    // CHANGE THE SELECTED NAV ELEMENT TO CURRENT SCREEN
    let pathname = window.location.pathname;
    pathname = pathname.substring(1);

    let navList = $(".screen").find("a");

    for(let i=0; i< navList.length; i++){
        let ahref = navList[i].pathname.substring(1);
        if(ahref.toLowerCase() == pathname.toLowerCase()){
        navList[i].parentElement.classList.add("selected");
        }
    }

    // Show the help
    $('.help-button').click(function(){
        $('.info-window').removeClass('hide-import');
    });

    $('.close-info-window').click(function(){
        $('.info-window').addClass('hide-import');
    });

    //Handles when upload png is clicked in the top right corner
    $('.upload-png-button').click(function(){

      // IF we are not on the canvas page and not doing a crm create
      var arr = window.location.href.split("/");
      if(arr.pop() != "canvas"){
        sessionStorage.setItem("showPngUpload", "true");
        color_wipe_in();
        setTimeout(h_direct, 500, '/edm_tool/canvas');
      }
      //We are on canvas page show upload
      showUploadPng();
      
    });
});

function showUploadPng(){
	$(".png-upload-popup").removeClass("hide-import");
}