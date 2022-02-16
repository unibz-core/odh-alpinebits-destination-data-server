const _ = require("lodash");
const dbFn = require("../../db/functions");
const { schemas } = require("../../db");
const { ResourceConnector } = require("./resource_connector");
const { Venue } = require("../../model/destinationdata2022/venue");

class VenueConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(venue) {
    return this.runTransaction(() => this.insertVenue(venue).then(() => this.retrieveVenue(venue.id)));
  }

  retrieve(id) {
    const venueId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveVenue(venueId));
  }

  update(venue) {
    if (!venue.id) throw new Error("missing id");

    return this.runTransaction(() =>
      this.retrieveVenue(venue.id).then((oldVenue) => this.updateVenue(oldVenue, venue))
    );
  }

  delete(id) {
    const venueId = id ?? this.request?.params?.id;
    return this.runTransaction(() => this.deleteVenue(venueId));
  }

  deleteVenue(id) {
    return this.deleteResource(id, "venues");
  }

  retrieveVenue(id) {
    return dbFn.selectVenueFromId(this.connection, id).then((rows) => {
      if (_.isString(id)) {
        if (_.size(rows) === 1) {
          return this.mapRowToVenue(_.first(rows));
        }
        throw new Error("Not found");
      } else {
        return rows?.map(this.mapRowToVenue);
      }
    });
  }

  updateVenue(oldVenue, newInput) {
    const newVenue = _.create(oldVenue);

    this.ignoreNonListedFields(newInput, newVenue);

    if (this.shouldUpdate(oldVenue, newVenue)) {
      return Promise.all([this.updateResource(newVenue)])
        .then((promises) => {
          newVenue.lastUpdate = _.first(_.flatten(promises))[schemas.resources.lastUpdate];
          return this.updatePlace(newVenue);
        })
        .then(() => newVenue);
    }

    this.throwNoUpdate(oldVenue);
  }

  mapRowToVenue(row) {
    const venue = new Venue();
    _.assign(venue, row);
    return venue;
  }

  insertVenue(venue) {
    return this.insertResource(venue)
      .then(() => {
        const columns = this.mapVenueToColumns(venue);
        return dbFn.insertVenue(this.connection, columns);
      })
      .then(() => this.insertPlace(venue))
      .then(() => venue.id);
  }

  mapVenueToColumns(venue) {
    return { [schemas.venues.id]: venue?.id };
  }
}

module.exports = { VenueConnector };
