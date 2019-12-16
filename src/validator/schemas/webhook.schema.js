module.exports = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "NotificationSubscription",
  "oneOf": [
    {
      "$ref": "#/definitions/success"
    },
    {
      "$ref": "#/definitions/failure"
    },
    {
      "$ref": "#/definitions/info"
    }
  ],
  "definitions": {
    "success": {
      "type": "object",
      "required": [
        "data"
      ],
      "properties": {
        "data": {
          "$ref": "#/definitions/data"
        },
        "included": {
          "description": "To reduce the number of HTTP requests, servers **MAY** allow responses that include related resources along with the requested primary resources. Such responses are called \"compound documents\".",
          "type": "array",
          "items": {
            "$ref": "#/definitions/resource"
          },
          "uniqueItems": true
        },
        "meta": {
          "$ref": "#/definitions/meta"
        },
        "links": {
          "description": "Link members related to the primary data.",
          "allOf": [
            {
              "$ref": "#/definitions/links"
            },
            {
              "$ref": "#/definitions/pagination"
            }
          ]
        },
        "jsonapi": {
          "$ref": "#/definitions/jsonapi"
        }
      },
      "additionalProperties": false
    },
    "failure": {
      "type": "object",
      "required": [
        "errors"
      ],
      "properties": {
        "errors": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/error"
          },
          "uniqueItems": true
        },
        "meta": {
          "$ref": "#/definitions/meta"
        },
        "jsonapi": {
          "$ref": "#/definitions/jsonapi"
        },
        "links": {
          "$ref": "#/definitions/links"
        }
      },
      "additionalProperties": false
    },
    "info": {
      "type": "object",
      "required": [
        "meta"
      ],
      "properties": {
        "meta": {
          "$ref": "#/definitions/meta"
        },
        "links": {
          "$ref": "#/definitions/links"
        },
        "jsonapi": {
          "$ref": "#/definitions/jsonapi"
        }
      },
      "additionalProperties": false
    },
    "meta": {
      "description": "Non-standard meta-information that can not be represented as an attribute or relationship.",
      "type": "object",
      "additionalProperties": true
    },
    "data": {
      "description": "The document's \"primary data\" is a representation of the resource or collection of resources targeted by a request.",
      "oneOf": [
        {
          "$ref": "#/definitions/resource"
        },
        {
          "description": "An array of resource objects, an array of resource identifier objects, or an empty array ([]), for requests that target resource collections.",
          "type": "array",
          "items": {
            "$ref": "#/definitions/resource"
          },
          "uniqueItems": true
        },
        {
          "description": "null if the request is one that might correspond to a single resource, but doesn't currently.",
          "type": "null"
        }
      ]
    },
    "resource": {
      "description": "\"Resource objects\" appear in a JSON:API document to represent resources.",
      "type": "object",
      "required": [
        "type",
        "id"
      ],
      "properties": {
        "type": {
          "type": "string"
        },
        "id": {
          "type": "string"
        },
        "attributes": {
          "$ref": "#/definitions/attributes"
        },
        "relationships": {
          "$ref": "#/definitions/relationships"
        },
        "links": {
          "$ref": "#/definitions/links"
        },
        "meta": {
          "$ref": "#/definitions/meta"
        }
      },
      "additionalProperties": false
    },
    "relationshipLinks": {
      "description": "A resource object **MAY** contain references to other resource objects (\"relationships\"). Relationships may be to-one or to-many. Relationships can be specified by including a member in a resource's links object.",
      "type": "object",
      "properties": {
        "self": {
          "description": "A `self` member, whose value is a URL for the relationship itself (a \"relationship URL\"). This URL allows the client to directly manipulate the relationship. For example, it would allow a client to remove an `author` from an `article` without deleting the people resource itself.",
          "$ref": "#/definitions/link"
        },
        "related": {
          "$ref": "#/definitions/link"
        }
      },
      "additionalProperties": true
    },
    "links": {
      "type": "object",
      "additionalProperties": {
        "$ref": "#/definitions/link"
      }
    },
    "link": {
      "description": "A link **MUST** be represented as either: a string containing the link's URL or a link object.",
      "oneOf": [
        {
          "description": "A string containing the link's URL.",
          "type": "string",
          "format": "uri-reference"
        },
        {
          "type": "object",
          "required": [
            "href"
          ],
          "properties": {
            "href": {
              "description": "A string containing the link's URL.",
              "type": "string",
              "format": "uri-reference"
            },
            "meta": {
              "$ref": "#/definitions/meta"
            }
          }
        }
      ]
    },
    "attributes": {
      "description": "Members of the attributes object (\"attributes\") represent information about the resource object in which it's defined.",
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "resourceType": {
          "$ref": "#/definitions/att_resourceType"
        },
        "conditions": {
          "$ref": "#/definitions/att_conditions"
        },
        "callback": {
          "$ref": "#/definitions/att_callback"
        },
        "secret": {
          "$ref": "#/definitions/att_secret"
        }
      },
      "required": [
        "resourceType",
        "conditions",
        "callback"
      ]
    },
    "relationships": {
      "description": "Members of the relationships object (\"relationships\") represent references from the resource object in which it's defined to other resource objects.",
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "watching": {
          "$ref": "#/definitions/rel_watching"
        }
      }
    },
    "relationshipToOne": {
      "description": "References to other resource objects in a to-one (\"relationship\"). Relationships can be specified by including a member in a resource's links object.",
      "anyOf": [
        {
          "$ref": "#/definitions/empty"
        },
        {
          "$ref": "#/definitions/linkage"
        }
      ]
    },
    "relationshipToMany": {
      "description": "An array of objects each containing \"type\" and \"id\" members for to-many relationships.",
      "type": "array",
      "items": {
        "$ref": "#/definitions/linkage"
      },
      "uniqueItems": true
    },
    "empty": {
      "description": "Describes an empty to-one relationship.",
      "type": "null"
    },
    "linkage": {
      "description": "The \"type\" and \"id\" to non-empty members.",
      "type": "object",
      "required": [
        "type",
        "id"
      ],
      "properties": {
        "type": {
          "type": "string"
        },
        "id": {
          "type": "string"
        },
        "meta": {
          "$ref": "#/definitions/meta"
        }
      },
      "additionalProperties": false
    },
    "pagination": {
      "type": "object",
      "properties": {
        "first": {
          "description": "The first page of data",
          "oneOf": [
            {
              "type": "string",
              "format": "uri-reference"
            },
            {
              "type": "null"
            }
          ]
        },
        "last": {
          "description": "The last page of data",
          "oneOf": [
            {
              "type": "string",
              "format": "uri-reference"
            },
            {
              "type": "null"
            }
          ]
        },
        "prev": {
          "description": "The previous page of data",
          "oneOf": [
            {
              "type": "string",
              "format": "uri-reference"
            },
            {
              "type": "null"
            }
          ]
        },
        "next": {
          "description": "The next page of data",
          "oneOf": [
            {
              "type": "string",
              "format": "uri-reference"
            },
            {
              "type": "null"
            }
          ]
        }
      }
    },
    "jsonapi": {
      "description": "An object describing the server's implementation",
      "type": "object",
      "properties": {
        "version": {
          "type": "string"
        },
        "meta": {
          "$ref": "#/definitions/meta"
        }
      },
      "additionalProperties": false
    },
    "error": {
      "type": "object",
      "properties": {
        "id": {
          "description": "A unique identifier for this particular occurrence of the problem.",
          "type": "string"
        },
        "links": {
          "$ref": "#/definitions/links"
        },
        "status": {
          "description": "The HTTP status code applicable to this problem, expressed as a string value.",
          "type": "string"
        },
        "code": {
          "description": "An application-specific error code, expressed as a string value.",
          "type": "string"
        },
        "title": {
          "description": "A short, human-readable summary of the problem. It **SHOULD NOT** change from occurrence to occurrence of the problem, except for purposes of localization.",
          "type": "string"
        },
        "detail": {
          "description": "A human-readable explanation specific to this occurrence of the problem.",
          "type": "string"
        },
        "source": {
          "type": "object",
          "properties": {
            "pointer": {
              "description": "A JSON Pointer [RFC6901] to the associated entity in the request document [e.g. \"/data\" for a primary data object, or \"/data/attributes/title\" for a specific attribute].",
              "type": "string"
            },
            "parameter": {
              "description": "A string indicating which query parameter caused the error.",
              "type": "string"
            }
          }
        },
        "meta": {
          "$ref": "#/definitions/meta"
        }
      },
      "additionalProperties": false
    },
    "att_resourceType": {
      "desciption": "Resource type to be watched. The watched resource type should be available as an endpoint as well. Notification subscription messages must indicate a resource type or a list of specific resources to be watched, but not both.",
      "type": "string",
      "enum": [
        "agents",
        "eventSeries",
        "events",
        "lifts",
        "mediaObjects",
        "mountainAreas",
        "places",
        "snowReports",
        "snowparks",
        "trails"
      ]
    },
    "att_conditions": {
      "description": "Communicates a list of conditions that should trigger a notification message. Every provider defines its own list of supported conditions following the standardized pattern. Basic conditions that provider may support are 'alpinebits/create', 'alpinebits/update', 'alpinebits/delete'.",
      "type": "array",
      "minItems": 1,
      "uniqueItems": true,
      "items": {
        "type": "string",
        "pattern": "([a-z|A-Z]+([/]{1})([a-z|A-Z]+))"
      }
    },
    "att_callback": {
      "description": "Client endpoint where the provider must post notification messages. The endpoint must open to listen to any HTTP/HTTPS POST, PATCH or DELETE request.",
      "type": "string",
      "format": "uri",
      "minLength": 1
    },
    "att_secret": {
      "description": "Secret string that should be used to encrypt notification messages sent to the client.",
      "type": "string",
      "minLength": 1
    },
    "rel_watching": {
      "properties": {
        "links": {
          "$ref": "#/definitions/relationshipLinks"
        },
        "data": {
          "description": "Member, whose value represents \"resource linkage\".",
          "oneOf": [
            {
              "$ref": "#/definitions/relationshipToMany"
            }
          ]
        },
        "meta": {
          "$ref": "#/definitions/meta"
        }
      },
      "anyOf": [
        {
          "required": [
            "data"
          ]
        },
        {
          "required": [
            "meta"
          ]
        },
        {
          "required": [
            "links"
          ]
        }
      ],
      "additionalProperties": false
    }
  },
  "$id": "https://www.alpinebits.org/schemas/v1/webhook/NotificationSubscription"
}