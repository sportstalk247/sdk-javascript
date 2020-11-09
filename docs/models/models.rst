===========
Data Models
===========

Models are broken up into 3 groups:

* Chat specific models (https://gitlab.com/sportstalk247/sdk-javascript/-/blob/master/src/models/ChatModels.ts)
* Commenting specific models (https://gitlab.com/sportstalk247/sdk-javascript/-/blob/master/src/models/CommentsModels.ts)
* Common Models such as users or webhooks (https://gitlab.com/sportstalk247/sdk-javascript/-/blob/master/src/models/CommonModels.ts)

The models are defined using typescript notation (https://www.typescriptlang.org/).
You don't have to be an expert on Typescript to use these models, as they just describe JSON objects.

For instance:

.. code-block:: javascript

    export interface Example {
        id?: string
    }

This describes a type `Example` with a single property `id` which may or may not be present.
The following are all valid `Example` objects:

.. code-block:: javascript


    const example1 = {} // id is optional, and undefined.
    const example2 = {id:null} // id property is present but null
    const example3 = {id: "123412351235"} // id is a string

However this is not a valid `Example` object:

.. code-block:: javascript
    const badExample = {
        id:{
            members: []
        }
    }

Nor is this:

.. code-block:: javascript


    const badExample2 = {
        id:1231 // id property is there but is a number and not a string. This is not allowed.
    }
