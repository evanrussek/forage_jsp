// this could also be a trial // for the scanner, add the date and time, and other info

var subject_num = 1; // need to get this from JSPSYCH
var cond_idx = subject_num%12;

var both_idx_vec = [[0,0], [0,1], [0,2],
      [1,0], [1,1], [1,2],
      [2,0], [2,1], [2,2],
      [3,0], [3,1], [3,2]];

// define these states from counterbalance / 12 states
var choice_state_idx = both_idx_vec[cond_idx][0];
var outcome_state_idx = both_idx_vec[cond_idx][1];

var pos_outcome_assigments = [[0, 1, 2],
                          [2, 0, 1],
                          [1, 2, 0]];

var pos_choice_assignments = [[0,1,2,3],
                          [3,0,1,2],
                          [2,3,0,1],
                          [1,2,3,0]];

var choice_idx_vec = pos_choice_assignments[choice_state_idx]
var outcome_idx_vec = pos_outcome_assigments[outcome_state_idx];

var outcome_names = ["GIRL", "HOUSE", "BANANA"];
var choice_names = ["HAND", "PINECONE", "BUTTERFLY", "SCISSORS"];

var pos_outcome_images = ["Stimuli/Evan_Stimuli/Girl.png",
                  "Stimuli/Evan_Stimuli/House.png",
                  "Stimuli/Evan_Stimuli/Banana.png"];

var pos_choice_images = ["Stimuli/Evan_Stimuli/Hand.png",
                  "Stimuli/Evan_Stimuli/Pinecone.png",
                  "Stimuli/Evan_Stimuli/Butterfly.png",
                  "Stimuli/Evan_Stimuli/Scissors.png",
                ];

var choice_images = [pos_choice_images[choice_idx_vec[0]],
                      pos_choice_images[choice_idx_vec[1]],
                      pos_choice_images[choice_idx_vec[2]],
                      pos_choice_images[choice_idx_vec[3]]];

var outcome_images = [pos_outcome_images[outcome_idx_vec[0]],
                      pos_outcome_images[outcome_idx_vec[1]],
                      pos_outcome_images[outcome_idx_vec[2]]];

// this is constant for all subjects
var all_prob_o1 = [.2, .4, .6, .8];
var all_win_safe_vals = [16, 32];
var all_loss_safe_vals = [-16, -32];
var all_win_amounts = [35, 51, 67, 84, 99];
var all_loss_amounts = [-35, -51, -67, -84, -99];
