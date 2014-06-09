function scatterMatrix(data, traits) {
  var width = 960,
      size = 150,
      padding = 30;
  var x = d3.scale.linear()
      .range([padding / 2, size - padding / 2]);
  var y = d3.scale.linear()
      .range([size - padding / 2, padding / 2]);
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(5);
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(5);
  var color = d3.scale.category10();

  return function(selection) {
    var domainByTrait = {},
        n = traits.length;

    traits.forEach(function(trait) {
      domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
    });

    xAxis.tickSize(size * n);
    yAxis.tickSize(-size * n);

    var brush = d3.svg.brush()
        .x(x)
        .y(y)
        .on("brushstart", brushstart)
        .on("brush", brushmove)
        .on("brushend", brushend);

    var svg = selection
        .attr("width", size * n + padding)
        .attr("height", size * n + padding)
      .append("g")
        .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

    svg.selectAll(".x.axis")
        .data(traits)
      .enter().append("g")
        .attr("class", "x axis")
        .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
        .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

    svg.selectAll(".y.axis")
        .data(traits)
      .enter().append("g")
        .attr("class", "y axis")
        .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
        .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

    var cell = svg.selectAll(".cell")
        .data(cross(traits, traits))
      .enter().append("g")
        .attr("class", "cell")
        .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
        .each(plot);

    // Titles for the diagonal.
    cell.filter(function(d) { return d.i === d.j; }).append("text")
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(function(d) { return d.x; });

    cell.call(brush);

    function plot(p) {
      var cell = d3.select(this);

      x.domain(domainByTrait[p.x]);
      y.domain(domainByTrait[p.y]);

      cell.append("rect")
          .attr("class", "frame")
          .attr("x", padding / 2)
          .attr("y", padding / 2)
          .attr("width", size - padding)
          .attr("height", size - padding);

      cell.selectAll("circle")
          .data(data)
        .enter().append("circle")
          .attr("cx", function(d) { return x(d[p.x]); })
          .attr("cy", function(d) { return y(d[p.y]); })
          .attr("r", 3)
          .style("fill", function(d) { return color(d.species); });
    }

    var brushCell;

    // Clear the previously-active brush, if any.
    function brushstart(p) {
      if (brushCell !== this) {
        d3.select(brushCell).call(brush.clear());
        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);
        brushCell = this;
      }
    }

    // Highlight the selected circles.
    function brushmove(p) {
      var e = brush.extent();
      svg.selectAll("circle").classed("inactive", function(d) {
        return e[0][0] > d[p.x] || d[p.x] > e[1][0] ||
               e[0][1] > d[p.y] || d[p.y] > e[1][1];
      });
    }

    // If the brush is empty, select all circles.
    function brushend() {
      if (brush.empty()) svg.selectAll(".inactive").classed("inactive", false);
    }

    function cross(a, b) {
      var c = [], n = a.length, m = b.length, i, j;
      for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
      return c;
    }

    d3.select(self.frameElement).style("height", size * n + padding + 20 + "px");
  };
}


var app = angular.module('centrality', []);

app.controller('MainController', function($scope, $http) {
  $scope.datasets = [
    {name: '学会満足度', url: 'data/society.json'},
    {name: '研究環境', url: 'data/research.json'},
    {name: 'シャープペンシル', url: 'data/pen.json'},
    {name: '海外旅行', url: 'data/trip.json'},
    {name: 'ビジュアル分析', url: 'data/visualization.json'},
    {name: '住宅居間', url: 'data/house.json'}
  ];
  $scope.centralities = [
    {value: 'weight', name: 'Weight'},
    {value: 'degree', name: 'Degree Centrality'},
    {value: 'closeness', name: 'Closeness Centrality'},
    {value: 'betweenness', name: 'Betweenness Centrality'},
    {value: 'eigenvector', name: 'Eigenvector Centrality'},
    {value: 'katz', name: 'Katz Centrality'},
    {value: 'average', name: 'Average'},
    {value: 'naverage', name: 'Normalized Average'},
    {value: 'average2', name: 'Average without Katz'},
    {value: 'naverage2', name: 'Normalized Average without Katz'},
    {value: 'pca1', name: 'PCA1'},
    {value: 'pca2', name: 'PCA2'}
  ];

  $scope.dataset = 'data/pen.json';
  $scope.centrality = 'katz';
  $scope.threshold = 0;

  var svgSize = $('div#grid-wrapper').width();
  var egm = egrid.core.egm()
    .enableZoom(false)
    .size([svgSize, svgSize]);
  var gridSelection = d3.select('svg#grid')
    .call(egm.css());
  var graph = egrid.core.graph.graph();

  $scope.nVisibleNode = function() {
    return gridSelection.selectAll('g.vertex').size();
  };

  $scope.$watch('dataset', function(oldValue, newValue) {
    $http.get($scope.dataset)
      .success(function(data) {
        var grid = graph(data.nodes, data.links);
        var extents = {};
        $scope.centralities.forEach(function(c) {
          extents[c.value] = d3.extent(grid.vertices(), function(u) {
            return grid.get(u)[c.value];
          });
        });
        egm
          .vertexVisibility(function(data) {
            var c = $scope.centrality;
            var s = (data[c] - extents[c][0]) / (extents[c][1] - extents[c][0]);
            return s >= $scope.threshold;
          })
          .vertexColor(function(data) {
            var c = $scope.centrality;
            var h = 240 * (extents[c][1] - data[c]) / (extents[c][1] - extents[c][0]);
            return d3.hsl(h, 1, 0.5).toString();
          });
        gridSelection
          .datum(null)
          .call(egm)
          .datum(grid)
          .call(egm)
          .call(egm.center());

        var margin = 35;
        var bargraphsSelection = d3.select('div#bargraphs');
        bargraphsSelection.selectAll('div').remove();
        var rowSelection;
        var n = grid.vertices().length;
        var yBar = grid.vertices().reduce(function(sum, u) {
          return sum + grid.get(u).weight;
        }, 0) / n;
        var sigmaY = grid.vertices().reduce(function(sum, u) {
          var val = (grid.get(u).weight - yBar);
          return sum + val * val;
        }, 0);
        $scope.centralities.forEach(function(c, i) {
          var xBar = grid.vertices().reduce(function(sum, u) {
            return sum + grid.get(u)[c.value];
          }, 0) / n;
          var sigmaX = grid.vertices().reduce(function(sum, u) {
            var val = (grid.get(u)[c.value] - xBar);
            return sum + val * val;
          }, 0);
          var sigmaXY = grid.vertices().reduce(function(sum, u) {
            return sum + (grid.get(u)[c.value] - xBar) * (grid.get(u).weight - yBar);
          }, 0);
          c.R = sigmaXY / Math.sqrt(sigmaX * sigmaY);
          var values = {};
          grid.vertices().forEach(function(u) {
            var value = grid.get(u)[c.value];
            if (values[value] === undefined) {
              values[value] = 0;
            }
            values[value]++;
          });
          if (i % 3 === 0) {
            rowSelection = bargraphsSelection
              .append('div')
              .classed('row', true);
          }
          var wrapperSelection = rowSelection
            .append('div')
            .classed('col-xs-4', true);
          var size = $(wrapperSelection.node()).width();
          var plotSize = size - margin * 2;
          var scale = plotSize;
          var selection = wrapperSelection
            .append('svg')
            .attr({
              width: size,
              height: size,
            })
            .call(d3.downloadable({filename: 'chart.svg'}));

          var lines = d3.entries(values);
          c.setsize = lines.length;
          lines.sort(function(l1, l2) {
            return d3.ascending(+l1.key, +l2.key);
          });
          var acc = 0;
          var accLines = lines.map(function(d) {
            return {key: d.key, value: acc += d.value};
          });
          var xExtent = d3.extent(lines, function(d) {return +d.key;});
          var xMargin = (xExtent[1] - xExtent[0]) / 20;
          var xScale = d3.scale.linear()
            .domain([xExtent[0] - xMargin, xExtent[1] + xMargin])
            .range([0, 1])
            .nice();
          var yScale = d3.scale.linear()
            .domain([0, Math.max(10, d3.max(lines, function(d) {return d.value;}))])
            .range([1, 0]);
          var yScale2 = d3.scale.linear()
            .domain([0, grid.vertices().length])
            .range([1, 0]);
          var xAxisScale = xScale.copy().range([0, plotSize]);
          var yAxisScale = yScale.copy().range([plotSize, 1]);
          var yAxisScale2 = yScale2.copy().range([plotSize, 1]);
          var xAxis = d3.svg.axis()
            .scale(xAxisScale)
            .ticks(5)
            .orient('bottom');
          var yAxis = d3.svg.axis()
            .scale(yAxisScale)
            .tickFormat(d3.format('f'))
            .orient('left');
          var yAxis2 = d3.svg.axis()
            .scale(yAxisScale2)
            .tickFormat(d3.format('f'))
            .orient('right');
          var accLine = d3.svg.line()
            .x(function(d) {return xScale(+d.key);})
            .y(function(d) {return yScale2(d.value);});
          selection.append('g')
            .attr('transform', 'translate(' + margin + ',' + margin + ')scale(' + scale + ')')
            .selectAll('line')
            .data(lines)
            .enter()
            .append('line')
            .attr({
              x1: function(d) {
                return xScale(d.key);
              },
              y1: 1,
              x2: function(d) {
                return xScale(d.key);
              },
              y2: function(d) {
                return yScale(d.value);
              },
              stroke: 'blue',
              'stroke-width': 1 / scale,
              'stroke-opacity': 0.3
            });
          selection.select('g')
            .append('path')
            .attr({
              d: accLine(accLines),
              fill: 'none',
              stroke: 'black',
              'stroke-width': 1 / scale
            });
          selection.append('text')
            .text(c.value)
            .attr('transform', 'translate(' + (margin + 10) + ',' + margin + ')');
          selection.append('g')
            .attr('transform', 'translate(' + margin + ',' + (margin + plotSize) + ')')
            .call(xAxis);
          selection.append('g')
            .attr('transform', 'translate(' + margin + ',' + margin + ')')
            .call(yAxis);
          selection.append('g')
            .attr('transform', 'translate(' + (margin + plotSize) + ',' + margin + ')')
            .call(yAxis2);
          selection.selectAll('.tick line')
            .style('stroke', '#ddd');
          selection.selectAll('path.domain')
            .style({
              fill: 'none',
              stroke: 'black'
            });

          //d3.select('#scatter-matrix svg')
          //  .call(scatterMatrix(
          //    data.nodes,
          //    ['weight', 'degree', 'closeness', 'betweenness', 'eigenvector', 'katz', 'average', 'naverage']
          //  ));
        });
      });
  });

  $scope.$watch('centrality', function(oldValue, newValue) {
    if (oldValue != newValue) {
      gridSelection
        .call(egm)
        .call(egm.center());
    }
  });

  $scope.$watch('threshold', function(oldValue, newValue) {
    if (oldValue != newValue) {
      gridSelection
        .call(egm)
        .call(egm.center());
    }
  });

  d3.select(window)
    .on('resize', function() {
      var svgSize = $('div#grid-wrapper').width();
      egm.size([svgSize, svgSize]);
      gridSelection
        .call(egm.resize(svgSize, svgSize))
        .call(egm.center());
    });
});
