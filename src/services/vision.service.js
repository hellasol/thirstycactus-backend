const fetch = require("node-fetch");
const config = require("../config");

module.exports = {
    /**
     * Detect Labels of an Image 
     * @param {String} imageUri uri of the image to detect labels
     * @returns {String[]}
     */
  async detectLabels(imageUri) {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${config.GOOGLE_VISION_TOKEN}`,
      {
        method: "POST",
        body: JSON.stringify({
          requests: [
            {
              features: [
                {
                  type: "LABEL_DETECTION",
                  maxResults: 10
                }
              ],
              image: {
                source: {
                  imageUri
                }
              }
            }
          ]
        }),
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    const body = await response.json();
    const labelAnnotations = body.responses[0].labelAnnotations;
    return labelAnnotations.map(la => la.description);
  }
};