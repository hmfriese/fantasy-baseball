  
/******d3.csv('data/war_2017.csv', function(data) {
	console.log(data);
});********/

/*****************************************
*   Global variables
*****************************************/

const DATA_DIRECTORY = 'data/';

var xScale;
var yScale;
var xAxis;
var yAxis;
var showMoney = d3.format(".2s");

// When page first loads, don't hide anyone
var hide_sp = false;
var hide_c = false;
var hide_b1 = false;
var hide_b2= false;
var hide_b3= false;
var hide_ss= false;
var hide_lf= false;
var hide_cf= false;
var hide_rf= false;
var hide_dh= false;

//  SVG Placement
const SVG_HEIGHT = 500;
const SVG_WIDTH = 750;
const LEFT_PADDING = 60;
const BOTTOM_PADDING = 60;
const RIGHT_PADDING = 28;
const TOP_PADDING = 28;

const DOMAIN_PADDING = 0.06;


/*****************************************
*   Event Handlers--the show/hide stuff
*****************************************/

d3.select('#filename')
    .on('change', load_file);

//Select/deselect circles using the checkboxes

d3.select('#b1')
    .on('change', filter_circles);

d3.select('#b2')
    .on('change', filter_circles);

d3.select('#b3')
    .on('change', filter_circles);

d3.select('#ss')
    .on('change', filter_circles);

d3.select('#c')
    .on('change', filter_circles);

d3.select('#rf')
    .on('change', filter_circles);

d3.select('#cf')
    .on('change', filter_circles);

d3.select('#lf')
    .on('change', filter_circles);

d3.select('#dh')
    .on('change', filter_circles);

d3.select('#sp')
    .on('change', filter_circles);


/*****************************************
*   Data Load and Drawing SVG
*****************************************/

//Loads the data files, provides error/alert when files don't load
function load_file() {
    filename = get_filename();
    if (filename == null) return;
    d3.csv(filename, clean_rows)
        .then(function(dataset) {
            global_dataset = dataset;
            // builds scales (scales actually get set below)
            xScale = build_xscale(dataset);
            yScale = build_yscale(dataset);
            build_xaxis();
            build_yaxis();
            add_labels();
            draw_circles(dataset);
            })
        .catch( (err) => alert("Could not load data"));
}

//Adds circles based on .csv 
function draw_circles(dataset) {
    d3.select('svg')
        .selectAll('circle')
        .remove();
    d3.select('svg')
        .selectAll('circle')
        .data(dataset)
        .enter()
          .append('circle')
          .attr('cx', d => xScale(d.owner))
          .attr('cy', d => yScale(d.war))
          .attr('class', d => d.player);
    filter_circles();
}


function filter_circles() {
    hide_b1 = d3.select('#b1').property('checked') ? false : true;
    hide_b2 = d3.select('#b2').property('checked') ? false : true;
    hide_b3 = d3.select('#b3').property('checked') ? false : true;
    hide_ss = d3.select('#ss').property('checked') ? false : true;
    hide_c = d3.select('#c').property('checked') ? false : true;
    hide_rf = d3.select('#rf').property('checked') ? false : true;
    hide_cf = d3.select('#cf').property('checked') ? false : true;
    hide_lf = d3.select('#lf').property('checked') ? false : true;
    hide_dh = d3.select('#dh').property('checked') ? false : true;
    hide_sp = d3.select('#sp').property('checked') ? false : true;
    d3.selectAll('circle')
        .classed('invisible', d => player_filter(d));
}

function player_filter(d) {
    if (d.player == "B1" && hide_b1) return true;
    if (d.position == "B2" && hide_b2) return true;
    if (d.position == "B3" && hide_b3) return true;
    if (d.position == "SS" && hide_ss) return true;
    if (d.position == "C" && hide_c) return true;
    if (d.position == "RF" && hide_rf) return true;
    if (d.position == "CF" && hide_cf) return true;
    if (d.position == "LF" && hide_lf) return true;
    if (d.position == "DH" && hide_dh) return true;
    if (d.position == "SP" && hide_sp) return true;
    return false;
}

/*****************************************
*   Helper Functions
*****************************************/

// just a bit of help constructing the apprpriate file path
function get_filename() {
    filename = d3.select('#filename').property('value');
    if (filename != "") {
        return DATA_DIRECTORY + filename;
    } else {
        return null;
    }
}

//This function converts .csv to numbers where appropriate
function clean_rows(d) {
    return {player: +d.player, war: +d.war, owner: d.owner};
}

/*****************************************
*   Scales
*****************************************/

function build_xscale(data) {
    var span = d3.extent(data, d => d.player);
    var scale_padding = (span[1] - span[0]) * DOMAIN_PADDING;
    return d3.scaleLinear()
        .domain([span[0] - scale_padding, span[1] + scale_padding] )
        .rangeRound([LEFT_PADDING, SVG_WIDTH - RIGHT_PADDING]);
}

function build_yscale(data) {
    var maximum = d3.max(data, d => d.war);
    var minimum = d3.min(data, d => d.war);
    var scale_padding = (maximum - minimum) * DOMAIN_PADDING;
    return d3.scaleLinear()
        .domain([minimum - scale_padding, maximum + scale_padding])
        .rangeRound([SVG_HEIGHT - BOTTOM_PADDING, TOP_PADDING]);
}

/*****************************************
*   Axes
*****************************************/

function add_labels() {
    d3.select('svg')
        .append('text')
        .attr('transform', 'translate(290,480)')
        .text('Annual Salary in Millions of Dollars');
    d3.select('svg')
        .append('text')
        .attr('transform', 'translate(30,250) rotate(-90)')
        .text('WAR');
}

function build_xaxis() {
    var translate_string = 'translate(0,' + (SVG_HEIGHT - BOTTOM_PADDING) + ')';
    if (! xAxis) {
        xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat(showMoney);
        d3.select('svg')
            .append('g')
            .attr('transform', translate_string)
            .attr('id', 'xaxis')
            .call(xAxis);
    } else {
        xAxis.scale(xScale);
        d3.select('#xaxis')
            .transition()
            .duration(700)
            .call(xAxis);
    }
}

function build_yaxis() {
    var translate_string = 'translate(' + LEFT_PADDING + ',0)';
    if (! yAxis) {
        yAxis = d3.axisLeft()
            .scale(yScale);
        d3.select('svg')
        .append('g')
        .attr('transform', translate_string)
        .attr('id', 'yaxis')
        .call(yAxis);
    } else {
        yAxis.scale(yScale);
        d3.select('#yaxis')
            .transition()
            .duration(500)
            .call(yAxis);
    }
}