export class MasterSlices{

    // Slice List Structure
    // sliceList = [ {slice: [], link: null, color: null, alt: null;}, ];
    // slice is an array of length 4 storing slice x y w h
    sliceList = [];

    selectedSliceIndex = null;
    image = null;

    sliceCanvas = null;
    c_s = null;
    ctx_s = null;

    currentSlice = null;
    snapLines = {x: null, y: null , m: null, t: null, r: null, l: null, b: null};
    saveSlice = null;
    splitSliceIndex = null;

    hoveringSliceEdge = false;
    sliceToResize = {index: null, side: null};

    sliceColor = "#FFA500";
    edgeTolerance = 20;

    constructor(masterImage){
        this.sliceCanvas = document.querySelector(".slice-layer");
        this.c_s = this.sliceCanvas;
        this.ctx_s = this.c_s.getContext("2d");

        this.ctx_s.canvas.width  = $('.canvas-container').width();
        this.ctx_s.canvas.height  = $('.canvas-container').height();

        this.image = masterImage;
    }


    // EXPORT SLICE FUNCTIONS

    // This function is called when we export our slices to ftp
    sliceUpload(imageName,client,date){
        console.log("Slice Upload");
        let jpgArray = this.exportPrep();

        let data = {functionname: 'saveImages', arguments: {imageName: imageName,client: client,date: date, jpgArray: jpgArray}}; 

        sessionStorage.setItem("generate", "true");
        this.updateCachedData();

        color_wipe_in();
        setTimeout(h_direct, 500, '/edm_tool/code');

        // fetch("/functions.php", {
        //     method: "POST",
        //     headers: {
        //     "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        //     },
        //     body: JSON.stringify(data),
        // })
        // .then((response) => response.json())
        // .then((res) => {
        //     if(res.result == "SLICES UPLOADED SUCCESSFULLY"){

        //         if(getUrlParameter("accountid") && !getUrlParameter("id")){
        //             // Post to the CRM
        //             crmCreate();
        //         }else{
        //             // Generate code and go to the code page
        //             //Set code page to generate html
        //             sessionStorage.setItem("generate", "true");
        //             this.updateCachedData();
        //             window.location.href = "/code";
        //         }

        //         //Set code page to generate html
        //         // sessionStorage.setItem("generate", "true");
        //         // this.updateCachedData();
        //         // window.location.href = "/code";
        //     }else{
        //         alert(res.result);
        //     }
        // });
    }

    // This function is called when we export our slices to ftp
    replaceRowSliceUpload(imageName,client,date){
        console.log("Replace Row Upload");
        let jpgArray = this.exportPrep();

        let data = {functionname: 'saveImages', arguments: {imageName: imageName,client: client,date: date, jpgArray: jpgArray}}; 

        fetch("/functions.php", {
            method: "POST",
            headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: JSON.stringify(data),
        })
        .then((response) => response.json())
        .then((res) => {
            if(res.result == "SLICES UPLOADED SUCCESSFULLY"){
                //Set code page to generate html
                sessionStorage.setItem("generate", "true");
                this.updateCachedData();

                //Generate code and save it to session storage
                // let code = await generateHTML();
                // sessionStorage.setItem("code", code);
                
                //Remove the replace image state
                sessionStorage.removeItem("replaceImageData");

                //Check if we are doing a CRM edit if so pass on the correct link
                if(getUrlParameter("id")){
                    window.location.href = "/editor" + "/?accountid=" + getUrlParameter("accountid") + "&id=" + getUrlParameter("id") + "&load=1";
                }else{
                    window.location.href = "/editor";
                }

                return true;
                
            }else{
                alert(res.result);
                return false;
            }
        });
    }

    // This function is called when we export our slices to ftp
    replaceServerImage(src){
        let jpgArray = this.exportPrep();

        let data = {functionname: 'replaceServerImage', arguments: {src: src, jpgArray: jpgArray}}; 

        fetch("/functions.php", {
            method: "POST",
            headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: JSON.stringify(data),
        })
        .then((response) => response.json())
        .then((res) => {
            console.log(res.result);
            if(res.result == true){;
                if(getUrlParameter("id")){
                    window.location.href = "/editor" + "/?accountid=" + getUrlParameter("accountid") + "&id=" + getUrlParameter("id") + "&load=1";
                }else{
                    window.location.href = "/editor";
                }
            }else{
                alert("ERROR REPLACING IMAGE");
                console.log(res);
                console.log("Is the folder writable? Only _files is writable")
            }
        });
    }

    // This function is called when we export our slices as a downlaod
    downloadExport(imageName){
        let jpgArray = this.exportPrep();
        this.makeDownloadZip(jpgArray,imageName);
    }

    async makeDownloadZip(jpgArray,imageName){
        var zip = new JSZip();

        // //Name of zip folder
        var zipFilename = imageName + ".zip";

        //Fill Zip with images
        for(let i=0; i < jpgArray.length; i++){

            //Make Image Name
            var filename = imageName + '_' + i + '.jpg';
            
            zip.file(filename, jpgArray[i], {base64: true});
        }

        //Download the zip
        zip.generateAsync({type:"blob"})
        .then(function(content) {
            // see FileSaver.js
            saveAs(content, imageName + "_images.zip");

        });
    }

    // This function is called to get the images ready when we need to export
    // It returns an array of base64 Image URLs
    exportPrep(){
        //Array to store seperate slcie jpgs
        let jpgArray = [];

        this.orderSlices();

        this.ctx_s.clearRect(0,0,this.ctx_s.canvas.width,this.ctx_s.canvas.height);
        this.image.ctx.clearRect(0,0,this.image.ctx.canvas.width,this.image.ctx.canvas.height);

        let posMiddle = $('.canvas-container').width() / 2 - this.sliceList[0].slice[2] / 2;

        for(let i = 0; i < this.sliceList.length; i++){
            // Clear Canvas
            this.ctx_s.clearRect(0,0,this.ctx_s.canvas.width,this.ctx_s.canvas.height);
            // Set Canvas W and H to slice W and H
            this.ctx_s.canvas.width  = this.sliceList[i].slice[2];
            this.ctx_s.canvas.height  = this.sliceList[i].slice[3];
            // Draw the image on canvas
            this.ctx_s.drawImage(this.image.imgClass, this.sliceList[i].slice[0], this.sliceList[i].slice[1], this.sliceList[i].slice[2], this.sliceList[i].slice[3], 0, 0, this.sliceList[i].slice[2], this.sliceList[i].slice[3]);

            let jpgImage = $('.slice-layer')[0].toDataURL("image/jpeg", 1);
            jpgArray.push(jpgImage.split(',')[1]);

        }
       

        // Reset Canvas Width and Height
        this.ctx_s.canvas.width  = $('.canvas-container').width();
        this.ctx_s.canvas.height  = $('.canvas-container').height();

        this.renderSlices();
        this.image.reRender();

        return jpgArray;
    }

    // This function will order the slices from top to bottom using the y value
    // as first priority then x value second
    orderSlices(){

        
        // Create a corresponsing array that have the x, y values and the slice index
        let findOrder = [];
        for(let i=0; i < this.sliceList.length;i++){
            findOrder.unshift({x: this.sliceList[i].slice[0], y:this.sliceList[i].slice[1], index:i});
        }

        // order our coresponding array based on the x and y values 
        let order = findOrder.sort(function (i, j) {
            var n = i.y - j.y;
            if (n !== 0) {
                return n;
            }
        
            return i.x - j.x;
        });

        // Make a new array that is in order of the corresponding array pulling from our slicelist with the index saved in the orderd array
        let orderedSlices = [];
        for(let i=0; i < this.sliceList.length;i++){
            orderedSlices.push(this.sliceList[order[i].index]);
        }

        this.sliceList = orderedSlices;

        this.sliceToResize = {index: null, side: null};
        this.selectedSliceIndex = null;
        this.renderSlices();

    }

    updateCachedData(){

        //console.log("Updating Cached Data");

        // Update Cached Image
        var temp_canvas = document.createElement('canvas');
        var ctx_t = temp_canvas.getContext('2d');
        var dataURL;
        temp_canvas.width = this.image.imgClass.width;
        temp_canvas.height = this.image.imgClass.height;
        ctx_t.drawImage(this.image.imgClass, 0, 0);
        dataURL = temp_canvas.toDataURL("image/jpeg", 1);

        let saveTitle = $('#edm-title')[0].value;
        let savecolor = $('#main-color')[0].value;
        let saveImgName = $('#slice-name')[0].value;
        // let saveClient = $('.client-dropdown')[0].firstChild.data
        // let saveDate = $('#folder-date')[0].value;

        // Data to save
        let savedImage = {image: dataURL, slices: this.sliceList, title: saveTitle, color: savecolor, imgName: saveImgName};

        //Old way using local storage DataURL would get too long and exceed the quota
        //localStorage['savedImage'] = JSON.stringify(savedImage);

        localforage.setItem('savedImage', JSON.stringify(savedImage), function (err) {
            if(err){
                console.log("Error Caching Image Data:");
                console.log(err);
            }
        });




        // //Store image dataURL in client side database
        // var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
        // let openRequest = indexedDB.open("sliceCache", 1);

        
        // openRequest.onupgradeneeded = function(event) {
        //     console.log("Databse upgrade needed");

        //     const db = event.target.result;
        //     const objectStore = db.createObjectStore("savedImage", { keyPath: "id", autoIncrement:true });

        //     objectStore.createIndex("image", "image", { unique: true });
        //     objectStore.createIndex("slices", "slices", { unique: false });
        //     objectStore.createIndex("title", "title", { unique: false });
        //     objectStore.createIndex("color", "color", { unique: false });
        //     objectStore.createIndex("imgName", "imgName", { unique: false });
        //     objectStore.createIndex("client", "client", { unique: false });
        //     objectStore.createIndex("folderDate", "folderDate", { unique: false });
        // };

        // openRequest.onerror = function() {
        //     console.error("Error", openRequest.error);
        // };

        // openRequest.onsuccess = function() {
        //     let db = openRequest.result;
        //     console.log("Databse opened");
        //     console.log(db);

        //     var transaction = db.transaction("savedImage", "readwrite");
        //     var store = transaction.objectStore("savedImage");
   
        //     console.log(JSON.stringify(this.sliceList));

        //     store.put(savedImage);

        //     var allRecords = store.getAll();
        //     allRecords.onsuccess = function() {
        //         console.log(allRecords.result);
        //     };

        //     // Close the db when the transaction is done
        //     transaction.oncomplete = function() {
        //         db.close();
        //     };
        // };
      
      }



    // This function gets the current position of the mouse while left mouse is down and dragged 
    // We then determine if the mouse is outside of the image to keep the slice on the image edge
    // Then we send the slice to be rounded to the closest pixel borders using snapSlice() 
    // Finally all slices are renderd
    renderCurrentSlice(event){
    
        //Get position of mouse 
        let X2 = event.originalEvent.layerX;
        let Y2 = event.originalEvent.layerY;
    
        //convert mouse position to image coordinates
        let scaledEnd = this.scaledSliceToImageSize(X2,Y2,0,0);
    
        //Get width and height
        this.currentSlice[2] = scaledEnd[0] - this.currentSlice[0];
        this.currentSlice[3] = scaledEnd[1] - this.currentSlice[1];
    
        this.currentSlice = this.checkSliceSnaps(this.currentSlice[0],this.currentSlice[1],this.currentSlice[2],this.currentSlice[3]);
       
        this.saveSlice = this.checkValidSlice(this.currentSlice[0],this.currentSlice[1],this.currentSlice[2],this.currentSlice[3]);

  
    
        this.renderSlices();
    }


    // This function is called when the mouse is initially clicked this is the start of our rectangle
    // In this function we also look at the start position iof the mouse and if it lies outside the img
    // we place the image slice along the image
    initializeSlice(event){
        
        let X0 = event.originalEvent.layerX;
        let Y0 = event.originalEvent.layerY;
    
        this.currentSlice = this.scaledSliceToImageSize(X0,Y0,0,0);
    
        //If slice started to the left of img
        // Or If slice is within edge tolerance 
        if(this.currentSlice[0] < (0 + this.edgeTolerance)){
            this.currentSlice[0] = 0;
        }
    
        //If slice started on top of img
        // Or If slice is within edge tolerance 
        if(this.currentSlice[1] < (0 + this.edgeTolerance)){
            this.currentSlice[1] = 0;
        }
    
        // //If slice started to the right of img
        // // Or If slice is within edge tolerance 
        if(this.currentSlice[0] > (this.image.width - this.edgeTolerance)){
            this.currentSlice[0] = this.image.width;
        }
    
        // //If slice started below the img
        // // Or If slice is within edge tolerance 
        if(this.currentSlice[1] > (this.image.height - this.edgeTolerance)){
            this.currentSlice[1] = this.image.height;
        }
    
        //If slice starts within middle tolerance snap to middle
        if(this.currentSlice[0] < (this.image.width/2 + this.edgeTolerance) && this.currentSlice[0] > (this.image.width/2 - this.edgeTolerance)){
            this.currentSlice[0] = this.image.width/2;
        }
    
        //Check if slice is within edge tolerance of another slice to snap to
        let initalSnap = this.checkClosestSliceLine(this.currentSlice[0],this.currentSlice[1])
    
        if(initalSnap.lineX != null && this.currentSlice[0] != 0 && this.currentSlice[0] != this.image.width){
            this.currentSlice[0] = initalSnap.lineX;
        }
        if(initalSnap.lineY != null && this.currentSlice[1] != 0 && this.currentSlice[1] != this.image.height){
            this.currentSlice[1] = initalSnap.lineY;
        }
    
    }

    // CHECK FUNCTIONS

    // This function is passed a slice then checked against all Saved slices to see if the new slice is valid.
    // It also takes itself as a parameter for checking if a slice is valid on resizing we do not compare the slice it itself
    checkValidSlice(x,y,w,h,noCheckIndex=null){
        
        //Check if width and height are greater than 0
        if(w == 0 || h == 0){
            return false;
        }

       
        //Convert Slice to a tl Slice
        let tlSlice = this.makeTopLeftSlice(x,y,w,h)
        let sliceCoords = this.sliceToCoordinates(tlSlice[0],tlSlice[1],tlSlice[2],tlSlice[3]);

        for(let i = 0; i < this.sliceList.length; i++){
            if(i != noCheckIndex){
                let msCoords = this.sliceToCoordinates(this.sliceList[i].slice[0],this.sliceList[i].slice[1],this.sliceList[i].slice[2],this.sliceList[i].slice[3]);

                //MS left Side check
                let msL = this.isPointBetweenLines(msCoords.X0,sliceCoords.X0,sliceCoords.X1) && ( this.isPointBetweenLines(sliceCoords.Y0,msCoords.Y0,msCoords.Y1) || this.isPointBetweenLines(sliceCoords.Y1,msCoords.Y0,msCoords.Y1));
                //MS Right Side check
                let msR = this.isPointBetweenLines(msCoords.X1,sliceCoords.X0,sliceCoords.X1) && ( this.isPointBetweenLines(sliceCoords.Y0,msCoords.Y0,msCoords.Y1) || this.isPointBetweenLines(sliceCoords.Y1,msCoords.Y0,msCoords.Y1));
                //MS Top Side check
                let msT = this.isPointBetweenLines(msCoords.Y0,sliceCoords.Y0,sliceCoords.Y1) && ( this.isPointBetweenLines(sliceCoords.X0,msCoords.X0,msCoords.X1) || this.isPointBetweenLines(sliceCoords.X1,msCoords.X0,msCoords.X1));
                //MS Bottom Side check
                let msB = this.isPointBetweenLines(msCoords.Y1,sliceCoords.Y0,sliceCoords.Y1) && ( this.isPointBetweenLines(sliceCoords.X0,msCoords.X0,msCoords.X1) || this.isPointBetweenLines(sliceCoords.X1,msCoords.X0,msCoords.X1));

                if(msL || msR || msT || msB){
                    // console.log("Invalid Slice - Intersecting with existing slice");
                    return false;
                }



                // Check if 2 slices have same X0 and X1 or Y0 and Y1 and intersect
                // If X0 and X1 match and only one Y value is between them that slice is not valid
                // If Y0 and Y1 match and only one X value is between them that slice is not valid
                // If X0 and X1 or Y0 and Y1 match and both values other values are inbetween then it is a valid slice becasue we are splitting
                // This is why we use an exlusive in the second half
                let equalHorizInter = (sliceCoords.Y0 == msCoords.Y0) && (sliceCoords.Y1 == msCoords.Y1) && ( (this.isPointBetweenLines(sliceCoords.X0,msCoords.X0,msCoords.X1) && !this.isPointBetweenLines(sliceCoords.X1,msCoords.X0,msCoords.X1)) || (!this.isPointBetweenLines(sliceCoords.X0,msCoords.X0,msCoords.X1) && this.isPointBetweenLines(sliceCoords.X1,msCoords.X0,msCoords.X1)));
                let equalVertInter =  (sliceCoords.X0 == msCoords.X0) && (sliceCoords.X1 == msCoords.X1) && ( (this.isPointBetweenLines(sliceCoords.Y0,msCoords.Y0,msCoords.Y1) && !this.isPointBetweenLines(sliceCoords.Y1,msCoords.Y0,msCoords.Y1)) || (!this.isPointBetweenLines(sliceCoords.Y0,msCoords.Y0,msCoords.Y1) && this.isPointBetweenLines(sliceCoords.Y1,msCoords.Y0,msCoords.Y1)) );
            
                // These checks are for the case where a slice was marked invalid becasue X0 X1 were equal and Y0 or Y1 was in between
                // However if the other Y0 or Y1 that not inbetween in on the MS edge(equal to is MS Y0 or Y1) then it could be
                //  a valid subslice
                if(equalVertInter){
                    if( (sliceCoords.Y0 == msCoords.Y0 || sliceCoords.Y1 == msCoords.Y1) ){
                        equalVertInter = false;
                    }
                }

                if(equalHorizInter){
                    if( (sliceCoords.X0 == msCoords.X0 || sliceCoords.X1 == msCoords.X1) ){
                        equalHorizInter = false;
                    }
                }

                if(equalHorizInter || equalVertInter){
                    // console.log("Invalid Slice - Equal Slices overlapping");
                    return false;
                }

                // // Check if a slice exists at a y value and another slice is being made at the same y value the height have to be eqaul
                // if( (this.isPointBetweenLines(sliceCoords.Y0,msCoords.Y0,msCoords.Y1)) || (this.isPointBetweenLines(sliceCoords.Y1,msCoords.Y0,msCoords.Y1)) ){
                //     return false;
                // }

                //Check if slice is inside MS if so make sure it occupies 100% of width or height
                // If Slice is inside MS
                if(sliceCoords.X0 >= msCoords.X0 && sliceCoords.Y0 >= msCoords.Y0 && sliceCoords.X1 <= msCoords.X1 && sliceCoords.Y1 <= msCoords.Y1){
                    // If Width or height is equal to MS w or height and width and height are both less than MS w and height
                    if((tlSlice[2] == this.sliceList[i].slice[2] || tlSlice[3] == this.sliceList[i].slice[3]) && (tlSlice[2] <= this.sliceList[i].slice[2] && tlSlice[3] <= this.sliceList[i].slice[3])){
                        // Mark Slice to split
                        this.splitSliceIndex = i;
                        // console.log("SPLITTING Index: " + i);
                    }else{
                        this.splitSliceIndex = null;
                        // console.log("Invalid Slice - Non valid slice split");
                        return false;
                    }
                }

                // Check if any ms are inside of the slice if so the slice is invalid
                // This check also solves trying to make a slice that already exists
                if(msCoords.X0 >= sliceCoords.X0 && msCoords.Y0 >= sliceCoords.Y0 && msCoords.X1 <= sliceCoords.X1 && msCoords.Y1 <= sliceCoords.Y1){
                    // console.log("Invalid Slice - Slices inside of this one");
                    return false;
                }

            }
        }

        return true;
    }

    //This function takes a point and checks which master slice line is closest to it
    checkClosestSliceLine(x,y,index=null){

        let closestSliceLine = {lineX:null, lineY:null, distX:null,distY:null};
        for(let i=0; i<this.sliceList.length;i++){
        if(index == null || i != index){
            let msCoord = this.sliceToCoordinates(this.sliceList[i].slice[0],this.sliceList[i].slice[1],this.sliceList[i].slice[2],this.sliceList[i].slice[3]);
            // Check horizontal lines
            let leftLineDist = Math.abs(x - msCoord.X0);
            let rightLineDist = Math.abs(x - msCoord.X1);
    
            if(leftLineDist < this.edgeTolerance){
                if(closestSliceLine.distX == null || leftLineDist < closestSliceLine.distX){
                    closestSliceLine.lineX = msCoord.X0;
                    closestSliceLine.distX = leftLineDist;
                }
            }
            if(rightLineDist < this.edgeTolerance){
                if(closestSliceLine.distX == null || rightLineDist < closestSliceLine.distX){
                    closestSliceLine.lineX = msCoord.X1;
                    closestSliceLine.distX = rightLineDist;
                }
            }
    
            // Check vertical lines
            let topLineDist = Math.abs(y - msCoord.Y0);
            let botLineDist = Math.abs(y - msCoord.Y1);
            //We don't have to do teh distance check from above here becasue we want it happening horizontaly
            if(topLineDist < this.edgeTolerance){
                if(closestSliceLine.distY == null || topLineDist < closestSliceLine.distY){
                    closestSliceLine.lineY = msCoord.Y0;
                    closestSliceLine.distY = topLineDist;
                }
            }
            if(botLineDist < this.edgeTolerance){
                if(closestSliceLine.distY == null || botLineDist < closestSliceLine.distY){
                    closestSliceLine.lineY = msCoord.Y1;
                    closestSliceLine.distY = botLineDist;
                }
            }
        }
        }
        return closestSliceLine;
    }

    // This function takes a slice when its being created and checks if the width and height should
    // be snapped to the image edges or any other slice edges
    checkSliceSnaps(x,y,w,h){
        // Final variabled to return
        let snappedX = x;
        let snappedY = y;
        let snappedW = w;
        let snappedH = h;
        // Convert slice to two coordinates
        let currSliceCoords = this.sliceToCoordinates(x,y,w,h);
        // This is where we set any pink snap lines we would like to draw so the user knows the slice is perfectly inline
        this.snapLines = {x: null, y: null , m: null, t: null, r: null, l: null, b: null};
    
    
        // Check if slice width and height is out of bounds for slices origonating from all corners
        // Another option is to conver the slice to a slice staring from a top left corner then do one check
    
        //TL corner
        if(w >= 0 && h >= 0){
            //Check if Width or height is past image edge
            if(w > (this.image.width - snappedX - this.edgeTolerance)){
                w = this.image.width - snappedX;
                snappedW = w;
                this.snapLines.r = true;
            }
            if(h > (this.image.height - snappedY - this.edgeTolerance)){
                h = this.image.height - snappedY;
                snappedH = h;
                this.snapLines.b = true;
            }
        }
    
        // TR corner
        if(w <= 0 && h >= 0){
            //Check if Width or height is past image edge
            if(w < (0 - snappedX + this.edgeTolerance)){
                w = 0 - snappedX;
                snappedW = w;
                this.snapLines.l = true;
            }
            if(h > (this.image.height - snappedY - this.edgeTolerance)){
                h = this.image.height - snappedY;
                snappedH = h;
                this.snapLines.b = true;
            }
        }
    
        // BL corner
        if(w >= 0 && h <= 0){
            //Check if Width or height is past image edge
            if(w > (this.image.width - snappedX - this.edgeTolerance)){
                w = this.image.width - snappedX;
                snappedW = w;
                this.snapLines.r = true;
            }
            if(h < (0 - snappedY + this.edgeTolerance)){
                h = 0 - snappedY;
                snappedH = h;
                this.snapLines.t = true;
            }
        }
    
        // BR corner
        if(w <= 0 && h <= 0){
            //Check if Width or height is past image edge
            if(w < (0 - snappedX + this.edgeTolerance)){
                w = 0 - snappedX;
                snappedW = w;
                this.snapLines.l = true;
            }
            if(h < (0 - snappedY + this.edgeTolerance)){
                h = 0 - snappedY;
                snappedH = h;
                this.snapLines.t = true;
            }
        }
    
        // Check Width and height compared to other slices. If they are withing edge tolerance snap slices inline with each other
        let snappedDrag = this.checkClosestSliceLine(currSliceCoords.X1,currSliceCoords.Y1);
    
        if(snappedDrag.lineX != null && snappedX - snappedW != 0 && snappedX + snappedW != this.image.width){
            snappedW = snappedDrag.lineX - snappedX;
            this.snapLines.x = snappedDrag.lineX;
        }
        if(snappedDrag.lineY != null && snappedY - snappedH != 0 && snappedY + snappedH != this.image.height){
            snappedH = snappedDrag.lineY - snappedY;
            this.snapLines.y = snappedDrag.lineY;
        }

        // Check y values of clice compared to others. If y0 or y1 is equal heights must also be equal
        // let sliceCoords = this.sliceToCoordinates(snappedX,snappedY,snappedW,snappedH);

        // for(let i = 0; i < this.sliceList.length; i++){
        //     if(snappedY == this.sliceList[i].slice[1] && snappedH > 0){
        //         snappedH = this.sliceList[i].slice[3];
        //     }
        //     else if(snappedY == (this.sliceList[i].slice[1] + this.sliceList[i].slice[3]) && snappedH < 0){
        //         snappedH = this.sliceList[i].slice[3] * -1;
        //     }
        // }
    
        
        //check if in middle of image
        if(currSliceCoords.X1 < this.image.width/2 + this.edgeTolerance && currSliceCoords.X1 > this.image.width/2 - this.edgeTolerance){
            snappedW = this.image.width/2 - x;
            this.snapLines.m = true;
        }
    
        // Check staring position snap lines
        //check if in on left image edge
        if(currSliceCoords.X0 == 0){
            this.snapLines.l = true;
        }
        //check if in on top image edge
        if(currSliceCoords.Y0 == 0){
            this.snapLines.t = true;
        }
        //check if in on right image edge
        if(currSliceCoords.X0 == this.image.width){
            this.snapLines.r = true;
        }
        //check if in on bottom image edge
        if(currSliceCoords.Y0 == this.image.height){
            this.snapLines.b = true;
        }
        if(currSliceCoords.X0 == this.image.width/2){
            this.snapLines.m = true;
        }
    
        return [snappedX,snappedY,snappedW,snappedH];
        
    }

    // This function checks if the whole png is covered by slices
    checkSliceArea(){
        let pngArea = this.image.width * this.image.height;
        let totalSliceArea = 0;
        for(let i=0; i < this.sliceList.length; i++){
            totalSliceArea = totalSliceArea + (this.sliceList[i].slice[2] * this.sliceList[i].slice[3]);
        }

        if(pngArea == totalSliceArea){
            return true;
        }

        return false;
    }

    // RENDER FUNCTIONS

    // This function will render all the slices stored in the array when called 
    // There is also a optional argunemnt to send an addition slice to be rendered
    // This additional argument is used for the current slice while it is being made
    // and is not saved in our array of slices
    renderSlices(){
        //Clear slice canvas
        this.ctx_s.clearRect(0,0,this.ctx_s.canvas.width,this.ctx_s.canvas.height);
        //Draw every slice we have stored
        for(const slice of this.sliceList){
            let scaledSlice = this.imageSizeSliceToScaleSlice(slice.slice[0],slice.slice[1],slice.slice[2],slice.slice[3]);
            if(this.selectedSliceIndex != null && this.selectedSliceIndex == this.sliceList.indexOf(slice)){
                this.drawRect(scaledSlice[0],scaledSlice[1],scaledSlice[2],scaledSlice[3],"selected");
            }else{
                this.drawRect(scaledSlice[0],scaledSlice[1],scaledSlice[2],scaledSlice[3]);
            }
        }
    
        //draw extra slice if there is one
        if(this.currentSlice != null){
            let scaledSlice = this.imageSizeSliceToScaleSlice(this.currentSlice[0],this.currentSlice[1],this.currentSlice[2],this.currentSlice[3]);
            if(this.saveSlice == false){
                this.drawRect(scaledSlice[0],scaledSlice[1],scaledSlice[2],scaledSlice[3],"invalid");
            }else{
                this.drawRect(scaledSlice[0],scaledSlice[1],scaledSlice[2],scaledSlice[3]);
            }
        }
    
        if(this.snapLines.x != null || this.snapLines.y != null || this.snapLines.m || this.snapLines.t || this.snapLines.r || this.snapLines.b || this.snapLines.l){
            this.drawSnapLines();
        }

        //Draw Selected slice again last so the blue lines are on top
        if(this.selectedSliceIndex != null){
            let selectedSlice = this.sliceList[this.selectedSliceIndex];
            let scaledSlice = this.imageSizeSliceToScaleSlice(selectedSlice.slice[0],selectedSlice.slice[1],selectedSlice.slice[2],selectedSlice.slice[3]);
            this.drawRect(scaledSlice[0],scaledSlice[1],scaledSlice[2],scaledSlice[3],"selected");
        }
    }

    // This function is called when we want to draw a rectagle/slice on
    // our slice canvas.
    drawRect(x,y,width,height,color = null) { 
        this.ctx_s.beginPath(); 
        this.ctx_s.rect(x, y, width, height);
        this.ctx_s.lineWidth = 2;
        if(color == "selected"){
            if(this.sliceColor == "#FFA500"){
                this.ctx_s.strokeStyle = "#0096FF";
            }else{
                this.ctx_s.strokeStyle = "#FFA500";
            }
        }else if(color == "invalid"){
            this.ctx_s.strokeStyle = "red";
        }else{
            this.ctx_s.strokeStyle = this.sliceColor;
        }
        this.ctx_s.setLineDash([3,2]);
        this.ctx_s.stroke();
    }


    // This function Renders the pinks snap lines during slice creation 
    drawSnapLines(){

        this.ctx_s.setLineDash([2,2]);
        this.ctx_s.lineWidth = 3;
        this.ctx_s.strokeStyle = '#ff69b4';
    
        if(this.snapLines.x != null){
            this.ctx_s.beginPath();
            this.ctx_s.moveTo(this.image.xPos + (this.snapLines.x*this.image.masterScale), this.image.yPos);
            this.ctx_s.lineTo(this.image.xPos + (this.snapLines.x*this.image.masterScale), this.image.yPos + this.image.height*this.image.masterScale);
            this.ctx_s.stroke(); 
        }
        if(this.snapLines.y != null){
            this.ctx_s.beginPath();
            this.ctx_s.moveTo(this.image.xPos, this.image.yPos + (this.snapLines.y * this.image.masterScale));
            this.ctx_s.lineTo(this.image.xPos + this.image.width*this.image.masterScale, this.image.yPos + (this.snapLines.y * this.image.masterScale));
            this.ctx_s.stroke(); 
        }
        if(this.snapLines.m){
            this.ctx_s.beginPath();
            this.ctx_s.moveTo(this.image.xPos + (this.image.width*this.image.masterScale)/2, this.image.yPos);
            this.ctx_s.lineTo(this.image.xPos + (this.image.width*this.image.masterScale)/2, this.image.yPos + this.image.height*this.image.masterScale);
            this.ctx_s.stroke(); 
        }
        if(this.snapLines.l){
            this.ctx_s.beginPath();
            this.ctx_s.moveTo(this.image.xPos, this.image.yPos);
            this.ctx_s.lineTo(this.image.xPos, this.image.yPos + this.image.height*this.image.masterScale);
            this.ctx_s.stroke(); 
        }
        if(this.snapLines.t){
            this.ctx_s.beginPath();
            this.ctx_s.moveTo(this.image.xPos, this.image.yPos);
            this.ctx_s.lineTo(this.image.xPos + this.image.width*this.image.masterScale, this.image.yPos);
            this.ctx_s.stroke(); 
        }
        if(this.snapLines.b){
            this.ctx_s.beginPath();
            this.ctx_s.moveTo(this.image.xPos, this.image.yPos + this.image.height*this.image.masterScale);
            this.ctx_s.lineTo(this.image.xPos + this.image.width*this.image.masterScale, this.image.yPos + this.image.height*this.image.masterScale);
            this.ctx_s.stroke(); 
        }
        if(this.snapLines.r){
            this.ctx_s.beginPath();
            this.ctx_s.moveTo(this.image.xPos + this.image.width*this.image.masterScale, this.image.yPos);
            this.ctx_s.lineTo(this.image.xPos + this.image.width*this.image.masterScale, this.image.yPos + this.image.height*this.image.masterScale);
            this.ctx_s.stroke(); 
        }
    }


    // TOOL FUNCTIONS

    // This functions reset the varibales and clears the canvas
    resetVariables(){
        this.sliceList = [];
        this.selectedSliceIndex = null;

        this.currentSlice = null;
        this.snapLines = {x: null, y: null , m: null, t: null, r: null, l: null, b: null};
        this.saveSlice = null;
        this.splitSliceIndex = null;

        this.hoveringSliceEdge = false;
        this.sliceToResize = {index: null, side: null};

        this.ctx_s.clearRect(0,0,this.ctx_s.canvas.width,this.ctx_s.canvas.height);
    }

    // This function takes 3 points and determines if the first point is between the second two
    isPointBetweenLines(point,lineA,lineB){
        if(point > lineA && point < lineB){
            return true;
        }

        return false;
    }

    // This function handles when we grab a slice edge and drag to resize
    resizeSlice(event){
        let mouseX = event.originalEvent.layerX;
        let mouseY = event.originalEvent.layerY;
    
        //The index of the slice were working on in our master slice array
        let index = this.sliceToResize.index;

        let origSlice = this.sliceList[index].slice;
    
        let x = this.sliceList[index].slice[0]; 
        let y = this.sliceList[index].slice[1]; 
        let w = this.sliceList[index].slice[2]; 
        let h = this.sliceList[index].slice[3]; 
    
        this.snapLines = {x: null, y: null , m: null, t: null, r: null, l: null, b: null};
    
        //Resizing Width and height
        if(this.sliceToResize.side == 'b'){
            let newHeight = Math.round((mouseY - ((y*this.image.masterScale) + this.image.yPos)) / this.image.masterScale);
            let snapHeight = this.checkClosestSliceLine(x+w,newHeight+y,index);
        
            if(snapHeight.lineY != null){
                newHeight = snapHeight.lineY-y;
                this.snapLines.y = snapHeight.lineY;
            }
            if(newHeight > 0 && (newHeight + y) <= this.image.height){
                this.sliceList[index].slice = [x,y,w,newHeight];
            }
            else if(newHeight > 0 && (newHeight + y) >= this.image.height){
                this.sliceList[index].slice = [x,y,w,this.image.height-y];
            }else if(newHeight < 0 || (newHeight + y) <= y){
                this.sliceList[index].slice = [x,y,w,0];
            }
        }

        if(this.sliceToResize.side == 'r'){
            let newWidth = Math.round((mouseX - ((x*this.image.masterScale) + this.image.xPos)) / this.image.masterScale);
            let snapWidth = this.checkClosestSliceLine(x+newWidth,y+h,index);
 
            if(snapWidth.lineX != null){
                newWidth = snapWidth.lineX-x;
                this.snapLines.x = snapWidth.lineX;
            }
            if(newWidth > 0 && (newWidth + x) <= this.image.width){
                this.sliceList[index].slice = [x,y,newWidth,h];
            }else if(newWidth > 0 && (newWidth + x) >= this.image.width){
                this.sliceList[index].slice = [x,y,this.image.width-x,h];
            }else if(newWidth < 0 || (newWidth + x) <= x){
                this.sliceList[index].slice = [x,y,0,h];
            }
        }
    
        //Moving x and y
        if(this.sliceToResize.side == 't'){
            let distMoved = Math.round(((mouseY - ((y*this.image.masterScale) + this.image.yPos))) / this.image.masterScale);
            let newY = distMoved + y;
            let newH = h - distMoved;

            let snapY = this.checkClosestSliceLine(x,newY,index);
            if(snapY.lineY != null){
                newY = snapY.lineY;
                newH = y + h - newY;
                this.snapLines.y = snapY.lineY;
            }
            
            if(newY > 0 && newH >= 0){
                this.sliceList[index].slice = [x,newY,w,newH];
            }else if(newH <= 0){
                this.sliceList[index].slice = [x,y+h,w,0];
            }
            else if(newY < 0){
                this.sliceList[index].slice = [x,0,w,h+y];
            }
        }
        if(this.sliceToResize.side == 'l'){
            let distMoved = Math.round(((mouseX - ((x*this.image.masterScale) + this.image.xPos))) / this.image.masterScale)
            let newX = distMoved + x;
            let newW = w - distMoved;

            let snapX = this.checkClosestSliceLine(newX,y,index);
            if(snapX.lineX != null){
                newX = snapX.lineX;
                newW = x + w - newX;
                this.snapLines.x = snapX.lineX;
            }
            
            if(newX > 0 && newW >= 0){
                this.sliceList[index].slice = [newX,y,newW,h];
            }else if(newW <= 0){
                this.sliceList[index].slice = [x+w,y,0,h];
            }
            else if(newX < 0){
                this.sliceList[index].slice = [0,y,w+x,h];
            }
        }
        
        
        if(!this.checkValidSlice(this.sliceList[index].slice[0],this.sliceList[index].slice[1],this.sliceList[index].slice[2],this.sliceList[index].slice[3],index)){
            this.sliceList[index].slice = origSlice;
        }

        this.renderSlices();
    }
  
  

    // This function checks if out mouse is currently hovering over a slice edge
    // If it is we then change the cursor
    mouseSliceHover(mouseX,mouseY){
        //How far mouse is from line while still hovering
        let tolerance = this.edgeTolerance * this.image.masterScale;
        if(this.image.masterScale < 3){
            tolerance = this.edgeTolerance * this.image.masterScale;
        }else{
            tolerance = this.edgeTolerance * this.image.masterScale;
        }
        
        this.hoveringSliceEdge = false;

        //Go through stored slices and check if mouse is hovering a slice side
        for(let j=0;j<this.sliceList.length;j++){
            
            let lx0 = this.sliceList[j].slice[0] * this.image.masterScale + this.image.xPos;
            let ly0 = this.sliceList[j].slice[1] * this.image.masterScale + this.image.yPos;
            let lx1 = this.sliceList[j].slice[2] * this.image.masterScale + lx0;
            let ly1 = this.sliceList[j].slice[3] * this.image.masterScale + ly0;
        
            // Check if mouse is inside slice for all slices
            let insideSlice = (mouseX>=lx0+tolerance) && (mouseX<=lx1-tolerance) && (mouseY>=ly0+tolerance) && (mouseY<=ly1-tolerance);
        
            if(insideSlice){
                this.sliceHoverIndex = j;
                if(this.selectedSliceIndex == j){
                    $(".canvas-container")[0].style.cursor = "default";
                }else{
                    $(".canvas-container")[0].style.cursor = "pointer";
                }
                break;
            }else{
                this.sliceHoverIndex = null;
                $(".canvas-container")[0].style.cursor = "crosshair";
            }

            
        }

        if(this.selectedSliceIndex != null){
            let sidePoints = {t:null,r:null,b:null,l:null};

            let lx0 = this.sliceList[this.selectedSliceIndex].slice[0] * this.image.masterScale + this.image.xPos;
            let ly0 = this.sliceList[this.selectedSliceIndex].slice[1] * this.image.masterScale + this.image.yPos;
            let lx1 = this.sliceList[this.selectedSliceIndex].slice[2] * this.image.masterScale + lx0;
            let ly1 = this.sliceList[this.selectedSliceIndex].slice[3] * this.image.masterScale + ly0;

            //Limit check to line + tolerance otherwirse the line it checks will be infinite
            let inSliceEdge = !(mouseX<lx0-tolerance) && !(mouseX>lx1+tolerance) && !(mouseY<ly0-tolerance) && !(mouseY>ly1+tolerance);
                
            if(inSliceEdge){
                
                //Get line points for all four sides of slice
                sidePoints.t = this.linepointNearestMouse({x0:lx0,y0:ly0,x1:lx1,y1:ly0},mouseX,mouseY);
                sidePoints.r = this.linepointNearestMouse({x0:lx1,y0:ly0,x1:lx1,y1:ly1},mouseX,mouseY);
                sidePoints.b = this.linepointNearestMouse({x0:lx0,y0:ly1,x1:lx1,y1:ly1},mouseX,mouseY);
                sidePoints.l = this.linepointNearestMouse({x0:lx0,y0:ly0,x1:lx0,y1:ly1},mouseX,mouseY);
        
                //check each linepointN
                for(const side in sidePoints){
                    let linepointX = sidePoints[side].x;
                    let linepointY = sidePoints[side].y;
                    var dx=mouseX-sidePoints[side].x;
                    var dy=mouseY-sidePoints[side].y;
                    var distance=Math.abs(Math.sqrt(dx*dx+dy*dy));
            
                    let cornerCheck = this.sliceCornerCheck(linepointX,linepointY, {X0:lx0,Y0:ly0,X1:lx1,Y1:ly1});
                    
                    if(distance<tolerance && cornerCheck==null){
                        if(side == "t" || side == "b"){
                            $(".canvas-container")[0].style.cursor = "ns-resize";
                        }else{
                            $(".canvas-container")[0].style.cursor = "ew-resize";
                        }
                        this.hoveringSliceEdge = true;
                        this.sliceToResize["index"] = this.selectedSliceIndex;
                        this.sliceToResize["side"] = side; 
                    }
                }
            }
        }

        if(this.sliceList.length<=0){
            this.sliceHoverIndex = null;
            $(".canvas-container")[0].style.cursor = "crosshair";
        }
    }

    // Given a point x y and slice coordinates x0y0x1y1. This function determines if the 
    // point is within tolerance of the slice corner
    sliceCornerCheck(pointX,pointY,sliceCoords){
        let cornerTolerance = this.edgeTolerance * this.image.masterScale;
    
        let insideTL = (pointX < sliceCoords.X0 + cornerTolerance && pointY < sliceCoords.Y0 + cornerTolerance) && (pointX > sliceCoords.X0 - cornerTolerance && pointY > sliceCoords.Y0 - cornerTolerance);
        let insideTR = (pointX > sliceCoords.X1 - cornerTolerance && pointY < sliceCoords.Y0 + cornerTolerance) && (pointX < sliceCoords.X1 + cornerTolerance && pointY > sliceCoords.Y0 - cornerTolerance);  
        let insideBL = (pointX < sliceCoords.X0 + cornerTolerance && pointY > sliceCoords.Y1 - cornerTolerance) && (pointX > sliceCoords.X0 - cornerTolerance && pointY < sliceCoords.Y1 + cornerTolerance);  
        let insideBR = (pointX > sliceCoords.X1 - cornerTolerance && pointY > sliceCoords.Y1 - cornerTolerance) && (pointX < sliceCoords.X1 + cornerTolerance && pointY < sliceCoords.Y1 + cornerTolerance);  
    
        if(insideTL){
        //return [sliceCoords.X0,sliceCoords.Y0];
        return {corner: 'tl', X0:sliceCoords.X0, Y0:sliceCoords.Y0};
        }
        if(insideTR){
        // return [sliceCoords.X1,sliceCoords.Y0];
        return {corner: 'tr', X0:sliceCoords.X1, Y0:sliceCoords.Y0};
        }
        if(insideBL){
        // return [sliceCoords.X0,sliceCoords.Y1];
        return {corner: 'bl', X0:sliceCoords.X0, Y0:sliceCoords.Y1};
        }
        if(insideBR){
        // return [sliceCoords.X1,sliceCoords.Y1];
        return {corner: 'br', X0:sliceCoords.X1, Y0:sliceCoords.Y1};
        }
        return null;
    }
    
    // calculate the point on the line that's 
    // nearest to the mouse position
    linepointNearestMouse(line,x,y) {
        let lerp=function(a,b,x){ return(a+x*(b-a)); };
        var dx=line.x1-line.x0;
        var dy=line.y1-line.y0;
        var t=((x-line.x0)*dx+(y-line.y0)*dy)/(dx*dx+dy*dy);
        var lineX=lerp(line.x0, line.x1, t);
        var lineY=lerp(line.y0, line.y1, t);
        return({x:lineX,y:lineY});
    };
  

    // This function saves the current slice
    saveCurrentSlice(){
        // Covert slice to a top left slice
        let tlSlice = this.makeTopLeftSlice(this.currentSlice[0],this.currentSlice[1],this.currentSlice[2],this.currentSlice[3]);

        //If this slice is a sublice of a master slice split the master slice
        if(this.splitSliceIndex != null){
            //Check if subslice is full width or height
            if(tlSlice[2] == this.sliceList[this.splitSliceIndex].slice[2]){
                //FULL WIDTH
                //Check if slice starts in left corner
                if(tlSlice[1] == this.sliceList[this.splitSliceIndex].slice[1]){
                    // Starts in left corner move y and adjust height
                    this.sliceList[this.splitSliceIndex].slice[1] = this.sliceList[this.splitSliceIndex].slice[1] + tlSlice[3];
                    this.sliceList[this.splitSliceIndex].slice[3] = this.sliceList[this.splitSliceIndex].slice[3] - tlSlice[3];
                }else{
                    //Check if slice splits master slice into 2 or three slices
                    if((tlSlice[1] - this.sliceList[this.splitSliceIndex].slice[1]) + tlSlice[3] != this.sliceList[this.splitSliceIndex].slice[3]){
                        // Split into 3
                        //Adjust height
                        let origHeight = this.sliceList[this.splitSliceIndex].slice[3];
                        this.sliceList[this.splitSliceIndex].slice[3] = tlSlice[1] - this.sliceList[this.splitSliceIndex].slice[1];
                        //Make new slice
                        let thirdSlX =  this.sliceList[this.splitSliceIndex].slice[0];
                        let thirdSlY =  this.sliceList[this.splitSliceIndex].slice[1] + this.sliceList[this.splitSliceIndex].slice[3] + tlSlice[3];
                        let thirdSlW =  this.sliceList[this.splitSliceIndex].slice[2];
                        let thirdSlH =  (origHeight - this.sliceList[this.splitSliceIndex].slice[3]) - tlSlice[3];
                        //Add new slice to sliceList
                        this.sliceList.unshift({slice: [thirdSlX,thirdSlY,thirdSlW,thirdSlH], link: null, color: null, alt: null});
                    }else{
                        // Adjust height
                        this.sliceList[this.splitSliceIndex].slice[3] = this.sliceList[this.splitSliceIndex].slice[3] - tlSlice[3];
                    }
                }
            }else{
                //FULL HEIGHT
                //Check if slice starts in left corner
                if(tlSlice[0] == this.sliceList[this.splitSliceIndex].slice[0]){
                    // Starts in left corner move x and adjust width
                    this.sliceList[this.splitSliceIndex].slice[0] = this.sliceList[this.splitSliceIndex].slice[0] + tlSlice[2];
                    this.sliceList[this.splitSliceIndex].slice[2] = this.sliceList[this.splitSliceIndex].slice[2] - tlSlice[2];
                }else{
                    //Check if slice splits master slice into 2 or three slices
                    if((tlSlice[0] - this.sliceList[this.splitSliceIndex].slice[0]) + tlSlice[2] != this.sliceList[this.splitSliceIndex].slice[2]){
                        // Split into 3
                        //Adjust width
                        let origWidth = this.sliceList[this.splitSliceIndex].slice[2];
                        this.sliceList[this.splitSliceIndex].slice[2] = tlSlice[0] - this.sliceList[this.splitSliceIndex].slice[0];
                        //Make new slice
                        let thirdSlX =  this.sliceList[this.splitSliceIndex].slice[0] + this.sliceList[this.splitSliceIndex].slice[2] + tlSlice[2];
                        let thirdSlY =  this.sliceList[this.splitSliceIndex].slice[1];
                        let thirdSlW =  (origWidth - this.sliceList[this.splitSliceIndex].slice[2]) - tlSlice[2];
                        let thirdSlH =  this.sliceList[this.splitSliceIndex].slice[3];;
                        //Add new slice to sliceList
                        this.sliceList.unshift({slice: [thirdSlX,thirdSlY,thirdSlW,thirdSlH], link: null, color: null, alt: null});
                    }else{
                        // Adjust Width
                        this.sliceList[this.splitSliceIndex].slice[2] = this.sliceList[this.splitSliceIndex].slice[2] - tlSlice[2];
                    }
                }
            }
            this.splitSliceIndex = null;
        }


        //Save the slice
        this.sliceList.unshift({slice: tlSlice, link: null, color: null, alt: null});

        // Reorder the slicelist
        //this.orderSlices();
    }

    // This function takes a slice and converts it to a slice originating from the top left corner
    // This makes future checks more efficient by not having to check every orientation
    makeTopLeftSlice(x,y,w,h){
        x = Math.round(x); 
        y = Math.round(y); 
        w = Math.round(w);
        h = Math.round(h);
    
        // Bottom Right slice
        if(w < 0 && h < 0){
        let tlX = x + w;
        let tlY = y + h;
        let tlW = Math.abs(w);
        let tlH = Math.abs(h);
        return [tlX,tlY,tlW,tlH]
        }
    
        // Bottom Left slice
        if(w > 0 && h < 0){
        let tlX = x;
        let tlY = y + h;
        let tlW = w;
        let tlH = Math.abs(h);
        return [tlX,tlY,tlW,tlH]
        }
    
        // Top Right slice
        if(w < 0 && h > 0){
        let tlX = x + w;
        let tlY = y;
        let tlW = Math.abs(w);
        let tlH = h;
        return [tlX,tlY,tlW,tlH]
        }
    
        return [x,y,w,h]
    }

    // This fucntion takes a scaled slice on canvas and converts it to the image positon, width and height
    scaledSliceToImageSize(x,y,w,h){
        x = Math.round((x - this.image.xPos) / this.image.masterScale);
        y = Math.round((y - this.image.yPos) / this.image.masterScale);
        w = Math.round(w / this.image.masterScale);
        h = Math.round(h / this.image.masterScale);
    
        return [x,y,w,h];
    }

    // This function takes a slice and converts the width and height to a second coordinate
    sliceToCoordinates(x,y,w,h){
        return {X0: x, Y0: y, X1: (x + w), Y1: (y + h)}
    }

    // This function takes an image position width and height and converts it to Canvas scale and position
    imageSizeSliceToScaleSlice(x,y,w,h){
        let scalex = (x * this.image.masterScale) + this.image.xPos;
        let scaley = (y * this.image.masterScale) + this.image.yPos;
        let scalew = (w * this.image.masterScale);
        let scaleh = (h * this.image.masterScale);
    
        return [scalex,scaley,scalew,scaleh];
    }

    updateEdgeTolerance(){
        if(this.image.masterScale < 3){
            this.edgeTolerance = (15 / this.image.masterScale);
        }else{
            this.edgeTolerance = (7 / this.image.masterScale);
        }
    }
     
}