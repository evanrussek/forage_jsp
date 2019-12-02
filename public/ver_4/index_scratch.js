// create the timeline...

// need to add the consent stuff.
// edit instructions and preload instruction pages


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

  var total_points_arr = [];

  var forage_trials = [];
  var trial_num = 0;
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
        trial_num = trial_num + 1;
        var this_trial = {
          type: 'travel-mkre',
          start_reward: 100,
          decay: .98,
          n_travel_steps: this_travel_amount,
          press_success_prob_travel: 1,
          press_success_prob_harvest: .5,
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

// add a trial num
for (var i = 0;i < forage_trials.length;  i++){
  forage_trials[i].trial_num = i + 1;
}

// fix the quiz!!!!!!!!!!!!!!!!!!!!

var task_name = 'foragetask';
var run_name = 'run1';

var this_trial = {
  type: 'travel-mkre',
  start_reward: 100,
  decay: .98,
  n_travel_steps: 7,
  press_success_prob_travel: .75,
  press_success_prob_harvest: .5,
  reward_noise: 2.5,
  start_reward_noise: 4,
  time_min: .25,
  travel_key_seq: ['a'],
  travel_prompt: ["Repeatedly press 'a' while holding down  '0', '9', 'm' (right) and 't' , 'r' (left) to travel"],
  harvest_key_seq: ['u'],
  harvest_prompt:  ["Press 'u' to harvest or 'a' to travel"],
  travel_held_down_keys: ['0', '9', 'm','t','r'], //  [85, 73, 79, 80, 78]
  show_prompt: true
}

// add down a symbol if the keys are held down... -- repeated checks?

var this_trial2 = { // this is the easy condition...
  type: 'travel-mkre',
  start_reward: 100,
  decay: .98,
  n_travel_steps: 7,
  press_success_prob_travel: .8,
  press_success_prob_harvest: .5,
  reward_noise: 2.5,
  start_reward_noise: 4,
  time_min: .25,
  travel_key_seq: ['f'],
  travel_prompt:  ["Repeatedly press 'f' while holding down  '0', '9', 'm' (right) to travel"],
  harvest_key_seq: ['u'],
  harvest_prompt:  ["Press 'u' to harvest or 'f' to travel"],
  travel_held_down_keys: ['0', '9', 'm'],
  show_prompt: true
}

/*var this_trial2 = {
  type: 'travel-mkre',
  start_reward: 100,
  decay: .98,
  n_travel_steps: this_travel_amount,
  press_success_prob_travel: .7,
  press_success_prob_harvest: .5,
  reward_noise: 2.5,
  start_reward_noise: 4,
  time_min: 1,
  travel_key_seq: ['h', 'h', 'h', 'h','h', 'h', 'h', 'h', 'a', 'a', 'l', 'l', 'f', 'f'],
  travel_prompt: ["h (x 8) -> a (x 2) -> l (x 2) -> f (x 2)"],
  harvest_key_seq: ['j'],
  harvest_prompt:  ['j'],
  show_prompt: true
} */


//db.collection("tasks").doc('meg_generalisation_8').collection('subjects').doc(uid).collection('trial_data').doc('trial_' + trial_data.trial_number.toString()).set({trial_data});

  var make_text_trial = function(travel_prompt, harvest_prompt, trial_num){
    if (trial_num == 1){
      var text_trial = {
        type: 'evan-display-text',
        line_1: "Traveling to a new environment",
        line_2: travel_prompt + ". Press 'u' to harvest",
        line_3: ""
      }
    } else{
      var text_trial = {
        type: 'evan-display-text',
        line_1: function(){
          var lasttimelinedata = jsPsych.data.getLastTimelineData();
          var total_points = lasttimelinedata.values().pop().total_points
          total_points_arr.push(total_points);
          console.log(lasttimelinedata)
          return "You collected " + total_points + " points. Great work. You've completed " + (trial_num -1)+ " out of 12 rounds."  ;
        },
        line_2: "Traveling to a new environment",
        line_3: "Travel sequence: " + travel_prompt + ", Harvest sequence: " + harvest_prompt,
        //on_start: function (){
        //  last_trial_data.json()
        //}
      }
    }
    return text_trial
  }

  // shuffle these
  var trials = [this_trial2, this_trial];

  /* create timeline */
  var timeline = [];
  timeline.push(full_screen);

//  timeline = timeline.concat(intro_w_trials);

  for (i = 0; i < trials.length; i++){
    var next_trial = trials[i];
    var text_trial = make_text_trial(next_trial.travel_prompt, next_trial.harvest_prompt, i + 1)
    timeline.push(text_trial);
    timeline.push(next_trial);
  }

  // compute bonus for the main task...
  var end_screen = {
   type: 'html-button-response',
      timing_post_trial: 0,
      choices: ['End Task'],
      is_html: true,
      stimulus: function(){

        var random_total_points = jsPsych.randomization.sampleWithoutReplacement(total_points_arr, 1);

        var string = 'You have finished the task. Thank you for your contribution to science! \
                 On a randomly selected round, you recevieved ' + random_total_points + ' points. Your bonus will be based on this number. \
              <b> PLEASE CLICK END TASK TO SUBMIT THE TASK TO PROLIFIC </b>.';

      //  db.collection('foragetask').doc(run_name).collection('subjects').doc(uid).collection('taskdata').doc('end').set({
      //    bonus_points: random_total_points,
      //    end_time:  new Date().toLocaleTimeString()
        //})
     return string;
    },
     on_finish: function(){
       //window.location = "https://app.prolific.co/submissions/complete?cc=1177C813"
     }
  }
  //timeline.push(end_screen)

  // recording data...

  // need a screen thanking them for the task and also figuring out the bonus... -- do this tonight
  var instruc_images = instruction_pagelinks_a.concat(instruction_pagelinks_b);

console.log(timeline)

// timeline --

var info_trial = {
  type: 'evan-display-text',
  line_1: "Traveling to a new environment",
  line_2: travel_prompt + ". Press 'u' to harvest",
  line_3: ""
}


  /* start the experiment */
  jsPsych.init({
    timeline: timeline,
    preload_image: instruc_images,
    show_preload_progress_bar: true,
    on_finish: function() {
      console.log('done')
      // download many files...?
      //jsPsych.data.get().localSave('csv','test_res.csv');
    //on_finish: saveData
    }
  });
