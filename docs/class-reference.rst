===============
Class Reference
===============

Rest Service Clients
********************

Service Clients are wrappers around the REST API.  They are found in the package `Services`

.. code-block:: javascript

    const sdk = require('sportstalk-sdk');
    const userService = new sdk.Services.ChatModerationService({appId: 'yourappid', apiToken: 'apiToken'});

.. code-block:: typescript

    import {Services} from 'sportstalk-sdk
    const userService = new Services.ChatModerationService({appId: 'yourappid', apiToken: 'apiToken'});


