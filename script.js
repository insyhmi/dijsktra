const vertex_modal = document.getElementById("ModalVertex");
const edge_modal = document.getElementById("ModalEdge");
const add_vertex_button = document.getElementById("add-vertex-button");
const add_edge_button = document.getElementById("add-edge-button");
const vertices_menu = document.getElementById("vertices-menu");
const edges_menu = document.getElementById("edges-menu");
const add_vertex_error = document.getElementById("add-vertex-error");
const add_edge_error = document.getElementById("add-edge-error");
const input_vertex_id = document.getElementById("vertex-id");
const input_edge_source = document.getElementById("edge-source");
const input_edge_target = document.getElementById("edge-target");
const input_edge_weight = document.getElementById("edge-weight");
const delete_btn = document.querySelector('.delete-btn');
const cy_width = document.getElementById("cy").scrollWidth;
const cy_height = document.getElementById("cy").scrollHeight;

var cy = cytoscape(
{
	container: document.getElementById("cy"),

	boxSelectionEnabled: false,
	autounselectify: true,
	elements: [	
		// nodes and edges
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
	var vertex = cy.$id(vid.getAttribute("data-vid"));
	cy.remove(vertex);
	vid.remove();
}

function remove_edge(eid)
{
	var edge = cy.$id(vid.getAttribute("data-eid"));
	cy.remove(edge);
	eid.remove();
}

document.addEventListener('click', function(event)
{
	const vbtn = event.target.closest('.delete-vbtn');
    const ebtn = event.target.closest('.delete-ebtn');

    if (vbtn) {
        const vid = vbtn.closest('[data-vid]');
        remove_vertex(vid);
    }
	if (ebtn){
		const eid = ebtn.closest('[data-eid]');
        remove_vertex(eid);
	}
});

add_vertex_button.addEventListener("click", function() {
	if (input_vertex_id.value.trim() == ""){
		return;
	}
	var new_vid = input_vertex_id.value;
	var htmlSnippet = `
		<div data-vid='${new_vid}'>
			<button class="delete-vbtn">
				<i class="fa-solid fa-square-xmark"></i>
			</button>
			<div class="vertex-description">ID: ${new_vid}</div>
		</div>
	`
	if (cy.$id(new_vid).empty()){
		cy.add({
			group: 'nodes',
			data: {id: new_vid},
			position: {x: cy_width/2, y: cy_height/2}
		});
		add_vertex_error.innerHTML = "";
		vertices_menu.insertAdjacentHTML('beforeend', htmlSnippet);
		close_add_vertex_window();
	} else{
		add_vertex_error.innerHTML ="Vertex already exists";
	}
});

add_edge_button.addEventListener("click", function() {
	var source = input_edge_source.value.trim();
	var target = input_edge_target.value.trim();
	var weight = input_edge_weight.value.trim();
	if (!source || !target || ! weight) {
		return;
	}
	close_add_edge_window();
});