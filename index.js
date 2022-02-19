import {
  zupanijePopulacija,
  zivorodeniArray,
  umrliArray,
  sklopljeni_brakoviArray,
  razvedeni_brakoviArray,
} from "./data.js";

var selectedValue;

/*Map of Croatia*/
var width = 800;
var height = 800;
var projection = d3.geo
  .mercator()
  .center([1, 10])
  .scale(6000)
  .translate([17600, 4500])
  .rotate([-180, 0]);
var path = d3.geo.path().projection(projection);
var svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("background", "white")
  .call(d3.behavior.zoom().scaleExtent([0.3, 5]).on("zoom", onZoom))
  .append("g");
function drawMap(selectedValue) {
  d3.json("cro_regv3.json", function (error, cro) {
    var data = topojson.feature(cro, cro.objects.layer1);

    const zupanije = svg.selectAll("path.county").data(data.features);
    zupanije
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("id", function (d) {
        return d.id;
      })
      .attr("d", path)
      .attr("fill", d3.scale.category10())
      .style("fill-opacity", function (d) {
        if (d.properties.gn_name == "Grad Zagreb") return 1;

        return handleFillOpacity(d);
      })
      .style("stroke", "blue")
      .style("stroke-width", 1)
      .style("cursor", "pointer")
      .style("stroke-opacity", 1)
      .on("mouseover", function (d, i) {
        d3.select(this)
          .style("stroke-width", 2)
          .style("stroke", "aqua")
          .style("fill", "red");
        handleMouserOver(d, i);
      })
      .on("mouseout", function (d) {
        d3.select(this)
          .style("stroke-width", 1)
          .style("stroke", "blue")
          .style("fill", d3.scale.category10());
      })
      .on("click", function (d, i) {
        handleMouserOver(d, i);
      });
    zupanije.style("fill-opacity", function (d) {
      return handleFillOpacity(d);
    });
  });
}

function handleMouserOver(d, i) {
  d3.select("#zupanija").text(d.properties.gn_name);
  d3.select("#brojStanovnika").text(
    selectedValue + ": " + d.properties[selectedValue] + " "
  );
}

function handleFillOpacity(d) {
  if (selectedValue === "population") {
    return d.properties[selectedValue] / 500000;
  }
  if (selectedValue === "umrli") {
    return d.properties[selectedValue] / 5723;
  }
  if (selectedValue === "zivorodeni") {
    return d.properties[selectedValue] / 3584;
  }
  if (selectedValue === "sklopljeni_brakovi") {
    return d.properties[selectedValue] / 1519;
  }
  if (selectedValue === "razvedeni_brakovi") {
    return d.properties[selectedValue] / 515;
  }
}
function onZoom() {
  svg.attr(
    "transform",
    "translate (" + d3.event.translate + ") scale (" + d3.event.scale + ")"
  );
}

/*Barchart*/

function drawBarChart(selectedValue, selectedArray) {
  console.log("selected value in barchart", selectedValue);
  d3.select("#barchart").selectAll("*").remove();

  var margin = { top: 40, bottom: 70, left: 60, right: 20 };
  var barchartWidth = 680 - margin.left - margin.right;
  var barchartHeight = 420 - margin.top - margin.bottom;
  var barPadding = 4;
  var barWidth = barchartWidth / zupanijePopulacija.length - barPadding;
  var x = d3.scale
    .ordinal()
    .domain(d3.range(selectedArray.length))
    .rangeRoundBands([0, barchartWidth]);
  var y = d3.scale
    .linear()
    .domain([
      0,
      d3.max(selectedArray, function (d) {
        return d.data;
      }),
    ])
    .range([barchartHeight, 0]);

  var barChartSvg = d3
    .select("#barchart")
    .append("svg")
    .attr("width", barchartWidth + margin.left + margin.right)
    .attr("height", barchartHeight + margin.bottom + margin.top)
    .style("background-color", "aqua")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xAxis = d3.svg
    .axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(function (d, i) {
      return selectedArray[i].postal;
    });
  var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);

  barChartSvg
    .append("text")
    .attr("x", barchartWidth / 2)
    .attr("y", -(margin.top / 2))
    .attr("font-weight", "bold")
    .style("font-size", "20px")
    .style("text-anchor", "middle")
    .text(selectedValue + " u Hrvatskoj 2020.godine");

  barChartSvg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(barchartHeight / 2))
    .attr("y", -(margin.left / 2 + 20))
    .style("text-anchor", "middle")
    .style("font-size", "13px")
    .text(selectedValue);

  barChartSvg
    .append("text")
    .attr("x", barchartWidth / 2)
    .attr("y", barchartHeight + margin.bottom / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Zupanija");

  barChartSvg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + barchartHeight + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "middle");
  barChartSvg.append("g").attr("class", "y axis").call(yAxis);

  barChartSvg
    .selectAll("rect")
    .data(selectedArray)
    .enter()
    .append("rect")
    .attr("x", function (d, i) {
      return x(i);
    })
    .attr("y", function (d, i) {
      return y(d.data);
    })
    .attr("height", function (d) {
      return barchartHeight - y(d.data);
    })
    .attr("width", barWidth)
    .attr("fill", "green");
}

if (selectedValue === undefined) {
  selectedValue = "population";
  drawMap("population");
  drawBarChart("population", zupanijePopulacija);
}

function selectMenuListener() {
  selectedValue = document.getElementById("options").value;

  drawMap(selectedValue);
  if (selectedValue === "umrli") {
    drawBarChart("umrli", umrliArray);
  }
  if (selectedValue === "population") {
    drawBarChart("population", zupanijePopulacija);
  }
  if (selectedValue === "zivorodeni") {
    drawBarChart("zivorodeni", zivorodeniArray);
  }
  if (selectedValue === "sklopljeni_brakovi") {
    drawBarChart("sklopljeni_brakovi", sklopljeni_brakoviArray);
  }
  if (selectedValue === "razvedeni_brakovi") {
    drawBarChart("razvedeni_brakovi", razvedeni_brakoviArray);
  }
}
window.selectMenuListener = selectMenuListener;
