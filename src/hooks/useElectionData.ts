import { useState, useEffect } from 'react';
import { ELECTION_STEPS, ElectionStep } from '../constants/electionSteps';

export const useElectionData = () => {
  const [steps, setSteps] = useState<ElectionStep[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSteps(ELECTION_STEPS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return { steps, loading };
};
