import { useState, useEffect } from 'react';
import { ELECTION_STEPS } from '../constants/electionSteps';

/**
 * Custom hook to fetch or manage election data/timeline.
 * @returns {Object} { steps, loading }
 */
export const useElectionData = () => {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate an API call
    const timer = setTimeout(() => {
      setSteps(ELECTION_STEPS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return { steps, loading };
};
