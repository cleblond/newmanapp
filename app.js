function drawProjection() {
    const canvas = document.getElementById('projectionCanvas');
    const ctx = canvas.getContext('2d');
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
    drawBonds(ctx, centerX, centerY, bondLength, backSubstituents, rotation, false, true, true, substituentOffset, fontSize, circleRadius, true);

    // Draw front carbon dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.fill();

    // Draw front bonds and substituents with solid lines
    drawBonds(ctx, centerX, centerY, bondLength, frontSubstituents, 0, true, false, false, substituentOffset, fontSize, circleRadius, false);
}

// Function to draw bonds and place substituents
function drawBonds(ctx, cx, cy, bondLength, substituents, rotation, isFront = false, isDashed = false, isBack = false, substituentOffset = 10, fontSize = '16px', circleRadius = 50, hideBehindCircle = false) {
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

        // Draw substituent exactly at the end of the bond
        const labelX = cx + (bondLength + substituentOffset) * Math.cos(angle);
        const labelY = cy + (bondLength + substituentOffset) * Math.sin(angle);
        ctx.fillText(substituents[i], labelX, labelY);
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

// Function to adjust angles for back bonds with rotation
function adjustBackAngles(rotation) {
    // Base angles for 120-degree separation
    const baseAngles = [0, 120, 240].map(angle => angle * Math.PI / 180);

    // Ensure back substituent 3 starts pointing straight down
    const baseAngle3 = -Math.PI / 2; // 90 degrees pointing down

    // Calculate angles for back substituents
    const angles = [
        baseAngle3,
        baseAngle3 + Math.PI * 2 / 3,  // 120 degrees from substituent 3
        baseAngle3 + Math.PI * 4 / 3   // 240 degrees from substituent 3
    ];

    // Rotate all back angles by the given rotation
    return angles.map(angle => angle + (rotation * Math.PI / 180));
}

// Function to adjust angles for front bonds with one vertical
function adjustFrontAngles() {
    // Set one bond vertical, others spaced 120 degrees
    const verticalAngle = -Math.PI / 2; // 90 degrees pointing up
    return [
        verticalAngle,
        verticalAngle + (2 * Math.PI / 3),
        verticalAngle + (4 * Math.PI / 3) // Ensuring the third bond is also correctly placed
    ];
}

function exportCroppedImage() {
    const canvas = document.getElementById('projectionCanvas');
    const ctx = canvas.getContext('2d');
    
    // Define the cropping region
    const cropX = 50; // X-coordinate of the cropping rectangle
    const cropY = 50; // Y-coordinate of the cropping rectangle
    const cropWidth = 300; // Width of the cropping rectangle
    const cropHeight = 300; // Height of the cropping rectangle

    // Create a temporary canvas to hold the cropped image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw the cropped region onto the temporary canvas
    tempCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    // Convert the temporary canvas to an image
    const dataURL = tempCanvas.toDataURL('image/png');

    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'newman_projection.png';
    link.click();
}



// Initialize with default drawing
drawProjection();

