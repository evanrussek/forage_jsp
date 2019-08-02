
jsPsych.plugins["evan-two-stim-choice"] = (function() {
  /// problem::: choiced is processed in outcome stage -- want it processed in choice stage

  var plugin = {};

  plugin.info = {
    name: "evan-two-stim-choice",
    parameters: {
        first_stage:{
          type: jsPsych.plugins.parameterType.INT,
          default: undefined
        },
        last_stage:{
          type: jsPsych.plugins.parameterType.INT,
          default: undefined
        },
        o1_val: {
          type: jsPsych.plugins.parameterType.INT,
          default: undefined
        },
        o2_val: {
          type: jsPsych.plugins.parameterType.INT,
          default: undefined
        },
        p_o1_c1: {
          type: jsPsych.plugins.parameterType.FLOAT,
          default: undefined
        },
        p_o1_c2: {
          type: jsPsych.plugins.parameterType.FLOAT,
          default: undefined
        },
        o1_image: {
          type: jsPsych.plugins.parameterType.IMAGE,
          default: undefined
        },
        o2_image: {
          type: jsPsych.plugins.parameterType.IMAGE,
          default: undefined
        },
        c1_image: {
          type: jsPsych.plugins.parameterType.IMAGE,
          default: undefined
        },
        c2_image: {
          type: jsPsych.plugins.parameterType.IMAGE,
          default: undefined
      },
      choice_prompt: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: undefined
      },
      info_prompt: {
      type: jsPsych.plugins.parameterType.BOOL,
      default: undefined
   },
     correct_machine: { // coded as 1 or 2
       type: jsPsych.plugins.parameterType.INT,
       default: undefined
   }
  }
 }

  plugin.trial = function(display_element, trial) {

    par = define_parameters('train');

    var myInds = [0,1];
    par.shuffledInds = jsPsych.randomization.repeat(myInds, 1);
    par.outcome_vals = [trial.o1_val, trial.o2_val];
    par.outcome_images= [trial.o1_image, trial.o2_image];

    var myCInds = [0,1];
    par.shuffledCInds = jsPsych.randomization.repeat(myCInds, 1);
    par.choice_images = [trial.c1_image, trial.c2_image];
    par.p_o1 = [trial.p_o1_c1, trial.p_o1_c2];

    var choose_left_key = '1';
    var choose_right_key = '2';

    ///// set all timing parameters (in milliseconds)
    //// generally useful helper functions
    var wait_for_time = function(n_msec, next_fun){
      // wait n_msec and then call next function
      jsPsych.pluginAPI.setTimeout(function() {
          next_fun() //
        }, n_msec);
    } // end wait for time

    // functions to assist with callbacks after multiple transitions are run
    var setupMT = function(sel){
      counter = sel.size(); // set a function
      //console.log('counter_start:' + counter)
    }
    var onMT = function(next_fun){
      counter--;
      if(counter == 0){ next_fun(); }
    }

    var this_MT = function(){
       return onMT(this_next_fun);
     }

    // create svg - stimulus background // need to define this here so other funcs can use it
    var svg = d3.select(".jspsych-content-wrapper")
                .append("svg")
                .attr("width", par.w)
                .attr("height", par.h)


    // place grey background on it
    d3.select("svg").append("rect")
          .attr("x", 0).attr("y", 0).attr("width", par.w)
          .attr("height", par.h).style("fill", par.svg_color).style("opacity",.7);


    //// functions for placing stimuli (copied and pasted for now)
    var place_stg_bkg = function(class_name,color,opacity) {
        // place stage background
        // only thing that changes here is the class_name and the color
          d3.select("svg").append("rect")
              .attr("class", class_name)
              .attr("x", par.w/2 - par.background_width/2)
              .attr("y", par.h/2 - par.background_height/2)
              .attr("width", par.background_width)
              .attr("height", par.background_height)
              .style("fill", color)
              .style("opacity",opacity);
      };

      var place_fixation = function(){
        d3.select('svg').append("text")
                  .attr("class", "my_fix")
                  .attr("x",  par.fixation_x)
                  .attr("y", par.fixation_y)
                  .attr("font-family","monospace")
                  .attr("font-weight","bold")
                  .attr("dominant-baseline", "central")
                  .attr("font-size",par.fixation_font_size)
                  .attr("text-anchor","middle")
                  .attr("fill", par.fixation_color)
                  .style("opacity",1)
                  .text('+')
        }


    var place_info = function(opacity, show_prompt){
      // place stage background
      place_stg_bkg("info_bkg",par.info_bkg_color,opacity);
      // place every image specific background and every image on top of it

      var img_bkg_y_vec = [par.h/2 - par.background_height/6 - par.img_bkg_height/2,
                    par.h/2 + par.background_height/6 - par.img_bkg_height/2];

      var image_y_vec = [par.h/2 - par.background_height/6 - par.image_height/2,
                    par.h/2 + par.background_height/6 - par.image_height/2];

      var text_y_vec = [image_y_vec[0] + par.image_height/2 + par.text_font_size/2, image_y_vec[1] + par.image_height/2 + par.text_font_size/2];

      for (var i=0; i<2; i++){
        place_img_bkg("info",par.img_bkg_x,img_bkg_y_vec[i],par.img_bkg_width,par.img_bkg_height,par.img_bkg_color,opacity);
        place_img(par.outcome_images[par.shuffledInds[i]], "info", par.image_x, image_y_vec[i], par.image_width, par.image_height,opacity);
        place_reward(par.outcome_vals[par.shuffledInds[i]], "info", par.text_x, text_y_vec[i], par.text_font_size,opacity);
      }

      // do we want a prompt?
      var bkg_y = par.h/2 - par.background_height/2;
      //                   this should be the space between bottom and end of background
      var txt_y = bkg_y + (img_bkg_y_vec[0] - bkg_y)/2;
      if (show_prompt){
        place_text('Banknote point values for upcoming choice', "info", par.w/2, txt_y, par.text_font_size/2, opacity, "White")
      }
    }

    // place choice stims
    var place_choice = function(opacity, show_prompt){

      // place the stage background
      place_stg_bkg("choice_stim choice_bkg",par.choice_bkg_color,opacity);

      // put up the image background
      // center the choice images...
      var choice_img_width = par.choice_stim_width/2;
      var choice_img_height = par.choice_stim_height/2;
      var choice_img_x_vec = [par.stg_bkg_x + par.background_width/4 - choice_img_width/2, par.stg_bkg_x + 3*par.background_width/4 - choice_img_width/2];
      var choice_img_y = par.h/2 - choice_img_height/2;

      var img_bkg_width = par.choice_stim_bkg_width/2;
      var img_bkg_height = par.choice_stim_bkg_height/2;
      var c_bkg_x = [par.stg_bkg_x + par.background_width/4 - img_bkg_width/2, par.stg_bkg_x + 3*par.background_width/4 - img_bkg_width/2];
      place_img_bkg("choice_stim cL",c_bkg_x[0],par.h/2 - img_bkg_height/2, img_bkg_width,img_bkg_height, par.choice_stim_bkg_color, opacity);
      place_img_bkg("choice_stim cR",c_bkg_x[1],par.h/2 - img_bkg_height/2, img_bkg_width,img_bkg_height, par.choice_stim_bkg_color, opacity);

      //var myCInds = [0,1];
      //par.shuffledCInds = jsPsych.randomization.repeat(myInds, 1);
      //par.choice_images = [trial.c1_image, trial.c2_image];

      place_img(par.choice_images[par.shuffledCInds[0]], "choice_stim cL", choice_img_x_vec[0], choice_img_y, choice_img_width,choice_img_height,opacity);
      place_img(par.choice_images[par.shuffledCInds[1]], "choice_stim cR", choice_img_x_vec[1], choice_img_y, choice_img_width,choice_img_height,opacity);

      // do we want a prompt?
      //var bkg_y = par.h - (par.h - par.stg_bkg_y)/2;
      //                   this should be the space between bottom and end of background
      var txt_y =  par.h  - par.stg_bkg_y/2;
      if (show_prompt){
        place_text('Press 1 to select Left machine or 2 to select Right machine.', "choice_stim", par.w/2, txt_y, par.text_font_size/3, opacity, "White")
      }

    }

    var place_outcomes = function(opacity){
      // put up the accept outcome 1  (just 1 for now)outcome_img_height
      place_img_bkg("ob",par.outcome_img_bkg_x,par.outcome_img_bkg_y,par.outcome_img_bkg_width,par.outcome_img_bkg_height,par.img_bkg_color,opacity);
      place_img(trial.o1_image, "o1", par.outcome_img_x, par.outcome_img_y,
                    par.outcome_img_width, par.outcome_img_height,opacity);
      place_reward(trial.o1_val, "o1",
                  par.outcome_text_x, par.outcome_text_y, par.outcome_text_font_size,opacity);

      // accept outcome 2
      place_img(trial.o2_image, "o2", par.outcome_img_x,
                  par.outcome_img_y, par.outcome_img_width, par.outcome_img_height,opacity);

      place_reward(trial.o2_val, "o2", par.outcome_text_x,
                    par.outcome_text_y, par.outcome_text_font_size,opacity);
    }


    var place_everything  = function(){
          place_fixation();
          place_outcomes(0);
          place_choice(0,true);
          place_info(0,true);
    }


    ////// master function which runs the whole trial
    var trial_master = function(trial_stage){
      //console.log('trial_stage: ' + trial_stage)

      switch(trial_stage){
        // part 1 is stage 1
        case 1:
          // information
          stage_1_master(1);
          break;

        case 2:
          // choice
          stage_2_master(1);
          break;
        case 3:
          // feedback
          stage_3_master(1);
          break;
        case 4:
          // end trial
          console.log('end trial')
          end_trial();
          // end the trial
      }
    }

    //// function to run each stage
    var stage_1_master = function(stage_1_part){
      switch(stage_1_part){
        case 1:
          // takes x seconds - set it above how long it should take
          display_trial_info();
          break;
        case 2: // got here twice?
          wait_for_time(par.info_time,remove_trial_info);
          break;
        case 3:
          if (trial.last_stage < 2){var next_stage_number = 4} else{var next_stage_number = 2};
          wait_for_time(par.post_info_time,function(){trial_master(next_stage_number)});
        }
      }

      var stage_2_master = function(stage_2_part){
        // this is getting ca
        switch(stage_2_part){
          case 1:
            //console.log('stage_2_called')
            // post_info_time
            display_choice();
            //wait_for_time(1000, display_choice);
            break;
          case 2:
            remove_choice();
            break;
          case 3:
            if (trial.last_stage < 3){var next_stage_number = 4} else{var next_stage_number = 3};
            //console.log('end of stage 2')
            wait_for_time(par.post_choice_time,function(){trial_master(next_stage_number)});
        }
      }

      var stage_3_master = function(stage_3_part){
        switch(stage_3_part){
          case 1:
            // specify how long to wait
            display_outcome();
            break;
          case 2:
            wait_for_time(par.outcome_time, remove_outcome);
            break;
          case 3:
            trial_master(4);
            break;
        }
      }


    /// specific functions called by each stage trial_master
    // stage 1 funcs
    var display_trial_info = function(stop_here){

      d3.select('.info_bkg').transition().style("opacity",1).duration(par.info_fadein_time);

      d3.selectAll('.info')
        .transition()
        .style("opacity",1)
        .duration(par.info_fadein_time);

      if (typeof stop_here == 'undefined'){
        wait_for_time(par.info_fadein_time, function(){ return stage_1_master(2)});
      }
    } // end display trial info

    var remove_trial_info = function(){
      this_next_fun = function(){
         stage_1_master(3);
      }

      d3.select('.info_bkg').transition().style("opacity",0)
        .duration(par.info_fadeout_time);

      // remove info
      d3.selectAll('.info').call(setupMT).transition()
        .style("opacity",0).duration(par.info_fadeout_time)
        .on('end', this_MT);

    } // end remove trial info

    ///// stage 2 funcs
    var display_choice = function(){
      // want to add something showing that their choice was registered? - maybe change the background color?
      // display the choice and start the keyboard listeners
      d3.selectAll('.choice_stim')
        .transition()
        .style("opacity",1)
        .duration(par.choice_fadein_time)


      var handle_response = function(info){
        //console.log('response heard')

        // clear timeout counting response time
        jsPsych.pluginAPI.clearAllTimeouts();

        if (response.key == null) {
            response = info;
        }

        var choice_char = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(response.key);

        // change background color based on choice
        var new_color = "blue";
        console.log('cc: '+choice_char)

        if (choice_char == choose_left_key){
          var chosen_class = '.cL';
          var unchosen_class = '.cR';
          response.chosen_side = 1;
        }
        else if (choice_char == choose_right_key){
          var chosen_class = '.cR';
          var unchosen_class = '.cL';
          response.chosen_side = 2;}
        else{console.log('SURPRISE');}

        console.log('chosen_side: ' + response.chosen_side)


        response.chosen_machine = par.shuffledCInds[response.chosen_side - 1] + 1; // this is 1 or 2
        console.log('chosen_machine: ' + response.chosen_machine)
        correct_response = response.chosen_machine == trial.correct_machine;

        this_next_fun = function(){stage_2_master(2);}
        //d3.selectAll('.choice_stim').call(setupMT).transition()
        //  .style("opacity",0).duration(par.choice_fadeout_time).on('end', this_MT)


        d3.select(chosen_class).style('fill',new_color);
        d3.selectAll(unchosen_class).call(setupMT)
          .transition().style('opacity',0).duration(par.choice_side_fade_time)
            .on('end',this_MT);

        // kill keyboard listeners
        if (typeof keyboardListener !== 'undefined') {
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }


      }

      var handle_slow_response = function(){
          jsPsych.pluginAPI.clearAllTimeouts();
          place_reward('Please respond faster!', 'slow_reply', par.slow_reply_x, par.slow_reply_y, par.slow_reply_font_size, 1)
        d3.select(".slow_reply")
          .attr("fill", "red")

        response.chosen_side = "SLOW";
        response.chosen_machine = "NA";

        wait_for_time(par.slow_reply_time, end_trial);
      }

      var valid_responses = [choose_left_key, choose_right_key];


      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: handle_response,
          valid_responses: valid_responses,
          rt_method: 'performance', // check this
          persist: false,
          allow_held_key: false
        });

      wait_for_time(par.max_response_time, handle_slow_response);
    } // end display choice

    var remove_choice = function(){
      this_next_fun = function(){stage_2_master(3);}

      d3.selectAll('.choice_stim').call(setupMT).transition()
        .style("opacity",0).duration(par.choice_fadeout_time).on('end', this_MT)
    }

    //// stage 3 funcs
    var display_outcome = function(){
      // this will display the outcome based on the response, which is a global variable
      response.choice = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(response.key);
      var choice_char = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(response.key);

      var this_p_o1 = par.p_o1[response.chosen_machine - 1];

      if (Math.random() < this_p_o1){
          var next_state = 'o1';
          outcome_reached = 1;
        }else{
          var next_state = 'o2';
          outcome_reached = 2;
      }

      console.log('p_o1:' + this_p_o1)
      console.log('next_state:' + next_state)

      points_received = par.outcome_vals[outcome_reached - 1];


      sel_text = '.ob,.'+next_state;

      this_next_fun = function(){
         stage_3_master(2);
      }

      // display the feedback with some delay
      d3.selectAll(sel_text)
        .call(setupMT)
        .transition()
        .style("opacity",1)
        .duration(par.outcome_fadein_time)
        .on('end', this_MT)
    } // end display outcome

    var remove_outcome = function(){

      this_next_fun = function(){
        stage_3_master(3);
      } // end this_next_fun

      d3.selectAll(sel_text)
        .call(setupMT)
        .transition()
        .style("opacity",0)
        .duration(par.outcome_fadeout_time)
        .on('end', this_MT)
    } // end remove outcome


    /// stage 4 - end trial, save data,
    var end_trial = function(){

      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }
      d3.select('svg').remove()

      // add correctness answer
      //console.log('correct: ' + correct_response)

      var trial_data = {
        "first_stage": trial.first_stage,
        "last_stage": trial.last_stage,
        "show_money_val": trial.show_money_val,
        "p_o1_c1": trial.p_o1_c1,
        "p_o1_c2": trial.p_o1_c2,
        "safe_val": trial.safe_val,
        "o1_val": trial.o1_val,
        "o2_val": trial.o2_val,
        "o1_image": trial.o1_image,
        "o2_image": trial.o2_image,
        "choice_image": trial.choice_image,
        "key_press_num": response.key,
        "chosen_side": response.chosen_side,
        "chosen_machine": response.chosen_machine,
        "outcome_reached": outcome_reached,
        "outcome_im": par.outcome_images[outcome_reached - 1],
        "points_received": points_received,
        "rt": response.rt,
        "correct_response": correct_response
      };

      jsPsych.finishTrial(trial_data);
    }

    // define the response that we'll append
    var response = {
        rt: null,
        key: null,
        key_press_num: null,
        chosen_side: null,
        chosen_machine: null,
      };
      var outcome_reached = null;
      var points_received = null;
      var correct_response = null;


    //place_info(1, true)
    //place_choice(1, true)
    place_everything();
    // wait pretrial time sec (ITI), call trial master
    jsPsych.pluginAPI.setTimeout(function() {
       trial_master(trial.first_stage) //
     }, par.pre_trial_time); // this is where the wait time goes
//   };
    // data saving
    var trial_data = {
      parameter_name: 'parameter value'
    };

    // end trial
    //jsPsych.finishTrial(trial_data);
  };

  return plugin;
})();
