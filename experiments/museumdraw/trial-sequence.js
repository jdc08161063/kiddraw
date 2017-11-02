/* 

Handles dynamic elements of museumdraw task
Oct 26 2017

*/

// To integrate:
// HTML divs: Starting welcome page, age page (push age data), thank you page
// JS: clear and save sketchpad data (and push to online database after each trial)
// Convert onclick to also ontouch to work with ipad
// CSS: Make sure sizing works well on an iPad
// and much more...


// 1. Setup trial order and randomize it!

var stimListTest = [{"category": "rabbit", "video": "rabbit.mp4"},
			{"category": "banana","video": "banana.mp4"},
			{"category": "boat","video": "boat.mp4"},
			{"category": "cup","video": "cup.mp4"},
			]
var curTrial=0 // global variable, trial counter
var maxTrials = stimListTest.length-1; // 
var trialOrder = [];
for (var i = 0; i <= maxTrials; i++) {
   trialOrder.push(i);
}

//helpfuls
function shuffle (a) 
{ 
    var o = [];
    for (var i=0; i < a.length; i++) {
		o[i] = a[i];
    } 
    for (var j, x, i = o.length;
	 i;
	 j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);	
    return o;
}
//global variables here
var trialOrder=shuffle(trialOrder)
var thisTrialIndex=trialOrder[curTrial] 

////



function startExp(){
	$('#Welcome').fadeOut('fast'); // hide intro screen
	$('#getAge').fadeIn('fast'); // fade in ready button
}

function endExp(){
	$('#mainExp').fadeOut('fast'); 
	$('#Thanks').fadeIn('fast'); // hide intro screen
}

// for the first time we start the experiment
function startDrawing(){
		loadNextVideo(thisTrialIndex)
		document.getElementById("cue").innerHTML = "Can you draw a "  + stimListTest[thisTrialIndex].category;

	 	$('#getAge').fadeOut('fast'); // fade out age screen
	    $('#mainExp').fadeIn('fast'); // fade in exp

        setTimeout(function() {showCue();},1000); 
        setTimeout(function() {hideCue();},5000);  // Take cues away after 5 - after video ends
        setTimeout(function() {showSubmit();},6000); // some minimum amount of time before "I'm done button"
		timestamp_cueOnset = new Date().getTime();
}

// for other trials
$('#ready').on('touchstart click',function(){
		console.log('touched ready button');
		$('#goodJob').fadeOut('fast'); 
		$('#ready').fadeOut('fast');
		$('#allDone').fadeOut('fast');
        setTimeout(function() {showCue();},1000); 
        setTimeout(function() {hideCue();},5000);  // Take cues away after 4s?
        setTimeout(function() {showSubmit();},6000); // some minimum amount of time before "I'm done button"
		timestamp_cueOnset = new Date().getTime();
})


$('#allDone').on('touchstart click',function(){
		console.log('touched all done');
		$('#ready').fadeOut('fast');
		$('#allDone').fadeOut('fast');
        endExp();
})
 
function showCue() {	
	$('#cue').fadeIn('fast'); //text cue associated with trial
	$('#cueVideoDiv').show(); //show video div 
	playVideo();
}

function hideCue() {
	$('#cue').fadeOut('fast'); // fade out cue
	$('#cueVideoDiv').hide(); //show video html - this can be a variable later?
	$('#sketchpad').fadeIn('fast'); // fade in sketchpad  here?
}

function showSubmit() {
	$('#submit').fadeIn('fast');
}

// video player functions
function playVideo(){
  videojs("cueVideo").ready(function(){ // need to wait until video is ready
  var player = this;
  player.play();
	});
}

function loadNextVideo(){
  var player=videojs('cueVideo');
  player.pause();
  var thisTrialIndex=trialOrder[curTrial] 
  console.log(stimListTest[thisTrialIndex].video)
  player.src({ type: "video/mp4", src: "videos/" + stimListTest[thisTrialIndex].video });
  player.load();
}

// function writeDataToMongo = function(data) {

// }

function nextTrial() {
	curTrial++
	console.log('clicked submit');
	project.activeLayer.removeChildren(); // clear sketchpad hack?
	$('#sketchpad').fadeOut('fast'); // fade out sketchpas before choice buttons
	if (curTrial<maxTrials){
		var thisTrialIndex=trialOrder[curTrial] 
		loadNextVideo(thisTrialIndex)
		document.getElementById("cue").innerHTML = "Can you draw a "  + stimListTest[thisTrialIndex].category;

		// save sketch png
        var dataURL = document.getElementById('sketchpad').toDataURL();
        dataURL = dataURL.replace('data:image/png;base64,','');

        var category = stimListTest[thisTrialIndex].category;

        current_data = {imgData: dataURL,
        				category: category,
						dbname:'kiddraw',
						colname:'test',
						trialNum: curTrial,
						time: Date.now(),
						age: 'unknown'}
		console.log(current_data);

        $.ajax({
               type: 'POST',
               url: 'http://171.64.40.90:9919/saveresponse',
               dataType: 'jsonp',
               traditional: true,
               timeout: 2000,                   
               contentType: 'application/json; charset=utf-8',
               data: current_data,
               retryLimit: 3,
               error: function(x, t, m) {
                  if(t==="timeout") {
                    console.log("got timeout, try again...");
                    console.log(m);
                    this.retryLimit--;                    
                    $.ajax(this);
                    return;
                  } else {
                      console.log(t);
                      this.retryLimit--;
                      $.ajax(this);    
                      return;                      
                  }
               },
                success: function(msg) { 
                console.log('image uploaded successfully');
               }
        });						


		// data.sketchData = GET SKETCHPAD DATA
		// data.category = category
		// data.video = video
		// data.submitTime?
		// CLEAR SKETCHPAD 
		$('#submit').fadeOut('fast'); // fade out submit button
		$('#ready').fadeIn('fast'); // fade in ready
		$('#goodJob').fadeIn('fast'); 
		$('#allDone').fadeIn('fast'); 
		// GET NEXT CUE AND VIDEO //
	}
	else {
		endExp();
	}

}






