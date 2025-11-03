// graphs.js

document.addEventListener("DOMContentLoaded", () => {
    const selector = document.getElementById("graph-selector");
    const graphs = {
        walk: document.querySelector(".walk-graph"),
        weight: document.querySelector(".weight-graph"),
        outside: document.querySelector(".outdoors-graph"),
    };

    function showGraph(selected) {
        // hide all graphs
        Object.values(graphs).forEach(g => g.classList.remove("active-graph"));

        // only show if a valid graph is selected
        if (graphs[selected]) {
            graphs[selected].classList.add("active-graph");
        }
    }

    // start with no graph shown
    showGraph("none");

    // update on change
    selector.addEventListener("change", (e) => showGraph(e.target.value));
});
