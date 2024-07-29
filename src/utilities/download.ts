import axios from "axios";

const download = async (uri: string, callback: any) => {
    axios({
        url: uri,
        responseType: 'arraybuffer'
      })
        .then(response => {
          callback(null, response.data);
        })
        .catch(error => {
          callback(error);
    });
}

export default download;
