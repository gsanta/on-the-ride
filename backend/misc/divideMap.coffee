
latStart = 70; lonStart = 10
latEnd = 30; lonEnd = 60
div = 2


divideMap = ( vertical, horizontal ) ->
	latDiff = Math.abs latStart - latEnd
	lonDiff = Math.abs lonStart - lonEnd
	latIncr = latDiff / vertical
	lonIncr = lonDiff / horizontal

	results = []
	for i in [ 0..( vertical - 1 ) ]
		for j in [ 0..( horizontal - 1 ) ]
			results.push {
				lat: latStart - i * latIncr,
				lon: lonStart + j * lonIncr,
			}
	results

console.log( divideMap( div, div ) )

