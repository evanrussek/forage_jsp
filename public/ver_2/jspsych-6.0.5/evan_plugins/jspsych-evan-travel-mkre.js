/*
 * Example plugin template
 */


// plugin to show either a photo, or a piece of text and ask which reward it was just paired with...
jsPsych.plugins["travel-mkre"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "travel-mkre",
    parameters: {
      start_reward: {
        type:jsPsych.plugins.parameterType.FLOAT,
        default: undefined
      },
      decay: {
        type:jsPsych.plugins.parameterType.FLOAT,
        default: undefined
      },
      n_travel_steps: {
        type:jsPsych.plugins.parameterType.INT,
        default: undefined
      },
      press_success_prob_travel: {
        type:jsPsych.plugins.parameterType.FLOAT,
        default: undefined
      },
      press_success_prob_harvest: {
        type:jsPsych.plugins.parameterType.FLOAT,
        default: undefined
      },
      reward_noise:{
        type:jsPsych.plugins.parameterType.FLOAT,
        default: undefined
      },
      start_reward_noise:{
        type:jsPsych.plugins.parameterType.FLOAT,
        default: undefined
      },
      time_min:{ // how long should this go?
        type:jsPsych.plugins.parameterType.FLOAT,
        default: undefined
      },
      travel_key_seq:{
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined
      },
      harvest_key_seq:{
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined
      },
      travel_prompt:{
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined
      },
      harvest_prompt:{
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined
      },
      trial_num:{
        type: jsPsych.plugins.parameterType.INT,
        default: undefined
      },
      show_prompt:{
        type: jsPsych.plugins.parameterType.INT,
        default: true
      }
  }}

  plugin.trial = function(display_element, trial) {
    var total_points = 0;

    par = define_parameters('trial');


    // start up travel key sequence and our place in it
    var travel_key_seq = trial.travel_key_seq;
    var travel_key_idx = 0; // want to show the entire sequence on the screen and highlight the key idx...
    var travel_key_idx = travel_key_idx % trial.travel_key_seq.length;
    var travel_current_key = travel_key_seq[travel_key_idx];

    // start up harvest key sequence and our place in it
    var harvest_key_seq = trial.harvest_key_seq;
    console.log(harvest_key_seq)
    var harvest_key_idx = 0;
    var harvest_key_idx = harvest_key_idx % trial.harvest_key_seq.length;
    var harvest_current_key = harvest_key_seq[harvest_key_idx];

    var all_keys = harvest_key_seq.concat(travel_key_seq);

    // more params
    var person = "Stimuli/warrior.svg";
    var person_w = par.h/18;
    var person_h = par.h/18;
    n_steps_screen = 100; // go from 10 to 90 // so
    var min_pos = 2*person_w;
    var max_pos = par.w - 2*person_w;
    var person_y = par.h/2;
    var prompt_txt_y = 9*par.h/10;


    // start parameters
    var n_travel_steps = trial.n_travel_steps;
    var start_reward = trial.start_reward;
    var decay = trial.decay;

    // counter for what round you're on
    var round = 1; // each time you exit, round goes up by 1

    var person_pos = 1;
    var tree_pos = (person_pos + n_travel_steps + 2) % n_steps_screen;
    var total_dist = max_pos - min_pos;
    var increment = total_dist/n_steps_screen;
    var person_x_pos_middle = min_pos + person_pos*increment;
    var tree_x_pos_middle = min_pos + tree_pos*increment;
    var at_tree = false;

    var press_success_prob_travel = trial.press_success_prob_travel;
    var press_success_prob_harvest = trial.press_success_prob_harvest;


    var show_prompt = trial.show_prompt;


    var wait_for_time = function(n_msec, next_fun){
      // wait n_msec and then call next function
      jsPsych.pluginAPI.setTimeout(function() {
          next_fun() //
        }, n_msec);
    } // end wait for time

    // create svg - stimulus background // need to define this here so other funcs can use it
    var svg = d3.select(".jspsych-content-wrapper")
                .append("svg")
                .attr("width", par.w)
                .attr("height", par.h)

    // place grey background on it
    d3.select("svg").append("rect")
          .attr("x", 0).attr("y", 0).attr("width", par.w)
          .attr("height", par.h).style("fill", par.svg_color).style("opacity",.7);


    var tree_rect_width = par.h/20;
    var tree_rect_height = par.h/4;
    var tree_x_ctr = tree_x_pos_middle + person_w;
    var tree_y = par.h/2 - tree_rect_height + person_h;
    // draw the tree
    // rectangle
    d3.select("svg").append("rect").attr("class", "treerect")
          .attr("x", tree_x_ctr - tree_rect_width/2).attr("y", tree_y).attr("width", tree_rect_width)
          .attr("height", tree_rect_height).style("fill", "brown").style("opacity",1);

    var tree_circ_rad = par.h/15;
//- tree_rect_height/2  - tree_circ_rad
    d3.select("svg").append("circle").attr("class","treecirc")
          .attr("cx", tree_x_ctr).attr("cy", tree_y)
          .attr("r", tree_circ_rad)
          .style("fill", "purple").style("opacity",1);


    place_img(person, "person", person_x_pos_middle - person_w/2,person_y,
              person_w, person_h, 1);

    place_text("" , "prompt", par.w/2, prompt_txt_y, par.h/40, 1, "White")

    var draw_travel_keys = function(){
      d3.selectAll(".travel_keys").remove();
      // want the center to be at w/2 - w/2 - travel_key_seq.length/2*w/4
      var el_space = par.w/30;
      var key_ctr = par.w/3;
      var y_ctr = 4.5*par.h/6;
      for (tk = 0; tk < travel_key_seq.length; tk++){

        if (tk == (travel_key_idx - 1)){var current_color = "blue"}else{var current_color = "white"}
        if ((travel_key_idx == 0) & ((tk == travel_key_seq.length - 1)) & (!first_press)) {var current_color = "blue"}
        d3.select("svg").append("text")
                  .attr("class", "travel_keys")
                  .attr("x",  key_ctr - (travel_key_seq.length/2)*el_space + el_space*tk)
                  .attr("y", y_ctr)
                  .attr("font-family","sans-serif")
                  .attr("font-weight","normal")
                  .attr("font-size",person_h/2)
                  .attr("text-anchor","middle")
                  .attr("fill", current_color)
                  .style("opacity",1)
                  .text(travel_key_seq[tk])

          if (tk < travel_key_seq.length - 1){
            d3.select("svg").append("text")
                .attr("class", "travel_keys")
                .attr("x",  key_ctr - (travel_key_seq.length/2)*el_space + el_space*tk + el_space/2)
                .attr("y",y_ctr)
                .attr("font-family","sans-serif")
                .attr("font-weight","normal")
                .attr("font-size",person_h/4)
                .attr("text-anchor","middle")
                .attr("fill", "white")
                .style("opacity",1)
                .text('>')
          }
      }


      d3.select("svg").append("text")
          .attr("class", "travel_keys")
          .attr("x",  key_ctr - (travel_key_seq.length/2)*el_space)
          .attr("y", y_ctr - par.h/15)
          .attr("font-family","sans-serif")
          .attr("font-weight","normal")
          .attr("font-size",person_h/2)
          .attr("text-anchor","middle")
          .attr("fill", "white")
          .style("opacity",1)
          .text('Travel:')

        //  first_press = false
    }

    var draw_harvest_key = function(){
      // just a single key for now
      d3.selectAll(".harvest_keys").remove();
      // want the center to be at w/2 - w/2 - travel_key_seq.length/2*w/4
      var el_space = par.w/30;
      var key_ctr = 2*par.w/3;
      var y_ctr = 4.5*par.h/6;
      //for (tk = 0; tk < trial.harvest_key_seq.length; tk++){

        //if (tk == (harvest_key_idx - 1)){var current_color = "white"}else{var current_color = "white"}
        //if ((harvest_key_idx == 0) & ((tk == harvest_key_seq.length - 1)) & (!first_press)) {var current_color = "white"}
        d3.select("svg").append("text")
                  .attr("class", "harvest_keys")
                  .attr("x",  key_ctr - (1/2)*el_space)
                  .attr("y", y_ctr)
                  .attr("font-family","sans-serif")
                  .attr("font-weight","normal")
                  .attr("font-size",person_h/2)
                  .attr("text-anchor","middle")
                  .attr("fill", "white")
                  .style("opacity",1)
                  .text(harvest_key_seq[0])
    //}
    d3.select("svg").append("text")
        .attr("class", "harvest_keys")
        .attr("x",  key_ctr - (harvest_key_seq.length/2)*el_space)
        .attr("y", y_ctr - par.h/15)
        .attr("font-family","sans-serif")
        .attr("font-weight","normal")
        .attr("font-size",person_h/2)
        .attr("text-anchor","middle")
        .attr("fill", "white")
        .style("opacity",1)
        .text('Harvest:')
  }


    ////////////////////////////////////////
    // run the travel phase
    var travel_phase = function(){

      if (show_prompt){
          //var text = 'Press ' + travel_key_cap + ' to TRAVEL to next tree.';
          var text = 'Press TRAVEL sequence to Travel to the next tree.'
          d3.select(".prompt").text(text);
        }
      first_press = true
      draw_travel_keys();
      draw_harvest_key();
      console.log('travel_key_idx' + travel_key_idx)


      var handle_travel_response = function(info){
        first_press = false;

        console.log('response heard')
        if (typeof keyboardListener !== 'undefined') {
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }

        response = info;
        var choice_char = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(response.key);

        // if they got the wrong key, just record the data and recall the response handler.
        if (choice_char != travel_current_key){
          console.log('wrong key')

          var data = {
            phase: "TRAVEL",
            lag: response.rt,
            key: response.key,
            start_reward: trial.start_reward,
            decay: trial.decay,
            n_travel_steps: trial.n_travel_steps,
            press_success_prob_travel: trial.press_success_prob_travel,
            press_success_prob_harvest: trial.press_success_prob_harvest,
            reward_noise: trial.reward_noise,
            start_reward_noise: trial.start_reward_noise,
            time_min: trial.time_min,
            travel_key: trial.travel_prompt,
            harvest_key: trial.harvest_prompt,
            person_pos: person_pos,
            tree_pos: tree_pos,
            success: false,
            correct_key: false,
            round: round,
            total_points: total_points,
            trial_num: trial.trial_num,
            key: choice_char
          };

          jsPsych.data.write(data);

          // set up the keypress
          keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: handle_travel_response,
                valid_responses: travel_key_seq,
                rt_method: 'performance', // check this
                persist: false,
                allow_held_key: false
            });

        } // end case for where they pressed the wrong key
        else{ // if they got the right key
          console.log('correct key')
          // update the sequence ...
          // update current key
          travel_key_idx = (travel_key_idx + 1) % travel_key_seq.length;
          travel_current_key = travel_key_seq[travel_key_idx];
          // check if the move fails - then same thing, except we update the sequecne
          if (Math.random() > press_success_prob_travel){
            console.log('move failed')
             var data = {
               phase: "TRAVEL",
               lag: response.rt,
               key: response.key,
               start_reward: trial.start_reward,
               decay: trial.decay,
               n_travel_steps: trial.n_travel_steps,
               press_success_prob_travel: trial.press_success_prob_travel,
               press_success_prob_harvest: trial.press_success_prob_harvest,
               reward_noise: trial.reward_noise,
               start_reward_noise: trial.start_reward_noise,
               time_min: trial.time_min,
               travel_key: trial.travel_prompt,
               harvest_key: trial.harvest_prompt,
               person_pos: person_pos,
               tree_pos: tree_pos,
               success: false,
               correct_key: true,
               round: round,
               total_points: total_points,
               trial_num: trial.trial_num,
               key: choice_char
             };

             jsPsych.data.write(data);

             // set up the keypress
             keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                   callback_function: handle_travel_response,
                   valid_responses: travel_key_seq,
                   rt_method: 'performance', // check this
                   persist: false,
                   allow_held_key: false
               });
           } // end check for move failing
           else{ // move succeeded
             console.log('move succeeded')

             // if they got the right key, and it was successful, move the person forward
             var data = {
               phase: "TRAVEL",
               lag: response.rt,
               key: response.key,
               start_reward: trial.start_reward,
               decay: trial.decay,
               n_travel_steps: trial.n_travel_steps,
               press_success_prob_travel: trial.press_success_prob_travel,
               press_success_prob_harvest: trial.press_success_prob_harvest,
               reward_noise: trial.reward_noise,
               start_reward_noise: trial.start_reward_noise,
               time_min: trial.time_min,
               travel_key: trial.travel_prompt,
               harvest_key: trial.harvest_prompt,
               person_pos: person_pos,
               tree_pos: tree_pos,
               success: true,
               correct_key: true,
               round: round,
               total_points: total_points,
               trial_num: trial.trial_num,
               key: choice_char
             };

             jsPsych.data.write(data);


             person_pos = person_pos+1;
             if (person_pos > n_steps_screen){
               person_pos = 1;
             }
             person_x_pos_middle = min_pos + person_pos*increment;
             d3.select(".person")
               .attr("x", person_x_pos_middle - person_w/2)

             if (tree_pos >= person_pos){  // check if we're at the tree
                at_tree = ((tree_pos - person_pos) <= 2);
             }else{
                at_tree = ((n_steps_screen + tree_pos - person_pos) <=  2);
              }

              if (at_tree){ // if we're at the tree, change the color and call the harvest phase.
                d3.select(".treecirc").style("fill", "yellow");
                console.log('at tree')
                console.log(person_pos)
                console.log(tree_pos)

                // reset the travel key
                travel_key_idx = 0;
                travel_current_key = travel_key_seq[travel_key_idx];

                harvest_phase();
              }else{
                // otherwise, re-call the keyboard listener for another travel phase
                // set up the keypress
                 keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: handle_travel_response,
                    valid_responses: travel_key_seq,
                    rt_method: 'performance', // check this
                    persist: false,
                    allow_held_key: false
                  });

              } // end we're not at the tree
            } // end successful move if
          } // end correct key
          draw_travel_keys();
          console.log(travel_current_key)
        } // end handle travel response
        // need a keyboard listener for the first time
        // set up the keypress
         keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: handle_travel_response,
            valid_responses: travel_key_seq,
            rt_method: 'performance', // check this
            persist: false,
            allow_held_key: false
          });
    } //end travel phase


    var harvest_phase = function(){ // first press must be harvest

      first_press = true;
      draw_harvest_key();
      draw_travel_keys();

      if (show_prompt){
      //    var text = 'Press sequence '+ trial.harvest_prompt + ' to HARVEST or ' + trial.travel_prompt + ' to TRAVEL to next tree.';
          var text = 'Press the harvest key to HARVEST or start TRAVEL sequence to travel next tree.';
          d3.select(".prompt").text(text)
        }

      // now we want the harvest phase - we want numbers in red to appear above the avatar
      reward_val = start_reward + Math.randomGaussian(0, trial.start_reward_noise);

      var rew_x = person_x_pos_middle;
      var rew_start_y = tree_y + tree_circ_rad;//person_y - 2*person_h;
      var rew_end_y = person_y;

      var handle_harvest_response =   function(info){
            first_press = false

            console.log('harvest response heard')
            //jsPsych.pluginAPI.clearAllTimeouts();
            // kill keyboard listeners
            if (typeof keyboardListener !== 'undefined') {
              jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
            }

            response = info;

            var choice_char = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(response.key);

            reward_obs = reward_val + Math.randomGaussian(0,trial.reward_noise);


            if (choice_char == travel_current_key){ // if travel key was pressed...
              travel_key_idx = (travel_key_idx + 1) % trial.travel_key_seq.length;
              travel_current_key = travel_key_seq[travel_key_idx];

              // move the tree
              tree_pos = ((person_pos + n_travel_steps + 2) % n_steps_screen);
              tree_x_pos_middle = min_pos + tree_pos*increment;
              var tree_x_ctr = tree_x_pos_middle + person_w;
              // also move the person one step forward

              // place the tree in a new place...
              d3.select(".treecirc")
                .attr("cx", tree_x_ctr)
                .style("fill", "purple")

              d3.select(".treerect")
                .attr("x", tree_x_ctr - tree_rect_width/2)

              // move the person
              person_pos = person_pos+1;
              if (person_pos > n_steps_screen){
                person_pos = 1;
              }
              person_x_pos_middle = min_pos + person_pos*increment;

              d3.select(".person")
                .attr("x", person_x_pos_middle - person_w/2)

              console.log('Leaving!')
              var data = {
                lag: response.rt,
                key: response.key,
                phase: "Harvest",
                reward_obs: null,
                fail: null,
                exit: 1,
                start_reward: trial.start_reward,
                decay: trial.decay,
                n_travel_steps: trial.n_travel_steps,
                press_success_prob_travel: trial.press_success_prob_travel,
                press_success_prob_harvest: trial.press_success_prob_harvest,
                reward_noise: trial.reward_noise,
                start_reward_noise: trial.start_reward_noise,
                time_min: trial.time_min,
                travel_key: trial.travel_prompt,
                harvest_key: trial.harvest_prompt,
                person_pos: person_pos,
                tree_pos: tree_pos,
                round: round,
                total_points: total_points,
                trial_num: trial.trial_num,
                key: choice_char
              };
              jsPsych.data.write(data);
              round = round + 1;
              travel_phase();
                // move the tree and call the travel function...
            } // end if travel key was pressed
            else{ // if travel key was not pressed


            if (choice_char == harvest_current_key){ // if current harvest key was pressed
              console.log('harvest key pressed')
              // update the harvest key
              harvest_key_idx = (harvest_key_idx + 1) % trial.harvest_key_seq.length;
              harvest_current_key = harvest_key_seq[harvest_key_idx];

             // chose to harvest
              if (Math.random() < press_success_prob_harvest){ // if the press succeeded
                // show the money falling
                var rew_im = d3.select("svg").append("text")
                          .attr("class", "reward")
                          .attr("x",  rew_x)
                          .attr("y",rew_start_y)
                          .attr("font-family","sans-serif")
                          .attr("font-weight","normal")
                          .attr("font-size",person_h/2)
                          .attr("text-anchor","middle")
                          .attr("fill", "red")
                          .style("opacity",1)
                          .text(Math.round(reward_obs))

                  rew_im.transition()
                      .attr("y", rew_end_y)
                      .style("opacity",0)
                      //.ease("easeLinear")
                      .duration(800)
                      .remove()
                  // update total points
                    total_points = Math.round(total_points + reward_obs);

                      var data = {
                        lag: response.rt,
                        key: response.key,
                        phase: "HARVEST",
                        reward_obs: reward_obs,
                        reward_true: reward_val,
                        exit: 0,
                        success: true,
                        start_reward: trial.start_reward,
                        decay: trial.decay,
                        n_travel_steps: trial.n_travel_steps,
                        press_success_prob_travel: trial.press_success_prob_travel,
                        press_success_prob_harvest: trial.press_success_prob_harvest,
                        reward_noise: trial.reward_noise,
                        start_reward_noise: trial.start_reward_noise,
                        time_min: trial.time_min,
                        travel_key: trial.travel_prompt,
                        harvest_key: trial.harvest_prompt,
                        person_pos: person_pos,
                        correct_key: true,
                        tree_pos: tree_pos,
                        round: round,
                        total_points: total_points,
                        trial_num: trial.trial_num,
                        key: choice_char
                      };
                      jsPsych.data.write(data);


                // decay the reward value
                reward_val = decay*reward_val;
              } // end press succeeded case
              else{ // harvest key pressed, but the choice failed...
                var data = {
                  lag: response.rt,
                  key: response.key,
                  phase: "HARVEST",
                  reward_obs: null,
                  reward_true: reward_val,
                  success: false,
                  exit: 0,
                  start_reward: trial.start_reward,
                  decay: trial.decay,
                  n_travel_steps: trial.n_travel_steps,
                  travel_key: trial.travel_prompt,
                  harvest_key: trial.harvest_prompt,
                  press_success_prob_travel: trial.press_success_prob_travel,
                  press_success_prob_harvest: trial.press_success_prob_harvest,
                  reward_noise: trial.reward_noise,
                  start_reward_noise: trial.start_reward_noise,
                  time_min: trial.time_min,
                  person_pos: person_pos,
                  tree_pos: tree_pos,
                  correct_key: true,
                  round: round,
                  total_points: total_points,
                  trial_num: trial.trial_num,
                  key: choice_char
                };
                jsPsych.data.write(data);
              }
              // wait for data regardless of whether key press worked
               keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: handle_harvest_response,
                    valid_responses: all_keys,//[harvest_current_key, travel_current_key],
                    rt_method: 'performance', // check this
                    persist: false,
                    allow_held_key: false
                  });
            } // end if correct harvest key pressed...
            else{ // if wrong key in sequence was pressed, record it but don't update and recall keyboard listener

              console.log('wrong key')

              var data = {
                phase: "HARVEST",
                lag: response.rt,
                key: response.key,
                start_reward: trial.start_reward,
                decay: trial.decay,
                n_travel_steps: trial.n_travel_steps,
                press_success_prob_travel: trial.press_success_prob_travel,
                press_success_prob_harvest: trial.press_success_prob_harvest,
                reward_noise: trial.reward_noise,
                start_reward_noise: trial.start_reward_noise,
                time_min: trial.time_min,
                travel_key: trial.travel_prompt,
                harvest_key: trial.harvest_prompt,
                person_pos: person_pos,
                tree_pos: tree_pos,
                success: false,
                correct_key: false,
                round: round,
                total_points: total_points,
                trial_num: trial.trial_num,
                key: choice_char
              };

              jsPsych.data.write(data);


              // set up the keypress
               keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: handle_harvest_response,
                    valid_responses: all_keys,// [harvest_current_key, travel_current_key],
                    rt_method: 'performance', // check this
                    persist: false,
                    allow_held_key: false
                  });

            }
          } // end travel key not pressed

        }           // end handle_harvest_response


        // reset harvest key to 0
        harvest_key_idx = 0;
        harvest_current_key = trial.harvest_key_seq[harvest_key_idx];
        // set up the first harvest keypress
         keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: handle_harvest_response,
              valid_responses: [harvest_current_key],
              rt_method: 'performance', // check this
              persist: false,
              allow_held_key: false
          });

    } // end harvest_phase


          /// stage 4 - end trial, save data,
      var end_trial = function(){

        person_pos = null;
        tree_pos = null;
        at_tree = false;
        reward_val = null;

        if (typeof keyboardListener !== 'undefined') {
              jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }
        d3.select('svg').remove()

        var trial_data = {
              total_points: total_points
        };

        jsPsych.finishTrial(trial_data);
      } // end end_trial

      // start the time..
      total_msec = 60*1000*trial.time_min;
      wait_for_time(total_msec, end_trial);
      travel_phase();
  };
  // count the round number

  return plugin;
})();
