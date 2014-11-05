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
      resolve: {data: (function($http) {
          return $http.get('data/data.json');
        })},
      templateUrl: 'partials/main.html',
      url: '/'
    });
  })).controller('MainController', (($traceurRuntime.createClass)(function($window, data) {
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
    var centrality = egrid.core.network.centrality.katz(graph);
    egrid.core.network.community.newman(graph).forEach((function(community, i) {
      community.forEach((function(u) {
        graph.get(u).community = i;
      }));
    }));
    var scale = d3.scale.linear().domain(d3.extent(graph.vertices(), (function(u) {
      return centrality[u];
    }))).range([3, 15]);
    var communityColor = d3.scale.category20();
    var egm = egrid.core.egm().maxTextLength(10).vertexScale((function(d, u) {
      return scale(centrality[u]);
    })).vertexColor((function(d) {
      return communityColor(d.community);
    })).contentsMargin(10).contentsScaleMax(2).dagreRankSep(100).edgeColor((function(u, v) {
      var du = graph.get(u);
      var dv = graph.get(v);
      if (du.community === dv.community) {
        return communityColor(du.community);
      } else {
        return '#ccc';
      }
    })).edgeInterpolate('cardinal').edgeTension(0.95).edgeWidth((function() {
      return 9;
    })).size([width, height]);
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