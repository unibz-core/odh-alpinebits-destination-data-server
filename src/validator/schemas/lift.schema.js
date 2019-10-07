module.exports = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://www.alpinebits.org/schemas/v1/mountaindata/Lift",
  "title": "Lift",
  "type": "object",
  "required": [
    "@type",
    "id",
    "name"
  ],
  "properties": {
    "@type": {
      "const": "Lift"
    },
    "id": {
      "type": "string",
      "minLength": 1
    },
    "name": {
      "$ref": "#/definitions/text"
    },
    "shortName": {
      "$ref": "#/definitions/text"
    },
    "abstract": {
      "$ref": "#/definitions/text"
    },
    "description": {
      "$ref": "#/definitions/text"
    },
    "url": {
      "$ref": "#/definitions/url"
    },
    "multimediaDescriptions": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/mediaObject"
      }
    },
    "address": {
      "$ref": "#/definitions/address"
    },
    "geometries": {
      "type": "array",
      "items": {
        "title": "Geometry",
        "oneOf": [
          {
            "title": "Point",
            "type": "object",
            "properties": {
              "@type": {
                "const": "Point"
              },
              "coordinates": {
                "type": "array",
                "minItems": 2,
                "items": {
                  "type": "number"
                }
              }
            },
            "required": [
              "@type",
              "coordinates"
            ]
          },
          {
            "title": "LineString",
            "type": "object",
            "properties": {
              "@type": {
                "const": "LineString"
              },
              "coordinates": {
                "type": "array",
                "minItems": 2,
                "items": {
                  "type": "array",
                  "minItems": 2,
                  "items": {
                    "type": "number"
                  }
                }
              }
            },
            "required": [
              "@type",
              "coordinates"
            ]
          },
          {
            "title": "Polygon",
            "type": "object",
            "properties": {
              "@type": {
                "const": "Polygon"
              },
              "coordinates": {
                "type": "array",
                "items": {
                  "type": "array",
                  "minItems": 4,
                  "items": {
                    "type": "array",
                    "minItems": 2,
                    "items": {
                      "type": "number"
                    }
                  }
                }
              }
            },
            "required": [
              "@type",
              "coordinates"
            ]
          },
          {
            "title": "MultiPoint",
            "type": "object",
            "properties": {
              "@type": {
                "const": "MultiPoint"
              },
              "coordinates": {
                "type": "array",
                "items": {
                  "type": "array",
                  "minItems": 2,
                  "items": {
                    "type": "number"
                  }
                }
              }
            },
            "required": [
              "@type",
              "coordinates"
            ]
          },
          {
            "title": "MultiLineString",
            "type": "object",
            "properties": {
              "@type": {
                "const": "MultiLineString"
              },
              "coordinates": {
                "type": "array",
                "items": {
                  "type": "array",
                  "minItems": 2,
                  "items": {
                    "type": "array",
                    "minItems": 2,
                    "items": {
                      "type": "number"
                    }
                  }
                }
              }
            },
            "required": [
              "@type",
              "coordinates"
            ]
          },
          {
            "title": "MultiPolygon",
            "type": "object",
            "properties": {
              "@type": {
                "const": "MultiPolygon"
              },
              "coordinates": {
                "type": "array",
                "items": {
                  "type": "array",
                  "items": {
                    "type": "array",
                    "minItems": 4,
                    "items": {
                      "type": "array",
                      "minItems": 2,
                      "items": {
                        "type": "number"
                      }
                    }
                  }
                }
              }
            },
            "required": [
              "@type",
              "coordinates"
            ]
          }
        ]
      }
    },
    "howToArrive": {
      "$ref": "#/definitions/text"
    },
    "connections": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "category": {
      "type": "string"
    },
    "length": {
      "description": "The total lenght of a lift in meters.",
      "type": ["number", "null"]
    },
    "minAltitude": {
      "description": "The lowest elevation point of a lift in meters above sea level.",
      "type": ["number", "null"]
    },
    "maxAltitude": {
      "description": "The maximum elevation point of a lift in meters above sea level.",
      "type": ["number", "null"]
    },
    "capacity": {
      "description": "The average number of people a lift can transport per hour.",
      "type": ["number", "null"]
    },
    "personsPerChair": {
      "description": "The maximum number of people that fits in a single chair/cabin of a lift.",
      "type": ["number", "null"]
    },
    "openingHours": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/hoursSpecification"
      }
    }
  },
  "definitions": {
    "text": {
      "patternProperties": {
        "": {
          "type": "string"
        }
      },
      "type": "object",
      "propertyNames": {
        "type": "string",
        "enum": [
          "eng",
          "ita",
          "deu",
          "lld"
        ]
      }
    },
    "url": {
      "oneOf": [
        {
          "type": "string",
          "format": "uri"
        },
        {
          "patternProperties": {
            "": {
              "type": "string",
              "format": "uri"
            }
          },
          "type": "object",
          "propertyNames": {
            "type": "string",
            "enum": [
              "eng",
              "ita",
              "deu",
              "lld"
            ]
          }
        }
      ]
    },
    "agent": {
      "title": "Agent",
      "type": "object",
      "required": [
        "@type"
      ],
      "properties": {
        "@type": {
          "const": "Agent"
        },
        "id": {
          "type": "string",
          "minLength": 1
        },
        "name": {
          "$ref": "#/definitions/text"
        },
        "shortName": {
          "$ref": "#/definitions/text"
        },
        "abstract": {
          "$ref": "#/definitions/text"
        },
        "description": {
          "$ref": "#/definitions/text"
        },
        "url": {
          "$ref": "#/definitions/url"
        },
        "category": {
          "type": "string",
          "enum": [
            "person",
            "organization"
          ]
        },
        "contacts": {
          "type": "array",
          "minItems": 1,
          "items": {
            "title": "Contact Point",
            "type": "object",
            "required": [
              "@type"
            ],
            "properties": {
              "@type": {
                "const": "ContactPoint"
              },
              "id": {
                "type": "string",
                "minLength": 1
              },
              "name": {
                "$ref": "#/definitions/text"
              },
              "shortName": {
                "$ref": "#/definitions/text"
              },
              "abstract": {
                "$ref": "#/definitions/text"
              },
              "description": {
                "$ref": "#/definitions/text"
              },
              "url": {
                "$ref": "#/definitions/url"
              },
              "email": {
                "format": "email",
                "type": "string"
              },
              "telephone": {
                "type": "string"
              },
              "address": {
                "$ref": "#/definitions/address"
              },
              "availableHours": {
                "$ref": "#/definitions/hoursSpecification"
              }
            },
            "anyOf": [
              {
                "required": [
                  "telephone"
                ]
              },
              {
                "required": [
                  "email"
                ]
              },
              {
                "required": [
                  "address"
                ]
              }
            ]
          }
        }
      },
      "anyOf": [
        {
          "required": [
            "url"
          ]
        },
        {
          "required": [
            "name"
          ]
        }
      ]
    },
    "mediaObject": {
      "title": "Media Object",
      "type": "object",
      "required": [
        "@type",
        "url",
        "contentType"
      ],
      "properties": {
        "@type": {
          "const": "MediaObject"
        },
        "id": {
          "type": "string",
          "minLength": 1
        },
        "name": {
          "$ref": "#/definitions/text"
        },
        "shortName": {
          "$ref": "#/definitions/text"
        },
        "abstract": {
          "$ref": "#/definitions/text"
        },
        "description": {
          "$ref": "#/definitions/text"
        },
        "url": {
          "$ref": "#/definitions/url"
        },
        "contentType": {
          "type": "string",
          "pattern": "^(application|audio|font|example|image|message|model|multipart|text|video)/[a-zA-Z0-9-.+]+$"
        },
        "height": {
          "description": "The height of an image or a video in pixels.",
          "type": "integer",
          "minimum": 1
        },
        "width": {
          "description": "The width of an image or a video in pixels.",
          "type": "integer",
          "minimum": 1
        },
        "duration": {
          "description": "The duration of an audio or a video in seconds.",
          "type": "number",
          "minimum": 1
        },
        "license": {
          "description": "The license defined for a media object. The value of this field should be a valid license identifier as defined in https://spdx.org/licenses/ (e.g. CC-BY-4.0, FreeImage)",
          "type": "string"
        },
        "copyrightOwner": {
          "$ref": "#/definitions/agent"
        }
      },
      "allOf": [
        {
          "if": {
            "properties": {
              "contentType": {
                "type": "string",
                "pattern": "^(application|font|example|image|message|model|multipart|text)"
              }
            }
          },
          "then": {
            "not": {
              "required": [
                "duration"
              ]
            }
          }
        },
        {
          "if": {
            "properties": {
              "contentType": {
                "type": "string",
                "pattern": "^(application|audio|font|example|message|model|multipart|text)"
              }
            }
          },
          "then": {
            "not": {
              "required": [
                "width",
                "height"
              ]
            }
          }
        }
      ]
    },
    "address": {
      "title": "Address",
      "type": "object",
      "required": [
        "@type",
        "city",
        "country"
      ],
      "properties": {
        "@type": {
          "const": "Address"
        },
        "category": {
          "type": "string"
        },
        "street": {
          "$ref": "#/definitions/text"
        },
        "city": {
          "$ref": "#/definitions/text"
        },
        "region": {
          "$ref": "#/definitions/text"
        },
        "zipcode": {
          "type": "string"
        },
        "complement": {
          "$ref": "#/definitions/text"
        },
        "country": {
          "description": "A two-letter country code as defined in the ISO 3166.",
          "type": "string",
          "enum": [
            "IT",
            "DE",
            "AU"
          ]
        }
      }
    },
    "hoursSpecification": {
      "title": "Hours Specification",
      "type": "object",
      "required": [
        "@type",
        "hours"
      ],
      "properties": {
        "@type": {
          "const": "HoursSpecification"
        },
        "validFrom": {
          "type": "string",
          "format": "date"
        },
        "validTo": {
          "type": "string",
          "format": "date"
        },
        "daysOfWeek": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true,
          "items": {
            "type": "string",
            "enum": [
              "sunday",
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday"
            ]
          }
        },
        "hours": {
          "type": "array",
          "minItems": 1,
          "items": {
            "required": [
              "opens",
              "closes"
            ],
            "properties": {
              "opens": {
                "type": "string",
                "format": "time"
              },
              "closes": {
                "type": "string",
                "format": "time"
              }
            }
          }
        }
      }
    }
  }
}
