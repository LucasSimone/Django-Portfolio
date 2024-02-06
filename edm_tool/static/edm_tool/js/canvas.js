
import {MasterImage} from './imageClass.js'; 
import {MasterSlices} from './slicesClass.js'; 
import {def_object} from './default_slice.js'; 

// VARIABLES
var image = new MasterImage();
var slices = new MasterSlices(image);

// Regex for checking if string is valid hex color
var reg=/^([0-9a-f]{3}){1,2}$/i;



// ******************** EVENT HANDLERS ***********************

// MOUSE CONTROL
var mouseLeftDown = false;
var mouseMiddleDown = false;
var mouseRightDown = false;

// State variables
// PREVENTS DEFAULT MOUSE CLICKS WHEN TRUE
var preventDefault = true;
// PREVENTS US FROM MAKING A NEW SLICE WHEN TRUE
var preventNewSlice = false;
// IF WE CARE CURRENTLY IN THE STATE OF RESIZING A SLICE
var selectSlice = true;
// State for clearing selected slice
var clearSelectedSlice = true;
// In the state of resizing slice
var resizingSlice = false;
// In the state of creating a slice
var creatingSlice = false;
// If the export slice popup is open
var exportSliceOpen = false;
// If the mouse is inside slice options menu
var mouseInsideSliceOptions = false;
// If the mouse is on a menu(Slice options or popup menu)
var mouseOnMenu = false;
// If we are currently selecting a color with the color picker. We set the target(Slice or Whole EDM) and color selected
var selectingColor = {state:false, target: null, color: null};
// If we are currently replacing an image on the server
var replaceImage = {};


// On Mouse down
$('.canvas-container').on('mousedown touchstart', function(event) {
  switch (event.which) {
    // Left
    case 1:
      // If we should prevent default. We don't do this on menus so the inputs will work
      // if(preventDefault){
      //   event.preventDefault();
      // }

      //Prevents new slice but still allows for other clicks(ex adjusting slice size)
      if(replaceImage.state == true && replaceImage.type == "serverImage" && slices.sliceList.length >=1){
        preventNewSlice = true;
      }

      // Prevents canvas clicks if a menu is open
      if(exportSliceOpen || mouseOnMenu){
        preventNewSlice = true;
      }
      // If Hovering inside a slice when clicked
      else if((slices.sliceHoverIndex || slices.sliceHoverIndex == 0) && selectSlice == true){
        // set the selected slice
        slices.selectedSliceIndex = slices.sliceHoverIndex;
        // Show the slice options for the selected slice
        showSliceOptions();

        //Set width and height of selected slice
        $("#w-pixels")[0].innerHTML = slices.sliceList[slices.selectedSliceIndex].slice[2];
        $("#h-pixels")[0].innerHTML = slices.sliceList[slices.selectedSliceIndex].slice[3];
        
        // Check if select or control was pressed
        functionalSliceSelection(event);

        // Prevent a new slice from being made on drag
        preventNewSlice = true;
      }
      // If hovering on the selected slice edge
      else if(slices.hoveringSliceEdge){
        // Prevent new slice
        preventNewSlice = true;
        // Enter the state of resizing a slice
        resizingSlice = true;
        // Show slice dimensions on mouse and update values
        $(".mouse-dimensions")[0].classList.remove("hide-import");
        $("#w-mouse")[0].innerHTML = slices.sliceList[slices.selectedSliceIndex].slice[2] + "px";
        $("#h-mouse")[0].innerHTML = slices.sliceList[slices.selectedSliceIndex].slice[3] + "px";
      }
      // Selecting A Color
      else if(selectingColor.state){
        //Set the color of target
        if(selectingColor.target == 0){
          // Set color value in input
          $('#main-color')[0].value = selectingColor.color;
          // Set color of box
          $('.main-dropper').find('.color-box').css("background-color","#"+selectingColor.color);
          //Set main table color
        }else if(selectingColor.target == 1){
          slices.sliceList[slices.selectedSliceIndex].color = selectingColor.color;
          // Update Slice color
          updateSliceMenuColor();
        }
        // Prevent slice from being made
        preventNewSlice = true;
        // Reset to Default state
        $('.color-selector')[0].classList.add("hide-import");
        selectSlice = true;
        clearSelectedSlice = true;
        // Clear color
        selectingColor = {state:false, target: null, color: null};
      }
      // Make a new slice
      else{
        // Initalize new slice
        slices.initializeSlice(event);
        // Enter state of creating a slice
        creatingSlice = true;

        
        
        // Clear the selected slice if we are not: clicking on a menu, we are in the state to clear the slice
        if(!mouseOnMenu && event.target != $('.expand-slice-options')[0] && event.target != $('.expand-slice-options')[0].children[0] && clearSelectedSlice){
          slices.selectedSliceIndex = null;

          //Clear selected slice
          $("#w-pixels")[0].innerHTML = "";
          $("#h-pixels")[0].innerHTML = "";

          //Hide slice options for selected slice
          $(".sso").addClass('nss-hide');

        }
      }
      mouseLeftDown = true;
      break;
    // Middle
    case 2:
      if(preventDefault){
        event.preventDefault();
      }
      mouseMiddleDown = true;
      break;
    // Right
    case 3:
      if(preventDefault){
        event.preventDefault();
      }
      mouseRightDown = true;
      image.dragStartMouseX = event.clientX;
      image.dragStartMouseY = event.clientY;
      image.dragStartImgPosX = image.xPos;
      image.dragStartImgPosY = image.yPos;
      break;
  }
});

//On Mouse Move
$('.canvas-container').on('mousemove touchmove', function(event) {
  if(preventDefault){
    event.preventDefault();
  }
  if(mouseLeftDown) {
    if(preventNewSlice != true){
      slices.renderCurrentSlice(event);
      // Show Mouse Dimensions, set W & H
      if(preventDefault){
        $(".mouse-dimensions")[0].classList.remove("hide-import");
      }
      $("#w-mouse")[0].innerHTML = Math.abs(slices.currentSlice[2]) + "px";
      $("#h-mouse")[0].innerHTML = Math.abs(slices.currentSlice[3]) + "px";
    }else if(resizingSlice){
      slices.resizeSlice(event);
      // Show Mouse Dimensions, set W & H
      if(preventDefault){
        $(".mouse-dimensions")[0].classList.remove("hide-import");
      }
      $("#w-mouse")[0].innerHTML = slices.sliceList[slices.selectedSliceIndex].slice[2] + "px";
      $("#h-mouse")[0].innerHTML = slices.sliceList[slices.selectedSliceIndex].slice[3] + "px";
    }
  }
  if(mouseMiddleDown) {

  }
  if(mouseRightDown) {
    image.moveImage(event);
    reRender();
  }
});

// On Mouse Up
$(window.document).on('mouseup touchend', function(event) {
  switch (event.which) {
    // Left
    case 1:
      if(preventDefault){
        event.preventDefault();
      }
      if(mouseLeftDown == true && slices.saveSlice == true){
        slices.saveCurrentSlice();
        slices.selectedSliceIndex = 0;
        // Update Slice options for new slice
        showSliceOptions();
        //Set width and height of new selected slice
        $("#w-pixels")[0].innerHTML = slices.sliceList[0].slice[2];
        $("#h-pixels")[0].innerHTML = slices.sliceList[0].slice[3];
      }

      //Clear Slice variables for next slice
      slices.snapLines = {x: null, y: null , m: null, t: null, r: null, l: null, b:null};
      slices.saveSlice = false;
      slices.currentSlice = null;
      slices.splitSliceIndex = null;

      //Rerender So we get our new selected slice
      reRender();

      //Hide Mouse Dimensions
      $(".mouse-dimensions")[0].classList.add("hide-import");

      //Reset logic
      preventNewSlice = false;
      resizingSlice = false;
      creatingSlice = false;
      mouseLeftDown = false;


      slices.updateCachedData();

      break;
    // Middle
    case 2:
      if(preventDefault){
        event.preventDefault();
      }
      mouseMiddleDown = false;
      break;
    // right
    case 3:
      if(preventDefault){
        event.preventDefault();
      }
      mouseRightDown = false;
      break;
  }
});

// ******************************************* MOUSE WHEEL EVENTS *******************************************

addEventListener("wheel", (event) => {
  // Check if an image is being displayed
  if(event.target == $('.slice-layer')[0] && !$('.image-layer').hasClass( "hide-import" )){
    // Note when using mozilla alt toggles a menu bar. This can be disbaled by going to "about:config" in firefox browser and changing the ui.key.menuAccessKeyFocuses to false
    // mozilla also scrolls tab history with alt. This can be disabled on the same page "about:config" and changing mousewheel.with_alt.action = 0 

    // WHEEL EVENT WITHN ALT KEY
    if(event.altKey) {
      if(event.deltaY<0){
        // Scroll Up
        if(image.masterScale < 210){
          image.zoomOnMouseLocation(event,image.masterScale/3);
          slices.updateEdgeTolerance();
        }
      }else{
        //Scroll Down
        if(image.masterScale > 0.1){
          image.zoomOnMouseLocation(event,(image.masterScale*-1)/3);
          slices.updateEdgeTolerance();
        }
      }
    }
    // WHEEL EVENT WITHN SHIFT KEY
    else if(event.shiftKey) {
      if(event.deltaY<0){
        // Scroll Up
        image.xPos = image.xPos - 50;
        image.reRender(false);
      }else{
        //Scroll Down
        image.xPos = image.xPos + 50;
        image.reRender(false);
      }
    }else{
      if(event.deltaY<0){
        // Scroll Up
        image.yPos = image.yPos + 50;
        image.reRender(false);
      }else{
        //Scroll Down
        image.yPos = image.yPos - 50;
        image.reRender(false);
      }
    }
    reRender();
  }
});


// ******************************************* MOUSE MOVEMENT EVENTS *******************************************
// WHEN THE MOUSE MOVES ON SLICE LAYER CANVAS 
// we us this to check for mouse hovers on slices
$(".slice-layer").mousemove(function(e){
  // Do not check for slice hovers if we are resizing or creating a slice
  if(!resizingSlice && !creatingSlice){
    let mouseX = e.originalEvent.layerX;
    let mouseY = e.originalEvent.layerY;

    //Check if mouse hovers slices
    slices.mouseSliceHover(mouseX,mouseY);
  }


  // Move mouse dimensions to mouse location
  $(".mouse-dimensions").css("top",e.clientY - 40);
  $(".mouse-dimensions").css("left",e.clientX + 15);

  // If wer are currently selecting a color
  if(selectingColor.state){
    // Move color selector to mouse location
    $(".color-selector").css("top",e.clientY - 75/2);
    $(".color-selector").css("left",e.clientX - 75/2);
    
    let rgbaArr = image.ctx.getImageData(e.clientX, e.clientY-40, 1, 1).data;
    let hex = rgba2Hex(rgbaArr[0],rgbaArr[1],rgbaArr[2]);
    selectingColor.color = hex;
    let newBorder = "solid 8px #" + hex; 

    $(".color-border").css("border",newBorder);
  }
});


// CHECK WHEN MOUSE IS ON MENU SO WE DO NOT PREVENT DEFAULT
$(".slice-code-options, .slice-export-popup").on( "mouseover", function() {
  mouseOnMenu = true;
  preventDefault = false;
});
// CHECK WHEN MOUSE LEAVES MENU SO WE CAN PREVENT DEFAULT
$(".slice-code-options, .slice-export-popup").on( "mouseleave", function() {
  preventDefault = true;
  mouseOnMenu = false;
});



// ******************************************* TOOL BAR EVENTS *******************************************

// SLICE COLOR
$('.slice-color').on('click', function(event){
  // Update Slice color
  if(slices.sliceColor == "#FFA500"){
    slices.sliceColor = "#0096FF";
  }else{
    slices.sliceColor = "#FFA500";
  }
  // Update Gridline Color
  if(image.gridLineColor == "#FFFFFF"){
    image.gridLineColor = "#000000";
  }else{
    image.gridLineColor = "#FFFFFF";
  }
  // Redraw Slices
  reRender();
});

// ERROR PREVENTION
// This tool clears the slice list and wraps the while image in a single slice
// This prevents any erros/impossible tables from being made in the slice creation
$('.slice-wrap').on('click', function(event){
  slices.sliceList = [];
  slices.selectedSliceIndex = null;

  let wrapperSlice = [0,0,image.imgClass.width,image.imgClass.height]
  slices.sliceList.unshift({slice: wrapperSlice, link: null, color: null, alt: null});

  reRender();
});

$('.load-default').on('click', function(event){
  load_default()
  reRender();
});

// CREATION MODE
// This tool reset/clears the mode of the canvas setting the mode to the default/creation
$('.creation-mode').on('click', function(event){
  replaceImage.state = false;
  $('.canvas-mode').removeClass('attention');
  $('.export-slices').removeClass('attention');
  $('.mode-text').html("MODE: CREATION");

  //Clear cached data
  localforage.setItem('savedImage', "", function (err) {
    if(err){
        console.log("Error Caching Image Data:");
        console.log(err);
    }
  });

  slices.resetVariables();
  image.resetVariables();
  resetVariables();
  $(".png-upload-popup").removeClass("hide-import");

  let replaceImageData = {
    state: false,
    type: null,
    src: null,
    imageWidth: null,
    imageHeight: null,
  }

  //sessionStorage.removeItem("crmCreate");
  sessionStorage.setItem("replaceImageData", JSON.stringify(replaceImageData));
});




// ******************************************* EXPORT POPUP EVENTS *******************************************

// EXPORT BUTTON
$('.export-slices').on('click', function(event){
  slices.orderSlices();

  // Check if we are replacing something
  if(replaceImage.state != true){
    $(".slice-export-popup")[0].classList.remove("hide-import");
    exportSliceOpen = true;

    //Set current date
    // let currentDate = new Date();
    // currentDate = currentDate.toISOString().split('T')[0];
    // currentDate = currentDate.replaceAll('-','');
    // $('#folder-date')[0].value = currentDate;
  }else{
    // If we are replacing an image
    if(replaceImage.type == "serverImage"){
      if( confirm("You are about to replace an image for an existing EDM. Replacing this image will update this on any EDM that includes this image.") == true){

        //console.log(replaceImage.imageWidth);
        // Check the size of the image we are replacing
        //If image is 700px wide we don't care about the height
        if(replaceImage.imageWidth == 700){
          if(slices.sliceList[0].slice[2] == 700){
            // If new Slice is 700px wide replace
            let src = replaceImage.src;
            sessionStorage.removeItem("replaceImageData");
            replaceImage.state = false;
            replaceImage.type = null;
            replaceImage.src = null;
            replaceImage.width = null;
            replaceImage.height = null;

            slices.replaceServerImage(src);
          }else{
            alert("New slice must be 700px wide");
          }
        }else{
          //Image isn't 700px wide so it must have same width and height
          if(slices.sliceList[0].slice[2] == replaceImage.imageWidth && slices.sliceList[0].slice[3] == replaceImage.imageHeight){
            // If new Slice is 700px wide replace
            let src = replaceImage.src;
            sessionStorage.removeItem("replaceImageData");
            replaceImage.state = false;
            replaceImage.type = null;
            replaceImage.src = null;
            replaceImage.width = null;
            replaceImage.height = null;

            slices.replaceServerImage(src);
          }else{
            alert("New slice must have a width of " + replaceImage.imageWidth + "px and height of " + replaceImage.imageHeight + "px");
          }
        }
      }
    }
    //If we are replacing with new HTML
    if(replaceImage.type == "newHTML"){
      $(".slice-export-popup")[0].classList.remove("hide-import");
      exportSliceOpen = true;
      
      //Set current date
      // let currentDate = new Date();
      // currentDate = currentDate.toISOString().split('T')[0];
      // currentDate = currentDate.replaceAll('-','');
      // $('#folder-date')[0].value = currentDate;
    }
  }
});

// CLOSE EXPORT POUP
$(".slice-export-popup").find(".close").on('click', function(event){
  $(".slice-export-popup")[0].classList.add("hide-import");
  exportSliceOpen = false;
});

// CLOSE movement POpUP
$(".movement-tips").find(".close").on('click', function(event){
  $(".movement-tips")[0].classList.add("hide-import");
});

// CLOSE NEW PNG POPUP
$(".png-upload-popup").find(".close").on('click', function(event){
  $(".png-upload-popup")[0].classList.add("hide-import");
});

// DOWNLOAD SLICES BUTTON
$('.slice-download').on('click', function(event){
  if(slices.sliceList.length > 0){
    if($('#slice-name')[0].value != ""){
      $('#slice-name')[0].classList.remove("missing");
      $(".slice-export-popup").find(".label")[0].parentElement.classList.remove("missing");
      slices.downloadExport($('#slice-name')[0].value);
      reRender();
    }else{
      $('#slice-name')[0].classList.add("missing");
      $(".slice-export-popup").find(".label")[0].parentElement.classList.add("missing");
    }
  }else{
    alert("There are no slices to export");
  }
});

// SAVE SLICE IMAGES TO SERVER AND GENERATE HTML
$('.generate-html').on('click', function(event){
  if(slices.sliceList.length > 0){

    let generate = true;

    // CHECK FOR IMAGE NAME AND DATE
    for(let i = 0; i< $(".slice-export-popup").find("input").length; i++){
      if($(".slice-export-popup").find("input")[i].value == ""){
        $(".slice-export-popup").find("input")[i].parentElement.parentElement.classList.add("missing");
        generate = false;
      }
    }

    // CHECK FOR SELECTED CLIENT
    // if($('.client-dropdown')[0].firstChild.data == "SELECT CLIENT"){
    //   $('.client-dropdown')[0].parentElement.classList.add("missing");
    //   generate = false;
    // }

    //CHECK IF ALL OF PNG IS COVERED IN SLICES 
    if(replaceImage.state == false && !slices.checkSliceArea()){
      if(confirm("Sections of the png are not covered by slices.") == false){
        generate = false;
      }
    }

    // IF WE HAVE NAME CLIENT AD DATE GENERATE HTML
    if(generate){

      let name = $('#slice-name')[0].value;;
      // let client = $('.client-dropdown')[0].firstChild.data;
      // let date = $('#folder-date')[0].value;
      // Upload Slices to server
      if(replaceImage.state == true && replaceImage.type == "newHTML"){
        
        //Clear the replace image state
        replaceImage.state = false;
        replaceImage.type = null;
        replaceImage.src = null;
        replaceImage.width = null;
        replaceImage.height = null;

        // If we uploaded the new slices clear the replace image state
        // if(!slices.replaceRowSliceUpload(name,client,date)){
        if(!slices.replaceRowSliceUpload(name)){
          //clear the replace image state
          replaceImage = JSON.parse(sessionStorage.replaceImageData);
        }
      }else{
        // slices.sliceUpload(name,client,date);
        slices.sliceUpload(name);
      }
    }
  }else{
    alert("There are no slices to export");
  }
});

// WHEN CLIENT DROPDOWN IS CLICKED
$('.client-dropdown').on('click', function(event){

  let data = {functionname: 'getClientList', arguments: null}; 
  let clientArray;

  fetch("/functions.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: JSON.stringify(data),
  })
  .then((response) => response.json())
  .then((res) => {
    clientArray = res.result;
    $('.dropdown-selection')[0].innerHTML = "";
    for(let i=0; i< clientArray.length; i++){
      let client = document.createElement("div");
      client.classList.add("dropdown-item");
      client.innerHTML = clientArray[i];
      $('.dropdown-selection')[0].appendChild(client);
    }
    $(".dropdown-selection").toggleClass("hide-import");
  });
});

// WHEN A CLIENT IS CLICKED
$(document).on('click','.dropdown-item', function(event){
  $('.client-dropdown')[0].firstChild.data = this.innerHTML;
  $(".dropdown-selection").toggleClass("hide-import");
});

// When CLIENT IS SELECTED
$('.client-dropdown').on('DOMSubtreeModified', function(){
  $('.client-dropdown')[0].parentElement.classList.remove("missing");
});

// WHEN ANY INPUT IN POPUP IS UPDATED
$(".slice-export-popup").find("input").on('propertychange input', function (e) {
  if(e.value != ""){
    e.currentTarget.parentElement.parentElement.classList.remove("missing");
  }
});

// ******************************************* RESIZING *******************************************

// RESIZING EVENT
addEventListener("resize", (event) => {
  image.ctx.canvas.width  = $('.canvas-container').width();
  image.ctx.canvas.height  = $('.canvas-container').height();
  slices.ctx_s.canvas.width  = $('.canvas-container').width();
  slices.ctx_s.canvas.height  = $('.canvas-container').height();
  reRender();
});


// ******************************************* SLICE OPTIONS BOX EVENTS *******************************************

// EXPAND SLICE OPTIONS IS CLICKED
$('.expand-slice-options').on('click', function(){
  $('.slice-code-options')[0].classList.remove("hide-import");
  $('.expand-slice-options')[0].classList.add("hide-import");
});

// COLLAPSE SLICE OPTIONS IS CLICKED
$('.collapse-slice-options').on('click', function(){
  $('.slice-code-options')[0].classList.add("hide-import");
  $('.expand-slice-options')[0].classList.remove("hide-import");
});

// EMAIL ICON IS CLICKED
$('.email-link').on('click', function(event){

  // Toggle the options
  let mailtooptions = $('.mailto-options')[0];
  mailtooptions.classList.toggle('hide-import');

  // If we are showing mailto options
  if(! $('.mailto-options')[0].classList.contains("hide-import")){

    // If not a mailto link change it to a blank mailto
    if($('#slice-link')[0].value.substring(0,7) != "mailto:" ){
      $('#slice-link')[0].value = "mailto:";
      updateSliceLink();
    }else{
      updateMailtoOptFromLink();
    }
    
  }

});

// TELEPHONE ICON IS CLICKED
$('.tele-link').on('click', function(event){
  if(slices.selectedSliceIndex != null){
    $('.mailto-options')[0].classList.add("hide-import");
    $('#slice-link')[0].value = "tel:";
    updateSliceLink();
  }else{
    //Tel clicked without selected slice
    noSelectedSliceAlert(event);
  }
});


// WHEN A TEXTAREA IS CLCIKED
$('.option-content').find('textarea').on('mousedown', function(event){
  if(slices.selectedSliceIndex == null){
    event.preventDefault();
    // Textarea clicked without selected slice
    noSelectedSliceAlert(event);
  }
});

// WHEN A COLOR BOX FOR SELECTING COLOR IS CLICKED
$('.color-box').on('click', function(event){
  if(this == $('.color-box')[0] && slices.selectedSliceIndex == null){
    noSelectedSliceAlert(event);
  }else{
    selectingColor.state = true;
    selectSlice = false;
    clearSelectedSlice = false;
    $('.color-selector')[0].classList.remove('hide-import');
    if(this == $('.color-box')[0]){
      selectingColor.target = 1;
    }else{
      selectingColor.target = 0;
    }
  }
});

// WHEN THE LINK SWITCH IS CLICKED
$('.link-switch-container').on('click', function(event){
  toggleSelectedSliceLink();
});

// When the slice link input is updated
$('#slice-link').on('propertychange input', function (e) {
  updateSliceLink();
  // If the link is a mailto and we are shwoing the mailto options - update the options
  if($('#slice-link')[0].value.substring(0,7) == "mailto:" && !$('.mailto-options')[0].classList.contains("hide-import")){
    //console.log("UPDATING");
    updateMailtoOptFromLink();
  }
});

// When Color is entered in color input
$('.color-fields').find('input').on('propertychange input', function (e) {
  if(this == $('.color-fields').find('input')[1]){
    if(reg.test(this.value)){
      $('.main-dropper').find('.color-box').css("background","none");
      $('.main-dropper').find('.color-box').css("background","#"+this.value);
    }else{
      $('.main-dropper').find('.color-box').css("background-color","none");
      $('.main-dropper').find('.color-box').css("background","repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 10px 10px");
    }
  }else{
    if(reg.test(this.value)){
      slices.sliceList[slices.selectedSliceIndex].color = this.value;
      updateSliceMenuColor();
    }else{
      slices.sliceList[slices.selectedSliceIndex].color = null;
      $('.slice-dropper').find('.color-box').css("background-color","none");
      $('.slice-dropper').find('.color-box').css("background","repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 10px 10px");
    }
  }
});

// When the slice link input is updated
$('#alt-tag').on('propertychange input', function (e) {
  if(this.value == ""){
    slices.sliceList[slices.selectedSliceIndex].alt = null;
  }else{
    slices.sliceList[slices.selectedSliceIndex].alt = this.value;
  }
  slices.updateCachedData();
});



// When the mailto input options are changed
$('.mailto-options').find('input').on('propertychange input', function (e) {
  buildMailtoLink();
});

// When the mailto textarea options are changed
$('.mailto-options').find('textarea').on('propertychange input', function (e) {
  buildMailtoLink();
});


// ******************************************* KEY PRESS EVENTS *******************************************

// The below keydown events check if we are copying or pasting. If a slice is selected and
// something is pasted it gets pasted into the slice link
// If it is a copy we copy the contents of the selected slice link

var ctrlDown = false,
        ctrlKey = 17,
        cmdKey = 91,
        vKey = 86,
        cKey = 67;
$(document).keydown(function(e) {
  if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = true;
})
$(document).keyup(function(e) {
  if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = false;
});

// For this to work in Firefox 3 permissons need to be set to true in about:config :
// dom.events.asyncClipboard.clipboardItem	
// dom.events.asyncClipboard.readText		
// dom.events.testing.asyncClipboard
$(document).keydown(function(e) {

  var nothingIsFocused = document.activeElement === document.body;

  if (ctrlDown && (e.keyCode == vKey) && nothingIsFocused) {
    if(slices.selectedSliceIndex != null){
      if(slices.sliceList[slices.selectedSliceIndex].link == null){
        toggleSelectedSliceLink();
      }
      getClipboardContents().then((clipText) => {
        //console.log(clipText);
        $('#slice-link')[0].value = clipText;
        updateSliceLink();
      });
    }
  };
  if (ctrlDown && (e.keyCode == cKey) && nothingIsFocused) {
    let link = $('#slice-link')[0].value;
    setClipboardContents(link);
  };
});



addEventListener("keyup", function(event) {
  // Extra key for testing
  if (event.key == "t") {
    // console.log("SLICE LIST:")
    console.log(slices.sliceList);
  }

  var nothingIsFocused = document.activeElement === document.body;

  //Deleting Slice
  // Check if we are editing an input. If so do not delete
  if(nothingIsFocused){
    if ((event.key == "Delete" || event.key == "Backspace") && slices.selectedSliceIndex != null) {
      slices.sliceList.splice(slices.selectedSliceIndex,1);
      slices.selectedSliceIndex = null;
      slices.sliceHoverIndex = null;
      resizingSlice = false;
      creatingSlice = false;
      
      //Hide slice options for selected slice
      $(".sso").addClass('nss-hide');

      $("#w-pixels")[0].innerHTML = "";
      $("#h-pixels")[0].innerHTML = "";
      reRender();
      slices.updateCachedData();
    }
  }
});

// ******************************************* FUNCTIONS *******************************************

// This function is called when a slice is selected to check if shift or control was pressed
function functionalSliceSelection(event){
  if (event.ctrlKey){
    let link = slices.sliceList[slices.selectedSliceIndex].link;
    if(link != null){
      window.open(link, '_blank');
    }
  }
    
  if (event.shiftKey){
    toggleSelectedSliceLink();
  }
    
}

function toggleSelectedSliceLink(){

  let linkSwitch = $('.link-switch-container')[0];
  linkSwitch.classList.toggle('has-link');

  //IF SLICE HAS LINK
  if($('.link-switch-container')[0].classList.contains("has-link")){
    // SWITCH LINK SWITCH
    $('.link-switch-container').find('div')[0].style.transform = "translateX(29px)";
    $('.link-switch-container').find('div').css("background-color","#FFFFFF");
    $('.link-switch-container').css("background-color","#000000");
    // Show Link options
    $('.link-options').removeClass('hide-import');
    $('.link-switch').css("border-bottom","none");
    //Clear link field
    $('#slice-link')[0].value = "";
    // Set slice list link to empty string
    slices.sliceList[slices.selectedSliceIndex].link = "";

  }else{
    // SWITCH LINK SWITCH
    $('.link-switch-container').find('div')[0].style.transform = "translateX(0px)";
    $('.link-switch-container').find('div').css("background-color","#000000");
    $('.link-switch-container').css("background-color","#FFFFFF");
    // Show Link options
    $('.link-options').addClass('hide-import');
    // Hide Mailto options and clear option fields
    $('.mailto-options').addClass("hide-import");
    clearMailtoOptions();
    $('.link-switch').css("border-bottom","dotted 1px #000000");
    // Set slice list link to null
    slices.sliceList[slices.selectedSliceIndex].link = null;
  }

}

// This rerenders the image and slices
function reRender(recenter = false){
  slices.renderSlices();
  image.renderImage(recenter);
}

// When this is called it sets the values (link and color) in the slice options menu for the selected slice
function setSliceOptions(){
  let list = slices.sliceList;
  let index = slices.selectedSliceIndex;

  // Setting Slice Link
  if(list[index].link != null){
    // SWITCH LINK SWITCH
    $('.link-switch-container').find('div')[0].style.transform = "translateX(29px)";
    $('.link-switch-container').find('div').css("background-color","#FFFFFF");
    $('.link-switch-container').css("background-color","#000000");
    $('.link-switch-container').addClass('has-link');
    // Show Link options
    $('.link-options').removeClass('hide-import');
    $('.link-switch').css("border-bottom","none");
    // Set link value
    $('#slice-link')[0].value = slices.sliceList[slices.selectedSliceIndex].link;

    clearMailtoOptions();
    if($('#slice-link')[0].value.substring(0,7) != "mailto:" ){
      // Hide Mailto options and clear option fields
      $('.mailto-options').addClass("hide-import");
    }else{
      $('.mailto-options').removeClass("hide-import"); 
      updateMailtoOptFromLink();
    }
  }else{
    // SWITCH LINK SWITCH
    $('.link-switch-container').find('div')[0].style.transform = "translateX(0px)";
    $('.link-switch-container').find('div').css("background-color","#000000");
    $('.link-switch-container').css("background-color","#FFFFFF");
    $('.link-switch-container').removeClass('has-link');
    // Show Link options
    $('.link-options').addClass('hide-import');
    // Hide Mailto options and clear option fields
    $('.mailto-options').addClass("hide-import");
    clearMailtoOptions();
    $('.link-switch').css("border-bottom","dotted 1px #000000");
  }

  // Set Slice Alt Tag
  if(list[index].alt != null){
    $('#alt-tag')[0].value = slices.sliceList[slices.selectedSliceIndex].alt;
  }else{
    $('#alt-tag')[0].value = "";
  }

  // Update slice color
  updateSliceMenuColor();

}

// This updates the selected slice input and color box to the slice color
function updateSliceMenuColor(){
  let list = slices.sliceList;
  let index = slices.selectedSliceIndex;
  // Setting Slice Color
  if(list[index].color != null){
    // Slice has color
    $('#slice-color')[0].value = list[index].color;
    $('.slice-dropper').find('.color-box').css("background","none");
    $('.slice-dropper').find('.color-box').css("background-color","#"+list[index].color);
    
  }else{
    // Slice has no color
    $('#slice-color')[0].value = "";
    $('.slice-dropper').find('.color-box').css("background-color","none");
    $('.slice-dropper').find('.color-box').css("background","repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 10px 10px");
  }
}

function clearMailtoOptions(){
  $('#mailto-body')[0].value = "";
  $('#mailto-subject')[0].value = "";
  $('#mailto-email')[0].value = "";
}

// This builds and sets the link based off the mailto options
function buildMailtoLink(){
  // href="mailto:test@example.com?subject=Testing out mailto!&body=This is only a test!"
  let mailtoLink = "mailto:";

  // If we have an email
  if($('#mailto-email')[0].value != ""){
    mailtoLink = mailtoLink + $('#mailto-email')[0].value;
    $('#mailto-subject')[0].disabled = false;
  }else{
    $('#mailto-subject')[0].disabled = true;
  }

  // If we have a subject
  if($('#mailto-subject')[0].value != "" && $('#mailto-subject')[0].disabled == false){
    mailtoLink = mailtoLink + "?subject=" + $('#mailto-subject')[0].value;
    $('#mailto-body')[0].disabled = false;
  }else{
    $('#mailto-body')[0].disabled = true;
  }

  // If we have a body
  if($('#mailto-body')[0].value != "" && $('#mailto-body')[0].disabled == false){
    mailtoLink = mailtoLink + "&body=" + $('#mailto-body')[0].value;
  }

  // Update our link
  $('#slice-link')[0].value = mailtoLink;
  updateSliceLink();
}


function updateMailtoOptFromLink(){
  let mailtoLink = $('#slice-link')[0].value;
  // Clear Mailto options
  $('#mailto-body')[0].value = "";
  $('#mailto-subject')[0].value = "";
  $('#mailto-email')[0].value = "";

  if(mailtoLink.substring(0,7) == "mailto:"){
    // Check if our link has a body
    if(mailtoLink.includes("body")){
      let bodyIndex = mailtoLink.indexOf("body");
      $('#mailto-body')[0].value = mailtoLink.substring(bodyIndex+5);
      // cut off body from string
      mailtoLink = mailtoLink.substring(0,bodyIndex-1);
    }

    // Check if our link has a subject
    if(mailtoLink.includes("subject")){
      let subjectIndex = mailtoLink.indexOf("subject");
      $('#mailto-subject')[0].value = mailtoLink.substring(subjectIndex+8);
      // cut off subject from string
      mailtoLink = mailtoLink.substring(0,subjectIndex-1);
      if($('#mailto-subject')[0].value == ""){
        $('#mailto-body')[0].disabled = true;
      }else{
        $('#mailto-body')[0].disabled = false;
      } 
    }

    //Email is everything after mailto 
    $('#mailto-email')[0].value = mailtoLink.substring(7);

    if($('#mailto-email')[0].value == ""){
      $('#mailto-subject')[0].disabled = true;
    }else{
      $('#mailto-subject')[0].disabled = false;
    } 

  }
}

// This function shows the selected slice options then sets the values for the selected slice
function showSliceOptions(){
  //Show slice options for selected slice
  $(".sso").removeClass('nss-hide');

  // Set Image link and color in options box
  setSliceOptions();
}

// This sets the slice link value to be the text in the link input
function updateSliceLink(){
  slices.sliceList[slices.selectedSliceIndex].link = $('#slice-link')[0].value;
  slices.updateCachedData();
}

// This resets the variables used for when we upload a new png
function resetVariables(){
  mouseLeftDown = false;
  mouseMiddleDown = false;
  mouseRightDown = false;

  preventNewSlice = false;
  resizingSlice = false;
  creatingSlice = false;

  $("#main-color")[0].value = "FFFFFF";
  $('.main-dropper').find('.color-box').css("background-color","#FFFFFF");
  $("#edm-title")[0].value = "";
}

// This adds a little popup at the mouse location that fades away in 2 seconds 
function noSelectedSliceAlert(e){
  let mouseEle = $(document.createElement("div"));
  mouseEle[0].classList.add("no-slice-selected");
  mouseEle[0].innerHTML = "NO SLICE SELECTED";

  mouseEle.css("top", e.clientY);
  mouseEle.css("left", e.clientX);

  $('.canvas-container').append(mouseEle[0]);
  mouseEle.fadeOut(2000);

  setTimeout(function() {
    mouseEle.remove()
  }, 2000);
}

// This function converts rgb values to a hex string
function rgba2Hex(r,g,b) {
  r = r.toString(16).slice(-2);
  g = g.toString(16).slice(-2);
  b = b.toString(16).slice(-2);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return r + g + b;
}

// Sets the clipboard content to the text parameter
async function setClipboardContents(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

// Gets the clipboard text
async function getClipboardContents() {
  try {
    const text = await navigator.clipboard.readText();
    return text;
  } catch (err) {
    console.error('Failed to read clipboard contents: ', err);
  }
}


// ******************************************* IMAGE UPLOAD *******************************************
// The Below Code Handles the uplaoding and inital rendering of the image *********************************************************************************************
const dropArea = document.querySelector(".drag-area");
const input = dropArea.querySelector("input");
const dragText = dropArea.querySelector(".drag-text");
let file; //this is a global variable and we'll use it inside multiple functions

//Handles when an image is uploaded via the browse button
input.addEventListener("change", function(){
  //getting user select file and [0] this means if user select multiple files then we'll select only the first one
  file = this.files[0];
  dropArea.classList.add("active");
  showFile(); //calling function
});

//If user Drag File Over DropArea
dropArea.addEventListener("dragover", (event)=>{
  event.preventDefault(); //preventing from default behaviour
  dropArea.classList.add("active");
  dragText.textContent = "Release to Upload File";
});

//If user leave dragged File from DropArea
dropArea.addEventListener("dragleave", ()=>{
  dropArea.classList.remove("active");
  dragText.textContent = "Drag & Drop to Upload File";
});
//Handles when the image is dropped on the area
dropArea.addEventListener("drop", (event) => {
  // prevent default action (open as link for some elements)
  event.preventDefault();
  // move dragged element to the selected drop target
  var droppedHTML = event.dataTransfer.getData("text/html");
  file = event.dataTransfer.files[0];
  showFile();
});

// This functiion is called when a file is Uploaded 
function showFile(){
  let fileType = file.type; //getting selected file type
  let validExtensions = ["image/jpeg", "image/jpg", "image/png"]; //adding some valid image extensions in array
  if(validExtensions.includes(fileType)){ //if user selected file is an image file
    let fileReader = new FileReader(); //creating new FileReader object
    fileReader.onload = ()=>{
      slices.resetVariables();
      image.resetVariables();
      resetVariables();
      let fileURL = fileReader.result; //passing user file source in fileURL variable

      image.imgClass.src = fileURL;

      // Check if image is loaded and ready to be rendered if not load it
      if (image.imgClass.complete) {
        image.initalRender();
      } else {
        image.imgClass.onload = function () {
          image.initalRender();
        };
      }
      slices.updateEdgeTolerance();
      $(".png-upload-popup")[0].classList.add("hide-import");
    }
    fileReader.readAsDataURL(file);

  }else{
    alert("This is not an Image File!");
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop to Upload File";
  }
}

function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

  for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
          return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
  }
  return false;
};


// DOCUMENT READY
$(document).ready(function() {

  //ON PAGE LOAD

  // Reset the current mode
  replaceImage.state = false;
  $('.canvas-mode').removeClass('attention');
  $('.export-slices').removeClass('attention');
  $('.mode-text').html("MODE: CREATION");


  // CHECK WHICH MODE WE ARE IN

  // Check if we are replacing a server image
  let replaceData = sessionStorage['replaceImageData'];

  if (replaceData) {
    replaceImage = JSON.parse(sessionStorage.replaceImageData);

    //console.log(replaceImage);
    if(replaceImage.state == true){
        //localStorage['savedImage'] = "";
        localforage.setItem('savedImage', "", function (err) {
          if(err){
              console.log("Error clearing Image Data:");
              console.log(err);
          }
        });
        slices.resetVariables();
        image.resetVariables();
        resetVariables();
        $(".png-upload-popup").removeClass("hide-import");

        $('.canvas-mode').addClass('attention');
        $('.export-slices').addClass('attention');
        if(replaceImage.type == "serverImage"){
          $('.mode-text').html("MODE: SERVER OVERWRITE");
        }
        if(replaceImage.type == "newHTML"){
          $('.mode-text').html("MODE: REPLACE ROW");
        }
    }
  }

  // If we are doing a crm create clear the cached image and show upload
  if(getUrlParameter("accountid")){
    showUploadPng();
    // Clear the cached Image
    // localforage.setItem('savedImage', "", function (err) {
    //   if(err){
    //       console.log("Error Caching Image Data:");
    //       console.log(err);
    //   }
    // });
    // slices.resetVariables();
    // image.resetVariables();
    // resetVariables();
  }


  
  
  // Check if we need to show popup
  let showPopup = sessionStorage.getItem("showPngUpload");
  if(showPopup == "true"){
    $(".png-upload-popup").removeClass("hide-import");
    sessionStorage.setItem("showPngUpload", "false");
  }


  // Check if we have cached Images and slices to load
  setTimeout(loadCachedData,10);
  
  //If we are in a new session load the default object
  if(sessionStorage.getItem('load_default') == null){
    load_default();
    $(".movement-tips").removeClass("hide-import");
    sessionStorage.setItem('load_default',false);
  }
 
});

function load_default(){
    image.imgClass.src = def_object.image;
    slices.sliceList = def_object.slices;
    $("#main-color")[0].value = def_object.color;
    $("#edm-title")[0].value = def_object.title;
    $('.main-dropper').find('.color-box').css("background","#"+def_object.color);
    $('#slice-name')[0].value = def_object.imgName;

    if (image.imgClass.complete) {
      image.initalRender();
      reRender();
    } else {
      image.imgClass.onload = function () {
        image.initalRender();
        reRender();
      };
    }
}

async function loadCachedData(){
  try {
      let savedImage = await localforage.getItem("savedImage");

      if (savedImage) {
        let savedObject = JSON.parse(savedImage);
        console.log(savedObject);
        image.imgClass.src = savedObject.image;
        slices.sliceList = savedObject.slices;
        $("#main-color")[0].value = savedObject.color;
        $("#edm-title")[0].value = savedObject.title;
        $('.main-dropper').find('.color-box').css("background","#"+savedObject.color);
        $('#slice-name')[0].value = savedObject.imgName;
        // $('.client-dropdown')[0].firstChild.data = savedObject.client;
        // $('#folder-date')[0].value = savedObject.folderDate;
    
        
        if (image.imgClass.complete) {
          image.initalRender();
          reRender();
        } else {
          image.imgClass.onload = function () {
            image.initalRender();
            reRender();
          };
        }
        
      }


  } catch (err) {
      console.log(err);
  }
}

