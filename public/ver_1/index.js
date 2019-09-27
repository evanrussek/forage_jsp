// create the timeline...

// need to add the consent stuff.
// edit instructions and preload instruction pages

// firebase stuff
firebase.firestore().enablePersistence().catch(function(err) {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled
        // in one tab at a a time.
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
    }
});

firebase.auth().signInAnonymously();

// User ID
var uid;

// Consent form
var check_consent = function (elem) {
  if ($('#consent_checkbox1').is(':checked') && $('#consent_checkbox2').is(':checked') &&
      $('#consent_checkbox3').is(':checked') && $('#consent_checkbox4').is(':checked') &&
      $('#consent_checkbox5').is(':checked') && $('#consent_checkbox6').is(':checked') &&
      $('#consent_checkbox7').is(':checked'))
      {
          // When signed in, get the user ID
          firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
              uid = user.uid;
              task(uid);
            }
          });
      }

  else {
      alert("Unfortunately you will not be unable to participate in this research study if you do " +
          "not consent to the above. Thank you for your time.");
      return false;
  }
};

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

function task(uid){

  // get or generate a subjectID

  if (window.location.search.indexOf('PROLIFIC_PID') > -1) {
    var subjectID = getQueryVariable('PROLIFIC_PID');
  }
  else {
      var subjectID = Math.floor(Math.random() * (2000000 - 0 + 1)) + 0; // if no prolific ID, generate random ID (for testing)
  }

  // get the database going
  // create a reference to the database
  var db = firebase.firestore();

  var run_name = 'run1';

  // record new date and start time
  db.collection('foragetask').doc(run_name).collection('subjects').doc(subjectID.toString()).collection('taskdata').doc('start').set({
      subjectID: subjectID,  // this refers to the subject's ID from prolific/
      date: new Date().toLocaleDateString(),
      start_time: new Date().toLocaleTimeString()
  })


  var full_screen = {
    type: 'fullscreen',
    fullscreen_mode: true
  };

  // we'll vary the travel amount?
  var travel_amounts = [8, 16, 32];
  var harvest_key_seq = ['f', 'j', 'f', 'j'];
  var harvest_prompt = ["(F -> J -> F -> J)"];

  var travel_key_seq_easy = ['d', 'k', 'd', 'k'];
  var travel_prompt_easy = ["(D -> K -> D -> K)"];
  var travel_key_seq_hard =['z', '/', 't', 'y'];
  var travel_prompt_hard = ["(Z -> / -> T -> Y)"];
  var n_rounds = 1;

  var total_points_arr = [];

  var forage_trials = [];
  var trial_num = 0;
  for (r_idx = 0; r_idx < n_rounds; r_idx++){
    var this_round_trials = [];
    for (d_idx = 0; d_idx < 2; d_idx++){
      for (ta_idx = 0; ta_idx < travel_amounts.length; ta_idx++){
        var this_travel_amount = travel_amounts[ta_idx];
        if (d_idx == 0){
            var this_travel_key_seq = travel_key_seq_easy;
            var this_travel_prompt = travel_prompt_easy;
        }else{
          var this_travel_key_seq = travel_key_seq_hard;
          var this_travel_prompt = travel_prompt_hard;
        }
        trial_num = trial_num + 1;
        var this_trial = {
          type: 'travel-mkre',
          start_reward: 100,
          decay: .98,
          n_travel_steps: this_travel_amount,
          press_success_prob_travel: .7,
          press_success_prob_harvest: .5,
          reward_noise: 2.5,
          start_reward_noise: 4,
          time_min: .05,
          travel_key_seq:this_travel_key_seq,
          travel_prompt: this_travel_prompt,
          harvest_key_seq: harvest_key_seq,
          harvest_prompt: harvest_prompt
        }
        this_round_trials.push(this_trial)
      }
    }
    forage_trials = forage_trials.concat(jsPsych.randomization.shuffle(this_round_trials,1));
  }

// add a trial num
for (var i = 0;i < forage_trials.length;  i++){
  forage_trials[i].trial_num = i + 1;
}

var task_name = 'foragetask';
var run_name = 'run1';


//db.collection("tasks").doc('meg_generalisation_8').collection('subjects').doc(uid).collection('trial_data').doc('trial_' + trial_data.trial_number.toString()).set({trial_data});

// add a trial num
save_to_fb = true;
for (var i = 0;i < forage_trials.length;  i++){
  var trial_number = i + 1;
  forage_trials[i].on_finish = function(){
    var this_trial_data = jsPsych.data.get().filter({trial_num: trial_number}).json()
    if (save_to_fb){
      db.collection('foragetask').doc(run_name).collection('subjects').doc(uid).collection('taskdata').doc('trial_' + trial_number.toString()).set({
        trial_data: this_trial_data
      })
    }
  };
}




  var make_text_trial = function(travel_prompt, harvest_prompt, trial_num){
    if (trial_num == 1){
      var text_trial = {
        type: 'evan-display-text',
        line_1: "Traveling to a new environment",
        line_2: "Travel sequence: " + travel_prompt + ", Harvest sequence: " + harvest_prompt,
        line_3: ""
      }
    } else{
      var text_trial = {
        type: 'evan-display-text',
        line_1: function(){
          var lasttimelinedata = jsPsych.data.getLastTimelineData();
          var total_points = lasttimelinedata.values().pop().total_points
          total_points_arr.push(total_points);
          console.log(lasttimelinedata)
          return "You collected " + total_points + " points. Great work. You've completed " + (trial_num -1)+ " out of 12 rounds."  ;
        },
        line_2: "Traveling to a new environment",
        line_3: "Travel sequence: " + travel_prompt + ", Harvest sequence: " + harvest_prompt,
        //on_start: function (){
        //  last_trial_data.json()
        //}
      }
    }
    return text_trial
  }

  // shuffle these
  var trials = forage_trials;

  /* create timeline */
  var timeline = [];
  timeline.push(full_screen);

  //timeline = timeline.concat(intro_w_trials);

  for (i = 0; i < trials.length; i++){
    var next_trial = trials[i];
    var text_trial = make_text_trial(next_trial.travel_prompt, next_trial.harvest_prompt, i + 1)
    timeline.push(text_trial);
    timeline.push(next_trial);
  }

  // compute bonus for the main task...
  var end_screen = {
   type: 'html-button-response',
      timing_post_trial: 0,
      choices: ['End Task'],
      on_start: function(){
            // save the task data...
            var task_data = jsPsych.data.get().json();
            db.collection('foragetask').doc('run1').collection('subjects').doc(uid).collection('rounds').doc(uid).update({
                task_data: task_data})
            },
      is_html: true,
      stimulus: function(){

        var random_total_points = jsPsych.randomization.sampleWithoutReplacement(total_points_arr, 1);

        var string = 'You have finished the task. Thank you for your contribution to science! \
                 On a randomly selected round, you recevieved ' + random_total_points + ' points. Your bonus will be based on this number. \
              <b> PLEASE CLICK END TASK TO SUBMIT THE TASK TO PROLIFIC </b>.';

        var bonus_data = {
              'random_total_points': random_total_points,
        };
        db.collection('foragetask').doc('run1').collection('subjects').doc(uid).collection('rounds').doc(subjectID.toString()).update({
            bonus_data: bonus_data,
            end_time: new Date().toLocaleTimeString()})
     return string;
    },
     on_finish: function(){
       window.location = "https://app.prolific.co/submissions/complete?cc=1177C813"
     }
  }
  timeline.push(end_screen)

  // recording data...

  // need a screen thanking them for the task and also figuring out the bonus... -- do this tonight
  var instruc_images = instruction_pagelinks_a.concat(instruction_pagelinks_b);

  /* start the experiment */
  jsPsych.init({
    timeline: timeline,
    preload_image: instruc_images,
    show_preload_progress_bar: true,
    on_finish: function() {
      //console.log('done')
      jsPsych.data.get().localSave('csv','test_res.csv');
    //on_finish: saveData
    }
  });

}

document.getElementById('header_title').innerHTML = "Welcome";
document.getElementById('consent').innerHTML = "        <p><b>Who is conducting this research study?</b><p>\n" +
    "        <p>\n" +
    "        This research is being conducted by the Wellcome Centre for Human Neuroimaging and the Max Planck UCL Centre\n" +
    "        for Computational Psychiatry and Ageing Research. The lead researcher(s) for this project is\n" +
    "        <a href=\"mailto:e.russek@ucl.ac.uk\">Dr Evan Russek</a>. This study has been approved by the UCL Research Ethics Committee\n" +
    "        (project ID number 9929/003) and funded by the Wellcome Trust.\n" +
    "        </p>\n" +
    "\n" +
    "        <p><b>What is the purpose of this study?</b><p>\n" +
    "        <p>\n" +
    "        We are interested in how the adult brain controls learning and decision-making. This research aims to provide\n" +
    "        insights into how the healthy brain works to help us understand the causes of a number of different medical\n" +
    "        conditions.\n" +
    "        </p>\n" +
    "\n" +
    "        <p><b>Who can participate in the study?</b><p>\n" +
    "        <p>\n" +
    "            You must be 18 or over to participate in this study. Please confirm this to proceed.\n" +
    "        </p>\n" +
    "            <label class=\"container\">I confirm I am over 18 years old\n" +
    "                <input type=\"checkbox\" id=\"consent_checkbox1\">\n" +
    "                <span class=\"checkmark\"></span>\n" +
    "            </label>\n" +
    "        <br>\n" +
    "\n" +
    "        <p><b>What will happen to me if I take part?</b><p>\n" +
    "        <p>\n" +
    "            You will play one or more online computer games, which will last approximately 30 minutes. You will receive\n" +
    "            at least £3.25 for helping us out with an opportunity for an additional bonus depending on your choices. The amount may vary with the decisions you make in the games.\n" +
    "            Remember, you are free to withdraw at any time without giving a reason.\n" +
    "        </p>\n" +
    "\n" +
    "        <p><b>What are the possible disadvantages and risks of taking part?</b><p>\n" +
    "        <p>\n" +
    "            The task will you complete does not pose any known risks.\n" +
    "        </p>\n" +
    "\n" +
    "        <p><b>What are the possible benefits of taking part?</b><p>\n" +
    "        <p>\n" +
    "            While there are no immediate benefits to taking part, your participation in this research will help us\n" +
    "        understand how people make decisions and this could have benefits for our understanding of mental health problems.\n" +
    "        </p>\n" +
    "\n" +
    "        <p><b>Complaints</b><p>\n" +
    "        <p>\n" +
    "        If you wish to complain or have any concerns about any aspect of the way you have been approached or treated\n" +
    "        by members of staff, then the research UCL complaints mechanisms are available to you. In the first instance,\n" +
    "        please talk to the <a href=\"mailto:e.russek@ucl.ac.uk\">researcher</a> or the chief investigator\n" +
    "        (<a href=\"mailto:r.dolan@ucl.ac.uk\">Professor Ray Dolan</a>) about your\n" +
    "        complaint. If you feel that the complaint has not been resolved satisfactorily, please contact the chair of\n" +
    "        the <a href=\"mailto:ethics@ucl.ac.uk\">UCL Research Ethics Committee</a>.\n" +
    "\n" +
    "        If you are concerned about how your personal data are being processed please contact the data controller\n" +
    "        who is <a href=\"mailto:protection@ucl.ac.uk\">UCL</a>.\n" +
    "        If you remain unsatisfied, you may wish to contact the Information Commissioner’s Office (ICO).\n" +
    "        Contact details, and details of data subject rights, are available on the\n" +
    "        <a href=\"https://ico.org.uk/for-organisations/data-protection-reform/overview-of-the-gdpr/individuals-rights\">ICO website</a>.\n" +
    "        </p>\n" +
    "\n" +
    "        <p><b>What about my data?</b><p>\n" +
    "        <p>\n" +
    "            To help future research and make the best use of the research data you have given us (such as answers\n" +
    "        to questionnaires) we may keep your research data indefinitely and share these.  The data we collect will\n" +
    "        be shared and held as follows:<br>" +
    "            •\tIn publications, your data will be anonymised, so you cannot be identified.<br>" +
    "            •\tIn public databases, your data will be anonymised<br>" +
    "\n" +
    "        If there are any queries or concerns please do not hesitate to contact <a href=\"mailto:e.russek@ucl.ac.uk\">Dr Evan Russek</a>.\n" +
    "        </p>\n" +
    "\n" +
    "        <p><b>If you are happy to proceed please read the statement below and click the boxes to show that you\n" +
    "            consent to this study proceeding</b><p>\n" +
    "\n" +
    "        <label class=\"container\">I have read the information above, and understand what the study involves.\n" +
    "            <input type=\"checkbox\" id=\"consent_checkbox2\">\n" +
    "            <span class=\"checkmark\"></span>\n" +
    "        </label>\n" +
    "\n" +
    "        <label class=\"container\">I understand that my anonymised/pseudonymised personal data can be shared with others\n" +
    "            for future research, shared in public databases and in scientific reports.\n" +
    "            <input type=\"checkbox\" id=\"consent_checkbox3\">\n" +
    "            <span class=\"checkmark\"></span>\n" +
    "        </label>\n" +
    "\n" +
    "        <label class=\"container\">I understand that I am free to withdraw from this study at any time without\n" +
    "            giving a reason and this will not affect my future medical care or legal rights.\n" +
    "            <input type=\"checkbox\" id=\"consent_checkbox4\">\n" +
    "            <span class=\"checkmark\"></span>\n" +
    "        </label>\n" +
    "\n" +
    "        <label class=\"container\">I understand the potential benefits and risks of participating, the support available\n" +
    "            to me should I become distressed during the research, and who to contact if I wish to lodge a complaint.\n" +
    "            <input type=\"checkbox\" id=\"consent_checkbox5\">\n" +
    "            <span class=\"checkmark\"></span>\n" +
    "        </label>\n" +
    "\n" +
    "        <label class=\"container\">I understand the inclusion and exclusion criteria in the Information Sheet.\n" +
    "            I confirm that I do not fall under the exclusion criteria.\n" +
    "            <input type=\"checkbox\" id=\"consent_checkbox6\">\n" +
    "            <span class=\"checkmark\"></span>\n" +
    "        </label>\n" +
    "\n" +
    "        <label class=\"container\">I agree that the research project named above has been explained to me to my\n" +
    "            satisfaction and I agree to take part in this study\n" +
    "            <input type=\"checkbox\" id=\"consent_checkbox7\">\n" +
    "            <span class=\"checkmark\"></span>\n" +
    "        </label>\n" +
    "\n" +
    "        <br><br>\n" +
    "        <button type=\"button\" id=\"start\" class=\"submit_button\">continue</button>\n" +
    "        <br><br>";


document.getElementById("start").onclick = check_consent;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    alert("Sorry, this experiment does not work on mobile devices");
    document.getElementById('consent').innerHTML = "";
}
