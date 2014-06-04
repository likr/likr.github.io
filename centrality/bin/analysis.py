from __future__ import print_function
from os import path
import json
import numpy
import networkx as nx
from networkx.algorithms import centrality
from sklearn.decomposition import PCA


def parse(name):
    print(name)
    pathbase = path.abspath(path.dirname(__file__))
    G = nx.Graph()
    data = json.load(open('{0}/{1}.json'.format(pathbase, name)))
    nodes = data['nodes']
    text = {i: node['text'] for i, node in enumerate(nodes)}
    weight = {i: float(node['weight']) for i, node in enumerate(nodes)}
    for i in range(len(nodes)):
        G.add_node(i)
    for link in data['links']:
        G.add_edge(link['source'], link['target'])

    degree = centrality.degree_centrality(G)
    closeness = centrality.closeness_centrality(G, )
    betweenness = centrality.betweenness_centrality(G, )
    eigenvector = centrality.eigenvector_centrality(G, max_iter=1000)
    katz = centrality.katz_centrality(G)

    def vals(i):
        return [
            #weight[i],
            degree[i],
            closeness[i],
            betweenness[i],
            eigenvector[i],
            katz[i],
        ]

    def vals2(i):
        return [
            degree[i],
            closeness[i],
            betweenness[i],
            eigenvector[i],
        ]
    values = numpy.array([vals(i) for i in range(len(nodes))])
    values2 = numpy.array([vals2(i) for i in range(len(nodes))])
    pca = PCA(n_components=2)
    pca_values = pca.fit(values).transform(values)
    pca1 = {i: x for i, (x, _) in enumerate(pca_values)}
    pca2 = {i: y for i, (_, y) in enumerate(pca_values)}

    #min_weight = min([weight[i] for i in range(len(nodes))])
    min_degree = min([degree[i] for i in range(len(nodes))])
    min_closeness = min([closeness[i] for i in range(len(nodes))])
    min_betweenness = min([betweenness[i] for i in range(len(nodes))])
    min_eigenvector = min([eigenvector[i] for i in range(len(nodes))])
    min_katz = min([katz[i] for i in range(len(nodes))])
    #max_weight = max([weight[i] for i in range(len(nodes))])
    max_degree = max([degree[i] for i in range(len(nodes))])
    max_closeness = max([closeness[i] for i in range(len(nodes))])
    max_betweenness = max([betweenness[i] for i in range(len(nodes))])
    max_eigenvector = max([eigenvector[i] for i in range(len(nodes))])
    max_katz = max([katz[i] for i in range(len(nodes))])
    #weight_range = max_weight - min_weight
    degree_range = max_degree - min_degree
    closeness_range = max_closeness - min_closeness
    betweenness_range = max_betweenness - min_betweenness
    eigenvector_range = max_eigenvector - min_eigenvector
    katz_range = max_katz - min_katz

    def normalized_average(i):
        return ((degree[i] - min_degree) / degree_range
                + (closeness[i] - min_closeness) / closeness_range
                + (betweenness[i] - min_betweenness) / betweenness_range
                + (eigenvector[i] - min_eigenvector) / eigenvector_range
                + (katz[i] - min_katz) / katz_range) / 5

    def normalized_average2(i):
        return ((degree[i] - min_degree) / degree_range
                + (closeness[i] - min_closeness) / closeness_range
                + (betweenness[i] - min_betweenness) / betweenness_range
                + (eigenvector[i] - min_eigenvector) / eigenvector_range) / 4

    average = {i: numpy.average(v) for i, v in enumerate(values)}
    naverage = {i: normalized_average(i) for i, v in enumerate(values)}
    average2 = {i: numpy.average(v) for i, v in enumerate(values2)}
    naverage2 = {i: normalized_average2(i) for i, v in enumerate(values)}

    obj = {
        'nodes': [],
        'links': data['links']
    }
    for i in range(len(nodes)):
        obj['nodes'].append({
            'text': text[i],
            'weight': weight[i],
            'degree': degree[i],
            'closeness': closeness[i],
            'betweenness': betweenness[i],
            'eigenvector': eigenvector[i],
            'katz': katz[i],
            'average': average[i],
            'naverage': naverage[i],
            'average2': average2[i],
            'naverage2': naverage2[i],
            'pca1': pca1[i],
            'pca2': pca2[i],
        })
    json.dump(obj, open('{0}/../data/{1}.json'.format(pathbase, name), 'w'))


def main():
    parse('pen')
    parse('research')
    parse('trip')
    #parse('university')
    parse('visualization')
    parse('society')

if __name__ == '__main__':
    main()
