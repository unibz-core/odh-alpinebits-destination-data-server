const DEFAULT_OPTS = {
  keyForAttribute: 'camelCase',
  nullIfMissing: true,
}

const BASIC_ATTR = ['name','shortName','description','abstract','url','categories'];

const MEDIA_OBJECT = {
  name: 'mediaObjects',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR,'contentType','height','width','duration','license','copyrightOwner','categories'],
    copyrightOwner: {
      attributes: [...BASIC_ATTR]
    }
  },
  relationships: ['copyrightOwner']
}

const AGENT = {
  name: 'agents',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR,'categories','multimediaDescriptions','contacts'],
    contacts: {
      attributes: [...BASIC_ATTR, 'email', 'telephone', 'address', 'availableHours'],
    },
    multimediaDescriptions: MEDIA_OBJECT.opts
  },
  relationships: ['multimediaDescriptions']
}

const VENUE = {
  name: 'venues',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR, 'multimediaDescriptions', 'address', 'geometries', 'howToArrive', 'connections', 'categories'],
    multimediaDescriptions: MEDIA_OBJECT.opts,
  },
  relationships: ['multimediaDescriptions']
}

const EVENT_SERIES = {
  name: 'eventSeries',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR, 'multimediaDescriptions', 'frequency'],
    multimediaDescriptions: MEDIA_OBJECT.opts
  },
  relationships: ['multimediaDescriptions']
}


const EVENT_REL = ['multimediaDescriptions','publisher','organizers','sponsors','contributors','series','series.multimediaDescriptions','venues','venues.multimediaDescriptions','venues'];

const EVENT = {
  name: 'events',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR, ...EVENT_REL, 'startDate', 'endDate', 'originalStartDate', 'originalEndDate', 'categories', 'structure', 'status', 'capacity'],
    multimediaDescriptions: MEDIA_OBJECT.opts,
    publisher: AGENT.opts,
    organizers: AGENT.opts,
    sponsors: AGENT.opts,
    contributors: AGENT.opts,
    series: EVENT_SERIES.opts,
    venues: VENUE.opts,
    subEvents: {}
  },
  relationships: [...EVENT_REL]
}

const LIFT = {
  name: 'lifts',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR, 'categories','length','minAltitude','maxAltitude','capacityPerHour','personsPerChair',
    'howToArrive','address','geometries','openingHours','connections','multimediaDescriptions'],
    multimediaDescriptions: MEDIA_OBJECT.opts,
    connections: {}
  },
  relationships: ['multimediaDescriptions', 'connections']
}

const TRAIL = {
  name: 'trails',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR, 'categories','length','minAltitude','maxAltitude','difficulty','connections','geometries','openingHours','address','howToArrive','multimediaDescriptions'],
    multimediaDescriptions: MEDIA_OBJECT.opts,
    connections: {}
  },
  relationships: ['multimediaDescriptions', 'connections']
}

const SNOWPARK = {
  name: 'snowparks',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR, 'categories','difficulty','area','minAltitude','maxAltitude','capacityPerHour','personsPerChair',
    'howToArrive','address','geometries','openingHours','features','connections','multimediaDescriptions'],
    multimediaDescriptions: MEDIA_OBJECT.opts,
    connections: {},
    features: {}
  },
  relationships: ['multimediaDescriptions', 'connections']
}

const MOUNTAIN_AREA = {
  name: 'mountainAreas',
  opts: {
    ...DEFAULT_OPTS,
    attributes: [...BASIC_ATTR,
      'address','geometries','howToArrive','openingHours','area','minAltitude','maxAltitude','totalTrailLength','totalParkArea',
      'multimediaDescriptions','areaOwner','connections','lifts','snowparks','trails','subAreas'],
    areaOwner: AGENT.opts,
    multimediaDescriptions: MEDIA_OBJECT.opts,
    lifts: LIFT.opts,
    snowparks: SNOWPARK.opts,
    trails: TRAIL.opts,
    connections: {},
    subAreas: {}
  },
  relationships: ['multimediaDescriptions','areaOwner','areaOwner.multimediaDescriptions','connections','lifts','snowparks',
    'trails','subAreas']
}

function typeForAttribute (attribute, data) {
  return data ? data['type'] : null;
}

function getTypeFromRelationship(relationship) {
  switch(relationship){
    case 'multimediaDescriptions':
    case 'series.multimediaDescriptions':
    case 'venues.multimediaDescriptions':
      return MEDIA_OBJECT.name;
    case 'publisher':
    case 'organizers':
    case 'sponsors':
    case 'contributors':
      return AGENT.name;
    case 'series':
      return EVENT_SERIES.name;
    case 'venues':
      return VENUE.name;
    case 'areaOwner':
      return AGENT.name;
    case 'lifts':
      return LIFT.name;
    case 'snowparks':
      return SNOWPARK.name;
  }
}

const resources = {
  'agents': AGENT,
  'events': EVENT,
  'eventSeries': EVENT_SERIES,
  'lifts': LIFT,
  'mediaObjects': MEDIA_OBJECT,
  'mountainAreas': MOUNTAIN_AREA,
  'snowparks': SNOWPARK,
  'trails': TRAIL,
  'venues': VENUE,
}

module.exports = {
  getOptions: (path) => {
    let resource  = JSON.parse(JSON.stringify(resources[path]));
    resource.opts.typeForAttribute = typeForAttribute;
    resource.getTypeFromRelationship = getTypeFromRelationship;
    return resource;
  }
}
