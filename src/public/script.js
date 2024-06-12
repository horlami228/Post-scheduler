document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('media');
    const fileCount = document.getElementById('file-count');
  
    input.addEventListener('change', function() {
      if (this.files.length > 0) {
        fileCount.textContent = `Selected ${this.files.length} file(s)`;
      } else {
        fileCount.textContent = 'No file selected';
      }
    });
  });
  