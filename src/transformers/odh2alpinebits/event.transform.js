const shajs = require('sha.js')
const utils = require('./utils');
const templates = require('./templates');

module.exports = (originalObject, included = {}, request) => {
  const source = JSON.parse(JSON.stringify(originalObject));
  let target = templates.createObject('Event');

  target.id = source.Id;

  let meta = target.meta;
  Object.assign(meta, utils.transformMetadata(source));

  let links = target.links;
  Object.assign(links, utils.createSelfLink(target, request));
  
  /**
   * 
   *  ATTRIBUTES
   * 
   */

  let attributes = target.attributes;
  Object.assign(attributes, utils.transformBasicProperties(source));
  Object.assign(attributes, transformDates(source));

  attributes.status = 'published';

  // // Event categories
  // const categoryMapping = {
  //   'Gastronomie/Typische Produkte': 'odh/gastronomy',
  //   'Musik/Tanz': 'odh/music',
  //   'Volksfeste/Festivals': 'odh/festival',
  //   'Sport': 'odh/sports',
  //   'Führungen/Besichtigungen': 'odh/tourism',
  //   'Theater/Vorführungen': 'odh/theather',
  //   'Kurse/Bildung': 'odh/education',
  //   'Tagungen Vorträge': 'odh/conference',
  //   'Familie': 'odh/family',
  //   'Handwerk/Brauchtum': 'odh/handicrafts',
  //   'Messen/Märkte': 'odh/market',
  //   'Wanderungen/Ausflüge': 'odh/hike',
  //   'Ausstellungen/Kunst': 'odh/art',
  // }
  let categories = [];
  
  source.Topics.forEach(topic => {
    
    // if(categoryMapping[tag])
    //   categories.push(categoryMapping[tag]);
    
    categories.push("odh/"+ topic.TopicInfo.replace(/[\/|\s]/g,'-').toLowerCase());
  })

  if(categories.length>0)
    attributes.categories = categories;

  /**
   * 
   *  RELATIONSHIPS
   * 
   */

  let relationships = target.relationships;
  
  // Venue
  let newVenue = transformVenue(source);
  utils.addRelationshipToMany(relationships, 'venues', newVenue, links.self);
  utils.addIncludedResource(included, newVenue);
  
  
  // Organizer
  let newOrganizer = transformOrganizer(source)
  utils.addRelationshipToMany(relationships, 'organizers', newOrganizer, links.self);
  utils.addIncludedResource(included, newOrganizer);

  // Publisher
  let newPublisher = transformPublisher();
  utils.addRelationshipToOne(relationships, 'publisher', newPublisher, links.self);
  utils.addIncludedResource(included, newPublisher);

  // Media Objects
  for (image of source.ImageGallery){
    const { mediaObject, copyrightOwner } = utils.transformMediaObject(image, links);
    utils.addRelationshipToMany(relationships, 'multimediaDescriptions', mediaObject, links.self);
    utils.addIncludedResource(included, mediaObject);
    utils.addIncludedResource(included, copyrightOwner);
  }

  return target;
}

function transformDates(source) {
  let target = {}

  if(!source.EventDate || source.EventDate.length==0) {
    const mapping = [ ['DateBegin','startDate'], ['DateEnd','endDate'] ]
    utils.transformFields(source, target, mapping);
  }
  else if(source.EventDate && source.EventDate.length===1) {
    const date = source.EventDate[0];
    target.startDate = date.From.replace(/T.*/,'T'+date.Begin);
    target.endDate = date.To.replace(/T.*/,'T'+date.End);
  }
  else {
    let dateList = source.EventDate.map( (entry, idx) => {
      const startDateTime = entry.From.replace(/T.*/,'T'+entry.Begin);
      return { date: new Date(startDateTime).getTime(), index: idx};
    })

    dateList.sort((a, b) => (a.date > b.date) ? 1 : -1);

    const firstDate = source.EventDate[dateList.shift().index];
    const lastDate = source.EventDate[dateList.pop().index];

    target.startDate = firstDate.From.replace(/T.*/,'T'+firstDate.Begin);
    target.endDate = lastDate.To.replace(/T.*/,'T'+lastDate.End);
  }

  target.startDate += '+02:00'
  target.endDate += '+02:00'

  return target;
}

function transformPublisher() {
  let publisher = templates.createObject('Agent');
  
  publisher.id = shajs('sha256').update('lts').digest('hex'),
  publisher.attributes.name = {
    deu: "LTS - Landesverband der Tourismusorganisationen Südtirols",
    eng: "LTS - Landesverband der Tourismusorganisationen Südtirols",
    ita: "LTS - Landesverband der Tourismusorganisationen Südtirols"
  };
  publisher.attributes.url = "https://lts.it";
  
  return publisher;
}

function transformOrganizer(source) {
  
  let organizer = source.OrganizerInfos;
  let contact = source.ContactInfos;

  if(!organizer)
    return null;

  let newOrganizer = templates.createObject('Agent');
  let attributes = newOrganizer.attributes;

  const organizerMapping = [['Url','url']];
  utils.transformMultilingualFields(organizer, attributes, organizerMapping, false, true);

  let newContact = templates.createObject('ContactPoint');
  attributes.contactPoints = [newContact];

  let newAddress = templates.createObject('Address');
  attributes.address = newAddress;

  const addressMapping = [['Address','street'], ['City','city'], ['ZipCode','zipcode']];
  utils.transformMultilingualFields(organizer, newAddress, addressMapping, false);
  newAddress.zipcode = newAddress.zipcode.ita || newAddress.zipcode.eng || newAddress.zipcode.deu;
  newAddress.country = 'IT';

  let inferredType = {
    error: 0,
    organization: 0,
    person: 0
  };

  for (languageEntry of utils.languageMapping) {
    let [sourceLanguage, targetLanguage] = languageEntry;
    
    const sourceOrganizer = organizer[sourceLanguage];

    if(sourceOrganizer) {
      let phonenumber = utils.safeGetString(['Phonenumber'], sourceOrganizer);
      newContact.telephone = newContact.telephone || phonenumber;

      const email = utils.safeGetString(['Email'], sourceOrganizer);
      newContact.email = newContact.email || email;

      const orgId =  utils.safeGetString(['Tax'], sourceOrganizer) ||  utils.safeGetString(['Vat'], sourceOrganizer) || email;
      newOrganizer.id = newOrganizer.id || orgId;

      const ignoreValues = ['Undefiniert','!','-','.','sonstige'];
      const companyName = utils.safeGetString(['CompanyName'], sourceOrganizer);
      const givenName = utils.safeGetString(['Givenname'], sourceOrganizer);
      const surname = utils.safeGetString(['Surname'], sourceOrganizer); 

      const isValidCompanyName = companyName && !ignoreValues.includes(companyName);
      const isValidGivenName = givenName && !ignoreValues.includes(givenName);
      const isValidSurname = surname && !ignoreValues.includes(surname);

      if(!isValidCompanyName && !isValidGivenName && !isValidSurname) {
        inferredType.error++;
      }
      else if(isValidCompanyName) {
        inferredType.organization++;
        attributes.name = utils.safeAdd(attributes.name, targetLanguage, companyName);
      }
      else if ((isValidGivenName || isValidSurname) && !(isValidGivenName && isValidSurname)){
        if(isValidSurname){
          inferredType.organization++;
          attributes.name = utils.safeAdd(attributes.name, targetLanguage, surname);
        }
        else {
          inferredType.organization++;
          attributes.name = utils.safeAdd(attributes.name, targetLanguage, givenName);
        }
      }
      else {
        inferredType.person++;
        attributes.name = utils.safeAdd(attributes.name, targetLanguage, givenName+' '+surname);
      }
    }
  }

  // TODO: Decide how to handle the case in which we cannot infer whether the organizer is a person or an organization. We are currently setting the organizer to be an organization
  attributes.categories = !inferredType.organization && inferredType.person ? ['alpinebits/person'] : ['alpinebits/organization']

  //If email and telephone number are not specified in organizer, try to get it from the ContactInfos field.
  // TODO: improve this part of the code. Too many duplicates...
  if(!attributes.email)
    attributes.email = utils.safeGetOne([['de','Email'],['it','Email'],['en','Email']], contact);

  if(!attributes.telephone)
    attributes.telephone = utils.safeGetOne([['de','Phonenumber'],['it','Phonenumber'],['en','Phonenumber']], contact);

  if(!newOrganizer.id)
    newOrganizer.id = source.Id+"+organizer";

  return newOrganizer;
}

function transformVenue(source) {
  let venue = templates.createObject('Venue');
  venue.id = source.Id+'+location';
  
  /**
   * 
   *  ATTRIBUTES
   * 
   */
  let attributes = venue.attributes;

  const fieldMapping = [ ['Location', 'name'] ];
  utils.transformMultilingualFields(source.EventAdditionalInfos, attributes, fieldMapping, false);

  let address = templates.createObject('Address');
  attributes.address = address;

  if(source.ContactInfos) {
    const addressFieldMapping = [
      ['Address', 'street'],
      ['City', 'city'],
      ['ZipCode', 'zipcode'],
    ];
    utils.transformMultilingualFields(source.ContactInfos, address, addressFieldMapping, false);

    address.zipcode = address.zipcode.ita || address.zipcode.eng || address.zipcode.deu;
    address.country = 'IT';
  }

  if(source.Latitude && source.Longitude) {
    let point = templates.createObject('Point');
    attributes.geometries = [point];
    
    point.coordinates.push(source.Latitude);
    point.coordinates.push(source.Longitude);

    if(source.Altitude)
      point.coordinates.push(source.Altitude);
  }

  /**
   * 
   *  RELATIONSHIPS: No relationship is transformed
   * 
   */

  return venue;
}
