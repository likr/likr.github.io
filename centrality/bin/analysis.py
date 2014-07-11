from __future__ import print_function
from os import path
import json
import networkx as nx
from networkx.algorithms import centrality


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
    closeness = centrality.closeness_centrality(G)
    betweenness = centrality.betweenness_centrality(G)
    #edge_betweenness = centrality.edge_betweenness_centrality(G)
    #current_flow_closeness = centrality.current_flow_closeness_centrality(G)
    #current_flow_betweenness =\
    #    centrality.current_flow_betweenness_centrality(G)
    try:
        eigenvector = centrality.eigenvector_centrality(G, max_iter=1000)
    except:
        eigenvector = {i: 0 for i in range(len(nodes))}
    katz = centrality.katz_centrality(G)

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
            #'edge_betweenness': edge_betweenness[i],
            #'current_flow_closeness': current_flow_closeness[i],
            #'current_flow_betweenness': current_flow_betweenness[i],
            'eigenvector': eigenvector[i],
            'katz': katz[i],
        })
    json.dump(obj,
              open('{0}/../data/{1}.json'.format(pathbase, name), 'w'),
              sort_keys=True)


def main():
    parse('pen')
    parse('research')
    parse('trip')
    parse('trip2')
    parse('university')
    parse('visualization')
    parse('society')
    parse('house')
    parse('woffice')

if __name__ == '__main__':
    main()
