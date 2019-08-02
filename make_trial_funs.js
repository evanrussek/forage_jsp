// helper function
function normal_random(mean, variance) {
    if (mean === undefined)
    mean = 0.0;
    if (variance === undefined)
    variance = 1.0;
    var V1, V2, S;
    do {
    var U1 = Math.random();
    var U2 = Math.random();
    V1 = 2 * U1 - 1;
    V2 = 2 * U2 - 1;
    S = V1 * V1 + V2 * V2;
    } while (S > 1);

    X = Math.sqrt(-2 * Math.log(S) / S) * V1;
    //Y = Math.sqrt(-2 * Math.log(S) / S) * V2;
    X = mean + Math.sqrt(variance) * X;
    //Y = mean + Math.sqrt(variance) * Y ;
    return X;
}


// need to pre_generate random numbers...


// make trial parameters
var all_win_safe_vals = [16, 32];
var all_loss_safe_vals = [-16, -32];
var all_win_amounts = [35, 51, 67, 84, 99];
var all_loss_amounts = [-35, -51, -67, -84, -99];
var all_prob_o1 = [.2, .4, .6, .8];


var fractal_images = ["img/fractal_A.png",
"img/fractal_B.png",
"img/fractal_C.png",
"img/fractal_D.png"
]

var thing_images = ["img/animal.png",
  "img/camera.png",
  "img/place.png"
]

win_o1_trig_trials = [];
win_o2_trig_trials = [];
loss_o1_trig_trials = [];
loss_o2_trig_trials = [];

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

        first_stage: 2,
        last_stage:4,
        show_money_val: true,
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
        o1_image: thing_images[0], // set per subject, using subject number -- need to counterbalance this...
        o2_image: thing_images[1], //
        safe_image: thing_images[2],
        // this depends on the proability...
        choice_image: fractal_images[p_idx] // each choice image corresponds to a probability for o1
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

          first_stage: 2,
          last_stage:4,
          show_money_val: true,
          // these define the trial in the frame useful for analysis
          safe_val_base: all_win_safe_vals[sv_idx], // not the actual val
          p_trigger: 1 - all_prob_o1[p_idx], // here o2 is the trigger
          trigger_val: all_win_amounts[tv_idx],
          o1_trigger: false,
          safe_noise: safe_noise,
          trigger_noise: trigger_noise,
          other_noise: other_noise,

          /// define it in terms useful for actually running the trial
          /// which stimulus do we want?
          p_o1: all_prob_o1[p_idx], // because o2 is the trigger
          safe_val: all_win_safe_vals[sv_idx] + safe_noise,
          o1_val: 0 + other_noise,
          o2_val: all_win_amounts[tv_idx] + trigger_noise, // because O2 is the trigger
          ///
          o1_image: thing_images[0],
          o2_image: thing_images[1],
          safe_image: thing_images[2],
          // this depends on the proability...
          choice_image: fractal_images[p_idx]
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

          first_stage: 2,
          last_stage:4,
          show_money_val: true,
          // these define the trial in the frame useful for analysis
          safe_val_base: all_loss_safe_vals[sv_idx], // not the actual val
          p_trigger: all_prob_o1[p_idx], // here p_o1 corresponds to the trigger prob
          trigger_val: all_loss_amounts[tv_idx], // win trial
          o1_trigger: true,
          safe_noise: safe_noise,
          trigger_noise: trigger_noise,
          other_noise: other_noise,

          /// define it in terms useful for actually running the trial
          /// which stimulus do we want?
          p_o1: all_prob_o1[p_idx],
          safe_val: all_loss_safe_vals[sv_idx] + safe_noise,
          o1_val: all_loss_amounts[tv_idx] + trigger_noise, // because O1 is the trigger
          o2_val: 0 - other_noise,
          ///
          o1_image: thing_images[0], // set per subject, using subject number -- need to counterbalance this...
          o2_image: thing_images[1], //
          safe_image: thing_images[2],
          // this depends on the proability...
          choice_image: fractal_images[p_idx] // each choice image corresponds to a probability for o1
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

          first_stage: 2,
          last_stage:4,
          show_money_val: true,
          // these define the trial in the frame useful for analysis
          safe_val_base: all_loss_safe_vals[sv_idx], // not the actual val
          p_trigger: 1 - all_prob_o1[p_idx], // here o2 is the trigger
          trigger_val: all_loss_amounts[tv_idx],
          o1_trigger: false,
          safe_noise: safe_noise,
          trigger_noise: trigger_noise,
          other_noise: other_noise,

          /// define it in terms useful for actually running the trial
          /// which stimulus do we want?
          p_o1: all_prob_o1[p_idx], // this is always the same
          safe_val: all_loss_safe_vals[sv_idx] + safe_noise,
          o1_val: 0 - other_noise,
          o2_val: all_loss_amounts[tv_idx] + trigger_noise, // because O2 is the trigger
          ///
          o1_image: thing_images[0],
          o2_image: thing_images[1],
          safe_image: thing_images[2],
          // this depends on the proability...
          choice_image: fractal_images[p_idx]
        }
        loss_o2_trig_trials.push(this_trial);
    }
  }
}

var all_trials = win_o1_trig_trials.concat(win_o2_trig_trials, loss_o1_trig_trials, loss_o1_trig_trials);
var all_trials_shuff = jsPsych.randomization.repeat(all_trials, 1);
