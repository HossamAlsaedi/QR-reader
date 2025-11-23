        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const previewContainer = document.getElementById('previewContainer');
        const imagePreview = document.getElementById('imagePreview');
        const status = document.getElementById('status');
        const result = document.getElementById('result');
        const resultContent = document.getElementById('resultContent');
        const openUrlBtn = document.getElementById('openUrlBtn');

        let lastDetectedData = '';

        function updateStatus(message, type = '') {
            status.textContent = message;
            status.className = `status ${type}`;
            status.style.display = 'block';
        }

        function hideStatus() {
            status.style.display = 'none';
        }

        function showResult(data) {
            lastDetectedData = data;
            resultContent.textContent = data;
            result.style.display = 'block';
            
            // Check if it's a URL
            const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
            if (urlPattern.test(data)) {
                openUrlBtn.style.display = 'inline-flex';
            } else {
                openUrlBtn.style.display = 'none';
            }
            
            updateStatus('QR Code decoded successfully!', 'success');
        }

        function processImage(file) {
            if (!file.type.startsWith('image/')) {
                updateStatus('Please select a valid image file.', 'error');
                return;
            }

            updateStatus('Processing image...', 'processing');

            // Show preview first
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                previewContainer.style.display = 'block';
                
                // Check if html5-qrcode library is available
                if (typeof Html5Qrcode === 'undefined') {
                    updateStatus('QR library failed to load. Please refresh the page and try again.', 'error');
                    return;
                }

                updateStatus('Analyzing image for QR codes...', 'processing');

                // Use html5-qrcode library to scan the file
                const html5QrCode = new Html5Qrcode("reader");
                
                // Use the scanFile method from html5-qrcode
                html5QrCode.scanFile(file, /* showImage= */ false)
                .then(decodedText => {
                    // Success callback - QR code found
                    showResult(decodedText);
                })
                .catch(err => {
                    // Error callback - no QR code found or other error
                    console.log('QR scan error:', err);
                    updateStatus(`No QR code detected. Try with a clearer image or better lighting. Error: ${err}`, 'error');
                });
            };
            reader.readAsDataURL(file);
        }

        // Upload area click
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                processImage(files[0]);
            }
        });

        // Drag and drop functionality
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                processImage(files[0]);
            }
        });

        // Action functions
        function copyToClipboard() {
            navigator.clipboard.writeText(lastDetectedData).then(() => {
                updateStatus('Content copied to clipboard!', 'success');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = lastDetectedData;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                updateStatus('Content copied to clipboard!', 'success');
            });
        }

        function openAsUrl() {
            if (lastDetectedData) {
                window.open(lastDetectedData, '_blank');
            }
        }

        function clearResult() {
            result.style.display = 'none';
            previewContainer.style.display = 'none';
            fileInput.value = '';
            lastDetectedData = '';
            hideStatus();
        }

function testWithSample() {
    updateStatus('Testing QR code library with sample image...', 'processing');

    if (typeof Html5Qrcode === 'undefined') {
        updateStatus('❌ ISSUE FOUND: html5-qrcode library failed to load.', 'error');
        return;
    }

    // Show preview of the sample image
    const testImagePath = "frame.png";
    imagePreview.src = testImagePath;
    previewContainer.style.display = 'block';

    // Fetch the sample image as a File object to scan it properly
    fetch(testImagePath)
        .then(res => res.blob())
        .then(blob => {
            const file = new File([blob], "sample.png", { type: blob.type });
            
            const html5QrCode = new Html5Qrcode("reader");

            html5QrCode.scanFile(file, false)
                .then(decodedText => {
                    showResult(decodedText);
                })
                .catch(err => {
                    console.error(err);
                    updateStatus("Sample QR code could not be scanned. Error: " + err, "error");
                });
        })
        .catch(err => {
            console.error(err);
            updateStatus("Could not load sample image. Make sure frame.png exists.", "error");
        });
}


        // Initialize
        hideStatus();
        
        // Add a hidden div for the Html5Qrcode scanner
        const readerDiv = document.createElement('div');
        readerDiv.id = 'reader';
        readerDiv.style.display = 'none';
        document.body.appendChild(readerDiv);
