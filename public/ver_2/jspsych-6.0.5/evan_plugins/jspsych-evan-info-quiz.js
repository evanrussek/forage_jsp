/*
 * Example plugin template
 */


// which image was shown?
jsPsych.plugins["evan-info-quiz"] = (function() {

  // add time up and record response...

  var plugin = {};

  plugin.info = {
    name: "evan-info-quiz",
    parameters: {
      correct_image:{
        type: jsPsych.plugins.parameterType.IMAGE, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: undefined
      },
      other_images: {
        type: jsPsych.plugins.parameterType.IMAGE, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: undefined
      },
      correct_name: {
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined
      },
      other_names: { // try this for a list...
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined
      },
      use_image: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: undefined
      },
      use_outcome: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: undefined
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    var handle_slow_response = function(){
      jsPsych.pluginAPI.clearAllTimeouts();
      place_reward('Please respond faster!', 'slow_reply', par.slow_reply_x, par.slow_reply_y, par.slow_reply_font_size, 1);
      d3.select(".slow_reply")
        .attr("fill", "red")
      response.choice = "SLOW";
      response.accept = "NA";

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      wait_for_time(par.slow_reply_time, end_trial);
    }

    var wait_for_time = function(n_msec, next_fun){
      // wait n_msec and then call next function
      jsPsych.pluginAPI.setTimeout(function() {
          next_fun() //
        }, n_msec);
    } // end wait for time


    var correct_response = 1;

    par = define_parameters('trial');
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
    ////////////////////////////////////////

    // place question
    var q_text_y = par.h/5;
    var q_text_x = par.w/2;

    if (trial.use_outcome){ // 3 options
      var myInds = [0,1,2];
      var shuffledInds = jsPsych.randomization.repeat(myInds,1);

      var txt_q = 'Which banknote did you just collect?';
      place_text(txt_q, 'Prompt', q_text_x, q_text_y, par.text_font_size/2, 1, "White");
      var img_x_ctrs = [par.w/4, par.w/2, 3*par.w/4];

      // background boxes
      var box_width = 1*par.w/5;
      var box_height = par.w/8;
      var box_x = [img_x_ctrs[0] - box_width/2, img_x_ctrs[1] - box_width/2,
                    img_x_ctrs[2] - box_width/2];
      var box_y = par.h/2 - box_height/2;

      for (var i = 0; i < 3; i++){
        var k = i+1;
        place_img_bkg(["bk" + k], box_x[i], box_y, box_width, box_height, par.good_color_vec[1], 0);
      }

      if (trial.use_image){

        //if trial.use_last_trial -
        //jsPsych.data.get().last(1).values()[0]

        var these_images = [trial.correct_image, trial.other_images[0], trial.other_images[1]];
        var bkg_width = 1.3*par.img_bkg_width/2;
        var bkg_height = 1.3*par.img_bkg_height/2;
        var img_width = 1.3*par.image_width/2;
        var img_height = 1.3*par.image_height/2;

        var bkg_x_vec = [img_x_ctrs[0] - bkg_width/2, img_x_ctrs[1] - bkg_width/2, img_x_ctrs[2] - bkg_width/2];
        var img_x_vec = [img_x_ctrs[0] - 2*img_width/2, img_x_ctrs[1] - 2*img_width/2, img_x_ctrs[2] - 2*img_width/2];
        var img_y = par.h/2 - img_height/2;
        var bkg_y = par.h/2 - bkg_height/2;

        for (var i = 0; i < 3; i++){
          place_img_bkg("info",bkg_x_vec[i], bkg_y, bkg_width, bkg_height ,par.img_bkg_color,1);
          place_img(these_images[shuffledInds[i]], "info", img_x_vec[i],  img_y, img_width, img_height, 1);
        }
      } else{
        var these_txts = [trial.correct_name, trial.other_names[0], trial.other_names[1]];
        for (var i = 0; i < 4; i++){
          place_text(these_txts[shuffledInds[i]], 'Prompt', img_x_ctrs[i], par.h/2, par.text_font_size/2, 1, "Blue");
        }
      }
      // place key under it
      var key_vals = [1, 2, 3];

      if (trial.use_image){ var txt_y= 25*par.h/40; var p_y = 26*par.h/40} else{var txt_y= 22.5*par.h/40; var p_y = 24*par.h/40};

      for (var i = 0; i < 3; i++){
        place_text(key_vals[i], 'Prompt', img_x_ctrs[i], txt_y, par.text_font_size/3, 1, "White");
      }
      place_text('Key Press ', 'Prompt', par.w/2, p_y, par.text_font_size/3, 1, "White");

    } else{ // use the choice stimuli
      var myInds = [0,1,2,3];
      var shuffledInds = jsPsych.randomization.repeat(myInds,1);

      var txt_q = 'Which slot machine did you just play?';
      place_text(txt_q, 'Prompt', q_text_x, q_text_y, par.text_font_size/2, 1, "White");
      var img_x_ctrs = [par.w/5, 2*par.w/5, 3*par.w/5, 4*par.w/5];

      // background boxes
      var box_width = par.w/8;
      var box_height = par.w/8;
      var box_x = [img_x_ctrs[0] - box_width/2, img_x_ctrs[1] - box_width/2,
                    img_x_ctrs[2] - box_width/2,   img_x_ctrs[3] - box_width/2,];
      var box_y = par.h/2 - box_height/2;

      for (var i = 0; i < 4; i++){
        var k = i+1;
        place_img_bkg(["bk" + k], box_x[i], box_y, box_width, box_height, par.good_color_vec[1], 0);
      }

      if (trial.use_image){
        var these_images = [trial.correct_image, trial.other_images[0], trial.other_images[1], trial.other_images[2]];
        console.log(these_images)

        var img_width = 1.8*par.image_width/2;
        var img_height = 1.8*par.image_height/2;

        var img_x_vec = [img_x_ctrs[0] - img_width/2, img_x_ctrs[1] - img_width/2, img_x_ctrs[2] - img_width/2, img_x_ctrs[3] - img_width/2];
        var img_y = par.h/2 - img_height/2;
        for (var i = 0; i < 4; i++){
          place_img(these_images[shuffledInds[i]], "info", img_x_vec[i],  img_y, img_width, img_height, 1);
        }
      } else{ // use text

        var these_txts = [trial.correct_name, trial.other_names[0], trial.other_names[1], trial.other_names[2]];
        for (var i = 0; i < 4; i++){
          place_text(these_txts[shuffledInds[i]], 'Prompt', img_x_ctrs[i], par.h/2, par.text_font_size/2, 1, "Blue");
        }


          }

          var key_vals = [1,2,3,4];

        if (trial.use_image){ var txt_y= 25*par.h/40; var p_y = 26*par.h/40} else{var txt_y= 22.5*par.h/40; var p_y = 24*par.h/40};

        for (var i = 0; i < 4; i++){
          place_text(key_vals[i], 'Prompt', img_x_ctrs[i], txt_y, par.text_font_size/3, 1, "White");
        }
        place_text('Key Press ', 'Prompt', par.w/2, p_y, par.text_font_size/3, 1, "White");

    }
    // trial use outcome...



    var handle_response = function(info){
        console.log('response heard')
        jsPsych.pluginAPI.clearAllTimeouts();
        if (response.key == null) {
            response = info;
        }
        var choice_char = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(response.key);
        var bkg_class = ".bk"+choice_char;
        console.log(bkg_class)
        d3.select(bkg_class).style("opacity",1);

        if (shuffledInds[parseInt(choice_char)-1] == 0){
          correct = 1;
          //place_text('Correct!', 'Prompt', par.w/2, 29*par.h/40, par.text_font_size, 1, "Red");
          wait_for_time(par.quiz_pause_resp_time,function(){place_text('CORRECT!', 'Prompt', par.w/2, 29*par.h/40, par.text_font_size, 1, "Red")})
          wait_for_time(par.quiz_pause_resp_time + par.quiz_feedback_time,end_trial)
        } else{
          correct = 0;
          wait_for_time(par.quiz_pause_resp_time,function(){place_text('WRONG!', 'Prompt', par.w/2, 29*par.h/40, par.text_font_size, 1, "Red")})
          wait_for_time(par.quiz_pause_resp_time + par.quiz_feedback_time,end_trial)
        }
      }

      if (trial.use_outcome) {var valid_resopnses = ['1', '2', '3'];} else {var valid_responses = ['1', '2', '3', '4'];}
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: handle_response,
          valid_responses: valid_responses,
          rt_method: 'performance', // check this
          persist: false,
          allow_held_key: false
        });

        //wait_for_time(par.quiz_response_time, handle_slow_response);

      var response = {
          rt: null,
          key: null
        };


          /// stage 4 - end trial, save data,
          var end_trial = function(){

            if (typeof keyboardListener !== 'undefined') {
              jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
            }
            d3.select('svg').remove()

            var trial_data = {
              "correct_image": trial.correct_image,
              "correct_name": trial.correct_name,
              "use_image": trial.use_image,
              "use_outcome": trial.use_outcome,
              "correct": correct,
              "rt": response.rt,
              "key": response.key
              // need to add timing parameters
            };

            jsPsych.finishTrial(trial_data);
          } // end end_trial



  };

  return plugin;
})();
