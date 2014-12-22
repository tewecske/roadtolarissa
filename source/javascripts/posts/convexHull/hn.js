function drawHN(){
  var numPoints = 50,
      points = _.sortBy(uniformRandom(numPoints), f('x'))

  var svg = d3.select('#hn').html('')
    .append('svg')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var lineG = svg.append('g')

  var circles = svg.append('g').selectAll('circle')
      .data(points).enter()
    .append('circle').classed('point', true)
      .attr('r', 5)
      .attr('cx', f('x'))
      .attr('cy', f('y'))
      .each(function(d){ d.circle = d3.select(this) })

  var color = d3.scale.linear()
      .domain([0, points.length/2, points.length - 1])
      .range([d3.lab('#FF00C0'), d3.lab('#8B84D8'), d3.lab('#00FF01')])

  var hullPoints = []
  var curPoint,prevPoint, maxAngle, updating;
  function updateCurPoint(cur, prev){
    if (cur.outline) return
    curPoint = cur
    prevPoint = prev
    maxAngle = 0

    hullPoints.push(curPoint)
    curPoint.outline = true

    lineG.append('line').classed('outline', true)
        .datum({prev: prevPoint, cur: curPoint})
        .attr({x1: prevPoint.x, x2: prevPoint.x, y1: prevPoint.y, y2: prevPoint.y})
      .transition().duration(700).delay(3000)
        .attr({x2: curPoint.x, y2: curPoint.y})


    updating = true
    circles.transition().duration(1000).delay(3500)
        .attr('r', 8)

    d3.selectAll('.possible-max')
      .transition().duration(1000).delay(function(d){ return 200 + points.length*50 -d.index*50 })
        .attr('x1', ƒ('x')) 
        .attr('y1', ƒ('y'))
        .remove()

    points.forEach(function(d){
      d.angle = calcAngle(prevPoint, curPoint, d)
      d.active = d != curPoint
      d.circle.classed('hoverable', d.active)
    })    

    points = _.sortBy(points, f('angle')).reverse()
    points.forEach(function(d, i){ d.index = i })

    window.setTimeout(function(){ updating = false }, 3500)
  }
  updateCurPoint(points[0], {x: points[0].x, y: points[0].y + 1})

  svg.append('rect')
      .style('fill-opacity', 0)
      .attr({width: width, height: height})
      .on('mousemove', function(){
        if (updating) return

        var pos = d3.mouse(this)

        var angle = calcAngle(prevPoint, curPoint, {x: pos[0], y: pos[1]})
        var oldMaxAngle = maxAngle

        points.filter(ƒ('active')).forEach(function(d){
          if (Math.abs(angle - d.angle) < 1){
            if (angle > maxAngle) maxAngle = d.angle

            d.active = false
            d.circle.classed('hoverable', false)
            lineG.append('line').datum(d).attr('class', 'possible-max')
                .style('stroke', _.compose(color, f('index')))
                .attr({x1: curPoint.x, y1: curPoint.y, x2: curPoint.x, y2: curPoint.y})
              .transition('drawInit').duration(1000)
                .attr({x2: d.x, y2: d.y})

            d.circle.transition().delay(700).duration(500)
                .attr('r', 3)

          }
        })

        if (!points.filter(f('active')).length){
          updateCurPoint(_.findWhere(points, {angle: maxAngle}), curPoint)
        }
      })




}
drawHN()

//paste in the console to swap out the d3.scale.category20() pallet
var oldColors = oldColors ? oldColors : d3.scale.category20().range()
var newColors = oldColors.map(function(){
  return '#'+Math.floor(Math.random()*16777215).toString(16) })
oldColors.forEach(function(str, i){
  //update inline color style
  d3.selectAll('[style*="' + str + '"]')
      .style('fill', newColors[i])
      .style('background-color', newColors[i])

  //update fill attr 
  d3.selectAll('[fill*="' + str + '"]')
      .attr('fill', newColors[i])
})

//save new pallet - press up arrow and enter to run again
oldColors = newColors