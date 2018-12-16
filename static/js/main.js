// POPULATION
// var nNeurons = 3; // implicit assumed for now
var stimuli = [];
var nStimuli = 8;
var nTimesteps = 15;
var lines = [];
var graph_layout = [];
var update = [];
var psth_layout = [];
var stimIndexForPsth = 0;

// NEURONS
// global parameters:
var a = 5; // spontaneous firing rate
var b = 3; // average evoked firing rate
var t0 = 2; // time of stimulus onset
var tau = 2; // tau for stimulus response
var ciRate = 0; // rate for CI
var ciTau = 1; // tau for CI

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
function psth(t,x,s,g,h) { // firing rate
  // firing rate of neuron with preferred stimulus s
  //  at time t, given current stimulus x
  // y = max(0, a + b*g(t-t0)*b*h(x,s))
  // return Math.max(0, a + g(t-t0,tau)*(b*h(x,s) + ciRate));
  return Math.max(0, a + g(t-t0,tau)*b*h(x,s) + g(t-t0,ciTau)*ciRate);
}

function rad2deg(rad) {
  return Math.ceil(rad*180/Math.PI);
}

function gatherPsths(xs, ys, zs, ts) {
  var psth1 = {
    name: 'Neuron 1',
    type: 'scatter', 
    mode: 'lines+markers',
    x: ts,
    y: xs,
    opacity: 1,
    line: { width: 3,
      reversescale: false,
      color: 'rgb(35, 35, 35)' },
    marker: {size: 5}
  };
  var psth2 = {
    name: 'Neuron 2',
    type: 'scatter', 
    mode: 'lines+markers',
    x: ts,
    y: ys,
    opacity: 1,
    line: { width: 3,
      reversescale: false,
      color: 'rgb(135, 135, 135)' },
    marker: {size: 5}
  };
  var psth3 = {
    name: 'Neuron 3',
    type: 'scatter', 
    mode: 'lines+markers',
    x: ts,
    y: zs,
    opacity: 1,
    line: { width: 3,
      reversescale: false,
      color: 'rgb(205, 205, 205)' },
    marker: {size: 5}
  };
  return {psth_lines: [psth1, psth2, psth3],
    psth_update: {y: [xs, ys, zs]}};
}

function make3Psths(stimuli, nTimesteps, returnLines) {
  var sx = Math.PI/4;
  var sy = 3*Math.PI/4;
  var sz = Math.PI;
  var lines = [];
  var xss = [];
  var yss = [];
  var zss = [];
  var tss = [];
  for (var j=0; j<stimuli.length; j++) {
    var stim = stimuli[j];
    var xs = [];
    var ys = [];
    var zs = [];
    var ts = [];
    for (var t=0; t<nTimesteps; t++) {
      xs.push(psth(t,stim,sx,g,tuningFcn));
      ys.push(psth(t,stim,sy,g,tuningFcn));
      zs.push(psth(t,stim,sz,g,tuningFcn));
      ts.push(t);
    }
    var cdata = {
      name: rad2deg(stim).toString() + 'º',
      type: 'scatter3d',
      mode: 'lines+markers',
      x: xs,
      y: ys,
      z: zs,
      opacity: 1,
      line: {
        width: 6,
        // color: c,
        reversescale: false
      },
      marker: {size: 3}
    };
    if (j === stimIndexForPsth) {
      var psth_obj = gatherPsths(xs, ys, zs, ts);
    }
    xss.push(xs);
    yss.push(ys);
    zss.push(zs);
    tss.push(ts);
    lines.push(cdata);
  }
  return {graph_lines: lines,
    psth_lines: psth_obj.psth_lines,
    psth_update: psth_obj.psth_update,
    graph_update: {x: xss, y: yss, z: zss}};
}

function updateGraphs() {
  var newdata = make3Psths(stimuli, nTimesteps);
  Plotly.update('graph', newdata.graph_update);
  Plotly.update('psths', newdata.psth_update);
}

function createGraphs() {
  var curdata = make3Psths(stimuli, nTimesteps);
  graph_layout = {
    scene: {
      xaxis: {title: 'Neuron 1'},
      yaxis: {title: 'Neuron 2'},
      zaxis: {title: 'Neuron 3'}
    },
    height: 640,
  };
  psth_layout = {
    title: 'PSTHs for ' + rad2deg(stimuli[stimIndexForPsth]).toString() + 'º',
    xaxis: {title: 'Time (t)'},
    yaxis: {title: 'Firing rate (r)'}
  };
  Plotly.plot('graph', curdata.graph_lines, graph_layout);
  Plotly.plot('psths', curdata.psth_lines, psth_layout);
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
  updateGraphs();
}
function changeB() {
  b = parseInt($("#slider-b").val());
  updateGraphs();
}
function changeTau() {
  tau = parseFloat($("#slider-tau").val())/2.0;
  updateGraphs();
}
function changeCiRate() {
  ciRate = parseInt($("#slider-ci").val());
  updateGraphs();
}
function changeCiTau() {
  ciTau = parseFloat($("#slider-ci-tau").val())/2.0;
  updateGraphs();
}
function addHandlers() {
  $("#slider-a").click(changeA);
  $("#slider-b").click(changeB);
  $("#slider-tau").click(changeTau);
  $("#slider-ci").click(changeCiRate);
  $("#slider-ci-tau").click(changeCiTau);
}

function main() {
  makeStimuli(nStimuli);
  addHandlers();
  createGraphs();
}

$(document).ready(main);
