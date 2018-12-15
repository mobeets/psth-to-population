// POPULATION
// var nNeurons = 3; // implicit assumed for now
var stimuli = [];
var nStimuli = 8;
var nTimesteps = 15;
var lines = [];
var layout = [];

// NEURONS
// global parameters:
var a = 5; // spontaneous firing rate
var b = 3; // average evoked firing rate
var tau = 2; // time constant of stimulus onset
var t0 = 2; // time of stimulus onset
var ciRate = 0; // CI rate

function g(t,tau) { // evoked input gate
  // t is current time
  // tau is time constant of exponential
  // outputs value in [0,1]
  var gate = 1 - Math.pow(Math.E, -t*tau);
  // constrain to be in [0,1]
  return Math.min(Math.max(gate, 0), 1);
}
function tuningFcn(x,s) { // tuning function
  // x is current stimulus
  // s is preferred stimulus
  return Math.cos(x-s);
}
function psth(t,x,s,g,h,a,b,t0,tau) { // firing rate
  // firing rate of neuron with preferred stimulus s
  //  at time t, given current stimulus x
  // y = max(0, a + b*g(t-t0)*b*h(x,s))
  return Math.max(0, a + g(t-t0,tau)*(b*h(x,s) + ciRate));
}

function rad2deg(rad) {
  return Math.ceil(rad*180/Math.PI);
}

function make3Psths(stimuli, nTimesteps, returnLines) {
  var sx = Math.PI/4;
  var sy = 3*Math.PI/4;
  var sz = Math.PI;
  var lines = [];
  var xss = [];
  var yss = [];
  var zss = [];
  for (var j=0; j<stimuli.length; j++) {
    var stim = stimuli[j];
    var xs = [];
    var ys = [];
    var zs = [];
    for (var t=0; t<nTimesteps; t++) {
      xs.push(psth(t,stim,sx,g,tuningFcn,a,b,t0,tau));
      ys.push(psth(t,stim,sy,g,tuningFcn,a,b,t0,tau));
      zs.push(psth(t,stim,sz,g,tuningFcn,a,b,t0,tau));
    }
    var cdata = {
      name: rad2deg(stim).toString() + 'º',
      type: 'scatter3d',
      mode: 'lines',
      x: xs,
      y: ys,
      z: zs,
      opacity: 1,
      line: {
        width: 6,
        // color: c,
        reversescale: false
      }
    };
    xss.push(xs);
    yss.push(ys);
    zss.push(zs);
    lines.push(cdata);
  }
  if (returnLines) { return lines; } else {
    return {x: xss, y: yss, z: zss}; }
}

function makeStimuli(nStimuli) {
  // var stimuli = [];
  for (var j=0; j<nStimuli; j++) {
    stimuli.push( j*Math.PI/4 );
  }
  return stimuli;
}

function changeA() {
  a = parseInt($("#slider-a").val());
  updateGraph();
}
function changeB() {
  b = parseInt($("#slider-b").val());
  updateGraph();
}
function changeTau() {
  tau = parseInt($("#slider-tau").val());
  updateGraph();
}
function changeCiRate() {
  ciRate = parseInt($("#slider-ci").val());
  updateGraph();
}
function addHandlers() {
  $("#slider-a").click(changeA);
  $("#slider-b").click(changeB);
  $("#slider-tau").click(changeTau);
  $("#slider-ci").click(changeCiRate);
  $("#make-psths").click(updateGraph);
}

function updateGraph() {
  console.log([a,b,tau]);
  var update = make3Psths(stimuli, nTimesteps, false);
  console.log(update);
  // Plotly.redraw('graph');
  Plotly.update('graph', update);
  // Plotly.restyle('graph', lines);
}

function createGraph() {
  lines = make3Psths(stimuli, nTimesteps, true);
  layout = {
    scene: {
      xaxis: {title: 'Neuron 1'},
      yaxis: {title: 'Neuron 2'},
      zaxis: {title: 'Neuron 3'}
    },
    height: 640,
  };
  console.log(lines);
  Plotly.plot('graph', lines, layout);
}

function main() {
  makeStimuli(nStimuli);
  console.log(stimuli);
  addHandlers();
  createGraph();
}

$(document).ready(main);
