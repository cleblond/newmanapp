let lastFocusedInput = null; // Variable to track the last focused input field

// Dragging control
let draggingSubstituent = null;
let offsetX = 0, offsetY = 0;

// Store substituent positions (both front and back)
let substituents = {
    front: [
        { label: document.getElementById('front1').value, x: 0, y: 0, dragging: false },
        { label: document.getElementById('front2').value, x: 0, y: 0, dragging: false },
        { label: document.getElementById('front3').value, x: 0, y: 0, dragging: false }
    ],
    back: [
        { label: document.getElementById('back1').value, x: 0, y: 0, dragging: false },
        { label: document.getElementById('back2').value, x: 0, y: 0, dragging: false },
        { label: document.getElementById('back3').value, x: 0, y: 0, dragging: false }
    ]
};

// Initialize the canvas and context
const canvas = document.getElementById('projectionCanvas');
const ctx = canvas.getContext('2d');

// Function to draw the projection and substituents
function drawProjection() {


    const frontSubstituents = [
        document.getElementById('front1').value,
        document.getElementById('front2').value,
        document.getElementById('front3').value,
    ];
    const backSubstituents = [
        document.getElementById('back1').value,
        document.getElementById('back2').value,
        document.getElementById('back3').value,
    ];
    const conformation = document.getElementById('conformation').value;

    // Set rotation for staggered (60 degrees) or eclipsed (0 degrees)
    const rotation = conformation === 'staggered' ? 60 : 0;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set center of projection
    const centerX = 200;
    const centerY = 200;
    const bondLength = 60;
    const substituentOffset = 10; // Offset to position substituents closer to the end
    const fontSize = '16px'; // Set font size
    const circleRadius = 50;

    // Draw back carbon circle with dashed line
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
    ctx.setLineDash([5, 5]); // Dashed circle
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash for other drawings

    // Draw back bonds and substituents
    drawBonds(ctx, centerX, centerY, bondLength, backSubstituents, rotation, false, true, true, substituentOffset, fontSize, circleRadius, true, 'back');

    // Draw front carbon dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.fill();

    // Draw front bonds and substituents with solid lines
    drawBonds(ctx, centerX, centerY, bondLength, frontSubstituents, 0, true, false, false, substituentOffset, fontSize, circleRadius, false, 'front');
}

// Function to draw bonds and place substituents
function drawBonds(ctx, cx, cy, bondLength, substituentsArray, rotation, isFront = false, isDashed = false, isBack = false, substituentOffset = 10, fontSize = '16px', circleRadius = 50, hideBehindCircle = false, positionKey = 'front') {
    // Define base angles for 120-degree separation
    const baseAngles = [0, 120, 240].map(angle => angle * Math.PI / 180);

    // Adjust angles based on whether they are front or back bonds
    const angles = isBack ? adjustBackAngles(rotation) : (isFront ? adjustFrontAngles() : baseAngles);

    // Set line style
    ctx.setLineDash(isDashed ? [5, 5] : []); // Dashed if isDashed is true

    // Set font size and text alignment
    ctx.font = `${fontSize} Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 3; i++) {
        const angle = angles[i];
        const xEnd = cx + bondLength * Math.cos(angle);
        const yEnd = cy + bondLength * Math.sin(angle);

        if (hideBehindCircle && isBack) {
            // Draw only the portion of the bond outside the circle
            drawPartialBond(ctx, cx, cy, xEnd, yEnd, circleRadius);
        } else {
            // Draw the full bond if not hiding behind the circle
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();
        }

        // Update substituent positions if it's not being dragged
        if (!substituents[positionKey][i].dragging) {
            substituents[positionKey][i].x = cx + (bondLength + substituentOffset) * Math.cos(angle);
            substituents[positionKey][i].y = cy + (bondLength + substituentOffset) * Math.sin(angle);
        }

        // Draw substituent at updated position
        ctx.fillText(substituents[positionKey][i].label, substituents[positionKey][i].x, substituents[positionKey][i].y);
    }
}

// Function to draw partial bond that is visible outside the circle
function drawPartialBond(ctx, cx, cy, xEnd, yEnd, circleRadius) {
    // Calculate intersection points with the circle
    const dx = xEnd - cx;
    const dy = yEnd - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const t = circleRadius / distance;

    const xIntersect = cx + t * dx;
    const yIntersect = cy + t * dy;

    // Draw only the part of the bond that is outside the circle
    ctx.beginPath();
    ctx.moveTo(xIntersect, yIntersect);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
}

// Add mouse event listeners for dragging functionality
canvas.addEventListener('mousedown', (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    // Check if any substituent was clicked
    draggingSubstituent = getClickedSubstituent(mouseX, mouseY);
    if (draggingSubstituent) {
        offsetX = mouseX - draggingSubstituent.x;
        offsetY = mouseY - draggingSubstituent.y;
        draggingSubstituent.dragging = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (draggingSubstituent && draggingSubstituent.dragging) {
        const mouseX = e.offsetX;
        const mouseY = e.offsetY;
        draggingSubstituent.x = mouseX - offsetX;
        draggingSubstituent.y = mouseY - offsetY;

        // Redraw canvas with updated positions
        drawProjection();
    }
});

canvas.addEventListener('mouseup', () => {
    if (draggingSubstituent) {
        draggingSubstituent.dragging = false;
        draggingSubstituent = null;
    }
});

// Function to detect clicked substituent
function getClickedSubstituent(x, y) {
    for (const positionKey in substituents) {
        for (const sub of substituents[positionKey]) {
            const width = ctx.measureText(sub.label).width;
            const height = 16; // Font size
            if (x >= sub.x - width / 2 && x <= sub.x + width / 2 &&
                y >= sub.y - height / 2 && y <= sub.y + height / 2) {
                return sub;
            }
        }
    }
    return null;
}

// Function to adjust angles for back bonds with rotation
function adjustBackAngles(rotation) {
    const baseAngles = [0, 120, 240].map(angle => angle * Math.PI / 180);
    const baseAngle3 = -Math.PI / 2;
    const angles = [
        baseAngle3,
        baseAngle3 + Math.PI * 2 / 3,
        baseAngle3 + Math.PI * 4 / 3
    ];
    return angles.map(angle => angle + (rotation * Math.PI / 180));
}

// Function to adjust angles for front bonds with one vertical
drawProjection();
