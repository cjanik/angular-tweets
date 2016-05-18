import d3 from 'd3';

export default (d3) => {
  return {
    restrict: 'EA',
    scope: {
        collection: '='
    },
    link: function(scope, element, attrs) {
        //Width and height
        var w = 500;
        var h = 300;

        var xScale = d3.scale.ordinal()
            .rangeRoundBands([0, w], 0.05);

        var yScale = d3.scale.linear()
            .range([0, h]);

        //Define key function, to be used when binding data
        var key = function(d) {
            return d._id;
        };

        function responsivefy(svg) {
            // get container + svg aspect ratio
            var container = d3.select(svg.node().parentNode),
                width = parseInt(svg.style("width")),
                height = parseInt(svg.style("height")),
                aspect = width / height;

            // add viewBox and preserveAspectRatio properties,
            // and call resize so that svg resizes on inital page load
            svg.attr("viewBox", "0 0 " + width + " " + height)
                .attr("perserveAspectRatio", "xMinYMid")
                .call(resize);

            // to register multiple listeners for same event type,
            // you need to add namespace, i.e., 'click.foo'
            // necessary if you call invoke this function for multiple svgs
            // api docs: https://github.com/mbostock/d3/wiki/Selections#on
            d3.select(window).on("resize." + container.attr("id"), resize);

            // get width of container and resize svg to fit it
            function resize() {
                var targetWidth = parseInt(container.style("width"));

                targetWidth = targetWidth > 500 ? 500 : targetWidth;
                svg.attr("width", targetWidth);
                svg.attr("height", Math.round(targetWidth / aspect));
            }
        }

        //Create SVG element
        var svg = d3.select("#barChart")
            .attr("width", w)
            .attr("height", (h + 80))
            .call(responsivefy);
        console.log(svg);

        scope.$watchCollection('collection', (Retweets) => {
            //var modifier = {fields:{value:1}};
            //var sortModifier = Session.get('barChartSortModifier');
            //if(sortModifier && sortModifier.sort)
            //  modifier.sort = sortModifier.sort;

            //var dataset = _.pluck(Retweets.find({}, {retweetCount: 1}).fetch(), 'retweetCount');
            var dataset = Retweets.find({}, {retweetCount: 1}).fetch();

            //Update scale domains
            xScale.domain(d3.range(dataset.length));
            yScale.domain([0, d3.max(dataset, function(d) { return d.retweetCount; })]);

            //Select…
            var bars = svg.selectAll("rect")
                .data(dataset, key);

            //Enter…
            bars.enter()
                .append("rect")
                .attr("x", w)
                .attr("y", function(d) {
                    return h + 70 - yScale(d.retweetCount);
                })
                .attr("width", xScale.rangeBand())
                .attr("height", function(d) {
                    return yScale(d.retweetCount);
                })
                .attr("fill", function(d) {
                    return "rgb(0, 0, " + (d.retweetCount * 10) + ")";
                })
                .attr("data-id", function(d){
                    return d._id;
                })
                .on("click", function(d){
                    document.getElementById('tweet-view').innerHTML = "";
                    twttr.widgets.createTweet(d._id, document.getElementById('tweet-view'));
                    //d3.select('#tweet-view').html(d.text);
                });

            //Update…
            bars.transition()
                // .delay(function(d, i) {
                //  return i / dataset.length * 1000;
                // }) // this delay will make transistions sequential instead of paralle
                .duration(500)
                .attr("x", function(d, i) {
                    return xScale(i);
                })
                .attr("y", function(d) {
                    return h + 70 - yScale(d.retweetCount);
                })
                .attr("width", xScale.rangeBand())
                .attr("height", function(d) {
                    return yScale(d.retweetCount);
                }).attr("fill", function(d) {
                    return "rgb(0, 0, " + (d.retweetCount * 10) + ")";
                });

            //Exit…
            bars.exit()
                .transition()
                .duration(500)
                .attr("x", -xScale.rangeBand())
                .remove();



            //Update all labels

            //Select…
            var labels = svg.selectAll("text")
                .data(dataset, key);

            //Enter…
            labels.enter()
                .append("text")
                .text(function(d) {
                    return d.retweetCount;
                })
                .attr("text-anchor", "end")
                .style("writing-mode", "tb")
                .attr("x", w)
                .attr("y", function(d) {
                    return h - yScale(d.retweetCount) - 100;
                })
               .attr("font-family", "sans-serif")
               .attr("font-size", "18px")
               .attr("fill", "#0F0F0F")
               .on("click", function(d){
                    document.getElementById('tweet-view').innerHTML = "";
                    twttr.widgets.createTweet(d._id, document.getElementById('tweet-view'));
                });

            //Update…
            labels.transition()
                // .delay(function(d, i) {
                //  return i / dataset.length * 1000;
                // }) // this delay will make transistions sequential instead of paralle
                .duration(500)
                .attr("x", function(d, i) {
                    return xScale(i) + xScale.rangeBand() / 2;
                }).attr("y", function(d) {
                    return h - yScale(d.retweetCount) + 75;
                }).text(function(d) {
                    return d.retweetCount;
                });

            //Exit…
            labels.exit()
                .transition()
                .duration(500)
                .attr("x", -xScale.rangeBand())
                .remove();

        });
    }
  }
};