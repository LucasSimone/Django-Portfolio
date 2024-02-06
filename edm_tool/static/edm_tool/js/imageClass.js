export class MasterImage{

    imgClass = new Image();
    width = 0;
    height = 0;
    masterScale = 1;
    aspectRatio = 0;
    xPos = 0;
    yPos = 0;

    gridLineColor = '#FFFFFF';

    imageCanvas = null;
    c = null;
    ctx = null;

    dragStartMouseX = null;
    dragStartMouseY = null;
    dragStartImgPosX = null;
    dragStartImgPosY = null;

    constructor(){
        this.imageCanvas = document.querySelector(".image-layer");
        this.c = this.imageCanvas;
        this.ctx = this.c.getContext("2d");

        // Image canvas size
        this.ctx.canvas.width  = $('.canvas-container').width();
        this.ctx.canvas.height  = $('.canvas-container').height();
    }

    resetVariables(){
        this.imgClass = new Image();
        this.width = 0;
        this.height = 0;
        this.masterScale = 1;
        this.aspectRatio = 0;
        this.xPos = 0;
        this.yPos = 0;
    
        this.dragStartMouseX = null;
        this.dragStartMouseY = null;
        this.dragStartImgPosX = null;
        this.dragStartImgPosY = null;

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    // This is the inital render function for the image it sets the variables needed and displays the image to screen
    initalRender(){        
        this.width = this.imgClass.width;
        this.height = this.imgClass.height;
        if(this.width != 700){
            alert("Image width is " + this.width + "px wide");

        }
        
        this.aspectRatio = this.imgClass.width/this.imgClass.height;
        
        let renderHeight = $('.canvas-container').height() - 100;
        let renderWidth = this.aspectRatio * renderHeight;
        
        this.masterScale = renderWidth / this.width;
        
        let posMiddle = $('.canvas-container').width() / 2 - renderWidth / 2;
        
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(this.imgClass, posMiddle, 50, renderWidth, renderHeight); 
        
        this.xPos = posMiddle;
        this.yPos = 50;
    }

    // This funtion is called when we want to render the Image to the screen. 
    // If no variable is given we will render the image using the master x and y 
    // variables and master scale. If the argument is true we will recenter the image
    // on the screen
    renderImage(centerImage = false){

        this.xPos = Math.round(this.xPos);
        this.yPos = Math.round(this.yPos);
    
        let renderWidth = this.width * this.masterScale;
        let renderHeight = renderWidth / this.aspectRatio;
    
        if(centerImage) { this.xPos = $('.canvas-container').width() / 2 - renderWidth / 2;}
        
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(this.imgClass, this.xPos, this.yPos, renderWidth, renderHeight); 
    
        if(this.masterScale > 3.5){this.drawLines();}
    }

    reRender(recenter = false){
        this.renderImage(recenter);
    }

    // This function draws the white lines the seperate the pixels to screen
    drawLines(){
        //Draw line rows
        for(let i=1;i<this.height;i++){
            let startx = this.xPos;
            let starty = this.yPos + i*this.masterScale;
            let endx = this.xPos + this.width * this.masterScale;
            let endy = this.yPos + i*this.masterScale;
            this.drawLine(startx,starty,endx,endy);
        }
        //Draw line columns
        for(let j=1;j<this.width;j++){
            let startx = this.xPos + j * this.masterScale;
            let starty = this.yPos;
            let endx = this.xPos + j * this.masterScale;
            let endy = this.yPos + this.height * this.masterScale;
            this.drawLine(startx,starty,endx,endy);
        }
    }
    // This function takes in start and end coordinates and draws a white line between them
    drawLine(x,y,x2,y2){
        this.ctx.beginPath();
    
        // place the cursor from the point the line should be started 
        this.ctx.moveTo(x, y);
    
        // draw a line from current cursor position to the provided x,y coordinate
        this.ctx.lineTo(x2, y2);
    
        // set strokecolor
        this.ctx.strokeStyle = this.gridLineColor;
    
        // set lineWidht 
        this.ctx.lineWidth = 0.5;
    
        // add stroke to the line 
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.stroke();
    }

    // This function is called when the right mouse is being held down and moved.
    // It taked the mouse event and uses the initalized variables when the right mouse was clicked 
    // to calculate the distance moved and reflect it in the master x and y of the image
    moveImage(event){
        this.xPos = this.dragStartImgPosX - (this.dragStartMouseX - event.clientX); 
        this.yPos = this.dragStartImgPosY - (this.dragStartMouseY - event.clientY); 
    }

    // This function takes a mouse event from the canvas as well as a scale change
    // The imaged is zoomed then the image is moved so the image pixel under the mouse 
    // is positioned back under the mouse
    zoomOnMouseLocation(event,zoomLevel){

        let imgPixelX = (event.clientX - this.xPos);
        let imgPixelY = (event.clientY - this.yPos);
    
        let scaledImgPixelX = imgPixelX * (this.masterScale + zoomLevel);
        let scaledImgPixelY = imgPixelY * (this.masterScale + zoomLevel);
    
        let offsetX = scaledImgPixelX - imgPixelX * this.masterScale;
        let offsetY = scaledImgPixelY - imgPixelY * this.masterScale;
    
        this.xPos = this.xPos - offsetX/ this.masterScale;
        this.yPos = this.yPos - offsetY/ this.masterScale;
    
        this.masterScale = this.masterScale + zoomLevel;
    }

}