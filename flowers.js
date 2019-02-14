


//generate bulb mesh
function GenerateBulb(radius, widthSeg, heightSeg)
{
	var sphereGeometry 	= new THREE.SphereGeometry(radius, widthSeg, heightSeg);
	var material 		= new THREE.MeshPhongMaterial({color: randomColor().getHex()});
	
	return new THREE.Mesh(sphereGeometry, material);
}

//Generate stalk
function GenerateStalk(startPt, endPt, nbControlPts, segments, radius, radiusSegments)
{
	var points = [];
	
	var midPt0 = new THREE.Vector3();
	midPt0.lerpVectors(startPt, endPt, 0.35);
	midPt0.add(new THREE.Vector3(noise.simplex3(20 * 4,20 * 4,0) * + 1, 0,  noise.simplex3(20 * 4,20 * 4,0) * 2 + 1));
	
	
	var curve = new THREE.CatmullRomCurve3
	([
		startPt,
		midPt0,
		endPt
    ]);
	
	var tubeGeometry 	= new THREE.TubeGeometry(curve, segments, radius, radiusSegments, false);
	var material 		= new THREE.MeshPhongMaterial({color: randomColor().getHex()});
	
	return new THREE.Mesh(tubeGeometry, material);
}

//Generate flower vertices
function GenerateDeformedFlowerVertices(vList, nbMeshSeg, radius, freq, mag, seed, heightOffset)
{
	var twoPI = 2 * Math.PI;
	
	var heightNoise = noise.simplex3( -0.0006, 0.0056,1.5) + 0.05;

	for(var i = 0; i < nbMeshSeg; ++i)
	{
		var alpha = Math.cos(i * twoPI / nbMeshSeg);
		var beta  = Math.sin(i * twoPI / nbMeshSeg);

		var deform = noise.simplex3(alpha * freq, beta * freq, seed) + 1;
		var deformRadius = radius * ( 1 + mag * deform );
		
		var scale = deformRadius;
		
		for(var j = 1; j <= 3; ++j)
		{
			var yfactor = (Number(j) / 3);
			
			var yHeight = j * heightNoise * 0.25;
			
			var subScale = yfactor * scale;
			
			if(j == 2)
				yHeight *= -1;
			
			vList.push(new THREE.Vector3(alpha * subScale, yHeight + heightOffset, beta * subScale));
		}
					
	}
	
}

//generate face
function GenFace(v1,v2,v3, color1 = 0x7777ff,color2 = 0x7777ff,color3 = 0x7777ff)
{
	var face = new THREE.Face3(v1,v2,v3);
	face.vertexColors[0] = new THREE.Color(color1);
	face.vertexColors[1] = new THREE.Color(color2);
	face.vertexColors[2] = new THREE.Color(color3);
	
	return face;
}

//Generate Flower Geometry
function GenerateFlowerGeometry(radius, nbMeshSeg, freq, mag, seed, color1, color2, heightOffset, mult)
{
	var geom 		 = new THREE.Geometry();

	var vertexList 	 = geom.vertices;
	
	//adds the first vertex
	vertexList.push(new THREE.Vector3(0,heightOffset,0));
	
	//Generate deformed flower vertex
	GenerateDeformedFlowerVertices(vertexList, nbMeshSeg, radius, freq, mag, seed, heightOffset+ 0.75 * mult);
	
	for(var fi = 0; fi < ((vertexList.length - 1) / 3) - 1; ++fi)
	{
		var ii = (fi * 3) + 1;
		geom.faces.push(GenFace(ii, ii+3, 0, color2, color1, color2)); //1st face
		geom.faces.push(GenFace(ii, ii+4, ii+3, color2,color2,color2 )); //2nd face
		geom.faces.push(GenFace(ii, ii+4, ii+1,color2,color2,color2 )); //3rd face
		geom.faces.push(GenFace(ii+1, ii+4, ii+5,color2,color2,color2 )); //4th face
		geom.faces.push(GenFace(ii+1, ii+5, ii+2,color2,color2,color2 )); //5th face
	}
	
	//last Big Face
	var faceCount = (vertexList.length - 1) / 3;
	var ii = (faceCount - 1) * 3 + 1;
	geom.faces.push(GenFace(ii, 0, 1,color2,color1,color2));
	geom.faces.push(GenFace(ii, 2, 1,color2,color2,color2));
	geom.faces.push(GenFace(ii, 2, ii+1,color2,color2,color2));
	geom.faces.push(GenFace(ii+1, 2, 3,color2,color2,color2));
	geom.faces.push(GenFace(ii+1, 3, ii+2,color2,color2,color2));
	
	
	geom.computeFaceNormals();
	//create material
	var flowerMaterial = new THREE.MeshPhongMaterial({color:0x7777ff, side : THREE.DoubleSide, vertexColors: THREE.VertexColors});
	
	return new THREE.Mesh(geom, flowerMaterial);
}

//Seed random colors
function randomColor()
{
	return new THREE.Color('rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')');
}

//Generates total flower mesh
function GenerateRandomFlower(radius, nbMeshSeg, nbPods, x, y, indep)
{
	var flowerObjects = new THREE.Object3D();
	
	var frequencyNoise = noise.simplex2((x*100) / 100, (y*100) / 100);
	var magNoise = noise.simplex2((x*100) / 100, (y*100) / 100);
				
	var minFreq 		= 1.05; var maxFreq = 10;
	var minMag 			= 0.133; var maxMag = 1;
				
	var frequency 		= minFreq + frequencyNoise * (maxFreq - minFreq);
	var mag 			= minMag + magNoise * (maxMag - minMag);
	
	for(var pod = 0; pod < nbPods; ++pod)
	{
		var n = Number(pod+1) / nbPods;
		
		var rColor0 = randomColor().getHex();
		var rColor1 = randomColor().getHex();
		
		var padRadius = radius * Number(pod) / nbPods;
		
		var flower = GenerateFlowerGeometry(padRadius, nbMeshSeg, frequency, mag, n * indep, rColor0, rColor1, -0.25, Number(pod) / nbPods * 0.85);
		flower.castShadow = true;
		flower.receiveShadow = true;
		flowerObjects.add(flower);
	}
	
	return flowerObjects;
}

//helper function to get URL parameters
function getUrlVars() 
{
	//https://html-online.com/articles/get-url-parameters-javascript/
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) 
	{
        vars[key] = value;
    });
    return vars;
}

function getUrlParam(parameter, defaultvalue)
{
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1)
	{
        urlparameter = getUrlVars()[parameter];
        }
    return urlparameter;
}

function generateRandomString()
{
	var randText = "";
	var possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 15; i++)
    randText += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));

	return randText;
}

//generate heart shape geom
function generateHeartShapeGeometry()
{
	var x = 0, y = 0;

	var heartShape = new THREE.Shape();

	heartShape.moveTo( x + 5, y + 5 );
	heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
	heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
	heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
	heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
	heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
	heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );
		
	var geom = new THREE.ShapeGeometry( heartShape );
	return geom;
}

function createParticlesCloud(systemRandom, size, transparent, opacity, vertexColors, sizeAttenuation, color)
{
	var geom 		= new THREE.Geometry();
	var material 	= new THREE.PointCloudMaterial({size: size, transparent: transparent, 
													opacity: opacity, vertexColors: vertexColors, 
													sizeAttenuation: sizeAttenuation, color: color}
												  );
	var range = 500;
	for (var i = 0; i < 15000; i++) 
	{
		var particle = new THREE.Vector3(systemRandom() * range - range / 2, systemRandom() * range - range / 2, systemRandom() * range - range / 2);
		
		particle.velocityY = 0.1 + systemRandom() / 5;
        particle.velocityX = (systemRandom() - 0.5) / 3;
        particle.velocityZ = (systemRandom() - 0.5) / 3;
		
		geom.vertices.push(particle);
		
		var color = new THREE.Color(0x00ff00);
		color.setHSL(color.getHSL().h, color.getHSL().s, systemRandom() * color.getHSL().l);
		
		geom.colors.push(color);
	}
	
	var cloud = new THREE.PointCloud(geom, material);
	cloud.sortParticles = true;
	
	return cloud;
	
}
