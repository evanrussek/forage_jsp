/**
 * jspsych-image-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["evan-disp-trial-info"] = (function() {

  var plugin = {};

  //jsPsych.pluginAPI.registerPreload('image-keyboard-response', 'stimulus', 'image');

  //jsPsych.pluginAPI.convertKeyCharacterToKeyCode('a')

  plugin.info = {
    name: 'image-keyboard-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // stage 1 - display trial info
    // display the info

    var info_time = 100; // display info for 2 seconds before fade
    var info_fade_time = 100;
    var parentDiv = document.body;
    var w = parentDiv.clientWidth;
    var h = parentDiv.clientHeight;

    // background color
    var svg_color = d3.rgb(150, 150, 150);
    var background_width = 2*w/4;
    var background_height = 3*h/4;
    var good_color_vec = ["#202030", "#5D556A", "#635C51", "#B0A990"];
    var info_bkg_color = good_color_vec[0];
    var image_width = background_height/5;
    var image_height = background_height/5;
    var image_x = w/2 - image_width;
    var image_y_vec =  [h/2 - image_height/2 - background_height/3,
                        h/2 - image_height/2,
                        h/2 - image_height/2 + background_height/3];
    var outcome_images = ["img/animal.png",
        "img/camera.png",
        "img/place.png"
    ]
    var choice_images = ["img/fractal_A.png",
      "img/fractal_B.png",
      "img/fractal_C.png"
    ]

    var img_bkg_width = background_width/2;
    var img_bkg_height = 2*background_height/7;

    var img_bkg_color =  good_color_vec[2];

    var img_bkg_x = w/2 - background_width/2 + background_width/4;
    var img_bkg_y_vec = [image_y_vec[0] + image_height/2 - img_bkg_height/2,
                        image_y_vec[1] + image_height/2 - img_bkg_height/2,
                        image_y_vec[2] + image_height/2 - img_bkg_height/2];


    var text_color = "yellow";
    var text_x = w/2 + image_width/2;
    var text_font_size = 2*image_height/5;
    var text_y_vec = [image_y_vec[0] + image_height/2 + text_font_size/2,
                      image_y_vec[1] + image_height/2 + text_font_size/2,
                      image_y_vec[2] + image_height/2 + text_font_size/2];

    var choice_bkg_color =  good_color_vec[3];

    var choice_stim_bkg_color = good_color_vec[2];
    var choice_stim_bkg_height = 2*background_width / 3;
    var choice_stim_bkg_width = 2*background_width / 3;
    var choice_stim_bkg_x = w/2 - choice_stim_bkg_width/2;
    var choice_stim_bkg_y = h/2 - choice_stim_bkg_height/2;

    var choice_stim_height = 2*choice_stim_bkg_height / 3;
    var choice_stim_width = 2*choice_stim_bkg_width / 3;
    var choice_stim_x = w/2 - choice_stim_width/2;
    var choice_stim_y = h/2 - choice_stim_height/2;

    var outcome_img_bkg_height = img_bkg_height;
    var outcome_img_bkg_width = img_bkg_width;
    var outcome_img_bkg_x = w/2 - outcome_img_bkg_width/2;
    var outcome_img_bkg_y = h/2 - outcome_img_bkg_height/2;

    var outcome_img_height = image_height;
    var outcome_img_width = image_width;
    var outcome_img_x = image_x;
    var outcome_img_y = h/2 - outcome_img_width/2;

    var outcome_text_x = text_x;
    var outcome_text_y = text_y_vec[1];
    var outcome_text_font_size = text_font_size;


  // helper functions for displaying stimuli
  // create svg
  var svg = d3.select(parentDiv)
          .append("svg")
          .attr("width", w)
          .attr("height", h)

  // palce global background
  svg.append("rect")
        .attr("x", 0).attr("y", 0).attr("width", w)
        .attr("height", h).style("fill", svg_color).style("opacity",.7);

    var place_stg_bkg = function(class_name,color) {
      // place stage background
      // only thing that changes here is the class_name and the color
        svg.append("rect")
            .attr("class", class_name)
            .attr("x", w/2 - background_width/2)
            .attr("y", h/2 - background_height/2)
            .attr("width", background_width)
            .attr("height", background_height)
            .style("fill", color)
            .style("opacity",.7);
    };

    var place_img_bkg = function(class_name,x,y,width,height,color, opacity){
      svg.append("rect")
              .attr("class",class_name)
              .attr("x", x)
              .attr("y", y)
              .attr("width", width)
              .attr("height", height)
              .style("fill", color)
              .style("opacity",opacity);
    }

    var place_img = function(im_name, class_name, x, y, width, height, opacity){
      svg.append("svg:image").attr("class", class_name).attr("x", x)
          .attr("y", y).attr("width",width).attr("height",height)
          .attr("xlink:href", im_name).style("opacity",opacity);
    }

    var place_reward = function(magnitude, class_name, x, y, font_size, opacity){
       svg.append("text")
                 .attr("class", class_name)
                 .attr("x",  x)
                 .attr("y", y)
                 .attr("font-family","monospace")
                 .attr("font-weight","bold")
                 .attr("font-size",font_size)
                 .attr("text-anchor","middle")
                 .attr("fill", "yellow")
                 .style("opacity",opacity)
                 .text(magnitude)
    }


    var display_trial_info = function(){

      d3.select(".jspsych-content-wrapper").remove();



      // place stage background
      place_stg_bkg("info",info_bkg_color);

      // place every image specific background and every image on top of it
      for (var i=0; i<3; i++){
        place_img_bkg("info",img_bkg_x,img_bkg_y_vec[i],img_bkg_width,img_bkg_height,img_bkg_color,1);
        place_img(outcome_images[i], "info", image_x, image_y_vec[i], image_width, image_height,1);
        place_reward(50, "info", text_x, text_y_vec[i], text_font_size,1);
      }

      // set trial duration, call next function (remove info stimuli)
      jsPsych.pluginAPI.setTimeout(function() {
          remove_info_stimuli() //
        }, info_time);

    } // end display trial info


    var remove_info_stimuli = function(){
      // fade out stimuli then remove, then call next function
      console.log('remove stimuli')
      // do we need to do this more carefully?
      d3.selectAll('.info')
        .call(setupRemove)
        .transition()
        .style("opacity",0)
        .duration(info_fade_time)
        .on('end', onRemove)
        .remove()

        function setupRemove(sel) {
          counter = sel.size();
        }

      function onRemove() {
        counter--;
        if(counter == 0) {
          console.log("all done");
          choice_stage();
        }
      }
    }

    var choice_stage = function(){
      // put up the stage background
      place_stg_bkg("choice_stim",choice_bkg_color);

      // put up the accept outcome 1  (just 1 for now)outcome_img_height
      place_img_bkg("ob",outcome_img_bkg_x,outcome_img_bkg_y,outcome_img_bkg_width,outcome_img_bkg_height,img_bkg_color,0);
      place_img(outcome_images[0], "oa0", outcome_img_x, outcome_img_y, outcome_img_width, outcome_img_height,0);
      place_reward(50, "oa0", outcome_text_x, outcome_text_y, outcome_text_font_size,0);

      // accept outcome 2
      place_img(outcome_images[1], "oa1", outcome_img_x, outcome_img_y, outcome_img_width, outcome_img_height,0);
      place_reward(20, "oa1", outcome_text_x, outcome_text_y, outcome_text_font_size,0);

      // reject outcome
      place_img(outcome_images[2], "or", outcome_img_x, outcome_img_y, outcome_img_width, outcome_img_height,0);
      place_reward(70, "or", outcome_text_x, outcome_text_y, outcome_text_font_size,0);

      // put up the image background
      place_img_bkg("choice_stim",choice_stim_bkg_x,choice_stim_bkg_y,
                    choice_stim_bkg_width,choice_stim_bkg_height,choice_stim_bkg_color,1);
      place_img(choice_images[1], "choice_stim", choice_stim_x,
                            choice_stim_y, choice_stim_width, choice_stim_height,1);

      // place both outcome images at 0 opacity

    // start the response listener
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: choice_feedback,
        valid_responses: ['a','r'],
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    } // end choice stage

    var choice_feedback = function(info){

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      var choice_char = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(response.key);
      console.log(response)
      console.log(choice_char);
      console.log(choice_char == 'a');

      var gamble_outcome = -1;
      if (choice_char == 'a'){
        var choice = 'a';
        if (Math.random() < 0.3)
        {
          gamble_outcome = 0;
          var sel_text = 'oa0';
        } else{
          gamble_outcome = 1;
          var sel_text = 'oa1'
        }
      } else{
        var choice = 'r';
        var sel_text = 'or';
      }
      // which outcome is it?
      var both_sel_text = '.ob,.'+sel_text;
      console.log(both_sel_text)
      console.log(choice)


      var fade_out_choice_stim = function(){
        d3.selectAll('.choice_stim')
          .transition()
          .style("opacity",0)
          .duration(350)
      }

      d3.selectAll(both_sel_text)
        //.call(setupOP)
        .style("opacity",1)

      fade_out_choice_stim();
    }

    new_html = '';

    var response = {
      rt: null,
      key: null
    };

    display_trial_info();


    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      // display_element.querySelector('.info-out-top') += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    //if (trial.choices != jsPsych.NO_KEYS) {
    //  var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
    //    callback_function: after_response,
    //    valid_responses: trial.choices,
    //    rt_method: 'date',
    //    persist: false,
    //    allow_held_key: false
    //  });
    //}


    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
