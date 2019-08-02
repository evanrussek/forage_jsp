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
    }
  }

  plugin.trial = function(display_element, trial) {

    par = define_parameters('trial');

    // more params
    var person = "Stimuli/avatar.svg";
    var person_w = par.h/18;
    var person_h = par.h/18;
    var n_steps_screen = 100; // go from 10 to 90 // so
    var min_pos = 2*person_w;
    var max_pos = par.w - 2*person_w;

    person_pos = 80;
    n_travel_steps = 10;
    tree_pos = (person_pos + n_travel_steps + 1) % n_steps_screen;
    total_dist = max_pos - min_pos;
    increment = total_dist/n_steps_screen;
    person_x_pos_middle = min_pos + person_pos*increment;
    tree_x_pos_middle = min_pos + tree_pos*increment;

    var press_success_prob = 1;

    var travel_key = 'l';
    var harvest_key = 'h';


    var wait_for_time = function(n_msec, next_fun){
      // wait n_msec and then call next function
      jsPsych.pluginAPI.setTimeout(function() {
          next_fun() //
        }, n_msec);
    } // end wait for time


    // place the svg.
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
    var tree_rect_height = par.h/6;
    var tree_x_ctr = tree_x_pos_middle + person_w;
    var tree_y = par.h/2 - tree_rect_height/2;
    // draw the tree
    // rectangle
    d3.select("svg").append("rect")
          .attr("x", tree_x_ctr - tree_rect_width/2).attr("y", tree_y).attr("width", tree_rect_width)
          .attr("height", tree_rect_height).style("fill", "brown").style("opacity",1);

    var tree_circ_rad = par.h/12;
//- tree_rect_height/2  - tree_circ_rad
    d3.select("svg").append("circle")
          .attr("cx", tree_x_ctr).attr("cy", tree_y)
          .attr("r", tree_circ_rad)
          .style("fill", "purple").style("opacity",1);


    place_img(person, "person", person_x_pos_middle - person_w/2, par.h/2,
              person_w, person_h, 1);

    ////////////////////////////////////////

      var handle_response = function(info){
        console.log('response heard')
        jsPsych.pluginAPI.clearAllTimeouts();
        if (response.key == null) {
            response = info;
        }

        if (Math.random() < press_success_prob){

          person_pos = person_pos+1;
          if (person_pos > n_steps_screen){
            person_pos = 0;
          }
          person_x_pos_middle = min_pos + person_pos*increment;
          d3.select(".person")
            .attr("x", person_x_pos_middle - person_w/2)
        }

        // set up the keypress
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: handle_response,
              valid_responses: [travel_key],
              rt_method: 'performance', // check this
              persist: false,
              allow_held_key: false
          });
      }


      // set up the keypress
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: handle_response,
          valid_responses: [travel_key],
          rt_method: 'performance', // check this
          persist: false,
          allow_held_key: false
        });

      var response = {
          rt: null,
          key: null
        };
        var correct = null;

          /// stage 4 - end trial, save data,
          var end_trial = function(){

            if (typeof keyboardListener !== 'undefined') {
              jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
            }
            d3.select('svg').remove()

            var trial_data = {
              "outcome_image": trial.outcome_image,
              "outcome_val": trial.outcome_val,
              "outcome_name": trial.outcome_name,
              "correct": correct,
              "rt": response.rt,
              "key": response.key
              // need to add timing parameters
            };

            jsPsych.finishTrial(trial_data);
          } // end end_trial




    // end trial
    //jsPsych.finishTrial(trial_data);
  };

  return plugin;
})();
