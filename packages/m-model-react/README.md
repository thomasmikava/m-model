# m-model-react
m-model-react is designed to be used with [m-model-core](https://www.npmjs.com/package/m-model-core) in the world of react.
It provides several useful optimized hooks

For the rest of the docuemnt, assume that we have already created model with m-model-core and called it `User`

## Hooks
### useModelDocById
```tsx
import React from "react";
import { useModelDocById } from "m-model-react";
const UserShortInfoComponent = ({ userId }: { userId: number }) => {
    const user = useModelDocById(User, userId);
    if (!user) {
        return <div>loading...</div>;
    }
    return (
        <div>
            {user.getFullname()}
        </div>
    );
};
```
## useModelDocByQuery
```tsx
import React, { useMemo }  from "react";
import { useModelDocById } from "m-model-react";
const UserShortInfoComponent = ({ firstname }: { firstname?: string }) => {
    const query = useMemo(() => {
        if (!firstname) return null;
        return { firstname }
    }, [firstname]);
    
    const user = useModelDocByQuery(User, query);
    if (!user) {
        return <div>loading...</div>;
    }
    return (
        <div>
            {user.getFullname()}
        </div>
    );
};
```

### useModelDocsByIds
Similar to useModelDocById, just pass memoized array of ids and it will return array of model instances
### useModelDocByQuery
Similar to useModelDocById. It will return array of model instances
### useModelDocs
returns array of all instances of model