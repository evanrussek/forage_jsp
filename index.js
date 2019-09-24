// create the timeline...

//
var full_screen = {
  type: 'fullscreen',
  fullscreen_mode: true
};

// we'll vary the travel amount?
var travel_amounts = [8, 16, 32];
var harvest_key_seq = ['f', 'j', 'f', 'j'];
var harvest_prompt = ["(F -> J -> F -> J)"];

var travel_key_seq_easy = ['d', 'k', 'd', 'k'];
var travel_prompt_easy = ["(D -> K -> D -> K)"];
var travel_key_seq_hard =['z', '/', 't', 'y'];
var travel_prompt_hard = ["(Z -> / -> T -> Y)"];
var n_rounds = 2;

var forage_trials = [];
for (r_idx = 0; r_idx < n_rounds; r_idx++){
  var this_round_trials = [];
  for (d_idx = 0; d_idx < 2; d_idx++){
    for (ta_idx = 0; ta_idx < travel_amounts.length; ta_idx++){
      var this_travel_amount = travel_amounts[ta_idx];
      if (d_idx == 0){
          var this_travel_key_seq = travel_key_seq_easy;
          var this_travel_prompt = travel_prompt_easy;
      }else{
        var this_travel_key_seq = travel_key_seq_hard;
        var this_travel_prompt = travel_prompt_hard;
      }
      var this_trial = {
        type: 'travel-mkre',
        start_reward: 100,
        decay: .99,
        n_travel_steps: this_travel_amount,
        press_success_prob_travel: .7,
        press_success_prob_harvest: .7,
        reward_noise: 2.5,
        start_reward_noise: 4,
        time_min: 1.5,
        travel_key_seq:this_travel_key_seq,
        travel_prompt: this_travel_prompt,
        harvest_key_seq: harvest_key_seq,
        harvest_prompt: harvest_prompt
      }
      this_round_trials.push(this_trial)
    }
  }
  forage_trials = forage_trials.concat(jsPsych.randomization.shuffle(this_round_trials,1));
}

var make_text_trial = function(travel_prompt, harvest_prompt){
  var text_trial = {
    type: 'evan-display-text',
    line_1: "Traveling to a new environment",
    line_2: "Travel sequence: " + travel_prompt + ", Harvest sequence: " + harvest_prompt,
    line_3: ""
  }
  return text_trial
}

// shuffle these
var trials = forage_trials;

/* create timeline */
var timeline = [];
timeline.push(full_screen);

timeline = timeline.concat(intro_w_trials);

for (i = 0; i < trials.length; i++){
  var next_trial = trials[i];
  var text_trial = make_text_trial(next_trial.travel_prompt, next_trial.harvest_prompt)
  timeline.push(text_trial);
  timeline.push(next_trial);
}


// need a screen thanking them for the task and also figuring out the bonus... -- do this tonight


/* start the experiment */
jsPsych.init({
  timeline: timeline,
  show_preload_progress_bar: false,
  on_finish: function() {
    //console.log('done')
    jsPsych.data.get().localSave('csv','test_res.csv');
  //on_finish: saveData
  }
});
