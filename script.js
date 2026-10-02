// DOM Elements
const qrText = document.getElementById('qr-text');
const qrSize = document.getElementById('qr-size');
const colorDark = document.getElementById('color-dark');
const colorLight = document.getElementById('color-light');
const generateBtn = document.getElementById('generate-btn');
const qrcodeBox = document.getElementById('qrcode-box');
const downloadBtn = document.getElementById('download-btn');
const themeToggle = document.getElementById('theme-toggle');

// Default sample Instagram Reel link
qrText.value = '';

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const icon = themeToggle.querySelector('i');
    if (document.body.classList.contains('light-theme')) {
        icon.classList.replace('fa-sun', 'fa-moon');
    } else {
        icon.classList.replace('fa-moon', 'fa-sun');
    }
});

// Helper function to safely format text for QR encoding
function formatInputData(rawInput) {
    let text = rawInput.trim();
    if (!text) return '';

    // Standardize URL encoding while preserving protocol & parameters
    try {
        if (/^https?:\/\//i.test(text)) {
            // Encode special characters like spaces or UTF8 characters safely
            return encodeURI(decodeURI(text));
        }
    } catch (e) {
        // Fallback to raw text
    }
    return text;
}

// Generate QR Code Function
function generateQRCode() {
    const rawInput = qrText.value;
    const cleanText = formatInputData(rawInput);
    // Clear previous output
    qrcodeBox.innerHTML = '';
    const size = parseInt(qrSize.value);

    try {
        // Method 1: Client-side QRCode.js with Low Correction Level (handles massive URLs easily)
        new QRCode(qrcodeBox, {
            text: cleanText,
            width: size,
            height: size,
            colorDark: colorDark.value,
            colorLight: colorLight.value,
            correctLevel: QRCode.CorrectLevel.L // Low error correction = handles ultra-long URLs without breaking
        });
    } catch (err) {
        // Method 2: Fallback to High-Speed QR API if string is extremely complex
        const fgColor = colorDark.value.replace('#', '');
        const bgColor = colorLight.value.replace('#', '');
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(cleanText)}&color=${fgColor}&bgcolor=${bgColor}`;

        const img = document.createElement('img');
        img.src = apiUrl;
        img.alt = 'QR Code';
        img.width = size;
        img.height = size;
        qrcodeBox.appendChild(img);
    }
}

// Download QR Code Function
function downloadQRCode() {
    const img = qrcodeBox.querySelector('img');
    const canvas = qrcodeBox.querySelector('canvas');

    let imageURI = '';

    if (canvas) {
        imageURI = canvas.toDataURL('image/png');
        triggerDownload(imageURI);
    } else if (img && img.src) {
        if (img.src.startsWith('data:')) {
            triggerDownload(img.src);
        } else {
            // Fetch online image blob for API fallback
            fetch(img.src)
                .then(res => res.blob())
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    triggerDownload(blobUrl);
                })
                .catch(() => alert('Image download failed. Please try again.'));
        }
    } else {
        alert('QR Code generation complete nahi hua hai.');
    }
}

function triggerDownload(uri) {
    const link = document.createElement('a');
    link.href = uri;
    link.download = 'universal-qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event Listeners
generateBtn.addEventListener('click', generateQRCode);
downloadBtn.addEventListener('click', downloadQRCode);

// Auto generate on page load
window.addEventListener('load', generateQRCode);
