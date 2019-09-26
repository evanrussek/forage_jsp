var define_parameters = function(exp_stage){

  // figure out what should differentiate these...

  var parentDiv = document.body;

  var w = parentDiv.clientWidth;
  var h = parentDiv.clientHeight;


  // fixation
  var fixation_font_size = h/10;
  var fixation_x = w/2;
  var fixation_y = h/2;
  var fixation_color = "white";


  // background color
  var svg_color = d3.rgb(150, 150, 150);

  var good_color_vec = ["#202030", "#5D556A", "#635C51", "#B0A990"];


  var ver1 = {

    w: w,
    h: h,

    // fixation
    fixation_font_size: fixation_font_size,
    fixation_x: fixation_x,
    fixation_y: fixation_y,
    fixation_color: fixation_color,

    // background color
    svg_color: svg_color

  }
  return ver1
}


/// functions for placing things, should move these at some point
var place_img_bkg = function(class_name,x,y,width,height,color, opacity){
  d3.select("svg").append("rect")
          .attr("class",class_name)
          .attr("x", x)
          .attr("y", y)
          .attr("width", width)
          .attr("height", height)
          .style("fill", color)
          .style("opacity",opacity);
}

var place_img = function(im_name, class_name, x, y, width, height, opacity){
  d3.select("svg").append("svg:image").attr("class", class_name).attr("x", x)
      .attr("y", y).attr("width",width).attr("height",height)
      .attr("xlink:href", im_name).style("opacity",opacity);
}

var place_reward = function(magnitude, class_name, x, y, font_size, opacity){
   d3.select("svg").append("text")
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
var place_text = function(text, class_name, x, y, font_size, opacity, color){
   d3.select("svg").append("text")
             .attr("class", class_name)
             .attr("x",  x)
             .attr("y", y)
             .attr("font-family","sans-serif")
             .attr("font-weight","normal")
             .attr("font-size",font_size)
             .attr("text-anchor","middle")
             .attr("fill", color)
             .style("opacity",opacity)
             .text(text)
}

Math.randomGaussian = function(mean, standardDeviation) {

    //mean = defaultTo(mean, 0.0);
    //standardDeviation = defaultTo(standardDeviation, 1.0);

    if (Math.randomGaussian.nextGaussian !== undefined) {
        var nextGaussian = Math.randomGaussian.nextGaussian;
        delete Math.randomGaussian.nextGaussian;
        return (nextGaussian * standardDeviation) + mean;
    } else {
        var v1, v2, s, multiplier;
        do {
            v1 = 2 * Math.random() - 1; // between -1 and 1
            v2 = 2 * Math.random() - 1; // between -1 and 1
            s = v1 * v1 + v2 * v2;
        } while (s >= 1 || s == 0);
        multiplier = Math.sqrt(-2 * Math.log(s) / s);
        Math.randomGaussian.nextGaussian = v2 * multiplier;
        return (v1 * multiplier * standardDeviation) + mean;
    }

};
