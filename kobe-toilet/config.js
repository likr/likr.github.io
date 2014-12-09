// SPARQLエンドポイントを指定
var endpoint = "http://lodcu.cs.chubu.ac.jp/SparqlEPCU/api/kobetoilet";
// SPARQLクエリを指定
var query = (function () {/*
SELECT DISTINCT *
FROM <http://lod.sfc.keio.ac.jp/challenge2013/show_status.php?id=d030>
WHERE{
  ?uri
  <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?latitude ;
  <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?longitude .
}
LIMIT 1000
*/}).toString().match(/\n([\s\S]*)\n/)[1];
// 中心位置を指定
var initial_latitude = 34.667924;
var initial_longitude = 135.163622;
// ズーム率を指定
var initial_zoom = 12;

var icon_name = "icon.svg";
