/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  // Check if collection already exists
  try {
    app.findCollectionByNameOrId("transactions");
    console.log("[MIGRATION] transactions collection already exists");
    return;
  } catch (e) {
    // Collection doesn't exist, create it
  }

  const collection = new Collection({
    name: "transactions",
    type: "base",
    system: false,
    schema: [
      {
        system: false,
        id: "orderid_field",
        name: "orderId",
        type: "text",
        required: true,
        unique: true,
        options: {
          min: 1,
          max: 100,
          pattern: ""
        }
      },
      {
        system: false,
        id: "status_field",
        name: "status",
        type: "select",
        required: true,
        unique: false,
        options: {
          maxSelect: 1,
          values: ["pending", "completed", "failed"]
        }
      },
      {
        system: false,
        id: "amount_field",
        name: "amount",
        type: "number",
        required: true,
        unique: false,
        options: {
          min: 0,
          max: null
        }
      },
      {
        system: false,
        id: "currency_field",
        name: "currency",
        type: "text",
        required: true,
        unique: false,
        options: {
          min: 3,
          max: 3,
          pattern: ""
        }
      },
      {
        system: false,
        id: "email_field",
        name: "customerEmail",
        type: "email",
        required: true,
        unique: false,
        options: {
          exceptDomains: [],
          onlyDomains: []
        }
      },
      {
        system: false,
        id: "name_field",
        name: "customerName",
        type: "text",
        required: true,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        system: false,
        id: "phone_field",
        name: "customerPhone",
        type: "text",
        required: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        system: false,
        id: "street_field",
        name: "street",
        type: "text",
        required: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        system: false,
        id: "city_field",
        name: "city",
        type: "text",
        required: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        system: false,
        id: "country_field",
        name: "country",
        type: "text",
        required: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      },
      {
        system: false,
        id: "items_field",
        name: "orderItems",
        type: "json",
        required: false,
        unique: false,
        options: {}
      },
      {
        system: false,
        id: "ref_field",
        name: "paydestal_reference",
        type: "text",
        required: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      }
    ],
    indexes: [],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null
  });

  app.save(collection);
  console.log("[MIGRATION] transactions collection created successfully");
}, (app) => {
  // Down migration - delete collection
  try {
    const collection = app.findCollectionByNameOrId("transactions");
    app.delete(collection);
    console.log("[MIGRATION] transactions collection deleted");
  } catch (e) {
    console.log("[MIGRATION] transactions collection not found for deletion");
  }
});
