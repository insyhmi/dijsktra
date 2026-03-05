class Pair{
	constructor(weight, target){
		this.weight = weight;
		this.target = target;
	}
}

class PriorityQueue{
	constructor(){
		this.heap = [];
	}
	push(weight, target){
		let p = new Pair(weight, target);
		let inserted = false;
		for (let i = 0; i < this.heap.length; i++){
			if (this.heap[i].weight > weight){
				this.heap.splice(i, 0 , p);
				inserted = true;
				break;
			}
		} 
		if (!inserted){
			this.heap.push(p);
		}
	}
	pop(){
		if (this.isEmpty()){
			return false;
		}
		return this.heap.shift();
	}
	isEmpty(){
		return this.heap.length == 0;
	}
}

const is_directed = document.getElementById("directed-checkbox");
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
const run = document.getElementById("run");
const starting_vertex_input = document.getElementById("starting-vertex");

var graph_undirected = new Map();
var graph_directed = new Map();
var shortest = {};

var cy = cytoscape(
{
	container: document.getElementById("cy"),

	boxSelectionEnabled: false,
	autounselectify: true,
	elements: [], // node and edges
	style: [
		{
			selector: 'node',
			style: {
				'label': 'data(id)',
				'background-color': '#078ee8',
				'color' : 'white'
			}
		},
		{
			selector: 'edge',
			style: {
				'line-color' : 'white',
				'width': 2,
				'label': 'data(weight)',
				'curve-style' : 'bezier',
				'color': 'white',
				'font-size' : '20px',
				'text-background-color': 'black',
				'text-background-opacity' : '0.85',
				'target-arrow-shape' : 'none',
			}
		}
  	]	
});

function dijkstra()
{
	if (starting_vertex_input.value == ""){
		alert("Please put a valid starting vertex");
		return;
	}
	var adjacency_list;
	var starting_vertex = starting_vertex_input.value;	
	var e, node, distance;
	let pq = new PriorityQueue();
	if (is_directed.checked){
		adjacency_list = graph_directed;
	} else{
		adjacency_list = graph_undirected;
	}
	console.log(adjacency_list);
	if (!adjacency_list.has(starting_vertex)){
		alert("Vertex not found");
		return;
	}
	adjacency_list.forEach(function(val, node){
		shortest[node] = Number.MAX_VALUE;
	});
	shortest[starting_vertex] = 0;
	pq.push(0, starting_vertex);
	while (!pq.isEmpty()){
		e = pq.pop();
		node = e.target;
		distance = e.weight;
		if (shortest[node] < distance) continue;
		adjacency_list.get(node).forEach(it => {
			if (shortest[node] + it.weight < shortest[it.target]){
				shortest[it.target] = shortest[node] + it.weight;
				pq.push(shortest[it.target], it.target);
			}
		});
	console.log(shortest);
	}
}

function open_add_vertex_window()
{
	vertex_modal.style.display = "block";
}

function close_add_vertex_window()
{
	vertex_modal.style.display = "none";
	add_vertex_error.innerHTML = "";
}

function open_add_edge_window()
{
	edge_modal.style.display = "block";
}

function close_add_edge_window()
{
	edge_modal.style.display = "none";
	add_edge_error.innerHTML = "";
}

function remove_vertex(vid)
{
	var id = vid.getAttribute("data-vid");
	var vertex = cy.$id(id);
	var newarr, feid, bied;
	cy.remove(vertex);
	console.log(id);
	graph_undirected.delete(id);
	graph_directed.delete(id);
	graph_undirected.forEach(function(arr, source) {
		feid = document.querySelector(`[data-eid="${source}-${id}"]`);
		beid = document.querySelector(`[data-eid="${id}-${source}"]`);
		remove_edge(feid);
		remove_edge(beid);
		newarr = arr.filter(p => p.target !== id);
		graph_undirected.set(source, newarr);
	});
	graph_directed.forEach(function(arr, source) {
		newarr = arr.filter(p => p.target !== id);
		graph_directed.set(source, newarr);
	});
	vid.remove();
}

function remove_edge(eid)
{
	if (!eid) return;
	var id = eid.getAttribute("data-eid");
	var edge = cy.$id(id);
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
        remove_edge(eid);
	}
});

is_directed.addEventListener('change', function() {
	var json = cy.style().json();
	if (is_directed.checked){
		json[1]['style']['target-arrow-shape'] = 'triangle';
	} else{
		json[1]['style']['target-arrow-shape'] = 'none'
	}
	cy.style().clear().fromJson(json).update();
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
		graph_undirected.set(new_vid, Array());
		graph_directed.set(new_vid, Array());
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
	var eid = `${source}-${target}`;
	var htmlSnippet = `
		<div data-eid='${eid}'>
			<button class="delete-ebtn">
				<i class="fa-solid fa-square-xmark"></i>
			</button>
			<div class="vertex-description">
			ID: ${eid}<br>
			Source: ${source}<br>
			Target: ${target}<br>
			Weight: ${weight}
			</div>
		</div>
	`
	if (!source || !target || !weight) {
		return;
	}
	if (cy.$id(source).empty() || cy.$id(target).empty()) {
		add_edge_error.innerHTML = "Some nodes does not exists";
		return;
	}
	cy.add({
		group: 'edges',
		data: {
			id: `${eid}`,
			source: source,
			target: target,
			weight: weight
		}
	});
	let directed_pair = new Pair(Number(weight), target);
	let invert_pair = new Pair(Number(weight), source);
	// Directed 
	graph_directed.get(source).push(directed_pair);
	// Undirected
	graph_undirected.get(source).push(directed_pair);
	graph_undirected.get(target).push(invert_pair);
	edges_menu.insertAdjacentHTML('beforeend', htmlSnippet);
	close_add_edge_window();
});

run.addEventListener("click", function() {
	dijkstra();
})