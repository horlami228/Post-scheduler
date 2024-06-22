// This function will be used to get the buffer data
import axios from "axios";

const getImage = async (webContentLink: string) => {
  try {
    const response = await axios.get(webContentLink, {
      responseType: "arraybuffer",
    });
    // return the response
    return response.data;
  } catch (error: any) {
    console.error(error.message);
  }
};

export default getImage;
