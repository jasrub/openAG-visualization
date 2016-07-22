var gif;
var totalFrames;
var numFrames = 46;

var w=640;
var h=480;

var mainGif;
var smallGif;

var play;
var otherView;

var readingsJson;
var readings;
var recipe;

var currRead;
var textDiv;

var sliderStart;
var sliderEnd;

var date_rectX;
var date_rectY;
var date_rectWidth;
var date_rectHeight;

var recipeLength;
var iconFont;
var icons = {"light": '',
            "humidity": '',
            "temp":''}

var valuesExtended = true;

var mainFont;
var mainFontBold;
var loading;

var recipeReadingsValues = []

function preload() {
  gif_side = loadGif('data/images/camera_side/camera_side.gif');
  gif_top = loadGif('data/images/camera_top/camera_top.gif');

  gif_side.pause();
  gif_top.pause();
  mainGif = gif_side;
  smallGif = gif_top;
  readingsJson = loadJSON('data/readings.json')
  recipe = loadJSON('data/example_recipe.json')
  iconFont = loadFont("fontello.ttf");
  mainFont = loadFont("open-sans/OpenSans-Regular.ttf");
  mainFontBold = loadFont("open-sans/OpenSans-Bold.ttf");
}
function setup() {
  createCanvas(w,h);
  readings = readingsJson.readings;
  recipeLength = recipe.operations[recipe.operations.length-1][0]
  getRecipeReadingsValues()
  currRead  = 0;
  totalFrames = readings.length //numFrames; //gif.totalFrames();
  grid = new Grid(12, // px, top margin
    12, // px, bottom margin
    12, // px, left margin
    12, // px, right margin
    12, // # columns
    3, // px, gutter width
    12 // # rows
  );
  loading = createImg('loading_spinner.gif')
  loadingWidth = grid.colwidth()*2
  loading.style("width", loadingWidth+'px')
  loading.position(width/2-loadingWidth/2, height/2+grid.rowheight()-loadingWidth/2)
  
  otherView = new OtherViewRect();
  play = new PlayButton()
  slider = createSlider(0, numFrames-1, 0)
  sliderStart = grid.margin.left+grid.colwidth()+grid.gutter;
  var sliderWidth = grid.colwidth()*10+grid.gutter*9;
  sliderEnd = sliderStart+sliderWidth;
  slider.position(sliderStart, height-grid.margin.bottom-grid.rowheight()-7);
  slider.style('width', sliderWidth+'px');
  createDivs();
}

function createDivs() {
  // Set date rect size
  date_rectX = map(currRead,0, totalFrames-1, sliderStart, sliderEnd);//grid.margin.left+grid.colwidth()*9+grid.gutter*9
  date_rectY = height-grid.margin.bottom-grid.rowheight()*2
  date_rectWidth = grid.colwidth()*3+grid.gutter*2
  date_rectHeight = grid.rowheight()*1.5;
  
  // Create HTML text div
  textDiv = createDiv(readings[currRead].timestamp+"<br>"+timeString(readings[currRead].time_from_start));
  // Specify settings of HTML text div
  textDiv.style("font-size", "12px");
  //textDiv.style("font-weight", "bold");
  textDiv.style("font-family", "'Open Sans', sans-serif");
  textDiv.style("color", "black");
  textDiv.style("text-align", "center");
  textDiv.position(0, 0);
  divX = date_rectX -textDiv.size().width/2
  divY = date_rectY - textDiv.size().height/2
  textDiv.position(divX, divY);
  //textDiv.hide();
}

function timeString(time) {
  var days = Math.floor(time / (24*3600));
  time = time - days*(24*3600)
  var hours = Math.floor(time / 3600);
  time = time - hours * 3600;
  var minutes = Math.floor(time / 60);
  var seconds = time - minutes * 60;
  return  days+" Days " +hours + " Hours<br> "+ minutes +" Minutes "+ seconds +" Seconds ";
  
}

function draw() {
  background(255);
  if (mainGif.loaded() && smallGif.loaded) {
    loading.hide();
    push();
    tint(255, 190);  // Display at half opacity
    image(mainGif, 0, 0, width, height);
    pop();
    play.drawButton();
    image(smallGif, otherView.rectX, otherView.rectY, otherView.rectWidth, otherView.rectHeight);
    
    if (!gif_side.playing()) {
      currRead = slider.value();
      mainGif.frame(currRead);
      smallGif.frame(currRead);
    }
    else {
      currRead = mainGif.frame();
      slider.value(currRead);
    }
  }
  else {
    push();
    background(color('rgba(214, 121, 199, 0.7)'))
    push();
    fill(164, 240, 186);
    noStroke();
    textSize(20);
    textAlign(CENTER, CENTER)
    textFont(mainFont);
    text("Loading Recipe Photos...", width/2, height/2-grid.rowheight())
    loading.show();
    pop();
    currRead = slider.value();
    pop();
  }
    
  otherView.drawRect();
  showReadDate();
    
  percentDone();
  showValues();
      
  //grid.display();
}

function showReadDate() {
  push();
  fill('rgba(164, 240, 186, 0.7)');
  noStroke();
  rectMode(CENTER)
  date_rectX = map(currRead,0, totalFrames-1, sliderStart, sliderEnd);
  divX = date_rectX -textDiv.size().width/2
  divY = date_rectY - textDiv.size().height/2
  rect(date_rectX, date_rectY, date_rectWidth, date_rectHeight, 5);
  
  fill(0)
  textAlign (CENTER, CENTER)
  //text (readings[currRead].timestamp, grid.margin.left+grid.colwidth()*9+grid.gutter*9+(grid.colwidth()*3+grid.gutter*2)/2, height-grid.margin.bottom-grid.rowheight()*2.5+grid.rowheight()/2)
  textDiv.position(divX, divY)
  textDiv.html(readings[currRead].timestamp+"<br>"+timeString(readings[currRead].time_from_start))
  pop();
}

function showValues() {
  
  var valuesRectX = grid.margin.left
  var valuesRectY = grid.margin.top
  var valuesRectWidth = grid.colwidth()*3
  var valuesRectHeight = grid.rowheight()*5
  
  var tempHeight = valuesRectY+valuesRectHeight/6;
  var lightHeight = valuesRectY+valuesRectHeight/2;
  var humidityHeight = valuesRectY+valuesRectHeight*5/6;
  
  push();
  fill('rgba(176, 180, 181, 0.7)');
  noStroke();
  rectMode(CORNER)
  rect(valuesRectX, valuesRectY, valuesRectWidth, valuesRectHeight, 10);
  pop();
  
  push();
  fill(0)
  noStroke();
  textAlign (CENTER, CENTER);
  textFont(iconFont);
  textSize(20);
  text (icons.temp, valuesRectX+valuesRectWidth/6, tempHeight);
  text (icons.light, valuesRectX+valuesRectWidth/6, lightHeight);
  text (icons.humidity, valuesRectX+valuesRectWidth/6, humidityHeight);
  pop();
  
  push();
  fill(0)
  noStroke();
  textAlign (CENTER, CENTER);
  textFont(mainFont);
  textSize(11)
  text ("Sensors", valuesRectX+valuesRectWidth/2, tempHeight-20);
  text ("Recipe", valuesRectX+valuesRectWidth*5/6, tempHeight-20);
  textSize(15);
  text (readings[currRead].sensors.temp, valuesRectX+valuesRectWidth/2, tempHeight);
  text (readings[currRead].sensors.light, valuesRectX+valuesRectWidth/2, lightHeight);
  text (readings[currRead].sensors.humidity, valuesRectX+valuesRectWidth/2, humidityHeight);
  
  text (recipeReadingsValues[currRead].temp, valuesRectX+valuesRectWidth*5/6, tempHeight);
  text (recipeReadingsValues[currRead].light, valuesRectX+valuesRectWidth*5/6, lightHeight);
  text (recipeReadingsValues[currRead].humidity, valuesRectX+valuesRectWidth*5/6, humidityHeight);
  pop();
  
}

function getRecipeReadingsValues() {
  var recipeIndex = 0;
  var readIndex = 0;
  var recipeTime = recipe.operations[recipeIndex][0];
  var readTime = readings[readIndex].time_from_start;
  var tempString = "air_temperature";
  var lightString = "light_illuminance";
  var humidityString = "air_humidity";
  var temp = 0;
  var light = 0;
  var humidity = 0;
  var recipeArr = [];
  for (i=0; i<recipe.operations.length; i++) {
    if (recipe.operations[i][0]!=recipeTime) {
      recipeArr.push({"time":recipeTime, "values":{"temp":temp, "light": light, "humidity": humidity}})
      recipeTime = recipe.operations[i][0];
    }
    if (recipe.operations[i][1]==tempString ){
      temp = recipe.operations[i][2]
    }
    if (recipe.operations[i][1]==humidityString ){
      humidity = recipe.operations[i][2]
    }
    if (recipe.operations[i][1]==lightString ){
      light = recipe.operations[i][2]
    }
  }
  for (i=0; i<readings.length; i++) {
    while (readings[i].time_from_start>recipeArr[recipeIndex].time) {
      recipeIndex++;
    }
      recipeReadingsValues.push(recipeArr[recipeIndex].values);
  }
}

function percentDone() {
  var done = map (readings[currRead].time_from_start, 0, recipeLength, 0, 100);
  var angle = map (done, 0, 100, -HALF_PI, TWO_PI-HALF_PI);
  var doneCircleX = grid.margin.left+grid.colwidth()*9+grid.gutter*9+(grid.colwidth()*3+grid.gutter*2)/2;
  var doneCircleY = height/2;
  var doneCircleRadius = 90;
  push();
  
  push();
  noStroke()
  fill(color('rgba(255,255,255,0.4)'))
  ellipse(doneCircleX, doneCircleY, doneCircleRadius, doneCircleRadius);
  pop();
  
  push();
  noFill()
  strokeWeight(7)
  stroke(color('rgb(176, 180, 181)'))
  ellipse(doneCircleX, doneCircleY, doneCircleRadius, doneCircleRadius);
  strokeCap(SQUARE);
  stroke(color('rgb(164, 240, 186)'));
  if (done>0){
    arc(doneCircleX, doneCircleY, doneCircleRadius, doneCircleRadius, -HALF_PI, angle, OPEN);
  }
  pop();
  
  push();
  noStroke();
  fill(90);
  textAlign(CENTER, CENTER);
  textFont(mainFontBold);
  
  fill(120);
  textSize(30)
  var percentString = round(done)+"%"
  text (percentString, doneCircleX, doneCircleY-15)
  
  textSize(12)
  var doneString = "Recipe Done"
  text(doneString, doneCircleX, doneCircleY+10)
  pop();
  
}

function toggleViews() {
  if (mainGif==gif_side) {
    mainGif=gif_top;
    smallGif=gif_side;
  }
  else {
    mainGif=gif_side;
    smallGif=gif_top;
  }
}

function mousePressed() {
  play.buttunClick();
  if (otherView.mouseOver()) {
    toggleViews();
  }
}

function OtherViewRect() {
  this.rectX = width-grid.margin.right-grid.colwidth()*3-grid.gutter*3
  this.rectY = grid.margin.top
  this.rectWidth = grid.colwidth()*3+grid.gutter*3
  this.rectHeight = grid.rowheight()*3
  
  this.mouseOver = function() {
    return (mouseX>this.rectX && mouseX<this.rectX+this.rectWidth) && 
      (mouseY>this.rectY && mouseY<this.rectY+this.rectHeight)
  }
  
  this.drawRect = function() {
    if (this.mouseOver()) {
      push()
      cursor(HAND);
      pop()
    }
  }
}

function PlayButton() {
  this.x = grid.margin.left+grid.colwidth()/2
  this.y = height-grid.margin.bottom-grid.rowheight()
  this.radius = grid.colwidth()/2
  this.play = true;
  
  this.toggleMode = function () {
    this.play = !this.play;
  }
  this.mouseOver = function() {
    return (dist(mouseX, mouseY, this.x, this.y)<this.radius)
  }
  
  this.drawButton  = function() {
    push();
    noStroke();
    ellipseMode(CENTER);
  if(this.mouseOver())
  {
    fill(100);
    cursor(HAND);
  } else {
    fill(200); 
    cursor(ARROW); 
  }
    ellipse(this.x, this.y, this.radius*2, this.radius*2);
    
    push();
    fill (212, 124, 198);
    noStroke();
    margin = 17
    if (this.play) {
      // draw play triangle
      triangle(this.x-this.radius+margin, this.y-this.radius+margin/1.5,this.x-this.radius+margin, this.y+this.radius-margin/1.5, this.x+this.radius-margin/2, this.y);
    }
    else {
      // draw stop rectangle
      rectMode(CENTER)
      rect(this.x, this.y, this.radius*2-margin*1.5, this.radius*2-margin*1.5);
      
    }
    pop();
    pop();
}

this.buttunClick = function() {
  if (this.mouseOver()) {
    this.toggleMode();
    if (gif_side.playing()) {
      gif_side.pause();
      gif_top.pause();
    } else {
      gif_side.play();
      gif_top.play();
    }
    
  }
}
  }