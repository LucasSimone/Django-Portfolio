
var editor;
var savedObject;
var htmlBlank = '<html xmlns="https://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">';
var bodyBlank = '<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0" bgcolor="#FFFFFF"><center></center></body>';
var tableBlank = '<table style="display:block; border-collapse: collapse; border-spacing: 0; font-size:0;" border="0" cellpadding="0" cellspacing="0">';
var imgBlank = '<img src="/static/edm_tool/img/default/XXXXX_XX.jpg" style="display:block; width:100%; max-width:100%;" border="0" alt="" >';

let formatOptions = {indent_size:2,preserve_newlines:false};


async function crmCreate(){
    let html = await generateHTML(true);

    crmPost(html);
}
async function crmPost(crmHtml){

    let data = {Key: "include", AccountID: parseInt(getUrlParameter("accountid")), Html: crmHtml};

    //Check if we have an Edit ID
    if(getUrlParameter("id")){
        console.log("EDIT POST");
        data.EdmID = parseInt(getUrlParameter("id"));
    }
    else{
        console.log("Creation post");
    }

    console.log("Data object sent to crm");
    console.log(data);

    var form = document.createElement('form');
    form.style.visibility = 'hidden'; // no user interaction is necessary
    form.method = 'POST'; // forms by default use GET query strings
    form.action = 'https://crm.joeyai.email/api/edm/create.php';
    for (const key of Object.keys(data)) {
        var input = document.createElement('input');
        input.name = key;
        input.value = data[key];
        form.appendChild(input); // add key/value pair to form
    }

    data = $(form).serialize();


    console.log("serialized data");
    console.log(data);


    $.ajax({ 
        type : "POST", 
        url : "https://crm.joeyai.email/api/edm/create.php",
        data: data,
        cache: false,
        success : function(result) { 
            console.log(getUrlParameter("id"))
            //set your variable to the result 
            if(getUrlParameter("id")){
                window.location.replace('https://crm.joeyai.email/edm-templates/edit?id=' + getUrlParameter("id"))
            }else{
                window.location.replace(result);
            }
            console.log(result);
        }, 
        error : function(result) { 
            //handle the error 
            console.log(result);
        } 
    }); 
}

// This function is called after the slices ar uploaded to the server 
// It generates the HTML for the page
async function generateHTML(returnCode = false){
    // Making the skeleton of our EDM
    let skele = document.createElement("html");

    // Get HTML from saved skeleton
    skele.innerHTML = await fetchHtmlAsText("/edm_tool/edm-skeleton");

    //Set the correct body
    skele.children[1].outerHTML = bodyBlank;
    // remove the extra head that's created
    skele.removeChild(skele.children[1])

    // Old way using localStorage which hit quota when the image was too big
    // let savedImage = localStorage['savedImage'];
    // console.log(savedImage);

    // This uses the localForage API so wo can save bigger strings
    let savedImage = await fetchLocalForgeItem("savedImage");

    if (savedImage) {
        savedObject = JSON.parse(savedImage);
        console.log(savedObject);

        // Load Image
        try{
            const img = await loadImage(savedObject.image);
            savedObject.image = img;
        }catch(e){
            console.log(e)
        }
        
        let title = savedObject.title;
        let color = savedObject.color;

        // Set the EDM title
        skele.children[0].children[0].innerHTML = title;



        // let slice = {index: null, sliceObj: null};
        let sliceList = [];
        for(let i=0; i < savedObject.slices.length; i++){
            let newSlice = {index: i, sliceObj: savedObject.slices[i]};
            sliceList.push(newSlice);
        }

        // Make the EDM
        console.log("START HTML CREATION")
        let masterTable = createTableRows(sliceList);
        masterTable.bgColor = '#'+color;
        masterTable.classList.add("table-width");
        console.log(masterTable);
        skele.children[1].children[0].appendChild(masterTable);


    }else{
        console.log("NO SAVED DATA FOR IMAGE OR SLICE")
    }


    skele = htmlBlank + skele.innerHTML + '</html>';
    skele = html_beautify(skele,formatOptions);
    
    if(returnCode){
        return skele;
    }else{
        editor.setValue(skele); 
    }
       
 
}

// ************************************************************** HTML GENERATION FUNCTIONS **************************************************************



// This function gets a list of slices that represent a table and returns a table with the slices arragned inside
// It first loops through the array and finds where each horizontal seam is
// We then loop through our list of horizontal seams and sort the slice list into row arrays
// We then loop through our array of rows if a row only has one slice inside it is a whole row so we make the image and add it to our td
// If a row has more than one slice inside we then send the slices in that row to createTableColumns() to get the resulting
// subtable and append it to our td

function createTableRows(sliceList){
    console.log("Finding Table Rows");

    //Create a list of y values in which a seam runs along the whole table
    let rowYVals = []
    let endX = findTableRowSize(sliceList);
    for(let i=0; i < sliceList.length; i++){
        //Check the top of each slice
        let yval = sliceList[i].sliceObj.slice[1];
        let w = 0;
        let index = i;
        //Check if all the slices on the same y value add up to the width of the current table
        //If they do we have a seam
        while(index < sliceList.length && sliceList[index].sliceObj.slice[1] == yval){
            w +=  sliceList[index].sliceObj.slice[2];
            if(w == endX){
                //Add Y value to seam list
                rowYVals.push(yval);
                i = index;
                break;
            }
            index++;
        }
    }

    console.log("Array of Horizontal seams that span the whole table width");
    console.log(rowYVals);

    // Create an array which holds all the slice objects for the slices whos y vals that are in between the seams
    let rows = [];
    for(let i=1; i < rowYVals.length; i++){
        rows.push([]);
        //Loop through all slices
        for(let j=0; j < sliceList.length; j++){
            //If slice yval  is greater than the current seam but less than the next seam
            if(sliceList[j].sliceObj.slice[1] >= rowYVals[i-1] && sliceList[j].sliceObj.slice[1] < rowYVals[i]){
                // Add item to column
                rows[i-1].push(sliceList[j]);
            }
        }
        start = rowYVals[i];
    }
    // Add all slices whos y val is greater than the last seam
    rows.push([]);
    for(let j=0; j < sliceList.length; j++){
        if(sliceList[j].sliceObj.slice[1] >= rowYVals[rowYVals.length-1]){
            // Add item to column
            rows[rows.length-1].push(sliceList[j]);
        }
    }

    console.log("List that represents the table rows. Each index is a array of the table slices in one row")
    console.log(rows);


    //Create the outer table container
    let tableCont = document.createElement("div");
    tableCont.innerHTML = tableBlank;

    console.log("Creating the table by looping through our row structure array")
    // Loop through row structure array and create table
    for(let i=0; i < rows.length;i++){
        // Each index/entry in the structure is a row and cell
        let row = document.createElement("tr");
        let cell = document.createElement("td");

        // If we only have one image in the row create the img and add it to our td
        if(rows[i].length == 1){
            let newCell = createTD(rows[i][0]);
            cell = newCell;
        }

        // More than one image in the row. We need to create the sub table
        else{
            // Create the table
            let table = createTableColumns(rows[i]);
            cell.appendChild(table)
        }


        // Append whatever the cell became to row and add the row to our table
        row.appendChild(cell);
        tableCont.children[0].appendChild(row);
    }

    // Return our table
    return tableCont.children[0];
}



// This function takes a sliceList representing a table as input and we return a table(This table will only have one row)
// We first mark loop through the list and mark any vertical seams these are lines
// that run from the top of the table to the bottom.
// Using these vertical seams we then sort each slice into sepearte column arrays
// These columns are the looped through
// If a column only has one slice withing we create the img and append it to our table row
// If there are multiple slices we then call the createTableRows() function sending the slices in our column as the table list
// and append the resulting table to our td

function createTableColumns(sliceList){
    
    console.log("Finding Table Columns")

    // To check vertical seam
    let coloumnXVals = [];
    let yVal = sliceList[0].sliceObj.slice[1];
    let index = 0;
    //loop through all slices if the current slice and next slice have the same y val we search the seam  -   This the second of the while that checks the yvals could probaly be taken out and put in a if statement but this works
    while(index < sliceList.length-1 && sliceList[index].sliceObj.slice[1] == yVal&& sliceList[index+1].sliceObj.slice[1] == yVal){
        let searchingSeam = true;
        let searchSlice = sliceList[index].sliceObj.slice;
        let currXCol = sliceList[index].sliceObj.slice[0] + sliceList[index].sliceObj.slice[2];
        
        while(searchingSeam){
            let seam = checkVerticalSeam(searchSlice,sliceList);
            if(seam == false){
                searchingSeam = false;
            }if(seam == true){
                coloumnXVals.push(currXCol)
                searchingSeam = false;
            }else{
                searchSlice = seam;
            }
        }
        
        index++;
    }


    console.log("Array of Vertical seams that span the whole table height")
    console.log(coloumnXVals);

    // Add slices into respective column
    let columns = [];
    let start = 0;
    for(let i=0; i < coloumnXVals.length; i++){
        columns.push([]);
        for(let j=0; j < sliceList.length; j++){
            if(sliceList[j].sliceObj.slice[0] < coloumnXVals[i] && sliceList[j].sliceObj.slice[0] >= start){
                // Add item to column
                columns[i].push(sliceList[j]);
            }
        }
        start = coloumnXVals[i];
    }
    // Add last column slices
    columns.push([]);
    for(let j=0; j < sliceList.length; j++){
        if(sliceList[j].sliceObj.slice[0] >= coloumnXVals[coloumnXVals.length-1]){
            // Add item to column
            columns[columns.length-1].push(sliceList[j]);
        }
    }

    console.log("List that represents the table columns. Each index is a array of the table slices in one column")
    console.log(columns);

    // Make the table from columns
    let tableCont = document.createElement("div");
    tableCont.innerHTML = tableBlank;
    // This table will only contain one row
    let row = document.createElement("tr");
    // Loop through our columns
    for(let i = 0; i < columns.length; i++){
        // Each column is one cell in the table
        let cell = document.createElement("td");
        // If there is only one slice in a column create the image
        if(columns[i].length == 1){
            let newCell = createTD(columns[i][0]);
            cell = newCell;
        }
        // More than one slice in a column create the table to append to our row
        else{
            let table = createTableRows(columns[i]);
            cell.appendChild(table);
        }
        row.appendChild(cell);

    }
    // Append our row to the table and return
    tableCont.children[0].appendChild(row);
    return tableCont.children[0];
}

function createTD(sliceInfo){

    let td = document.createElement("td");
    // Create Image 
    let imgCont = document.createElement("div");
    console.log(imgBlank)
    let currImg = imgBlank;
    let currImgName = savedObject.imgName + '_' + String(sliceInfo.index).padStart(2, '0');
    currImg = currImg.replace("XXXXX_XX",currImgName );
    imgCont.innerHTML = currImg;

    console.log(currImg)

    // let currImg = imgBlank.replace("client",savedObject.client);
    // currImg = currImg.replace("date",savedObject.folderDate);
    // let currImgName = savedObject.imgName + '_' + String(sliceInfo.index).padStart(2, '0');
    // currImg = currImg.replace("XXXXX_XX",currImgName );
    // imgCont.innerHTML = currImg;

    // Add alt tag if there is one
    if(sliceInfo.sliceObj.alt != null){
        imgCont.children[0].alt = sliceInfo.sliceObj.alt;
    }
    
    // Add Link if slice has one
    if(sliceInfo.sliceObj.link != null){
        let link = document.createElement("a");
        link.href = sliceInfo.sliceObj.link;
        link.target = "_blank";
        link.innerHTML = imgCont.innerHTML;
        td.appendChild(link);
    }else{
        td.innerHTML = imgCont.innerHTML;
    }

    

    // Add td color if slice has one
    if(sliceInfo.sliceObj.color != null){
        td.bgColor = '#' + sliceInfo.sliceObj.color;
    }

    return td;
}


// This function gets a slice and a slicelist that represents a table as input
// If the slice given touches the bottom of the table we return true as the slice has a vertical seam touching the bottom
// If not the slice is somewhere in the middle of the table we loop through our table and check if there is another
// slice that carries the seam further down the table
// If a continuation seam is found we return it otherwise we return false as the vertical seam has ended before reaching the 
// end of the table
function checkVerticalSeam(slice,sliceList){
    let bottomX = slice[0] + slice[2];
    let bottomY = slice[1] + slice[3];
    let endY = sliceList[sliceList.length-1].sliceObj.slice[1] + sliceList[sliceList.length-1].sliceObj.slice[3];

    if(bottomY == endY){
        return true;
    }

    for(let i=0; i< sliceList.length; i++){
        let topX = sliceList[i].sliceObj.slice[0] + sliceList[i].sliceObj.slice[2];
        let topY = sliceList[i].sliceObj.slice[1];
        if(topX == bottomX && topY == bottomY){
            return sliceList[i].sliceObj.slice;
        }
    }
    return false;
}


// This function is given a sliceList that represents a table
// We want to find the rowsize of this table we save the first slice yValue
// We then loop through the table slices and while we are on the same yvalue we sum
// the width together returning the complete table width
function findTableRowSize(sliceList){
    let width = 0;
    let yVal = sliceList[0].sliceObj.slice[1];
    let index = 0;

    while(index < sliceList.length && sliceList[index].sliceObj.slice[1] == yVal){
        width += sliceList[index].sliceObj.slice[2];
        index++;
    }
    return width;
}


// ************************************************************** EVENTS **************************************************************

addEventListener("keyup", function(event) {
    // Extra key for testing
    if (event.key == "t") {
        // generateHTML();
    }

});


$( document ).ready(function() {


        // INIT CODE AREA
        
        // If the editor exists try loading the HTML
        if( $(' textarea#code ').length ){

            editor = CodeMirror.fromTextArea(document.getElementById("code"), {
                styleActiveLine: true,
                lineNumbers: true,
                matchBrackets: true,
                autoCloseBrackets: true,
                autoCloseTags: true,
                mode: "htmlmixed",
            });

            editor.setValue("ENTER CODE HERE TO EDIT WITH THE EDITOR");

            // Check if we need to generate code
            let generate = sessionStorage.getItem("generate");
            if(generate == "true"){
                generateHTML();
                sessionStorage.setItem("generate", "false");
            }

            //Check if there is previous code to load
            else if (sessionStorage.getItem("code")){
                editor.setValue(sessionStorage.getItem("code"));
            }
            
            editor.on("change", (event) => {
                //Save to storage
                sessionStorage.setItem("code", editor.getValue());
            });
        }
});

// ************************************************************** EXTRA FUNCTIONS **************************************************************

async function fetchHtmlAsText(url) {
    return await (await fetch(url)).text();
}

async function fetchLocalForgeItem(key){
    try {
        const value = await localforage.getItem(key);
        return value;
    } catch (err) {
        console.log(err);
    }
}

const loadImage = path => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous' // to avoid CORS if used with Canvas
      img.src = path
      img.onload = () => {
        resolve(img)
      }
      img.onerror = e => {
        reject(e)
      }
    })
  }



//   OLD CODE


// //We could also create a loop that searched for horizontal seams and sorts the slices into rows this would eleminate the need for tablewidth
// function createTableRows(sliceList, tableWidth){
//     console.log("createTablRows")
//     // IDENTIFY HORIZONTAL ROWS AND HORIZONTAL SEAMS
//     let structure = [];
//     // let marker = {index: null, type: null};
//     // Mark seams
//     console.log("Making Structure");
//     // This loop makes the structure array
//     for(let i=0; i < sliceList.length;i++){
//         // If Slice width is equal to full table width
//         if(sliceList[i].sliceObj.slice[2] == tableWidth){
//             let marker = {origSlice: sliceList[i], type: "row"};
//             structure.push(marker);
//         }else{
//             let origSlice = sliceList[i];
//             let y = sliceList[i].sliceObj.slice[1];
//             let w = sliceList[i].sliceObj.slice[2];
//             // The slice isn't a whole row 
//             // Continue through the slice slicelist and find the slices that are on the same y value summing widths
//             // of slices with the same y value
//             while(i != sliceList.length-1 && sliceList[i+1].sliceObj.slice[1] == y){
                
//                 w += sliceList[i+1].sliceObj.slice[2];
//                 // If the width summation is equal to the table width we have found a seam
//                 if(w == tableWidth){
//                     let marker = {origSlice: origSlice, type: "seam"};
//                     structure.push(marker);
//                     i++; 
//                     break;
//                 }
//                 i++;
//             }
//         }
//     }

//     console.log("Structure");
//     console.log(structure);

//     // The div that holds our Table
//     let tableCont = document.createElement("div");
//     let tableString = tableBlank.replace('bgcolor="#FFFFFF"','');
//     tableCont.innerHTML = tableString;
//     // Loop through structure array and create table
//     for(let i=0; i < structure.length;i++){
//         // Each entry in the structure is a row and cell
//         let row = document.createElement("tr");
//         let cell = document.createElement("td");

//         // If we have a whole row create the img and add it to our td
//         if(structure[i].type == "row"){
//             // Slice is a whole row append image to td
//             let imgCont = document.createElement("div");
//             let currImg = imgBlank.replace("client",savedObject.client);
//             currImg = currImg.replace("date",savedObject.folderDate);
//             let currImgName = savedObject.imgName + '_' + String(structure[i].origSlice.index).padStart(2, '0');
//             currImg = currImg.replace("XXXXX_XX",currImgName );
//             imgCont.innerHTML = currImg;
//             cell.appendChild(imgCont.children[0]);
//         }
//         // We need to create a sub table
//         else{
//             // Find where the table should start and end in the slice array
//             let tableStartIndex = structure[i].origSlice.index;
//             let tableEndIndex;
//             if(i == structure.length-1){
//                 tableEndIndex = sliceList[sliceList.length-1].index;
//             }else{
//                 let sliceListIndex = sliceList.findIndex(slice => slice.index === structure[i+1].origSlice.index);
//                 tableEndIndex = sliceList[sliceListIndex-1].index;
//             }

//             // Create the subslice list that we will send to become a table
//             let subSliceList = [];
//             for(let i = 0; i < sliceList.length; i++){
//                 if(sliceList[i].index >= tableStartIndex && sliceList[i].index <= tableEndIndex){
//                     subSliceList.push(sliceList[i]);
//                 }
//             }

//             // Create the table
//             let table = createTableColumns(subSliceList);
//             cell.appendChild(table)
//         }
//         // Append whatever the cell became to row and add the row to our table
//         row.appendChild(cell);
//         tableCont.children[0].appendChild(row);
//     }
//     // Return our table
//     return tableCont.children[0];
// }