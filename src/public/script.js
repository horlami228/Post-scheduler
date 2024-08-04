document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('media');
  const fileCount = document.getElementById('file-count');
  const spinner = document.getElementById('spinner');
  const message = document.getElementById('message');

  input.addEventListener('change', function() {
    if (this.files.length > 0) {
      fileCount.textContent = `Selected ${this.files.length} file(s)`;
    } else {
      fileCount.textContent = 'No file selected';
    }
  });

  document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Show the spinner
    spinner.style.display = 'inline-block';

    
    const form = event.target;
    const formData = new FormData(form);

    fetch(form.action, {
      method: form.method,
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.msg) {
        message.textContent = data.msg;
        message.style.color = 'green';
        // alert(data.msg); // Show success message
      } else {
        message.textContent = 'Upload successful';
        message.style.color = 'green';
        // alert('Upload successful'); // Fallback success message
      }

      // Clear the form fields
      form.reset();
      fileCount.textContent = 'No file selected'; // Reset file count display
      
      // Manually clear the file input (in case form.reset() does not work as expected)
      const fileInput = document.getElementById('media');
      fileInput.value = ''; // Clear the file input value

      // Hide the spinner
      spinner.style.display = 'none';
      // Reset file count display
      fileCount.textContent = 'No file selected'; 
    })
    .catch(error => {
      console.error('Error:', error);
      message.textContent = 'An error occurred during the upload';
      message.style.color = 'red';
      // alert('An error occurred during the upload');

      // Hide the spinner
      spinner.style.display = 'none';
    });
  });
});
