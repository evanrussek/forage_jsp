/*
 * Example plugin template
 */

jsPsych.plugins["evan-display-text"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "evan-display-text",
    parameters: {
      text: {
        type: jsPsych.plugins.parameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: undefined
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // get params
    par = define_parameters('trial');

    var svg = d3.select(".jspsych-content-wrapper")
                .append("svg")
                .attr("width", par.w)
                .attr("height", par.h)

    // place grey background on it
    d3.select("svg").append("rect")
          .attr("x", 0).attr("y", 0).attr("width", par.w)
          .attr("height", par.h).style("fill", par.svg_color).style("opacity",.7);

    place_text(trial.text, 'text', par.w/2, par.h/2, par.text_font_size/2, 1, "White");

    ///////////////////////////////////////


    // put up the svg

    // data saving
    var trial_data = {
      // add time to this...
      text_displayed: trial.text;
    };

    wait_for_time(par.text_info_prac_time,function(){ d3.select('svg').remove(); jsPsych.finishTrial(trial_data);}


  };

  return plugin;
})();
