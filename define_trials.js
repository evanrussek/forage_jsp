// need to check these 4 sets of trials

var win_o1_trig_trials = [];
var win_o2_trig_trials = [];
var loss_o1_trig_trials = [];
var loss_o2_trig_trials = [];


// function to generate reward quiz

function rand_gen_rew_quiz_main(){

  // generate a reward trial as well
  // set each outcome reward
  //

  var tv_idx  = Math.round(4*Math.random());
  var safe_idx = Math.round(1*Math.random());
  var t_val = all_win_amounts[tv_idx] + -5 + Math.round(10*Math.random());
  var other_val = Math.round(8*Math.random());
  var safe_val = all_win_safe_vals[safe_idx] + - 5 +Math. round(10*Math.random());
  var lure_val = -50 + Math.round(100*Math.random())

  if (Math.random() < 0.5){t_val = -1*t_val; safe_val = -1*safe_val; other_val = -1*other_val};
  if (Math.random() < .5){o1_val = t_val, o2_val = other_val}
  else{o1_val = other_val, o2_val = t_val}

  var these_outcome_vals = [o1_val, o2_val, safe_val];
  var these_outcome_names = [outcome_names[0], outcome_names[1], outcome_names[2]];
  var these_outcome_imgs = [outcome_images[0], outcome_images[1], outcome_images[2]];


  var outcome_idx = Math.round(2*Math.random());
  var this_outcome_val = these_outcome_vals[outcome_idx];
  var this_outcome_img = these_outcome_imgs[outcome_idx];
  var this_outcome_text = these_outcome_names[outcome_idx];

  var all_other_vals = [o1_val, o2_val].concat([safe_val, lure_val]);
  all_other_vals.splice(outcome_idx,1);

 var use_image = (Math.random() < .5);

 this_trial = {
   type: 'evan-run-trial',

   data:{
     phase:'REW TEST 1',
   },
   first_stage: 1,
   last_stage:1,
   show_money_val: true,
   allow_reject: true,
   // these define the trial in the frame useful for analysis
   safe_val_base: all_win_safe_vals[sv_idx], // not the actual val
   p_trigger: all_prob_o1[p_idx], // here p_o1 corresponds to the trigger prob
   trigger_val: all_win_amounts[tv_idx], // win trial
   o1_trigger: null,
   safe_noise: null,
   trigger_noise: null,
   other_noise: null,
   /// define it in terms useful for actually running the trial
   /// which stimulus do we want?
   p_o1: null,
   safe_val: safe_val,
   o1_val: o1_val, // because O1 is the trigger
   o2_val: o2_val,
   ///
   o1_image: outcome_images[0], // set per subject, using subject number -- need to counterbalance this...
   o2_image: outcome_images[1], //
   safe_image: outcome_images[2],
   // this depends on the proability...
   choice_image: choice_images[1] // each choice image corresponds to a probability for o1
 }


  var reward_quiz = {
    type: 'evan-reward-quiz',
    outcome_image: this_outcome_img,
    outcome_name: this_outcome_text,
    outcome_val: this_outcome_val,
    other_vals: all_other_vals,
    use_image: use_image
  }

  return([this_trial, reward_quiz])
}



///note noise is set individually for each trial - maybe though sometimes we want the noise to repeat

// win_o1_trig_trials
for (var sv_idx = 0; sv_idx < all_win_safe_vals.length; sv_idx++){
for (var tv_idx = 0; tv_idx < all_win_amounts.length; tv_idx++){
  for (var p_idx = 0; p_idx < all_prob_o1.length; p_idx++){
    var safe_noise = Math.round(10*Math.random() - 5);
    var trigger_noise = Math.round(10*Math.random() - 5);
    var other_noise = Math.round(5*Math.random());
      this_trial = {
        type: 'evan-run-trial',

        data:{
          // these define the trial in the frame useful for analysis
          safe_val_base: all_win_safe_vals[sv_idx], // not the actual val
          p_trigger: all_prob_o1[p_idx], // here p_o1 corresponds to the trigger prob
          trigger_val: all_win_amounts[tv_idx], // win trial
          o1_trigger: true,
          safe_noise: safe_noise,
          trigger_noise: trigger_noise,
          other_noise: other_noise,
          phase:'TEST',
          choice_number: p_idx + 1
        },

        first_stage: 1,
        last_stage:4,
        show_money_val: true,
        allow_reject: true,
        // these define the trial in the frame useful for analysis
        safe_val_base: all_win_safe_vals[sv_idx], // not the actual val
        p_trigger: all_prob_o1[p_idx], // here p_o1 corresponds to the trigger prob
        trigger_val: all_win_amounts[tv_idx], // win trial
        o1_trigger: true,
        safe_noise: safe_noise,
        trigger_noise: trigger_noise,
        other_noise: other_noise,

        /// define it in terms useful for actually running the trial
        /// which stimulus do we want?
        p_o1: all_prob_o1[p_idx],
        safe_val: all_win_safe_vals[sv_idx] + safe_noise,
        o1_val: all_win_amounts[tv_idx] + trigger_noise, // because O1 is the trigger
        o2_val: 0 + other_noise,
        ///
        o1_image: outcome_images[0], // set per subject, using subject number -- need to counterbalance this...
        o2_image: outcome_images[1], //
        safe_image: outcome_images[2],
        // this depends on the proability...
        choice_image: choice_images[p_idx] // each choice image corresponds to a probability for o1
      }
      win_o1_trig_trials.push(this_trial);
  }
}
}


// win_o2_trig_trials
for (var sv_idx = 0; sv_idx < all_win_safe_vals.length; sv_idx++){
  for (var tv_idx = 0; tv_idx < all_win_amounts.length; tv_idx++){
    for (var p_idx = 0; p_idx < all_prob_o1.length; p_idx++){
      var safe_noise = Math.round(10*Math.random() - 5);
      var trigger_noise = Math.round(10*Math.random() - 5);
      var other_noise = Math.round(5*Math.random());
        this_trial = {
          type: 'evan-run-trial',

          data:{
            // these define the trial in the frame useful for analysis
            safe_val_base: all_win_safe_vals[sv_idx], // not the actual val
            p_trigger: 1 - all_prob_o1[p_idx], // here o2 is the trigger
            trigger_val: all_win_amounts[tv_idx],
            o1_trigger: false,
            safe_noise: safe_noise,
            trigger_noise: trigger_noise,
            other_noise: other_noise,
            phase:'TEST',
            choice_number: p_idx + 1
          },

          first_stage: 1,
          last_stage:4,
          show_money_val: true,
          allow_reject: true,

          /// define it in terms useful for actually running the trial
          /// which stimulus do we want?
          p_o1: all_prob_o1[p_idx],
          safe_val: all_win_safe_vals[sv_idx] + safe_noise,
          o1_val: 0 + other_noise,
          o2_val: all_win_amounts[tv_idx] + trigger_noise, // because O2 is the trigger
          ///
          o1_image: outcome_images[0],
          o2_image: outcome_images[1],
          safe_image: outcome_images[2],
          // this depends on the proability...
          choice_image: choice_images[p_idx]
        }
        win_o2_trig_trials.push(this_trial);
    }
  }
}

// loss_o1_trials
for (var sv_idx = 0; sv_idx < all_win_safe_vals.length; sv_idx++){
  for (var tv_idx = 0; tv_idx < all_win_amounts.length; tv_idx++){
    for (var p_idx = 0; p_idx < all_prob_o1.length; p_idx++){
      var safe_noise = Math.round(10*Math.random() - 5);
      var trigger_noise = Math.round(10*Math.random() - 5);
      var other_noise = Math.round(5*Math.random());
        this_trial = {
          type: 'evan-run-trial',
          data:{
            // these define the trial in the frame useful for analysis
            safe_val_base: all_loss_safe_vals[sv_idx], // not the actual val
            p_trigger: all_prob_o1[p_idx], // here p_o1 corresponds to the trigger prob
            trigger_val: all_loss_amounts[tv_idx], // win trial
            o1_trigger: true,
            safe_noise: safe_noise,
            trigger_noise: trigger_noise,
            other_noise: other_noise,
            phase:'TEST'
          },

          /// define it in terms useful for actually running the trial
          /// which stimulus do we want?
          show_money_val: true,
          first_stage: 1,
          last_stage:4,
          allow_reject: true,
          p_o1: all_prob_o1[p_idx],
          safe_val: all_loss_safe_vals[sv_idx] + safe_noise,
          o1_val: all_loss_amounts[tv_idx] + trigger_noise, // because O1 is the trigger
          o2_val: 0 - other_noise,
          ///
          o1_image: outcome_images[0], // set per subject, using subject number -- need to counterbalance this...
          o2_image: outcome_images[1], //
          safe_image: outcome_images[2],
          // this depends on the proability...
          choice_image: choice_images[p_idx] // each choice image corresponds to a probability for o1
        }
        loss_o1_trig_trials.push(this_trial);
    }
  }
}

// loss_o2_trig_trials
for (var sv_idx = 0; sv_idx < all_win_safe_vals.length; sv_idx++){
  for (var tv_idx = 0; tv_idx < all_win_amounts.length; tv_idx++){
    for (var p_idx = 0; p_idx < all_prob_o1.length; p_idx++){
      var safe_noise = Math.round(10*Math.random() - 5);
      var trigger_noise = Math.round(10*Math.random() - 5);
      var other_noise = Math.round(5*Math.random());
        this_trial = {
          type: 'evan-run-trial',

          data: {
            // these define the trial in the frame useful for analysis
            safe_val_base: all_loss_safe_vals[sv_idx], // not the actual val
            p_trigger: 1 - all_prob_o1[p_idx], // here o2 is the trigger
            trigger_val: all_loss_amounts[tv_idx],
            o1_trigger: false,
            safe_noise: safe_noise,
            trigger_noise: trigger_noise,
            other_noise: other_noise,
            phase:'TEST'
          },

          first_stage: 1,
          last_stage:4,
          show_money_val: true,
          allow_reject: true,

          /// define it in terms useful for actually running the trial
          /// which stimulus do we want?
          p_o1: all_prob_o1[p_idx], // this is always the same
          safe_val: all_loss_safe_vals[sv_idx] + safe_noise,
          o1_val: 0 - other_noise,
          o2_val: all_loss_amounts[tv_idx] + trigger_noise, // because O2 is the trigger
          ///
          o1_image: outcome_images[0],
          o2_image: outcome_images[1],
          safe_image: outcome_images[2],
          // this depends on the proability...
          choice_image: choice_images[p_idx]
        }
        loss_o2_trig_trials.push(this_trial);
    }
  }
}

var all_trials = win_o1_trig_trials.concat(win_o2_trig_trials, loss_o1_trig_trials, loss_o2_trig_trials);
//var all_trials_shuff =  all_trials.slice(0,2);
// add trial_number
// should we be counterbalancing order in some way? // also want a few breaks maybe
var main_task = jsPsych.randomization.repeat(all_trials, 1);
//var all_trials_shuff = all_trials;
// insert a half way through

for (var tn = 0; tn < main_task.length; tn++){
  var b = tn;
  main_task[tn].data.trial_num = b+1;
}

// add random reward quizes into choice_trial quizes
var t_new1 = 0;
var a = main_task.length;
for (var t = 1; t < a; t++){
  t_new1 = t_new1 + 1;
  if (Math.random() < 1/8){
    var quiz = rand_gen_rew_quiz_main();
    main_task.splice(t_new1,0, quiz[0], quiz[1]);
    t_new1 = t_new1 + 1;
  }
}

// add more than just half way marks - maybe 1/4 parts
half_way_txt = build_text_trial("Great job! You're half way through this part of the task.","","",true);
main_task.splice(main_task.length/2, 0, half_way_txt)
test_quiz = rand_gen_rew_quiz_main();
