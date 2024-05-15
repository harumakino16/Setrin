import { useState } from 'react';

const useSearchCriteria = () => {
    const [searchCriteria, setSearchCriteria] = useState({});

    return { searchCriteria, setSearchCriteria };
};

export default useSearchCriteria;