function hasdata(d) {
	// Function factory for d3 selection.select( hasdata(myDataObj) ) to find the element that's associated with the data d
	return function(_d, i) {
		return d === _d ? this : null;
	}
}
function setRef(activeVar, functorVal) {
	// Function factory that's useful to pass as a d3 callback (to .on, etc)
	// Returned function takes d, i and sets activeVar to an object {d: d, i: i}
	// Optionally, specify a functorVal, and the returned callback will just set the activeVar to that value
	if (arguments.length == 2) {
		return function() { activeVar.set(functorVal) };
	} else {
		return function(d, i) {
			activeVar.set({
				// selection: d3.select(this),
				d: d,
				i: i
			});
		}
	}
}

function sandBagGraph() {
	var height = d3.scale.linear()
		.range([0, 100])

	var onHover, offHover, onClick;
		onHover = offHover = onClick = function(d, i){};
	var fairnessArrAccessor = function(d, i) {
		return d.fairness;
	};

	var padding = 0.2;
	
	var sb = sandBag();

	function my(selection) {
		selection.each(function(data) {
			var maxRows = d3.max(data, function(d) {
				return fairnessArrAccessor(d).length
			});
			height.domain([0, maxRows]);

			var totalBarWidth = 100.0 / data.length,
				barMargin = totalBarWidth * (padding / 2.0)
				barWidth = totalBarWidth - (2*barMargin);

			var graphs = d3.select(this)
				.classed("sandbag-graph", true)
					.selectAll(".bar")
					.data( data );

			graphs.exit().remove();

			var newGraphs = graphs.enter()
				.append("div")
				.classed('bar', true)
				.style('height', "100%")
				.on('mouseenter', onHover)
				.on('mouseleave', offHover)
				.on('click', onClick)
				;
			newGraphs
				.append("div")
				.classed("sandbag", true)
				;
			newGraphs
				.append("div")
				.classed("bar-label", true)
				;

			var bls = graphs.selectAll(".bar-label")
				.text(function(d) {
					return d.name;
				});
			
			graphs
				.style("width", barWidth+"%")
				.style("margin", "0 "+barMargin+"%")
				.style('height', function(d) { return height(fairnessArrAccessor(d).length) + "%" });

			graphs.selectAll(".sandbag").data(function(d) { 
				return [fairnessArrAccessor(d)]; 
			})
				.call(sb);
		});
	};

	my.hover = function(onhover, offhover) {
		offhover = offhover || function(){};
		// if (!arguments.length) return onHover;
		onHover = onhover;
		offHover = offhover;
		return my;
	}
	my.click = function(fun) {
		if (!arguments.length) return onClick;
		onClick = fun;
		return my;
	}
	my.fairnessAccessor = function(fun) {
		if (!arguments.length) return sb.accessor();
		sb.accessor(fun);
		return my;
	}
	my.fairnessArrAccessor = function(fun) {
		if (!arguments.length) return fairnessArrAccessor;
		fairnessArrAccessor = fun;
		return my;
	}

	my.highlighter = function(d, i) {
		return function(selection) {
			selection.selectAll(".bar-highlighted").classed("bar-highlighted", false);
			if (d != null) {
				var bars = selection.selectAll(".bar");
				if (!i) {
					if (typeof d === "string")
						var bar = bars.select(function(this_d) {
							return d == this_d.name ? this : null;
						});
					else
						var bar = bars.select(hasdata(d));
				} else {
					var bar = d3.select(bars[0][i]);
				}
				bar.classed("bar-highlighted", true);
			}
		}
	}

	// my.sameHeight = function(val) {
	// 	if (val) height.range([100, 100])
	// 	else height.range([0, 100])
	// }

	return my;
}

function sandBag() {
	// A stacked-bar-chart-ish representation of the distribution of soft, fair, and hard
	// Bound data should be floats from [-1, 1]: negative is soft, positive is hard, 0 is fair.

	var softColor = 'blue',
		hardColor = 'red';

	function fairness(d, i) { return d; };

	var color = d3.scale.linear()
		.domain([-1, 0, 1])
		.range([softColor, 'rgb(245, 245, 245)', hardColor])
		;

	function my(selection) {
		selection.each(function(data) {
			data.sort(function(a, b) {
				a = fairness(a);
				b = fairness(b);
				return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
			});	// rows added from top down, so start with most sandbagged
			bars = d3.select(this).selectAll("div").data(data);

			bars.exit().remove()

			bars.enter()
				.append("div")
				.style("width", "100%")
				;

			bars
				.style("height", (100 / data.length) +"%")
				.style("background-color", function(d, i) {
					return color( fairness(d, i) )
				})
				;

		});
	};

	my.accessor = function(fun) {
		if (!arguments.length) return fairness;
		fairness = fun;
		return my;
	}
	my.softColor = function(val) {
		if (!arguments.length) return softColor;
		softColor = val;
		color.range([softColor, 'white', hardColor]);
		return my;
	}
	my.hardColor = function(val) {
		if (!arguments.length) return hardColor;
		hardColor = val;
		color.range([softColor, 'white', hardColor]);
		return my;
	}
	return my;
}