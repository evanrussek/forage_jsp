// create the timeline...

// need to add the consent stuff.
// edit instructions and preload instruction pages


  var full_screen = {
    type: 'fullscreen',
    fullscreen_mode: true
  };

    // we'll vary the travel amount
    var reward_amounts = [50, 75, 100];
    var reward_names = ['LOW', 'MEDIUM', 'HIGH'];
    var travel_names = ['EASY', 'HARD'];
    var harvest_key_seq = ['u'];
    var harvest_prompt = ['u'];

    var travel_key_seq_hard = ['a'];
    var travel_hold_down_keys_hard = ['0', '9', 'm','t','e'];
    var travel_prompt_hard = ["Repeatedly press 'a' (left pinky) while holding down  't' , 'e' (left) and '0', '9', 'm' (right) to travel"];
    var harvest_prompt_hard =  ["Repeatedly press 'u' to harvest or 'a' to travel"];

    var travel_hold_down_keys_easy = ['0', '9', 'm'];
    var travel_key_seq_easy =['f'];
    var travel_prompt_easy = ["Repeatedly press 'f' (left index) while holding down '0', '9', 'm' (right) to travel"];
    var harvest_prompt_easy=  ["Repeatedly press 'u' to harvest or 'f' to travel"];

    var n_rounds = 1;

    var total_points_arr = [];

    var forage_trials = [];
    var trial_num = 0;
    for (r_idx = 0; r_idx < n_rounds; r_idx++){
      var this_round_trials = [];
      for (d_idx = 0; d_idx < 2; d_idx++){ // key difficulty...
        for (rew_idx = 0; rew_idx < reward_amounts.length; rew_idx++){ // travel index
          var this_travel_amount = travel_amounts[ta_idx];
          if (d_idx == 0){ // 0 is easy...
              var this_travel_key_seq = travel_key_seq_easy;
              var this_travel_prompt = travel_prompt_easy;
              var this_travel_held_down_keys = travel_hold_down_keys_easy;
              var this_harvest_prompt = harvest_prompt_easy;
          }else{ // 1 is hard...
            var this_travel_key_seq = travel_key_seq_hard;
            var this_travel_prompt = travel_prompt_hard;
            var this_travel_held_down_keys = travel_hold_down_keys_hard;
            var this_travel_prompt = travel_prompt_hard;
            var this_harvest_prompt = harvest_prompt_hard;
          }
          trial_num = trial_num + 1;
          var this_trial = {
            type: 'travel-mkre',
            start_reward: reward_amounts[rew_idx],
            decay: .98,
            n_travel_steps: 16,
            press_success_prob_travel: .8,
            press_success_prob_harvest: .5,
            reward_noise: 2.5,
            start_reward_noise: 4,
            time_min: 2.34,
            travel_key_seq:this_travel_key_seq,
            travel_prompt: this_travel_prompt,
            harvest_key_seq: harvest_key_seq,
            harvest_prompt: this_harvest_prompt,
            travel_held_down_keys: this_travel_held_down_keys,
            rew_idx: r_idx,
            d_idx: d_idx,
            reward_name: reward_names[rew_idx],
            travel_name: travel_names[d_idx]
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

  var task_name = 'foragetask';

//db.collection("tasks").doc('meg_generalisation_8').collection('subjects').doc(uid).collection('trial_data').doc('trial_' + trial_data.trial_number.toString()).set({trial_data});
var make_info_trial = function


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

// for each trial - before it starts, we should have a screen where it chooses and environment - / then a screen where it translates that
// after the trial ends, we should have a screen where they are told how many points they recieved...

  // recording data...

  // need a screen thanking them for the task and also figuring out the bonus... -- do this tonight
  var instruc_images = instruction_pagelinks_a.concat(instruction_pagelinks_b);

console.log(timeline)

// timeline --

var info_trial = {
  type: 'evan-select-env'
}
timeline = [full_screen, info_trial];

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
