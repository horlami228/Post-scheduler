document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('media');
  const fileCount = document.getElementById('file-count');
  const spinner = document.getElementById('spinner');
  const message = document.getElementById('message');

  // input.addEventListener('change', function() {
  //   const fileCount = this.files.length;
  //   document.getElementById('file-count').textContent = `${fileCount} file(s) selected`;
  // });

  input.addEventListener('change', function() {
    // Update the file count display when files are selected
    const count = this.files.length;
    fileCount.textContent = `${count} file(s) selected`;

    // Check if more than 4 files are selected and alert the user
    if (count > 4) {
      alert('You can only upload a maximum of 4 files.');
      input.value = ''; // Clear the file input
      fileCount.textContent = 'No file selected';
    }
  });

  document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Show the spinner
    spinner.style.display = 'inline-block';

    const form = event.target;
    const formData = new FormData();
    const files = document.getElementById('media').files;

    // Check if more than 4 files are selected
    if (files.length > 4) {
      alert('You can only upload a maximum of 4 files.');
      spinner.style.display = 'none'; // Hide spinner if validation fails
      return;
    }

    // Append files to formData
    for (let i = 0; i < files.length; i++) {
      formData.append('media', files[i]);
    }

    // Append other form fields
    formData.append('description', document.getElementById('description').value);

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
      } else {
        message.textContent = 'Upload successful';
        message.style.color = 'green';
      }

      // Clear the form fields
      form.reset();
      fileCount.textContent = 'No file selected'; // Reset file count display

      // Manually clear the file input (in case form.reset() does not work as expected)
      input.value = ''; // Clear the file input value

      // Hide the spinner
      spinner.style.display = 'none';
    })
    .catch(error => {
      console.error('Error:', error);
      message.textContent = 'An error occurred during the upload';
      message.style.color = 'red';
      spinner.style.display = 'none';
    });
  });
});
