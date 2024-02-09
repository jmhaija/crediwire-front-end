define(['store/dashboardMutationTypes'], function(dashboardMutationTypes) {
    //It`s the first try of persist service - need to do it abstract later
    const persistInterval = 7*24*60*60*1000; // 1 week
    const {
        SET_CASHBOOK_STATE,
        SET_BUDGET_STATE,
        RESTORE_DASHBOARD_SETTINGS,
        SET_AVERAGE_STATE,
        SET_FLOATING_AVERAGE,
        SET_FLOATING_AVERAGE_POINT_SPREAD,
        SET_PREVIOUS_STATE,
        SET_PREVIOUS_TYPE,
        SET_INTERVAL
    } = dashboardMutationTypes;

    const persistedMutations = [
        SET_CASHBOOK_STATE,
        SET_BUDGET_STATE,
        SET_AVERAGE_STATE,
        SET_FLOATING_AVERAGE,
        SET_FLOATING_AVERAGE_POINT_SPREAD,
        SET_PREVIOUS_STATE,
        SET_PREVIOUS_TYPE,
        SET_INTERVAL
    ];

    const plugin = (store) => {
        store.subscribe( ( mutation ) => {
            if (persistedMutations.indexOf(mutation.type) > -1) {
                let record = { data:  mutation.payload, ts: new Date().getTime() + persistInterval };

                try {
                    localStorage.setItem( `@@dashboard_${mutation.type}`, JSON.stringify( record ) );
                } catch(error) {
                    console.error(error);
                }
            }

            // When ui is initialized, get the state from local storage if exists
            if( RESTORE_DASHBOARD_SETTINGS === mutation.type) {
                const mutationsToCommit = [];
                persistedMutations.forEach((persistedMutation) => {
                    try {
                        let persistedEntry = localStorage.getItem(`@@dashboard_${persistedMutation}`);

                        if (persistedEntry) {
                            persistedEntry = JSON.parse(persistedEntry);
                        }
                        if( persistedEntry && new Date().getTime() < persistedEntry.ts ) {
                            mutationsToCommit.push(
                                {
                                    type: persistedMutation,
                                    payload: persistedEntry.data
                                }
                            );
                        }
                    }catch (error) {
                        console.error(error);
                    }
                });

                mutationsToCommit.forEach((mutation) => store.commit(mutation.type, mutation.payload));
            }
        });
    };

    return plugin;
});

