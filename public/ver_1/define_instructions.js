// for two-stim choice add parameter for whether to limit choice time.
var instruction_pagelinks_a = ['Stimuli/forage_instructions/Slide1.JPG',
                            'Stimuli/forage_instructions/Slide2.JPG',
                            'Stimuli/forage_instructions/Slide3.JPG',
                            'Stimuli/forage_instructions/Slide4.JPG',
                            'Stimuli/forage_instructions/Slide5.JPG',
                            'Stimuli/forage_instructions/Slide6.JPG'];
var instruction_pagelinks_b = ['Stimuli/forage_instructions/Slide7.JPG',
															'Stimuli/forage_instructions/Slide8.JPG'];

var practice_trial = {
	type: 'travel-mkre',
	start_reward: 100,
	decay: .98,
	n_travel_steps: 6,
	press_success_prob_travel: .7,
	press_success_prob_harvest: .5,
	reward_noise: 2.5,
	start_reward_noise: 4,
	time_min: .75,
	travel_key_seq: ['z', '/', 't', 'y'],
	travel_prompt: ["(Z -> / -> T -> Y)"],
	harvest_key_seq: ['f', 'j', 'f', 'j'],
	harvest_prompt: ["(F -> J -> F -> J)"]
};


var pages_a = [];
for (var i = 0; i < instruction_pagelinks_a.length; i++){
    pages_a.push('<img src= "'+ instruction_pagelinks_a[i] +  '" alt = "" >')
}

var instruction_pages_a = {
    type: 'instructions',
    pages: pages_a,
    show_clickable_nav: true
}

var instruction_pages_b = {
    type: 'instructions',
    pages: ['<img src= "'+ instruction_pagelinks_b[0] +  '" alt = "" >', '<img src= "'+ instruction_pagelinks_b[1] +  '" alt = "" >'],
    show_clickable_nav: true
}

var questions = ["How long will each round last?", // 1
				"What determines your bonus?", // 2
				"How do you travel to a tree?", // 3
				"Is the TRAVEL sequence the same in every round?", // 4
				"When you are at a tree, how do you collect points?", // 5
				"What happens to the number of points a tree provides over time?", // 6
				"When you are at a tree, how do you leave the tree?"]; // 7

var options1 =  ['30 seconds', '60 seconds', '90 seconds', '120 seconds', '180 seconds'];
var correct1 = 2;

var options2 = ['Total number of points collected over the entire experiment',
				'Total number of points collected on a randomly selected round',
				'Highest single point value received on a randomly selected round'];
var correct2 = 1;

var options3 = ['Entering the TRAVEL sequence keys in order, repeatedly',
				'Entering the HARVEST sequence keys in order, repeatedly',
				'Entering the TRAVEL sequence keys in order, once',
				'Entering the HARVEST sequence keys in order, once'];
var correct3 = 0;

var options4 = ['yes', 'no'];
var correct4 = 1;

var options5 = ['Entering the TRAVEL sequence keys in order, repeatedly',
				'Entering the HARVEST sequence keys in order, repeatedly',
				'Entering the TRAVEL sequence keys once.',
				'Entering the HARVEST sequence keys once.'];
var correct5 = 1;

var options6 = ['The number of points decreases over time.',
				'The number of points increases over time.',
				'The number of points does not change over time.'];

var correct6 = 0;

var options7 = ['Entering the TRAVEL sequence.',
				'Entering the HARVEST sequence.'];
var correct7 = 0;

// build the quiz...
var corr_string = '{"Q0":' + '"'+options1[correct1]+'",' + '"Q1":' + '"'+options2[correct2]+'",'
    + '"Q2":' + '"'+options3[correct3]+'",' + '"Q3":' + '"'+options4[correct4]+'",' +
    '"Q4":' + '"'+options5[correct5]+'",' + '"Q5":' + '"'+options6[correct6]+'",'
      + '"Q6":' + '"'+options7[correct7]+'"'+ '}';

var preamble = ["<p align='center'><b>Please answer every question. Answering 'I do not know' or answering incorrectly will require you return to the beginning of the instructions. </b></p>"];


var instruction_correct = false;
var instruction_check = {
	type: "evan-quiz",
      preamble: preamble,
      questions: [
          {prompt: "<b>Question 1</b>: " + questions[0],
                  options: options1, required: true},
          {prompt: "<b>Question 2</b>: " + questions[1],
                      options: options2, required: true},
          {prompt: "<b>Question 3</b>: " + questions[2],
                      options: options3, required: true},
          {prompt: "<b>Question 4</b>: " + questions[3],
                          options: options4, required: true},
          {prompt: "<b>Question 5</b>: " + questions[4],
                          options: options5, required: true},
          {prompt: "<b>Question 6</b>: " + questions[5],
                      options: options6, required: true},
          {prompt: "<b>Question 7</b>: " + questions[6],
                                  options: options7, required: true}
  		],
  		on_finish: function(data) {
					console.log(data.responses)
					console.log(corr_string)
	      if( data.responses == corr_string){
	          action = false;
	          instruction_correct = true;
	      }else{
			var post_choices = data.choice_idxs
			// this is global
			incor_questions = ['<br> </br'];
			var correct_choices = [correct1, correct2, correct3, correct4, correct5, correct6, correct7];
			for (var i = 0; i < correct_choices.length; i++){
				if (correct_choices[i] != post_choices[i]){
					incor_questions.push('<br>' + questions[i] + '</br>');
				}
			}
			data.incor_questions = incor_questions;
		}
	}
}

/* define a page for the incorrect response */
var showsplash = true;
var splash_screen = {
	type: 'html-button-response',
    timing_post_trial: 0,
	//    button_html: '<button class="jspsych-btn" style="display:none">%choice%</button>',
    choices: ['Click here to read the instructions again'],
    is_html: true,
    stimulus: function(){
			var incor_q = jsPsych.data.get().last(1).select('incor_questions').values
			var next_stimulus = 'The following questions were answered incorrectly: ' + incor_q;
			return next_stimulus
		}
}

/* ...but push it to a conditional node that only shows it if the response was wrong */
var conditional_splash = {
  timeline: [splash_screen],
  conditional_function: function(data) {
	return !instruction_correct // skip if correct
  }
}

var intro_w_trials = [];
intro_w_trials.push(instruction_pages_a);
intro_w_trials.push(practice_trial);
intro_w_trials.push(instruction_pages_b);
intro_w_trials.push(instruction_check);
intro_w_trials.push(conditional_splash);

var intro_loop = [];
intro_loop.push(instruction_pages_a);
intro_loop.push(instruction_pages_b);
intro_loop.push(instruction_check);
intro_loop.push(conditional_splash);

/* finally, add the entirety of this introductory section to a loop node ... */
var loop_node = {
  timeline: intro_loop,
  conditional_function: function(data) {
  	return !instruction_correct // skip if correct
},
  loop_function: function(data) {
	var action = true;
	return !instruction_correct // stop looping if correct
	}
}

intro_w_trials.push(loop_node);

var finish_instruc_screen = {
	type: 'html-button-response',
	timing_post_trial: 0,
	//    button_html: '<button class="jspsych-btn" style="display:none">%choice%</button>',
	choices: ['Begin the task!'],
	is_html: true,
	stimulus: 'You passed the quiz! Great work. The task will take about 20 minutes. Press the button to begin.'
}

intro_w_trials.push(finish_instruc_screen);
