(function() {
  var calculateTextSize, createVertex, css, draw, edgeLine, edgePointsSize, initContainer, layout, makeGrid, onClickVertex, resize, transition, update, updateEdges, updateVertices;

  if (!this.egrid) {
    this.egrid = {};
  }

  if (!this.egrid.core) {
    this.egrid.core = {};
  }

  edgeLine = d3.svg.line().interpolate('linear');

  edgePointsSize = 20;

  onClickVertex = function(arg) {
    var container, graph;
    container = arg.container, graph = arg.graph;
    return function(u) {
      var alreadySelected, ancestors, descendants, dijkstra, dist, v, _ref, _ref1;
      alreadySelected = d3.select(this).classed('selected');
      container.selectAll('g.vertex').classed({
        selected: false,
        lower: false,
        upper: false
      });
      container.selectAll('g.edge').classed({
        lower: false,
        upper: false
      });
      if (!alreadySelected) {
        dijkstra = egrid.core.graph.dijkstra().weight(function() {
          return 1;
        });
        descendants = d3.set();
        _ref = dijkstra(graph, u.key);
        for (v in _ref) {
          dist = _ref[v];
          if (dist < Infinity) {
            descendants.add(v);
          }
        }
        dijkstra.inv(true);
        ancestors = d3.set();
        _ref1 = dijkstra(graph, u.key);
        for (v in _ref1) {
          dist = _ref1[v];
          if (dist < Infinity) {
            ancestors.add(v);
          }
        }
        d3.select(this).classed('selected', true);
        container.selectAll('g.edge').classed({
          upper: function(_arg) {
            var source, target;
            source = _arg.source, target = _arg.target;
            return ancestors.has(source.key) && ancestors.has(target.key);
          },
          lower: function(_arg) {
            var source, target;
            source = _arg.source, target = _arg.target;
            return descendants.has(source.key) && descendants.has(target.key);
          }
        });
        ancestors.remove(u);
        descendants.remove(u);
        return container.selectAll('g.vertex').classed({
          upper: function(v) {
            return ancestors.has(v.key);
          },
          lower: function(v) {
            return descendants.has(v.key);
          }
        });
      }
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
        return u.y = 0;
      }).attr({
        'text-anchor': 'middle',
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
      }).attr('y', function(u) {
        return -u.textHeight / 2;
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

  updateEdges = function() {
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
    var edges, maxTextLength, oldVertices, oldVerticesMap, pred, u, v, vertex, vertexText, vertices, verticesMap, w, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o, _ref, _ref1, _ref2, _ref3;
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
      vertex.text = (vertexText(vertex.data)).slice(0, maxTextLength);
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
          t = egrid.core.svg.transform.translate(e.translate[0], e.translate[1]);
          s = egrid.core.svg.transform.scale(e.scale);
          return contents.attr('transform', egrid.core.svg.transform.compose(t, s));
        });
      }
    };
  };

  update = function(arg) {
    var enableZoom, maxTextLength, vertexScale, vertexText, vertexVisibility, zoom;
    vertexScale = arg.vertexScale, vertexText = arg.vertexText, vertexVisibility = arg.vertexVisibility, enableZoom = arg.enableZoom, zoom = arg.zoom, maxTextLength = arg.maxTextLength;
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
            oldVertices: d3.selectAll('g.vertex').data(),
            vertexText: vertexText,
            maxTextLength: maxTextLength
          }), vertices = _ref.vertices, edges = _ref.edges;
          contents.select('g.vertices').selectAll('g.vertex').data(vertices, function(u) {
            return u.key;
          }).call(updateVertices({
            vertexScale: vertexScale
          })).on('click', onClickVertex({
            container: container,
            graph: graph
          }));
          return contents.select('g.edges').selectAll('g.edge').data(edges, function(_arg) {
            var source, target;
            source = _arg.source, target = _arg.target;
            return "" + source.key + ":" + target.key;
          }).call(updateEdges());
        } else {
          return container.select('g.contents').remove();
        }
      });
    };
  };

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
        return egrid.core.svg.transform.compose(egrid.core.svg.transform.translate(u.x, u.y), egrid.core.svg.transform.scale(u.scale));
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

  draw = function(egm, zoom) {
    return function(selection) {
      return selection.call(update({
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
      }));
    };
  };

  css = function(options) {
    var svgCss;
    if (options == null) {
      options = {};
    }
    svgCss = "g.vertex > rect, rect.background {\n  fill: " + (options.backgroundColor || 'whitesmoke') + ";\n}\ng.edge > path {\n  fill: none;\n}\ng.vertex > rect, g.edge > path {\n  stroke: " + (options.strokeColor || 'black') + ";\n}\ng.vertex > text {\n  fill: " + (options.strokeColor || 'black') + ";\n}\ng.vertex.lower > rect, g.edge.lower > path {\n  stroke: " + (options.lowerStrokeColor || 'red') + ";\n}\ng.vertex.upper > rect, g.edge.upper > path {\n  stroke: " + (options.upperStrokeColor || 'blue') + ";\n}\ng.vertex.selected > rect {\n  stroke: " + (options.selectedStrokeColor || 'purple') + ";\n}";
    return function(selection) {
      selection.selectAll('defs.egrid-style').remove();
      selection.append('defs').classed('egrid-style', true).append('style').text(svgCss);
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

  this.egrid.core.egm = function(options) {
    var accessor, attr, egm, optionAttributes, val, zoom;
    if (options == null) {
      options = {};
    }
    zoom = d3.behavior.zoom();
    egm = function(selection) {
      draw(egm, zoom)(selection);
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
    egm.css = css;
    egm.resize = resize;
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

(function() {
  var graph;

  if (!egrid) {
    this.egrid = {};
  }

  if (!egrid.core) {
    this.egrid.core = {};
  }

  if (!egrid.core.graph) {
    this.egrid.core.graph = {};
  }

  graph = this.egrid.core.graph;

  graph.adjacencyList = function(v, e) {
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
          _results.push(u);
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
          _results.push(v);
        }
        return _results;
      };

      AdjacencyList.prototype.invAdjacentVertices = function(u) {
        var _results;
        _results = [];
        for (v in vertices[u].inAdjacencies) {
          _results.push(v);
        }
        return _results;
      };

      AdjacencyList.prototype.outEdges = function(u) {
        var _results;
        _results = [];
        for (v in vertices[u].outAdjacencies) {
          _results.push([u, v]);
        }
        return _results;
      };

      AdjacencyList.prototype.inEdges = function(u) {
        var _i, _len, _ref, _results;
        _ref = vertices[u].inAdjacencies;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          _results.push([v, u]);
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
        }).call(this)).reduce(function(t, s) {
          return t + s;
        });
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

      AdjacencyList.prototype.addVertex = function(prop) {
        vertices[nextVertexId] = {
          outAdjacencies: {},
          inAdjacencies: {},
          property: prop
        };
        return nextVertexId++;
      };

      AdjacencyList.prototype.clearVertex = function(u) {
        vertices[u].outAdjacencies = {};
        outAdjacencies[i] = {};
        for (v in vertices[u].inAdjacencies) {
          delete vertices[v].inAdjacencies[u];
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

(function() {
  var graph;

  if (!egrid) {
    this.egrid = {};
  }

  if (!egrid.core) {
    this.egrid.core = {};
  }

  if (!egrid.core.graph) {
    this.egrid.core.graph = {};
  }

  graph = this.egrid.core.graph;

  graph.dijkstra = function() {
    var dijkstra, inv, weight;
    weight = function(p) {
      return p.weight;
    };
    inv = false;
    dijkstra = function(graph, i) {
      var adjacentVertices, distance, distances, j, queue, u, v, _i, _len, _ref;
      adjacentVertices = inv ? function(u) {
        return graph.invAdjacentVertices(u);
      } : function(u) {
        return graph.adjacentVertices(u);
      };
      distances = {};
      for (j in graph.vertices()) {
        distances[j] = Infinity;
      }
      distances[i] = 0;
      queue = [i];
      while (queue.length > 0) {
        u = queue.pop();
        _ref = adjacentVertices(u);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
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

(function() {
  var graph;

  this.egrid = this.egrid || {};

  this.egrid.core = this.egrid.core || {};

  this.egrid.core.graph = graph = this.egrid.core.graph || {};

  graph.graph = function() {
    var factory, source, target;
    source = function(e) {
      return e.source;
    };
    target = function(e) {
      return e.target;
    };
    factory = function(vertices, edges) {
      return graph.adjacencyList(vertices, edges);
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

(function() {
  var graph;

  if (!egrid) {
    this.egrid = {};
  }

  if (!egrid.core) {
    this.egrid.core = {};
  }

  if (!egrid.core.graph) {
    this.egrid.core.graph = {};
  }

  graph = this.egrid.core.graph;

  graph.warshallFloyd = function() {
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

(function() {
  var centrality;

  this.egrid = this.egrid || {};

  this.egrid.core = this.egrid.core || {};

  this.egrid.core.network = this.egrid.core.network || {};

  this.egrid.core.network.centrality = centrality = this.egrid.core.network.centrality || {};

  centrality.betweenness = function() {
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

(function() {
  var centrality;

  this.egrid = this.egrid || {};

  this.egrid.core = this.egrid.core || {};

  this.egrid.core.network = this.egrid.core.network || {};

  this.egrid.core.network.centrality = centrality = this.egrid.core.network.centrality || {};

  centrality.closeness = function(weight) {
    var warshallFloyd;
    warshallFloyd = egrid.core.graph.warshallFloyd().weight(weight);
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

(function() {
  var centrality;

  this.egrid = this.egrid || {};

  this.egrid.core = this.egrid.core || {};

  this.egrid.core.network = this.egrid.core.network || {};

  this.egrid.core.network.centrality = centrality = this.egrid.core.network.centrality || {};

  centrality.inDegree = function(graph) {
    var result, u, _i, _len, _ref;
    result = {};
    _ref = graph.vertices();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      u = _ref[_i];
      result[u] = graph.inDegree(u);
    }
    return result;
  };

  centrality.outDegree = function(graph) {
    var result, u, _i, _len, _ref;
    result = {};
    _ref = graph.vertices();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      u = _ref[_i];
      result[u] = graph.outDegree(u);
    }
    return result;
  };

  centrality.degree = function(graph) {
    var result, u, _i, _len, _ref;
    result = {};
    _ref = graph.vertices();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      u = _ref[_i];
      result[u] = (graph.outDegree(u)) + (graph.inDegree(u));
    }
    return result;
  };

}).call(this);

(function() {
  var Scale, Translate, transform,
    __slice = [].slice;

  this.egrid = this.egrid || {};

  this.egrid.core = this.egrid.core || {};

  this.egrid.core.svg = this.egrid.core.svg || {};

  this.egrid.core.svg.transform = transform = this.egrid.core.svg.transform || {};

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

  transform.translate = function(tx, ty) {
    return new Translate(tx, ty);
  };

  transform.scale = function(sx, sy) {
    return new Scale(sx, sy);
  };

  transform.compose = function() {
    var transforms;
    transforms = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return transforms.map(function(t) {
      return t.toString();
    }).join('');
  };

}).call(this);
