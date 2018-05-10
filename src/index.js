"use strict";

let _ = require('lodash');
let paper = require('paper/dist/paper-full.js');
//let saveAs = require('file-saver');
import {saveAs} from 'file-saver';

window.onload = function() {

  let canvas = document.getElementById('canvas');

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  paper.setup(canvas);
  
  const circleOneDiameter = 5;
  const circleTwoDiameter = 3;
  const rotationRadius = 20;
  const numXGrid = 10;
  const numYGrid = 10;
  const numAngle = 36;
  const frameCountOff = 30;
  const frameCountOn = 30;

  const gridMargin = 4*rotationRadius;
  const xGridPoints = getGridPoints(gridMargin, canvas.width,  numXGrid);
  const yGridPoints = getGridPoints(gridMargin, canvas.height, numYGrid);
  const angleValues = _.range(0,2*Math.PI,2*Math.PI/numAngle);

  const circleOne = new paper.Path.Circle(new paper.Point(paper.view.center.x-rotationRadius,paper.view.center.y), circleOneDiameter);
  circleOne.fillColor  = 'black';

  const circleTwo = new paper.Path.Circle(new paper.Point(paper.view.center.x-rotationRadius,paper.view.center.y), circleTwoDiameter);
  circleTwo.fillColor  = 'black';

  // Create Position Array
  let positionArray = [];
  for (let iy=0; iy<yGridPoints.length; iy++) {
   for (let ix=0; ix<xGridPoints.length; ix++) {
     for (let ia=0; ia<angleValues.length; ia++) {
       positionArray.push({
         x: xGridPoints[ix],
         y: yGridPoints[iy],
         angle: angleValues[ia],
       });
     }
   }
  }


  let angleArray = [];
  for (let i=0; i<numAngle; i++)
  {
    angleArray[i] = 2*i*Math.PI/numAngle;
  }


  let running = false;
  let currentIndex = 0;
  let stateCounter = 0;
  let stateValue = 'on';

  function iterate(frameCount) {
    // Resize canvas. This maybe not the best way, but it works for now.
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!running) {
      return;
    }

    if (stateValue === 'on') {
      let angle = positionArray[currentIndex].angle;
      let x = positionArray[currentIndex].x;
      let y = positionArray[currentIndex].y;

      circleOne.fillColor = 'white';
      circleOne.position.x = rotationRadius*Math.cos(angle) + x;
      circleOne.position.y = rotationRadius*Math.sin(angle) + y;

      circleTwo.fillColor = 'white';
      circleTwo.position.x = rotationRadius*Math.cos(angle+Math.PI) + x;
      circleTwo.position.y = rotationRadius*Math.sin(angle+Math.PI) + y;

      stateCounter += 1;
      if (stateCounter === frameCountOn) {
        stateValue = 'off';
        stateCounter = 0;
      }
    }
    else {
      circleOne.fillColor = 'black';
      circleTwo.fillColor = 'black';
      stateCounter += 1;
      if (stateCounter === frameCountOff) {
        stateValue = 'on';
        stateCounter = 0;
        currentIndex = (currentIndex +1)%positionArray.length;
      }
    }
  };

  paper.view.onFrame = function(event) {
      iterate(event.count);
  }

  // Handle keydown envents - used to restart display
  let tool = new paper.Tool();
  tool.onKeyDown = function(event) {
    console.log(event.key);
    switch (event.key) {
      case 'b':
        running = true;
        currentIndex=0;
        break;
      case 'e':
        running = false;
        circleOne.fillColor = 'black';
        circleTwo.fillColor = 'black';
        break;
      case 's':
        savePositionArray();
        break;
    }
  }

  // Get evenly spaced grid points on canvas with margin
  function getGridPoints(margin, canvasDim, numPts) {
    let width = canvasDim - 2*margin;
    let step = width/numPts;
    return _.range(margin,margin+width,step);
  };

  function savePositionArray() {
    // Save position array
    let outputArray = [];
    for (let i=0; i<positionArray.length; i++)
    {
      let dataLine = ''; 
      dataLine += positionArray[i].x.toPrecision(4) + ', '; 
      dataLine += positionArray[i].y.toPrecision(4) + ', '; 
      dataLine += positionArray[i].angle.toPrecision(4);
      outputArray.push(dataLine);
    }
    outputArray = [outputArray.join('\n') + '\n'];
    let blob = new Blob(outputArray, {type: "text/plain;charset=utf-8"});
    saveAs(blob, 'position.txt', true);
  };
  
}


