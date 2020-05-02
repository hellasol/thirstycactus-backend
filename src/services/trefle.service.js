const fetch = require("node-fetch");
const config = require("../config");

module.exports = {
  /**
   * Detect ingformation about plant
   * @param {String} query label with plant name
   * @returns {String[]}
   */
  async getPlantsByName(query) {
    const response = await fetch(
      `https://trefle.io/api/species?token=${config.TREFLE_TOKEN}&q=${query}&page_size=100`
    );
    const plants = await response.json();

    return Promise.all(plants.map((plant) => this.getPlant(plant.id)));
  },

  async getPlant(id) {
    const response = await fetch(
      `https://trefle.io/api/species/${id}?token=${config.TREFLE_TOKEN}`
    );
    return response.json();
  },

  async enrichPlant(plant) {
    if (!plant.trefleid) {
      throw new Error("no trefle id");
    }
    const trefleData = await this.getPlant(plant.trefleid);
    plant.commonName = trefleData.common_name;
    plant.scientificName = trefleData.scientific_name;
    plant.familyName = trefleData.family_common_name;
    plant.growth = trefleData.growth;
    console.log(plant);
  },
};
