/*! naptha 07-07-2014 */
// https://github.com/naptha/inpaint.js


/*
  This implementation is very loosely based off js-priority-queue
  by Adam Hooper from https://github.com/adamhooper/js-priority-queue
  
  The js-priority-queue implementation seemed a teensy bit bloated
  with its require.js dependency and multiple storage strategies
  when all but one were strongly discouraged. So here is a kind of 
  condensed version of the functionality with only the features that
  I particularly needed. 

  Using it is pretty simple, you just create an instance of HeapQueue
  while optionally specifying a comparator as the argument:

  var heapq = new HeapQueue()

  var customq = new HeapQueue(function(a, b){
  	// if b > a, return negative
  	// means that it spits out the smallest item first
	return a - b
  })

  Note that in this case, the default comparator is identical to
  the comparator which is used explicitly in the second queue.

  Once you've initialized the heapqueue, you can plop some new
  elements into the queue with the push method (vaguely reminiscent
  of typical javascript arays)

  heapq.push(42);
  heapq.push("kitten");

  The push method returns the new number of elements of the queue.

  You can push anything you'd like onto the queue, so long as your
  comparator function is capable of handling it. The default 
  comparator is really stupid so it won't be able to handle anything
  other than an number by default.

  You can preview the smallest item by using peek.

  heapq.push(-9999)
  heapq.peek() ==> -9999

  The useful complement to to the push method is the pop method, 
  which returns the smallest item and then removes it from the
  queue.

  heapq.push(1)
  heapq.push(2)
  heapq.push(3)
  heapq.pop() ==> 1
  heapq.pop() ==> 2
  heapq.pop() ==> 3

*/
function HeapQueue(cmp){
	this.cmp = (cmp || function(a, b){ return a - b });
	this.length = 0;
	this.data = []
}
HeapQueue.prototype.peek = function(){
	return this.data[0]
}
HeapQueue.prototype.push = function(value){
	this.data.push(value);
	var pos = this.data.length - 1,
		parent, x;
	while(pos > 0){
		parent = (pos - 1) >>> 1;
		if(this.cmp(this.data[pos], this.data[parent]) < 0){
			x = this.data[parent]
			this.data[parent] = this.data[pos];
			this.data[pos] = x;
			pos = parent;
		}else break;
	}
	return ++this.length;
}
HeapQueue.prototype.pop = function(){
	var ret = this.data[0],
		last_val = this.data.pop();
	this.length--;
	if(this.data.length > 0){
		this.data[0] = last_val;
		var pos = 0,
			last = this.data.length - 1,
			left, right, minIndex, x;
		while(1){
			left = (pos << 1) + 1;
			right = left + 1;
			minIndex = pos;
			if(left <= last && this.cmp(this.data[left], this.data[minIndex]) < 0) minIndex = left;
			if(right <= last && this.cmp(this.data[right], this.data[minIndex]) < 0) minIndex = right;
			if(minIndex !== pos){
				x = this.data[minIndex]
				this.data[minIndex] = this.data[pos]
				this.data[pos] = x;
				pos = minIndex
			}else break;
		}
	}
	return ret
}

// This file isn't very well documented, but that shouldn't be a huge problem
// because most of this is a fairly straightforward port of the scikit-image
// implementation which can be found in 
// https://github.com/chintak/scikit-image/blob/inpaint/skimage/filter/_inpaint_fmm.pyx

function InpaintTelea(width, height, image, mask, radius){
	if(!radius) radius = 5;

	var LARGE_VALUE = 1e6;
	var SMALL_VALUE = 1e-6;

	var size = width * height;
	var flag = new Uint8Array(size);
	var u = new Float32Array(size);
	
	for(var i = 0; i < size; i++){
		if(!mask[i]) continue;
		// this is the equivalent of doing a morphological dilation with
		// a 1-pixel cross structuring element for first pass through flag
		flag[i + 1] = flag[i] = flag[i - 1] = flag[i + width] = flag[i - width] = 1;
	}
	
	for(var i = 0; i < size; i++){
		flag[i] = (flag[i] * 2) - (mask[i] ^ flag[i])
		if(flag[i] == 2) // UNKNOWN
			u[i] = LARGE_VALUE;
	}


	var heap = new HeapQueue(function(a, b){ return a[0] - b[0] }) // sort by first thingy
	
	for(var i = 0; i < size; i++){
		if(flag[i] == 1) // BAND
			heap.push([u[i], i]);
	}
	
	var indices_centered = []
	// generate a mask for a circular structuring element
	for(var i = -radius; i <= radius; i++){
		var h = Math.floor(Math.sqrt(radius * radius - i * i))
		for(var j = -h; j <= h; j++)
			indices_centered.push(i + j * width);
	}

	function eikonal(n1, n2){
		var u1 = u[n1],
			u2 = u[n2];
		if(flag[n1] == 0 /*KNOWN*/){
			if(flag[n2] == 0 /*KNOWN*/){
				var perp = Math.sqrt(2 - Math.pow(u1 - u2, 2)); // perpendicular distance
				var s = (u1 + u2 - perp) * 0.5; // average distance
				if(s >= u1 && s >= u2) return s;
				s += perp;
				if(s >= u1 && s >= u2) return s;
			}else{
				return 1 + u1
			}
		}else if(flag[n2] == 0 /*KNOWN*/){
			return 1 + u2;
		}
		return LARGE_VALUE
	}

	function inpaint_point(n){
		var norm = 0;
		// var Ia = 0;
		var Ra = 0, Ga = 0, Ba = 0;

		// var Jx = 0, Jy = 0;
		var gradx_u = grad_func(u, n, 1),
			grady_u = grad_func(u, n, width); 
		
		var i = n % width,
			j = Math.floor(n / width);


		for(var k = 0; k < indices_centered.length; k++){
			var nb = n + indices_centered[k];
			var i_nb = nb % width,
				j_nb = Math.floor(nb / width);

			if(i_nb <= 1 || j_nb <= 1 || i_nb >= width - 1 || j_nb >= height - 1) continue;

			if(flag[nb] != 0 /*KNOWN*/) continue; 

			var rx = i - i_nb,
				ry = j - j_nb;

			var geometric_dst = 1 / ((rx * rx + ry * ry) * Math.sqrt(rx * rx + ry * ry))
			var levelset_dst = 1 / (1 + Math.abs(u[nb] - u[n]))
			var direction = Math.abs(rx * gradx_u + ry * grady_u);
			var weight = geometric_dst * levelset_dst * direction + SMALL_VALUE;
			// var gradx_img = grad_func(image, nb, 1) + SMALL_VALUE,
			// 	grady_img = grad_func(image, nb, width) + SMALL_VALUE;
			
			// Ia += weight * image[nb]

			// this is the no-op color meaning that we've hit the background
			// and thus should abandon ship or something
			if(image[nb * 4] == 250 && image[nb * 4 + 1] == 254 && image[nb * 4 + 2] == 252){
				// walp
			}else{
				Ra += weight * image[nb * 4]
				Ga += weight * image[nb * 4 + 1]
				Ba += weight * image[nb * 4 + 2]	
				norm += weight
			}
			// Jx -= weight * gradx_img * rx
			// Jy -= weight * grady_img * ry
		}
		// the fmm.py which this is based on actually implements a slightly different
		// algorithm which apparently "considers the effect of gradient of intensity value"
		// which is some kind of voodoo magic that I don't understand which is apparently
		// in the OpenCV implementation. Unless I've been porting the algorithm wrong,
		// which is certainly a possibility and I invested quite a bit of effort into
		// that hypothesis by way of rewriting and checking every line of code a few
		// times. 
		// image[n] = Ia / norm;
		if(norm > 0){
			image[n * 4] = Ra / norm
			image[n * 4 + 1] = Ga / norm
			image[n * 4 + 2] = Ba / norm	
		}
		
		// image[n] = Ia / norm + (Jx + Jy) / Math.sqrt(Jx * Jx + Jy * Jy);
	}



	// this is meant to return the x-gradient
	function grad_func(array, n, step){
		if(flag[n + step] != 2 /* UNKNOWN */){
			if(flag[n - step] != 2){
				return (array[n + step] - array[n - step]) * 0.5
			}else{
				return array[n + step] - array[n]
			}
		}else{
			if(flag[n - step] != 2){
				return array[n] - array[n - step]
			}else{
				return 0
			}
		}
	}


	while(heap.length){
		var n = heap.pop()[1];
		var i = n % width,
			j = Math.floor(n / width);
		flag[n] = 0; // KNOWN
		if(i <= 1 || j <= 1 || i >= width - 1 || j >= height - 1) continue;
		for(var k = 0; k < 4; k++){
			var nb = n + [-width, -1, width, 1][k];
			if(flag[nb] != 0){ // not KNOWN
				u[nb] = Math.min(eikonal(nb - width, nb - 1),
                                 eikonal(nb + width, nb - 1),
                                 eikonal(nb - width, nb + 1),
                                 eikonal(nb + width, nb + 1));
				if(flag[nb] == 2){ // UNKNOWN
					flag[nb] = 1; // BAND
					heap.push([u[nb], nb])
					inpaint_point(nb)
				}
			}
		}
	}
	if(typeof Uint8ClampedArray == 'undefined'){
		var output = new Uint8Array(image.length);
	}else{
		var output = new Uint8ClampedArray(image.length);
	}
	
	
	for(var i = 0; i < size; i++){
		if(mask[i]){
			output[i * 4] = image[i * 4]
			output[i * 4 + 1] = image[i * 4 + 1]
			output[i * 4 + 2] = image[i * 4 + 2]
			output[i * 4 + 3] = image[i * 4 + 3]	
		}
		
	}
	return output
}

importScripts("common-worker.js");;

onmessage = function(e){
	// postMessage(e.data)
	var dat = e.data;

	var image = {
		width: dat.width,
		height: dat.height,
		data: dat.data
	};
	var image2x = {
		width: dat.width2x,
		height: dat.height2x,
		data: dat.data2x
	};

	var letters = get_letters(dat.region);
	var marker = resize_contours({
		letters: letters,
		region: dat.region,
		sw: image2x.width,
		sh: image2x.height,
		mskscale: dat.mskscale,
		swtscale: dat.swtscale,
		swtwidth: dat.swtwidth,
		xpad: dat.xpad,
		ypad: dat.ypad
	})

	
	var filtered = simple_filter(single_dilation(marker), image2x)
	// postMessage({visualize: filtered})
	var pre_mask = simple_reconstruct(filtered.mask, marker, letters);
	var mask = halve_dilation(single_dilation(single_dilation(pre_mask)));
	// postMessage({visualize: mask})
	// find shadows
	var dilation = erode_contours((mask));
	// postMessage({visualize: dilation})
	// var dilation = mask;
	// var last_avg = -1;
	// var last_diff = 0;
	var avgs = []
	for(var j = 0; j < 10; j++){
		var step = single_dilation(dilation)
		// var frontier = subtract_mask(dilation, mask);
		var lumasum = 0, frontlen = 0;
		for(var i = 0; i < dilation.data.length; i++){
			if(!step.data[i] || dilation.data[i]) continue;
			// if(step.data[i] && !dilation.data[i]) continue;
			var r = image.data[i * 4],
				g = image.data[i * 4 + 1],
				b = image.data[i * 4 + 2];

			var luma = 0.299 * r + 0.587 * g + 0.114 * b;
			// if(r == 255 && g == 255 && b == 255){
			if(r == 250 && g == 254 && b == 252){
				// oh noes, we've reached the edge of the image
				// there should honestly be a better way to signal
				// that we've reached the edge than this super common color though
			}else{
				lumasum += luma || 0;
				frontlen++	
			}
			
		}
		// for(var r = 250; r < 256; r++){
		// 	for(var g = 250; g < 256; g++){
		// 		for(var b = 250; b < 256; b++){
		// 			console.log(r.toString(16) + g.toString(16) + b.toString(16))
		// 		}
		// 	}
		// }
		// fdfafa ~ 113k
		// fbfcfc ~ 151k
		// fafdfd ~ 105k
		// fafefc ~ 24k
		
		// console.log(lumasum / frontlen)
		var avg = lumasum / frontlen;
		if(!isNaN(avg))
			avgs.push(avg);
		// console.log(avg)
		// var diff = avg - last_avg;
		// if(last_avg > 0){


		// 	if(diff > 20 && avg > 100){
		// 		mask = dilation;
		// 		break;
		// 	}

		// }
		// console.log(diff)
		// last_avg = avg;
		// console.log(diff - last_diff)
		// last_diff = diff;
		// postMessage(lumasum / frontlen)
		dilation = step;
		// mask = dilation

	}
	// postMessage({visualize: marker})

	var diff = Math.max.apply(Math, avgs) - Math.min.apply(Math, avgs)
	// postMessage(avgs.join(', '))
	if(diff > 30 && avgs[0] < 85){
		// postMessage(avgs.join(', '))
		var win = 10;	
		var target = Math.max.apply(Math, avgs) - win;
		for(var i = 0; i < avgs.length; i++){
			if(avgs[i] > target){
				var dilation = mask;
				for(var j = 0; j < i; j++){
					// postMessage('new layer '+j)
					dilation = single_dilation(dilation)
				}
				mask = dilation;
				break;
			}
		}	
	}
	

	// remove the top row and bottom row
	for(var i = 0; i < mask.cols; i++){
		mask.data[mask.data.length - i] = mask.data[i] = 0;
	}
	// left and right
	for(var i = 0; i < image.height; i++){
		mask.data[i * image.width] = 0;
		mask.data[(i + 1) * image.width - 1] = 0;
	}

	var output = InpaintTelea(image.width, image.height, image.data, mask.data)
	// var output = InpaintTelea(e.data.width, e.data.height, e.data.image, e.data.mask)
	postMessage({
		type: 'out',
		colors: filtered.colors,
		image: output
	})
	// postMessage(e.data.image)
}




function simple_filter(mask, src){
	// what is the radius of the structuring element for our morphological dilation
	var dilrad = 10;

	
	var width = src.width,
		height = src.height;

	// perhaps we should use a circular structuring element
	// instead of a box because that means less pixel fills
	// which might be faster, because maybe we should pre
	// cache all thse offsets anyway

	var marker = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);
	var dilation = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);
	

	console.time('morphological dilation')

	var dilation = mask;
	for(var i = 0; i < dilrad; i++){
		dilation = single_dilation(dilation)
	}

	for(var i = 0; i < mask.data.length; i++){
		if(!mask.data[i]) continue;
		dilation.data[i] = 2;
	}

	// visualize_matrix(dilation)

	// postMessage({visualize: dilation})


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

	// var ratmap = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t);
	for(var y = 0; y < height; y++){
		for(var x = 0; x < width; x++){
			var p = x + y * width;
			var color = pixmap[p]
			if(intoct[color] > extoct[color]){
				marker.data[p] = 1
			}
			// ratmap.data[p] = Math.min(255, intoct[color] / extoct[color])
		}
	}

	// postMessage({visualize: ratmap})


	console.timeEnd('color filter')


	console.time('color clustering')
	// perhaps k-means or connected components would be better
	

	var midoct = new Uint32Array(16 * 16 * 16)
	var shrunk = (erode_contours(mask))

	for(var y = 0; y < height; y++){
		for(var x = 0; x < width; x++){
			var p = x + y * width;
			if(!shrunk.data[p]) continue;

			var rgb_color = Math.floor(src.data[4 * p] / 8) + 
							Math.floor(src.data[4 * p + 1] / 8) * 32 + 
							Math.floor(src.data[4 * p + 2] / 8) * 1024;
			// here we round the color kinda to speed up rgb->lab conversion
			// because the conversion is kinda slow

			var color = labtab[rgb_color]
			midoct[color]++
		}
	}
	// postMessage({visualize: shrunk})
	// postMessage({visualize: grown})


	var maroct = new Uint8Array(16 * 16 * 16)

	// var dl = [], da = [], db = []
	// for(var i = -1; i <= 1; i++){
	// 	for(var j = -1; j <= 1; j++){
	// 		for(var k = -1; k <= 1; k++){
	// 			if(i == j && j == k && k == 0){
					
	// 			}else{
	// 				// console.log(i, j, k)
	// 				dl.push(i)
	// 				da.push(j)
	// 				db.push(k)
	// 			}
	// 		}
	// 	}
	// }
	// console.log(dl, da, db)


	// var invmap = {}
	// for(var i in labtab){
	// 	invmap[labtab[i]] = [(i % 32) * 8, (Math.floor(i / 32) % 32) * 8, (Math.floor(i / 1024)) * 8 ]
	// }
	


	// do a three dimensional connected components on the L*a*b space
	// and then for each connected cluster, we take the weighted arithmetic
	// mean and convert back to rgb coordinates
	var dl = [-1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		da = [-1, -1, -1, 0, 0, 0, 1, 1, 1, -1, -1, -1, 0, 0, 1, 1, 1, -1, -1, -1, 0, 0, 0, 1, 1, 1],
		db = [-1, 0, 1, -1, 0, 1, -1, 0, 1, -1, 0, 1, -1, 1, -1, 0, 1, -1, 0, 1, -1, 0, 1, -1, 0, 1]

	var clusters = []
	for(var color = 0; color < midoct.length; color++){
		if(midoct[color] == 0 || maroct[color]) continue;
		// var weight = midoct[color] / (1 + extoct[color]);
		// if(weight < 2) continue;
		maroct[color] = 1;
		var contour = [];
		var stack = [color];
		var closed;
		
		var cl = (color     ) & 15,
			ca = (color >> 4) & 15,
			cb = (color >> 8);
		
		while(closed = stack.shift()){
			contour.push(closed)
			for(var k = 0; k < 26; k++){
				var nl = cl + dl[k],
					na = ca + da[k],
					nb = cb + db[k];
				
				var ncolor = nl | (na << 4) | (nb << 8);

				if( nl >= 0 && nl < 16 &&
					na >= 0 && na < 16 &&
					nb >= 0 && nb < 16 &&
					!maroct[ncolor] &&
					midoct[ncolor]
					// midoct[ncolor] / (1 + extoct[ncolor]) > 1
					){
					// weight += midoct[ncolor] / (1 + extoct[ncolor])

					maroct[ncolor] = 1
					stack.push(ncolor)
				}
			}
		}
		
		var wl = 0, wa = 0, wb = 0, wt = 0;

		for(var i = 0; i < contour.length; i++){
			var ncolor = contour[i];
			
			var w = midoct[ncolor] // (1 + extoct[ncolor]);

			var nl = (ncolor     ) & 15,
				na = (ncolor >> 4) & 15,
				nb = (ncolor >> 8);

			var l = (nl * 16 - 40),
				a = (na * 16 - 128),
				b = (nb * 16 - 128);

			
			wt += w;
			wl += l * w;
			wa += a * w;
			wb += b * w;
		}

		// postMessage({})

		
		// postMessage({ log: [contour.length] })
		// var ncolor = contour.sort(function(a, b){
		// 	var wa = intoct[a] * intoct[a] / (1 + extoct[a]),
		// 		wb = intoct[b] * intoct[b] / (1 + extoct[b]);
		// 	return b - a
		// })[0];

		// var nl = (ncolor     ) & 15,
		// 	na = (ncolor >> 4) & 15,
		// 	nb = (ncolor >> 8)
		// var l = (nl * 16 - 40),
		// 	a = (na * 16 - 128),
		// 	b = (nb * 16 - 128);

		// var rgb = lab2rgb([l, a, b])
		var rgb = lab2rgb([wl / wt, wa / wt, wb / wt])
		

		// postMessage({ log:  (wt) + " nuxm " + rgb + (width * height),
		// 	intoct: intoct, extoct: extoct, contour: contour })


		// console.log('wow such cluster', weight, wl, wa, wb, rgb)
		// console.log(contour)

		clusters.push([wt, rgb])
	}
	console.timeEnd('color clustering')

	return {
		mask: marker,
		colors: clusters.sort(function(b, a){ return a[0] - b[0] })
	}
}


function simple_reconstruct(filtered, marker, letters){
	var recon = new jsfeat.matrix_t(filtered.cols, filtered.rows, jsfeat.U8C1_t)

	var dx8 = [-1, 1, -1, 0, 1, -1, 0, 1];
	var dy8 = [0, 0, -1, -1, -1, 1, 1, 1];

	var queued = new jsfeat.matrix_t(filtered.cols, filtered.rows, jsfeat.U8C1_t)
	
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

		if(contour.length < 2){
			for(var j = 0; j < contour.length; j++){
				recon.data[contour[j]] = 1
			}
			continue;
		}

		// postMessage({log: 'done contour'+i})
		// contours.push(contour)
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
			var sw = x1 - x0 + 1, sh = y1 - y0 + 1;
			var ratio = Math.max(sw, sh) / Math.min(sw, sh);

			// specks can not intersect with letters
			// var intersects = letters.some(function(a){
			// 	var sw = Math.min((a.x1 - box.x0) * s, x1) - Math.max((a.x0 - box.x0) * s, x0),
			// 		sh = Math.min((a.y1 - box.y0) * s, y1) - Math.max((a.y0 - box.y0) * s, y0)
			// 	return sw > -5 && sh > -5
			// })

			// console.log(sh, sw, y1, y0, contour)
			var touches_edge = x0 == 0 || x1 == filtered.cols - 1 || y0 == 0 || y1 == filtered.rows - 1;

			if(contour.length < 1000 && 
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

function single_dilation(mask){
	var mydriatic = new jsfeat.matrix_t(mask.cols, mask.rows, jsfeat.U8C1_t);
	for(var i = 0; i < mask.data.length; i++){
		if(!mask.data[i]) continue;
		mydriatic.data[i] = mydriatic.data[i - 1] = mydriatic.data[i + 1] = mydriatic.data[i - mask.cols] = mydriatic.data[i + mask.cols] = 1
	}
	return mydriatic
}
function subtract_mask(dilation, mask){
	var sub = new jsfeat.matrix_t(mask.cols, mask.rows, jsfeat.U8C1_t);
	for(var i = 0; i < mask.data.length; i++){
		sub.data[i] = dilation.data[i] && !mask.data[i];
	}
	return sub
}

function halve_dilation(mask){
	var half = new jsfeat.matrix_t(mask.cols / 2, mask.rows / 2, jsfeat.U8C1_t);
	for(var i = 0; i < half.data.length; i++){
		var x = i % half.cols,
			y = Math.floor(i / half.cols);

		half.data[i] = mask.data[x * 2 + 2 * y * mask.cols] || 
						mask.data[x * 2 + 1 + 2 * y * mask.cols] || 
						mask.data[x * 2 + 1 + (2 * y + 1) * mask.cols] || 
						mask.data[x * 2 + (2 * y + 1) * mask.cols];
	}
	return half
}
