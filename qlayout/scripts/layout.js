var $__src_95_layout__ = (function() {
  "use strict";
  var __moduleName = "src_layout";
  angular.module('layout', ['ui.router']);
  angular.module('layout').config((function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
  }));
  return {};
})();

var $__src_95_controllers_47_main__ = (function() {
  "use strict";
  var __moduleName = "src_controllers/main";
  angular.module('layout').config((function($stateProvider) {
    $stateProvider.state('main', {
      controller: 'MainController as main',
      resolve: {data: (function($http, $stateParams) {
          var url = $stateParams.data || 'data/q/trip.json';
          return $http.get(url);
        })},
      templateUrl: 'partials/main.html',
      url: '/?data&layout'
    });
  })).controller('MainController', (($traceurRuntime.createClass)(function($window, $stateParams, data) {
    var width = $($window).width();
    var height = $($window).height() - 100;
    var graph = egrid.core.graph.adjacencyList();
    for (var $__2 = data.data.nodes[Symbol.iterator](),
        $__3; !($__3 = $__2.next()).done; ) {
      var node = $__3.value;
      {
        graph.addVertex(node);
      }
    }
    for (var $__4 = data.data.links[Symbol.iterator](),
        $__5; !($__5 = $__4.next()).done; ) {
      var link = $__5.value;
      {
        graph.addEdge(link.source, link.target);
      }
    }
    var egm = egrid.core.egm().backgroundColor('#fff').strokeColor('#fff').maxTextLength(10).vertexScale((function() {
      return 2;
    })).vertexStrokeWidth((function() {
      return 0;
    })).vertexColor((function() {
      return '#00BFFF';
    })).contentsMargin(10).contentsScaleMax(2).dagreRankSep(200).dagreEdgeSep(50).edgeColor((function() {
      return '#6E6E6E';
    })).edgeWidth((function() {
      return 3;
    })).size([width, height]);
    if ($stateParams.layout) {
      if ($stateParams.layout === 'proposed') {
        egm.dagreRanker((function(g) {
          g.nodes().forEach((function(u, i) {
            if (!u.startsWith('_')) {
              g.node(u).rank = 2 * graph.get(i).rank;
            }
          }));
        }));
      } else {
        egm.dagreRanker($stateParams.layout);
      }
    }
    var selection = d3.select('#display').datum(graph).call(egm).call(egm.center()).call(d3.downloadable({
      filename: 'layout',
      width: width,
      height: height
    }));
    $window.onresize = (function() {
      selection.call(egm.resize($($window).width(), $($window).height() - 100));
    });
  }, {}, {})));
  return {};
})();
