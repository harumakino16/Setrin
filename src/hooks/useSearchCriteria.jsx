import { useState } from 'react';

const useSearchCriteria = () => {
    const initialCriteria = {
        freeKeyword: '',
        maxSung: 0,
        maxSungOption: '以上',
        tag: '',
        artist: '',
        genre: '',
        skillLevel: 0,
        skillLevelOption: '以上',
        memo: '',
        note: '',
        excludedTags: '',
        excludedGenres: ''
    };

    const [searchCriteria, setSearchCriteria] = useState(initialCriteria);

    return { searchCriteria, setSearchCriteria };
};

export default useSearchCriteria;