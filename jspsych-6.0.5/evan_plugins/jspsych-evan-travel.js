/*
 * Example plugin template
 */


// plugin to show either a photo, or a piece of text and ask which reward it was just paired with...
jsPsych.plugins["travel"] = (function() {

  // add time up and record response...

  var plugin = {};

  plugin.info = {
    name: "travel",
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
      }
    }
  }

  plugin.trial = function(display_element, trial) {



    par = define_parameters('trial');

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
    n_travel_steps = trial.n_travel_steps;
    start_reward = trial.start_reward;
    decay = trial.decay;

    person_pos = 1;
    tree_pos = (person_pos + n_travel_steps + 2) % n_steps_screen;
    total_dist = max_pos - min_pos;
    increment = total_dist/n_steps_screen;
    person_x_pos_middle = min_pos + person_pos*increment;
    tree_x_pos_middle = min_pos + tree_pos*increment;
    at_tree = false;

    var press_success_prob_travel = trial.press_success_prob_travel;
    var press_success_prob_harvest = trial.press_success_prob_harvest;

    var travel_key = 'a';
    var travel_key_cap = 'A';
    var harvest_key = 'j';
    var harvest_key_cap = 'J';
    var show_prompt = true;


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


    ////////////////////////////////////////
    // run the travel phase
    var travel_phase = function(){

      if (show_prompt){
          var text = 'Press ' + travel_key_cap + ' to TRAVEL to next tree.';
          d3.select(".prompt").text(text);
        }

      var handle_travel_response = function(info){
          console.log('response heard')
          //jsPsych.pluginAPI.clearAllTimeouts();
          response = info;
          //key_vec.push(response.key)
          //lag_vec.push(response.rt);

          var data = {
            phase: "TRAVEL",
            lag: response.rt,
            key: response.key,
          };
          jsPsych.data.write(data);


          if (Math.random() < press_success_prob_travel){

            person_pos = person_pos+1;
            if (person_pos > n_steps_screen){
              person_pos = 1;
            }
            person_x_pos_middle = min_pos + person_pos*increment;
            d3.select(".person")
              .attr("x", person_x_pos_middle - person_w/2)
          }

          if (tree_pos >= person_pos){
            at_tree = ((tree_pos - person_pos) <= 2);
          }else{
            at_tree = ((n_steps_screen + tree_pos - person_pos) <=  2);
          }

          if (at_tree){
            d3.select(".treecirc").style("fill", "yellow");
            console.log('at tree')
            console.log(person_pos)
            console.log(tree_pos)
            harvest_phase()
          } else{
            // set up the keypress
            var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                  callback_function: handle_travel_response,
                  valid_responses: [travel_key],
                  rt_method: 'performance', // check this
                  persist: false,
                  allow_held_key: false
              });
          }
      } // end handle_travel_response

      // set up the keypress
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: handle_travel_response,
          valid_responses: [travel_key],
          rt_method: 'performance', // check this
          persist: false,
          allow_held_key: false
        });

    } // end the travel phase

    var harvest_phase = function(){ // first press must be harvest

      if (show_prompt){
          var text = 'Press '+ harvest_key_cap + ' to HARVEST or ' + travel_key_cap + ' to TRAVEL to next tree.';
          d3.select(".prompt").text(text)
        }

      // now we want the harvest phase - we want numbers in red to appear above the avatar
      reward_val = start_reward + Math.randomGaussian(0, trial.start_reward_noise);

      var rew_x = person_x_pos_middle;
      var rew_start_y = tree_y + tree_circ_rad;//person_y - 2*person_h;
      var rew_end_y = person_y;

      var handle_harvest_response =   function(info){
            console.log('harvest response heard')
            //jsPsych.pluginAPI.clearAllTimeouts();
            response = info;

            var choice_char = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(response.key);

            reward_obs = reward_val + Math.randomGaussian(0,trial.reward_noise);

            if (choice_char == harvest_key){
              if (Math.random() < press_success_prob_harvest){
                // show the money falling
                rew_im = d3.select("svg").append("text")
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

                      var data = {
                        lag: response.rt,
                        key: response.key,
                        phase: "Harvest",
                        reward_obs: reward_val,
                        reward_true: reward_val,
                        exit: 0,
                        fail: false
                      };
                      jsPsych.data.write(data);


                // decay the reward value
                reward_val = decay*reward_val;
              } // need an else for if choice fails
              else{ // harvest choice failed
                var data = {
                  lag: response.rt,
                  key: response.key,
                  phase: "Harvest",
                  reward_obs: null,
                  reward_true: reward_val,
                  fail: true,
                  exit: 0
                };
                jsPsych.data.write(data);

              }
              // set up the keypress
              var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: handle_harvest_response,
                    valid_responses: [harvest_key, travel_key],
                    rt_method: 'performance', // check this
                    persist: false,
                    allow_held_key: false
                  });
            } // if choice was to leave
            else{
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
                exit: 1
              };
              jsPsych.data.write(data);

              travel_phase();
                // move the tree and call the travel function...
            }

          }           // end handle_travel_response

        // set up the first harvest keypress
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: handle_harvest_response,
              valid_responses: [harvest_key],
              rt_method: 'performance', // check this
              persist: false,
              allow_held_key: false
          });

    } // end harvest_phase


          /// stage 4 - end trial, save data,
      var end_trial = function(){

        if (typeof keyboardListener !== 'undefined') {
              jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }
        d3.select('svg').remove()

        var trial_data = {
              // need to add timing parameters
        };

        jsPsych.finishTrial(trial_data);
      } // end end_trial

      // start the time..
      total_msec = 60*1000*trial.time_min;
      wait_for_time(total_msec, end_trial);
      travel_phase();
  };

  return plugin;
})();
