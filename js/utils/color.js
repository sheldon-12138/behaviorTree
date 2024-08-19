// hue色相，hex16进制
function hueToRgb(hue) {
    const h = hue / 360; // Normalize hue to the range [0, 1]
    const s = 1; // You can set saturation and lightness values as needed
    const l = 0.5;

    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const x = chroma * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - chroma / 2;

    let r, g, b;
    if (0 <= h && h < 1 / 6) {
        [r, g, b] = [chroma, x, 0];
    } else if (1 / 6 <= h && h < 2 / 6) {
        [r, g, b] = [x, chroma, 0];
    } else if (2 / 6 <= h && h < 3 / 6) {
        [r, g, b] = [0, chroma, x];
    } else if (3 / 6 <= h && h < 4 / 6) {
        [r, g, b] = [0, x, chroma];
    } else if (4 / 6 <= h && h < 5 / 6) {
        [r, g, b] = [x, 0, chroma];
    } else {
        [r, g, b] = [chroma, 0, x];
    }

    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    ];
};

function hueToHex(hue) {
    const [r, g, b] = hueToRgb(hue)
    return rgbToHex(r, g, b);
};

function rgbToHex(r, g, b) {
    const componentToHex = (c) => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

function hexToHue(hex) {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHue(r, g, b);
}

function hexToRgb(hex) {
    hex = hex.replace(/^#/, ''); // Remove leading '#' if present
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
}

function rgbToHue(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let hue;

    if (max === min) {
        hue = 0; // Gray, no hue
    } else if (max === r) {
        hue = ((g - b) / (max - min)) % 6;
    } else if (max === g) {
        hue = (2 + (b - r) / (max - min)) % 6;
    } else {
        hue = (4 + (r - g) / (max - min)) % 6;
    }

    hue *= 60; // Convert to degrees
    if (hue < 0) {
        hue += 360; // Ensure hue is positive
    }
    return hue;
}


export default {
    hueToRgb,
    hueToHex,
    rgbToHex,
    hexToHue,
    hexToRgb,
    rgbToHue
}