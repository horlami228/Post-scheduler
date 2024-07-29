// This function will be used to get the buffer data
import axios from "axios";
import axiosRetry from "axios-retry";

// configure axios to retry requests
axiosRetry(axios, {
  retries: 10, // Number of retry attempts
  retryDelay: (retryCount) => {
    console.log(`Retry attempt: ${retryCount}`);
    return retryCount * 1000; // Exponential back-off (1000ms = 1 second)
  },
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error?.response?.status ?? 0) >= 500
    );
  },
});


const getImage = async (webContentLink: string) => {
  try {
    const response = await axios.get(webContentLink, {
      responseType: "arraybuffer",
    });
    // return the response
   return response.data;
  } catch (error: any) {
    console.error(error.message);
    return null;
  }
};

export default getImage;
