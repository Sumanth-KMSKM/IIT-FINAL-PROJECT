document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('crop-image');
  const resultDiv = document.getElementById('result');

  // Check if a file is uploaded
  if (!fileInput.files[0]) {
    resultDiv.innerHTML = '<p style="color: red;">Please upload an image.</p>';
    return;
  }

  // Show processing message
  resultDiv.innerHTML = '<p>Processing your image...</p>';

  // Convert the image to Base64
  const reader = new FileReader();
  reader.readAsDataURL(fileInput.files[0]);
  reader.onload = async () => {
    const base64Image = reader.result.split(',')[1]; // Remove the data URL prefix

    try {
      // Call the Google Cloud Vision API
      const response = await fetch(
        'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyASfgdZq40fAth4OKZvRaUEKGZTSVp3ysU', // Replace YOUR_API_KEY with your actual API key
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Image,
                },
                features: [
                  {
                    type: 'LABEL_DETECTION', // Detects labels in the image
                    maxResults: 5, // Adjust the number of results as needed
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      // Display the results
      if (data.responses && data.responses.length > 0 && data.responses[0].labelAnnotations) {
        const labels = data.responses[0].labelAnnotations
          .map((label) => label.description)
          .join(', ');
        resultDiv.innerHTML = <strong>Detected Labels:</strong> ${labels};
      } else {
        resultDiv.innerHTML = '<p>No results found.</p>';
      }
    } catch (error) {
      console.error(error);
      resultDiv.innerHTML = '<p style="color: red;">Error analyzing image. Please try again.</p>';
    }
  };
});
