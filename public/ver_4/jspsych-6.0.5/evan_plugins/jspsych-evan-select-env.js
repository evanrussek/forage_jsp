/*
 * Example plugin template
 */

jsPsych.plugins["evan-select-env"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "evan-select-env",
    parameters: {
      rew_cond: {
        type: jsPsych.plugins.parameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: ''
      },
      travel_cond: {
        type: jsPsych.plugins.parameterType.STRING,
        default: ''
    },
    travel_text: {
      type: jsPsych.plugins.parameterType.STRING,
      default: ''
    },
    wait_for_press: {
      type: jsPsych.plugins.parameterType.BOOL,
      default: true
    }
  }
}

  plugin.trial = function(display_element, trial) {

    // define the response that we'll append
    var response = {
        rt: null,
        key: null
      };


    var wait_for_time = function(n_msec, next_fun){
      // wait n_msec and then call next function
      jsPsych.pluginAPI.setTimeout(function() {
          next_fun() //
        }, n_msec);
    } // end wait for time


    // get params
    var par = define_parameters('trial');
    par.text_font_size = 50;


    var svg = d3.select(".jspsych-content-wrapper")
                .append("svg")
                .attr("width", par.w)
                .attr("height", par.h)

    // place grey background on it
    d3.select("svg").append("rect")
          .attr("x", 0).attr("y", 0).attr("width", par.w)
          .attr("height", par.h).style("fill", par.svg_color).style("opacity",.7);

   place_text("Choosing a next environment...", "prompt", par.w/4, par.h/8, 45, 1, "White")
   place_text("Tree point richness: ", "prompt", par.w/3, par.h/5, 35, 1, "blue")
   place_text("Travel key press: ", "prompt", 1.75*par.w/3, par.h/5, 35, 1, "red")

   var rect_height = par.h/8

    // left rectangles

    d3.select("svg").append("rect").attr("class", "HIGH")
          .attr("x", par.w/2 - par.w/5).attr("y", par.h/4).attr("width", par.w/6)
          .attr("height", rect_height).style("fill", 'blue').style("opacity",.025);

   place_text("HIGH", "HIGH", par.w/3 + par.w/21, par.h/4 + rect_height/2 + 12, 35, .25, "white")

    // show a rectangle
    d3.select("svg").append("rect").attr("class", "MEDIUM")
          .attr("x", par.w/2 - par.w/5).attr("y", par.h/4 + par.h/6).attr("width", par.w/6)
          .attr("height", rect_height).style("fill", 'blue').style("opacity",.025);

    place_text("MEDIUM", "MEDIUM", par.w/3 + par.w/21, par.h/4 + par.h/6 + rect_height/2 + 12, 35, .25, "white")

    // show a rectangle
    d3.select("svg").append("rect").attr("class", "LOW")
          .attr("x", par.w/2 - par.w/5).attr("y", par.h/4 + 2*par.h/6 ).attr("width", par.w/6)
          .attr("height", rect_height).style("fill", 'blue').style("opacity",.025);

    place_text("LOW", "LOW", par.w/3 + par.w/21, par.h/4 + 2*par.h/6 + rect_height/2 + 12, 35, .25, "white")

    // right rectangles
    d3.select("svg").append("rect").attr("class", "EASY")
          .attr("x", par.w/2 - par.w/6 + par.w/5).attr("y", par.h/3).attr("width", par.w/6)
          .attr("height", rect_height).style("fill", 'red').style("opacity",.025);

    place_text("EASY", "EASY", par.w/2 - par.w/6 + par.w/5+ par.w/12, par.h/3 + rect_height/2 + 12, 35, .25, "white")

    // show a rectangle
    d3.select("svg").append("rect").attr("class", "HARD")
          .attr("x", par.w/2 - par.w/6 + par.w/5).attr("y", par.h/3 + par.h/6 ).attr("width", par.w/6)
          .attr("height", rect_height).style("fill", 'red').style("opacity",.025);

    place_text("HARD", "HARD",  par.w/2 - par.w/6 + par.w/5+ par.w/12, par.h/3 + par.h/6 + rect_height/2 + 12, 35, .25, "white")

    wait_for_time(1000,function(){
      d3.selectAll('.' + trial.rew_cond).transition().style("opacity", 1).duration(1000)
    })
    wait_for_time(2000,function(){
      d3.selectAll('.' + trial.travel_cond).transition().style("opacity", 1).duration(1000)
    }

    // show the travel prompt -- to travel in this environment
  );


    // wait for about one second...

    ///////////////////////////////////////


    // put up the svg


    var valid_responses = ['4'];

    if (trial.wait_for_press){
      // set up max response time?
      var txt_y =  .9*par.h;
      var prompt = 'Press 4 to continue'
      place_text(prompt, "prompt", par.w/2, txt_y, 28, 1, "White")

      var handle_response = function(info){
        jsPsych.pluginAPI.clearAllTimeouts();

        if (response.key == null) {
            response = info;
        }

        // data saving
        var trial_data = {
          // add time to this...
          //line_1: trial.line_1,
          //line_2: trial.line_2,
          //line_3: trial.line_3,
          rt: response.rt
        };


        // kill keyboard listeners
        if (typeof keyboardListener !== 'undefined') {
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }

        d3.select('svg').remove(); jsPsych.finishTrial(trial_data);
      }

      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: handle_response,
          valid_responses: valid_responses,
          rt_method: 'performance', // check this
          persist: false,
          allow_held_key: false
        });
    }else{
      wait_for_time(par.text_info_prac_time,function(){ d3.select('svg').remove(); jsPsych.finishTrial(trial_data);});
    }

  };

  return plugin;
})();
