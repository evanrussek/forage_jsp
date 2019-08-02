/* jspsych-instructions.js
 * Josh de Leeuw
 *
 * This plugin displays text (including HTML formatted strings) during the experiment.
 * Use it to show instructions, provide performance feedback, etc...
 *
 * Page numbers can be displayed to help with navigation by setting show_page_number
 * to true.
 *
 * documentation: docs.jspsych.org
 *
 *
 */

jsPsych.plugins["evan-instructions"]  = (function() {

  var plugin = {};

  plugin.info = {
    name: 'evan-instructions',
    description: '',
    parameters: {
      pages: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Pages',
        default: undefined,
        array: true,
        description: 'Each element of the array is the content for a single page.'
      },
      key_forward: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Key forward',
        default: 'rightarrow',
        description: 'The key the subject can press in order to advance to the next page.'
      },
      key_backward: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Key backward',
        default: 'leftarrow',
        description: 'The key that the subject can press to return to the previous page.'
      },
      allow_backward: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Allow backward',
        default: true,
        description: 'If true, the subject can return to the previous page of the instructions.'
      },
      allow_keys: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Allow keys',
        default: true,
        description: 'If true, the subject can use keyboard keys to navigate the pages.'
      },
      show_clickable_nav: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Show clickable nav',
        default: false,
        description: 'If true, then a "Previous" and "Next" button will be displayed beneath the instructions.'
      },
      show_page_number: {
          type: jsPsych.plugins.parameterType.BOOL,
          pretty_name: 'Show page number',
          default: false,
          description: 'If true, and clickable navigation is enabled, then Page x/y will be shown between the nav buttons.'
      },
      button_label_previous: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label previous',
        default: 'Previous',
        description: 'The text that appears on the button to go backwards.'
      },
      button_label_next: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label next',
        default: 'Next',
        description: 'The text that appears on the button to go forwards.'
      },
      o1_image: {
        type: jsPsych.plugins.parameterType.IMAGE,
        default: undefined
      },
      o2_image: {
        type: jsPsych.plugins.parameterType.IMAGE,
        default: undefined
      },
      safe_image: {
        type: jsPsych.plugins.parameterType.IMAGE,
        default: undefined
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    par = define_parameters('instruction', trial.o1_image,
                      trial.o2_image, trial.safe_image,
                      30, -10, 10)

    var current_page = 0;

    var view_history = [];

    var start_time = (new Date()).getTime();

    var last_page_update_time = start_time;

    function btnListener(evt){
    	evt.target.removeEventListener('click', btnListener);
    	if(this.id === "jspsych-instructions-back"){
    		back();
    	}
    	else if(this.id === 'jspsych-instructions-next'){
    		next();
    	}
    }

    function show_current_page() {
      //var html = trial.pages[current_page];

      //display_element.innerHTML += html;

      var pagenum_display = "";
      if(trial.show_page_number) {
          pagenum_display = "<span style='margin: 0 1em;' class='"+
          "jspsych-instructions-pagenum'>Page "+(current_page+1)+"/"+trial.pages.length+"</span>";
      }

      if (trial.show_clickable_nav) {

        var nav_html = "<div class='jspsych-instructions-nav' style='padding: 10px 0px;'>";
        if (trial.allow_backward) {
          var allowed = (current_page > 0 )? '' : "disabled='disabled'";
          nav_html += "<button id='jspsych-instructions-back' class='jspsych-btn' style='margin-right: 5px;' "+allowed+">&lt; "+trial.button_label_previous+"</button>";
        }
        if (trial.pages.length > 1 && trial.show_page_number) {
            nav_html += pagenum_display;
        }

        nav_html += "<button id='jspsych-instructions-next' class='jspsych-btn'"+
            "style='margin-left: 5px;'>"+trial.button_label_next+
            " &gt;</button></div>";

        //html += nav_html;
        page_2_image()

        display_element.innerHTML += nav_html;





        if (current_page != 0 && trial.allow_backward) {
          display_element.querySelector('#jspsych-instructions-back').addEventListener('click', btnListener);
        }

        display_element.querySelector('#jspsych-instructions-next').addEventListener('click', btnListener);
      } else {
        if (trial.show_page_number && trial.pages.length > 1) {
          // page numbers for non-mouse navigation
          html += "<div class='jspsych-instructions-pagenum'>"+pagenum_display+"</div>"
        }
        display_element.innerHTML = html;
      }

    }

    // show image
    function page_2_image(){
      /// pause this for a bit... you were here though - need to figure out subject params - other things are trial parameters

      // make some text, display with HTML
      var this_text = 'Here are the three types of banknotes used by the casino. <br>';
      display_element.innerHTML += this_text;



      d3.select('.jspsych-content')
        .append("svg")
        .attr("width", par.w)
        .attr("height", par.h)

        // place grey background on it
      d3.select("svg").append("rect")
          .attr("x", 0).attr("y", 0).attr("width", par.w)
          .attr("height", par.h).style("fill", par.svg_color).style("opacity",.7);


        //d3.select("svg").append("rect")
        //  .attr("class", 'info')
        //  .attr("x", par.w/2 - par.background_width/2)
        //  .attr("y", par.h/2 - par.background_height/2)
        //  .attr("width", par.background_width)
        //  .attr("height", par.background_height)
        //  .style("fill", par.info_bkg_color)
        //  .style("opacity",.7);

        var img_y = par.h/2 - par.image_height;

        var img_x_vec = [par.w/6 - 1*par.image_width, par.w/2 - 1*par.image_width, 5*par.w/6 - 1*par.image_width];



        var img_bkg_x_vec = [par.w/6 - par.background_width/2 + par.background_width/4,
                              par.w/2 - par.background_width/2 + par.background_width/4,
                              5*par.w/6 - par.background_width/2 + par.background_width/4];

        var img_bkg_y = par.h/2 - par.image_height + par.image_height/2 - par.img_bkg_height/2;

        var text_vec = ["Suitcase Banknote", "Wallet Banknote", "Marbles Banknote"];
        var text_x_vec = [img_bkg_x_vec[0] + par.img_bkg_width/2, img_bkg_x_vec[1] + par.img_bkg_width/2, img_bkg_x_vec[2] + par.img_bkg_width/2];
        var text_y = img_bkg_y - par.img_bkg_height/4;

          // place every image specific background and every image on top of it
          for (var i=0; i<3; i++){
            place_img_bkg("info",img_bkg_x_vec[i],img_bkg_y,par.img_bkg_width,par.img_bkg_height,par.img_bkg_color,1);
            place_img(par.outcome_images[i], "info", img_x_vec[i], img_y, par.image_width, par.image_height,1);
            place_text(text_vec[i], "info", text_x_vec[i], text_y, 2*par.text_font_size/3, 1, "white")
          }
      // show the three types of bank notes
    }





    function next() {

      add_current_page_to_view_history()

      current_page++;

      // if done, finish up...
      if (current_page >= trial.pages.length) {
        endTrial();
      } else {
        show_current_page();
      }

    }

    function back() {

      add_current_page_to_view_history()

      current_page--;

      show_current_page();
    }

    function add_current_page_to_view_history() {

      var current_time = (new Date()).getTime();

      var page_view_time = current_time - last_page_update_time;

      view_history.push({
        page_index: current_page,
        viewing_time: page_view_time
      });

      last_page_update_time = current_time;
    }

    function endTrial() {

      if (trial.allow_keys) {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
      }

      display_element.innerHTML = '';

      var trial_data = {
        "view_history": JSON.stringify(view_history),
        "rt": (new Date()).getTime() - start_time
      };

      jsPsych.finishTrial(trial_data);
    }

    var after_response = function(info) {

      // have to reinitialize this instead of letting it persist to prevent accidental skips of pages by holding down keys too long
      keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.key_forward, trial.key_backward],
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
      // check if key is forwards or backwards and update page
      if (jsPsych.pluginAPI.compareKeys(info.key, trial.key_backward)) {
        if (current_page !== 0 && trial.allow_backward) {
          back();
        }
      }

      if (jsPsych.pluginAPI.compareKeys(info.key, trial.key_forward)) {
        next();
      }

    };

    show_current_page();

    if (trial.allow_keys) {
      var keyboard_listener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: [trial.key_forward, trial.key_backward],
        rt_method: 'date',
        persist: false
      });
    }
  };

  return plugin;
})();
