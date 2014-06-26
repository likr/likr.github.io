(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var edgeLine, edgePointsSize, layout, resize, select, svg, transition, update;

  svg = require('../svg');

  update = require('./update');

  select = require('./select');

  edgeLine = d3.svg.line().interpolate('linear');

  edgePointsSize = 20;

  layout = function(arg) {
    var dagreEdgeSep, dagreNodeSep, dagreRankDir, dagreRankSep;
    dagreEdgeSep = arg.dagreEdgeSep, dagreNodeSep = arg.dagreNodeSep, dagreRankSep = arg.dagreRankSep, dagreRankDir = arg.dagreRankDir;
    return function(selection) {
      return selection.each(function() {
        var container, e, edges, i, point, u, vertices, _i, _j, _k, _len, _len1, _len2, _ref, _results;
        container = d3.select(this);
        vertices = container.selectAll('g.vertex').data();
        edges = container.selectAll('g.edge').data();
        vertices.sort(function(u, v) {
          return d3.ascending(u.key, v.key);
        });
        edges.sort(function(e1, e2) {
          return d3.ascending([e1.source.key, e1.target.key], [e2.source.key, e2.target.key]);
        });
        dagre.layout().nodes(vertices).edges(edges).lineUpTop(true).lineUpBottom(true).rankDir(dagreRankDir).nodeSep(dagreNodeSep).rankSep(dagreRankSep).edgeSep(dagreEdgeSep).run();
        for (_i = 0, _len = vertices.length; _i < _len; _i++) {
          u = vertices[_i];
          u.x = u.dagre.x;
          u.y = u.dagre.y;
        }
        _results = [];
        for (_j = 0, _len1 = edges.length; _j < _len1; _j++) {
          e = edges[_j];
          e.points = [];
          e.points.push(dagreRankDir === 'LR' ? [e.source.x + e.source.width / 2, e.source.y] : [e.source.x, e.source.y + e.source.height / 2]);
          _ref = e.dagre.points;
          for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
            point = _ref[_k];
            e.points.push([point.x, point.y]);
          }
          e.points.push(dagreRankDir === 'LR' ? [e.target.x - e.target.width / 2, e.target.y] : [e.target.x, e.target.y - e.target.height / 2]);
          _results.push((function() {
            var _l, _ref1, _results1;
            _results1 = [];
            for (i = _l = 1, _ref1 = edgePointsSize - e.points.length; 1 <= _ref1 ? _l <= _ref1 : _l >= _ref1; i = 1 <= _ref1 ? ++_l : --_l) {
              _results1.push(e.points.push(e.points[e.points.length - 1]));
            }
            return _results1;
          })());
        }
        return _results;
      });
    };
  };

  transition = function(arg) {
    var vertexColor, vertexOpacity;
    vertexOpacity = arg.vertexOpacity, vertexColor = arg.vertexColor;
    return function(selection) {
      var trans;
      trans = selection.transition();
      trans.selectAll('g.vertices > g.vertex').attr('transform', function(u) {
        return svg.transform.compose(svg.transform.translate(u.x, u.y), svg.transform.scale(u.scale));
      }).style('opacity', function(u) {
        return vertexOpacity(u.data);
      });
      trans.selectAll('g.vertices > g.vertex > rect').style('fill', function(u) {
        return vertexColor(u.data, u.key);
      });
      return trans.selectAll('g.edges > g.edge').select('path').attr('d', function(e) {
        return edgeLine(e.points);
      });
    };
  };

  resize = function(width, height) {
    return function(selection) {
      selection.attr({
        width: width,
        height: height
      });
      selection.select('rect.background').attr({
        width: width,
        height: height
      });
    };
  };

  module.exports = function(options) {
    var accessor, attr, egm, optionAttributes, val, zoom;
    if (options == null) {
      options = {};
    }
    zoom = d3.behavior.zoom().scaleExtent([0, 1]);
    egm = function(selection) {
      selection.call(update({
        edgePointsSize: edgePointsSize,
        edgeLine: edgeLine,
        vertexButtons: egm.vertexButtons(),
        vertexScale: egm.vertexScale(),
        vertexText: egm.vertexText(),
        vertexVisibility: egm.vertexVisibility(),
        enableZoom: egm.enableZoom(),
        zoom: zoom,
        maxTextLength: egm.maxTextLength()
      })).call(resize(egm.size()[0], egm.size()[1])).call(layout({
        dagreEdgeSep: egm.dagreEdgeSep(),
        dagreNodeSep: egm.dagreNodeSep(),
        dagreRankDir: egm.dagreRankDir(),
        dagreRankSep: egm.dagreRankSep()
      })).call(transition({
        vertexOpacity: egm.vertexOpacity(),
        vertexColor: egm.vertexColor()
      })).call(select(egm.vertexButtons()));
    };
    accessor = function(defaultVal) {
      var val;
      val = defaultVal;
      return function(arg) {
        if (arg != null) {
          val = arg;
          return egm;
        } else {
          return val;
        }
      };
    };
    optionAttributes = {
      dagreEdgeSep: 10,
      dagreNodeSep: 20,
      dagreRankDir: 'LR',
      dagreRankSep: 30,
      enableClickVertex: true,
      enableZoom: true,
      maxTextLength: Infinity,
      vertexButtons: function() {
        return [];
      },
      vertexColor: function() {
        return '';
      },
      vertexOpacity: function() {
        return 1;
      },
      vertexScale: function() {
        return 1;
      },
      vertexText: function(vertexData) {
        return vertexData.text;
      },
      vertexVisibility: function() {
        return true;
      },
      size: [1, 1]
    };
    egm.css = function(options) {
      var svgCss;
      if (options == null) {
        options = {};
      }
      svgCss = "g.vertex > rect, rect.background {\n  fill: " + (options.backgroundColor || 'whitesmoke') + ";\n}\ng.edge > path {\n  fill: none;\n}\ng.vertex > rect, g.edge > path {\n  stroke: " + (options.strokeColor || 'black') + ";\n}\ng.vertex > text {\n  fill: " + (options.strokeColor || 'black') + ";\n  user-select: none;\n  -moz-user-select: none;\n  -webkit-user-select: none;\n  -ms-user-select: none;\n}\ng.vertex.lower > rect, g.edge.lower > path {\n  stroke: " + (options.lowerStrokeColor || 'red') + ";\n}\ng.vertex.upper > rect, g.edge.upper > path {\n  stroke: " + (options.upperStrokeColor || 'blue') + ";\n}\ng.vertex.upper.lower>rect, g.edge.upper.lower>path {\n  stroke: " + (options.selectedStrokeColor || 'purple') + ";\n}\nrect.background {\n  cursor: move;\n  user-select: none;\n  -moz-user-select: none;\n  -webkit-user-select: none;\n  -ms-user-select: none;\n}\ng.vertex {\n  cursor: pointer;\n}\ng.vertex-buttons {\n  opacity: 0.7;\n}\ng.vertex-button {\n  cursor: pointer;\n}\ng.vertex-button>rect {\n  fill: #fff;\n  stroke: #adadad\n}\ng.vertex-button.hover>rect {\n  fill: #ebebeb;\n}";
      return function(selection) {
        selection.selectAll('defs.egrid-style').remove();
        return selection.append('defs').classed('egrid-style', true).append('style').text(svgCss);
      };
    };
    egm.resize = function(width, height) {
      egm.size([width, height]);
      return resize(width, height);
    };
    egm.center = function() {
      return function(selection) {
        var bottom, height, left, right, scale, top, vertices, width, _ref;
        _ref = egm.size(), width = _ref[0], height = _ref[1];
        vertices = selection.selectAll('g.vertex').data();
        left = d3.min(vertices, function(vertex) {
          return vertex.x - vertex.width / 2;
        });
        right = d3.max(vertices, function(vertex) {
          return vertex.x + vertex.width / 2;
        });
        top = d3.min(vertices, function(vertex) {
          return vertex.y - vertex.height / 2;
        });
        bottom = d3.max(vertices, function(vertex) {
          return vertex.y + vertex.height / 2;
        });
        scale = Math.min(width / (right - left), height / (bottom - top));
        return zoom.scale(scale).translate([(width - (right - left) * scale) / 2, (height - (bottom - top) * scale) / 2]).event(selection.select('g.contents'));
      };
    };
    egm.options = function(options) {
      var attr;
      for (attr in optionAttributes) {
        egm[attr](options[attr]);
      }
      return egm;
    };
    for (attr in optionAttributes) {
      val = optionAttributes[attr];
      egm[attr] = accessor(val);
    }
    return egm.options(options);
  };

}).call(this);

},{"../svg":16,"./select":2,"./update":3}],2:[function(require,module,exports){
(function() {
  var dijkstra, svg, updateButtons, updateSelectedVertex;

  svg = require('../svg');

  dijkstra = require('../graph/dijkstra');

  updateButtons = function(vertexButtons) {
    var vertexButtonHeight, vertexButtonMargin, vertexButtonWidth;
    vertexButtonWidth = 30;
    vertexButtonHeight = 20;
    vertexButtonMargin = 5;
    return function(container) {
      var selection, vertices;
      vertices = container.selectAll('g.vertex').filter(function(vertex) {
        return vertex.selected;
      }).data();
      selection = container.select('g.contents').selectAll('g.vertex-buttons').data(vertices, function(vertex) {
        return vertex.key;
      });
      selection.enter().append('g').each(function(vertex) {
        var button;
        button = d3.select(this).classed('vertex-buttons', true).selectAll('g.vertex-button').data(vertexButtons).enter().append('g').classed('vertex-button', true).attr({
          transform: function(d, i) {
            return svg.transform.translate(vertexButtonWidth * i, 0);
          }
        }).on('mouseenter', function() {
          return d3.select(this).classed('hover', true);
        }).on('mouseleave', function() {
          return d3.select(this).classed('hover', false);
        }).on('click', function(d) {
          return d.onClick(vertex.data, vertex.key);
        });
        button.append('rect').attr({
          width: vertexButtonWidth,
          height: vertexButtonHeight
        });
        return button.filter(function(d) {
          return d.icon != null;
        }).append('image').attr({
          x: vertexButtonWidth / 2 - 8,
          y: vertexButtonHeight / 2 - 8,
          width: '16px',
          height: '16px',
          'xlink:href': function(d) {
            return d.icon;
          }
        });
      });
      selection.exit().remove();
      container.selectAll('g.vertex-buttons').attr({
        transform: function(vertex) {
          var x, y;
          x = vertex.x - vertexButtonWidth * vertexButtons.length / 2;
          y = vertex.y + vertex.height / 2 + vertexButtonMargin;
          return svg.transform.translate(x, y);
        }
      });
    };
  };

  updateSelectedVertex = function() {
    return function(container) {
      var ancestors, descendants, graph, spf, vertex, verticesSelection, _i, _len, _ref;
      graph = container.datum();
      spf = dijkstra().weight(function() {
        return 1;
      });
      verticesSelection = container.selectAll('g.vertex').each(function(vertex) {
        return vertex.upper = vertex.lower = false;
      });
      descendants = d3.set();
      ancestors = d3.set();
      verticesSelection.filter(function(vertex) {
        return vertex.selected;
      }).each(function(vertex) {
        var dist, v, _ref, _ref1;
        spf.inv(false);
        _ref = spf(graph, vertex.key);
        for (v in _ref) {
          dist = _ref[v];
          if (dist < Infinity) {
            descendants.add(v);
          }
        }
        spf.inv(true);
        _ref1 = spf(graph, vertex.key);
        for (v in _ref1) {
          dist = _ref1[v];
          if (dist < Infinity) {
            ancestors.add(v);
          }
        }
      });
      _ref = verticesSelection.data();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vertex = _ref[_i];
        vertex.upper = ancestors.has(vertex.key);
        vertex.lower = descendants.has(vertex.key);
      }
      verticesSelection.classed({
        selected: function(vertex) {
          return vertex.selected;
        },
        upper: function(vertex) {
          return vertex.upper;
        },
        lower: function(vertex) {
          return vertex.lower;
        }
      });
      container.selectAll('g.edge').classed({
        upper: function(_arg) {
          var source, target;
          source = _arg.source, target = _arg.target;
          return source.upper && target.upper;
        },
        lower: function(_arg) {
          var source, target;
          source = _arg.source, target = _arg.target;
          return source.lower && target.lower;
        }
      });
    };
  };

  module.exports = function(vertexButtons) {
    return function(container) {
      container.call(updateSelectedVertex()).call(updateButtons(vertexButtons));
    };
  };

}).call(this);

},{"../graph/dijkstra":5,"../svg":16}],3:[function(require,module,exports){
(function() {
  var calculateTextSize, createVertex, initContainer, makeGrid, onClickVertex, onMouseEnterVertex, onMouseLeaveVertex, select, svg, updateEdges, updateVertices;

  svg = require('../svg');

  select = require('./select');

  onClickVertex = function(_arg) {
    var container, vertexButtons;
    container = _arg.container, vertexButtons = _arg.vertexButtons;
    return function(vertex) {
      vertex.selected = !vertex.selected;
      container.call(select(vertexButtons));
    };
  };

  onMouseEnterVertex = function(vertexText) {
    return function(vertex) {
      return d3.select(this).select('text').text(vertexText(vertex.data));
    };
  };

  onMouseLeaveVertex = function() {
    return function(vertex) {
      return d3.select(this).select('text').transition().delay(1000).text(vertex.text);
    };
  };

  calculateTextSize = function() {
    return function(selection) {
      var measure, measureText;
      measure = d3.select('body').append('svg');
      measureText = measure.append('text');
      selection.each(function(u) {
        var bbox;
        measureText.text(u.text);
        bbox = measureText.node().getBBox();
        u.textWidth = bbox.width;
        return u.textHeight = bbox.height;
      });
      return measure.remove();
    };
  };

  createVertex = function() {
    return function(selection) {
      selection.append('rect');
      return selection.append('text').each(function(u) {
        u.x = 0;
        u.y = 0;
        return u.selected = false;
      }).attr({
        'text-anchor': 'left',
        'dominant-baseline': 'text-before-edge'
      });
    };
  };

  updateVertices = function(arg) {
    var r, strokeWidth, vertexScale;
    r = 5;
    strokeWidth = 1;
    vertexScale = arg.vertexScale;
    return function(selection) {
      selection.enter().append('g').classed('vertex', true).call(createVertex());
      selection.exit().remove();
      selection.call(calculateTextSize()).each(function(u) {
        u.originalWidth = u.textWidth + 2 * r;
        u.originalHeight = u.textHeight + 2 * r;
        u.scale = vertexScale(u.data);
        u.width = (u.originalWidth + strokeWidth) * u.scale;
        return u.height = (u.originalHeight + strokeWidth) * u.scale;
      });
      selection.select('text').text(function(u) {
        return u.text;
      }).attr({
        x: function(u) {
          return -u.textWidth / 2;
        },
        y: function(u) {
          return -u.textHeight / 2;
        }
      });
      return selection.select('rect').attr({
        x: function(u) {
          return -u.originalWidth / 2;
        },
        y: function(u) {
          return -u.originalHeight / 2;
        },
        width: function(u) {
          return u.originalWidth;
        },
        height: function(u) {
          return u.originalHeight;
        },
        rx: r
      });
    };
  };

  updateEdges = function(arg) {
    var edgeLine, edgePointsSize;
    edgePointsSize = arg.edgePointsSize, edgeLine = arg.edgeLine;
    return function(selection) {
      selection.enter().append('g').classed('edge', true).append('path').attr('d', function(_arg) {
        var i, points, source, target, _i;
        source = _arg.source, target = _arg.target;
        points = [];
        points.push([source.x, source.y]);
        for (i = _i = 1; 1 <= edgePointsSize ? _i <= edgePointsSize : _i >= edgePointsSize; i = 1 <= edgePointsSize ? ++_i : --_i) {
          points.push([target.x, target.y]);
        }
        return edgeLine(points);
      });
      return selection.exit().remove();
    };
  };

  makeGrid = function(graph, arg) {
    var edges, maxTextLength, oldVertices, oldVerticesMap, pred, text, u, v, vertex, vertexText, vertices, verticesMap, w, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _ref, _ref1, _ref2, _ref3;
    pred = arg.pred, oldVertices = arg.oldVertices, vertexText = arg.vertexText, maxTextLength = arg.maxTextLength;
    oldVerticesMap = {};
    for (_i = 0, _len = oldVertices.length; _i < _len; _i++) {
      u = oldVertices[_i];
      oldVerticesMap[u.key] = u;
    }
    vertices = graph.vertices().filter(pred).map(function(u) {
      if (oldVerticesMap[u] != null) {
        return oldVerticesMap[u];
      } else {
        return {
          key: u,
          data: graph.get(u)
        };
      }
    });
    for (_j = 0, _len1 = vertices.length; _j < _len1; _j++) {
      vertex = vertices[_j];
      text = vertexText(vertex.data);
      if (text.length > maxTextLength) {
        vertex.text = "" + (text.slice(0, maxTextLength)) + "...";
      } else {
        vertex.text = text;
      }
    }
    verticesMap = {};
    for (_k = 0, _len2 = vertices.length; _k < _len2; _k++) {
      u = vertices[_k];
      verticesMap[u.key] = u;
    }
    edges = [];
    _ref = graph.vertices();
    for (_l = 0, _len3 = _ref.length; _l < _len3; _l++) {
      u = _ref[_l];
      if (pred(u)) {
        _ref1 = graph.adjacentVertices(u);
        for (_m = 0, _len4 = _ref1.length; _m < _len4; _m++) {
          v = _ref1[_m];
          if (pred(v)) {
            edges.push({
              source: verticesMap[u],
              target: verticesMap[v]
            });
          }
        }
      } else {
        _ref2 = graph.adjacentVertices(u);
        for (_n = 0, _len5 = _ref2.length; _n < _len5; _n++) {
          v = _ref2[_n];
          _ref3 = graph.invAdjacentVertices(u);
          for (_o = 0, _len6 = _ref3.length; _o < _len6; _o++) {
            w = _ref3[_o];
            if ((pred(v)) && (pred(w))) {
              edges.push({
                source: verticesMap[w],
                target: verticesMap[v]
              });
            }
          }
        }
      }
    }
    return {
      vertices: vertices,
      edges: edges
    };
  };

  initContainer = function(zoom) {
    return function(selection) {
      var contents;
      contents = selection.select('g.contents');
      if (contents.empty()) {
        selection.append('rect').classed('background', true);
        contents = selection.append('g').classed('contents', true);
        contents.append('g').classed('edges', true);
        contents.append('g').classed('vertices', true);
        zoom.on('zoom', function() {
          var e, s, t;
          e = d3.event;
          t = svg.transform.translate(e.translate[0], e.translate[1]);
          s = svg.transform.scale(e.scale);
          return contents.attr('transform', svg.transform.compose(t, s));
        });
      }
    };
  };

  module.exports = function(arg) {
    var edgeLine, edgePointsSize, enableZoom, maxTextLength, vertexButtons, vertexScale, vertexText, vertexVisibility, zoom;
    vertexScale = arg.vertexScale, vertexText = arg.vertexText, vertexVisibility = arg.vertexVisibility, enableZoom = arg.enableZoom, zoom = arg.zoom, maxTextLength = arg.maxTextLength, edgePointsSize = arg.edgePointsSize, edgeLine = arg.edgeLine, vertexButtons = arg.vertexButtons;
    return function(selection) {
      return selection.each(function(graph) {
        var container, contents, edges, vertices, _ref;
        container = d3.select(this);
        if (graph != null) {
          container.call(initContainer(zoom));
          contents = container.select('g.contents');
          if (enableZoom) {
            container.select('rect.background').call(zoom);
          } else {
            container.select('rect.background').on('.zoom', null);
          }
          _ref = makeGrid(graph, {
            pred: function(u) {
              return vertexVisibility(graph.get(u), u);
            },
            oldVertices: container.selectAll('g.vertex').data(),
            vertexText: vertexText,
            maxTextLength: maxTextLength
          }), vertices = _ref.vertices, edges = _ref.edges;
          contents.select('g.vertices').selectAll('g.vertex').data(vertices, function(u) {
            return u.key;
          }).call(updateVertices({
            vertexScale: vertexScale
          })).on('click', onClickVertex({
            container: container,
            vertexButtons: vertexButtons
          })).on('mouseenter', onMouseEnterVertex(vertexText)).on('mouseleave', onMouseLeaveVertex()).on('touchstart', onMouseEnterVertex(vertexText)).on('touchmove', function() {
            return d3.event.preventDefault();
          }).on('touchend', onMouseLeaveVertex());
          return contents.select('g.edges').selectAll('g.edge').data(edges, function(_arg) {
            var source, target;
            source = _arg.source, target = _arg.target;
            return "" + source.key + ":" + target.key;
          }).call(updateEdges({
            edgePointsSize: edgePointsSize,
            edgeLine: edgeLine
          }));
        } else {
          return container.select('g.contents').remove();
        }
      });
    };
  };

}).call(this);

},{"../svg":16,"./select":2}],4:[function(require,module,exports){
(function() {
  module.exports = function(v, e) {
    var AdjacencyList, nextVertexId, vertices;
    nextVertexId = 0;
    vertices = {};
    AdjacencyList = (function() {
      function AdjacencyList(vertices, edges) {
        var source, target, vertex, _i, _j, _len, _len1, _ref;
        if (vertices == null) {
          vertices = [];
        }
        if (edges == null) {
          edges = [];
        }
        for (_i = 0, _len = vertices.length; _i < _len; _i++) {
          vertex = vertices[_i];
          this.addVertex(vertex);
        }
        for (_j = 0, _len1 = edges.length; _j < _len1; _j++) {
          _ref = edges[_j], source = _ref.source, target = _ref.target;
          this.addEdge(source, target);
        }
      }

      AdjacencyList.prototype.vertices = function() {
        var u, _results;
        _results = [];
        for (u in vertices) {
          _results.push(+u);
        }
        return _results;
      };

      AdjacencyList.prototype.edges = function() {
        var u, _ref;
        return (_ref = []).concat.apply(_ref, (function() {
          var _i, _len, _ref, _results;
          _ref = this.vertices();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            u = _ref[_i];
            _results.push(this.outEdges(u));
          }
          return _results;
        }).call(this));
      };

      AdjacencyList.prototype.adjacentVertices = function(u) {
        var _results;
        _results = [];
        for (v in vertices[u].outAdjacencies) {
          _results.push(+v);
        }
        return _results;
      };

      AdjacencyList.prototype.invAdjacentVertices = function(u) {
        var _results;
        _results = [];
        for (v in vertices[u].inAdjacencies) {
          _results.push(+v);
        }
        return _results;
      };

      AdjacencyList.prototype.outEdges = function(u) {
        var _results;
        _results = [];
        for (v in vertices[u].outAdjacencies) {
          _results.push([u, +v]);
        }
        return _results;
      };

      AdjacencyList.prototype.inEdges = function(u) {
        var _results;
        _results = [];
        for (v in vertices[u].inAdjacencies) {
          _results.push([+v, u]);
        }
        return _results;
      };

      AdjacencyList.prototype.outDegree = function(u) {
        return Object.keys(vertices[u].outAdjacencies).length;
      };

      AdjacencyList.prototype.inDegree = function(u) {
        return Object.keys(vertices[u].inAdjacencies).length;
      };

      AdjacencyList.prototype.numVertices = function() {
        return Object.keys(vertices).length;
      };

      AdjacencyList.prototype.numEdges = function() {
        var i;
        return ((function() {
          var _i, _len, _ref, _results;
          _ref = this.vertices();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(this.outDegree(i));
          }
          return _results;
        }).call(this)).reduce((function(t, s) {
          return t + s;
        }), 0);
      };

      AdjacencyList.prototype.vertex = function(u) {
        return u;
      };

      AdjacencyList.prototype.edge = function(u, v) {
        return vertices[u].outAdjacencies[v] != null;
      };

      AdjacencyList.prototype.addEdge = function(u, v, prop) {
        if (prop == null) {
          prop = {};
        }
        vertices[u].outAdjacencies[v] = prop;
        vertices[v].inAdjacencies[u] = prop;
        return [u, v];
      };

      AdjacencyList.prototype.removeEdge = function(u, v) {
        delete vertices[u].outAdjacencies[v];
        delete vertices[v].inAdjacencies[u];
      };

      AdjacencyList.prototype.addVertex = function(prop, u) {
        var vertexId;
        vertexId = u != null ? u : nextVertexId++;
        vertices[vertexId] = {
          outAdjacencies: {},
          inAdjacencies: {},
          property: prop
        };
        return vertexId;
      };

      AdjacencyList.prototype.clearVertex = function(u) {
        var w, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
        _ref = this.inEdges(u);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref1 = _ref[_i], v = _ref1[0], w = _ref1[1];
          this.removeEdge(v, w);
        }
        _ref2 = this.outEdges(u);
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          _ref3 = _ref2[_j], v = _ref3[0], w = _ref3[1];
          this.removeEdge(v, w);
        }
      };

      AdjacencyList.prototype.removeVertex = function(u) {
        delete vertices[u];
      };

      AdjacencyList.prototype.get = function(u, v) {
        if (v != null) {
          return vertices[u].outAdjacencies[v];
        } else {
          return vertices[u].property;
        }
      };

      return AdjacencyList;

    })();
    return new AdjacencyList(v, e);
  };

}).call(this);

},{}],5:[function(require,module,exports){
(function() {
  module.exports = function() {
    var dijkstra, inv, weight;
    weight = function(p) {
      return p.weight;
    };
    inv = false;
    dijkstra = function(graph, i) {
      var adjacentVertices, distance, distances, j, queue, u, v, _i, _j, _len, _len1, _ref, _ref1;
      adjacentVertices = inv ? function(u) {
        return graph.invAdjacentVertices(u);
      } : function(u) {
        return graph.adjacentVertices(u);
      };
      distances = {};
      _ref = graph.vertices();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        j = _ref[_i];
        distances[j] = Infinity;
      }
      distances[i] = 0;
      queue = [i];
      while (queue.length > 0) {
        u = queue.pop();
        _ref1 = adjacentVertices(u);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          v = _ref1[_j];
          if (distances[v] === Infinity) {
            queue.push(v);
          }
          distance = distances[u] + weight(graph.get(u, v));
          if (distance < distances[v]) {
            distances[v] = distance;
          }
        }
      }
      return distances;
    };
    dijkstra.weight = function(f) {
      if (f != null) {
        weight = f;
        return dijkstra;
      } else {
        return weight;
      }
    };
    dijkstra.inv = function(flag) {
      if (flag != null) {
        inv = flag;
        return dijkstra;
      } else {
        return inv;
      }
    };
    return dijkstra;
  };

}).call(this);

},{}],6:[function(require,module,exports){
(function() {
  var adjacencyList;

  adjacencyList = require('./adjacency-list');

  module.exports = function() {
    var factory, source, target;
    source = function(e) {
      return e.source;
    };
    target = function(e) {
      return e.target;
    };
    factory = function(vertices, edges) {
      return adjacencyList(vertices, edges);
    };
    factory.source = function(f) {
      if (f != null) {
        source = f;
        return factory;
      } else {
        return source;
      }
    };
    factory.target = function(f) {
      if (f != null) {
        target = f;
        return factory;
      } else {
        return target;
      }
    };
    return factory;
  };

}).call(this);

},{"./adjacency-list":4}],7:[function(require,module,exports){
(function() {
  module.exports = {
    graph: require('./graph'),
    adjacencyList: require('./adjacency-list'),
    dijkstra: require('./dijkstra'),
    warshallFloyd: require('./warshall-floyd')
  };

}).call(this);

},{"./adjacency-list":4,"./dijkstra":5,"./graph":6,"./warshall-floyd":8}],8:[function(require,module,exports){
(function() {
  module.exports = function() {
    var warshallFloyd, weight;
    weight = function(p) {
      return p.weight;
    };
    warshallFloyd = function(graph) {
      var distance, distances, i, j, k, u, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      distances = {};
      _ref = graph.vertices();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        u = _ref[_i];
        distances[u] = {};
        _ref1 = graph.vertices();
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          v = _ref1[_j];
          distances[u][v] = Infinity;
        }
        distances[u][u] = 0;
        _ref2 = graph.adjacentVertices(u);
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          v = _ref2[_k];
          distances[u][v] = weight(graph.get(u, v));
        }
      }
      _ref3 = graph.vertices();
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        k = _ref3[_l];
        _ref4 = graph.vertices();
        for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
          i = _ref4[_m];
          _ref5 = graph.vertices();
          for (_n = 0, _len5 = _ref5.length; _n < _len5; _n++) {
            j = _ref5[_n];
            distance = distances[i][k] + distances[k][j];
            if (distance < distances[i][j]) {
              distances[i][j] = distance;
            }
          }
        }
      }
      return distances;
    };
    warshallFloyd.weight = function(f) {
      if (f != null) {
        weight = f;
        return warshallFloyd;
      } else {
        return weight;
      }
    };
    return warshallFloyd;
  };

}).call(this);

},{}],9:[function(require,module,exports){
(function() {
  var factory;

  factory = require('../graph/graph');

  module.exports = function(vertices, edges) {
    var EgmGraph, execute, fact, graph, redoStack, undoStack;
    fact = factory();
    if (vertices != null) {
      if (edges != null) {
        graph = fact(vertices, edges);
      } else {
        graph = vertices;
      }
    } else {
      graph = fact();
    }
    undoStack = [];
    redoStack = [];
    execute = function(transaction) {
      transaction.execute();
      undoStack.push(transaction);
      redoStack = [];
    };
    EgmGraph = (function() {
      function EgmGraph() {}

      EgmGraph.prototype.graph = function() {
        return graph;
      };

      EgmGraph.prototype.addConstruct = function(text) {
        var u, v, value, _i, _len, _ref;
        v = null;
        value = {
          text: text,
          original: true
        };
        _ref = graph.vertices();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          u = _ref[_i];
          if (graph.get(u).text === value.text) {
            return +u;
          }
        }
        execute({
          execute: function() {
            return v = graph.addVertex(value, v);
          },
          revert: function() {
            return graph.removeVertex(v);
          }
        });
        return v;
      };

      EgmGraph.prototype.removeConstruct = function(u) {
        var value;
        value = graph.get(u);
        edges = graph.inEdges(u).concat(graph.outEdges(u));
        execute({
          execute: function() {
            graph.clearVertex(u);
            return graph.removeVertex(u);
          },
          revert: function() {
            var v, w, _i, _len, _ref, _results;
            graph.addVertex(value, u);
            _results = [];
            for (_i = 0, _len = edges.length; _i < _len; _i++) {
              _ref = edges[_i], v = _ref[0], w = _ref[1];
              _results.push(graph.addEdge(v, w));
            }
            return _results;
          }
        });
      };

      EgmGraph.prototype.updateConstruct = function(u, key, value) {
        var oldValue, properties;
        properties = graph.get(u);
        oldValue = properties[key];
        execute({
          execute: function() {
            return properties[key] = value;
          },
          revert: function() {
            return properties[key] = oldValue;
          }
        });
      };

      EgmGraph.prototype.addEdge = function(u, v) {
        execute({
          execute: function() {
            return graph.addEdge(u, v);
          },
          revert: function() {
            return graph.removeEdge(u, v);
          }
        });
      };

      EgmGraph.prototype.removeEdge = function(u, v) {
        execute({
          execute: function() {
            return graph.removeEdge(u, v);
          },
          revert: function() {
            return graph.addEdge(u, v);
          }
        });
      };

      EgmGraph.prototype.ladderUp = function(u, text) {
        var dup, v, value, w;
        v = null;
        value = {
          text: text,
          original: false
        };
        dup = (function() {
          var _i, _len, _ref, _results;
          _ref = graph.vertices();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            w = _ref[_i];
            if (graph.get(w).text === value.text) {
              _results.push(+w);
            }
          }
          return _results;
        })();
        if (dup.length > 0) {
          v = dup[0];
          execute({
            execute: function() {
              return graph.addEdge(v, u);
            },
            revert: function() {
              return graph.removeEdge(v, u);
            }
          });
        } else {
          execute({
            execute: function() {
              v = graph.addVertex(value, v);
              return graph.addEdge(v, u);
            },
            revert: function() {
              graph.removeEdge(v, u);
              return graph.removeVertex(v);
            }
          });
        }
        return v;
      };

      EgmGraph.prototype.ladderDown = function(u, text) {
        var dup, v, value, w;
        v = null;
        value = {
          text: text,
          original: false
        };
        dup = (function() {
          var _i, _len, _ref, _results;
          _ref = graph.vertices();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            w = _ref[_i];
            if (graph.get(w).text === value.text) {
              _results.push(+w);
            }
          }
          return _results;
        })();
        if (dup.length > 0) {
          v = dup[0];
          execute({
            execute: function() {
              return graph.addEdge(u, v);
            },
            revert: function() {
              return graph.removeEdge(u, v);
            }
          });
        } else {
          execute({
            execute: function() {
              v = graph.addVertex(value, v);
              return graph.addEdge(u, v);
            },
            revert: function() {
              graph.removeEdge(u, v);
              return graph.removeVertex(v);
            }
          });
        }
        return v;
      };

      EgmGraph.prototype.merge = function(u, v) {
        var uAdjacentVertices, uInvAdjacentVertices, uText, uValue, vAdjacentVertices, vInvAdjacentVertices, vValue;
        uValue = graph.get(u);
        vValue = graph.get(v);
        uText = uValue.text;
        uAdjacentVertices = graph.adjacentVertices(u);
        uInvAdjacentVertices = graph.invAdjacentVertices(u);
        vAdjacentVertices = graph.adjacentVertices(v);
        vInvAdjacentVertices = graph.invAdjacentVertices(v);
        execute({
          execute: function() {
            var w, _i, _j, _len, _len1, _results;
            uValue.text = "" + uValue.text + ", " + vValue.text;
            graph.clearVertex(v);
            graph.removeVertex(v);
            for (_i = 0, _len = vAdjacentVertices.length; _i < _len; _i++) {
              w = vAdjacentVertices[_i];
              graph.addEdge(u, w);
            }
            _results = [];
            for (_j = 0, _len1 = vInvAdjacentVertices.length; _j < _len1; _j++) {
              w = vInvAdjacentVertices[_j];
              _results.push(graph.addEdge(w, u));
            }
            return _results;
          },
          revert: function() {
            var w, _i, _j, _k, _l, _len, _len1, _len2, _len3;
            graph.clearVertex(u);
            graph.addVertex(vValue, v);
            for (_i = 0, _len = uAdjacentVertices.length; _i < _len; _i++) {
              w = uAdjacentVertices[_i];
              graph.addEdge(u, w);
            }
            for (_j = 0, _len1 = uInvAdjacentVertices.length; _j < _len1; _j++) {
              w = uInvAdjacentVertices[_j];
              graph.addEdge(w, u);
            }
            for (_k = 0, _len2 = vAdjacentVertices.length; _k < _len2; _k++) {
              w = vAdjacentVertices[_k];
              graph.addEdge(v, w);
            }
            for (_l = 0, _len3 = vInvAdjacentVertices.length; _l < _len3; _l++) {
              w = vInvAdjacentVertices[_l];
              graph.addEdge(w, v);
            }
            return uValue.text = uText;
          }
        });
        return u;
      };

      EgmGraph.prototype.canUndo = function() {
        return undoStack.length > 0;
      };

      EgmGraph.prototype.canRedo = function() {
        return redoStack.length > 0;
      };

      EgmGraph.prototype.undo = function() {
        var transaction;
        if (!this.canUndo()) {
          throw new Error('Undo stack is empty');
        }
        transaction = undoStack.pop();
        transaction.revert();
        redoStack.push(transaction);
      };

      EgmGraph.prototype.redo = function() {
        var transaction;
        if (!this.canRedo()) {
          throw new Error('Redo stack is empty');
        }
        transaction = redoStack.pop();
        transaction.execute();
        undoStack.push(transaction);
      };

      return EgmGraph;

    })();
    return new EgmGraph;
  };

}).call(this);

},{"../graph/graph":6}],10:[function(require,module,exports){
(function (global){
(function() {
  global.window.egrid = {
    core: {
      egm: require('./egm'),
      grid: require('./grid'),
      graph: require('./graph'),
      network: require('./network'),
      ui: require('./ui')
    }
  };

}).call(this);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./egm":1,"./graph":7,"./grid":9,"./network":15,"./ui":18}],11:[function(require,module,exports){
(function() {
  module.exports = function() {
    return function(graph) {
      var d, delta, paths, queue, result, s, sigma, stack, t, v, w, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4;
      result = {};
      _ref = graph.vertices();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        result[v] = 0;
      }
      _ref1 = graph.vertices();
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        s = _ref1[_j];
        stack = [];
        paths = {};
        sigma = {};
        d = {};
        delta = {};
        _ref2 = graph.vertices();
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          t = _ref2[_k];
          paths[t] = [];
          sigma[t] = 0;
          d[t] = -1;
          delta[t] = 0;
        }
        sigma[s] = 1;
        d[s] = 0;
        queue = [s];
        while (queue.length > 0) {
          v = queue.shift();
          stack.push(v);
          _ref3 = graph.adjacentVertices(v);
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            w = _ref3[_l];
            if (d[w] < 0) {
              queue.push(w);
              d[w] = d[v] + 1;
            }
            if (d[w] === d[v] + 1) {
              sigma[w] += sigma[v];
              paths[w].push(v);
            }
          }
        }
        while (stack.length > 0) {
          w = stack.pop();
          _ref4 = paths[w];
          for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
            v = _ref4[_m];
            delta[v] += sigma[v] / sigma[w] * (1 + delta[w]);
            if (w !== s) {
              result[w] += delta[w];
            }
          }
        }
      }
      return result;
    };
  };

}).call(this);

},{}],12:[function(require,module,exports){
(function() {
  module.exports = function(weight) {
    var warshallFloyd;
    warshallFloyd = require('../../graph/warshall-floyd');
    return function(graph) {
      var distances, result, u, v, val, _i, _j, _len, _len1, _ref, _ref1;
      result = {};
      distances = warshallFloyd(graph);
      _ref = graph.vertices();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        u = _ref[_i];
        val = 0;
        _ref1 = graph.vertices();
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          v = _ref1[_j];
          if (u !== v) {
            val += 1 / distances[u][v];
            val += 1 / distances[v][u];
          }
        }
        result[u] = val;
      }
      return result;
    };
  };

}).call(this);

},{"../../graph/warshall-floyd":8}],13:[function(require,module,exports){
(function() {
  module.exports = {
    inDegree: function(graph) {
      var result, u, _i, _len, _ref;
      result = {};
      _ref = graph.vertices();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        u = _ref[_i];
        result[u] = graph.inDegree(u);
      }
      return result;
    },
    outDegree: function(graph) {
      var result, u, _i, _len, _ref;
      result = {};
      _ref = graph.vertices();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        u = _ref[_i];
        result[u] = graph.outDegree(u);
      }
      return result;
    },
    degree: function(graph) {
      var result, u, _i, _len, _ref;
      result = {};
      _ref = graph.vertices();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        u = _ref[_i];
        result[u] = (graph.outDegree(u)) + (graph.inDegree(u));
      }
      return result;
    }
  };

}).call(this);

},{}],14:[function(require,module,exports){
(function() {
  var degree;

  degree = require('./degree');

  module.exports = {
    degree: degree.degree,
    inDegree: degree.inDegree,
    outDegree: degree.outDegree,
    closeness: require('./closeness'),
    betweenness: require('./betweenness')
  };

}).call(this);

},{"./betweenness":11,"./closeness":12,"./degree":13}],15:[function(require,module,exports){
(function() {
  module.exports = {
    centrality: require('./centrality')
  };

}).call(this);

},{"./centrality":14}],16:[function(require,module,exports){
(function() {
  module.exports = {
    transform: require('./transform')
  };

}).call(this);

},{"./transform":17}],17:[function(require,module,exports){
(function() {
  var Scale, Translate,
    __slice = [].slice;

  Translate = (function() {
    function Translate(tx, ty) {
      if (ty == null) {
        ty = 0;
      }
      this.tx = tx;
      this.ty = ty;
    }

    Translate.prototype.toString = function() {
      return "translate(" + this.tx + "," + this.ty + ")";
    };

    return Translate;

  })();

  Scale = (function() {
    function Scale(sx, sy) {
      this.sx = sx;
      this.sy = sy || sx;
    }

    Scale.prototype.toString = function() {
      return "scale(" + this.sx + "," + this.sy + ")";
    };

    return Scale;

  })();

  module.exports = {
    translate: function(tx, ty) {
      return new Translate(tx, ty);
    },
    scale: function(sx, sy) {
      return new Scale(sx, sy);
    },
    compose: function() {
      var transforms;
      transforms = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return transforms.map(function(t) {
        return t.toString();
      }).join('');
    }
  };

}).call(this);

},{}],18:[function(require,module,exports){
(function() {
  module.exports = {
    removeButton: function(grid, callback) {
      return {
        icon: 'images/glyphicons_207_remove_2.png',
        onClick: function(d, u) {
          grid.removeConstruct(u);
          return callback();
        }
      };
    },
    editButton: function(grid, callback) {
      return {
        icon: 'images/glyphicons_030_pencil.png',
        onClick: function(d, u) {
          var text;
          text = prompt();
          if (text != null) {
            grid.updateConstruct(u, 'text', text);
            return callback();
          }
        }
      };
    },
    ladderUpButton: function(grid, callback) {
      return {
        icon: 'images/glyphicons_210_left_arrow.png',
        onClick: function(d, u) {
          var text;
          text = prompt();
          if (text != null) {
            grid.ladderUp(u, text);
            return callback();
          }
        }
      };
    },
    ladderDownButton: function(grid, callback) {
      return {
        icon: 'images/glyphicons_211_right_arrow.png',
        onClick: function(d, u) {
          var text;
          text = prompt();
          if (text != null) {
            grid.ladderDown(u, text);
            return callback();
          }
        }
      };
    }
  };

}).call(this);

},{}]},{},[10])