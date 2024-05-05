import { TopoEdge, TopoNode, Topology } from "../service/topology.domain";

const TOPO_MOCK_NODE: TopoNode[] = [
  //0
  {
    label: "Node 1",
    id: '0',
    group: 1
  },
  //1
  {
    label: "Node 2",
    id: '1',
    group: 1
  },
  //2
  {
    label: "Node 3",
    id: '2',
    group: 1,
    descriptions: [
      "description 1",
      "description 2",
      "description 3",
      "description 4",
      "description 5"
    ]
  },
  //3
  {
    label: "Node 4",
    id: '3',
    group: 1
  },
  //4
  {
    label: "Node 5",
    id: '5',
    group: 2,
    descriptions: [
      "description 1",
      "description 2",
      "description 3",
      "description 4",
      "description 5"
    ]
  },
  //5
  {
    label: "Node 6",
    id: '6',
    group: 2
  },
  //6
  {
    label: "Node 7",
    id: '7',
    group: 2
  },
  //7
  {
    label: "Node 8",
    id: '8',
    group: 3
  },
  //8
  {
    label: "Node 9",
    id: '9',
    group: 3,
    descriptions: [
      "description 1",
      "description 2",
      "description 3",
      "description 4"
    ]
  },
  
  //9
  {
    label: "Node 10",
    id: '10',
    group: 4,
    descriptions: [
      "description 1",
      "description 2",
      "description 3",
      "description 4",
      "description 5"
    ]
  },
  //10
  {
    label: "Node 11",
    id: '11',
    group: 4
  },
  //11
  {
    label: "Node 12",
    id: '12',
    group: 4
  },
  //12
  {
    label: "Node 13",
    id: '13',
    group: 4
  },
  //13
  {
    label: "Node 14",
    id: '14',
    group: 5,
    descriptions: [
      "description 1",
      "description 2",
      "description 3",
      "description 4",
      "description 5"
    ]
  },
  //14
  {
    label: "Node 15",
    id: '15',
    group: 5
  },
  //15
  {
    label: "Node 16",
    id: '16',
    group: 6
  },
  //16
  {
    label: "Node 17",
    id: '17',
    group: 6
  },
  //17
  {
    label: "Node 18",
    id: '18',
    group: 6
  },
  //18
  {
    label: "Node 19",
    id: '19',
    group: 7
  },
  //19
  {
    label: "Node 20",
    id: '20',
    group: 7
  },
  //20
  {
    label: "Node 21",
    id: '21',
    group: 8
  },
  //21
  {
    label: "Node 22",
    id: '22',
    group: 9
  },
  //22
  {
    label: "Node 23",
    id: '23',
    group: 9
  },
  //23
  {
    label: "Node 24",
    id: '24',
    group: 9
  },
  //24
  {
    label: "Node 25",
    id: '25',
    group: 9
  },
]

export const TOPO_MOCK_EDGE: TopoEdge[] = [
  //1st path
  {
    source: TOPO_MOCK_NODE[0],
    target: TOPO_MOCK_NODE[1],
  },{
    source: TOPO_MOCK_NODE[0],
    target: TOPO_MOCK_NODE[2],
  },{
    source: TOPO_MOCK_NODE[0],
    target: TOPO_MOCK_NODE[3],
  },{
    source: TOPO_MOCK_NODE[0],
    target: TOPO_MOCK_NODE[4],
  },{
    source: TOPO_MOCK_NODE[1],
    target: TOPO_MOCK_NODE[5],
  },{
    source: TOPO_MOCK_NODE[1],
    target: TOPO_MOCK_NODE[6],
  },{
    source: TOPO_MOCK_NODE[2],
    target: TOPO_MOCK_NODE[7],
  },{
    source: TOPO_MOCK_NODE[2],
    target: TOPO_MOCK_NODE[8],
  },{
    source: TOPO_MOCK_NODE[3],
    target: TOPO_MOCK_NODE[9],
  },{
    source: TOPO_MOCK_NODE[3],
    target: TOPO_MOCK_NODE[10],
  },{
    source: TOPO_MOCK_NODE[4],
    target: TOPO_MOCK_NODE[11],
  },{
    source: TOPO_MOCK_NODE[4],
    target: TOPO_MOCK_NODE[12],
  },{
    source: TOPO_MOCK_NODE[4],
    target: TOPO_MOCK_NODE[13],
  },{
    source: TOPO_MOCK_NODE[5],
    target: TOPO_MOCK_NODE[14],
  },{
    source: TOPO_MOCK_NODE[5],
    target: TOPO_MOCK_NODE[15],
  },{
    source: TOPO_MOCK_NODE[14],
    target: TOPO_MOCK_NODE[16],
  },{
    source: TOPO_MOCK_NODE[14],
    target: TOPO_MOCK_NODE[18],
  },{
    source: TOPO_MOCK_NODE[14],
    target: TOPO_MOCK_NODE[19],
  },{
    source: TOPO_MOCK_NODE[15],
    target: TOPO_MOCK_NODE[17],
  },
]

export const TOPOLOGY_MOCK: Topology = {
  nodes: TOPO_MOCK_NODE,
  edges: TOPO_MOCK_EDGE
}