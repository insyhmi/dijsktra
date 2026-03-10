class Pair{
	constructor(weight, target, uid){
		this.weight = weight;
		this.target = target;
		this.uid = uid;
	}
}

class PriorityQueue{
	constructor(){
		this.heap = [];
	}
	push(weight, target, uid){
		let p = new Pair(weight, target, uid);
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
const table = document.getElementById("result-table");
const default_node_color = "#06aa58";
const reset_graph_button = document.getElementById("reset");
const fit_view = document.getElementById("fit-view");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function delay(ms) {sleep(ms);}

var graph_undirected = new Map();
var graph_directed = new Map();
var previous_node = {};
var previous_edge = {};
var shortest = {};
var edited = true;

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
				'label': 'data(label)',
				'background-color': default_node_color,
				'color' : 'white',
				'text-wrap' : 'wrap'
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

async function dijkstra()
{
	if (starting_vertex_input.value == ""){
		alert("Please put a valid starting vertex");
		return;
	}
	var adjacency_list;
	var starting_vertex = starting_vertex_input.value;	
	var e, node, distance, cyNode, neighbours;
	let pq = new PriorityQueue();
	let html_snippet = `
		<tr>
			<th>Node</th>
			<th>Distance</th>
		</tr>`;
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
		previous_node[node] = null;
	});
	previous_node = {};
	previous_edge = {};
	cy.nodes().forEach(function(n) {
		n.data('label', `${n.id()}\ninf`);
	})
	cy.$id(starting_vertex).data('label', `${starting_vertex}\n0`);
	shortest[starting_vertex] = 0;
	pq.push(0, starting_vertex);
	while (!pq.isEmpty()){
		e = pq.pop();
		node = e.target;
		distance = e.weight;
		if (shortest[node] < distance) continue;
		cyNode = cy.$id(node);
		cyNode.style('background-color', "red");
		await sleep(1000);
		neighbours = adjacency_list.get(node);
		for (let it of neighbours){
			let tn = cy.$id(it.target);
			tn.style("background-color", "yellow");
			await sleep(1000);
			if (shortest[node] + it.weight < shortest[it.target]){
				shortest[it.target] = shortest[node] + it.weight;
				previous_node[it.target] = node;
				previous_edge[it.target] = it.uid;
				cy.$id(it.target).data('label', `${it.target}\n${shortest[it.target]}`);
				pq.push(shortest[it.target], it.target);
				tn.style('background-color', '#1dd1a1'); 
                await sleep(1000);
			}
			tn.style("background-color", default_node_color);
		}
		cyNode.style("background-color", default_node_color);
	}
	edited = false;
	Object.entries(shortest).forEach(([node, d]) => {
		if (d == Number.MAX_VALUE) d = -1;
		html_snippet += `
		<tr data-rid=${node}>
			<td> ${node} </td>
			<td> ${d} </td>
		</tr>`
	});
	table.innerHTML = html_snippet;
}

function random_id()
{
	return parseInt(Math.random() * 100000000000);
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
	var target_id = vid.getAttribute("data-vid");
	var vertex = cy.$id(target_id);
	var newarr, feid, beid;
	cy.remove(vertex);
	console.log(target_id);
	graph_undirected.delete(target_id);
	graph_directed.delete(target_id);
	graph_undirected.forEach(function(arr, source) {
		feid = document.querySelector(`[data-eid="${source}-${target_id}"]`);
		beid = document.querySelector(`[data-eid="${target_id}-${source}"]`);
		console.log(feid);
		console.log(beid);
		remove_edge(feid);
		remove_edge(beid);
		newarr = arr.filter(p => p.target !== target_id);
		graph_undirected.set(source, newarr);
	});
	graph_directed.forEach(function(arr, source) {
		newarr = arr.filter(p => p.target !== target_id);
		graph_directed.set(source, newarr);
	});
	vid.remove();
	edited = true;
}

function remove_edge(eid)
{
	if (!eid) return;
    var id = eid.getAttribute("data-eid");
    var edge = cy.$id(id);
    if (!edge.empty()) {
        let source = edge.source().id();
        let target = edge.target().id();
        const filterFn = (pair) => pair.uid !== id;
        if (graph_directed.has(source)) {
            graph_directed.set(source, graph_directed.get(source).filter(filterFn));
        }
        if (graph_undirected.has(source)) {
            graph_undirected.set(source, graph_undirected.get(source).filter(filterFn));
        }
        if (graph_undirected.has(target)) {
            graph_undirected.set(target, graph_undirected.get(target).filter(filterFn));
        }
    }
    cy.remove(edge);
    eid.remove();
    edited = true;
}

function show_path(node)
{
	if (edited){
		console.log("Re run the simulation to update the results");
		return;
	}
	cy.nodes().style("background-color", default_node_color);
	cy.edges().style("line-color", "white");
	let n = node.getAttribute("data-rid");
	while (n != null){
		cy.nodes(`[id="${n}"]`).style("background-color", "#00ff0d");
		cy.edges(`[id="${previous_edge[n]}"]`).style("line-color", "#03a2ca");
		n = previous_node[n];
	}
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
			data: {
				id: new_vid,
				label: new_vid
			},
			position: {x: cy_width/2, y: cy_height/2}
		});
		graph_undirected.set(new_vid, new Array());
		graph_directed.set(new_vid, new Array());
		add_vertex_error.innerHTML = "";
		vertices_menu.insertAdjacentHTML('beforeend', htmlSnippet);
		close_add_vertex_window();
		edited = true;
	} else{
		add_vertex_error.innerHTML ="Vertex already exists";
	}
});

add_edge_button.addEventListener("click", function() {
	var source = input_edge_source.value.trim();
	var target = input_edge_target.value.trim();
	var weight = input_edge_weight.value.trim();
	var random = random_id();
	var eid = `${source}-${target}-${random}`;
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
	let directed_pair = new Pair(Number(weight), target, eid);
	let invert_pair = new Pair(Number(weight), source, eid);
	// Directed 
	graph_directed.get(source).push(directed_pair);
	// Undirected
	graph_undirected.get(source).push(directed_pair);
	graph_undirected.get(target).push(invert_pair);
	edges_menu.insertAdjacentHTML('beforeend', htmlSnippet);
	edited = true;
	close_add_edge_window();
});

reset_graph_button.addEventListener('click', function (e) {
	cy.elements.remove();
	vertices_menu.innerHTML = `
		<div>
			Starting Vertex: <input id='starting-vertex'>
		</div>
		<div>
			<button onclick="open_add_vertex_window()">Add Vertex</button>
		</div>`;
	edges_menu.innerHTML = `
		<div>
			<button onclick="open_add_edge_window()">Add Edge</button>
		</div>`;
	graph_directed.clear();
	graph_undirected.clear();
});

fit_view.addEventListener('click', function(e) {
	cy.fit();
});

table.addEventListener('click', function(event) {
	const clicked_row = event.target.closest('[data-rid]');
	console.log(clicked_row);
	show_path(clicked_row);
});

run.addEventListener("click", function() {
	dijkstra();
})