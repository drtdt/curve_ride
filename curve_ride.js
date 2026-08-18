
import * as THREE from "three/webgpu";
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const renderer = new THREE.WebGPURenderer({ anitalias: true });
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(0x000000, 1);
renderer.setAnimationLoop( animationLoop );
document.body.appendChild(renderer.domElement);

window.addEventListener( "resize", (event) => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix( );
    renderer.setSize( innerWidth, innerHeight );
});

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(30, WIDTH / HEIGHT);
camera.position.set( 0, 20, 40 );
//camera.position.z = 50;
camera.lookAt( scene.position );
scene.add(camera);

var hemisphereLight = new THREE.HemisphereLight( 'crimson', 'yellow', 0.3 );
scene.add( hemisphereLight );

var light = new THREE.PointLight( 'white', 0.7 );
scene.add( light );

//const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshLambertMaterial({color: 0x00ff00, emissive: 0x112244});
material.wireframe = true;
//const cube = new THREE.Mesh(boxGeometry, material);
//scene.add(cube);
//cube.rotation.set(0.4, 0.2, 0);

// curve for the tube trajectory
function trajectory (u, target)
{
 	u *= 2*Math.PI;
				
 	target.set( 
 	    5*Math.sin(2*u) - 4*Math.cos(1*u), 
 		1*Math.sin(7*u) + 2*Math.sin(4*u), 
 		11*Math.cos(1*u) + 4*Math.sin(2*u)
 	);
}


// texture
// var map = new THREE.TextureLoader().load( 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAACCAMAAAAOwC77AAAABlBMVEUAAAD/1iGA9P/lAAAAEElEQVQIW2NkQAOMBPgYAgAA5gAF95+gaQAAAABJRU5ErkJggg==' );
// 		map.repeat.set( 200, 1 );
// 		map.wrapS = THREE.RepeatWrapping;


// building the tube

// a function that generates a function for a circular
// segment from angle FROM to angle TO (in degrees)

var normal = new THREE.Vector3();
var tangent = new THREE.Vector3();

function arcPoint( from, to, radius=1 )
{
	return function ( u, v, target )
	{
			trajectory( u, target );
			trajectory( u+0.001, tangent );
	
			tangent.sub( target );
			normal.set( -tangent.z, 0, tangent.x );
			normal.normalize( );

			v = THREE.MathUtils.mapLinear( v, 0, 1, Math.PI*from/180, Math.PI*to/180 );
			target.addScaledVector( normal, radius*Math.cos(v) );
			target.y += radius*Math.sin(v);
	}
}


// generate 4 segments of the tube

// the floor of the tube has precision 1, so it is drawn as a flat surface
var floor = new THREE.Mesh(
    new ParametricGeometry( arcPoint(230,310), 500, 1 ),
    material
    //new THREE.MeshLambertMaterial( {side: THREE.DoubleSide, map: map})
);


// left wall is from 140 to 220 degrees
var wallLeft = new THREE.Mesh(
				new ParametricGeometry( arcPoint(140,220), 500, 15 ),
                material
				//new THREE.MeshLambertMaterial( {side: THREE.DoubleSide, map: map})
		);


// // right wall is from -40 to 40 degrees
// var wallRight = new THREE.Mesh(
// 				new ParametricGeometry( arcPoint(-40,40), 500, 15 ),
// 				new THREE.MeshLambertMaterial( {side: THREE.DoubleSide, map: map})
// 		);

// // ceiling is from 50 to 130 degrees
// var ceiling = new THREE.Mesh(
// 				new ParametricGeometry( arcPoint(50,130), 500, 15 ),
// 				new THREE.MeshLambertMaterial( {side: THREE.DoubleSide, map: map})
// 		);

			
scene.add( floor, wallLeft/*, wallRight, ceiling */);



function animationLoop( t )
{  
	// move the camera long the tube
	trajectory( t/20000, camera.position );
	trajectory( t/20000+0.05, tangent );
	tangent.y -= 0.2;
	camera.lookAt( tangent );
	
	light.position.copy( camera.position );
    renderer.render( scene, camera );
}
