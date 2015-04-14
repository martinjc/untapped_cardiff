#!/usr/bin/env python
#
# Copyright 2014 Martin J Chorley and Matthew J Williams
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

"""
Portions of this code (CategoryTree) class written by Matthew Williams (@voxmjw)
"""

"""
Streamlined category utils. Focused on supporting the handling of the category
hierarchy. The category hierarchy is represented as a tree that is up and down
traversable.
"""

import os
import json


class CategoryTree:
    """
    Attributes of a node:
    
    name:
        category name
    foursq_id:
        foursquare id for the category
        None iff root node
    parent:
        reference to parent node
        None iff root node
    children:
        list of references to children nodes
        empty list if no chilren nodes
    """

    def __init__(self):
        self.root_nodes = []
        self.all_nodes = []
        self.tree = []
        #
        # Traverse and populate data structures
        f = open(os.path.join('cache', 'foursquare_categories.json'), 'r')

        response = json.load(f)
        json_cats = response['categories']

        for json_cat in json_cats:
            root_node = self.__populate(json_cat)
            self.root_nodes.append(root_node)

    @staticmethod
    def __json_node_to_dict(json_node):
        # Take info about category at given JSON node and put it into dict.
        dct = {}

        #
        # Category name...
        if json_node.get('pluralName') is not None:
            if json_node['pluralName'] == 'Homes, Work, Others':
                name = 'Homes - Work - Others'
            else:
                name = json_node['pluralName']
        else:
            name = json_node['name']
        dct['name'] = name

        #
        # Other info
        if 'id' in json_node:
            dct['foursq_id'] = json_node['id']
        else:
            dct['foursq_id'] = None

        return dct

    def get_all_nodes(self):
        """
        Gets all nodes in the tree.
        """
        return self.all_nodes

    def get_root_nodes(self):
        """
        Return list of root category nodes.
        """
        return self.root_nodes

    def get_nodes(self, **kwargs):
        """
        Search for node(s) by foursq_id or name.
        Returns empty list if none found.
        """
        if len(kwargs) != 1:
            raise TypeError()

        if 'foursq_id' in kwargs:
            id = kwargs['foursq_id']
            return filter(lambda d: d['foursq_id'] == id, self.all_nodes)

        if 'name' in kwargs:
            name = kwargs['name']
            return filter(lambda d: d['name'] == name, self.all_nodes)

        raise TypeError()

    def __populate(self, json_node):
        this_dict_node = CategoryTree.__json_node_to_dict(json_node)
        this_dict_node['parent'] = None
        this_dict_node['children'] = []

        if 'categories' in json_node:
            json_children = json_node['categories']
            if len(json_children) > 0:
                for json_child in json_children:
                    child_dict = self.__populate(json_child)
                    child_dict['parent'] = this_dict_node
                    this_dict_node['children'].append(child_dict)

        self.all_nodes.append(this_dict_node)
        return this_dict_node

    def get_root_node_for_id(self, foursq_id):
        """
        Gets the root node for the node with the particular id.
        If no node found with this id, None is returned.
        """
        nodes = self.get_nodes(foursq_id=foursq_id)
        assert len(nodes) <= 1

        #print foursq_id  #~
        #print nodes      #~

        if len(nodes) == 0:
            return None

        node = nodes[0]
        while True:
            if node['parent'] is None:
                break
            node = node['parent']

        return node

