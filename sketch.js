let ellipses = [];
let ellipseS = 90;
let gridCols = 5;
let gridRows = 5;
let spacing = 100;
let font;
let firstEllipseClicked = false;

function setup() {
  createCanvas(500, 500);
  colorMode(HSB, 360, 100, 100, 1);
  noCursor();

  // Add the first ellipse at the top-left corner of the grid
  let x = spacing / 2;
  let y = spacing / 2;
  ellipses.push({ x, y });
}

function draw() {
  background(220);

  // Draw all ellipses in their positions with centered text
  noStroke();
  fill(0, 80, 90);
  for (let i = 0; i < ellipses.length; i++) {
    let pos = ellipses[i];
    ellipse(pos.x, pos.y, ellipseS);

    // Set the text for the first ellipse
    fill(0, 0, 90);
    textSize(ellipseS / 10);
    textAlign(CENTER, CENTER);
    if (i === 0 && firstEllipseClicked) {
      text("Reset", pos.x, pos.y);
    } else {
      text("Click Here", pos.x, pos.y);
    }
  }

  // Follow mouse with small ellipse
  fill(0, 0, 100);
  ellipse(mouseX, mouseY, 20);
}

function mousePressed() {
  // Check if the first ellipse is clicked
  let firstEllipse = ellipses[0];
  let d = dist(mouseX, mouseY, firstEllipse.x, firstEllipse.y);
  if (d < ellipseS / 2) {
    if (firstEllipseClicked) {
      // Reset the grid if the first ellipse shows "Reset"
      resetEllipses();
    } else {
      // Change the text to "Reset" on the first click
      firstEllipseClicked = true;
    }
    return; // Stop here to avoid adding a new random ellipse
  }

  // Add a new ellipse in a random position in the grid
  addRandomEllipse();
}

function addRandomEllipse() {
  // Pick a random column and row within grid limits
  let col = floor(random(gridCols));
  let row = floor(random(gridRows));

  // Calculate the position based on grid
  let x = col * spacing + spacing / 2;
  let y = row * spacing + spacing / 2;

  // Add the new ellipse position to the list
  ellipses.push({ x, y });
}

function resetEllipses() {
  // Clear all ellipses except the first one and reset its state
  ellipses = [ellipses[0]];
  firstEllipseClicked = false;
}
