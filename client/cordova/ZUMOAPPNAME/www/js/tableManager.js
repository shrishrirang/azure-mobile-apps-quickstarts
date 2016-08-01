/**
 * Module performs all table related operations
 */

define(['./lib/es6-promise'], function(es6) {

    var client,
        store,
        syncContext,
        tableName = 'todoitem',
        Promise = es6.Promise,
        isInitialized;

    function setup() {
        if (isInitialized) {
            return Promise.resolve();
        }

        // Create a connection reference to our Azure Mobile Apps backend 
        client = new WindowsAzure.MobileServiceClient('ZUMOAPPURL'); 

        // Create the sqlite store
        store = new WindowsAzure.MobileServiceSqliteStore();

        // Define the table schema
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
                .then(function() { // Initialize the sync context
                    syncContext = client.getSyncContext();
                    syncContext.pushHandler = {
                        onConflict: function (serverRecord, clientRecord, pushError) {
                            window.alert('TODO: onConflict');
                        },
                        onError: function (pushError) {
                            window.alert('TODO: onError');
                        }
                    };
                    return syncContext.initialize(store);
                })
                .then(function() {
                    table = client.getSyncTable(tableName);
                    isInitialized = true;
                });
    }

    /** 
     * Gets a reference to the local table
     */
    function getTable() {
        return setup().then(function() {
            return table;
        });
    }

    /**
     * Pulls the table data
     */
    function pull(query) {
        return setup().then(function() {
            return table.pull(query);
        });
    }

    /**
     * Pushes local changes and pulls server data
     */
    function refresh(query) {
        return setup().then(function() {
            return syncContext.push();
        }).then(function() {
            return table.pull(query);
        });
    }

    return {
        getTable: getTable,
        pull: pull,
        refresh: refresh
    }
});
