point1 = [1,2]
point2 = [3,1]
point3 = [2,6]
point4 = [4,5]
point5 = [5,4]
point6 = [7,3]
point7 = [6,8]
point8 = [8,7]

import numpy as np

def distance(pt_1, pt_2):
    pt_1 = np.array((pt_1[0], pt_1[1]))
    pt_2 = np.array((pt_2[0], pt_2[1]))
    return np.linalg.norm(pt_1-pt_2)

def closest_node(node, nodes):
    pt = []
    dist = 9999999
    for n in nodes:
        if distance(node, n) <= dist:
            dist = distance(node, n)
            pt = n
    return pt

a = []
a.append(point1)
a.append(point2)
a.append(point3)
a.append(point4)
a.append(point5)
a.append(point6)
a.append(point7)
a.append(point8)
print('Given point in the sequence:')
print(a)
point_seq = []
some_pt = (0, 0)
for i in range(8):
    minPt=closest_node(some_pt,a)
    # print(minPt)
    point_seq.append(minPt)
    a.remove(minPt)
    # print(a)
print('Best sequence closest to the origin is:')
print(point_seq)
