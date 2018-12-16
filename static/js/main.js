// POPULATION
// var nNeurons = 3; // implicit assumed for now
var stimuli = [];
var nStimuli = 8;
var nTimesteps = 12;
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
var stimPref1 = 0.0;
var stimPref2 = 3.0;
var stimPref3 = 6.0;

function g(t,tau) { // evoked input gate
  // t is current time
  // tau is time constant of exponential
  // outputs value in [0,1]
  var gate = 1 - Math.pow(Math.E, -t/tau);
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
  // preferred stimuli for each neuron
  var sx = stimPref1*Math.PI/4;
  var sy = stimPref2*Math.PI/4;
  var sz = stimPref3*Math.PI/4;
  $('#stimpref1').html(rad2deg(sx.toString()));
  $('#stimpref2').html(rad2deg(sy.toString()));
  $('#stimpref3').html(rad2deg(sz.toString()));

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
  graph_layout = {
    title: 'Population activity',
    scene: {
      xaxis: {title: 'Neuron 1'},
      yaxis: {title: 'Neuron 2'},
      zaxis: {title: 'Neuron 3'},
      camera: {
          eye: { 
                x: 2, y: 2, z: 0.1 }
        }
    },
    height: 640,
  };
  psth_layout = {
    title: 'PSTHs for ' + rad2deg(stimuli[stimIndexForPsth]).toString() + 'º',
    xaxis: {title: 'Time (t)'},
    yaxis: {title: 'Firing rate (r)'}
  };
  return {graph_lines: lines,
    psth_lines: psth_obj.psth_lines,
    psth_update: psth_obj.psth_update,
    graph_update: {x: xss, y: yss, z: zss},
    graph_layout: graph_layout,
    psth_layout: psth_layout};
}

function updateGraphs() {
  var newdata = make3Psths(stimuli, nTimesteps);
  Plotly.update('graph', newdata.graph_update, newdata.graph_layout);
  Plotly.update('psths', newdata.psth_update, newdata.psth_layout);
}

function createGraphs() {
  var curdata = make3Psths(stimuli, nTimesteps);
  Plotly.plot('graph', curdata.graph_lines, curdata.graph_layout);
  Plotly.plot('psths', curdata.psth_lines, curdata.psth_layout);
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
  tau = parseFloat($("#slider-tau").val())/3.0;
  updateGraphs();
}
function changeCiRate() {
  ciRate = parseInt($("#slider-ci").val());
  updateGraphs();
}
function changeCiTau() {
  ciTau = parseFloat($("#slider-ci-tau").val())/3.0;
  updateGraphs();
}
function changeStimIndex() {
  stimIndexForPsth = parseInt($("#slider-stim-index").val());
  updateGraphs();
}
function changeStimPref1() {
  stimPref1 = parseFloat($("#slider-thetapref-1").val());
  updateGraphs();
}
function changeStimPref2() {
  stimPref2 = parseFloat($("#slider-thetapref-2").val());
  updateGraphs();
}
function changeStimPref3() {
  stimPref3 = parseFloat($("#slider-thetapref-3").val());
  updateGraphs();
}
function makeSnowflake() {
  stimPref1 = 0;
  stimPref2 = 3;
  stimPref3 = 6;
  ciRate = 0;
  ciTau = 1.0;
  a = 5;
  b = 3;
  tau = 2.0;
  updateGraphs();
}
function makeGramophone() {
  stimPref1 = 0;
  stimPref2 = 3;
  stimPref3 = 6;
  ciRate = 4;
  ciTau = 1.0;
  a = 5;
  b = 4;
  tau = 3.0;
  updateGraphs();
}
function makeHeadMassager() {
  stimPref1 = 0;
  stimPref2 = 3;
  stimPref3 = 6;
  ciRate = 9;
  ciTau = 3.0;
  a = 5;
  b = 3;
  tau = 1.0;
  updateGraphs();
}
function makeSpider() {
  stimPref1 = 0;
  stimPref2 = 3;
  stimPref3 = 6;
  ciRate = 2;
  ciTau = 3.0;
  a = 5;
  b = 3;
  tau = 1.0;
  updateGraphs();
}

function addHandlers() {
  $("#slider-a").click(changeA);
  $("#slider-b").click(changeB);
  $("#slider-tau").click(changeTau);
  $("#slider-ci").click(changeCiRate);
  $("#slider-ci-tau").click(changeCiTau);
  $("#slider-stim-index").click(changeStimIndex);
  $("#slider-thetapref-1").click(changeStimPref1);
  $("#slider-thetapref-2").click(changeStimPref2);
  $("#slider-thetapref-3").click(changeStimPref3);
  $("#snowflake").click(makeSnowflake);
  $("#gramophone").click(makeGramophone);
  $("#head-massager").click(makeHeadMassager);
  $("#spider").click(makeSpider);
}

function main() {
  makeStimuli(nStimuli);
  addHandlers();
  createGraphs();
}

$(document).ready(main);
