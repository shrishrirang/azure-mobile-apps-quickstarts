/**
 * Module performs all table related operations
 */

define(['./lib/es6-promise'], function(es6) {

    var client,
        store,
        syncContext,
        tableName = 'todoitem',
        Promise = es6.Promise,
        uiManager,
        isInitialized;

    function setUiManager(manager) {
        uiManager = manager;
    }

    function setup() {
        if (isInitialized) {
            return Promise.resolve();
        }

        // Create a connection reference to our Azure Mobile Apps backend 
        client = new WindowsAzure.MobileServiceClient('https://shrirs-offline-dotnet.azurewebsites.net'); 

        // Create the sqlite store
        store = new WindowsAzure.MobileServiceSqliteStore();

        // Define the table schema and initialize sync context
        return store
                .defineTable({
                    name: tableName,
                    columnDefinitions: {
                        id: 'string',
                        deleted: 'boolean',
                        text: 'string',
                        version: 'string',
                        complete: 'boolean'
                    }
                })
                .then(function() {
                    syncContext = client.getSyncContext();
                    syncContext.pushHandler = {
                        onConflict: onConflict,
                        onError: function (pushError) {
                            if (pushError.getError().request.status === 404) { // Treat this as a conflict
                                return onConflict(pushError);
                            }

                            window.alert('TODO: Handle non-conflict error!');
                        }
                    };
                    return syncContext.initialize(store);
                })
                .then(function() {
                    table = client.getSyncTable(tableName);
                    isInitialized = true;
                });
    }

    function onConflict(pushError) {

        var serverRecord = pushError.getServerRecord(),
            clientRecord = pushError.getClientRecord(),
            status = pushError.getError().request.status;

        var action = pushError.getAction();

        switch(action) {
            case 'insert':
                // This should happen only if IDs conflict and if we use GUIDs for IDs this should never happen
                return pushError.cancelAndDiscard();
            case 'update':
                if (status === 404) { // The server record never existed or has been deleted
                                      // In either case, we cancel the update
                    return pushError.cancelAndDiscard();
                }

                if (serverRecord && clientRecord) {
                    // If the client and server records are identical, just ignore
                    // the conflict and discard the pending change
                    if (serverRecord.text === clientRecord.text &&
                        serverRecord.complete === clientRecord.complete &&
                        serverRecord.deleted === clientRecord.deleted) {

                        return pushError.cancelAndDiscard();
                    }

                    // Involve the user in conflict resolution
                    return uiManager
                                .resolve(serverRecord, clientRecord)
                                .then(function(result) {
                                    if (result === 'skip') { // skip resolving this conflict
                                        return;
                                    }

                                    if (result === 'server') { // use the server value to resolve the conflict
                                        return pushError.cancelAndUpdate(serverRecord);
                                    }
                                    
                                    if (result === 'client') { // use the client value to resolve the conflict
                                        result = clientRecord;
                                    } else { // if result is not one of 'server', 'client', 'skip', we assume the user has provided a custom value for the record
                                        result.id = serverRecord.id; // The custom value specified by the user need not have ID. We set it explicitly
                                    }

                                    result.version = serverRecord.version; // Update the version in the record to match the server version
                                    return pushError.update(result);
                                });
                }
                break;
            case 'delete':
                if (status === 404) { // server record never existed or has been deleted
                    return pushError.cancelAndDiscard();
                }

                // This is a node specific check to workaround a bug 
                if (status === 409 || (status === 412 && serverRecord.deleted)) {
                    return pushError.cancelAndDiscard();
                }

                // server updated, client deleted. so discard client change and update client record as per server value
                if (status === 412 && !serverRecord.deleted) {
                    return pushError.changeAction('update', serverRecord);
                }

                break;
        }

        window.alert('Unhandled conflict!')
    }

    /** 
     * Gets a reference to the local table
     */
    function getTable() {
        return setup()
                .then(function() {
                    return table;
                });
    }

    /**
     * Pushes local changes and pulls server data
     */
    function refresh(query) {
        return setup()
                .then(function() {
                    return push();
                }).then(function() {
                    return table.pull(query);
                });
    }

    /**
     * Pulls the table data from the server
     */
    function pull(query) {
        return setup()
                .then(function() {
                    return table.pull(query);
                }).then(undefined, function(error) {
                    window.alert('Pull failed. Error: ' + error.message);
                    throw error;
                });
    }

    /**
     * Pushes the local changes to the server
     */
    function push() {
        return setup()
                .then(function() {
                    return syncContext.push();
                })
                .then(function(conflicts) {
                    if (conflicts.length > 0) {
                        window.alert('Push completed with ' + conflicts.length + ' conflict(s)');
                    }
                }, function(error) {
                    window.alert('Push failed. Error: ' + error.message);
                    throw error;
                });
    }

    return {
        getTable: getTable,
        pull: pull,
        refresh: refresh,
        setUiManager: setUiManager
    }
});
