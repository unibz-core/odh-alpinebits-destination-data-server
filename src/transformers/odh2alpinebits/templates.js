const meta = {
  lastUpdate: null,
  dataProvider: null
}

const datatypes = {
  Address: {
    street: null,
    city: null,
    region: null,
    country: null,
    complement: null,
    categories: null,
    zipcode: null
  },
  Point:  {
    type: 'Point',
    coordinates: []
  },
  LineString:  {
    type: 'LineString',
    coordinates: []
  },
  Polygon: {
    type: 'Polygon',
    coordinates: [[]]
  },
  ContactPoint: {
    email: null,
    telephone: null,
    address: null,
    availableHours: null
  },
  HoursSpecification: {
    hours: null,
    validFrom: null,
    validTo: null,
    daysOfWeek: null
  }
}

const resources = {
  Event: {
    type: "events",
    id: "",
    meta: meta,
    attributes: {
      abstract: null,
      capacity: null,
      categories: null,
      description: null,
      endDate: null,
      name: null,
      shortName: null,
      startDate: null,
      status: null,
      url: null
    },
    relationships: {
      contributors: null,
      multimediaDescriptions: null,
      organizers: null,
      publisher: null,
      series: null,
      sponsors: null,
      subEvents: null,
      venues: null,
    },
    links: {
      self: null
    }
  },
  EventSeries: {
    type: "eventSeries",
    id: "",
    meta: meta,
    abstract: null,
    categories: null,
    description: null,
    editions: null,
    frequency: null,
    name: null,
    shortName: null,
    url: null,
    multimediaDescriptions: null
  },
  Venue: {
    type: "venues",
    id: "",
    meta: meta,
    attributes: {
      abstract: null,
      area: null,
      categories: null,
      description: null,
      geometries: null,
      howToArrive: null,
      name: null,
      shortName: null,
      url: null,
    },
    relationships:{
      multimediaDescriptions: null
    },
    links: {
      self: null
    }
  },
  Agent: {
    type: "agents",
    id: "",
    meta: meta,
    attributes: {
      abstract: null,
      categories: null,
      contactPoints: null,
      description: null,
      name: null,
      shortName: null,
      url: null
    },
    relationships: {
      multimediaDescriptions: null
    }
  },
  MediaObject: {
    type: "mediaObjects",
    id: "",
    meta: meta,
    attributes: {
      abstract: null,
      categories: null,
      contentType: null,
      description: null,
      duration: null,
      height: null,
      license: null,
      name: null,
      shortName: null,
      url: null,
      width: null
    },
    relationships: {
      copyrightOwner: null
    }
  },
  Lift: {
    type: "lifts",
    id: "",
    meta: meta,
    abstract: null,
    categories: null,
    description: null,
    url: null,
    length: null,
    minAltitude: null,
    maxAltitude: null,
    capacity: null,
    personsPerChair: null,
    openingHours: null,
    address: null,
    geometries: null,
    howToArrive: null,
    connections: null,
    multimediaDescriptions: null,
    shortName: null
  },
  Trail: {
    type: "trails",
    id: "",
    meta: meta,
    abstract: null,
    categories: null,
    name: null,
    shortName: null,
    description: null,
    url: null,
    length: null,
    minAltitude: null,
    maxAltitude: null,
    difficulty: null,
    address: null,
    geometries: null,
    howToArrive: null,
    openingHours: null,
    snowCondition: null,
    connections: null,
    multimediaDescriptions: null
  },
  Snowpark: {
    type: "snowparks",
    id: "",
    meta: meta,
    abstract: null,
    categories: null,
    name: null,
    shortName: null,
    description: null,
    url: null,
    length: null,
    minAltitude: null,
    maxAltitude: null,
    address: null,
    howToArrive: null,
    difficulty: null,
    features: null,
    geometries: null,
    openingHours: null,
    snowCondition: null,
    connections: null,
    multimediaDescriptions: null
  },
  MountainArea: {
    type: "mountainAreas",
    id: "",
    meta: meta,
    abstract: null,
    categories: null,
    name: null,
    categories: null,
    shortName: null,
    description: null,
    url: null,
    address: null,
    geometries: null,
    howToArrive: null,
    openingHours: null,
    area: null,
    minAltitude: null,
    maxAltitude: null,
    totalTrailLength: null,
    totalParkLength: null,
    snowCondition: null,
    areaOwner: null,
    connections: null,
    multimediaDescriptions: null,
    lifts: null,
    trails: null,
    snowparks: null,
    subAreas: null
  }
}

// Function to create empty objects. It is better to have fields with null values than to have missing fields.
module.exports.createObject = (type) => {
  
  if(datatypes[type])
    return JSON.parse(JSON.stringify(datatypes[type]));
  
  if(resources[type])
    return JSON.parse(JSON.stringify(resources[type]));
  
  return {}
}
