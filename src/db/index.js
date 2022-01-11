module.exports = {
  schemas: {
    abstracts: {
      _name: "abstracts",
      resourceId: "resource_id",
      lang: "lang",
      content: "content",
    },
    addresses: {
      _name: "addresses",
      addressId: "address_id",
      country: "country",
      zipcode: "zipcode",
      type: "type",
    },
    categoryCoveredTypes: {
      _name: "category_covered_types",
      categoryId: "category_id",
      type: "type",
    },
    categorySpecializations: {
      _name: "category_specializations",
      parentId: "parent_id",
      childId: "child_id",
    },
    cities: {
      _name: "cities",
      addressId: "address_id",
      lang: "lang",
      content: "content",
    },
    complements: {
      _name: "complements",
      addressId: "address_id",
      lang: "lang",
      content: "content",
    },
    contactPoints: {
      _name: "contact_points",
      contactPointId: "contact_point_id",
      agentId: "agent_id",
      addressId: "address_id",
      email: "email",
      telephone: "telephone",
      availableHours: "available_hours",
    },
    contributors: {
      _name: "contributors",
      contributorId: "contributor_id",
      eventId: "event_id",
    },
    descriptions: {
      _name: "descriptions",
      resourceId: "resource_id",
      lang: "lang",
      content: "content",
    },
    eventStatus: {
      _name: "event_status",
      status: "status",
      title: "title",
    },
    featureCoveredTypes: {
      _name: "feature_covered_types",
      featureId: "feature_id",
      type: "type",
    },
    featureSpecializations: {
      _name: "feature_specializations",
      parentId: "parent_id",
      childId: "child_id",
    },
    multimediaDescriptions: {
      _name: "multimedia_descriptions",
      resourceId: "resource_id",
      mediaObjectId: "media_bject_id",
    },
    names: {
      _name: "names",
      resourceId: "resource_id",
      lang: "lang",
      content: "content",
    },
    organizers: {
      _name: "organizers",
      organizerId: "organizer_id",
      eventId: "event_id",
    },
    regions: {
      _name: "regions",
      addressId: "address_id",
      lang: "lang",
      content: "content",
    },
    resourceCategories: {
      _name: "resource_categories",
      categorizedResourceId: "categorized_resource_id",
      categoryId: "category_id",
    },
    seriesFrequencies: {
      _name: "series_frequencies",
      frequency: "frequency",
      title: "title",
    },
    shortNames: {
      _name: "short_names",
      resourceId: "resource_id",
      lang: "lang",
      content: "content",
    },
    sponsors: {
      _name: "sponsors",
      sponsorId: "sponsor_id",
      eventId: "event_id",
    },
    streets: {
      _name: "streets",
      addressId: "address_id",
      lang: "lang",
      content: "content",
    },
    urls: {
      _name: "urls",
      resourceId: "resource_id",
      lang: "lang",
      content: "content",
    },
    agents: {
      _name: "agents",
      agentId: "agent_id",
    },
    categories: {
      _name: "categories",
      categoryId: "category_id",
      resourceId: "resource_id",
      namespace: "namespace",
    },
    features: {
      _name: "features",
      featureId: "feature_id",
      resourceId: "resource_id",
      namespace: "namespace",
    },
    events: {
      _name: "events",
      eventId: "event_id",
      capacity: "capacity",
      endDate: "end_date",
      startDate: "start_date",
      parentId: "parent_id",
      publisherId: "publisher_id",
      status: "status",
      seriesId: "series_id",
    },
    eventSeries: {
      _name: "event_series",
      eventSeriesId: "event_series_id",
      frequency: "frequency",
    },
    languageCodes: {
      _name: "language_codes",
      lang: "lang",
      title: "title",
    },
    mediaObjects: {
      _name: "media_objects",
      mediaObjectId: "media_object_id",
      contentType: "content_type",
      duration: "duration",
      height: "height",
      license: "license",
      width: "width",
      copyrightOwnerId: "copyright_owner_id",
    },
    resources: {
      _name: "resources",
      resourceId: "resource_id",
      type: "type",
      odhId: "odh_id",
      dataProvider: "data_provider",
      createdAt: "created_at",
      lastUpdate: "last_update",
      simpleUrl: "simple_url",
    },
    resourceTypes: {
      _name: "resource_types",
      type: "type",
      title: "title",
    },
  },
};
