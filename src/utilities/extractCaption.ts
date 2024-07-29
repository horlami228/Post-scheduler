// Function to extract captions

function extractCaptions(text: string) {
    const sections = text.split(/For LinkedIn:|For Twitter:/).map(section => section.trim());
    const linkedinCaption = sections[1] || '';
    const twitterCaption = sections[2] || '';
  
    return {
      linkedin: linkedinCaption,
      twitter: twitterCaption
    };
  }

  export default extractCaptions;