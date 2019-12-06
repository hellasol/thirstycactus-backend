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
       `https://trefle.io/api/plants?token=${config.TREFLE_TOKEN}&q=${query}&page_size=5`
    );
    const plants = await response.json();
    // for(const plant of plants){
    //     Object.assign(plant, await this.getPlant(plant.id))
    // }
    
    return Promise.all(
        plants.map(
            plant => this.getPlant(plant.id)
            )
        );
    
  },

  async getPlant(id) {
    const response = await fetch(
       `https://trefle.io/api/plants/${id}?token=${config.TREFLE_TOKEN}`
    );
    const body = await response.json();
    return body;
  }
};