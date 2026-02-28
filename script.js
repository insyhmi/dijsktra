var vertex_modal = document.getElementById("ModalVertex");
var edge_modal = document.getElementById("ModalEdge");

var cy = cytoscape(
{
	container: document.getElementById("cy"),

	boxSelectionEnabled: false,
	autounselectify: true,
	elements: [	
		// nodes
		{data: {id: '1'}},
		{data: {id: '2'}},
		{data: {id: 'A comedically long name for css testing ig'}},
		{
			data: {
				id:'1A comedically long name for css testing ig',
				source: '1',
				target: 'A comedically long name for css testing ig'
			}
		}
		// edges
		
	],

	style: [
		{
			selector: 'node',
			style: {
				'label': 'data(id)',
				'background-color': '#078ee8',
			}
		},
		{
			selector: 'edge',
			style: {
				'line-color' : '#1c1c1c',
				'width': 2,
			}
		}
  	]	
	
});

function open_add_vertex_window()
{
	vertex_modal.style.display = "block";
}

function close_add_vertex_window()
{
	vertex_modal.style.display = "none";
}

function open_add_edge_window()
{
	edge_modal.style.display = "block";
}

function close_add_edge_window()
{
	edge_modal.style.display = "none";
}

function remove_vertex(vid)
{
	console.log(vid);
}
