/*! naptha 07-07-2014 */

function reconstruct(filtered, marker, letters){
	var recon = new jsfeat.matrix_t(filtered.cols, filtered.rows, jsfeat.U8C1_t)

	var dx8 = [-1, 1, -1, 0, 1, -1, 0, 1];
	var dy8 = [0, 0, -1, -1, -1, 1, 1, 1];

	var queued = new jsfeat.matrix_t(filtered.cols, filtered.rows, jsfeat.U8C1_t)
	
	var contours = [];

	for(var i = 0; i < filtered.cols * filtered.rows; i++){
		if(queued.data[i] || !filtered.data[i]) continue;

		var ix = i % filtered.cols, iy = Math.floor(i / filtered.cols)
		
		queued.data[i] = 1
		var is_glyph = false;
		var contour = []
		var stack = [i]
		var closed;
		

		while(closed = stack.shift()){
			contour.push(closed)
			var cx = closed % filtered.cols, cy = Math.floor(closed / filtered.cols);
			var w = filtered.data[closed];
			for(var k = 0; k < 8; k++){
				var nx = cx + dx8[k]
				var ny = cy + dy8[k]
				var n = ny * filtered.cols + nx;

				if(nx >= 0 && nx < filtered.cols &&
				   ny >= 0 && ny < filtered.rows &&
				   filtered.data[n] &&
				   !queued.data[n]){
				   	if(!is_glyph && marker.data[n]){
				   		is_glyph = true;
				   	}
					queued.data[n] = 1
					// update the average stroke width
					stack.push(n)
				}
			}
		}

		if(contour.length < 2) continue;

		contours.push([is_glyph, contour])
		
	}
	// postMessage({log: contours})
	var sorted = contours.filter(function(e){ return e[0] == true })
				.map(function(e){ return e[1].length })
				.sort(function(a, b){ return a - b});

	for(var k = 0; k < contours.length; k++){
		var is_glyph = contours[k][0],
			contour = contours[k][1];

		var accept = false;
		if(is_glyph){
			accept = true;

		}else{
			var x0 = Infinity, y0 = Infinity, x1 = 0, y1 = 0;

			// postMessage({log: 'cont'+contour.length})
			for(var i = 0; i < contour.length; i++){
				var x = contour[i] % filtered.cols,
					y = Math.floor(contour[i] / filtered.cols);
				x0 = Math.min(x0, x); y0 = Math.min(y0, y);
				x1 = Math.max(x1, x); y1 = Math.max(y1, y);
			}
			var sw = x1 - x0, sh = y1 - y0;
			var ratio = Math.max(sw, sh) / Math.min(sw, sh);

			// specks can not intersect with letters
			// var intersects = letters.some(function(a){
			// 	var sw = Math.min((a.x1 - box.x0) * s, x1) - Math.max((a.x0 - box.x0) * s, x0),
			// 		sh = Math.min((a.y1 - box.y0) * s, y1) - Math.max((a.y0 - box.y0) * s, y0)
			// 	return sw > -5 && sh > -5
			// })

			// console.log(sh, sw, y1, y0, contour)
			var touches_edge = x0 == 0 || x1 == filtered.cols - 1 || y0 == 0 || y1 == filtered.rows - 1;

			if(contour.length > sorted[0] / 10 && 
				contour.length < sorted[sorted.length - 1] * 2 && 
			   sw / sh < 20 &&
			   sh / sw < 20 &&
			   !touches_edge){
				accept = true
			}
		}

		if(accept){
			for(var j = 0; j < contour.length; j++){
				recon.data[contour[j]] = 1
			}
		}
	}
	return recon
}

function region_filter(mask, src){
	// what is the radius of the structuring element for our morphological dilation
	var dilrad = 7;

	
	var width = src.width,
		height = src.height;

	// perhaps we should use a circular structuring element
	// instead of a box because that means less pixel fills
	// which might be faster, because maybe we should pre
	// cache all thse offsets anyway



	var marker = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);
	var dilation = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);
	

	console.time('morphological dilation')


	// for(var i = 0; i < mask.data.length; i++){
	// 	if(!mask.data[i]) continue;

	// 	for(var dx = -dilrad; dx <= dilrad; dx++){
	// 		for(var dy = -dilrad; dy <= dilrad; dy++){
	// 			dilation.data[i + dx + dy * width] = 1
	// 		}
	// 	}
	// }
	var grown = dilate_contours(dilate_contours(erode_contours(mask)))

	var dilation = grown;
	for(var i = 0; i < dilrad; i++){
		dilation = dilate_contours(dilation)
	}
	// for(var i = dilrad; i < width - dilrad; i++){
	// 	for(var j = dilrad; j < height - dilrad; j++){
	// 		if(!grown.data[i + j * width]) continue;

	// 		for(var dx = -dilrad; dx <= dilrad; dx++){
	// 			for(var dy = -dilrad; dy <= dilrad; dy++){
	// 				dilation.data[i + dx + (dy + j) * width] = 1
	// 			}
	// 		}
	// 	}
	// }

	for(var i = 0; i < mask.data.length; i++){
		// if(grown.data[i])
		// 	dilation.data[i] = 3;

		if(!grown.data[i]) continue;
		dilation.data[i] = 2;
	}

	// visualize_matrix(dilation)


	console.timeEnd('morphological dilation')

	
	var pixmap = new Uint16Array(width * height)
	var intoct = new Uint32Array(16 * 16 * 16)
	var extoct = new Uint32Array(16 * 16 * 16)
	// var zeroes = new Uint32Array(16 * 16 * 16)

	var labtab = {};

	console.time("color filter")
	

	for(var y = 0; y < height; y++){
		for(var x = 0; x < width; x++){
			var p = x + y * width;

			var rgb_color = Math.floor(src.data[4 * p] / 8) + 
							Math.floor(src.data[4 * p + 1] / 8) * 32 + 
							Math.floor(src.data[4 * p + 2] / 8) * 1024;
			// here we round the color kinda to speed up rgb->lab conversion
			// because the conversion is kinda slow

			if(!(rgb_color in labtab)){

				var lab = rgb2lab([src.data[4 * p], src.data[4 * p + 1], src.data[4 * p + 2]])
				// var color =     Math.floor((2 * lab[0] + 30) / 16) + 
				// 				Math.floor((lab[1] + 130) / 16) * 16 + 
				// 				Math.floor((lab[2] + 130) / 16) * 256
				var color = Math.round((lab[0] + 40) / 16) |
							Math.round((lab[1] + 128) / 16) << 4 |
							Math.round((lab[2] + 128) / 16) << 8;

				labtab[rgb_color] = color					
			}else{
				var color = labtab[rgb_color]
			}

			pixmap[p] = color
			if(dilation.data[p] === 1){
				extoct[color]++
				extoct[color+16]++
				extoct[color-16]++
				extoct[color+256]++
				extoct[color-256]++
				extoct[color+1]++
				extoct[color-1]++
			}else if(dilation.data[p] === 2){
				intoct[color]++
				intoct[color+16]++
				intoct[color-16]++
				intoct[color+256]++
				intoct[color-256]++
				intoct[color+1]++
				intoct[color-1]++
			}
		}
	}

	// var invmap = {}
	// for(var i in labtab){
	// 	invmap[labtab[i]] = [(i % 32) * 8, (Math.floor(i / 32) % 32) * 8, (Math.floor(i / 1024)) * 8 ]
	// }
	// var merp = document.createElement('canvas')
	// merp.width = 256
	// merp.height = 256
	// document.body.appendChild(merp)
	// console.log(merp)
	// merp = merp.getContext('2d')
	// merp.beginPath()
	// merp.strokeStyle = '#e0e0e0'
	// for(var i = 0; i < 256 * 2; i+=5){
	// 	merp.moveTo(0, i)
	// 	merp.lineTo(i, 0)
	// }
	// merp.stroke()
	// var sum = 0, count = 0;
	// for(var color = 0; color < intoct.length; color++){
	// 	var frac = intoct[color] / (1 + extoct[color]);
	// 	if(frac > 1){
	// 		sum += frac
	// 		count++
	// 	}
	// }
	// var dev = 0, mean = sum / count;
	// for(var color = 0; color < intoct.length; color++){
	// 	var frac = intoct[color] / (1 + extoct[color]);
	// 	if(frac > 1){
	// 		// sum += frac
	// 		dev += (frac - mean) * (frac - mean)
	// 	}
	// }
	// postMessage({log: 'stdev' + Math.sqrt(dev / count)})

	// postMessage({log: 'thresh indicator'+(high_match / low_match)})
	
	// var ratmap = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);
	
	// for(var p = 0; p < width * height; p++){
	// 	var color = pixmap[p]
	// 	var level = Math.min(255, intoct[color] / (1 + extoct[color]))
	// 	ratmap.data[p] = level
	// }

	// postMessage({visualize: ratmap})

	var buckets = [], itotes = 0, max_level = 8;

	for(var i = 0; i < max_level + 1; i++) buckets[i] = 0;


	for(var p = 0; p < width * height; p++){
		var color = pixmap[p]
		var level = Math.min(max_level, intoct[color] / (1 + extoct[color]))
		if(level > 1){
			buckets[Math.floor(level)]++	
			itotes++
		}
	}

	var median = 1;
	var cumsum = 0;

	// postMessage({'log': buckets})
	for(var i = 0; i < max_level + 1; i++){
		cumsum += buckets[i]
		if(cumsum > itotes / 2){
			// postMessage({'log': 'median value' + i})
			// median = Math.max(1, i - 4)
			if(i == max_level) median = 4;
			break
		}
	}


	for(var y = 0; y < height; y++){
		for(var x = 0; x < width; x++){
			var p = x + y * width;
			var color = pixmap[p]
			if(intoct[color] / (1 + extoct[color]) > median){
			// if(intoct[color] > extoct[color]){
				// marker.data[p] = Math.min(255, 2 * (intoct[color] / (1 + extoct[color])))
				marker.data[p] = 1
			}

			// var l = (color % 16) * 16, 
			// 	a = (Math.floor(color / 16) % 16) * 16, 
			// 	b = (Math.floor(color / 256)) * 16;
			// if(intoct[color] / (1 + extoct[color]) > 1){
			// 	merp.fillStyle = 'rgb(' + invmap[color].join(',') + ')'
			// 	merp.fillRect(l, b, 16, 16)
			// }else{

			// 	merp.strokeStyle = 'rgb(' + invmap[color].join(',') + ')'
			// 	merp.lineWidth = 3
			// 	merp.strokeRect(l + merp.lineWidth, b + merp.lineWidth, 16 - 2 * merp.lineWidth, 16 - 2 * merp.lineWidth)
			// }
		}
	}

	
	// if(median > 2){
	// 	var dilation = dilate_contours(marker)
	// 	for(var i = 0; i < dilation.data.length; i++){
	// 		if(dilation.data[i]){
	// 			var color = pixmap[i]
	// 			if(intoct[color] / (1 + extoct[color]) > 1){
	// 				marker.data[i] = 1
	// 			}
	// 		}
	// 	}	
	// }
	


	console.timeEnd('color filter')

	// console.image(merp.canvas.toDataURL('image/png'))

	// visualize_matrix(marker)

	return {
		mask: marker
	}
}

importScripts("common-worker.js");;


onmessage = function(e){
	var msg = e.data;
	if(msg.action == 'mask'){
		var dat = {
			width: msg.width,
			height: msg.height,
			data: msg.data
		};
		var letters = get_letters(msg.region)
		// var marker = resize_contours(msg.region, letters, msg.mskscale, msg.swtscale, dat.width, dat.height, msg.swtwidth)
		var marker = resize_contours({
			letters: letters,
			region: msg.region,
			sw: dat.width,
			sh: dat.height,
			mskscale: msg.mskscale,
			swtscale: msg.swtscale,
			swtwidth: msg.swtwidth,
			xpad: msg.xpad,
			ypad: msg.ypad
		})

		// postMessage(marker)
		// marker = erode_contours(marker)
		// postMessage(marker)

		var filtered = region_filter(marker, dat)

		var recon = reconstruct(filtered.mask, marker, letters);

		// var imageData = {
		// 	width: recon.cols,
		// 	height: recon.rows,
		// 	data: 
		// }
		var len = recon.cols * recon.rows;
		if(typeof Uint8ClampedArray == 'undefined'){
			var data = new Uint8Array(len * 4);
		}else{
			var data = new Uint8ClampedArray(len * 4);	
		}
		
		// var len = imageData.data.length;

		for(var i = 0; i < len; i++){
			data[i * 4 + 3] = 255
			data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = recon.data[i] ? 0 : 255
		}

		postMessage({
			// mask: recon,
			// imageData: imageData,
			imgdata: data,
			width: recon.cols,
			height: recon.rows,
			colors: filtered.colors
		})
	}

}

