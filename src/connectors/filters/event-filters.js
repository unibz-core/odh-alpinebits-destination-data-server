const {
  parseDateString,
  getLangInIso6391,
  parsePointDistance,
} = require("./common");

function getEventFilterArray(request) {
  const { filter } = request.query;
  let filtersArray = [];

  if (filter) {
    for (let filterName of Object.getOwnPropertyNames(filter)) {
      switch (filterName) {
        case "lang": // langfilter
          filtersArray.push("langfilter=" + getLangInIso6391(filter.lang));
          break;
        case "nearPoint": {
          // latitude, longitude, and radius
          const { lat, lng, rad } = parsePointDistance(filter.nearPoint);
          if (lat && lng && rad) {
            filtersArray.push("latitude=" + lat);
            filtersArray.push("longitude=" + lng);
            filtersArray.push("radius=" + rad);
          }
          break;
        }
        case "categories": // topicfilter
          filtersArray.push(
            "topicfilter=" + getCategoriesAsBitmask(filter.categories)
          );
          break;
        case "startsBefore": // enddate
          filtersArray.push("enddate=" + parseDateString(filter.startsBefore));
          break;
        case "endsAfter": // begindate
          filtersArray.push("begindate=" + parseDateString(filter.endsAfter));
          break;
        case "updatedAfter": // updatefrom
          filtersArray.push(
            "updatefrom=" + parseDateString(filter.updatedAfter)
          );
          break;
        // Possible to be supported: orgfilter, odhtagfilter, searchfilter (requires better integration)
      }
    }
  }

  return filtersArray;
}

const eventCategoryMask = {
  "schema/BusinessEvent": 1, // 'Tagungen Vorträge'
  "schema/SportsEvent": 2, // 'Sport'
  "schema/FoodEvent": 4, // 'Gastronomie/Typische Produkte'
  "schema/TheaterEvent": 32, // 'Theater/Vorführungen'
  "schema/EducationEvent": 64, // 'Kurse/Bildung'
  "schema/MusicEvent": 128, // 'Musik/Tanz'
  "schema/Festival": 256, // 'Volksfeste/Festivals'
  "schema/VisualArts": 2048, // 'Ausstellungen/Kunst'
  "schema/ChildrensEvent": 4096, // 'Familie'
  "odh/tagungen-vortrage": 1, // 'schema/BusinessEvent',
  "odh/sport": 2, // 'schema/SportsEvent',
  "odh/gastronomie-typische-produkte": 4, // 'schema/FoodEvent',
  "odh/handwerk-brauchtum": 8,
  "odh/messen-markte": 16,
  "odh/theater-vorführungen": 32, // 'schema/TheatherEvent',
  "odh/kurse-bildung": 64, // 'schema/EducationEvent',
  "odh/musik-tanz": 128, // 'schema/MusicEvent',
  "odh/volksfeste-festivals": 256, // 'schema/Festival',
  "odh/wanderungen-ausflüge": 512,
  "odh/führungen-besichtigungen": 1024,
  "odh/ausstellungen-kunst": 2048, // 'schema/VisualArts',
  "odh/familie": 4096, // 'schema/ChildrensEvent',
};

function getCategoriesAsBitmask(categories) {
  if (Array.isArray(categories)) {
    let categoriesMasks = categories.map(
      (category) => eventCategoryMask[category]
    );
    return categoriesMasks.reduce((totalMask, currentMask) =>
      !totalMask ? currentMask : totalMask | currentMask
    );
  }
}

module.exports = {
  getEventFilterArray,
};
