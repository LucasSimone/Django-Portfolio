var selectedImage = null;
let selectingColor = 0;

//var imgBlank = '<img src="https://joeyai.net/_files/client/date/images/XXXXX_XX.jpg" style="display:block; width:100%; max-width:100%;" border="0" alt="" >';

$( document ).ready(function() {

    if($('.edm-container').length){

        //Check if there is cached code to load and 
        //ensure we are not going to overwrite code from the CRM edit
        if(sessionStorage.getItem("code")){
            loadCachedCode();
        }else{
            loadDefaultCode();
        }
    
        // If you are coming from replacing on the canvas load the cached data
        // if(getUrlParameter('load') == 1){
        //     console.log("Loading Cached code param")
        //     loadCachedCode();
        // }
    
        // Check if we need to generate code
        let generate = sessionStorage.getItem("generate");
        if(generate == "true"){
            console.log("generate")
            replaceRow();
            sessionStorage.setItem("generate", "false");
        }

        // Check for CRM EDIT and display the save button
        // if(getUrlParameter("accountid")){
        //     $('.save-html').removeClass('hide-import');
        //     updateCode();
        //     initalizeEditor();
        // }   



        // ********************* EVENTS *********************

        // ********************* EDITOR PREVIEW  *********************
        //Handles when an Image in the editor html is clicked
        $('.edm-container').on('click', function(event){

            if(event.target.tagName == 'IMG' && selectingColor == 0){
                //When image is clicked highlight it
                select(event.target);
            }
            
            if(selectingColor > 0){
                $('.color-selector')[0].classList.add('hide-import');
                selectingColor = 0;
            }


            //Prevents links from opening when clicked on Unless control is being held down
            if($(event.target)[0].parentElement.tagName == 'A' && !event.ctrlKey) {
                return false;
            }

        });

        // Mousemove event for color selector
        $(".edm-container").mousemove(function(e){
            // If we are currently selecting a color
            if(selectingColor > 0){
                    colorSelector(e);
            }
        });




        //Handles when the image link input is changed
        $('#img-src').on('input',function(e){
            if(selectedImage != null){
                var timeStamp = new Date().getTime();
                selectedImage.src = e.currentTarget.value + "?t=" + timeStamp;
                updateCode();
            }
        });

        //Handles when the image link input is changed
        $('#img-link').on('input',function(e){
            if(selectedImage != null){
                updateLink();
                updateCode();
            }
        });

        // Handles when the email icon is clicked
        $('#mailto-button').on('click', function(event){

            // Toggle the options
            $('.mailto-options').toggleClass('hide-import');
        
            // If we are showing mailto options
            if(! $('.mailto-options')[0].classList.contains("hide-import")){
        
                // If not a mailto link change it to a blank mailto
                if($('#img-link')[0].value.substring(0,7) != "mailto:" ){
                    buildMailtoLink();
                }else{
                    updateMailtoOptFromLink();
                }
            
            }
    
        });

        // Handles when the tel icon is clicked
        $('#tel-button').on('click', function(event){

            $('.mailto-options').addClass('hide-import'); 

            $('#img-link')[0].value = "tel:";
            updateLink();
            updateCode();
    
        });

        // When the mailto input options are changed
        $('.mailto-options').find('input').on('propertychange input', function (e) {
            buildMailtoLink();
        });
        
        // When the mailto textarea options are changed 
        $('.mailto-options').find('textarea').on('propertychange input', function (e) {
            buildMailtoLink();
        });

        //Handles when the image alt tag input is changed
        $('#img-alt-tag').on('input',function(e){
            selectedImage.alt = e.currentTarget.value;
            updateCode();
        });

        // Handles when the image color box is clicked
        // $('#img-color-box').on('click',function(e){
        //     selectingColor = 1;
        // });

        // Handles when the Main color box is clicked
        // $('#main-color-box').on('click',function(e){
        //     selectingColor = 2;
        // });

        //Handles when the image alt tag input is changed
        $('#img-color').on('input',function(e){
            let td = selectedImage.parentElement;
            if(td.tagName == "A"){
                td = td.parentElement;
            }


            if(e.currentTarget.value == ""){
                $("#img-color-box").css("background", "repeating-conic-gradient(rgb(128, 128, 128) 0%, rgb(128, 128, 128) 25%, transparent 0%, transparent 50%) 50% center / 10px 10px");
            }

            td.bgColor = '#' + e.currentTarget.value;
            $("#img-color-box").css("background",td.bgColor);

            updateCode();
        });

        $('#main-color').on('input',function(e){

            $('table')[0].bgColor = '#' + e.currentTarget.value;

            if(e.currentTarget.value == ""){
                $("#main-color-box").css("background", "repeating-conic-gradient(rgb(128, 128, 128) 0%, rgb(128, 128, 128) 25%, transparent 0%, transparent 50%) 50% center / 10px 10px");
            }
            
            console.log(e.currentTarget.value)
            $("#main-color-box").css("background", '#' + e.currentTarget.value);

            updateCode();
        });

        //Handles when the replace row button is clicked
        $('.replace-new').on('click', function(event){
            
            let row = selectedImage;
            while(row.parentElement.parentElement.parentElement.tagName != "CENTER"){
                row = row.parentElement;
            }

            let rowCopy = row;

            var tr = document.createElement('tr');
            tr.classList.add("replace-row");
            var td = document.createElement('td');
            td.innerHTML = imgBlank;
            tr.appendChild(td);

            row.replaceWith(tr);

            setTimeout(
            function() 
            {
                if(confirm("Proceed replacing this row?") == true){
                    updateCode();

                    let replaceImageData = {
                        state: true,
                        type: "newHTML",
                        src: null,
                        imageWidth: null,
                        imageHeight: null,
                    }
                    sessionStorage.setItem("replaceImageData", JSON.stringify(replaceImageData));

                    // Check if we are doing a crm edit if so go to the Canvas with the correct link
                    if(getUrlParameter("id")){
                        window.location.href = "/canvas" + "/?accountid=" + getUrlParameter("accountid") + "&id=" + getUrlParameter("id");
                    }else{
                        window.location.href = "/canvas";
                    }
                    
                }else{
                    tr.replaceWith(rowCopy);
                }
            }, 125);

        });

        //Handles when the server replace image button is clicked
        $('.replace-server').on('click', function(event){

            // Cannot be createing a new CRM EDM
            sessionStorage.removeItem("crmCreate");

            // Check that the image is from our server
            let source = selectedImage.src.substring(0,19);
            if(source == "https://joeyai.net/"){
                if(selectedImage != null){
                    let password = prompt("THIS WILL OVERWRITE THE IMAGE ON THE SERVER.\n\nThe change you are about to make will reflect on any EDMs that use this image. Including any EDMs that have already gone out.\n\nPlease enter password to proceed.");

                    let sendData = JSON.stringify({functionname: 'replaceImagePasswordCheck', arguments:{'input': password}});

                    $.ajax({
                        type: "POST",
                        url: "/functions.php",
                        data: sendData,
                        dataType: 'json',   
                        cache: false,
                        success: function(response)
                        {
                            
                            if(response['result'] == true){
                                let replaceImageData = {
                                    state: true,
                                    type: "serverImage",
                                    src: selectedImage.src.split('?')[0],
                                    imageWidth: selectedImage.naturalWidth,
                                    imageHeight: selectedImage.naturalHeight
                                }

                                sessionStorage.setItem("replaceImageData", JSON.stringify(replaceImageData));

                                // Check if we are doing a crm edit if so go to the Canvas with the correct link
                                if(getUrlParameter("id")){
                                    window.location.href = "/canvas" + "/?accountid=" + getUrlParameter("accountid") + "&id=" + getUrlParameter("id");
                                }else{
                                    window.location.href = "/canvas";
                                }
                            }
                        } ,
                        error: function (xhr, ajaxOptions, thrownError) {
                            console.log(xhr.status);
                            console.log(thrownError);
                        }
                    });
                }else{
                    alert("No Selected Slice");
                }
            }else{
                alert("Image is not located on our server.")
            }
        });

        //Handles when the Delete button is clicked
        $('.delete').on('click', function(event){
            if(selectedImage != null){
                //Get the selected images parent td
                let removeEle = selectedImage;
                
                if(removeEle.parentElement.tagName == "A"){
                    removeEle = removeEle.parentElement.parentElement;
                }else{
                    removeEle = removeEle.parentElement;
                }

                //Get the parent of the element we are removing
                let parentEle = removeEle.parentElement;
                //Remove the selected td
                removeEle.remove();

                //while the parent is empty remove it
                while(parentEle.children.length == 0){
                    removeEle = parentEle;
                    parentEle = parentEle.parentElement;

                    removeEle.remove();

                    //If parent element is the main table 
                    if(parentEle.parentElement.tagName == "CENTER"){
                        break;
                    }
                }

                //clear the selected image
                selectedImage = null;
                updateCode();
            }
        });

        //Handles when the Duplicate row button is clicked
        //Needs to become insert blank row after selected element 
        //if no selected element insert to the top of the table
        $('.insert-row').on('click', function(event){
            
            if(selectedImage != null){
                //Find the top layer tr
                let tableRow = selectedImage.closest('tr');
                while($(tableRow).parents('table').length > 1){
                    tableRow = tableRow.parentNode.closest('tr');
                }
                
                //append blank tr
                $('<tr><td>' + imgBlank + '</td></tr>').insertAfter($(tableRow));

                updateCode();
            }

            //If we are in a sub table how do we know if they want a row on the sub table vs a row on main table

            // if(selectedImage != null){
            //     origTR = selectedImage;
            //     if(origTR.parentElement.tagName == "A"){
            //         origTR = origTR.parentElement.parentElement.parentElement;
            //     }else{
            //         origTR = origTR.parentElement.parentElement;
            //     }

            //     //Clone the row
            //     let cloneRow =  $(origTR).clone();

            //     //set duplicate row image to selected
            //     selectedImage.classList.remove("selected");
            //     selectedImage = cloneRow[0].getElementsByClassName("selected")[0];

            //     //insert the cloned row
            //     cloneRow.insertAfter(origTR);

            //     updateCode();
            // }
            // //If no row is selected
            // else{
            //     var tr = document.createElement('tr');
            //     tr.classList.add("replace-row");
            //     var td = document.createElement('td');
            //     td.innerHTML = imgBlank;
            //     tr.appendChild(td);

            //     $('center table')[0].prepend(tr);
            //     updateCode();
            // }
        });

        //Handles when the Duplicate cell button is clicked
        $('.insert-cell').on('click', function(event){

            if(selectedImage != null){
                //Find the current cell
                let tableCell = selectedImage.closest('td');
                //Check if there are sibling cells.
                if($(tableCell).siblings().length > 0){
                    //If there are we can append a new cell.
                    $('<td>' + imgBlank + '</td>').insertAfter($(tableCell));
                }else{
                    //Else we have to put them in a table
                    let parentRow = tableCell.parentElement;
                    newTable = '<td>' + tableBlank + '<tr>' + tableCell.outerHTML + '<td>' + imgBlank + '</td>' + '</tr>' + '</table>' + '</td>';
                    parentRow.innerHTML = newTable;
                }

                updateCode();
            }

            //We need to put the cell in a table if it isn't
            // if(selectedImage != null){
            //     origTd = selectedImage;
            //     if(origTd.parentElement.tagName == "A"){
            //         origTd = origTd.parentElement.parentElement;
            //     }else{
            //         origTd = origTd.parentElement;
            //     }

            //     //Clone the cell
            //     let cloneCell =  $(origTd).clone();
            //     console.log(cloneCell);

            //     //set duplicate row image to selected
            //     selectedImage.classList.remove("selected");
            //     selectedImage = cloneCell[0].getElementsByClassName("selected")[0];

            //     //insert the cloned row
            //     cloneCell.insertAfter(origTd);

            //     updateCode();
            // }
        });


        //Handles when the titles is changed
        $('#edm-title').on('input',function(e){
            $(".edm-container title")[0].innerHTML = e.currentTarget.value;
            updateCode();
        });

        //Handles when the line toggle button is clicked
        $('.line-toggle').on('click', function(event){
            if($('.edm-container img').css("outline-style") == "dashed" || $('.edm-container img').css("outline-style") == "solid"){
                for(let i =0; i < $('.edm-container img').length; i++){
                    $('.edm-container img')[i].classList.add('hide-lines');
                }
                $('.line-toggle').css('background-color','#FFFFFF');
                $('.line-toggle').css('color','#000000');
            }else{
                for(let i =0; i < $('.edm-container img').length; i++){
                    $('.edm-container img')[i].classList.remove('hide-lines');
                }
                $('.line-toggle').css('background-color','#000000');
                $('.line-toggle').css('color','#FFFFFF');
            }
            
        });

        //
        $('.save-html').on('click', function(event){
            console.log(sessionStorage.getItem('code'))
            crmPost(sessionStorage.getItem('code'));
        });


        //Handles when an image has an error
        document.addEventListener('error', function (event) {
            if (event.target.tagName == 'IMG') {
                event.target.classList.add("img-error");
            }
        }, true );

        //Handles when an image is loaded
        $('img').on('load', function(e) {
            e.currentTarget.classList.remove("img-error");
        });

    

        // KeyDown Events For Copy and pasting links
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

        $(document).keydown(function(e) {
            var nothingIsFocused = document.activeElement.tagName != "INPUT" && document.activeElement.tagName != "TEXTAREA";
        
            if (ctrlDown && (e.keyCode == vKey) && nothingIsFocused) {
            if(selectedImage != null){
                getClipboardContents().then((clipText) => {
                $('#img-link')[0].value = clipText;
                updateLink();
                updateCode();
                });
            }
            };
            if (ctrlDown && (e.keyCode == cKey) && nothingIsFocused) {
            let link = $('#img-link')[0].value;
            setClipboardContents(link);
            };
        });
        


        // UPLOAD FILE
        const dropArea =  $('.file-upload-popup .drop-area')[0];
        const fileInput = $('.file-upload-popup input')[0];
        let file;

        //Handles when an image is uploaded via the browse button
        fileInput.addEventListener("change", function(){
            //getting user select file and [0] this means if user select multiple files then we'll select only the first one
            file = this.files[0];
            $('.input-filename').text(file.name);
            dropArea.classList.add("active");
        });

        //If user Drag File Over DropArea
        dropArea.addEventListener("dragover", (event)=>{
            event.preventDefault(); //preventing from default behaviour
            dropArea.classList.add("active");
        });
        
        //If user leave dragged File from DropArea
        dropArea.addEventListener("dragleave", ()=>{
            dropArea.classList.remove("active");
        });
        //Handles when the image is dropped on the area
        dropArea.addEventListener("drop", (event) => {
            // prevent default action (open as link for some elements)
            event.preventDefault();
            // move dragged element to the selected drop target
            var droppedHTML = event.dataTransfer.getData("text/html");
            file = event.dataTransfer.files[0];
            $('.input-filename').text(file.name);
        });

        // This functiion is called when the uploaded file is submitted
        function uploadFile(){
            let fileType = file.type; //getting selected file type
            let validExtensions = ["image/gif", "application/pdf"]; //adding some valid image extensions in array
            if(validExtensions.includes(fileType)){ //if user selected file is an image file
                let fileReader = new FileReader(); //creating new FileReader object
                fileReader.onload = ()=>{

                    let filename = $('#file-name')[0].value;
                    let client = $('.client-dropdown')[0].firstChild.data;
                    let date =$('#folder-date')[0].value;
                    let fileURL = fileReader.result;
                    
                    let data = {functionname: 'uploadFile', arguments: {filename: filename, client: client, date: date, file: fileURL, fileType: fileType}};
                
                    fetch("/functions.php", {
                        method: "POST",
                        headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                        body: JSON.stringify(data),
                    })
                    .then((response) => response.json())
                    .then((res) => {
                        console.log(res);
                        if(res.result != false){
                            //update the image src or add a link to the pdf
                            if(fileType == "image/gif"){
                                $('#img-src')[0].value = res.result;
                                selectedImage.src = res.result;
                                updateCode();
                            }

                            if(fileType == "application/pdf"){
                                $('#img-link')[0].value = res.result;
                                updateLink();
                                updateCode();
                            }

                            $(".file-upload-popup").addClass("hide-import");
                        }else{
                            alert("ERROR UPLOADING FILE IMAGE");
                            console.log(res);
                        }
                    });


                }
                fileReader.readAsDataURL(file);
        
            }else{
                alert("This is not a valid file.");
                dropArea.classList.remove("active");
            }
        }

        // FILE POPUP UPLOAD
        $(".file-upload-popup .upload-file").on('click', function(event){
            let generate = true;

            if(selectedImage == null){
                alert("No Selected Image");
                generate = false;
            }

            // CHECK FOR FILENAME AND DATE
            for(let i = 0; i< $(".file-upload-popup").find("input").length; i++){
                if($(".file-upload-popup").find("input")[i].value == ""){
                    $(".file-upload-popup").find("input")[i].parentElement.parentElement.classList.add("missing");
                    generate = false;
                }
            }

            // CHECK FOR SELECTED CLIENT
            if($('.client-dropdown')[0].firstChild.data == "SELECT CLIENT"){
                $('.client-dropdown')[0].parentElement.classList.add("missing");
                generate = false;
            }

            //Check if we have a file
            if(file == null){
                $('.input-filename')[0].parentElement.parentElement.classList.add("missing");
                generate = false;
            }

            // IF WE HAVE NAME CLIENT AD DATE GENERATE HTML
            if(generate){
                uploadFile();
            }
        });

        // CLOSE FILE POPUP
        $(".file-upload-popup").find(".close").on('click', function(event){
            $(".file-upload-popup").addClass("hide-import");
        });

        // OPEN FILE POPUP
        $("#gif-button").on('click', function(event){
            $(".file-upload-popup").removeClass("hide-import");
            //Set current date
            let currentDate = new Date();
            currentDate = currentDate.toISOString().split('T')[0];
            currentDate = currentDate.replaceAll('-','');
            $('#folder-date')[0].value = currentDate;
        });

        // OPEN FILE POPUP
        $("#pdf-button").on('click', function(event){
            $(".file-upload-popup").removeClass("hide-import");
            //Set current date
            let currentDate = new Date();
            currentDate = currentDate.toISOString().split('T')[0];
            currentDate = currentDate.replaceAll('-','');
            $('#folder-date')[0].value = currentDate;
        });

        // WHEN CLIENT DROPDOWN IS CLICKED
        $('.file-upload-popup .client-dropdown').on('click', function(event){

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
        $(document).on('click','.file-upload-popup .dropdown-item', function(event){
            $('.client-dropdown')[0].firstChild.data = this.innerHTML;
            $(".dropdown-selection").toggleClass("hide-import");
        });
        
        // When CLIENT IS SELECTED
        $('.file-upload-popup .client-dropdown').on('DOMSubtreeModified', function(){
            $('.client-dropdown')[0].parentElement.classList.remove("missing");
        });

        // WHEN ANY INPUT IN POPUP IS UPDATED
        $(".file-upload-popup").find("input").on('propertychange input', function (e) {
            if(e.value != ""){
                e.currentTarget.parentElement.parentElement.classList.remove("missing");
            }
        });
    
    }

});





// ********************* FUNCTIONS *********************

// sets the selected image
function select(img){
    //set selected img
    selectedImage = img;

    // Set CSS highlight
    clearSelectedImg();
    img.classList.add( "selected" );

    // Set Img SRC
    //Split the timestamp from the src then remove the first 18 chars(https://joeyai.net)
    $('#img-src')[0].value = img.src.split('?')[0];

    // Set Slice Link
    if(img.parentElement.tagName == "A"){
        $('#img-link')[0].value = img.parentElement.attributes[0].value;
    }else{
        $('#img-link')[0].value = "";
    }

    //Clear the mailto options
    clearMailtoOptions()

    if($('#img-link')[0].value.substring(0,7) == "mailto:"){
        $('.mailto-options').removeClass('hide-import');
        updateMailtoOptFromLink();
    }else{
        $('.mailto-options').addClass('hide-import'); 
    }

    // Set Slice Alt Tag
    $('#img-alt-tag')[0].value = img.alt;

    // Set Slice Color
    let td = img.parentElement;
    if(td.tagName == "A"){
        td = td.parentElement;
    }
    if(td.bgColor == ""){
        $('#img-color')[0].value = td.bgColor;
        $("#img-color-box").css("background","repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 10px 10px");
    }else{
        $('#img-color')[0].value = td.bgColor.slice(1);
        $("#img-color-box").css("background",td.bgColor);
    }

    // Set Img Dimensions
    $('.slice-dim-num')[0].innerHTML = img.naturalWidth;
    $('.slice-dim-num')[1].innerHTML = img.naturalHeight;
}

// Clears the selected class from the code
function clearSelectedImg(){
    let imgs = $('.edm-container img');
    for(let i=0; i < imgs.length; i++){
        imgs[i].classList.remove( "selected" );
    }
}

function updateLink(){
    let linkInput = $('#img-link')[0];

    let parentIsLink = false;
    if(selectedImage.parentElement.tagName == "A"){
        parentIsLink = true;
    }
    
    if(linkInput.value != ""){
        if(parentIsLink == true){
            selectedImage.parentElement.href = linkInput.value;
        }else{
            //add link
            var a = document.createElement('a');
            a.href = linkInput.value;

            let parent = selectedImage.parentElement;
            parent.replaceChild(a,selectedImage);

            a.appendChild(selectedImage);
        }
    }else{
        if(parentIsLink == true){
            let td = selectedImage.parentElement.parentElement;
            let a = selectedImage.parentElement;
            td.replaceChild(selectedImage,a);
        }
    }
}

// updates the stored code
function updateCode(){
    var codeContainerCopy = document.createElement("div");
    var codeContainer = $('.edm-container')[0];
    codeContainerCopy.innerHTML = codeContainer.innerHTML;

    // CLEAR EDITOR CLASSES
    //List of classes form the code editor to clear before saving 
    let removeClassList = ["selected", "hide-lines", "img-error"];

    for (const removeClass of removeClassList) {
        var elems = codeContainerCopy.getElementsByClassName(removeClass);
        let elmsArr = Array.prototype.slice.call( elems );
        for (let ele of elmsArr) {
            ele.classList.remove(removeClass);
        }
    }

    // Remove the version from all images
    var allImages = codeContainerCopy.getElementsByTagName('img');
    for(let img of allImages){
        img.src = img.src.split('?')[0];
    }


    var htmlBlank = '<html xmlns="https://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">';
    let bodyBlank = '<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" bgcolor="#FFFFFF">';

    let headString = "<head>";
    for(let i = 0; i < codeContainerCopy.children.length-1; i++){
        headString = headString + codeContainerCopy.children[i].outerHTML;
    }
    headString = headString + "</head>";

    var bodyString = bodyBlank + codeContainerCopy.children[codeContainerCopy.children.length-1].outerHTML + "</body>";


    //Make the String
    let htmlString = htmlBlank + headString + bodyString + '</html>';

    htmlString = cleanHTML(htmlString);

    // Save to session storage
    sessionStorage.setItem("code", htmlString);
}

//This function cleans and formats the edm code
function cleanHTML(htmlString){
  let options = {indent_size:2,preserve_newlines:false};
  return html_beautify(htmlString,options);
}


function clearMailtoOptions(){
    $('#mailto-link-body')[0].value = "";
    $('#mailto-link-subject')[0].value = "";
    $('#mailto-link-email')[0].value = "";
} 
  
// This builds and sets the link based off the mailto options
function buildMailtoLink(){
    // href="mailto:test@example.com?subject=Testing out mailto!&body=This is only a test!"
    let mailtoLink = "mailto:";

    // If we have an email
    if($('#mailto-link-email')[0].value != ""){
        mailtoLink = mailtoLink + $('#mailto-link-email')[0].value;
        $('#mailto-link-subject')[0].disabled = false;
    }else{
        $('#mailto-link-subject')[0].disabled = true;
    }

    // If we have a subject
    if($('#mailto-link-subject')[0].value != "" && $('#mailto-link-subject')[0].disabled == false){
        mailtoLink = mailtoLink + "?subject=" + $('#mailto-link-subject')[0].value;
        $('#mailto-link-body')[0].disabled = false;
    }else{
        $('#mailto-link-body')[0].disabled = true;
    }

    // If we have a body
    if($('#mailto-link-body')[0].value != "" && $('#mailto-link-body')[0].disabled == false){
        mailtoLink = mailtoLink + "&body=" + $('#mailto-link-body')[0].value;
    }

    // Update our link
    $('#img-link')[0].value = mailtoLink;
    selectedImage.parentElement.href = $('#img-link')[0].value;
    updateLink();
    updateCode();
}

  
function updateMailtoOptFromLink(){
    let mailtoLink = $('#img-link')[0].value;
    // Clear Mailto options
    $('#mailto-link-body')[0].value = "";
    $('#mailto-link-subject')[0].value = "";
    $('#mailto-link-email')[0].value = "";

    if(mailtoLink.substring(0,7) == "mailto:"){
        // Check if our link has a body
        if(mailtoLink.includes("body")){
        let bodyIndex = mailtoLink.indexOf("body");
        $('#mailto-link-body')[0].value = mailtoLink.substring(bodyIndex+5);
        // cut off body from string
        mailtoLink = mailtoLink.substring(0,bodyIndex-1);
        }

        // Check if our link has a subject
        if(mailtoLink.includes("subject")){
        let subjectIndex = mailtoLink.indexOf("subject");
        $('#mailto-link-subject')[0].value = mailtoLink.substring(subjectIndex+8);
        // cut off subject from string
        mailtoLink = mailtoLink.substring(0,subjectIndex-1);
        if($('#mailto-link-subject')[0].value == ""){
            $('#mailto-link-body')[0].disabled = true;
        }else{
            $('#mailto-link-body')[0].disabled = false;
        } 
        }

        //Email is everything after mailto 
        $('#mailto-link-email')[0].value = mailtoLink.substring(7);

        if($('#mailto-link-email')[0].value == ""){
        $('#mailto-link-subject')[0].disabled = true;
        }else{
        $('#mailto-link-subject')[0].disabled = false;
        } 

    }
}

//This function moves the color selector to the mouse location then gets the image pixel color at the mouse location 
//and sets the border and image/main color
function colorSelector(e){
    $('.color-selector')[0].classList.remove('hide-import');
    // Move color selector to mouse location
    $(".color-selector").css("top",e.clientY - 75/2);
    $(".color-selector").css("left",e.clientX - 75/2);
    let hoverImg = e.originalEvent.target;
    var rect = e.originalEvent.target.getBoundingClientRect();
    var x = e.originalEvent.clientX - rect.left; //x position within the element.
    var y = e.originalEvent.clientY - rect.top;  //y position within the element
    
    let sendData = JSON.stringify({functionname: 'getPixelColor', arguments:{'src': hoverImg.src.split('?')[0], 'x': x, y: y, w: hoverImg.width, h: hoverImg.height}});

    $.ajax({
        type: "POST",
        url: "/functions.php",
        data: sendData,
        dataType: 'json',   
        cache: false,
        success: function(reponse)
        {
            let response = JSON.parse(JSON.stringify(reponse));
            if(response['result'] == "Error getting color"){
                $('.color-border').css("border-color","#FFFFFF"); 
            }else{
                let color = response['result'];
                $('.color-border').css("border-color",color); 

                if(selectingColor == 1){
                    setColor(color,e.originalEvent.target);
                }

                if(selectingColor == 2){
                    $("#main-color-box").css("background",color);
                    $('#main-color')[0].value = color.slice(1);
                    $('table')[0].bgColor = color;
                    updateCode();
                }
            }
            
        } ,
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
        }
    });
}

//This function takes a color and an image and sets the images parent td's bg color 
function setColor(color){
    let td = selectedImage.parentElement;
    if(td.tagName == "A"){
        td = td.parentElement;
    }

    td.bgColor = color;
    $("#img-color-box").css("background",color);
    $('#img-color')[0].value = color.slice(1);

    updateCode();
}
  
// Generates the new HTML and replaces the selected row
async function replaceRow() {
    try {
        // Load the code in so we can replace the row with class .replace-row
        loadCachedCode();

        let genHTML = document.createElement('div');
        genHTML.innerHTML = await generateHTML(true);
        
        let replacementRow = genHTML.querySelector('.table-width');
        if(replacementRow.children[0].tagName == "TBODY"){replacementRow = replacementRow.children[0]}

        $('.replace-row').replaceWith(replacementRow.innerHTML);
        updateCode();
        
    } catch (err) {
        console.error('HTML GENERATION FAILED: ', err);
    }
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


function loadCachedCode(){

    let code = sessionStorage.getItem("code");
    $(".edm-container")[0].innerHTML = code;

    initalizeEditor();
}

async function loadDefaultCode(){

    let html =  await (await fetch('/edm_tool/default-html')).text();
    $(".edm-container")[0].innerHTML = html;

    initalizeEditor();
}

function initalizeEditor(){
    $('#edm-title')[0].value = $(".edm-container title")[0].innerHTML;
    $("#main-color-box").css("background",$('table')[0].bgColor);
    $('#main-color')[0].value = $('table')[0].bgColor.slice(1);
    
    //Adding timestamp to all images to avoid caching
    var timestamp = new Date().getTime();  
    let images = $('.edm-container img');
    for(let img of images){
        img.src += "?t=" + timestamp;
    }
}

