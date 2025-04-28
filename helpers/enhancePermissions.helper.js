const permissionDependencies = require('../permissionDependencies.json');

exports.enhancePermissions = (permissions) => {
    const enhanced = { ...permissions };

    for (const section in permissions) {
        const originalEndpoints = permissions[section];

        for (const endpoint of originalEndpoints) {
            const relatedGroups = permissionDependencies[endpoint];
            if (relatedGroups) {
                for (const groupName in relatedGroups) {
                    const endpointsList = relatedGroups[groupName];

                    if (!enhanced[groupName]) {
                        enhanced[groupName] = [];
                    }

                    for (const relatedEndpoint of endpointsList) {
                        if (!enhanced[groupName].includes(relatedEndpoint)) {
                            enhanced[groupName].push(relatedEndpoint);
                        }
                    }
                }
            }
        }
    }

    return enhanced;
};
