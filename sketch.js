let walls = [];
let particle;

let wallCount = 7; // Increased from 5 to 7 (2 more arches)
let rayStep = 2; // Angle step for rays (lower = more rays, adjust for performance)
let arcStep = 0.05; // Step size for approximating arcs (adaptive resolution)
let rotationSpeed = 0.002; // Speed of rotation
let speedMultiplier = 1; // Speed multiplier for rotation

let minDistanceFromSource = 100; // Minimum distance from the light source
let maxDistanceFromSource = 150; // Maximum distance from the light source

function setup() {
  createCanvas(500, 500, P2D); // Use P2D renderer for better performance
  pixelDensity(1); // Reduce pixel density for faster rendering

  // Create random arcs at a safe distance away from the light source
  for (let i = 0; i < wallCount; i++) {
    let angle = random(TWO_PI); // Random angle for position around the light source
    let distance = random(minDistanceFromSource, maxDistanceFromSource); // Random distance within the safe range
    let x = width / 2 + cos(angle) * distance; // X position
    let y = height / 2 + sin(angle) * distance; // Y position
    let w = random(150, 300); // Larger arc width
    let h = random(150, 300); // Larger arc height
    let startAngle = random(0, TWO_PI / 2); // Start angle
    let endAngle = startAngle + random(PI / 4, PI); // End angle
    walls.push(new Arch(x, y, w, h, startAngle, endAngle)); // Add arcs to the array
  }

  // Create particle (light source)
  particle = new Particle();

  noCursor(); // Hide cursor

  // Add a button to enhance rotation speed
  let speedButton = createButton("Increase Rotation Speed");
  speedButton.position(10, 10); // Position the button
  speedButton.mousePressed(() => {
    speedMultiplier *= 1.5; // Increase speed multiplier
  });
}

function draw() {
  background(0); // Black background

  // Adjust rotation speed based on the speed multiplier
  let rotationAngle = map(mouseX, 0, width, 0, TWO_PI) * rotationSpeed * speedMultiplier;

  // Draw walls (now arcs) with the controlled rotation
  for (let wall of walls) {
    wall.rotate(rotationAngle); // Apply rotation to each arc
    wall.show();
  }

  // The particle remains fixed at the center, no mouse interaction for position
  particle.show();
  particle.look(walls);
}

// Arch Class
class Arch {
  constructor(x, y, w, h, startAngle, endAngle) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.startAngle = startAngle;
    this.endAngle = endAngle;

    // Ensure the arc is a safe distance from the light source
    this.ensureSafeDistance();
  }

  // Adjust the position to maintain a safe distance from the light source
  ensureSafeDistance() {
    let centerX = width / 2;
    let centerY = height / 2;
    let distance = dist(this.x, this.y, centerX, centerY);

    if (distance < minDistanceFromSource) {
      let angle = atan2(this.y - centerY, this.x - centerX);
      this.x = centerX + cos(angle) * minDistanceFromSource;
      this.y = centerY + sin(angle) * minDistanceFromSource;
    }
  }

  rotate(angle) {
    // Rotate the arc's start and end angles based on the given angle
    this.startAngle += angle;
    this.endAngle += angle;
  }

  show() {
    noFill();
    stroke(255); // Arc color
    strokeWeight(2);
    arc(this.x, this.y, this.w, this.h, this.startAngle, this.endAngle);
  }

  // Efficient intersection with adaptive resolution
  intersect(ray) {
    let closest = null;
    let record = Infinity;

    // Adjust resolution dynamically based on arc length
    let step = max(arcStep, (this.endAngle - this.startAngle) / 50);
    for (let angle = this.startAngle; angle <= this.endAngle; angle += step) {
      let px = this.x + (this.w / 2) * cos(angle);
      let py = this.y + (this.h / 2) * sin(angle);

      // Check if the ray intersects this point
      const d = this.checkRayIntersection(ray, createVector(px, py));
      if (d && d < record) {
        record = d;
        closest = createVector(px, py);
      }
    }

    return closest;
  }

  checkRayIntersection(ray, point) {
    let toPoint = p5.Vector.sub(point, ray.pos);
    let projection = toPoint.dot(ray.dir);
    if (projection > 0) {
      let projectedPoint = p5.Vector.add(ray.pos, p5.Vector.mult(ray.dir, projection));
      let distance = p5.Vector.dist(point, projectedPoint);
      if (distance < 1) return projection; // Intersection within threshold
    }
    return null;
  }
}

// Ray Class
class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  show() {
    stroke(255);
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * 10, this.dir.y * 10);
    pop();
  }

  cast(wall) {
    return wall.intersect(this); // Use arc intersection
  }
}

// Particle Class
class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2); // Light source stays at the center
    this.rays = [];
    for (let a = 0; a < 360; a += rayStep) { // Emit rays in all directions
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }

  look(walls) {
    for (let ray of this.rays) {
      let closest = null;
      let record = Infinity;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }
      if (closest) {
        stroke(255, 100); // Ray color
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 4); // Light source
    for (let ray of this.rays) {
      ray.show();
    }
  }
}
