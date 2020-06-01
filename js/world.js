var dataUrl = "data/world.geojson";
var width = 960, 
    height = 600;

const config = {
              speed: 0.005,
              verticalTilt: -30,
              horizontalTilt: 0
            };

var mapState = {
    k:1,
    x:0,
    y:0
};

var activeLine = [];
var activeColor;
var drawing_data = {
    lines: []
  };

  
// Define data projection
// d3.geoConicEqualArea
// geoAlbers()
var projection = d3.geoAzimuthalEquidistant().scale(500)
                    .center([0,0])
                    .rotate([100,-90])
                    .translate([width/2,height/2]);;

var path = d3.geoPath()
             .projection(projection);

var graticule = d3.geoGraticule10();
const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", zoomed);

var svg = d3.select(".map-container").append("svg")
            .attr("width", width)
            .attr("height",height);

svg.call(zoom);

// Load the data
fetch(dataUrl)
    .then(response=>{
        return response.json()
    })
    .then(data => {
        console.log(data);
        createMap(data);
        addGraticules();
    })


var limits = [1511000,3981000, 7106000, 11726000, 25193000, 53555000,1379303000];
var quantize = function(data){
    let value = limits.find(limit=>{
        if(data <= limit){
            return limit;
        }
    });
    return "color-"+limits.indexOf(value);
}


function createMap (data) {
    svg.selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("class", "countries")
        .attr("d", path)
        .style("stroke-width",0.4)
        // .on("mouseover", function (d) {

        //     d3.select(".description").append("h5")
        //       .style("background", "#672044")
        //       .html(d.properties.NAME);

        //     d3.select(".description").append("h4")
        //       .html(d.properties.POP_EST);

        //     d3.select(".description").append("p")
        //       .html("Total Population")
            
        //     d3.select(this).classed("active", true);
        // })
        // .on("mouseout", function (d) {
        //     d3.select(this).classed("active", false);
        //     d3.select(".description").html("");
        // })
}

function zoomed() {
    mapState = d3.event.transform;
    
    var strokeWidth = 0.4 / mapState.k;
    console.log(mapState);
    svg
      .selectAll("path") // To prevent stroke width from scaling
      .attr("transform",mapState)
      .style("stroke-width", strokeWidth);
}

function addGraticules (){
    
    d3.select("svg").append("path")
        .datum(graticule)
        .attr("class", "graticule line")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "lightgray")
        .style("stroke-width", "0.2px");

    d3.select("svg").append("path")
        .datum(graticule.outline)
        .attr("class", "graticule outline")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", "0.2px");
}


function rotateGlobe() {
    d3.timer(function (elapsed) {
        console.log(elapsed);
        projection.rotate([config.speed*elapsed - 120, config.verticalTilt, config.horizontalTilt]);
        svg.selectAll("path").attr("d", path);
    });
}


// Line drawing
var editMode = false;
d3.select('#draw-button')
  .on("click", function(e){
        editMode = !editMode;

        if(editMode) {
            console.log("Drawing");
            svg.on('click', draw);
        } else {
            svg.on('click', null);
            activeLine = [];
        }
        
});

var drawItem = svg.append("path")
                  .data([activeLine])
                  .attr("d", renderLine)
                  .style("stroke","red")
                  .style("stroke-width",4);

var renderLine = d3.line().x(function(d) {
    return d[0];
}).y(function(d){
    return d[1];
});

function draw () {
    // let pnt = projection.invert(d3.mouse(this));
    activeLine.push(d3.mouse(this));

    console.log();
    redrawLine(activeLine);
}

svg.on("click", function(e) {
    console.log(d3.mouse(this));
});

// svg.call(drag);
function redrawLine (line) {
    
    svg.append("path")
        .data([line])
        .attr("d", function(d){ return renderLine(d); })
        .attr("class", "line-red")
        .style("stroke","red")
        .style("stroke-width", 4)
        .style("fill", "transparent")
        .on("click", function(e) {
            console.log("Selected");
            d3.select(this).style("stroke","yellow");
        });

    svg.selectAll("circle")
        .data(line)
        .enter()
        .append("circle")
        .attr("cy", d => d[0])
        .attr("cy", d => d[1])
        .attr("r", 4)
        .attr("fill", "blue");
        // .call(drag);
        
    
}


// edit selected line: Move the nodes or delete the nodes
var line = d3.line()
    .x(function(d) { return x(d[0]); })
    .y(function(d) { return y(d[1]); });

var drag = d3.drag()
                .on("start", dragStarted)
                .on("drag", dragged)
                .on("end", dragend)

function dragged (d) {
    d[0] = x.invert(d3.event.x);
    d[1] = y.invert(d3.event.y);
    d3.select(this)
        .attr('cx', x(d[0]))
        .attr('cy', y(d[1]))
    focus.select('path').attr('d', line);
}

function dragStarted (d) {
    d3.select(this).raise().classed("active", true);
}

function dragend(d) {
    d3.select(this).raise().classed("active", false);
}
// Button to control rotation

// Zoom in zoom out button
d3.select("#zoom-in")
  .on('click', function(e){
    d3.select(this).style("background-color","blue");
    zoom.scaleBy(svg.transition().duration(200),1.2);

    // d3.select(this).style("background-color","");
  });

d3.select("#zoom-out")
  .on('click', function(e){
        zoom.scaleBy(svg.transition().duration(200),0.8) 
  });


function transformSvg(state) {

    console.log(state);
    state.x = -480;
    state.y = -300;

    svg
    .selectAll("path") // To prevent stroke width from scaling
    .attr("transform",state)
    .style("stroke-width",0.2);
}
// Search Control
    // On search found zoom to the point
// 
