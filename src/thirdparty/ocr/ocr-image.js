/*! OCR Image - Core OCR functionality extracted from naptha-wick.js */

// Use global ocrDone function - should be defined by the content script
function ocrDone(imageSrc, text, tweetId) {
	if (typeof window.ocrDone === 'function') {
		window.ocrDone(imageSrc, text, tweetId);
	} else {
		console.error('ocrDone callback not found on window object');
	}
}

// Global variables
var global_params = {}
var storage_cache = { warn_ocrad: true }
var session_params = {}

// Image processing queue for sequential processing
var imageQueue = []
var isProcessing = false
var currentProcessingImage = null

var default_params = {
	// the kernel size for the gaussian blur before canny
	kernel_size: 3,
	// low and high thresh are parameters for the canny edge detector
	low_thresh: 124,
	high_thresh: 204,
	// maximum stroke width, this is the number of iterations
	// the core stroke width transform loop will go through
	// before giving up and saying that there is no stroke here
	max_stroke: 35,
	// the maximum ratio between adjacent strokes for the
	// connected components algorithm to consider part of the
	// same actual letter
	stroke_ratio: 2,
	// this is the pixel connectivity required for stuff to happen
	min_connectivity: 4,
	// the minimum number of pixels in a connected component to
	// be considered a candidate for an actual letter
	min_area: 30, //default: 38
	// maximum stroke width variation allowed within a letter
	std_ratio: 0.83,
	// maximum aspect ratio to still be considered a letter
	// for instance, a really long line wouldn't be considered
	// a letter (obviously if this number is too low, it'll start
	// excluding l's 1's and i's which would be bad)
	aspect_ratio: 10, // default: 8
	// maximum ratio between the median thicknesses of adjacent
	// letters to be considered part of the same line
	thickness_ratio: 3,
	// maximum ratio between adjacent letter heights to be considered
	// part of the same line
	height_ratio: 2.5, // original: 1.7

	// for some reason it's much more effective with non-integer scales
	scale: 1.3,
	// scale: 1.8,

	// text_angle: Math.PI / 6
	letter_occlude_thresh: 7, //default 3

	// otsu parameter for word breakage
	breakdown_ratio: 0.4,
	// something something making lines
	elongate_ratio: 1.9,
	// maximum number of surrounding pixels to explore during the
	// flood fill swt augmentation stage
	max_substroke: 15,
	// linespacing things for spacing lines, used in forming paragraphs/regions
	min_linespacing: 0.1, // this is for overlap
	max_linespacing: 1.7,
	// otsu breakdown ratio for splitting a paragraph
	col_breakdown: 0.3,
	// the maximum fraction of the width of the larger of two adjacent lines
	// by which an alignment may be offset in one column
	max_misalign: 0.1,
	// the first one is frac of the smaller area, the second is frac of bigger area
	col_mergethresh: 0.3,

	lettersize: 0.4, // maximum difference between median letter weights of adjacent lines
	// letter weight is defined as the number of pixels per letter divided by the width
	// which is because quite often entire words get stuck together as one letter
	// and medians are used because it's a more robust statistic, this actually works
	// remarkably well as a metric

	// debugs!?!?
	debug: false,

	chunk_size: 250,
	chunk_overlap: 90,
}

var session_id = uuid()
var image_counter = 0
var images = {}

// Utility functions
function uuid() {
	for (var i = 0, s, b = ''; i < 42; i++)
		if (/\w/i.test((s = String.fromCharCode(48 + Math.floor(75 * Math.random()))))) b += s
	return b
}


// Core OCR functions
function ocr_image(image, tweetId) {
	console.log('===ocr_image called for:', image.src, 'tweetId:', tweetId);
	
	// Add to queue instead of processing immediately
	queueImageForProcessing(image, tweetId);
}

// Queue management functions
function queueImageForProcessing(image, tweetId) {
	// Check if image is already in queue or being processed
	if (image.hasAttribute('data-ocr-queued') || image.hasAttribute('data-ocr-processing')) {
		console.log('Image already queued or processing:', image.src);
		return;
	}
	
	// Mark as queued
	image.setAttribute('data-ocr-queued', 'true');
	
	// Add to queue
	imageQueue.push({
		image: image,
		tweetId: tweetId,
		queuedAt: Date.now()
	});
	
	console.log('Queued image for processing:', image.src, 'Queue length:', imageQueue.length);
	
	// Try to start processing
	processNextImage();
}

function processNextImage() {
	// If already processing or queue is empty, return
	if (isProcessing || imageQueue.length === 0) {
		console.log('Not starting next image - isProcessing:', isProcessing, 'queue length:', imageQueue.length);
		return;
	}
	
	// Get next image from queue
	const queueItem = imageQueue.shift();
	const { image, tweetId } = queueItem;
	
	// Mark as processing
	isProcessing = true;
	currentProcessingImage = {
		image: image,
		tweetId: tweetId,
		startedAt: Date.now()
	};
	
	// Update image attributes
	image.removeAttribute('data-ocr-queued');
	image.setAttribute('data-ocr-processing', 'true');
	
	console.log('Starting OCR processing for:', image.src, 'Queue remaining:', imageQueue.length);
	
	// Process the image using original logic
	processImageInternal(image, tweetId);
}

function processImageInternal(image, tweetId) {
	console.log('===processImageInternal', image, tweetId);
	console.log('getting text from image', image);
	console.log('Image dimensions:', image.naturalWidth, 'x', image.naturalHeight);
	console.log('Image type:', image.src.includes('video_thumb') ? 'Video thumbnail' : 'Regular image');
	
	// Generate unique image ID
	const imageId = get_id(image);
	console.log('Generated image ID:', imageId);
	
	// Use the proven default parameters
	const params = {
		...default_params, // Use all the proven default parameters
		engine: 'ocrad' // Just override the engine to use OCRAD
	};
	
	// Create image object
	const imageObj = {
		id: imageId,
		el: image,
		width: Math.round(image.naturalWidth * params.scale),
		height: Math.round(image.naturalHeight * params.scale),
		src: image.src,
		real_src: image.src,
		params: params,
		ocr_results: [],
		regions_processed: 0,
		total_regions: 0,
		tweetId: tweetId,
		isSequentialProcessing: true // Flag to identify sequential processing
	};
	
	// Store image object
	images[imageId] = imageObj;
	console.log('Stored image object:', imageId);
	
	// Calculate optimal chunks for the entire image (like hover functionality does)
	const num_chunks = Math.max(
		1,
		Math.ceil(
			(imageObj.height - params.chunk_overlap) /
			(params.chunk_size - params.chunk_overlap)
		)
	);
	
	const chunks = [];
	for (let i = 0; i < num_chunks; i++) {
		chunks.push(i);
	}
	
	console.log('Calculated chunks for image:', chunks, 'out of', num_chunks, 'total chunks');
	
	// Send chunk request for the entire image
	broadcast({
		type: 'qchunk',
		id: imageId,
		chunks: chunks, // Process all chunks, not just the first one
		time: Date.now()
	});
	console.log('Sent qchunk message for image:', imageId, 'with', chunks.length, 'chunks');
}

// Called when an image completes OCR processing
function onImageProcessingComplete(imageSrc, text, tweetId) {
	console.log('Image processing complete:', imageSrc, 'Text length:', text.length);
	
	// Mark current processing as complete
	if (currentProcessingImage && currentProcessingImage.image.src === imageSrc) {
		currentProcessingImage.image.removeAttribute('data-ocr-processing');
		currentProcessingImage.image.setAttribute('data-ocr-processed', 'true');
		
		const processingTime = Date.now() - currentProcessingImage.startedAt;
		console.log('Processing took:', processingTime, 'ms');
		
		currentProcessingImage = null;
	}
	
	// Mark as no longer processing
	isProcessing = false;
	
	// Call the original callback
	ocrDone(imageSrc, text, tweetId);
	
	// Process next image in queue
	setTimeout(() => {
		processNextImage();
	}, 100); // Small delay to prevent overwhelming the system
}

function get_all_image_text() {
	console.log('getting all image text');
	
	// Function to process images once they're loaded
	function processImages() {
		// get all articles from twitter feed
		const articles = document.querySelectorAll('article');

		// for each article, get all its images
		articles.forEach(article => {
			const images = article.querySelectorAll('img');
			
			images.forEach(image => {

				// skip if it's a profile picture
				if (image.src.includes('profile_images')) {
					return;
				}
				
				// skip if it's an emoji
				if (image.src.includes('emoji')) {
					return;
				}
				
				// Skip if already processed or being processed
				if (image.hasAttribute('data-ocr-processing') || image.hasAttribute('data-ocr-processed')) {
					return;
				}
				
				// Process the actual image
				console.log('Processing image:', image.src);
				ocr_image(image);
			});
		});
	}
	
	// Initial processing
	processImages();
	
	// Set up observer to watch for new content (Twitter's infinite scroll)
	const observer = new MutationObserver(function(mutations) {
		let hasNewImages = false;
		
		mutations.forEach(function(mutation) {
			if (mutation.type === 'childList') {
				mutation.addedNodes.forEach(function(node) {
					if (node.nodeType === Node.ELEMENT_NODE) {
						// Check if new articles or images were added
						if (node.tagName === 'ARTICLE' || node.querySelector) {
							const newImages = node.querySelectorAll ? node.querySelectorAll('img') : [];
							if (newImages.length > 0) {
								hasNewImages = true;
							}
						}
					}
				});
			}
		});
		
		if (hasNewImages) {
			// Wait a bit for lazy loading to kick in, then process
			setTimeout(processImages, 1000);
		}
	});
	
	// Start observing
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
	
	// Also periodically check for new images (fallback)
	setInterval(function() {
		const allImages = document.querySelectorAll('article img');
		const processedImages = document.querySelectorAll('article img[data-ocr-processed]');
		
		if (allImages.length > processedImages.length) {
			processImages();
		}
	}, 5000); // Check every 5 seconds
}

// Note: get_all_image_text() is not used anymore since OCR is handled by content.js
// The automatic OCR processing has been removed to prevent conflicts with undefined tweetIds

// Image management functions
function get_id(img) {
	if (!img) return
	// if you're passing an id, return the id
	if (typeof img == 'string') return img
	function clean(str) {
		// return str.replace(/^.+:\/\//g, '').replace(/[^a-z.\/_]/gi, '')
		return str.replace(/[^a-z0-9.\/_\-]/gi, '')
	}
	if (img.getAttribute && img.getAttribute('data-imageid')) {
		return img.getAttribute('data-imageid')
	}
	if (!('__naptha_id' in img)) {
		var readable = clean(img.src.replace(/^.*\/(.*)$/g, '$1').split('.')[0])
		img.__naptha_id =
			image_counter++ + '**' + readable + '**' + clean(img.src) + '**' + session_id
		if (global_params.simple_ids) {
			img.__naptha_id = readable
		}
	}
	return img.__naptha_id
}

function im(img) {
	if (!img) return

	var id = get_id(img)
	if (id in images) return images[id]

	function shallow(obj) {
		var new_obj = {}
		for (var i in obj) {
			new_obj[i] = obj[i]
		}
		return new_obj
	}

	var params = shallow(default_params)

	var src = img.src

	if (!src) return null

	if (src.indexOf('http://localhost/Dropbox/Projects/naptha/') == 0 || global_params.demo_mode) {
		src = 'demo:' + img.src.replace(/^.*\/(.*?)\..*?$/g, '$1')
	}

	var image = (images[id] = {
		id: id,
		el: img,
		width: Math.round(img.naturalWidth * params.scale),
		height: Math.round(img.naturalHeight * params.scale),
		src: src,
		real_src: img.src,
		chunks: [],
		regions: [],
		engine: 'default',
		params: params,
	})

	return image
}

// Communication functions
function broadcast(data) {
	chrome.runtime.sendMessage(data)
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	receive(request)
})

// OCR parsing functions
function parseTesseract(response) {
	var meta = response.meta

	var rotw = ((meta.x1 - meta.x0 + 1) / meta.sws) * meta.cos + meta.xp * 2,
		roth = ((meta.y1 - meta.y0 + 1) / meta.sws) * meta.cos + meta.yp * 2

	var text = response.text.trim()

	if (text.length == 0) return []

	var raw = text.split('\n').map(function(e) {
		var first = e.split('\t')[0]
		var d = first.trim().split(' ')
		var x = parseInt(d[0]),
			y = parseInt(d[1]),
			w = parseInt(d[2]),
			h = parseInt(d[3]),
			conf = parseFloat(d[4])

		var cx = x + w / 2 - rotw / 2,
			cy = y + h / 2 - roth / 2

		var rcx = (cx * Math.cos(meta.ang) - cy * Math.sin(meta.ang) + rotw / 2) / meta.red,
			rcy = (cx * Math.sin(meta.ang) + cy * Math.cos(meta.ang) + roth / 2) / meta.red

		return {
			x: (rcx - w / 2 / meta.red) / meta.cos + meta.x0 / meta.sws - meta.xp,
			y: (rcy - h / 2 / meta.red) / meta.cos + meta.y0 / meta.sws - meta.yp,
			w: w / meta.red / meta.cos,
			h: h / meta.red / meta.cos,
			sw: /SW$/.test(first.trim()),
			matches: [[e.slice(first.length + 1), conf]],
		}
	})

	return raw
}

function parseOcrad(response) {
	var meta = response.meta

	var rotw = ((meta.x1 - meta.x0 + 1) / meta.sws) * meta.cos + meta.xp * 2,
		roth = ((meta.y1 - meta.y0 + 1) / meta.sws) * meta.cos + meta.yp * 2

	var raw = response.raw
		.map(function(e) {
			return e.match(/^\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*;\s*(\d+)(\,?.+)?$/)
		})
		.filter(function(e) {
			return e
		})
		.map(function(e) {
			var x = parseInt(e[1]),
				y = parseInt(e[2]),
				w = parseInt(e[3]),
				h = parseInt(e[4]),
				g = parseInt(e[5])

			var matches = []
			if (g > 0) {
				var etc = e[6].trim()
				while (etc[0] == ',' && etc[1] == ' ') {
					etc = etc.slice(2)
					var m = etc.match(/^\'(.+?)\'(\d+)/)
					matches.push([m[1], parseInt(m[2])])
					etc = etc.slice(m[0].length)
				}
			}

			if (matches.length != g) {
				console.error('recognition count mismatch', g, matches)
			}
			// console.log(x, y, w, h, g, etc)
			var cx = x + w / 2 - rotw / 2,
				cy = y + h / 2 - roth / 2

			var rcx = (cx * Math.cos(meta.ang) - cy * Math.sin(meta.ang) + rotw / 2) / meta.red,
				rcy = (cx * Math.sin(meta.ang) + cy * Math.cos(meta.ang) + roth / 2) / meta.red

			return {
				// convert everything back to transformed scaled coordinates
				x: (rcx - w / 2 / meta.red) / meta.cos + meta.x0 / meta.sws - meta.xp,
				y: (rcy - h / 2 / meta.red) / meta.cos + meta.y0 / meta.sws - meta.yp,
				w: w / meta.red / meta.cos,
				h: h / meta.red / meta.cos,
				matches: matches,
			}
		})

	return raw
}

// Message handling
function receive(data) {
	console.log('Received message:', data.type, 'for image:', data.id);
	
	if (data.type == 'getparam') {
		console.log('Handling getparam for image:', data.id);
		var image = im(data.id)
		broadcast({
			type: 'gotparam',
			id: image.id,
			src: image.src,
			real_src: image.real_src,
			params: image.params,
			initial_chunk: data.initial_chunk,
		})
		console.log('Sent gotparam response for image:', data.id);
	} else if (data.type == 'region') {
		console.log('Handling region message for image:', data.id);
		var image = im(data.id)

		if (!image) {
			console.log('No image found for region message:', data.id);
			return;
		}

		image.regions = data.regions
		image.chunks = data.chunks
		image.stitch_debug = data.stitch_debug

		// Check if this is our automated OCR workflow
		if (image.ocr_results !== undefined) {
			// Check if we've already completed OCR for this image
			if (image.ocr_completed) {
				console.log('OCR already completed for image:', image.id, 'skipping duplicate processing');
				return;
			}
			
			console.log('Text regions detected:', data.regions.length);
			console.log('Region details:', data.regions.map(r => ({
				id: r.id,
				width: r.width,
				height: r.height,
				area: r.width * r.height,
				finished: r.finished
			})));
			
			// Reset OCR results and counters for new region processing
			image.ocr_results = [];
			image.regions_processed = 0;
			image.total_regions = data.regions.length;
			
			// Check if no regions were detected in this chunk
			if (data.regions.length === 0) {
				console.log('No text regions detected in this chunk for image:', image.src);
				// Don't mark as complete yet - other chunks may still find regions
				// Set a timeout to complete if no regions are found at all
				if (!image.noRegionsTimeout) {
					image.noRegionsTimeout = setTimeout(() => {
						if (!image.ocr_completed && image.ocr_results && image.ocr_results.length === 0) {
							console.log('No text regions found in any chunk for image:', image.src);
							console.log('=== COMPLETE OCR TEXT FOR IMAGE (NO REGIONS) ===');
							console.log('Image:', image.src);
							console.log('Full text for image:', image.src, '');
							console.log('=====================================');
							
							// Mark image as processed
							image.ocr_completed = true;

							// Safety check for tweetId
							if (images[image.id].tweetId) {
								// Use sequential completion handler if this is sequential processing
								if (image.isSequentialProcessing) {
									onImageProcessingComplete(image.src, '', images[image.id].tweetId);
								} else {
									// Legacy path for non-sequential processing
									image.el.removeAttribute('data-ocr-processing');
									image.el.setAttribute('data-ocr-processed', 'true');
									ocrDone(image.src, '', images[image.id].tweetId);
								}
							} else {
								console.error('OCR completed but tweetId is undefined for image:', image.src);
							}
						}
					}, 2000); // 2 second timeout for no-regions case
				}
				return;
			}
			
			// Clear no-regions timeout since we found regions
			if (image.noRegionsTimeout) {
				clearTimeout(image.noRegionsTimeout);
				image.noRegionsTimeout = null;
			}
			
			// Initialize OCR objects for each region
			if (!image.ocr) image.ocr = {};
			
			// Mark regions as finished and wait for them to be processed
			data.regions.forEach((region, index) => {
				// Mark region as finished so ocr_region will process it
				region.finished = true;
				
				// Clear any existing OCR state for this region to ensure fresh processing
				if (image.ocr[region.id]) {
					delete image.ocr[region.id].finished;
					delete image.ocr[region.id].processing;
				}
				
				// Initialize OCR object for this region
				image.ocr[region.id] = {
					engine: image.params.engine,
					_engine: image.params.engine
				};
				
				console.log('[Image', image.id, '] Processing region for OCR:', region.id, 'finished:', region.finished);
		
				// Use the same approach as hover selection - call ocr_region directly
				console.log('[Image', image.id, '] Calling ocr_region for region:', region.id);
				ocr_region(image, region);
				console.log('[Image', image.id, '] Finished calling ocr_region for region:', region.id);
			});
		} else {
			console.log('Not our automated OCR workflow, skipping qocr');
		}
	} else if (data.type == 'recognized') {
		console.log('Handling recognized message for image:', data.id, 'region:', data.reg_id);
		var image = im(data.id)
		if (!image) {
			console.log('No image found for recognized message:', data.id);
			return;
		}
		if (!image.ocr) image.ocr = {}

		var plain_text = data.text
		try {
			plain_text = JSON.parse(plain_text).text
		} catch (err) {
			if (data.enc == 'tesseract') {
				data.enc = 'error'
			}
		}

		if (data.enc == 'error' || /^ERROR/i.test(plain_text)) {
			console.log('OCR error for region:', data.reg_id, 'Error:', plain_text);
			delete image.ocr[data.reg_id];
			return
		}

		if (data.enc == 'tesseract') {
			var json = JSON.parse(data.text)
			var raw = parseTesseract(json)
		} else {
			var raw = data.raw
		}

		var ocr = image.ocr[data.reg_id]

		if (ocr._engine != data.engine) return

		ocr.finished = Date.now()
		ocr.elapsed = ocr.finished - ocr.processing
		delete ocr.processing

		ocr.raw = raw
		ocr.text = data.text

		var broken = raw.some(function(block) {
			return isNaN(block.x) || isNaN(block.y) || isNaN(block.w) || isNaN(block.h)
		})

		if (broken) {
			var ocr = image.ocr[data.reg_id]
			ocr.raw = null
			ocr.error = true
			ocr.text = 'ERROR: ' + data.text
		}

		// Check if this is our automated OCR workflow
		if (image.ocr_results !== undefined) {
			// Check if we already have a result for this region
			const existingResult = image.ocr_results.find(result => result.region_id === data.reg_id);
			if (existingResult) {
				console.log('OCR result already exists for region:', data.reg_id, 'skipping duplicate');
				return;
			}
			
			console.log('OCR result for region:', data.reg_id, 'Text:', data.text);
			console.log('Current OCR results:', image.ocr_results.map(r => ({ id: r.region_id, text: r.text.substring(0, 50) + '...' })));
			image.ocr_results.push({
				region_id: data.reg_id,
				text: data.text
			});
			image.regions_processed++;
			console.log('Regions processed:', image.regions_processed, '/', image.total_regions);
			
			// Instead of using region count, use a timeout-based approach
			// Clear any existing completion timeout and set a new one
			if (image.completionTimeout) {
				clearTimeout(image.completionTimeout);
			}
			
			// Set timeout to detect completion (no more regions coming in the last 2 seconds)
			image.completionTimeout = setTimeout(() => {
				// Check if we haven't already completed
				if (!image.ocr_completed) {
					console.log('OCR completion detected - no new regions for 2 seconds');
					
					// All OCR complete, log full text
					const fullText = image.ocr_results
						.map(result => result.text)
						.join(' ')
						.trim();
					
					console.log('=== COMPLETE OCR TEXT FOR IMAGE ===');
					console.log('Image:', image.src);
					console.log('Full text for image:', image.src, fullText);
					console.log('=====================================');
					
					// Mark image as processed
					image.ocr_completed = true;

					// Safety check for tweetId
					if (images[image.id].tweetId) {
						// Use sequential completion handler if this is sequential processing
						if (image.isSequentialProcessing) {
							onImageProcessingComplete(image.src, fullText, images[image.id].tweetId);
						} else {
							// Legacy path for non-sequential processing
							image.el.removeAttribute('data-ocr-processing');
							image.el.setAttribute('data-ocr-processed', 'true');
							ocrDone(image.src, fullText, images[image.id].tweetId);
						}
					} else {
						console.error('OCR completed but tweetId is undefined for image:', image.src);
					}
				}
			}, 2000); // 2 second timeout after last recognized message
		} else {
			console.log('Not our automated OCR workflow, skipping result collection');
		}
	}
}

// OCR region processing
function ocr_region(image, col) {
	console.log('[Image', image.id, '] ocr_region called for region:', col.id, 'finished:', col.finished);
	if (!image.ocr) image.ocr = {}

	if (col.finished != true) {
		console.log('[Image', image.id, '] Region not finished, returning early:', col.id);
		return
	}

	if (!(col.id in image.ocr)) {
		image.ocr[col.id] = {
			engine: 'default',
		}
	}

	if (col.virtual) {
		for (var i = 0; i < image.regions.length; i++) {
			if (image.regions[i].id == col.id) col = image.regions[i]
		}
	}

	var ocr = image.ocr[col.id]

	var eng = get_ocr_engine(image, col)
	if (ocr._engine != eng) {
		ocr._engine = eng
		delete ocr.finished
		delete ocr.processing
	}

	if (ocr.finished || ocr.processing !== undefined) {
		console.log('[Image', image.id, '] OCR already finished or processing, returning early:', col.id, 'ocr.finished:', ocr.finished, 'ocr.processing:', ocr.processing);
		return
	}

	delete ocr.waiting

	var matches = get_lookup_chunks(image, col).filter(function(chunk) {
		return chunk.engine == eng
	})
	
	console.log('[Image', image.id, '] Lookup chunks found:', matches.length, 'for region:', col.id);

	if (ocr._engine != 'ocrad') {
		// gotta have lookup loaded or else cant do something
		if (!image.lookup) {
			// Simplified - just use ocrad for now
			ocr._engine = 'ocrad'
		}
	}

	if (matches.length > 0) {
		// TODO: figure out the ideal candidate
	} else {
		console.log('[Image', image.id, '] No lookup chunks found, sending qocr request for region:', col.id);
		queue_broadcast({
			src: image.src,
			type: 'qocr',
			apiroot: global_params.apiroot,
			region: col,
			reg_id: col.id,
			id: image.id,
			engine: ocr._engine,
			swtscale: image.params.scale,
			swtwidth: image.width,
		})
	}

	image.ocr[col.id].processing = Date.now()
}

// Helper functions
function get_ocr_engine(image, region, def) {
	var ocr = image.ocr[region.id]

	if (ocr.engine == 'default') {
		return def || 'ocrad'
	} else {
		return ocr.engine
	}
}

function get_lookup_chunks(image, region) {
	// Simplified - return empty array for now
	return []
}

// Broadcast queue management
var broadcast_queue = [],
	is_casting = false

function queue_broadcast(data) {
	console.log('[Image', data.id, '] Queueing broadcast message:', data.type, 'for region:', data.reg_id);
	broadcast_queue.push(data)
	if (!is_casting) dequeue_broadcast()
}

function dequeue_broadcast() {
	is_casting = false
	if (broadcast_queue.length) {
		const data = broadcast_queue.shift();
		console.log('[Image', data.id, '] Dequeueing and broadcasting message:', data.type, 'for region:', data.reg_id);
		broadcast(data)
		setTimeout(dequeue_broadcast, 500)
		is_casting = true
	}
}

console.log('OCR Image script loaded'); 