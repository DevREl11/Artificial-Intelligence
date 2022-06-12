// const img = document.getElementById('img');
 
// // Load the model.
// cocoSsd.load(document.getElementById('objectDetectionModel').value).then(model => {
//   // detect objects in the image.
//   model.detect(img).then(predictions => {
//     console.log('Predictions: ', predictions);
//   });
// });
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");  

var analysisCanvas = document.getElementById('tempCanvas');
var tempCanvasCtx = analysisCanvas.getContext("2d");

function webcam_init(){
  this.video = document.getElementById("vid");
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {facingMode: "user",}
  }).then(stream => {
    this.video.srcObject = stream;
    this.video.onloadedmetadata = () => {
      this.video.play();
    };
  });
};
async function predictWithCocoModel() {
  const model = await cocoSsd.load(document.getElementById('objectDetectionModel').value); //Loading the MODEL (model name is coco)
  this.detectFrame(this.video, model);
};
detectFrame = (video, model) => {
  model.detect(video).then(predictions => {
    this.renderPredictions(predictions);
    requestAnimationFrame(() => {
      this.detectFrame(video, model);});
  });
};
renderPredictions = (predictions)=>{
  /*Canvas and canvas context were defined here*/
  canvas.width  = (this.video).width;
  canvas.height = (this.video).height;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);  
  
  // Fonts
  const font = "16px sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";
  ctx.drawImage(this.video, 0, 0, (this.video).width, (this.video).height);
  
  predictions.forEach(prediction => {  
    // Bounding boxes's coordinates and sizes
    const x = prediction.bbox[0];
    const y = prediction.bbox[1];
    const width = prediction.bbox[2];
    const height = prediction.bbox[3];
    // Bounding box style
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 2;
    // Draw the bounding
    ctx.strokeRect(x, y, width, height);

    // Label background
    ctx.fillStyle = "#00FFFF";
    const textWidth = ctx.measureText(prediction.class).width;
    const textHeight = parseInt(font, 10); // base 10
    ctx.fillRect(x-1, y-20, textWidth + 4, textHeight + 4);
    extractDetectedImage(canvas, [prediction.bbox[0], prediction.bbox[1], prediction.bbox[2], prediction.bbox[3]]); 
  });
   
  predictions.forEach(prediction => {
    // Write prediction class names
    const x = prediction.bbox[0];
    const y = prediction.bbox[1];  
    ctx.fillStyle = "#000000";
    ctx.fillText(prediction.class, x, y-20);
  });  
};
function extractDetectedImage(fullCanvas, canvasCoordinates) {
  var imgData = ctx.getImageData(canvasCoordinates[0], canvasCoordinates[1], canvasCoordinates[2], canvasCoordinates[3]);
  // document.getElementById('image_for_analysis').src = 'data:image/png;base64,'+imgData; //fullCanvas.toDataURL();
  tempCanvas.width = canvasCoordinates[0]+canvasCoordinates[2];
  tempCanvas.height = canvasCoordinates[1]+canvasCoordinates[3];
  tempCanvasCtx.putImageData(imgData, canvasCoordinates[0], canvasCoordinates[1]);
  document.getElementById('image_for_analysis').src = analysisCanvas.toDataURL();
};
function ngOnInit(){
  this.webcam_init();
  this.predictWithCocoModel();
};
ngOnInit();